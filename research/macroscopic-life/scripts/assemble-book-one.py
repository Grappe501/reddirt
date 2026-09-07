#!/usr/bin/env python3
"""Deterministically assemble Macroscopic Life Book One from canonical frozen sources.

Outputs:
- BOOK-ONE-CANONICAL-ASSEMBLED-v0.1.md: provenance-preserving assembly.
- BOOK-ONE-READER-MATERIALIZED-v0.2.md: clean reader stream with chapter notes moved to back matter and production-control sections omitted.

Canonical source files are never rewritten by this script.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[3]
M = ROOT / "research" / "macroscopic-life" / "manuscript"
OUT = M / "BOOK-ONE-CANONICAL-ASSEMBLED-v0.1.md"
READER = M / "BOOK-ONE-READER-MATERIALIZED-v0.2.md"
OPENING = M / "book-one-opening-movement-v1.2-publication-proof.md"
CHAPTERS = {
    7:M/"chapter-7"/"CHAPTER-7-THE-SIGNAL-PREFREEZE-v0.3.md", 8:M/"chapter-8"/"CHAPTER-8-THE-MEMORY-PREFREEZE-v0.2.md",
    9:M/"chapter-9"/"CHAPTER-9-THE-ANTICIPATION-PREFREEZE-v0.2.md", 10:M/"chapter-10"/"CHAPTER-10-THE-GOAL-PREFREEZE-v0.2.md",
    11:M/"chapter-11"/"CHAPTER-11-THE-CHOICE-PREFREEZE-v0.2.md", 12:M/"chapter-12"/"CHAPTER-12-THE-INDIVIDUAL-PREFREEZE-v0.2.md",
    13:M/"chapter-13"/"CHAPTER-13-THE-REPRODUCTION-PREFREEZE-v0.2.md", 14:M/"chapter-14"/"CHAPTER-14-THE-INHERITANCE-PREFREEZE-v0.2.md",
    15:M/"chapter-15"/"CHAPTER-15-THE-SELECTION-PREFREEZE-v0.2.md", 16:M/"chapter-16"/"CHAPTER-16-THE-TRANSITION-PREFREEZE-v0.2.md",
}
PARTS={1:"PART I — THE OBSERVER",3:"PART II — THE WHOLE",7:"PART III — THE PROPERTIES",12:"PART IV — THE INDIVIDUAL"}
T={1:"The Window",2:"The Search",3:"The Boundary",4:"The Verb",5:"The Level",6:"The Experiment",7:"The Signal",8:"The Memory",9:"The Anticipation",10:"The Goal",11:"The Choice",12:"The Individual",13:"The Reproduction",14:"The Inheritance",15:"The Selection",16:"The Transition"}

CONTROL_HEADING = re.compile(
    r"(?i)^#{1,6}\s+.*(?:prefreeze\s+control|prefreeze\s+control\s+notes|freeze\s+control|control\s+notes|pass\s+\d+[a-z]?|required\s+next\s+gate|production\s+notes).*$"
)
ENDNOTES_HEADING = re.compile(r"(?i)^#{1,6}\s+(?:endnotes|notes)(?:\s+—.*|\s+-.*|\s*:.*|\s+.*)?$")
LEAK_PATTERNS = [
    re.compile(r"(?i)\bthis manuscript is \*\*?not frozen\*\*?"),
    re.compile(r"(?i)\brequired next gate\b"),
    re.compile(r"(?i)\bchapters?\s+\d+(?:[–-]\d+)?\s+(?:are|is)\s+untouched\b"),
    re.compile(r"(?i)\bpass\s+\d+[a-z]?\s+(?:hostile|repair|surgical|freeze|source|gate)\b"),
]

def read(p):
    if not p.exists(): raise SystemExit(f"Missing canonical source: {p.relative_to(ROOT)}")
    return p.read_text(encoding="utf-8").replace("\r\n","\n").strip()

def opening(text):
    ms=list(re.finditer(r"(?m)^## Chapter ([1-6]) — .+$",text))
    if len(ms)!=6: raise SystemExit(f"Expected six opening chapters; found {len(ms)}")
    out={}
    for i,m in enumerate(ms):
        n=int(m.group(1)); end=ms[i+1].start() if i+1<len(ms) else len(text)
        b=text[m.start():end].strip(); b=re.sub(r"\n---\n\n# ACT [IVX]+ — .*?$","",b,flags=re.S).strip(); out[n]=b
    return out

def later(n,text):
    lines=text.splitlines(); i=0; seen_chapter=False
    while i<len(lines):
        s=lines[i].strip(); low=s.lower().strip('*')
        if not s: i+=1; continue
        if s.startswith('#'):
            if re.search(rf"\bchapter\s+{n}\b",s,re.I): seen_chapter=True
            i+=1; continue
        if low.startswith(('prefreeze status:','status:','canonical status:','version:')):
            i+=1; continue
        if seen_chapter and re.match(r"(?i)^(prefreeze|canonical|freeze)\b",s) and len(s)<160:
            i+=1; continue
        break
    if not seen_chapter and not re.search(rf"(?i)chapter[ -]?{n}\b", "\n".join(lines[:20])):
        raise SystemExit(f"Chapter {n} identity not found in source header")
    body="\n".join(lines[i:]).strip()
    if not body: raise SystemExit(f"Chapter {n} body empty after header normalization")
    return f"## Chapter {n} — {T[n]}\n\n{body}"

def split_reader_chapter(n, chapter):
    """Return reader prose and chapter notes, removing only recognized production tails."""
    lines=chapter.splitlines()
    note_i=None; control_i=None
    for i,line in enumerate(lines):
        s=line.strip()
        if note_i is None and ENDNOTES_HEADING.match(s):
            note_i=i
            continue
        if CONTROL_HEADING.match(s):
            control_i=i
            break

    if note_i is not None:
        prose=lines[:note_i]
        notes_end=control_i if control_i is not None and control_i>note_i else len(lines)
        notes=lines[note_i+1:notes_end]
    elif control_i is not None:
        prose=lines[:control_i]; notes=[]
    else:
        prose=lines; notes=[]

    # Remove horizontal rules stranded at the very end by apparatus extraction.
    while prose and not prose[-1].strip(): prose.pop()
    while prose and prose[-1].strip()=="---": prose.pop()
    while prose and not prose[-1].strip(): prose.pop()

    prose_text="\n".join(prose).strip()
    notes_text="\n".join(notes).strip()
    if not prose_text.startswith(f"## Chapter {n} — "):
        raise SystemExit(f"Reader gate failed: Chapter {n} prose lost heading")
    return prose_text, notes_text

def validate(a, reader):
    for n in range(1,17):
        if len(re.findall(rf"(?m)^## Chapter {n} — ",a))!=1: raise SystemExit(f"Assembly gate failed: Chapter {n} count")
        if len(re.findall(rf"(?m)^## Chapter {n} — ",reader))!=1: raise SystemExit(f"Reader gate failed: Chapter {n} count")
    if "## Chapter 4 — The Verb" not in reader or "## Chapter 11 — The Choice" not in reader: raise SystemExit("Reader gate failed: titles")
    if re.search(r"(?m)^## Chapter 17 — ",reader): raise SystemExit("Reader gate failed: Chapter 17")
    for p in PARTS.values():
        if reader.count(f"# {p}")!=1: raise SystemExit(f"Reader gate failed: {p}")
    if CONTROL_HEADING.search(reader): raise SystemExit("Reader gate failed: control heading leak")
    for pat in LEAK_PATTERNS:
        if pat.search(reader): raise SystemExit(f"Reader gate failed: production text leak: {pat.pattern}")
    if "# NOTES" not in reader: raise SystemExit("Reader gate failed: notes back matter missing")
    for n in range(7,17):
        if f"## Notes to Chapter {n} — {T[n]}" not in reader: raise SystemExit(f"Reader gate failed: notes key missing for Chapter {n}")

def main():
    ch=opening(read(OPENING))
    for n,p in CHAPTERS.items(): ch[n]=later(n,read(p))
    ch[4]=re.sub(r"(?m)^## Chapter 4 — The Choice$","## Chapter 4 — The Verb",ch[4],count=1)

    # Provenance-preserving assembled object.
    pieces=["# MACROSCOPIC LIFE","","## Book One — Canonical Assembled Manuscript v0.1","","**Assembly status: provenance-preserving canonical composition.**"]
    for n in range(1,17):
        if n in PARTS: pieces += ["","---","",f"# {PARTS[n]}",""]
        pieces += ["",ch[n]]
    a="\n".join(pieces).rstrip()+"\n"

    # Reader materialization: prose uninterrupted; apparatus moved to back matter.
    reader_ch={}; notes={}
    for n in range(1,17): reader_ch[n],notes[n]=split_reader_chapter(n,ch[n])
    r=["# MACROSCOPIC LIFE","","## Book One — Reader Materialized Manuscript v0.2","","*Sixteen-chapter continuous reader edition. Canonical science and prose preserved; production controls removed from the reading stream and chapter notes collected in back matter.*"]
    for n in range(1,17):
        if n in PARTS: r += ["","---","",f"# {PARTS[n]}",""]
        r += ["",reader_ch[n]]
    r += ["","---","","# NOTES",""]
    for n in range(1,17):
        if notes[n]:
            r += [f"## Notes to Chapter {n} — {T[n]}","",notes[n],""]
        elif n>=7:
            # Explicit key proves apparatus extraction was evaluated even if a chapter carries no notes.
            r += [f"## Notes to Chapter {n} — {T[n]}","","No chapter-specific notes were embedded in the canonical manuscript source.",""]
    reader="\n".join(r).rstrip()+"\n"

    validate(a,reader)
    OUT.write_text(a,encoding="utf-8")
    READER.write_text(reader,encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}")
    print(f"Wrote {READER.relative_to(ROOT)}")
    print(f"Canonical words (approx): {len(a.split()):,}")
    print(f"Reader words incl. notes (approx): {len(reader.split()):,}")
    print("Canonical + reader gates: PASS")

if __name__=="__main__": main()
