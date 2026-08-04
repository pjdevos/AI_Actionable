# EU AI Act – Risk Tier Self-Assessment (build)

A browser-based triage tool: the owner of an algorithm or AI application answers a short,
branching series of questions and gets **every applicable AI Act status** — a primary risk
tier, the cumulative Article 50 transparency duties, and the GPAI model overlay — with the
article references, application dates, an auditable answer trail and a printable summary.

Built to `AI-Act-Tier-Assessment-SPEC.md`. **All questions, branching logic, reference lists,
result cards and interface strings live in `decision-tree.json`.** The code renders whatever
that file describes; it hard-codes no legal content.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole tool: inline CSS + JS, no build step, no back-end, no storage. Carries an embedded copy of the JSON so it also works offline from disk. |
| `decision-tree.json` | Single source of truth: `meta`, `resultModel`, `phases`, `ui`, `nodes`, `outcomes`, `catalog`. |
| `sync-embedded-json.mjs` | Copies `decision-tree.json` into the embedded block of `index.html`. Run after every content edit. |
| `test-scenarios.mjs` | 61 acceptance checks, including the nine SPEC §8 scenarios. Extracts the engine out of `index.html`, so it tests the code that actually ships. |

## Running it

Double-click `index.html` — it works straight from disk using the embedded copy of the JSON.

To serve it (so the tool reads the *external* `decision-tree.json`, and content edits need no
re-embedding), any static host will do:

```bash
python -m http.server 8765
```

Then open `http://localhost:8765`. The footer always states which copy of the data is in use.

## Editing the content

1. Edit `decision-tree.json` (question text, help lists, catalog items, obligations, dates…).
2. Run the sync so the offline copy inside `index.html` follows:

```bash
node sync-embedded-json.mjs
```

3. Run the tests:

```bash
node test-scenarios.mjs
```

The page validates the JSON against the contract on load and shows a red banner listing any
problem (unknown `next` target, missing catalog reference, unsupported `selectionRule`, …)
instead of failing silently.

### What the data controls

- **Routing** — each `options[].next` is either another node ID or an outcome ID. The four
  short-circuit rules (out of scope stops; prohibited skips transparency but still asks about
  GPAI) are implemented once, in the engine, exactly as SPEC §7 describes.
- **Checklist screens** — `checklist` / `reference` point into `catalog`; `selectionRule`
  decides how ticks become a yes/no answer: `anySelected` (S1, S4, T0) or
  `anySelectedAndSubNo` (S6: at least one Article 6(3) condition **and** no material influence
  on the outcome, asked as a `subQuestion`).
- **Uncertainty** — an option with `"uncertain": true` routes to the more conservative branch
  and its `reviewNote` is collected into the "points to have reviewed by an expert" box on the
  result screen. Currently on S0, S2, S3 and the S6 sub-question.
- **Progress** — `phases` maps node IDs to the four stepper segments. Phases the run never
  visits are marked *n/a* rather than left blank.
- **Result cards** — `outcomes[].color` / `icon` / `applicationDate` / `shortTitle` drive the
  card styling, the legend, the verdict panel and the decision map. Colour is never the only
  signal: every tier also carries an icon and a text label.

## Translating

Copy `decision-tree.json` to `decision-tree.nl.json`, translate `meta`, `ui`, `nodes`,
`outcomes` and `catalog` (leave the keys, node IDs, `value`s and `next` targets untouched),
put it next to `index.html` and open `index.html?lang=nl`. No code changes. `?lang=` falls back
to the English file if the translated one is missing or fails validation.

The `ui` block holds every string the interface renders itself. `test-scenarios.mjs` fails if
the code asks for a key the JSON does not have, or if the JSON carries a key nothing uses.

## Export

- **Print / save as PDF** — a print stylesheet drops the chrome and keeps the result cards,
  the review points, the answer trail and the disclaimer. All collapsed panels are expanded
  before printing so nothing is silently missing.
- **Download summary (.md)** — the same content as a Markdown file, generated in the browser.

Both are useful as the starting point for the Article 6(4) documentation duty in the filtered
case. Nothing is transmitted or stored: no account, no server, no `localStorage`.

## Accessibility

Keyboard navigable throughout; focus moves to the question heading on every screen change;
the stepper exposes each phase's state as text (`current step` / `completed` / `not applicable`)
next to the visual state; checklists are grouped in `fieldset`/`legend`; the verdict panel is an
`aria-live` region; `prefers-reduced-motion` disables all non-essential animation; light and
dark themes both meet AA contrast.

## Caveats to keep in view

- The tool encodes the AI Act plus the Commission's **draft** classification guidelines
  (stakeholder-consultation versions). `meta.version` and `meta.lastUpdated` are shown in the
  footer and on the result screen for exactly that reason.
- Application dates reflect the AI Omnibus postponements and are labelled indicative.
- It is triage, not compliance advice. The disclaimer appears on the start screen, the result
  screen and in the export.
