#!/usr/bin/env python3
"""Build Book One proof v0.3 from the frozen v0.2 compositor.

Pass 05D.3 changes production behavior only:
- raw Reader # PART headings are removed from chapter reading streams and Notes;
- output/version metadata targets v0.3;
- the verified Figure 07 Chapter 4 hinge override is preserved exactly as in the
  frozen v0.2 runner.

No Reader prose, conceptual figure anchor, chapter order, or scientific claim is changed.
"""
from pathlib import Path
import importlib.util
import re

HERE = Path(__file__).resolve().parent
BASE = HERE / 'build-book-one-proof-v02.py'

spec = importlib.util.spec_from_file_location('macroscopic_life_proof_v03', BASE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

# v0.3 output metadata only.
module.OUT = module.OUTDIR / 'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.3.pdf'
module.ANCHOR_OUT = module.OUTDIR / 'MACROSCOPIC-LIFE-BOOK-ONE-6x9-PROOF-v0.3-ANCHORS.json'

# Preserve the verified frozen Figure 07 placement architecture from v0.2.
FIGURE_07_HINGE = 'Nothing about the machine changed while we were talking. Only the verbs did.'
module.AFTER_SUBSTRING['07'] = FIGURE_07_HINGE
module.MARKER_FIGURES.discard('07')

# Remove only raw top-level PART source headings from parsed chapter and Notes streams.
_base_parse_reader = module.parse_reader
PART_RE = re.compile(r'^#\s+PART\s+[IVXLC]+\b', re.I)

def _strip_raw_part_markers(value):
    """Recursively strip only raw '# PART ...' source-marker strings."""
    if isinstance(value, str):
        return '' if PART_RE.match(value.strip()) else value
    if isinstance(value, list):
        return [cleaned for item in value if (cleaned := _strip_raw_part_markers(item)) not in ('', None)]
    if isinstance(value, dict):
        return {key: _strip_raw_part_markers(item) for key, item in value.items()}
    return value

def parse_reader_v03(text):
    chapters, notes = _base_parse_reader(text)
    for chapter in chapters:
        chapter['lines'] = [line for line in chapter['lines'] if not PART_RE.match(line.strip())]
    notes = _strip_raw_part_markers(notes)
    return chapters, notes

module.parse_reader = parse_reader_v03

# Patch version labels without global source rewriting.
_original_write_text = module.Path.write_text

def write_text_v03(self, data, *args, **kwargs):
    if self == module.ANCHOR_OUT:
        data = data.replace('"proof_version": "v0.2"', '"proof_version": "v0.3"', 1)
    return _original_write_text(self, data, *args, **kwargs)

module.Path.write_text = write_text_v03

# These strings are display metadata only and cannot affect placement logic.
_original_doc = module.SimpleDocTemplate

def doc_v03(filename, *args, **kwargs):
    if kwargs.get('title') == 'Macroscopic Life - Book One - Structural Proof v0.2':
        kwargs['title'] = 'Macroscopic Life - Book One - Structural Proof v0.3'
    return _original_doc(filename, *args, **kwargs)

module.SimpleDocTemplate = doc_v03

# Front-matter label is embedded in main(); change that single literal by wrapping Paragraph.
_original_paragraph = module.Paragraph

def paragraph_v03(text, *args, **kwargs):
    if text == 'STRUCTURAL PROOF v0.2 - NOT FOR DISTRIBUTION':
        text = 'STRUCTURAL PROOF v0.3 - NOT FOR DISTRIBUTION'
    return _original_paragraph(text, *args, **kwargs)

module.Paragraph = paragraph_v03

module.main()
