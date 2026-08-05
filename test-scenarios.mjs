/**
 * test-scenarios.mjs — acceptance tests for the classification engine (spec v1.2).
 *
 *   node test-scenarios.mjs
 *
 * Covers the twelve scenarios in SPEC §8 plus the short-circuits, the C0 context
 * step, the cross-link auto-derivation, role filtering, the FOSS guardrail, review
 * flags and navigation. It does NOT re-implement the logic: it extracts the engine
 * source out of index.html (between the ENGINE START / ENGINE END markers) and runs
 * the exact code that ships in the page against decision-tree.json + ui.json.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const tree = JSON.parse(readFileSync(join(here, "decision-tree.json"), "utf8"));
const uiDoc = JSON.parse(readFileSync(join(here, "ui.json"), "utf8"));
const html = readFileSync(join(here, "index.html"), "utf8");

const START = "/* ===== ENGINE START ===== */";
const END = "/* ===== ENGINE END ===== */";
const a0 = html.indexOf(START), b0 = html.indexOf(END);
if (a0 === -1 || b0 === -1) throw new Error("Engine markers not found in index.html");
const { createEngine, validateTree } = new Function(
  `${html.slice(a0 + START.length, b0)}; return { createEngine, validateTree };`
)();

const UI = { ...uiDoc.ui, ...(tree.ui || {}) };
const PRES = uiDoc.presentation;
const newEngine = () => createEngine(tree, { ui: UI, presentation: PRES, phases: uiDoc.phases });

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

/** Run a list of [expectedNodeId, input] steps through a fresh engine. */
function run(steps) {
  const E = newEngine();
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
const NONE = { value: "no", selections: [] };
const GO = { value: "continue", selections: [] };
const ctx = (role = "unknown", foss = "unknown") => ({ fields: { role, fossLicence: foss } });
const tick = (...ids) => ({ value: "yes", selections: ids });

/** the common opening: AI system yes -> context -> nothing banned */
const OPEN = (role, foss) => [
  ["S0_ai_system", YES],
  ["C0_context", ctx(role, foss)],
  ["S1_prohibited", NONE]
];

/* ------------------------------------------------------------ contract */
scenario("Data contract", () => {
  check("decision-tree.json validates against the contract", validateTree(tree, PRES), []);
  check("moduleOrder starts with CONTEXT", tree.moduleOrder[0], "CONTEXT");
  check("every tier has a presentation entry",
    Object.values(tree.outcomes).filter(o => !PRES[o.tier]).map(o => o.tier), []);
  check("every presentation appliesFrom points at a real keyDate",
    Object.entries(PRES).filter(([k, v]) => k !== "_comment" && v.appliesFrom && !(v.appliesFrom in tree.meta.keyDates)).map(([k]) => k), []);
  check("four phases are defined", (uiDoc.phases || []).length, 4);
  check("every question/context node belongs to a phase",
    Object.entries(tree.nodes).filter(([, n]) => n.type !== "result")
      .filter(([id]) => !uiDoc.phases.some(p => p.nodes.includes(id))).map(([id]) => id), []);
  /* crossLinks[].then is implementer prose ("Remind the user…"); anything shown on
     screen must have a reader-facing sentence in ui.json instead */
  check("every user-visible cross-link has reader-facing ui text",
    ["biometrics-emotion-prohibition-reminder", "deepfake-implies-synthetic"]
      .filter(id => !UI[`crosslink.${id}.text`] || !UI[`crosslink.${id}.title`]), []);
  check("no implementer voice in those ui strings",
    ["biometrics-emotion-prohibition-reminder", "deepfake-implies-synthetic"]
      .filter(id => /^(remind|point out|show|tell the user)/i.test(UI[`crosslink.${id}.text`] || "")), []);
  check("all three cross-link rules are declared",
    (tree.crossLinks.rules || []).map(r => r.id),
    ["biometrics-to-transparency", "biometrics-emotion-prohibition-reminder", "deepfake-implies-synthetic"]);
});

scenario("Embedded offline copies are in step with the JSON files", () => {
  for (const [id, file, expected] of [["decision-tree-data", "decision-tree.json", tree], ["ui-data", "ui.json", uiDoc]]) {
    const open = `<script type="application/json" id="${id}">`;
    const from = html.indexOf(open) + open.length;
    const to = html.indexOf("</script>", from);
    let embedded = null;
    try { embedded = JSON.parse(html.slice(from, to)); } catch (e) { /* reported below */ }
    check(`${file} embedded copy is identical (run: node sync-embedded-json.mjs)`,
      JSON.stringify(embedded) === JSON.stringify(expected), true);
  }
});

scenario("Interface strings live in the JSON (translation readiness)", () => {
  const direct = [...html.matchAll(/\btt?\(\s*"([a-z][\w.]*)"/gi)].map(m => m[1]);
  const plurals = [...html.matchAll(/\btt?n\(\s*"([a-z][\w.]*)"/gi)].map(m => m[1]);
  check("no missing ui keys", [...new Set(direct)].filter(k => !(k in UI)), []);
  check("no missing plural ui keys",
    [...new Set(plurals)].flatMap(b => [`${b}.one`, `${b}.many`]).filter(k => !(k in UI)), []);
  const dynamic = [
    ...[1, 2, 3].flatMap(i => [`start.fact${i}.label`, `start.fact${i}.text`]),
    ...Object.keys(tree.meta.keyDates).map(k => `footer.date.${k}`),
    "source.external", "source.embedded", "source.embeddedFallback",
    "verdict.role.provider", "verdict.role.deployer", "verdict.role.both",
    "result.roleGroup.both", "result.roleGroup.provider", "result.roleGroup.deployer"
  ].filter(k => !(k in UI));
  check("no missing dynamic ui keys", dynamic, []);
});

/* -------------------------------------------------------- SPEC §8 cases */
scenario("1. CV-screening / recruitment ML", () => {
  const r = run([
    ...OPEN(), ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", tick("Annex III(4)(a)")],
    ["S5_profiling", YES], ["T0_transparency", GO], ["G0_gpai", NO]
  ]);
  check("cards", r.cards, ["HIGH_RISK_ANNEX_III"]);
});

scenario("2. Credit scoring for individuals", () => {
  check("cards", run([
    ...OPEN(), ["S2_annex_i_product", NO], ["S4_annex_iii_area", tick("Annex III(5)(b)")],
    ["S5_profiling", YES], ["T0_transparency", GO], ["G0_gpai", NO]
  ]).cards, ["HIGH_RISK_ANNEX_III"]);
  check("company-only variant", run([
    ...OPEN(), ["S2_annex_i_product", NO], ["S4_annex_iii_area", NONE],
    ["T0_transparency", GO], ["G0_gpai", NO]
  ]).cards, ["MINIMAL_RISK"]);
});

scenario("3. Customer-service chatbot", () => {
  const r = run([
    ...OPEN(), ["S2_annex_i_product", NO], ["S4_annex_iii_area", NONE],
    ["T0_transparency", { value: "continue", selections: ["50-1"] }], ["G0_gpai", NO]
  ]);
  check("cards", r.cards, ["MINIMAL_RISK", "TRANSPARENCY"]);
  check("triggered items", r.flags.transparency, ["50-1"]);
});

scenario("4. Document deduplication inside a visa-processing pipeline", () => {
  const r = run([
    ...OPEN(), ["S2_annex_i_product", NO], ["S4_annex_iii_area", tick("Annex III(7)(c)")],
    ["S5_profiling", NO], ["S6_filter", tick("6-3-a")],
    ["T0_transparency", GO], ["G0_gpai", NO]
  ]);
  check("cards", r.cards, ["NOT_HIGH_RISK_FILTERED"]);
  check("documentation duty is listed",
    tree.outcomes.NOT_HIGH_RISK_FILTERED.obligations.some(o => /6\(4\)/.test(o.text)), true);
});

scenario("5. AI lane assistance in a car", () => {
  check("cards", run([
    ...OPEN(), ["S2_annex_i_product", YES], ["S3_annex_i_tpca", YES],
    ["T0_transparency", GO], ["G0_gpai", NO]
  ]).cards, ["HIGH_RISK_ANNEX_I"]);
  check("self-certified variant falls through", run([
    ...OPEN(), ["S2_annex_i_product", YES], ["S3_annex_i_tpca", NO],
    ["S4_annex_iii_area", NONE], ["T0_transparency", GO], ["G0_gpai", NO]
  ]).cards, ["MINIMAL_RISK"]);
});

scenario("6. Emotion recognition in the workplace (banned)", () => {
  const r = run([
    ["S0_ai_system", YES], ["C0_context", ctx("provider", "yes")],
    ["S1_prohibited", tick("5-1-f")],
    ["G0_gpai", NO]                                   // transparency module is skipped
  ]);
  check("cards", r.cards, ["PROHIBITED"]);
  check("open-source does not downgrade a ban", r.flags.fossLicence === "yes" && r.cards[0] === "PROHIBITED", true);
  check("transparency module skipped", r.visited.includes("T0_transparency"), false);
  const phases = r.E.phases();
  check("transparency phase marked skipped", phases.find(p => p.id === "transparency").state, "skipped");
  check("prohibition reminder surfaced", r.E.state.reminders, ["biometrics-emotion-prohibition-reminder"]);
});

scenario("6b. Banned never gets a transparency card", () => {
  const E = newEngine();
  E.submit(YES); E.submit(ctx()); E.submit(tick("5-1-a"));
  E.state.flags.transparency = ["50-1"];              // force the flag; card must stay suppressed
  check("cards", E.compileCards().map(c => c.id), ["PROHIBITED"]);
});

scenario("7. Emotion recognition outside work/school — cross-link auto-derives Art. 50(3)", () => {
  const r = run([
    ...OPEN(), ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", tick("Annex III(1)(c)")],
    ["S5_profiling", NO], ["S6_filter", NO],
    ["T0_transparency", GO],                           // user ticks nothing extra
    ["G0_gpai", NO]
  ]);
  check("cards", r.cards, ["HIGH_RISK_ANNEX_III", "TRANSPARENCY"]);
  check("50-3 auto-derived", r.flags.transparencyAuto, ["50-3"]);
  check("50-3 in the transparency list", r.flags.transparency, ["50-3"]);
  check("prohibition reminder also surfaced", r.E.state.reminders.includes("biometrics-emotion-prohibition-reminder"), true);

  const bio = run([
    ...OPEN(), ["S2_annex_i_product", NO], ["S4_annex_iii_area", tick("Annex III(1)(b)")],
    ["S5_profiling", NO], ["S6_filter", NO], ["T0_transparency", GO], ["G0_gpai", NO]
  ]);
  check("biometric categorisation derives it too", bio.flags.transparencyAuto, ["50-3"]);

  const kept = run([
    ...OPEN(), ["S2_annex_i_product", NO], ["S4_annex_iii_area", tick("Annex III(1)(c)")],
    ["S5_profiling", NO], ["S6_filter", NO],
    ["T0_transparency", { value: "continue", selections: ["50-1"] }],   // T0 form omits the locked item
    ["G0_gpai", NO]
  ]);
  check("a locked auto item survives even if the form omits it", kept.flags.transparency.sort(), ["50-1", "50-3"]);
});

scenario("8. LLM provider above 10^25 FLOP", () => {
  const r = run([
    ...OPEN("provider"), ["S2_annex_i_product", NO], ["S4_annex_iii_area", NONE],
    ["T0_transparency", { value: "continue", selections: ["50-1", "50-2"] }],
    ["G0_gpai", YES], ["G1_systemic", YES]
  ]);
  check("cards", r.cards, ["MINIMAL_RISK", "TRANSPARENCY", "GPAI_MODEL_SYSTEMIC"]);
  check("gpai flag", r.flags.gpai, "gpai_model_systemic");
  const systemic = r.E.compileCards().find(c => c.id === "GPAI_MODEL_SYSTEMIC");
  check("FOSS note still shown on the systemic card", r.E.notesFor(systemic), ["fossExemption"]);
  check("but its summary says the relaxation does not apply", /does not apply/i.test(systemic.summary), true);
});

scenario("9. Spreadsheet with fixed formulas", () => {
  const r = run([["S0_ai_system", NO]]);
  check("cards", r.cards, ["OUT_OF_SCOPE"]);
  check("finished immediately", r.E.state.finished, true);
  check("context step never reached", r.visited.includes("C0_context"), false);
  check("phase states", r.E.phases().map(p => p.state), ["done", "skipped", "skipped", "skipped"]);
});

scenario("10. Text-to-image generator", () => {
  check("deployer only", run([
    ...OPEN(), ["S2_annex_i_product", NO], ["S4_annex_iii_area", NONE],
    ["T0_transparency", { value: "continue", selections: ["50-2"] }], ["G0_gpai", NO]
  ]).cards, ["MINIMAL_RISK", "TRANSPARENCY"]);
  check("also the model provider", run([
    ...OPEN(), ["S2_annex_i_product", NO], ["S4_annex_iii_area", NONE],
    ["T0_transparency", { value: "continue", selections: ["50-2"] }],
    ["G0_gpai", YES], ["G1_systemic", NO]
  ]).cards, ["MINIMAL_RISK", "TRANSPARENCY", "GPAI_MODEL"]);
});

scenario("11. Open-source recruitment model — FOSS never downgrades", () => {
  const r = run([
    ...OPEN("provider", "yes"), ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", tick("Annex III(4)(a)")], ["S5_profiling", YES],
    ["T0_transparency", GO], ["G0_gpai", NO]
  ]);
  check("tier stays high-risk", r.cards, ["HIGH_RISK_ANNEX_III"]);
  check("FOSS flag recorded", r.flags.fossLicence, "yes");
  check("FOSS note shown on the high-risk card", r.E.notesFor(r.E.compileCards()[0]), ["fossExemption"]);
  check("note itself carries the guardrail", /does NOT apply if the system is high-risk/i.test(tree.notes.fossExemption.body), true);

  const noFoss = run([
    ...OPEN("provider", "no"), ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", tick("Annex III(4)(a)")], ["S5_profiling", YES],
    ["T0_transparency", GO], ["G0_gpai", NO]
  ]);
  check("no FOSS note when not open-source", noFoss.E.notesFor(noFoss.E.compileCards()[0]), []);
});

scenario("12. Role filtering", () => {
  const deployer = run([
    ...OPEN("deployer"), ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", tick("Annex III(4)(a)")], ["S5_profiling", YES],
    ["T0_transparency", GO], ["G0_gpai", NO]
  ]);
  const card = deployer.E.compileCards()[0];
  const groups = deployer.E.groupObligations(card);
  check("deployer sees only deployer + both groups", groups.map(g => g.role), ["deployer"]);
  check("deployer duties mention Art. 26/27",
    groups[0].items.some(o => /Art\. 26/.test(o.text)) && groups[0].items.some(o => /Art\. 27/.test(o.text)), true);
  check("something is hidden, so the toggle is offered", deployer.E.hasHiddenObligations([card]), true);
  check("show-all reveals both roles",
    deployer.E.groupObligations(card, { allRoles: true }).map(g => g.role), ["provider", "deployer"]);

  const provider = run([
    ...OPEN("provider"), ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", tick("Annex III(4)(a)")], ["S5_profiling", YES],
    ["T0_transparency", GO], ["G0_gpai", NO]
  ]);
  check("provider sees provider group", provider.E.groupObligations(provider.E.compileCards()[0]).map(g => g.role), ["provider"]);

  const unknown = run([
    ...OPEN(), ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", tick("Annex III(4)(a)")], ["S5_profiling", YES],
    ["T0_transparency", GO], ["G0_gpai", NO]
  ]);
  check("unknown role shows everything", unknown.E.groupObligations(unknown.E.compileCards()[0]).map(g => g.role), ["provider", "deployer"]);
  check("nothing hidden, so no toggle needed", unknown.E.hasHiddenObligations(unknown.E.compileCards()), false);
  check("banned card groups 'both' duties too",
    run([["S0_ai_system", YES], ["C0_context", ctx("provider")], ["S1_prohibited", tick("5-1-c")], ["G0_gpai", NO]])
      .E.groupObligations(tree.outcomes.PROHIBITED, {}).map(g => g.role), ["both", "provider"]);
});

/* ------------------------------------------------------- context step */
scenario("C0 context step", () => {
  const skipped = run([
    ["S0_ai_system", YES], ["C0_context", { skip: true }], ["S1_prohibited", NONE],
    ["S2_annex_i_product", NO], ["S4_annex_iii_area", NONE], ["T0_transparency", GO], ["G0_gpai", NO]
  ]);
  check("skipping leaves both flags unknown",
    [skipped.flags.role, skipped.flags.fossLicence], ["unknown", "unknown"]);
  check("skipping still records a trail entry",
    skipped.E.state.answers.find(a => a.nodeId === "C0_context").value, "skipped");
  check("context never changes the tier", skipped.cards, ["MINIMAL_RISK"]);
  check("context step is optional in the data", tree.nodes.C0_context.optional, true);

  const filled = run([...OPEN("both", "yes"), ["S2_annex_i_product", NO], ["S4_annex_iii_area", NONE], ["T0_transparency", GO], ["G0_gpai", NO]]);
  check("both/yes recorded", [filled.flags.role, filled.flags.fossLicence], ["both", "yes"]);
  check("'both' hides nothing", filled.E.hasHiddenObligations(filled.E.compileCards()), false);
});

/* -------------------------------------------------- review flags */
scenario("“I'm not sure” records a review flag and routes conservatively", () => {
  const s0 = run([
    ["S0_ai_system", UNSURE], ["C0_context", { skip: true }], ["S1_prohibited", NONE],
    ["S2_annex_i_product", NO], ["S4_annex_iii_area", NONE], ["T0_transparency", GO], ["G0_gpai", NO]
  ]);
  check("S0 unsure continues as an AI system", s0.cards, ["MINIMAL_RISK"]);
  check("one review flag", s0.flags.reviewFlags.length, 1);
  check("review flag carries a note", s0.flags.reviewFlags[0].note.length > 20, true);

  const annexI = run([...OPEN(), ["S2_annex_i_product", UNSURE], ["S3_annex_i_tpca", UNSURE],
    ["S4_annex_iii_area", NONE], ["T0_transparency", GO], ["G0_gpai", NO]]);
  check("S2 unsure still asks the S3 question", annexI.visited.includes("S3_annex_i_tpca"), true);
  check("S3 unsure follows the data's route (on to the listed uses)", annexI.cards, ["MINIMAL_RISK"]);
  check("two review flags", annexI.flags.reviewFlags.length, 2);

  const filter = run([...OPEN(), ["S2_annex_i_product", NO],
    ["S4_annex_iii_area", tick("Annex III(3)(b)")], ["S5_profiling", NO], ["S6_filter", UNSURE],
    ["T0_transparency", GO], ["G0_gpai", NO]]);
  check("unsure about the exemption keeps it high-risk", filter.cards, ["HIGH_RISK_ANNEX_III"]);

  const gpai = run([...OPEN(), ["S2_annex_i_product", NO], ["S4_annex_iii_area", NONE],
    ["T0_transparency", GO], ["G0_gpai", YES], ["G1_systemic", UNSURE]]);
  check("unsure about systemic risk keeps the plain GPAI card", gpai.cards, ["MINIMAL_RISK", "GPAI_MODEL"]);
  check("and flags it for review", gpai.flags.reviewFlags.length, 1);
});

/* ------------------------------------------------------------ navigation */
scenario("Navigation: back, edit, reset", () => {
  const E = newEngine();
  E.submit(YES); E.submit(ctx("deployer", "no")); E.submit(NONE); E.submit(NO);
  check("at the listed-uses question", E.currentNode().id, "S4_annex_iii_area");
  E.back();
  check("back returns to the product question", E.currentNode().id, "S2_annex_i_product");
  check("trail shrank", E.state.answers.length, 3);
  check("context answer kept in memory", !!E.memory.C0_context, true);

  E.submit(NO); E.submit(tick("Annex III(1)(c)")); E.submit(YES);
  check("auto-derived transparency present", E.state.flags.transparencyAuto, ["50-3"]);
  E.editFrom("S4_annex_iii_area");
  check("edit rewinds", E.currentNode().id, "S4_annex_iii_area");
  check("rewind clears the auto-derived item", E.state.flags.transparencyAuto, []);
  check("rewind clears the tier", E.state.flags.primaryTier, null);
  check("role flag from C0 survives the rewind", E.state.flags.role, "deployer");
  check("previous ticks remembered", E.memory.S4_annex_iii_area.selections, ["Annex III(1)(c)"]);

  E.reset();
  check("reset returns to the first question", E.currentNode().id, "S0_ai_system");
  check("reset clears the flags", [E.state.flags.role, E.state.flags.reviewFlags.length], ["unknown", 0]);
});

scenario("Verdict-so-far panel", () => {
  const E = newEngine();
  check("empty before the first answer", E.verdict().length, 0);
  E.submit(YES);
  check("first line after S0", E.verdict()[0].text, UI["verdict.isAiSystem"]);
  E.submit(ctx("deployer", "yes"));
  check("context adds a role line", E.verdict().some(l => l.text === UI["verdict.role.deployer"]), true);
  check("context adds a FOSS line", E.verdict().some(l => l.text === UI["verdict.foss"]), true);
  E.submit(NONE); E.submit(NO);
  check("in-progress tier line", E.verdict().some(l => l.pending), true);
  E.submit(tick("Annex III(4)(a)")); E.submit(YES);
  check("tier line resolves to the short title", E.verdict().some(l => l.text === PRES.high_risk_annex_iii.shortTitle), true);
  E.submit({ value: "continue", selections: ["50-1"] });
  check("transparency line added", E.verdict().some(l => l.text === UI["verdict.transparencyAdded"].replace("{n}", "1")), true);
  E.submit(NO);
  check("GPAI line added", E.verdict().some(l => l.text === UI["verdict.notGpai"]), true);
  check("no ⟨missing-key⟩ placeholders in the panel",
    E.verdict().filter(l => /⟨/.test(l.text) || /⟨/.test(l.sub || "")), []);
});

/* ----------------------------------------------------------------- done */
console.log(`\n${"-".repeat(60)}\n${passed} passed, ${failed} failed`);
if (failed) { console.log(`Failing: ${fails.join(", ")}`); process.exit(1); }
