#!/usr/bin/env python3
"""Inspect Macroscopic Life Book One 6x9 structural proof v0.2 and enforce anchor-aware QA."""
from pathlib import Path
import json
import re
import unicodedata
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / 'production' / 'proofs' / 'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.2.pdf'
ANCHORS = ROOT / 'production' / 'proofs' / 'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.2-ANCHORS.json'
OUT = ROOT / 'production' / 'proofs' / 'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.2-INSPECTION.txt'


def norm(s):
    s = unicodedata.normalize('NFKC', s or '')
    s = s.replace('—', '-').replace('–', '-').replace('−', '-')
    s = s.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def probes(anchor):
    a = norm(anchor)
    if len(a) <= 100:
        return [a]
    # Use both ends so line wrapping or an extracted footnote marker cannot destroy the only probe.
    return [a[:100].strip(), a[-100:].strip()]


meta = json.loads(ANCHORS.read_text(encoding='utf-8'))
r = PdfReader(str(PDF))
page_text = {}
raw_page_text = {}
lines = []
failures = []
chapter_pages = {}
figure_pages = {}
part_pages = []
blank = []
density = []

lines.append('MACROSCOPIC LIFE BOOK ONE — 6x9 STRUCTURAL PROOF v0.2 INSPECTION')
lines.append(f'pages={len(r.pages)}')

for i, p in enumerate(r.pages, start=1):
    mb = p.mediabox
    w = float(mb.width) / 72
    h = float(mb.height) / 72
    raw = (p.extract_text() or '').strip()
    text = norm(raw)
    raw_page_text[i] = raw
    page_text[i] = text
    chars = len(text)
    density.append((i, chars))
    if chars < 8:
        blank.append(i)
    for m in re.finditer(r'CHAPTER\s+(\d+)\b', text, re.I):
        chapter_pages.setdefault(int(m.group(1)), i)
    for m in re.finditer(r'FIGURE\s+(\d+)\s+-\s+APPROVED POSITION', text, re.I):
        figure_pages.setdefault(f'{int(m.group(1)):02d}', []).append(i)
    for m in re.finditer(r'PART\s+([IVX]+)\b', text):
        part_pages.append((m.group(1), i))
    if abs(w - 6) > 0.01 or abs(h - 9) > 0.01:
        failures.append(f'P0 page_size_mismatch page={i} size={w:.3f}x{h:.3f}')

missing_ch = [n for n in range(1, 17) if n not in chapter_pages]
if missing_ch:
    failures.append('P0 missing_chapters=' + ','.join(map(str, missing_ch)))

expected = {str(k).zfill(2): int(v) for k, v in meta['expected_figures'].items()}
missing_fig = [f for f in sorted(expected, key=int) if f not in figure_pages]
duplicate_fig = [f for f, ps in figure_pages.items() if len(ps) != 1]
if missing_fig:
    failures.append('P1 missing_expected_figures=' + ','.join(missing_fig))
if duplicate_fig:
    failures.append('P1 duplicate_figure_slots=' + ','.join(duplicate_fig))

lines.append('chapter_starts=' + ','.join(f'{n}:{chapter_pages.get(n,"MISSING")}' for n in range(1, 17)))
lines.append('part_pages=' + ','.join(f'{n}:{p}' for n, p in part_pages))
lines.append('figure_pages=' + ','.join(f'{n}:{"/".join(map(str, ps))}' for n, ps in sorted(figure_pages.items(), key=lambda x: int(x[0]))))
lines.append('blank_or_near_blank_pages=' + (','.join(map(str, blank)) if blank else 'none'))
lines.append('missing_chapters=' + (','.join(map(str, missing_ch)) if missing_ch else 'none'))
lines.append('missing_expected_figures=' + (','.join(missing_fig) if missing_fig else 'none'))
lines.append('duplicate_figure_slots=' + (','.join(duplicate_fig) if duplicate_fig else 'none'))

# Chapter ranges are used to prove each figure stayed in its assigned chapter.
chapter_ranges = {}
for n in range(1, 17):
    start = chapter_pages.get(n)
    if start is None:
        continue
    end = chapter_pages.get(n + 1, len(r.pages) + 1) - 1
    chapter_ranges[n] = (start, end)

# Locate the actual anchor paragraph in the PDF, then require the placeholder at or after that page.
for item in meta['placements']:
    f = str(item['figure']).zfill(2)
    ch = int(item['chapter'])
    fps = figure_pages.get(f, [])
    anchor = item['anchor_text']
    anchor_page = None
    used_probe = None
    for probe in probes(anchor):
        if not probe:
            continue
        hits = [p for p, txt in page_text.items() if probe in txt]
        # Prefer the hit inside the expected chapter range.
        if ch in chapter_ranges:
            lo, hi = chapter_ranges[ch]
            hits = [p for p in hits if lo <= p <= hi]
        if hits:
            anchor_page = hits[0]
            used_probe = probe
            break
    if anchor_page is None:
        failures.append(f'P1 anchor_not_found figure={f} chapter={ch}')
        lines.append(f'anchor_gate_{f}=FAIL anchor_page=MISSING figure_page={fps[0] if fps else "MISSING"} chapter={ch} source={item["source"]}')
        continue
    if len(fps) != 1:
        lines.append(f'anchor_gate_{f}=FAIL anchor_page={anchor_page} figure_page=MISSING_OR_DUPLICATE chapter={ch} source={item["source"]}')
        continue
    fp = fps[0]
    lo, hi = chapter_ranges.get(ch, (None, None))
    same_chapter = lo is not None and lo <= fp <= hi
    after_anchor = fp >= anchor_page
    gate = same_chapter and after_anchor
    if not gate:
        failures.append(f'P1 placement_gate figure={f} anchor_page={anchor_page} figure_page={fp} expected_chapter={ch} range={lo}-{hi}')
    lines.append(f'anchor_gate_{f}={"PASS" if gate else "FAIL"} anchor_page={anchor_page} figure_page={fp} chapter={ch} source={item["source"]} probe={used_probe[:60] if used_probe else ""}')

nonblank = [x for x in density if x[1] >= 8]
lines.append('lowest_text_density_pages=' + ','.join(f'{p}:{c}' for p, c in sorted(nonblank, key=lambda x: x[1])[:20]))
lines.append('highest_text_density_pages=' + ','.join(f'{p}:{c}' for p, c in sorted(nonblank, key=lambda x: x[1], reverse=True)[:20]))

full = norm('\n'.join(raw_page_text.values()))
aperture = norm('If individuality can be reorganized across levels, what determines where a new individual can—and cannot—emerge?')
aperture_ok = aperture in full
chapter17 = bool(re.search(r'CHAPTER\s+17\b', full, re.I))
if not aperture_ok:
    failures.append('P1 protected_final_aperture_missing_from_pdf_extraction')
if chapter17:
    failures.append('P0 chapter17_present')
lines.append('final_aperture_present=' + str(aperture_ok))
lines.append('chapter17_present=' + str(chapter17))

# Deterministic tail: the last normalized 900 characters before NOTES, if extraction exposes it.
notes_pos = full.rfind(' NOTES ')
tail_source = full[:notes_pos] if notes_pos > 0 else full
lines.append('chapter16_tail=' + tail_source[-900:])

if blank:
    # Structural proof should not introduce accidental empty leaves; intentional frontmatter pages still contain text.
    failures.append('P1 blank_or_near_blank_pages=' + ','.join(map(str, blank)))

lines.append('failures=' + (' | '.join(failures) if failures else 'none'))
lines.append('overall_status=' + ('FAIL' if failures else 'PASS'))
OUT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
print('\n'.join(lines))
print(OUT)
