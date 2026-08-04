/**
 * test-scenarios.mjs — acceptance tests for the classification engine.
 *
 *   node test-scenarios.mjs
 *
 * Covers the nine scenarios in SPEC §8 plus the short-circuit, uncertainty and
 * navigation behaviour. It does NOT re-implement the logic: it extracts the engine
 * source out of index.html (between the ENGINE START / ENGINE END markers) and runs
 * the exact code that ships in the page against decision-tree.json.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tree = JSON.parse(readFileSync(join(here, "decision-tree.json"), "utf8"));
const html = readFileSync(join(here, "index.html"), "utf8");

const START = "/* ===== ENGINE START ===== */";
const END = "/* ===== ENGINE END ===== */";
const a = html.indexOf(START), b = html.indexOf(END);
if (a === -1 || b === -1) throw new Error("Engine markers not found in index.html");
const engineSrc = html.slice(a + START.length, b);
const { createEngine, validateTree } = new Function(
  `${engineSrc}; return { createEngine, validateTree };`
)();

/* ---------------------------------------------------------------- harness */
let passed = 0, failed = 0;
const fails = [];
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { passed++; console.log(`  ✓ ${name}`); }
  else {
    failed++; fails.push(name);
    console.log(`  ✗ ${name}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`);
  }
}
function scenario(title, fn) { console.log(`\n${title}`); fn(); }

/** Run a list of inputs. Each step is [expectedNodeId, input]. */
function run(steps) {
  const E = createEngine(tree);
  const visited = [];
  for (const [expectNode, input] of steps) {
    const cur = E.currentNode().id;
    visited.push(cur);
    if (expectNode && cur !== expectNode) {
      throw new Error(`expected to be at ${expectNode} but was at ${cur} (visited: ${visited.join(" > ")})`);
    }
    E.submit(input);
  }
  return { E, visited, cards: E.compileCards().map(c => c.id), flags: E.state.flags };
}
const YES = { value: "yes" }, NO = { value: "no" }, UNSURE = { value: "unsure" };
const NONE = { selections: [] };

/* ------------------------------------------------------------ contract */
scenario("Data contract", () => {
  check("decision-tree.json validates against the contract", validateTree(tree), []);
  check("every outcome has an icon", Object.values(tree.outcomes).every(o => !!o.icon), true);
  check("every outcome has an application date", Object.values(tree.outcomes).every(o => !!o.applicationDate), true);
  check("four phases are defined", (tree.phases || []).length, 4);
  check("every question node belongs to a phase",
    Object.entries(tree.nodes).filter(([, n]) => n.type === "question")
      .filter(([id]) => !tree.phases.some(p => p.nodes.includes(id))).map(([id]) => id), []);
});

scenario("Embedded offline copy is in step with decision-tree.json", () => {
  const open = '<script type="application/json" id="decision-tree-data">';
  const from = html.indexOf(open) + open.length;
  const to = html.indexOf("</script>", from);
  let embedded = null;
  try { embedded = JSON.parse(html.slice(from, to)); } catch (e) { /* reported below */ }
  check("embedded block parses", embedded !== null, true);
  check("embedded block validates", embedded ? validateTree(embedded) : ["unparseable"], []);
  check("embedded block is identical (run: node sync-embedded-json.mjs)",
    JSON.stringify(embedded) === JSON.stringify(tree), true);
});

scenario("Interface strings live in the JSON (translation readiness)", () => {
  check("ui block present", typeof tree.ui, "object");

  /* every t("…") / tt("…") key the page asks for must exist, and the singular /
     plural helpers must find both variants — otherwise the UI shows ⟨key⟩ */
  const direct = [...html.matchAll(/\btt?\(\s*"([a-z][\w.]*)"/gi)].map(m => m[1]);
  const plurals = [...html.matchAll(/\btt?n\(\s*"([a-z][\w.]*)"/gi)].map(m => m[1]);
  const missing = [...new Set(direct)].filter(k => !(k in tree.ui));
  const missingPlural = [...new Set(plurals)].flatMap(base =>
    [`${base}.one`, `${base}.many`].filter(k => !(k in tree.ui)));
  check("no missing ui keys", missing, []);
  check("no missing plural ui keys", missingPlural, []);

  /* dynamically built keys: start.fact{1..3}.*, footer.date.*, source.* */
  const dynamic = [
    "start.fact1.label", "start.fact1.text", "start.fact2.label", "start.fact2.text",
    "start.fact3.label", "start.fact3.text",
    ...Object.keys(tree.meta.keyDates).map(k => `footer.date.${k}`), "footer.date.transparency",
    "source.external", "source.embedded", "source.embeddedFallback"
  ].filter(k => !(k in tree.ui));
  check("no missing dynamic ui keys", dynamic, []);

  const unused = Object.keys(tree.ui).filter(k =>
    k !== "_comment" && !html.includes(`"${k}"`) &&
    !k.startsWith("start.fact") && !k.startsWith("footer.date.") && !k.startsWith("source.") &&
    !/\.(one|many)$/.test(k));
  check("no unused ui keys", unused, []);
});

/* -------------------------------------------------------- SPEC §8 cases */
scenario("1. CV-screening / recruitment ML", () => {
  const r = run([
    ["S0_ai_system", YES],
    ["S1_prohibited", NONE],
    ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", { selections: ["Annex III(4)(a)"] }],
    ["S5_profiling", YES],
    ["T0_transparency", NONE],
    ["G0_gpai", NO]
  ]);
  check("cards", r.cards, ["HIGH_RISK_ANNEX_III"]);
  check("annex III selection recorded", r.E.state.answers[3].selections.length, 1);
});

scenario("2. Credit scoring for individuals", () => {
  const r = run([
    ["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", { selections: ["Annex III(5)(b)"] }],
    ["S5_profiling", YES], ["T0_transparency", NONE], ["G0_gpai", NO]
  ]);
  check("cards", r.cards, ["HIGH_RISK_ANNEX_III"]);

  const company = run([        // creditworthiness of companies only -> no Annex III use case
    ["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", NONE], ["T0_transparency", NONE], ["G0_gpai", NO]
  ]);
  check("company-only variant", company.cards, ["MINIMAL_RISK"]);
});

scenario("3. Customer-service chatbot", () => {
  const r = run([
    ["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", NONE],
    ["T0_transparency", { selections: ["50-1"] }],
    ["G0_gpai", NO]
  ]);
  check("cards", r.cards, ["MINIMAL_RISK", "TRANSPARENCY"]);
  check("triggered obligations", r.flags.transparency, ["50-1"]);
});

scenario("4. Document deduplication inside a visa-processing pipeline", () => {
  const r = run([
    ["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", { selections: ["Annex III(7)(c)"] }],
    ["S5_profiling", NO],
    ["S6_filter", { selections: ["6-3-a"], sub: "no" }],
    ["T0_transparency", NONE], ["G0_gpai", NO]
  ]);
  check("cards", r.cards, ["NOT_HIGH_RISK_FILTERED"]);
  check("Art. 6(4) documentation duty is listed",
    tree.outcomes.NOT_HIGH_RISK_FILTERED.obligations.some(o => o.includes("6(4)")), true);
});

scenario("5. AI lane assistance in a car", () => {
  const r = run([
    ["S0_ai_system", YES], ["S1_prohibited", NONE],
    ["S2_annex_i_product", YES], ["S3_annex_i_tpca", YES],
    ["T0_transparency", NONE], ["G0_gpai", NO]
  ]);
  check("cards", r.cards, ["HIGH_RISK_ANNEX_I"]);

  const selfCert = run([       // internal control only -> falls through to Annex III
    ["S0_ai_system", YES], ["S1_prohibited", NONE],
    ["S2_annex_i_product", YES], ["S3_annex_i_tpca", NO],
    ["S4_annex_iii_area", NONE], ["T0_transparency", NONE], ["G0_gpai", NO]
  ]);
  check("self-certified variant falls through to minimal", selfCert.cards, ["MINIMAL_RISK"]);
});

scenario("6. Emotion recognition in the workplace", () => {
  const r = run([
    ["S0_ai_system", YES],
    ["S1_prohibited", { selections: ["5-1-f"] }],
    ["G0_gpai", NO]                       // transparency module is skipped
  ]);
  check("cards", r.cards, ["PROHIBITED"]);
  check("transparency module skipped", r.visited.includes("T0_transparency"), false);
  const phases = r.E.phases();
  check("transparency phase marked skipped", phases.find(p => p.id === "transparency").state, "skipped");
  check("GPAI phase marked done", phases.find(p => p.id === "gpai").state, "done");
});

scenario("6b. Prohibited never gets a transparency card", () => {
  const E = createEngine(tree);
  E.submit(YES);
  E.submit({ selections: ["5-1-a"] });
  E.state.flags.transparency = ["50-1"];   // force the flag; the card must still be suppressed
  check("cards", E.compileCards().map(c => c.id), ["PROHIBITED"]);
});

scenario("7. LLM provider above 10^25 FLOP", () => {
  const r = run([
    ["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", NONE],
    ["T0_transparency", { selections: ["50-1", "50-2"] }],
    ["G0_gpai", YES], ["G1_systemic", YES]
  ]);
  check("cards", r.cards, ["MINIMAL_RISK", "TRANSPARENCY", "GPAI_MODEL_SYSTEMIC"]);
  check("gpai flag", r.flags.gpai, "gpai_model_systemic");

  const highRiskPlusGpai = run([   // GPAI overlay sits on top of any tier
    ["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", { selections: ["Annex III(4)(a)"] }], ["S5_profiling", YES],
    ["T0_transparency", { selections: ["50-1"] }], ["G0_gpai", YES], ["G1_systemic", YES]
  ]);
  check("high-risk + transparency + systemic GPAI", highRiskPlusGpai.cards,
    ["HIGH_RISK_ANNEX_III", "TRANSPARENCY", "GPAI_MODEL_SYSTEMIC"]);
});

scenario("8. Spreadsheet with fixed formulas", () => {
  const r = run([["S0_ai_system", NO]]);
  check("cards", r.cards, ["OUT_OF_SCOPE"]);
  check("finished immediately", r.E.state.finished, true);
  const phases = r.E.phases();
  check("phase states", phases.map(p => p.state), ["done", "skipped", "skipped", "skipped"]);
});

scenario("9. Text-to-image generator", () => {
  const r = run([
    ["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", NONE], ["T0_transparency", { selections: ["50-2"] }], ["G0_gpai", NO]
  ]);
  check("deployer only", r.cards, ["MINIMAL_RISK", "TRANSPARENCY"]);

  const alsoModelProvider = run([
    ["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", NONE], ["T0_transparency", { selections: ["50-2"] }],
    ["G0_gpai", YES], ["G1_systemic", NO]
  ]);
  check("also the model provider", alsoModelProvider.cards, ["MINIMAL_RISK", "TRANSPARENCY", "GPAI_MODEL"]);
});

/* ------------------------------------------------------- filter details */
scenario("Article 6(3) filter behaviour", () => {
  const materiallyInfluences = run([
    ["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", { selections: ["Annex III(7)(c)"] }], ["S5_profiling", NO],
    ["S6_filter", { selections: ["6-3-a"], sub: "yes" }],
    ["T0_transparency", NONE], ["G0_gpai", NO]
  ]);
  check("condition met but materially influences -> high-risk", materiallyInfluences.cards, ["HIGH_RISK_ANNEX_III"]);

  const noCondition = run([
    ["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", { selections: ["Annex III(7)(c)"] }], ["S5_profiling", NO],
    ["S6_filter", { selections: [], sub: "no" }],
    ["T0_transparency", NONE], ["G0_gpai", NO]
  ]);
  check("no condition ticked -> high-risk", noCondition.cards, ["HIGH_RISK_ANNEX_III"]);

  check("profiling bypasses the filter entirely",
    run([["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
      ["S4_annex_iii_area", { selections: ["Annex III(5)(a)"] }], ["S5_profiling", YES],
      ["T0_transparency", NONE], ["G0_gpai", NO]]).visited.includes("S6_filter"), false);
});

/* -------------------------------------------------- uncertainty handling */
scenario("“I'm not sure” takes the conservative route and is flagged", () => {
  const s0 = run([
    ["S0_ai_system", UNSURE], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", NONE], ["T0_transparency", NONE], ["G0_gpai", NO]
  ]);
  check("S0 unsure continues as an AI system", s0.cards, ["MINIMAL_RISK"]);
  check("S0 unsure recorded for review", s0.E.state.review.length, 1);

  const annexI = run([
    ["S0_ai_system", YES], ["S1_prohibited", NONE],
    ["S2_annex_i_product", UNSURE], ["S3_annex_i_tpca", UNSURE],
    ["T0_transparency", NONE], ["G0_gpai", NO]
  ]);
  check("S2+S3 unsure -> high-risk Annex I", annexI.cards, ["HIGH_RISK_ANNEX_I"]);
  check("two review points", annexI.E.state.review.length, 2);

  const filter = run([
    ["S0_ai_system", YES], ["S1_prohibited", NONE], ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", { selections: ["Annex III(3)(b)"] }], ["S5_profiling", NO],
    ["S6_filter", { selections: ["6-3-b"], sub: "unsure" }],
    ["T0_transparency", NONE], ["G0_gpai", NO]
  ]);
  check("unsure about material influence -> high-risk", filter.cards, ["HIGH_RISK_ANNEX_III"]);
  check("review point recorded", filter.E.state.review.length, 1);
  check("review note is non-empty", filter.E.state.review[0].note.length > 20, true);
});

/* ------------------------------------------------------------ navigation */
scenario("Navigation: back, edit, reset", () => {
  const E = createEngine(tree);
  E.submit(YES); E.submit(NONE); E.submit(NO);
  check("at S4 after three answers", E.currentNode().id, "S4_annex_iii_area");
  E.back();
  check("back returns to S2", E.currentNode().id, "S2_annex_i_product");
  check("answer trail shrank", E.state.answers.length, 2);
  check("earlier answer kept in memory for prefill", !!E.memory.S2_annex_i_product, true);

  E.submit(NO); E.submit({ selections: ["Annex III(4)(a)"] }); E.submit(YES);
  check("reached the tier outcome", E.state.flags.primaryTier, "HIGH_RISK_ANNEX_III");
  E.editFrom("S4_annex_iii_area");
  check("edit rewinds to the chosen question", E.currentNode().id, "S4_annex_iii_area");
  check("tier flag cleared on rewind", E.state.flags.primaryTier, null);
  check("previous Annex III selections still remembered", E.memory.S4_annex_iii_area.selections, ["Annex III(4)(a)"]);

  E.reset();
  check("reset returns to the first question", E.currentNode().id, "S0_ai_system");
  check("reset clears the trail", E.state.answers.length, 0);
});

scenario("Verdict-so-far panel", () => {
  const E = createEngine(tree);
  check("empty before the first answer", E.verdict().length, 0);
  E.submit(YES);
  check("first line after S0", E.verdict()[0].text, "Is an AI system");
  E.submit(NONE); E.submit(NO);
  check("shows an in-progress tier line", E.verdict().some(l => l.pending), true);
  E.submit({ selections: ["Annex III(4)(a)"] }); E.submit(YES);
  check("tier line resolves", E.verdict().some(l => l.text.startsWith("High-risk")), true);
  E.submit({ selections: ["50-1"] });
  check("transparency line added", E.verdict().some(l => l.text.includes("Transparency obligations")), true);
});

/* ----------------------------------------------------------------- done */
console.log(`\n${"-".repeat(60)}\n${passed} passed, ${failed} failed`);
if (failed) { console.log(`Failing: ${fails.join(", ")}`); process.exit(1); }
