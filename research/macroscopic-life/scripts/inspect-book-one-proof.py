#!/usr/bin/env python3
"""Inspect the generated 6x9 structural proof and emit deterministic QA text."""
from pathlib import Path
import re
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'production'/'proofs'/'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.1.pdf'
OUT=ROOT/'production'/'proofs'/'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.1-INSPECTION.txt'

r=PdfReader(str(PDF))
lines=[]
lines.append('MACROSCOPIC LIFE BOOK ONE — 6x9 STRUCTURAL PROOF v0.1 INSPECTION')
lines.append(f'pages={len(r.pages)}')
chapter_pages={}
figure_pages={}
part_pages=[]
blank=[]
density=[]
for i,p in enumerate(r.pages, start=1):
    mb=p.mediabox
    w=float(mb.width)/72; h=float(mb.height)/72
    text=(p.extract_text() or '').strip()
    chars=len(text)
    density.append((i,chars))
    if chars < 8: blank.append(i)
    for m in re.finditer(r'CHAPTER\s+(\d+)\b',text,re.I):
        n=int(m.group(1)); chapter_pages.setdefault(n,i)
    for m in re.finditer(r'FIGURE\s+(\d+)\s+-\s+APPROVED POSITION',text,re.I):
        figure_pages.setdefault(m.group(1),[]).append(i)
    for m in re.finditer(r'PART\s+([IVX]+)\b',text): part_pages.append((m.group(1),i))
    if abs(w-6)>0.01 or abs(h-9)>0.01:
        lines.append(f'P0 page_size_mismatch page={i} size={w:.3f}x{h:.3f}')
lines.append('chapter_starts='+','.join(f'{n}:{chapter_pages.get(n,"MISSING")}' for n in range(1,17)))
lines.append('part_pages='+','.join(f'{n}:{p}' for n,p in part_pages))
lines.append('figure_pages='+','.join(f'{n}:{"/".join(map(str,ps))}' for n,ps in sorted(figure_pages.items(), key=lambda x:int(x[0]))))
lines.append('blank_or_near_blank_pages='+(','.join(map(str,blank)) if blank else 'none'))
missing_ch=[n for n in range(1,17) if n not in chapter_pages]
missing_fig=[f'{n:02d}' for n in range(2,17) if n not in (7,13,14) and f'{n:02d}' not in figure_pages]
lines.append('missing_chapters='+(','.join(map(str,missing_ch)) if missing_ch else 'none'))
lines.append('missing_expected_figures='+(','.join(missing_fig) if missing_fig else 'none'))
# lowest text-density nonblank pages are useful hostile-review targets
nonblank=[x for x in density if x[1]>=8]
lines.append('lowest_text_density_pages='+','.join(f'{p}:{c}' for p,c in sorted(nonblank,key=lambda x:x[1])[:20]))
lines.append('highest_text_density_pages='+','.join(f'{p}:{c}' for p,c in sorted(nonblank,key=lambda x:x[1],reverse=True)[:20]))
# check exact final aperture appears somewhere in final chapter pages
full='\n'.join((p.extract_text() or '') for p in r.pages)
aperture='If individuality can be reorganized across levels, what determines where a new individual can—and cannot—emerge?'
lines.append('final_aperture_present='+str(aperture in full))
lines.append('chapter17_present='+str(bool(re.search(r'CHAPTER\s+17\b',full,re.I))))
OUT.write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(OUT)
