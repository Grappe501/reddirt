#!/usr/bin/env python3
"""Production Pass 05: deterministic visual-risk audit for Book One proof v0.2.

This does not pretend to replace human page/spread inspection. It creates a complete
180-page ledger and a prioritized suspicion queue from PDF geometry/text extraction,
then marks every page PENDING_VISUAL until inspected from rendered page images.
"""
from pathlib import Path
import csv, json, re
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PROOFS = ROOT / 'production' / 'proofs'
PDF = PROOFS / 'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.2.pdf'
OUT_CSV = PROOFS / 'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.2-VISUAL-DEFECT-LEDGER.csv'
OUT_JSON = PROOFS / 'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.2-VISUAL-AUDIT.json'
OUT_MD = PROOFS / 'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.2-VISUAL-AUDIT.md'

CHAPTER_STARTS = {1:6,2:15,3:23,4:29,5:36,6:43,7:53,8:64,9:76,10:87,11:100,12:110,13:124,14:135,15:145,16:155}
FIGURES = {'02':8,'03':9,'04':14,'05':18,'06':25,'07':29,'08':37,'09':43,'10':68,'11':85,'12':91,'13':109,'14':113,'15':153,'16':165}
KNOWN_PART_PAGES = {5,21,22,35,51,52,99,123,173}


def chapter_for(page):
    active = None
    for ch, start in sorted(CHAPTER_STARTS.items(), key=lambda x:x[1]):
        if page >= start: active = ch
    return active


def spread_for(page):
    # physical PDF pair label; page 1 is its own cover/title leaf, then 2-3, 4-5...
    if page == 1: return '1'
    left = page if page % 2 == 0 else page - 1
    return f'{left}-{left+1}'

r = PdfReader(str(PDF))
if len(r.pages) != 180:
    raise SystemExit(f'P0 expected 180 pages, found {len(r.pages)}')

pages=[]
for n,p in enumerate(r.pages,1):
    raw=(p.extract_text() or '').strip()
    text=re.sub(r'\s+',' ',raw).strip()
    chars=len(text)
    lines=[x.strip() for x in raw.splitlines() if x.strip()]
    w=float(p.mediabox.width)/72; h=float(p.mediabox.height)/72
    roles=[]; risks=[]
    if n in CHAPTER_STARTS.values(): roles.append('chapter_open')
    if n in KNOWN_PART_PAGES: roles.append('part_candidate')
    figs=[f for f,pg in FIGURES.items() if pg==n]
    if figs: roles.append('figure_' + '_'.join(figs))
    if n in {1,2,3,4,5}: roles.append('frontmatter')
    if n >= 166: roles.append('chapter16_tail_or_backmatter')
    if abs(w-6)>.01 or abs(h-9)>.01: risks.append('P0_GEOMETRY')
    if chars < 8: risks.append('P1_BLANK')
    elif chars < 300 and not any(x in roles for x in ('chapter_open','frontmatter','part_candidate')) and not figs:
        risks.append('P2_SPARSE_UNCLASSIFIED')
    if chars > 2000: risks.append('P2_HIGH_DENSITY')
    if lines:
        # extraction heuristics only: short first/last body-looking lines are visual-review triggers, not convictions.
        first=lines[0]; last=lines[-1]
        if 1 <= len(first.split()) <= 4 and not re.search(r'^(CHAPTER|PART|FIGURE|MACROSCOPIC|Book One|Copyright|STRUCTURAL)', first, re.I):
            risks.append('REVIEW_SHORT_TOP_LINE')
        if 1 <= len(last.split()) <= 4 and not re.fullmatch(r'\d+',last):
            risks.append('REVIEW_SHORT_BOTTOM_LINE')
    # headings exposed by extraction; rendered inspection decides whether stranded.
    headingish=[x for x in lines if len(x)<70 and (x.isupper() or re.match(r'^(CHAPTER|PART)\b',x,re.I))]
    if headingish: roles.append('heading_text_present')
    pages.append({'page':n,'spread':spread_for(n),'chapter':chapter_for(n),'chars':chars,'lines':len(lines),'width_in':round(w,3),'height_in':round(h,3),'roles':roles,'risks':sorted(set(risks)),'status':'PENDING_VISUAL'})

# Density rank is more useful than one arbitrary threshold.
nonblank=[p for p in pages if p['chars']>=8]
low=sorted(nonblank,key=lambda x:x['chars'])[:20]
high=sorted(nonblank,key=lambda x:x['chars'],reverse=True)[:20]
for p in low: p['risks']=sorted(set(p['risks']+['REVIEW_LOW_DENSITY_TOP20']))
for p in high: p['risks']=sorted(set(p['risks']+['REVIEW_HIGH_DENSITY_TOP20']))

# Spread suspicion: two dense pages together or strong density discontinuity.
spread_map={}
for p in pages: spread_map.setdefault(p['spread'],[]).append(p)
spread_risks=[]
for s,ps in spread_map.items():
    if len(ps)==2:
        a,b=ps
        flags=[]
        if a['chars']>1900 and b['chars']>1900: flags.append('WALL_OF_GRAY_CANDIDATE')
        if abs(a['chars']-b['chars'])>1500: flags.append('DENSITY_DISCONTINUITY')
        if flags: spread_risks.append({'spread':s,'pages':[a['page'],b['page']],'risks':flags,'status':'PENDING_VISUAL'})

with OUT_CSV.open('w',newline='',encoding='utf-8') as f:
    fields=['page','spread','chapter','element','severity','defect','proposed_production_repair','structural_freeze_risk','status']
    w=csv.DictWriter(f,fieldnames=fields); w.writeheader()
    for p in pages:
        w.writerow({'page':p['page'],'spread':p['spread'],'chapter':p['chapter'] or 'front/back','element':';'.join(p['roles']) or 'body','severity':'REVIEW' if p['risks'] else 'NONE','defect':';'.join(p['risks']) or 'none detected deterministically','proposed_production_repair':'PENDING VISUAL INSPECTION','structural_freeze_risk':'DO NOT EDIT FROZEN PROSE OR MOVE FIGURE BEFORE ANCHOR','status':'PENDING_VISUAL'})

data={'proof':str(PDF.relative_to(ROOT)),'pages':pages,'spread_risks':spread_risks,'chapter_openings':{str(k):{'page':v,'status':'PENDING_VISUAL'} for k,v in CHAPTER_STARTS.items()},'figures':{k:{'page':v,'status':'PENDING_VISUAL'} for k,v in FIGURES.items()},'summary':{'page_count':len(pages),'pages_with_deterministic_risk':sum(bool(p['risks']) for p in pages),'spreads_with_deterministic_risk':len(spread_risks),'visual_pages_approved':0,'visual_pages_pending':180,'p0_confirmed':0,'p1_confirmed':0,'overall_status':'PENDING_VISUAL_REVIEW'}}
OUT_JSON.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')

sus=[p for p in pages if p['risks']]
md=['# BOOK ONE 6×9 PROOF v0.2 — PASS 05 VISUAL AUDIT QUEUE','',f'Pages: **{len(pages)}**',f'Pages flagged for prioritized visual review: **{len(sus)}**',f'Spreads flagged: **{len(spread_risks)}**','','## Important','', 'This deterministic pass is a suspicion generator, not visual approval. Every page remains `PENDING_VISUAL` until rendered-page/spread inspection. It must not infer typography quality from extracted text alone.','','## Priority pages','']
for p in sorted(sus,key=lambda x:(0 if any(r.startswith('P0') or r.startswith('P1') for r in x['risks']) else 1,x['page'])):
    md.append(f"- p{p['page']} / spread {p['spread']} / ch {p['chapter'] or '-'} — {', '.join(p['risks'])}")
md += ['', '## Chapter openings', '', ', '.join(f'Ch {c}: p{p}' for c,p in CHAPTER_STARTS.items()), '', '## Figure pages', '', ', '.join(f'Fig {f}: p{p}' for f,p in FIGURES.items()), '', '## Status', '', '**PENDING VISUAL REVIEW — 0/180 pages visually approved.**', '']
OUT_MD.write_text('\n'.join(md),encoding='utf-8')
print(json.dumps(data['summary'],indent=2))
print(OUT_CSV); print(OUT_JSON); print(OUT_MD)
