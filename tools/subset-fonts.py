#!/usr/bin/env python3
"""Subset and compress the site's typefaces.

Usage: python3 tools/subset-fonts.py <dir-with-source-ttfs> src/fonts
Requires: pip install fonttools brotli

Sources (all SIL Open Font License 1.1), from https://github.com/google/fonts/tree/main/ofl:
  fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf            -> Fraunces.ttf
  fraunces/Fraunces-Italic[SOFT,WONK,opsz,wght].ttf     -> Fraunces-Italic.ttf
  atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext[wght].ttf         -> AHN.ttf
  atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext-Italic[wght].ttf  -> AHN-Italic.ttf
  atkinsonhyperlegiblemono/AtkinsonHyperlegibleMono[wght].ttf         -> AHM.ttf
"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options
from fontTools.varLib import instancer

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

# Basic Latin, Latin-1, Latin Extended-A (names such as Zieliński, Ó Caoimh),
# typographic punctuation, a few arrows and symbols used in the interface.
PUNCT = [0x2009, 0x200A, 0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2018, 0x2019, 0x201A,
     0x201C, 0x201D, 0x201E, 0x2022, 0x2026, 0x2032, 0x2033, 0x2039, 0x203A, 0x2044,
     0x20AC, 0x2116, 0x2122, 0x2190, 0x2191, 0x2192, 0x2193, 0x2196, 0x2197, 0x2198,
     0x2199, 0x2212, 0x00D7, 0x2248, 0x2260, 0x2713, 0x25A0, 0x25CF, 0x25B6, 0x2605]
TEXT = list(range(0x20, 0x7F)) + list(range(0xA0, 0x180)) + PUNCT
# The display serif only sets headings, numerals and pull quotes: Latin-1 is enough.
DISPLAY = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + PUNCT

JOBS = [
    # (source, output, characters, axis limits: a number pins the axis, a (min, max) pair keeps a range)
    ("Fraunces.ttf", "fraunces.woff2", DISPLAY, {"SOFT": 0, "wght": (300, 700)}),
    ("Fraunces-Italic.ttf", "fraunces-italic.woff2", DISPLAY, {"SOFT": 0, "wght": (300, 600)}),
    ("AHN.ttf", "atkinson-next.woff2", TEXT, {"wght": (400, 700)}),
    ("AHN-Italic.ttf", "atkinson-next-italic.woff2", TEXT, {"wght": (400, 700)}),
    ("AHM.ttf", "atkinson-mono.woff2", TEXT, {"wght": (400, 700)}),
]

for source, target, unicodes, limits in JOBS:
    font = TTFont(src / source)
    opts = Options()
    opts.layout_features = ["kern", "liga", "clig", "calt", "ccmp", "locl", "mark", "mkmk",
                            "onum", "lnum", "tnum", "pnum", "frac", "sups", "case", "ss01", "rvrn"]
    opts.name_IDs = [1, 2, 3, 4, 6, 13, 14]
    opts.notdef_outline = True
    opts.drop_tables += ["DSIG"]
    sub = Subsetter(opts)
    sub.populate(unicodes=unicodes)
    sub.subset(font)
    # Subset first, then narrow the variation axes.
    font = instancer.instantiateVariableFont(font, limits)
    font.flavor = "woff2"
    font.save(out / target)
    print(f"{target}: {(out / target).stat().st_size / 1024:.1f} KB")
