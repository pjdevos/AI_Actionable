#!/usr/bin/env python3
"""
check-theme.py — verify the FARI theme against SPEC §11 and the FARI brand rules.

    python check-theme.py

Three checks, all re-runnable after any token edit (SPEC §11 asks for exactly this):

1. Contrast (WCAG 2.1 AA). For each of the seven tiers: the on-tint text colour
   against its tint must reach 4.5:1, and the accent against white 3.0:1. Also checks
   body/muted text against the page surfaces.
2. Brand rules. No emoji anywhere in the user-visible strings; no US spellings.
3. Token resolution. Every var() chain in fari-theme.css must resolve to a real value
   in the FARI token files, so the theme cannot silently fall back to nothing.

Exits non-zero if anything fails. Standard library only.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
DS = next(HERE.glob("Exporting design systems between accounts/_ds/fari-design-system-*"), None)

FAIL: list[str] = []
NOTE: list[str] = []


# ---------------------------------------------------------------- colour maths
def parse_hex(value: str) -> tuple[int, int, int] | None:
    m = re.fullmatch(r"#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})", value.strip())
    if not m:
        return None
    h = m.group(1)
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def luminance(rgb: tuple[int, int, int]) -> float:
    def channel(c: int) -> float:
        s = c / 255
        return s / 12.92 if s <= 0.04045 else ((s + 0.055) / 1.055) ** 2.4
    r, g, b = (channel(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a: str, b: str) -> float:
    ca, cb = parse_hex(a), parse_hex(b)
    if not ca or not cb:
        raise ValueError(f"not a hex colour: {a!r} / {b!r}")
    la, lb = luminance(ca), luminance(cb)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


# ------------------------------------------------------- token resolution
def collect_vars(*paths: Path) -> dict[str, str]:
    """Every --name: value pair in the given CSS files, later files winning."""
    out: dict[str, str] = {}
    for path in paths:
        if not path or not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
        for name, value in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", text):
            out[name] = value.strip()
    return out


def resolve(name: str, table: dict[str, str], seen: set[str] | None = None) -> str | None:
    """Follow a var() chain down to a literal value."""
    seen = seen or set()
    if name in seen or name not in table:
        return None
    seen.add(name)
    value = table[name]
    m = re.fullmatch(r"var\(\s*(--[\w-]+)\s*\)", value)
    if m:
        return resolve(m.group(1), table, seen)
    return value


def main() -> int:
    if DS is None:
        print("error: the FARI design-system export folder was not found", file=sys.stderr)
        return 2

    tokens = DS / "tokens"
    table = collect_vars(
        tokens / "colors.css", tokens / "typography.css", tokens / "spacing.css",
        tokens / "base.css", HERE / "fari-theme.css",
    )

    # ---- 1. contrast -----------------------------------------------------
    print("Contrast (WCAG 2.1 AA)")
    white = "#FFFFFF"
    tiers = ["grey", "red", "amber", "gold", "green", "blue", "purple"]
    for tier in tiers:
        fg = resolve(f"--tier-{tier}-fg", table)
        bg = resolve(f"--tier-{tier}-bg", table)
        accent = resolve(f"--tier-{tier}-accent", table)
        if not all((fg, bg, accent)):
            FAIL.append(f"tier {tier}: a --tier-{tier}-* variable does not resolve")
            continue
        on_tint = contrast(fg, bg)
        on_white = contrast(accent, white)
        ok_tint = on_tint >= 4.5
        ok_accent = on_white >= 3.0
        flag = "ok " if ok_tint and ok_accent else "FAIL"
        print(f"  {flag} {tier:<7} text-on-tint {on_tint:5.2f}:1   accent-on-white {on_white:5.2f}:1"
              f"{'   (also passes 4.5 as text)' if on_white >= 4.5 else ''}")
        if not ok_tint:
            FAIL.append(f"tier {tier}: text on its tint is {on_tint:.2f}:1, needs 4.5:1")
        if not ok_accent:
            FAIL.append(f"tier {tier}: accent on white is {on_white:.2f}:1, needs 3.0:1")

    print("\nBody text")
    for label, fg_name, bg_name, need in [
        ("body on page", "--text-body", "--surface-subtle", 4.5),
        ("body on card", "--text-body", "--surface-card", 4.5),
        ("muted on page", "--text-muted", "--surface-subtle", 4.5),
        ("muted on card", "--text-muted", "--surface-card", 4.5),
        ("link on card", "--text-link", "--surface-card", 4.5),
        ("white on primary button", "--text-on-brand", "--action-primary", 4.5),
        ("white on hover button", "--text-on-brand", "--action-primary-hover", 4.5),
    ]:
        fg, bg = resolve(fg_name, table), resolve(bg_name, table)
        if not fg or not bg:
            FAIL.append(f"{label}: {fg_name} or {bg_name} does not resolve")
            continue
        ratio = contrast(fg, bg)
        print(f"  {'ok ' if ratio >= need else 'FAIL'} {label:<26} {ratio:5.2f}:1")
        if ratio < need:
            FAIL.append(f"{label}: {ratio:.2f}:1, needs {need}:1")

    # ---- 2. brand rules --------------------------------------------------
    print("\nBrand rules")
    strings: list[tuple[str, str]] = []
    for name in ("ui.json", "decision-tree.json"):
        path = HERE / name
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))

        def walk(node, trail):
            if isinstance(node, dict):
                for k, v in node.items():
                    if k.startswith("_"):
                        continue
                    walk(v, f"{trail}.{k}")
            elif isinstance(node, list):
                for i, v in enumerate(node):
                    walk(v, f"{trail}[{i}]")
            elif isinstance(node, str):
                strings.append((f"{name}{trail}", node))
        walk(data, "")

    emoji = []
    for where, text in strings:
        for ch in text:
            if ch in "‘’“”–—…· ":
                continue
            if unicodedata.category(ch) == "So" or ord(ch) > 0x2500:
                emoji.append(f"{where}: {ch!r} (U+{ord(ch):04X})")
    print(f"  {'ok ' if not emoji else 'FAIL'} no emoji or pictographs in {len(strings)} strings")
    for e in emoji[:8]:
        FAIL.append(f"emoji/pictograph: {e}")

    us_uk = {
        r"\borgani[sz]ation": "organisation", r"\bcategoriz": "categoris",
        r"\bprioritiz": "prioritis", r"\brecogniz": "recognis", r"\bcustomiz": "customis",
        r"\banalyz": "analys", r"\bbehavior\b": "behaviour", r"\bcolor\b": "colour",
        r"\blicense\b": "licence (noun)", r"\bfulfill\b": "fulfil", r"\bprogram\b": "programme",
    }
    spelling = []
    for where, text in strings:
        for pattern, better in us_uk.items():
            for m in re.finditer(pattern, text, re.I):
                if pattern == r"\borgani[sz]ation" and "organis" in m.group(0).lower():
                    continue
                if pattern == r"\bcolor\b" and where.startswith("decision-tree.json"):
                    continue          # outcomes[].color is a data key, not prose
                spelling.append(f"{where}: “{m.group(0)}” -> {better}")
    print(f"  {'ok ' if not spelling else 'FAIL'} British/European spelling")
    for s in spelling[:10]:
        FAIL.append(f"spelling: {s}")

    # ---- 3. the theme resolves against the real tokens -------------------
    print("\nToken resolution")
    theme_text = (HERE / "fari-theme.css").read_text(encoding="utf-8")
    theme_text = re.sub(r"/\*.*?\*/", "", theme_text, flags=re.S)
    referenced = set(re.findall(r"var\(\s*(--[\w-]+)", theme_text))
    defined_in_theme = set(re.findall(r"(--[\w-]+)\s*:", theme_text))
    ds_table = collect_vars(tokens / "colors.css", tokens / "typography.css",
                            tokens / "spacing.css", tokens / "base.css")
    missing = sorted(v for v in referenced
                     if v not in defined_in_theme and v not in ds_table)
    print(f"  {'ok ' if not missing else 'FAIL'} {len(referenced)} var() references resolve")
    for v in missing:
        FAIL.append(f"fari-theme.css references {v}, which no FARI token defines")

    # ---- verdict ---------------------------------------------------------
    print("\n" + "-" * 62)
    for n in NOTE:
        print(f"note: {n}")
    if FAIL:
        print(f"{len(FAIL)} problem(s):")
        for f in FAIL:
            print(f"  - {f}")
        return 1
    print("all theme checks pass")
    return 0


if __name__ == "__main__":
    sys.exit(main())
