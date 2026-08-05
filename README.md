# EU AI Act – Risk Tier Self-Assessment (build)

A browser-based triage tool: the owner of an algorithm or AI application answers a short,
branching series of plain-language questions and gets **every AI Act status that applies** —
a primary risk tier, the cumulative Article 50 transparency duties, and the GPAI model
overlay — with the duties filtered to their role, the article references, application dates,
an auditable answer trail and a printable summary.

Built to `AI-Act-Tier-Assessment-SPEC.md` (spec v1.2, data v1.2.0).

## Two data files, deliberately separate

| File | Holds | Who owns it |
|---|---|---|
| `decision-tree.json` | Legal content: questions, routing, catalogs, result cards, `guidelines`, `notes`, `crossLinks` | Regenerated from the spec — overwrite it freely |
| `ui.json` | Presentation layer: interface strings (`ui`), the phase stepper (`phases`), per-tier icons / short labels / application dates (`presentation`), and `locale` | Stable, rarely changes |

This split exists because a fresh `decision-tree.json` used to wipe the interface strings and
icons. Now it cannot. If `decision-tree.json` does contain a `ui` block, its keys win over
`ui.json`, so a one-off override is still possible.

`index.html` is the whole tool: inline CSS + JS, no build step, no back-end, no storage, no
tracking. It carries embedded copies of both JSON files so it also works from disk.

## Running it

Double-click `index.html` — it works offline using the embedded copies.

To serve it (so the tool reads the *external* JSON and content edits need no re-embedding):

```bash
python -m http.server 8765
```

Then open `http://localhost:8765`. The footer states which copies are in use.

## Editing the content

1. Edit `decision-tree.json` (or `ui.json`).
2. Refresh the embedded offline copies:

```bash
node sync-embedded-json.mjs
```

3. Run the tests:

```bash
node test-scenarios.mjs
```

94 checks, including the twelve SPEC §8 scenarios. The suite extracts the engine out of
`index.html`, so it tests the code that actually ships. It fails if the embedded copies have
drifted, if the code asks for a `ui` key the JSON lacks, or if a tier has no `presentation`
entry.

The page also validates the data on load and shows a red banner listing any problem — an
unknown `next` target, a `guidelineLinks` key in neither `guidelines` nor `notes`, an
`impliesTransparency` id that is not a transparency trigger, a `crossLinks` rule the engine
has no handler for, an obligation that is not `{role, text}`.

### What the data controls

- **Routing** — `options[].next` is a node ID or an outcome ID. The short-circuits are
  implemented once, in the engine: out-of-scope stops immediately; **banned** stops the tier
  spine, skips transparency, but still asks about GPAI.
- **The optional context step (C0)** — `type: "context"` with `fields[]` renders the two
  dropdowns (role, open-source licence) and a **Skip this step** button. It never changes the
  tier; it only tailors which duties are shown and whether the FOSS note appears.
- **Three language layers** — `text` + `explainer` are always visible; `legalText` sits behind
  *In the words of the law*; `help.likelyYes/likelyNo` behind *Examples / how to decide*.
  Checklist items show `item.plain`, with `item.label` + `ref` + `detail` behind *Exact
  wording*. A first-time reader never has to see an article number; a lawyer can expand any of
  it.
- **Cross-links** — each `crossLinks.rules[].id` has a handler in the engine, and validation
  fails on a rule that has none, so a new rule can never be silently ignored:
  - `biometrics-to-transparency` — ticking Annex III 1(b) or 1(c) auto-derives the Art. 50(3)
    duty; T0 shows it pre-ticked, locked, tagged "worked out from your earlier answer", and it
    survives even if the form omits it.
  - `biometrics-emotion-prohibition-reminder` — reminds the reader those uses may be *banned*
    rather than high-risk.
  - `deepfake-implies-synthetic` — ticking 50(4) points out that 50(2) probably applies too.
    Suggested, never forced.
  > Note: `rules[].then` is written as an instruction to the implementer, so it is **not** shown
  > to users. The reader-facing sentence lives in `ui.json` as `crosslink.<id>.text`.
- **Role filtering** — obligations are `{role, text}`. A provider sees provider + both, a
  deployer sees deployer + both, both/unknown sees everything. Groups are always labelled, and
  a **Show all roles** toggle appears whenever something is filtered out, so nothing is ever
  hidden without a way back. The `providerVsDeployer` note (including the Art. 25 warning that
  a deployer can become a provider) is shown alongside.
- **FOSS note** — shown on both GPAI cards, and on the tier card when the user says the system
  is open-source. It never downgrades a banned, high-risk or transparency outcome; the tier
  stays and the note explains why.
- **"I'm not sure"** — an option with `flagsReview: true` records its `reviewNote` in
  `flags.reviewFlags` and follows whatever route the data specifies. The result screen lists
  them in a calm *Worth double-checking with an expert* box. It never changes the tier by itself.
- **Progress** — `ui.json → phases` maps node IDs to the four stepper segments (C0 sits in the
  first one). A node missing from that list joins the first phase of its module automatically,
  so the stepper cannot go blank. Phases a run never visits are marked *n/a*, never left blank.

## The diagram

It exists in two places, both generated from the same JSON — never hand-drawn:

**In the app.** Two collapsed panels: *See the whole decision tree before you start* on the start
screen, and *Show the decision map, with your path highlighted* on the result screen. Both are
drawn at runtime from the loaded JSON, so they follow a translated file, follow the light/dark
theme, and the result-screen one highlights the boxes and arrows the reader actually went through.
Each panel has a **Download the diagram (.svg)** button that writes a standalone file with the
colours resolved. They stay collapsed by default and never appear during the questions, per
SPEC §5.1 (a full tree mid-assessment overwhelms rather than helps).

The graph model behind it lives in the engine (`mapGraph()`, `pathTaken()`), not in the drawing
code, because it encodes routing rather than looks — and so the tests can cover it. They do: 24
checks assert that every node and every result card is on the map with at least one incoming
arrow. That guards a real defect this work uncovered — the earlier in-app map silently omitted
four of the nine result cards.

**As files, for the repo and for print.** `render-decision-tree.py` draws the same tree straight
from the two JSON files, so it never needs reprogramming when the content changes — add a question, rename a node, change an answer or add
an outcome and the diagram follows on the next run. Standard library only, no graphviz needed.

```bash
python render-decision-tree.py
```

Writes into `diagram/`:

| File | Use |
|---|---|
| `decision-tree.md` | the diagram as Mermaid in Markdown — **GitHub renders it inline**, no tools |
| `decision-tree.svg` | self-contained, opens in any browser, prints |
| `decision-tree.mmd` | Mermaid source, for pasting elsewhere |
| `decision-tree.dot` | Graphviz source; also rendered to `.svg`/`.png` if `dot` is installed |

Options: `--wording legal` swaps every question for the regulation's own wording from
`node.legalText` (the default `plain` uses the questions as the tool asks them); `--lang nl`
reads `decision-tree.nl.json` + `ui.nl.json`; `--formats svg`; `--out FOLDER`; `--check`
validates and writes nothing.

How to read it: a plain arrow is an answer · a dashed arrow is "I'm not sure" (merged with the
answer arrow when both lead to the same place, so the label reads e.g. "yes / not sure") · a
dotted blue arrow is what the engine does once the spine reaches a tier · a wide-swinging dotted
arrow is a cross-link, where an earlier answer settles a later question · a dashed box is the
optional context step · a coloured box is a result card in its tier colour · the grey bands are
the four phases of the stepper.

Four result cards are never the target of an answer — minimal risk, the transparency overlay and
the two GPAI cards are derived by the engine from the accumulated flags. The generator draws those
arrows too (from `setsGpai` and `setsFlag` in the data), so nothing floats unexplained. The one
thing written in the script rather than read from the JSON is the engine's post-tier routing
(`ENGINE_ROUTING`), because the JSON has no way to express it; it mirrors SPEC §7.

`--check` also reports structural problems and exits non-zero, so it doubles as a data check:
unreachable nodes, outcomes no answer can produce, dangling `next` targets, and outcome colours
outside the palette.

**Regenerate after editing the JSON** — the files in `diagram/` are generated and will otherwise
go stale. Each carries a "generated" header saying which version it came from.

## Translating

Copy both files to `decision-tree.nl.json` and `ui.nl.json`, translate them (leave keys, node
IDs, `value`s and `next` targets untouched), and open `index.html?lang=nl`. No code changes.
`?lang=` falls back to the English files if a translated one is missing or fails validation.

## Export

- **Print / save as PDF** — a print stylesheet drops the chrome and keeps the cards, the review
  points, the trail and the disclaimer. Collapsed panels are expanded first so nothing is
  silently missing from the PDF.
- **Download summary (.md)** — the same content as Markdown, generated in the browser,
  including your role, the FOSS note and every duty grouped by role.

Nothing is transmitted or stored: no account, no server, no `localStorage`.

## Accessibility

Keyboard navigable throughout; focus moves to the question heading on every screen change; the
stepper exposes each phase's state as text; checklists are grouped in `fieldset`/`legend`; the
verdict panel is an `aria-live` region; `prefers-reduced-motion` disables non-essential
animation; light and dark themes both meet AA contrast; every tier colour is paired with an
icon and a label. Verified free of horizontal overflow down to 375 px.

## Caveats to keep in view

- The tool encodes the AI Act plus the Commission's guidance, of which the **high-risk
  classification part is still a draft**. That guideline is labelled *draft* everywhere it is
  linked. `meta.version` and `meta.lastUpdated` are shown in the footer and on the result.
- Application dates reflect the AI Omnibus postponements and are labelled indicative.
- It is triage, not compliance advice. The disclaimer appears on the start screen, the result
  screen and in the export.
