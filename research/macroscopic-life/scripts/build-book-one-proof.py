#!/usr/bin/env python3
"""Build the first 6x9 structural PDF proof for Macroscopic Life Book One.

Production compositor only. It reads frozen Reader v0.4 and emits a structural
print proof. Final figure binaries are not yet repository assets, so approved
figure positions remain labelled placeholders rather than invented artwork.
"""
from pathlib import Path
import re
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import black
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, HRFlowable

ROOT=Path(__file__).resolve().parents[1]
READER=ROOT/'manuscript'/'BOOK-ONE-READER-MATERIALIZED-v0.4.md'
OUTDIR=ROOT/'production'/'proofs'
OUT=OUTDIR/'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.1.pdf'
PARTS={1:('PART I','THE OBSERVER','Before we can ask what reality contains, we have to understand the limits of the instrument doing the asking.'),3:('PART II','THE WHOLE','Before a system can possess a property, we must know what system we are talking about.'),5:('PART III','THE TEST','A larger-scale explanation matters only if it can do scientific work - and survive the alternatives.'),7:('PART IV','THE FUNCTIONS','The familiar verbs of life become dangerous when resemblance is mistaken for evidence.'),11:('PART V','THE INDIVIDUAL','A process can happen inside a system before the system itself owns the process.'),13:('PART VI','THE LINEAGE','An individual becomes an evolutionary question only when descent, inheritance, and differential success can be tested at its level.')}
FIGS={1:['02','03','04'],2:['05'],3:['06'],4:['07'],5:['08'],6:['09'],8:['10'],9:['11'],10:['12'],11:['13'],12:['14'],15:['15'],16:['16']}

def esc(s): return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def inline(s):
    s=esc(s.strip()); s=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s); s=re.sub(r'\*(.+?)\*',r'<i>\1</i>',s); s=re.sub(r'`(.+?)`',r'<font name="Courier">\1</font>',s); return s

def parse_reader(text):
    """Reader v0.4 uses `## Chapter N — Title`; tolerate legacy split headings too."""
    lines=text.splitlines(); chapters=[]; notes=[]; current=None; in_notes=False
    for line in lines:
        stripped=line.strip()
        if re.match(r'^#{1,2}\s+NOTES\s*$',stripped,re.I): in_notes=True; current=None; continue
        if not in_notes:
            m=re.match(r'^##\s+Chapter\s+(\d+)\s+[—-]\s+(.+?)\s*$',stripped,re.I)
            if m:
                current={'n':int(m.group(1)),'title':m.group(2).strip(),'lines':[]}; chapters.append(current); continue
            m=re.match(r'^#\s+CHAPTER\s+(\d+)\s*$',stripped,re.I)
            if m:
                current={'n':int(m.group(1)),'title':'','lines':[]}; chapters.append(current); continue
        if current is not None:
            if not current['title'] and line.startswith('## '): current['title']=line[3:].strip(); continue
            current['lines'].append(line)
        elif in_notes: notes.append(line)
    return chapters,notes

def add_markdown(story,lines,styles):
    para=[]
    def flush():
        nonlocal para
        if para:
            txt=' '.join(x.strip() for x in para if x.strip())
            if txt: story.append(Paragraph(inline(txt),styles['Body']))
            para=[]
    for raw in lines:
        line=raw.rstrip()
        if not line.strip(): flush(); continue
        if line.startswith('### '): flush(); story.append(Paragraph(inline(line[4:]),styles['H3'])); continue
        if line.startswith('## '): flush(); story.append(Paragraph(inline(line[3:]),styles['H2'])); continue
        if line.startswith('> '): flush(); story.append(Paragraph(inline(line[2:]),styles['Quote'])); continue
        if re.match(r'^[-*] ',line): flush(); story.append(Paragraph('• '+inline(line[2:]),styles['Bullet'])); continue
        para.append(line)
    flush()

def figure_box(num,styles):
    return KeepTogether([Spacer(1,8),HRFlowable(width='100%',thickness=.6,color=black),Spacer(1,8),Paragraph(f'<b>FIGURE {num} - APPROVED POSITION</b>',styles['Fig']),Paragraph('Structural proof placeholder. Insert only the frozen publication-authority visual at final composition; do not invent or substitute artwork.',styles['FigSmall']),Spacer(1,8),HRFlowable(width='100%',thickness=.6,color=black),Spacer(1,8)])

def footer(canvas,doc):
    canvas.saveState(); page=canvas.getPageNumber()
    if page>1: canvas.setFont('Helvetica',8); canvas.drawCentredString(3*inch,.43*inch,str(page-1))
    canvas.restoreState()

def main():
    if not READER.exists(): raise SystemExit(f'Missing frozen reader: {READER}')
    text=READER.read_text(encoding='utf-8'); chapters,notes=parse_reader(text)
    nums=[c['n'] for c in chapters]
    if nums!=list(range(1,17)): raise SystemExit(f'Reader must contain exactly Chapters 1-16; parsed {nums}')
    if chapters[3]['title'].upper()!='THE VERB' or chapters[10]['title'].upper()!='THE CHOICE': raise SystemExit('Title lock failed')
    if re.search(r'(^|\n)#{1,2}\s+CHAPTER\s+17\b',text,re.I): raise SystemExit('Chapter 17 prohibited')
    styles=getSampleStyleSheet()
    styles.add(ParagraphStyle(name='TitleX',parent=styles['Title'],fontName='Helvetica-Bold',fontSize=26,leading=30,alignment=TA_CENTER,spaceAfter=18)); styles.add(ParagraphStyle(name='SubTitle',parent=styles['Normal'],fontName='Helvetica',fontSize=12,leading=17,alignment=TA_CENTER,spaceAfter=14)); styles.add(ParagraphStyle(name='Part',parent=styles['Title'],fontName='Helvetica-Bold',fontSize=22,leading=26,alignment=TA_CENTER,spaceAfter=14)); styles.add(ParagraphStyle(name='ChapNum',parent=styles['Normal'],fontName='Helvetica',fontSize=10,leading=12,alignment=TA_CENTER,spaceAfter=10)); styles.add(ParagraphStyle(name='ChapTitle',parent=styles['Title'],fontName='Helvetica-Bold',fontSize=22,leading=27,alignment=TA_CENTER,spaceAfter=34)); styles.add(ParagraphStyle(name='Body',parent=styles['BodyText'],fontName='Times-Roman',fontSize=10.7,leading=14.6,alignment=TA_LEFT,firstLineIndent=15,spaceAfter=1.5)); styles.add(ParagraphStyle(name='H2',parent=styles['Heading2'],fontName='Helvetica-Bold',fontSize=14,leading=17,spaceBefore=18,spaceAfter=8,keepWithNext=True)); styles.add(ParagraphStyle(name='H3',parent=styles['Heading3'],fontName='Helvetica-Bold',fontSize=11.5,leading=14,spaceBefore=13,spaceAfter=6,keepWithNext=True)); styles.add(ParagraphStyle(name='Quote',parent=styles['Body'],fontName='Times-Italic',fontSize=10.5,leading=14.5,leftIndent=18,rightIndent=18,firstLineIndent=0,spaceBefore=7,spaceAfter=7)); styles.add(ParagraphStyle(name='Bullet',parent=styles['Body'],leftIndent=18,firstLineIndent=-9,spaceAfter=3)); styles.add(ParagraphStyle(name='Fig',parent=styles['Normal'],fontName='Helvetica-Bold',fontSize=9,leading=12,alignment=TA_CENTER,spaceAfter=5)); styles.add(ParagraphStyle(name='FigSmall',parent=styles['Normal'],fontName='Helvetica',fontSize=8,leading=11,alignment=TA_CENTER,leftIndent=18,rightIndent=18)); styles.add(ParagraphStyle(name='Front',parent=styles['Body'],firstLineIndent=0,spaceAfter=8))
    story=[Spacer(1,1.7*inch),Paragraph('MACROSCOPIC LIFE',styles['TitleX']),PageBreak(),Spacer(1,1.25*inch),Paragraph('MACROSCOPIC LIFE',styles['TitleX']),Paragraph('Book One',styles['SubTitle']),Paragraph('<i>The Search for Life Beyond the Scale of Human Perception</i>',styles['SubTitle']),Spacer(1,.35*inch),Paragraph('Steve Grappe',styles['SubTitle']),PageBreak(),Paragraph('<b>Copyright © 2026 Steve Grappe</b>',styles['Front']),Paragraph('All rights reserved.',styles['Front']),Paragraph('First edition. ISBN: [ASSIGN AT PUBLICATION]',styles['Front']),Spacer(1,.3*inch),Paragraph('STRUCTURAL PROOF v0.1 - NOT FOR DISTRIBUTION',styles['Front']),PageBreak(),Spacer(1,1.6*inch),Paragraph('<i>The limits of human observation are not the limits of reality.</i>',styles['Quote']),PageBreak()]
    for c in chapters:
        n=c['n']
        if n in PARTS:
            pnum,pname,tag=PARTS[n]; story += [Spacer(1,1.35*inch),Paragraph(pnum,styles['SubTitle']),Paragraph(pname,styles['Part']),Paragraph(esc(tag),styles['SubTitle']),PageBreak()]
        story += [Spacer(1,.85*inch),Paragraph(f'CHAPTER {n}',styles['ChapNum']),Paragraph(esc(c['title'].title()),styles['ChapTitle'])]
        inserted=False; local=[]
        for line in c['lines']:
            local.append(line)
            if not inserted and FIGS.get(n) and line.startswith('### '):
                add_markdown(story,local,styles); local=[]
                for f in FIGS[n]: story.append(figure_box(f,styles))
                inserted=True
        add_markdown(story,local,styles)
        if FIGS.get(n) and not inserted:
            for f in FIGS[n]: story.append(figure_box(f,styles))
        story.append(PageBreak())
    if notes: story += [Spacer(1,.75*inch),Paragraph('NOTES',styles['ChapTitle'])]; add_markdown(story,notes,styles)
    OUTDIR.mkdir(parents=True,exist_ok=True)
    doc=SimpleDocTemplate(str(OUT),pagesize=(6*inch,9*inch),rightMargin=.7*inch,leftMargin=.82*inch,topMargin=.72*inch,bottomMargin=.72*inch,title='Macroscopic Life - Book One - Structural Proof v0.1',author='Steve Grappe')
    doc.build(story,onFirstPage=footer,onLaterPages=footer); print(OUT)
if __name__=='__main__': main()
