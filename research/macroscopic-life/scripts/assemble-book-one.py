#!/usr/bin/env python3
"""Deterministically assemble Macroscopic Life Book One from canonical frozen sources.

Publication-safe transformations only:
- extract Chapters 1–6 from the frozen opening object;
- normalize canonical chapter heading styles into one publication style;
- render Chapter 4's authorized publication title as "The Verb";
- append canonical Chapters 7–16;
- insert four locked Part dividers;
- preserve chapter prose/endnotes otherwise.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[3]
M = ROOT / "research" / "macroscopic-life" / "manuscript"
OUT = M / "BOOK-ONE-CANONICAL-ASSEMBLED-v0.1.md"

OPENING = M / "book-one-opening-movement-v1.2-publication-proof.md"
CHAPTERS = {
    7: M / "chapter-7" / "CHAPTER-7-THE-SIGNAL-PREFREEZE-v0.3.md",
    8: M / "chapter-8" / "CHAPTER-8-THE-MEMORY-PREFREEZE-v0.2.md",
    9: M / "chapter-9" / "CHAPTER-9-THE-ANTICIPATION-PREFREEZE-v0.2.md",
    10: M / "chapter-10" / "CHAPTER-10-THE-GOAL-PREFREEZE-v0.2.md",
    11: M / "chapter-11" / "CHAPTER-11-THE-CHOICE-PREFREEZE-v0.2.md",
    12: M / "chapter-12" / "CHAPTER-12-THE-INDIVIDUAL-PREFREEZE-v0.2.md",
    13: M / "chapter-13" / "CHAPTER-13-THE-REPRODUCTION-PREFREEZE-v0.2.md",
    14: M / "chapter-14" / "CHAPTER-14-THE-INHERITANCE-PREFREEZE-v0.2.md",
    15: M / "chapter-15" / "CHAPTER-15-THE-SELECTION-PREFREEZE-v0.2.md",
    16: M / "chapter-16" / "CHAPTER-16-THE-TRANSITION-PREFREEZE-v0.2.md",
}

PARTS = {
    1: "PART I — THE OBSERVER",
    3: "PART II — THE WHOLE",
    7: "PART III — THE PROPERTIES",
    12: "PART IV — THE INDIVIDUAL",
}

EXPECTED_TITLES = {
    7: "The Signal", 8: "The Memory", 9: "The Anticipation", 10: "The Goal",
    11: "The Choice", 12: "The Individual", 13: "The Reproduction",
    14: "The Inheritance", 15: "The Selection", 16: "The Transition",
}


def read(path: Path) -> str:
    if not path.exists():
        raise SystemExit(f"Missing canonical source: {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8").replace("\r\n", "\n").strip()


def extract_opening_chapters(text: str) -> dict[int, str]:
    matches = list(re.finditer(r"(?m)^## Chapter ([1-6]) — .+$", text))
    if len(matches) != 6:
        raise SystemExit(f"Expected six opening chapter headings; found {len(matches)}")
    out = {}
    for i, match in enumerate(matches):
        n = int(match.group(1))
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        block = text[match.start():end].strip()
        block = re.sub(r"\n---\n\n# ACT [IVX]+ — .*?$", "", block, flags=re.S).strip()
        out[n] = block
    return out


def normalize_later_chapter(n: int, text: str) -> str:
    """Accept both canonical heading forms and emit `## Chapter N — The Title`."""
    inline = re.search(rf"(?m)^## Chapter {n} — (.+)$", text)
    if inline:
        return text[inline.start():].strip()

    split = re.search(rf"(?m)^# CHAPTER {n}\s*\n## (.+)$", text)
    if split:
        title = split.group(1).strip().title()
        expected = EXPECTED_TITLES[n]
        # The filename/manifest is authoritative; heading must agree semantically.
        if title.casefold() != expected.casefold():
            raise SystemExit(f"Chapter {n} title mismatch: found {title!r}, expected {expected!r}")
        body_start = split.end()
        body = text[body_start:].lstrip("\n")
        return f"## Chapter {n} — {expected}\n\n{body}".strip()

    raise SystemExit(f"Chapter {n} heading not found in canonical source")


def main() -> None:
    chapters = extract_opening_chapters(read(OPENING))
    for n, path in CHAPTERS.items():
        chapters[n] = normalize_later_chapter(n, read(path))

    chapters[4] = re.sub(
        r"(?m)^## Chapter 4 — The Choice$",
        "## Chapter 4 — The Verb",
        chapters[4],
        count=1,
    )

    pieces = [
        "# MACROSCOPIC LIFE",
        "",
        "## Book One — Canonical Assembled Manuscript v0.1",
        "",
        "**Assembly status: PASS 18E continuous-read candidate. Canonical source prose preserved except authorized heading normalization and the Chapter 4 title-only repair.**",
    ]

    for n in range(1, 17):
        if n in PARTS:
            pieces.extend(["", "---", "", f"# {PARTS[n]}", ""])
        pieces.extend(["", chapters[n]])

    assembled = "\n".join(pieces).rstrip() + "\n"

    for n in range(1, 17):
        if len(re.findall(rf"(?m)^## Chapter {n} — ", assembled)) != 1:
            raise SystemExit(f"Assembly gate failed: Chapter {n} count")
    if "## Chapter 4 — The Verb" not in assembled:
        raise SystemExit("Assembly gate failed: Chapter 4 title repair")
    if "## Chapter 11 — The Choice" not in assembled:
        raise SystemExit("Assembly gate failed: Chapter 11 title")
    if re.search(r"(?m)^## Chapter 17 — ", assembled):
        raise SystemExit("Assembly gate failed: Chapter 17 detected")
    for part in PARTS.values():
        if assembled.count(f"# {part}") != 1:
            raise SystemExit(f"Assembly gate failed: {part}")

    OUT.write_text(assembled, encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}")
    print(f"Characters: {len(assembled):,}")
    print(f"Words (approx): {len(assembled.split()):,}")
    print("Assembly gates: PASS")


if __name__ == "__main__":
    main()
