#!/usr/bin/env python3
"""Build Macroscopic Life Book One 6x9 structural proof v0.2 with anchor-aware figure placement."""
from pathlib import Path
import json
import re
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import black
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, HRFlowable

ROOT = Path(__file__).resolve().parents[1]
READER = ROOT / 'manuscript' / 'BOOK-ONE-READER-MATERIALIZED-v0.4.md'
OUTDIR = ROOT / 'production' / 'proofs'
OUT = OUTDIR / 'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.2.pdf'
ANCHOR_OUT = OUTDIR / 'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.2-ANCHORS.json'

PARTS = {
    1: ('PART I', 'THE OBSERVER', 'Before we can ask what reality contains, we have to understand the limits of the instrument doing the asking.'),
    3: ('PART II', 'THE WHOLE', 'Before a system can possess a property, we must know what system we are talking about.'),
    5: ('PART III', 'THE TEST', 'A larger-scale explanation matters only if it can do scientific work - and survive the alternatives.'),
    7: ('PART IV', 'THE FUNCTIONS', 'The familiar verbs of life become dangerous when resemblance is mistaken for evidence.'),
    11: ('PART V', 'THE INDIVIDUAL', 'A process can happen inside a system before the system itself owns the process.'),
    13: ('PART VI', 'THE LINEAGE', 'An individual becomes an evolutionary question only when descent, inheritance, and differential success can be tested at its level.'),
}

EXPECTED_FIGURES = {
    '02': 1, '03': 1, '04': 1, '05': 2, '06': 3, '07': 4,
    '08': 5, '09': 6, '10': 8, '11': 9, '12': 10, '13': 11,
    '14': 12, '15': 15, '16': 16,
}

# Figures with no surviving explicit production marker in Reader v0.4 use a frozen prose anchor.
AFTER_SUBSTRING = {
    '02': 'one evolved observational window among many.',
    '03': 'Time-lapse changes the observer, not the process.',
    '04': 'The possibility is that important organization may exist outside the scales at which human intuition naturally recognizes individuals.',
    '05': 'The next task is to determine whether the apparent whole was discovered or drawn.',
    '06': 'The candidate individual is not whatever survives our prose. It is whatever survives perturbation and comparison.',
    '08': 'Stability across implementation is not proof of causation, but it is one reason higher-level models can generalize.',
}

# Figure 09 is intentionally anchored to the first recovery/restoration paragraph in Chapter 6.
# This keeps the placement tied to the worked recovery/regulation discussion while avoiding a brittle guessed sentence.
FIRST_MATCH = {
    '09': re.compile(r'\b(recover|recovery|restor|regulat)', re.I),
}

# These figures retain explicit production markers in the frozen reader.
MARKER_FIGURES = {'07', '10', '11', '12', '13'}

# These figures belong immediately before the named conceptual turn.
BEFORE_HEADING = {
    '14': 'Many Becoming One',
    '15': 'Building the Individual',
    '16': 'No Staircase to Earth',
}


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def inline(s):
    s = esc(s.strip())
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'\*(.+?)\*', r'<i>\1</i>', s)
    s = re.sub(r'`(.+?)`', r'<font name="Courier">\1</font>', s)
    return s


def parse_reader(text):
    lines = text.splitlines()
    chapters, notes = [], []
    current = None
    in_notes = False
    for line in lines:
        stripped = line.strip()
        if re.match(r'^#{1,2}\s+NOTES\s*$', stripped, re.I):
            in_notes = True
            current = None
            continue
        if not in_notes:
            m = re.match(r'^##\s+Chapter\s+(\d+)\s+[—-]\s+(.+?)\s*$', stripped, re.I)
            if m:
                current = {'n': int(m.group(1)), 'title': m.group(2).strip(), 'lines': []}
                chapters.append(current)
                continue
            m = re.match(r'^#\s+CHAPTER\s+(\d+)\s*$', stripped, re.I)
            if m:
                current = {'n': int(m.group(1)), 'title': '', 'lines': []}
                chapters.append(current)
                continue
        if current is not None:
            if not current['title'] and line.startswith('## '):
                current['title'] = line[3:].strip()
                continue
            current['lines'].append(line)
        elif in_notes:
            notes.append(line)
    return chapters, notes


def figure_box(num, styles):
    return KeepTogether([
        Spacer(1, 8),
        HRFlowable(width='100%', thickness=.6, color=black),
        Spacer(1, 8),
        Paragraph(f'<b>FIGURE {num} - APPROVED POSITION</b>', styles['Fig']),
        Paragraph('Structural proof placeholder. Placement is tied to the frozen conceptual anchor recorded in the v0.2 anchor manifest. Insert only publication-authority artwork at final composition.', styles['FigSmall']),
        Spacer(1, 8),
        HRFlowable(width='100%', thickness=.6, color=black),
        Spacer(1, 8),
    ])


def marker_number(line):
    stripped = line.strip()
    if '[FIGURE' in stripped.upper():
        m = re.search(r'\[FIGURE\s+0?(\d+)\b', stripped, re.I)
        if m:
            return f'{int(m.group(1)):02d}'
    if re.match(r'^>\s*\*\*FIGURE\s+0?10\b', stripped, re.I):
        return '10'
    return None


def add_chapter(story, chapter, styles, placements):
    n = chapter['n']
    para = []
    last_visible_paragraph = ''
    inserted = set()

    def insert_figure(num, source, anchor_text):
        if num in inserted:
            raise SystemExit(f'Duplicate Figure {num} placement in Chapter {n}')
        expected_chapter = EXPECTED_FIGURES.get(num)
        if expected_chapter != n:
            raise SystemExit(f'Figure {num} attempted in Chapter {n}, expected Chapter {expected_chapter}')
        if not anchor_text.strip():
            raise SystemExit(f'Figure {num} has empty anchor text')
        story.append(figure_box(num, styles))
        placements[num] = {
            'figure': num,
            'chapter': n,
            'source': source,
            'anchor_text': anchor_text.strip(),
        }
        inserted.add(num)

    def flush():
        nonlocal para, last_visible_paragraph
        if not para:
            return
        txt = ' '.join(x.strip() for x in para if x.strip())
        para = []
        if not txt:
            return
        story.append(Paragraph(inline(txt), styles['Body']))
        last_visible_paragraph = txt

        for num, needle in AFTER_SUBSTRING.items():
            if EXPECTED_FIGURES[num] == n and num not in inserted and needle in txt:
                insert_figure(num, f'after-substring:{needle}', txt)

        for num, pattern in FIRST_MATCH.items():
            if EXPECTED_FIGURES[num] == n and num not in inserted and pattern.search(txt):
                insert_figure(num, f'first-match:{pattern.pattern}', txt)

    for raw in chapter['lines']:
        line = raw.rstrip()
        stripped = line.strip()

        mnum = marker_number(line)
        if mnum and mnum in MARKER_FIGURES:
            flush()
            insert_figure(mnum, 'canonical-reader-marker', last_visible_paragraph)
            continue

        heading_text = None
        if line.startswith('### '):
            heading_text = line[4:].strip()
        elif line.startswith('## '):
            heading_text = line[3:].strip()

        if heading_text:
            flush()
            for num, target in BEFORE_HEADING.items():
                if EXPECTED_FIGURES[num] == n and num not in inserted and heading_text == target:
                    insert_figure(num, f'before-heading:{target}', last_visible_paragraph)
            style = styles['H3'] if line.startswith('### ') else styles['H2']
            story.append(Paragraph(inline(heading_text), style))
            continue

        if not stripped:
            flush()
            continue
        if stripped == '---':
            flush()
            continue
        if line.startswith('> '):
            flush()
            q = line[2:].strip()
            if q:
                story.append(Paragraph(inline(q), styles['Quote']))
                last_visible_paragraph = q
            continue
        if re.match(r'^[-*] ', line):
            flush()
            b = line[2:].strip()
            story.append(Paragraph('• ' + inline(b), styles['BulletX']))
            last_visible_paragraph = b
            continue
        para.append(line)

    flush()

    expected_here = {f for f, ch in EXPECTED_FIGURES.items() if ch == n}
    if inserted != expected_here:
        raise SystemExit(f'Chapter {n} figure placement mismatch: expected {sorted(expected_here)}, inserted {sorted(inserted)}')


def add_markdown(story, lines, styles):
    para = []
    def flush():
        nonlocal para
        if para:
            txt = ' '.join(x.strip() for x in para if x.strip())
            if txt:
                story.append(Paragraph(inline(txt), styles['Body']))
            para = []
    for raw in lines:
        line = raw.rstrip()
        if not line.strip():
            flush(); continue
        if line.strip() == '---':
            flush(); continue
        if line.startswith('### '):
            flush(); story.append(Paragraph(inline(line[4:]), styles['H3'])); continue
        if line.startswith('## '):
            flush(); story.append(Paragraph(inline(line[3:]), styles['H2'])); continue
        if line.startswith('> '):
            flush(); story.append(Paragraph(inline(line[2:]), styles['Quote'])); continue
        if re.match(r'^[-*] ', line):
            flush(); story.append(Paragraph('• ' + inline(line[2:]), styles['BulletX'])); continue
        para.append(line)
    flush()


def footer(canvas, doc):
    canvas.saveState()
    page = canvas.getPageNumber()
    if page > 1:
        canvas.setFont('Helvetica', 8)
        canvas.drawCentredString(3 * inch, .43 * inch, str(page - 1))
    canvas.restoreState()


def main():
    if not READER.exists():
        raise SystemExit(f'Missing frozen reader: {READER}')
    text = READER.read_text(encoding='utf-8')
    chapters, notes = parse_reader(text)
    nums = [c['n'] for c in chapters]
    if nums != list(range(1, 17)):
        raise SystemExit(f'Reader must contain exactly Chapters 1-16; parsed {nums}')
    if chapters[3]['title'].upper() != 'THE VERB' or chapters[10]['title'].upper() != 'THE CHOICE':
        raise SystemExit('Title lock failed')
    if re.search(r'(^|\n)#{1,2}\s+CHAPTER\s+17\b', text, re.I):
        raise SystemExit('Chapter 17 prohibited')

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='TitleX', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=26, leading=30, alignment=TA_CENTER, spaceAfter=18))
    styles.add(ParagraphStyle(name='SubTitle', parent=styles['Normal'], fontName='Helvetica', fontSize=12, leading=17, alignment=TA_CENTER, spaceAfter=14))
    styles.add(ParagraphStyle(name='Part', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=22, leading=26, alignment=TA_CENTER, spaceAfter=14))
    styles.add(ParagraphStyle(name='ChapNum', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=12, alignment=TA_CENTER, spaceAfter=10))
    styles.add(ParagraphStyle(name='ChapTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=22, leading=27, alignment=TA_CENTER, spaceAfter=34))
    styles.add(ParagraphStyle(name='Body', parent=styles['BodyText'], fontName='Times-Roman', fontSize=10.7, leading=14.6, alignment=TA_LEFT, firstLineIndent=15, spaceAfter=1.5))
    styles.add(ParagraphStyle(name='H2', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, leading=17, spaceBefore=18, spaceAfter=8, keepWithNext=True))
    styles.add(ParagraphStyle(name='H3', parent=styles['Heading3'], fontName='Helvetica-Bold', fontSize=11.5, leading=14, spaceBefore=13, spaceAfter=6, keepWithNext=True))
    styles.add(ParagraphStyle(name='Quote', parent=styles['Body'], fontName='Times-Italic', fontSize=10.5, leading=14.5, leftIndent=18, rightIndent=18, firstLineIndent=0, spaceBefore=7, spaceAfter=7))
    styles.add(ParagraphStyle(name='BulletX', parent=styles['Body'], leftIndent=18, firstLineIndent=-9, spaceAfter=3))
    styles.add(ParagraphStyle(name='Fig', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=12, alignment=TA_CENTER, spaceAfter=5))
    styles.add(ParagraphStyle(name='FigSmall', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, alignment=TA_CENTER, leftIndent=18, rightIndent=18))
    styles.add(ParagraphStyle(name='Front', parent=styles['Body'], firstLineIndent=0, spaceAfter=8))

    story = [
        Spacer(1, 1.7 * inch), Paragraph('MACROSCOPIC LIFE', styles['TitleX']), PageBreak(),
        Spacer(1, 1.25 * inch), Paragraph('MACROSCOPIC LIFE', styles['TitleX']), Paragraph('Book One', styles['SubTitle']),
        Paragraph('<i>The Search for Life Beyond the Scale of Human Perception</i>', styles['SubTitle']),
        Spacer(1, .35 * inch), Paragraph('Steve Grappe', styles['SubTitle']), PageBreak(),
        Paragraph('<b>Copyright © 2026 Steve Grappe</b>', styles['Front']), Paragraph('All rights reserved.', styles['Front']),
        Paragraph('First edition. ISBN: [ASSIGN AT PUBLICATION]', styles['Front']), Spacer(1, .3 * inch),
        Paragraph('STRUCTURAL PROOF v0.2 - NOT FOR DISTRIBUTION', styles['Front']), PageBreak(),
        Spacer(1, 1.6 * inch), Paragraph('<i>The limits of human observation are not the limits of reality.</i>', styles['Quote']), PageBreak(),
    ]

    placements = {}
    for c in chapters:
        n = c['n']
        if n in PARTS:
            pnum, pname, tag = PARTS[n]
            story += [Spacer(1, 1.35 * inch), Paragraph(pnum, styles['SubTitle']), Paragraph(pname, styles['Part']), Paragraph(esc(tag), styles['SubTitle']), PageBreak()]
        story += [Spacer(1, .85 * inch), Paragraph(f'CHAPTER {n}', styles['ChapNum']), Paragraph(esc(c['title'].title()), styles['ChapTitle'])]
        add_chapter(story, c, styles, placements)
        story.append(PageBreak())

    if set(placements) != set(EXPECTED_FIGURES):
        raise SystemExit(f'Whole-book figure set mismatch: expected {sorted(EXPECTED_FIGURES)}, got {sorted(placements)}')

    if notes:
        story += [Spacer(1, .75 * inch), Paragraph('NOTES', styles['ChapTitle'])]
        add_markdown(story, notes, styles)

    OUTDIR.mkdir(parents=True, exist_ok=True)
    ANCHOR_OUT.write_text(json.dumps({
        'proof_version': 'v0.2',
        'reader': str(READER.relative_to(ROOT)),
        'expected_figures': EXPECTED_FIGURES,
        'placements': [placements[k] for k in sorted(placements, key=int)],
    }, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    doc = SimpleDocTemplate(
        str(OUT), pagesize=(6 * inch, 9 * inch), rightMargin=.7 * inch, leftMargin=.82 * inch,
        topMargin=.72 * inch, bottomMargin=.72 * inch,
        title='Macroscopic Life - Book One - Structural Proof v0.2', author='Steve Grappe'
    )
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUT)
    print(ANCHOR_OUT)


if __name__ == '__main__':
    main()
