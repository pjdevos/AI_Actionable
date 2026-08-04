/**
 * sync-embedded-json.mjs
 *
 * index.html carries an embedded copy of decision-tree.json so that the page also
 * works when opened straight from disk (file:// blocks fetch). When hosted next to
 * decision-tree.json the page prefers the external file, so for a normal content
 * update you only need to edit the JSON — run this script to keep the offline copy
 * in step.
 *
 *   node sync-embedded-json.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(here, "decision-tree.json");
const htmlPath = join(here, "index.html");

const raw = readFileSync(jsonPath, "utf8");
JSON.parse(raw); // fail loudly on malformed JSON before touching index.html

const html = readFileSync(htmlPath, "utf8");
const open = '<script type="application/json" id="decision-tree-data">';
const start = html.indexOf(open);
if (start === -1) throw new Error("Could not find the embedded data block in index.html");
const bodyStart = start + open.length;
const end = html.indexOf("</script>", bodyStart);
if (end === -1) throw new Error("Unterminated embedded data block in index.html");

// JSON cannot contain "</script>", but a string value could - neutralise it defensively.
const safe = raw.replace(/<\/script/gi, "<\\/script");
const next = html.slice(0, bodyStart) + "\n" + safe.trimEnd() + "\n" + html.slice(end);

if (next === html) {
  console.log("Embedded copy already up to date.");
} else {
  writeFileSync(htmlPath, next, "utf8");
  console.log(`Embedded decision-tree.json into index.html (${raw.length} bytes).`);
}
