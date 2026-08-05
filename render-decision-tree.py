#!/usr/bin/env python3
"""
render-decision-tree.py — draw the decision tree straight from the JSON.

    python render-decision-tree.py                  # all formats, plain wording
    python render-decision-tree.py --wording legal   # use the regulation's wording
    python render-decision-tree.py --lang nl         # read decision-tree.nl.json + ui.nl.json
    python render-decision-tree.py --formats svg     # just one format
    python render-decision-tree.py --check           # validate only, write nothing

Nothing about the tree is hard-coded here: the questions, answers, routing, cross-links,
result cards, colours, short labels and phase grouping are all read from
decision-tree.json and ui.json. Add a question, rename a node, change an answer or add
an outcome and the diagram follows on the next run. The only thing written in code is
the engine's own routing (SPEC §7: what happens *after* the spine reaches a tier), which
is not expressible in the JSON — see ENGINE_ROUTING below.

Outputs (into ./diagram):
    decision-tree.svg   self-contained, opens in any browser, no tools needed
    decision-tree.mmd   Mermaid source
    decision-tree.md    the Mermaid diagram in Markdown — GitHub renders this inline
    decision-tree.dot   Graphviz source; rendered to .svg/.png too if `dot` is installed

Standard library only. Exits non-zero if the JSON is structurally broken, so it doubles
as a data check.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import subprocess
import sys
import textwrap
from collections import deque
from pathlib import Path

HERE = Path(__file__).resolve().parent

# ---------------------------------------------------------------------------
# The one piece of behaviour that lives in the engine rather than in the JSON.
# decision-tree.json routes an answer to an outcome id; the engine then continues
# into the overlays (SPEC §7). Mirrored here so the diagram shows the real flow.
# ---------------------------------------------------------------------------
ENGINE_ROUTING = {
    "OUT_OF_SCOPE": (None, "stops here"),
    "PROHIBITED": ("G0_gpai", "banned overrides everything; transparency is moot"),
    "__other_tiers__": ("T0_transparency", "carries on into the overlays"),
}

# outcomes[].color -> hex. Same palette as the tool, keyed by the colour names the
# JSON uses, so a new outcome reusing a known colour needs no change here.
PALETTE = {
    "grey": ("#4b5563", "#eef0f3"),
    "red": ("#c81e1e", "#fdeceb"),
    "orange": ("#b3450b", "#fdefe4"),
    "yellow": ("#8a6100", "#fdf3d7"),
    "green": ("#11703a", "#e6f5ea"),
    "blue": ("#1d4ed8", "#e8eeff"),
    "purple": ("#6528c4", "#f1e9fe"),
}
FALLBACK_COLOR = ("#4b5563", "#eef0f3")
INK, MUTED, RULE, ACCENT = "#14181f", "#5b6472", "#dce0e6", "#1d4ed8"
PHASE_BANDS = ["#f7f8fa", "#f1f3f6"]


# ---------------------------------------------------------------------------
# Graph model: built once from the JSON, then handed to each emitter.
# ---------------------------------------------------------------------------
class Node:
    def __init__(self, key, kind, title, sub, color=None, meta=None):
        self.key = key          # node / outcome id
        self.kind = kind        # "question" | "context" | "result" | "outcome"
        self.title = title
        self.sub = sub          # article refs, item counts, tier
        self.color = color      # only for outcomes
        self.meta = meta or {}
        self.row = 0
        self.col = 0


class Edge:
    def __init__(self, src, dst, label, style, short=None):
        self.src, self.dst, self.label = src, dst, label
        self.style = style      # "answer" | "unsure" | "engine" | "crosslink"
        self.short = short or label   # SVG uses this; Mermaid/DOT use the full label


class Graph:
    def __init__(self, tree, ui, wording):
        self.tree, self.ui, self.wording = tree, ui, wording
        self.strings = {**ui.get("ui", {}), **tree.get("ui", {})}
        self.presentation = ui.get("presentation", {})
        self.phases = ui.get("phases", [])
        self.nodes: dict[str, Node] = {}
        self.edges: list[Edge] = []
        self.problems: list[str] = []
        self._build()

    # -- helpers ----------------------------------------------------------
    def _catalog_of(self, node):
        name = node.get("checklist") or node.get("reference")
        return name, self.tree["catalog"].get(name) if name else None

    def _catalog_count(self, cat):
        if not cat:
            return 0
        if "items" in cat:
            return len(cat["items"])
        return sum(len(a.get("useCases", [])) for a in cat.get("areas", []))

    def _question_title(self, node_id, node):
        """Plain wording is the question as asked; legal wording is the regulation's."""
        if self.wording == "legal":
            legal = node.get("legalText") or {}
            if legal.get("text"):
                return legal["text"]
            return node.get("text", node_id)
        return node.get("text", node_id)

    def _question_sub(self, node_id, node):
        bits = []
        ref = (node.get("legalText") or {}).get("articleRef") or node.get("articleRef")
        if ref:
            bits.append(ref)
        name, cat = self._catalog_of(node)
        count = self._catalog_count(cat)
        if count:
            kind = "to tick" if node.get("checklist") else "for reference"
            bits.append(f"{count} items {kind} ({name})")
        if node.get("optional"):
            bits.append("optional, never changes the tier")
        return " · ".join(bits)

    def _outcome_title(self, oid, oc):
        if self.wording == "legal":
            return oc.get("title", oid)
        pres = self.presentation.get(oc.get("tier"), {})
        return pres.get("shortTitle") or oc.get("title", oid)

    def _outcome_sub(self, oc):
        bits = list(oc.get("legalRefs", [])[:3])
        key = self.presentation.get(oc.get("tier"), {}).get("appliesFrom")
        raw = (self.tree.get("meta", {}).get("keyDates") or {}).get(key) if key else None
        if raw:
            bits.append(f"applies: {nice_dates(raw)}")
        return " · ".join(bits)

    def _edge_label(self, option):
        label = option.get("label", option.get("value", ""))
        if self.wording == "legal":
            return f'{option.get("value")}: {label}'
        return label

    # -- build ------------------------------------------------------------
    def _build(self):
        tree = self.tree
        nodes, outcomes = tree["nodes"], tree["outcomes"]

        for nid, node in nodes.items():
            kind = node.get("type", "question")
            if kind == "result":
                self.nodes[nid] = Node(nid, "result", self.strings.get("result.pathResultLabel", "Result"),
                                       "all applicable cards are compiled here")
            else:
                self.nodes[nid] = Node(nid, kind, self._question_title(nid, node),
                                       self._question_sub(nid, node),
                                       meta={"module": node.get("module", "")})
        for oid, oc in outcomes.items():
            self.nodes[oid] = Node(oid, "outcome", self._outcome_title(oid, oc),
                                   self._outcome_sub(oc), color=oc.get("color"),
                                   meta={"tier": oc.get("tier")})

        # answers and the context step
        for nid, node in nodes.items():
            kind = node.get("type", "question")
            if kind == "context":
                target = node.get("next")
                if target not in self.nodes:
                    self.problems.append(f'node {nid}: "next" points at unknown target "{target}"')
                    continue
                self.edges.append(Edge(nid, target, "save and continue / skip", "answer", "continue"))
            elif kind == "question":
                for option in node.get("options", []):
                    target = option.get("next")
                    if target not in self.nodes:
                        self.problems.append(
                            f'node {nid}: option "{option.get("value")}" points at unknown target "{target}"')
                        continue
                    style = "unsure" if option.get("flagsReview") else "answer"
                    short = "not sure" if option.get("flagsReview") else str(option.get("value", ""))
                    self.edges.append(Edge(nid, target, self._edge_label(option), style, short))

        # the engine's routing after a spine terminal
        for oid in outcomes:
            target, why = ENGINE_ROUTING.get(oid, ENGINE_ROUTING["__other_tiers__"])
            if target is None:
                continue
            if target not in self.nodes:
                self.problems.append(f"engine routing: {oid} -> unknown node {target}")
                continue
            if not any(e.src == oid for e in self.edges):
                self.edges.append(Edge(oid, target, why, "engine", "then"))

        self._build_derived_outcomes()
        self._build_crosslinks()
        self._layout()
        self._selfcheck()

    def _outcome_with_tier(self, tier):
        for oid, oc in self.tree["outcomes"].items():
            if oc.get("tier") == tier:
                return oid
        return None

    def _build_derived_outcomes(self):
        """Four result cards are never an option's `next`: the engine derives them from
        the accumulated flags. Without these arrows they would float unexplained, so
        draw them — from the data wherever the data says it (setsGpai, setsFlag)."""
        # the GPAI cards: the option itself names the model status it sets
        for nid, node in self.tree["nodes"].items():
            for option in node.get("options", []):
                tier = option.get("setsGpai")
                if not tier:
                    continue
                oid = self._outcome_with_tier(tier)
                if oid:
                    self.edges.append(Edge(nid, oid, f'adds the model card: {option.get("label", tier)}',
                                           "engine", "adds this card"))

        # the transparency overlay: whichever node collects the Art. 50 items
        collector = next((nid for nid, n in self.tree["nodes"].items()
                          if n.get("setsFlag") == "transparency"), None)
        oid = self._outcome_with_tier("transparency")
        if collector and oid:
            self.edges.append(Edge(collector, oid, "if at least one item applies (stacks on the tier)",
                                   "engine", "if any item applies"))

        # minimal risk: what you get when the spine set no tier at all
        result_node = next((nid for nid, n in self.tree["nodes"].items()
                           if n.get("type") == "result"), None)
        oid = self._outcome_with_tier("minimal_risk")
        if result_node and oid:
            self.edges.append(Edge(result_node, oid, "no tier was set along the way", "engine", "no tier was set"))

    def _build_crosslinks(self):
        """Dotted edges for crossLinks.rules, discovered from the data itself."""
        rules = {r["id"]: r for r in (self.tree.get("crossLinks") or {}).get("rules", [])}

        # which node offers a use case that implies a transparency item, and which
        # node collects transparency items? both are found, not assumed.
        implying = []
        for nid, node in self.tree["nodes"].items():
            _, cat = self._catalog_of(node)
            if not cat:
                continue
            for area in cat.get("areas", []):
                for uc in area.get("useCases", []):
                    if uc.get("impliesTransparency"):
                        implying.append((nid, uc["ref"], uc["impliesTransparency"]))
        collector = next((nid for nid, n in self.tree["nodes"].items()
                          if n.get("setsFlag") == "transparency"), None)

        if "biometrics-to-transparency" in rules and implying and collector:
            refs = sorted({r for _, r, _ in implying})
            items = sorted({i for _, _, ids in implying for i in ids})
            src = implying[0][0]
            self.edges.append(Edge(src, collector,
                                   f"{', '.join(refs)} auto-derives {', '.join(items)}", "crosslink",
                                   f"auto-derives {', '.join(items)}"))
        for rid in ("biometrics-emotion-prohibition-reminder", "deepfake-implies-synthetic"):
            if rid not in rules:
                continue
            note = self.strings.get(f"crosslink.{rid}.title", rid)
            anchor = collector if rid == "deepfake-implies-synthetic" else (implying[0][0] if implying else None)
            if anchor:
                self.nodes[anchor].meta.setdefault("notes", []).append(note)

    def _layout(self):
        """Breadth-first from the start node: robust to reordering inside the JSON."""
        start = "S0_ai_system" if "S0_ai_system" in self.nodes else next(iter(self.tree["nodes"]))
        flow_edges = [e for e in self.edges if e.style in ("answer", "engine")]
        out_of = {}
        for e in flow_edges:
            out_of.setdefault(e.src, []).append(e.dst)

        depth, seen, queue = {start: 0}, {start}, deque([start])
        while queue:
            cur = queue.popleft()
            for nxt in out_of.get(cur, []):
                if nxt not in seen:
                    seen.add(nxt)
                    depth[nxt] = depth[cur] + 1
                    queue.append(nxt)
        # anything unreachable still gets drawn, at the bottom
        for key in self.nodes:
            depth.setdefault(key, max(depth.values(), default=0) + 1)

        # two columns: the flow on the left, the result cards on the right
        for node in self.nodes.values():
            node.col = 1 if node.kind == "outcome" else 0

        # Order by phase first, then by depth. Depth alone interleaves the phases
        # (T0 and G0 come out shallower than S6), which would break the phase bands
        # and read out of order.
        phase_index = {}
        for i, phase in enumerate(self.phases):
            for key in phase.get("nodes", []):
                phase_index[key] = i
        last = len(self.phases)

        row = 0
        for key, node in sorted(((k, n) for k, n in self.nodes.items() if n.col == 0),
                                key=lambda kv: (phase_index.get(kv[0], last), depth[kv[0]], kv[0])):
            node.row = row
            row += 1
        # each outcome sits on the row of the earliest question that can reach it
        taken = set()
        for key, node in sorted(((k, n) for k, n in self.nodes.items() if n.col == 1),
                                key=lambda kv: depth[kv[0]]):
            sources = [e.src for e in self.edges
                       if e.dst == key and e.style in ("answer", "engine") and self.nodes[e.src].col == 0]
            base = min((self.nodes[s].row for s in sources if s in self.nodes), default=0)
            while base in taken:
                base += 1
            node.row = base
            taken.add(base)

    def _selfcheck(self):
        for key, node in self.nodes.items():
            if node.kind == "outcome":
                continue
            if key != "S0_ai_system" and not any(e.dst == key for e in self.edges):
                self.problems.append(f'node {key} is unreachable: nothing routes to it')
        for oid in self.tree["outcomes"]:
            if not any(e.dst == oid for e in self.edges):
                self.problems.append(f'outcome {oid} can never be reached from any answer')

    # -- convenience for emitters ----------------------------------------
    def phase_of(self, key):
        for phase in self.phases:
            if key in phase.get("nodes", []):
                return phase
        return None

    def colors(self, node):
        return PALETTE.get(node.color, FALLBACK_COLOR) if node.color else (INK, "#ffffff")

    def flow_nodes(self):
        return sorted((n for n in self.nodes.values() if n.col == 0), key=lambda n: n.row)

    def outcome_nodes(self):
        return sorted((n for n in self.nodes.values() if n.col == 1), key=lambda n: n.row)

    def title_line(self):
        meta = self.tree.get("meta", {})
        return (f'{meta.get("title", "Decision tree")} — v{meta.get("version", "?")}'
                f' · {self.wording} wording · generated from decision-tree.json')


# ---------------------------------------------------------------------------
# Emitter 1: self-contained SVG (deterministic two-column layout, no tools needed)
# ---------------------------------------------------------------------------
def wrap(text, width):
    return textwrap.wrap(str(text), width=width) or [""]


_MONTHS = ("January", "February", "March", "April", "May", "June",
           "July", "August", "September", "October", "November", "December")


def nice_dates(value):
    """ISO dates in the data become day-month-year, including inside a sentence,
    matching how the tool itself prints them."""
    def sub(match):
        year, month, day = match.group(1), int(match.group(2)), int(match.group(3))
        if not 1 <= month <= 12:
            return match.group(0)
        return f"{day} {_MONTHS[month - 1]} {year}"
    return re.sub(r"(\d{4})-(\d{2})-(\d{2})", sub, str(value))


def emit_svg(g: Graph) -> str:
    PAD, COL_W, GAP = 28, 330, 90
    GUTTER = 46            # room to the left for arrows that skip a row
    BAND_HEAD = 22         # headroom so a phase label is not hidden behind a box
    X0 = PAD + GUTTER
    X1 = X0 + COL_W + GAP
    LINE_H, TITLE_H, SUB_H = 16, 15, 13
    HEAD = 74 + BAND_HEAD

    boxes, y = {}, HEAD
    for node in g.flow_nodes():
        title_lines = wrap(node.title, 44)
        sub_lines = wrap(node.sub, 52) if node.sub else []
        notes = node.meta.get("notes", [])
        note_lines = [f"! {n}" for n in notes]
        h = 14 + len(title_lines) * TITLE_H + (len(sub_lines) + len(note_lines)) * SUB_H + 12
        boxes[node.key] = dict(x=X0, y=y, w=COL_W, h=h, title=title_lines,
                               sub=sub_lines, notes=note_lines)
        y += h + 36          # room for the answer label and the next phase band
    flow_bottom = y

    for node in g.outcome_nodes():
        anchor_rows = [e.src for e in g.edges
                       if e.dst == node.key and e.style in ("answer", "engine") and e.src in boxes]
        anchor = boxes.get(anchor_rows[0]) if anchor_rows else None
        title_lines = wrap(node.title, 40)
        sub_lines = wrap(node.sub, 46) if node.sub else []
        h = 12 + len(title_lines) * TITLE_H + len(sub_lines) * SUB_H + 10
        top = (anchor["y"] if anchor else HEAD)
        while any(abs(top - b["y"]) < h + 12 and b["x"] == X1 for b in boxes.values()):
            top += h + 18
        boxes[node.key] = dict(x=X1, y=top, w=COL_W - 30, h=h, title=title_lines,
                               sub=sub_lines, notes=[], outcome=True, node=node)

    width = X1 + COL_W - 30 + PAD
    height = max(flow_bottom, max(b["y"] + b["h"] for b in boxes.values())) + 96
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
           f'viewBox="0 0 {width} {height}" font-family="system-ui, -apple-system, Segoe UI, sans-serif">',
           f'<rect width="{width}" height="{height}" fill="#ffffff"/>',
           '<defs>'
           f'<marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="{MUTED}"/></marker>'
           f'<marker id="ae" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="{ACCENT}"/></marker>'
           '</defs>']

    # phase bands behind the flow column
    for i, phase in enumerate(g.phases):
        members = [boxes[k] for k in phase.get("nodes", []) if k in boxes]
        if not members:
            continue
        top = min(b["y"] for b in members) - BAND_HEAD
        bot = max(b["y"] + b["h"] for b in members) + 8
        out.append(f'<rect x="{X0 - 14}" y="{top}" width="{COL_W + 28}" height="{bot - top}" rx="12" '
                   f'fill="{PHASE_BANDS[i % len(PHASE_BANDS)]}" stroke="{RULE}" stroke-dasharray="3 3"/>')
        out.append(f'<text x="{X0 - 6}" y="{top + 15}" font-size="11" font-weight="700" '
                   f'fill="{MUTED}" letter-spacing=".06em">{html.escape(phase.get("label", "").upper())}</text>')

    # edges first, so boxes sit on top
    def anchor_points(a, b):
        if a["x"] == b["x"]:
            return (a["x"] + a["w"] / 2, a["y"] + a["h"]), (b["x"] + b["w"] / 2, b["y"]), "v"
        if b["x"] > a["x"]:
            return (a["x"] + a["w"], a["y"] + a["h"] / 2), (b["x"], b["y"] + b["h"] / 2), "h"
        return (a["x"], a["y"] + a["h"] / 2), (b["x"] + b["w"], b["y"] + b["h"] / 2), "h"

    STYLE = {
        "answer": (MUTED, "none", "a"),
        "unsure": (MUTED, "5 4", "a"),
        "engine": (ACCENT, "2 4", "ae"),
        "crosslink": (ACCENT, "1 5", "ae"),
    }
    # Two answers can lead to the same place (S0's "yes" and "I'm not sure" both go to
    # the context step). Drawn separately they would sit on the same line with their
    # labels on top of each other, so merge them into one arrow and join the labels.
    # Only answers merge with answers: an engine step or a cross-link means something
    # different and keeps its own arrow, even between the same two boxes.
    def merge_class(style):
        return "answer" if style in ("answer", "unsure") else style

    flow_index = {n.key: i for i, n in enumerate(g.flow_nodes())}
    merged: dict[tuple[str, str, str], dict] = {}
    for e in g.edges:
        key = (e.src, e.dst, merge_class(e.style))
        slot = merged.setdefault(key, {"labels": [], "styles": set()})
        if e.short not in slot["labels"]:
            slot["labels"].append(e.short)
        slot["styles"].add(e.style)

    for (src, dst, mclass), slot in merged.items():
        a, b = boxes.get(src), boxes.get(dst)
        if not a or not b:
            continue
        (x1, y1), (x2, y2), kind = anchor_points(a, b)
        styles = slot["styles"]
        style = ("answer" if "answer" in styles else
                 "engine" if "engine" in styles else
                 "crosslink" if "crosslink" in styles else "unsure")
        stroke, dash, marker = STYLE[style]
        skips_a_row = kind == "v" and abs(flow_index.get(dst, 0) - flow_index.get(src, 0)) > 1
        if skips_a_row:
            # route around the left of the column instead of straight through the
            # boxes in between (S2 -> S4 skips S3; the cross-link skips several)
            ya, yb = a["y"] + a["h"] / 2, b["y"] + b["h"] / 2
            # a cross-link between the same two boxes swings wider, so the two
            # arrows stay visually distinct
            bulge = X0 - GUTTER + (2 if mclass == "crosslink" else 20)
            d = f'M {a["x"]} {ya} C {bulge} {ya}, {bulge} {yb}, {b["x"]} {yb}'
        elif kind == "v":
            d = f"M {x1} {y1} L {x2} {y2}"
        else:
            mx = (x1 + x2) / 2
            d = f"M {x1} {y1} C {mx} {y1}, {mx} {y2}, {x2} {y2}"
        out.append(f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="1.6" '
                   f'stroke-dasharray="{dash}" marker-end="url(#{marker})" opacity="0.95"/>')

        label = " / ".join(slot["labels"])
        if len(label) > 40:
            label = label[:38] + "…"
        if skips_a_row:
            lx = X0 - GUTTER + (4 if mclass == "crosslink" else 24)
            ly = (a["y"] + a["h"] / 2 + b["y"] + b["h"] / 2) / 2 + (12 if mclass == "crosslink" else 0)
            anchor_attr = "start"
        elif kind == "v":
            lx, ly, anchor_attr = x1 + 9, (y1 + y2) / 2 + 3, "start"
        elif x2 < x1:
            # heading back left (a tier card returning into the overlays). These all end
            # at the same box, and their start is where the incoming answer is labelled,
            # so label them halfway along the curve: one distinct spot per card.
            lx, ly, anchor_attr = (x1 + x2) / 2, (y1 + y2) / 2 - 6, "middle"
        else:
            # hug the target box: outcomes sit on separate rows, so these never collide
            lx, ly, anchor_attr = x2 - 8, y2 - 6, "end"
        # white halo keeps the label readable where it crosses a band or a line
        out.append(f'<text x="{lx}" y="{ly}" font-size="10.5" fill="{MUTED}" text-anchor="{anchor_attr}" '
                   f'stroke="#ffffff" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round">'
                   f'{html.escape(label)}</text>')

    # boxes
    for key, b in boxes.items():
        node = g.nodes[key]
        if b.get("outcome"):
            ink, fill = g.colors(node)
            out.append(f'<rect x="{b["x"]}" y="{b["y"]}" width="{b["w"]}" height="{b["h"]}" rx="10" '
                       f'fill="{fill}" stroke="{ink}" stroke-width="2"/>')
            ty = b["y"] + 20
            for line in b["title"]:
                out.append(f'<text x="{b["x"] + 12}" y="{ty}" font-size="12.5" font-weight="700" fill="{ink}">{html.escape(line)}</text>')
                ty += TITLE_H
            for line in b["sub"]:
                out.append(f'<text x="{b["x"] + 12}" y="{ty}" font-size="10.5" fill="{MUTED}">{html.escape(line)}</text>')
                ty += SUB_H
            continue

        shape_fill = "#ffffff"
        stroke = ACCENT if node.kind == "context" else INK
        dash = ' stroke-dasharray="6 4"' if node.kind == "context" else ""
        out.append(f'<rect x="{b["x"]}" y="{b["y"]}" width="{b["w"]}" height="{b["h"]}" rx="10" '
                   f'fill="{shape_fill}" stroke="{stroke}" stroke-width="1.8"{dash}/>')
        out.append(f'<text x="{b["x"] + 12}" y="{b["y"] + 17}" font-size="10" font-weight="700" '
                   f'fill="{ACCENT}" letter-spacing=".05em">{html.escape(key)}</text>')
        ty = b["y"] + 34
        for line in b["title"]:
            out.append(f'<text x="{b["x"] + 12}" y="{ty}" font-size="12.5" fill="{INK}">{html.escape(line)}</text>')
            ty += TITLE_H
        for line in b["sub"]:
            out.append(f'<text x="{b["x"] + 12}" y="{ty}" font-size="10.5" fill="{MUTED}">{html.escape(line)}</text>')
            ty += SUB_H
        for line in b["notes"]:
            out.append(f'<text x="{b["x"] + 12}" y="{ty}" font-size="10.5" fill="#8a6100">{html.escape(line)}</text>')
            ty += SUB_H

    # header + legend
    out.append(f'<text x="{PAD}" y="30" font-size="15" font-weight="700" fill="{INK}">'
               f'{html.escape(g.tree.get("meta", {}).get("title", "Decision tree"))}</text>')
    out.append(f'<text x="{PAD}" y="49" font-size="11" fill="{MUTED}">{html.escape(g.title_line())}</text>')
    ly = height - 56
    legend = [("answer", "an answer"), ("unsure", "“I'm not sure” (routes conservatively, flags a review)"),
              ("engine", "what the engine does after a tier is reached"),
              ("crosslink", "cross-link: an answer that decides a later question")]
    lx = PAD
    for style, text in legend:
        stroke, dash, _ = STYLE[style]
        out.append(f'<path d="M {lx} {ly} l 26 0" stroke="{stroke}" stroke-width="1.8" stroke-dasharray="{dash}"/>')
        out.append(f'<text x="{lx + 32}" y="{ly + 4}" font-size="10.5" fill="{MUTED}">{html.escape(text)}</text>')
        lx += 40 + len(text) * 5.6
        if lx > width - 260:
            lx, ly = PAD, ly + 18
    out.append(f'<text x="{PAD}" y="{height - 18}" font-size="10" fill="{MUTED}">'
               f'{html.escape("Dashed box = optional step. Coloured box = result card, in its tier colour.")}</text>')
    out.append("</svg>")
    return "\n".join(out)


# ---------------------------------------------------------------------------
# Emitter 2: Mermaid (GitHub renders this inline in Markdown)
# ---------------------------------------------------------------------------
def emit_mermaid(g: Graph) -> str:
    def mid(key):
        return key.replace("-", "_")

    def txt(s, width=38):
        s = str(s).replace('"', "'")
        return "<br/>".join(wrap(s, width))

    lines = ["%%{init: {'flowchart': {'curve': 'basis'}} }%%", "flowchart TD"]
    for phase in g.phases:
        members = [k for k in phase.get("nodes", []) if k in g.nodes]
        if not members:
            continue
        lines.append(f'  subgraph {mid(phase["id"])}["{phase.get("label", phase["id"])}"]')
        lines.append("    direction TB")
        for key in members:
            node = g.nodes[key]
            label = f'<b>{key}</b><br/>{txt(node.title)}'
            if node.sub:
                label += f'<br/><i>{txt(node.sub, 44)}</i>'
            shape = ("([", "])") if node.kind == "context" else ("{{", "}}")
            lines.append(f'    {mid(key)}{shape[0]}"{label}"{shape[1]}')
        lines.append("  end")

    for key, node in g.nodes.items():
        if g.phase_of(key) or node.kind == "outcome":
            continue
        lines.append(f'  {mid(key)}["<b>{key}</b><br/>{txt(node.title)}"]')
    for node in g.outcome_nodes():
        label = f'<b>{txt(node.title, 34)}</b>'
        if node.sub:
            label += f'<br/>{txt(node.sub, 40)}'
        lines.append(f'  {mid(node.key)}[["{label}"]]')

    for e in g.edges:
        arrow = {"answer": "-->", "unsure": "-.->", "engine": "==>", "crosslink": "-.->"}[e.style]
        label = str(e.label).replace('"', "'")
        if len(label) > 60:
            label = label[:58] + "…"
        prefix = {"unsure": "not sure: ", "engine": "then: ", "crosslink": "cross-link: "}.get(e.style, "")
        lines.append(f'  {mid(e.src)} {arrow}|"{prefix}{label}"| {mid(e.dst)}')

    for node in g.outcome_nodes():
        ink, fill = g.colors(node)
        lines.append(f'  style {mid(node.key)} fill:{fill},stroke:{ink},stroke-width:2px,color:#14181f')
    return "\n".join(lines) + "\n"


def emit_markdown(g: Graph, mermaid: str) -> str:
    meta = g.tree.get("meta", {})
    counts = {
        "questions": sum(1 for n in g.nodes.values() if n.kind == "question"),
        "outcomes": sum(1 for n in g.nodes.values() if n.kind == "outcome"),
        "answers": sum(1 for e in g.edges if e.style in ("answer", "unsure")),
    }
    return f"""# Decision tree — {meta.get("title", "")}

<!-- GENERATED FILE — do not edit. Run: python render-decision-tree.py -->

Generated from `decision-tree.json` v{meta.get("version", "?")} (content updated
{meta.get("lastUpdated", "?")}) with the **{g.wording}** wording.
{counts["questions"]} questions, {counts["answers"]} possible answers,
{counts["outcomes"]} result cards.

Legend: a plain arrow is an answer · a dotted arrow into the next question is an
“I'm not sure” answer (it routes conservatively and flags a point for review) · a thick
arrow is what the engine does once the spine reaches a tier · a dotted arrow between
questions is a cross-link, where an earlier answer settles a later question · a rounded
box is the optional context step · a shadowed box is a result card in its tier colour.

```mermaid
{mermaid.rstrip()}
```

Also in this folder: `decision-tree.svg` (opens in any browser) and `decision-tree.dot`
(Graphviz source).
"""


# ---------------------------------------------------------------------------
# Emitter 3: Graphviz DOT
# ---------------------------------------------------------------------------
def emit_dot(g: Graph) -> str:
    def q(s):
        return str(s).replace("\\", "\\\\").replace('"', '\\"')

    def lbl(node):
        parts = [f"{node.key}" if node.kind != "outcome" else ""]
        parts += wrap(node.title, 40)
        if node.sub:
            parts += wrap(node.sub, 46)
        return "\\n".join(q(p) for p in parts if p)

    out = ["digraph decision_tree {", '  rankdir=TB;', '  graph [fontname="Helvetica", fontsize=11, splines=spline];',
           '  node [fontname="Helvetica", fontsize=10, shape=box, style="rounded,filled", fillcolor="#ffffff", color="#14181f"];',
           '  edge [fontname="Helvetica", fontsize=9, color="#5b6472"];',
           f'  labelloc="t"; label="{q(g.title_line())}";']

    for i, phase in enumerate(g.phases):
        members = [k for k in phase.get("nodes", []) if k in g.nodes]
        if not members:
            continue
        out.append(f'  subgraph cluster_{i} {{')
        out.append(f'    label="{q(phase.get("label", ""))}"; style="rounded,dashed"; color="#b9c0ca"; fontsize=10;')
        for key in members:
            node = g.nodes[key]
            shape = 'shape=box, style="rounded,dashed,filled"' if node.kind == "context" else "shape=box"
            out.append(f'    "{key}" [label="{lbl(node)}", {shape}];')
        out.append("  }")

    for key, node in g.nodes.items():
        if node.kind == "outcome" or g.phase_of(key):
            continue
        out.append(f'  "{key}" [label="{lbl(node)}"];')
    for node in g.outcome_nodes():
        ink, fill = g.colors(node)
        out.append(f'  "{node.key}" [label="{lbl(node)}", shape=box3d, fillcolor="{fill}", color="{ink}", penwidth=2];')

    for e in g.edges:
        attrs = {"answer": 'style=solid', "unsure": 'style=dashed',
                 "engine": 'style=dotted, color="#1d4ed8", penwidth=1.8',
                 "crosslink": 'style=dotted, color="#1d4ed8", constraint=false'}[e.style]
        out.append(f'  "{e.src}" -> "{e.dst}" [label="{q(e.label)}", {attrs}];')
    out.append("}")
    return "\n".join(out) + "\n"


# ---------------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--wording", choices=["plain", "legal"], default="plain",
                    help="plain: the questions as the tool asks them (default). "
                         "legal: the regulation's own wording from node.legalText.")
    ap.add_argument("--lang", default="", help='language suffix, e.g. "nl" for decision-tree.nl.json')
    ap.add_argument("--formats", nargs="+", choices=["svg", "mermaid", "dot", "all"], default=["all"])
    ap.add_argument("--out", default="diagram", help="output folder (default: diagram)")
    ap.add_argument("--check", action="store_true", help="validate the JSON and write nothing")
    args = ap.parse_args()

    suffix = f".{args.lang}" if args.lang else ""
    tree_path = HERE / f"decision-tree{suffix}.json"
    ui_path = HERE / f"ui{suffix}.json"
    for path in (tree_path, ui_path):
        if not path.exists():
            print(f"error: {path.name} not found", file=sys.stderr)
            return 2

    tree = json.loads(tree_path.read_text(encoding="utf-8"))
    ui = json.loads(ui_path.read_text(encoding="utf-8"))
    g = Graph(tree, ui, args.wording)

    for problem in g.problems:
        print(f"  ! {problem}", file=sys.stderr)
    unknown_colors = sorted({n.color for n in g.nodes.values()
                             if n.color and n.color not in PALETTE})
    for c in unknown_colors:
        print(f'  ! outcome colour "{c}" is not in the palette; drawn grey', file=sys.stderr)

    if args.check:
        print(f'{tree_path.name}: {len(g.nodes)} boxes, {len(g.edges)} arrows, '
              f'{len(g.problems)} problem(s)')
        return 1 if g.problems else 0

    formats = {"svg", "mermaid", "dot"} if "all" in args.formats else set(args.formats)
    out_dir = HERE / args.out
    out_dir.mkdir(exist_ok=True)
    written = []

    if "svg" in formats:
        p = out_dir / "decision-tree.svg"
        p.write_text(emit_svg(g), encoding="utf-8")
        written.append(p)
    if "mermaid" in formats:
        mmd = emit_mermaid(g)
        p1 = out_dir / "decision-tree.mmd"
        p1.write_text(mmd, encoding="utf-8")
        p2 = out_dir / "decision-tree.md"
        p2.write_text(emit_markdown(g, mmd), encoding="utf-8")
        written += [p1, p2]
    if "dot" in formats:
        p = out_dir / "decision-tree.dot"
        p.write_text(emit_dot(g), encoding="utf-8")
        written.append(p)
        dot_exe = shutil.which("dot")
        if dot_exe:
            for fmt in ("svg", "png"):
                target = out_dir / f"decision-tree.graphviz.{fmt}"
                try:
                    subprocess.run([dot_exe, f"-T{fmt}", str(p), "-o", str(target)], check=True)
                    written.append(target)
                except subprocess.CalledProcessError as exc:
                    print(f"  ! graphviz failed for {fmt}: {exc}", file=sys.stderr)
        else:
            print("  i graphviz 'dot' not installed — wrote the .dot source only "
                  "(the .svg and the Mermaid .md need no tools)", file=sys.stderr)

    questions = sum(1 for n in g.nodes.values() if n.kind in ("question", "context"))
    outcomes = sum(1 for n in g.nodes.values() if n.kind == "outcome")
    print(f'{tree.get("meta", {}).get("title", "decision tree")} v{tree.get("meta", {}).get("version", "?")} '
          f'· {args.wording} wording · {questions} questions, {outcomes} result cards, {len(g.edges)} arrows')
    for p in written:
        print(f"  wrote {p.relative_to(HERE)}")
    return 1 if g.problems else 0


if __name__ == "__main__":
    sys.exit(main())
