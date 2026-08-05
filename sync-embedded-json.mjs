/**
 * sync-embedded-json.mjs
 *
 * index.html carries embedded copies of decision-tree.json and ui.json so the page
 * also works when opened straight from disk (file:// blocks fetch). When hosted
 * next to those files the page prefers the external ones, so for a normal content
 * update you only need to edit the JSON — run this script to keep the offline
 * copies in step.
 *
 *   node sync-embedded-json.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(here, "index.html");

const BLOCKS = [
  { file: "decision-tree.json", id: "decision-tree-data" },
  { file: "ui.json", id: "ui-data" }
];

let html = readFileSync(htmlPath, "utf8");
let changed = 0;

for (const { file, id } of BLOCKS) {
  const raw = readFileSync(join(here, file), "utf8");
  JSON.parse(raw); // fail loudly on malformed JSON before touching index.html

  const open = `<script type="application/json" id="${id}">`;
  const start = html.indexOf(open);
  if (start === -1) throw new Error(`Could not find the embedded block "${id}" in index.html`);
  const bodyStart = start + open.length;
  const end = html.indexOf("</script>", bodyStart);
  if (end === -1) throw new Error(`Unterminated embedded block "${id}" in index.html`);

  // JSON cannot contain "</script>", but a string value could - neutralise it defensively.
  const safe = raw.replace(/<\/script/gi, "<\\/script");
  const next = html.slice(0, bodyStart) + "\n" + safe.trimEnd() + "\n" + html.slice(end);
  if (next !== html) { changed++; console.log(`Embedded ${file} (${raw.length} bytes) into #${id}.`); }
  html = next;
}

if (changed) writeFileSync(htmlPath, html, "utf8");
else console.log("Embedded copies already up to date.");
