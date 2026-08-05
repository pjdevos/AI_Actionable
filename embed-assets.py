#!/usr/bin/env python3
"""
embed-assets.py — inline the FARI binary assets into index.html as base64.

    python embed-assets.py

The tool has to stay one self-contained file that also works from disk and makes no
external requests, so both the webfonts and the two attribution logos are written into
index.html as data: URIs.

Fonts come from the design-system export. Logos are not in that export: put
fari-logo-color.png and vub-ulb-logo.png next to this script (from the FARI
communication kit) and re-run. The source files stay full-resolution in the repo; the
copies written into index.html are scaled to twice their display height, which is all a
40px-tall logo needs and turns ~430 KB of PNG into a few KB.

The logos are embedded as <img src> rather than CSS background-image on purpose: print
dialogs routinely drop background graphics, and the ERDF attribution has to survive
being printed to PDF.

Anton ("FARI Display") is for certificates and is not used here.
"""
from __future__ import annotations

import base64
import io
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DS = next(HERE.glob("Exporting design systems between accounts/_ds/fari-design-system-*"), None)

FONT_START = "/* ==== FARI webfonts: base64, written by embed-assets.py ==== */"
FONT_END = "/* ==== end FARI webfonts ==== */"
LEGACY_FONT_START = "/* ==== FARI webfonts: base64, written by embed-fonts.py ==== */"

FONTS = [
    ("Montserrat", "Montserrat-latin.woff2", "100 900"),
    ("Open Sans", "OpenSans-latin.woff2", "300 800"),
]
# element id in index.html -> source file. Display height is 40px; embed at 2x.
LOGOS = [("logo-fari", "fari-logo-color.png"), ("logo-vubulb", "vub-ulb-logo.png")]
LOGO_HEIGHT = 80


def embed_fonts(html: str) -> str:
    if DS is None:
        raise SystemExit("error: FARI design-system export folder not found")
    blocks = [FONT_START]
    for family, filename, weights in FONTS:
        path = DS / "assets" / "fonts" / filename
        if not path.exists():
            raise SystemExit(f"error: {path} not found")
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        blocks.append(
            f'@font-face{{font-family:"{family}";font-style:normal;font-weight:{weights};'
            f'font-display:swap;src:url(data:font/woff2;base64,{b64}) format("woff2");}}'
        )
        print(f"  font {family}: {path.stat().st_size / 1024:.1f} KB -> {len(b64) / 1024:.1f} KB base64")
    blocks.append(FONT_END)

    start_marker = FONT_START if FONT_START in html else LEGACY_FONT_START
    if start_marker not in html or FONT_END not in html:
        raise SystemExit("error: font markers not found in index.html")
    head, rest = html.split(start_marker, 1)
    _, tail = rest.split(FONT_END, 1)
    return head + "\n".join(blocks) + tail


def embed_logos(html: str) -> str:
    from PIL import Image

    for element_id, filename in LOGOS:
        path = HERE / filename
        if not path.exists():
            print(f"  logo {filename}: not present, left as a plain file reference")
            continue
        with Image.open(path) as img:
            img = img.convert("RGBA")
            width = round(img.width * LOGO_HEIGHT / img.height)
            small = img.resize((width, LOGO_HEIGHT), Image.LANCZOS)
            buf = io.BytesIO()
            small.save(buf, format="PNG", optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        print(f"  logo {filename}: {path.stat().st_size / 1024:.0f} KB "
              f"({img.width}x{img.height}) -> {len(b64) / 1024:.1f} KB base64 ({width}x{LOGO_HEIGHT})")

        # replace whatever src the tagged <img> currently has
        pattern = re.compile(rf'(<img id="{element_id}"[^>]*?\ssrc=")[^"]*(")')
        html, count = pattern.subn(rf'\g<1>data:image/png;base64,{b64}\g<2>', html, count=1)
        if not count:
            raise SystemExit(f'error: <img id="{element_id}" ... src="..."> not found in index.html')
    return html


def main() -> int:
    html_path = HERE / "index.html"
    html = html_path.read_text(encoding="utf-8")
    html = embed_fonts(html)
    html = embed_logos(html)
    html_path.write_text(html, encoding="utf-8")
    size = html_path.stat().st_size / 1024
    print(f"index.html is now {size:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
