#!/usr/bin/env python3
"""
embed-fonts.py — inline the FARI webfonts into index.html as base64.

    python embed-fonts.py

The tool has to stay one self-contained file that also works from disk and makes no
external requests (no Google Fonts, no CDN), so the two .woff2 files from the FARI
design-system export are written into the stylesheet as data: URIs. Re-run this if the
font files change. Anton ("FARI Display") is for certificates and is not used here.
"""
from __future__ import annotations

import base64
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DS = next(HERE.glob("Exporting design systems between accounts/_ds/fari-design-system-*"), None)
START = "/* ==== FARI webfonts: base64, written by embed-fonts.py ==== */"
END = "/* ==== end FARI webfonts ==== */"

FONTS = [
    ("Montserrat", "Montserrat-latin.woff2", "100 900"),
    ("Open Sans", "OpenSans-latin.woff2", "300 800"),
]


def main() -> int:
    if DS is None:
        print("error: FARI design-system export folder not found", file=sys.stderr)
        return 2

    blocks = [START]
    for family, filename, weights in FONTS:
        path = DS / "assets" / "fonts" / filename
        if not path.exists():
            print(f"error: {path} not found", file=sys.stderr)
            return 2
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        blocks.append(
            f'@font-face{{font-family:"{family}";font-style:normal;font-weight:{weights};'
            f'font-display:swap;src:url(data:font/woff2;base64,{b64}) format("woff2");}}'
        )
        print(f"  {family}: {path.stat().st_size / 1024:.1f} KB -> {len(b64) / 1024:.1f} KB base64")
    blocks.append(END)

    html_path = HERE / "index.html"
    html = html_path.read_text(encoding="utf-8")
    if START not in html or END not in html:
        print(f"error: markers not found in index.html; add\n{START}\n{END}\nto the stylesheet",
              file=sys.stderr)
        return 2
    head, rest = html.split(START, 1)
    _, tail = rest.split(END, 1)
    html_path.write_text(head + "\n".join(blocks) + tail, encoding="utf-8")
    print(f"embedded {len(FONTS)} fonts into index.html")
    return 0


if __name__ == "__main__":
    sys.exit(main())
