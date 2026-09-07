#!/usr/bin/env python3
"""Deterministically assemble Macroscopic Life Book One from canonical frozen sources."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[3]
M = ROOT / "research" / "macroscopic-life" / "manuscript"
OUT = M / "BOOK-ONE-CANONICAL-ASSEMBLED-v0.1.md"
OPENING = M / "book-one-opening-movement-v1.2-publication-proof.md"
CHAPTERS = {
    7:M/"chapter-7"/"CHAPTER-7-THE-SIGNAL-PREFREEZE-v0.3.md", 8:M/"chapter-8"/"CHAPTER-8-THE-MEMORY-PREFREEZE-v0.2.md",
    9:M/"chapter-9"/"CHAPTER-9-THE-ANTICIPATION-PREFREEZE-v0.2.md", 10:M/"chapter-10"/"CHAPTER-10-THE-GOAL-PREFREEZE-v0.2.md",
    11:M/"chapter-11"/"CHAPTER-11-THE-CHOICE-PREFREEZE-v0.2.md", 12:M/"chapter-12"/"CHAPTER-12-THE-INDIVIDUAL-PREFREEZE-v0.2.md",
    13:M/"chapter-13"/"CHAPTER-13-THE-REPRODUCTION-PREFREEZE-v0.2.md", 14:M/"chapter-14"/"CHAPTER-14-THE-INHERITANCE-PREFREEZE-v0.2.md",
    15:M/"chapter-15"/"CHAPTER-15-THE-SELECTION-PREFREEZE-v0.2.md", 16:M/"chapter-16"/"CHAPTER-16-THE-TRANSITION-PREFREEZE-v0.2.md",
}
PARTS={1:"PART I — THE OBSERVER",3:"PART II — THE WHOLE",7:"PART III — THE PROPERTIES",12:"PART IV — THE INDIVIDUAL"}
T={7:"The Signal",8:"The Memory",9:"The Anticipation",10:"The Goal",11:"The Choice",12:"The Individual",13:"The Reproduction",14:"The Inheritance",15:"The Selection",16:"The Transition"}

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
    # Canonical source filenames/manifests already lock chapter identity. Frozen files
    # have several historical heading styles, so remove only leading publication/control
    # header material and preserve everything from the first prose/figure paragraph on.
    lines=text.splitlines(); i=0; seen_chapter=False
    while i<len(lines):
        s=lines[i].strip()
        low=s.lower().strip('*')
        if not s:
            i+=1; continue
        if s.startswith('#'):
            if re.search(rf"\bchapter\s+{n}\b",s,re.I): seen_chapter=True
            i+=1; continue
        if low.startswith(('prefreeze status:','status:','canonical status:','version:')):
            i+=1; continue
        # Some files carry one short control sentence immediately after headings.
        if seen_chapter and re.match(r"(?i)^(prefreeze|canonical|freeze)\b",s) and len(s)<160:
            i+=1; continue
        break
    if not seen_chapter:
        # Some canonical files may use only title headings; verify chapter number occurs
        # in the leading control region rather than rejecting a frozen format variant.
        if not re.search(rf"(?i)chapter[ -]?{n}\b", "\n".join(lines[:20])):
            raise SystemExit(f"Chapter {n} identity not found in source header")
    body="\n".join(lines[i:]).strip()
    if not body: raise SystemExit(f"Chapter {n} body empty after header normalization")
    return f"## Chapter {n} — {T[n]}\n\n{body}"

def main():
    ch=opening(read(OPENING))
    for n,p in CHAPTERS.items(): ch[n]=later(n,read(p))
    ch[4]=re.sub(r"(?m)^## Chapter 4 — The Choice$","## Chapter 4 — The Verb",ch[4],count=1)
    pieces=["# MACROSCOPIC LIFE","","## Book One — Canonical Assembled Manuscript v0.1","","**Assembly status: PASS 18E continuous-read candidate. Canonical prose preserved except authorized heading normalization and Chapter 4 title-only repair.**"]
    for n in range(1,17):
        if n in PARTS: pieces += ["","---","",f"# {PARTS[n]}",""]
        pieces += ["",ch[n]]
    a="\n".join(pieces).rstrip()+"\n"
    for n in range(1,17):
        if len(re.findall(rf"(?m)^## Chapter {n} — ",a))!=1: raise SystemExit(f"Assembly gate failed: Chapter {n} count")
    if "## Chapter 4 — The Verb" not in a or "## Chapter 11 — The Choice" not in a: raise SystemExit("Assembly gate failed: titles")
    if re.search(r"(?m)^## Chapter 17 — ",a): raise SystemExit("Assembly gate failed: Chapter 17")
    for p in PARTS.values():
        if a.count(f"# {p}")!=1: raise SystemExit(f"Assembly gate failed: {p}")
    OUT.write_text(a,encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}"); print(f"Characters: {len(a):,}"); print(f"Words (approx): {len(a.split()):,}"); print("Assembly gates: PASS")
if __name__=="__main__": main()
