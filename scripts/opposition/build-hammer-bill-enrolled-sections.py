#!/usr/bin/env python3
"""Extract enrolled-act section text from Arkleg PDFs for Hammer curated bills."""
from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path

try:
    import pypdf
except ImportError:
    print("pip install pypdf", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data/opposition/kim-hammer-bill-enrolled-sections.json"
TEMP = ROOT.parent / ".local/temp/arkleg-acts"

# billNumber, actNumber, session folder on Arkleg (e.g. 2021R)
CURATED = [
    ("SB486", "728", "2021R"),
    ("SB487", "729", "2021R"),
    ("SB488", "727", "2021R"),
    ("SB582", "1051", "2021R"),
    ("SB643", "973", "2021R"),
    ("SB644", "974", "2021R"),
    ("SB250", "350", "2023R"),
    ("HB1457", "444", "2023R"),
    ("SB207", "218", "2025R"),
    ("SB208", "240", "2025R"),
    ("SB210", "274", "2025R"),
    ("SB211", "241", "2025R"),
    ("SB291", "279", "2025R"),
    ("SB296", "282", "2025R"),
    ("SB584", "768", "2025R"),
    ("HB1707", "524", "2025R"),
]


def session_folder(session_year: str) -> str | None:
    """2021/2021R -> 2021R"""
    if "/" in session_year:
        return session_year.split("/")[-1]
    return None


def load_narrative_bills() -> list[tuple[str, str, str]]:
    """All bills with act numbers from legislative narratives (in-depth analysis set)."""
    narratives_path = ROOT / "data/opposition/kim-hammer-election-record-legislative-narratives.json"
    if not narratives_path.exists():
        return []
    data = json.loads(narratives_path.read_text(encoding="utf-8"))
    out: list[tuple[str, str, str]] = []
    for bill in data.get("bills", []):
        act = bill.get("actNumber")
        session = bill.get("sessionYear") or ""
        folder = session_folder(session)
        if act and folder:
            out.append((bill["billNumber"], str(act), folder))
    return out


def merge_curated() -> list[tuple[str, str, str]]:
    seen: set[str] = set()
    merged: list[tuple[str, str, str]] = []
    for row in CURATED + load_narrative_bills():
        bill = row[0].upper()
        if bill in seen:
            continue
        seen.add(bill)
        merged.append(row)
    return merged

SECTION_RE = re.compile(
    r"SECTION\s+(\d+)\.\s*(.*?)(?=SECTION\s+\d+\.|APPROVED:|$)",
    re.IGNORECASE | re.DOTALL,
)


def act_pdf_url(act: str, session: str) -> str:
    return (
        f"https://www.arkleg.state.ar.us/Home/FTPDocument"
        f"?path=%2FACTS%2F{session}%2FPublic%2FACT{act}.pdf"
    )


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 1000:
        return
    req = urllib.request.Request(url, headers={"User-Agent": "RedDirt-research-bot/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        dest.write_bytes(resp.read())


def normalize_text(text: str) -> str:
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove PDF header/footer artifacts
    text = re.sub(r"As Engrossed:[^\n]+\n", "", text, flags=re.IGNORECASE)
    text = re.sub(r"/s/[A-Z][^\n]+\n?", "", text)
    text = re.sub(r"\bS[BH]\d{3,4}\n\d+\s+\d{2}/\d{2}/\d{4}[^\n]+\n", "", text)
    text = re.sub(r"\b\d{2}/\d{2}/\d{4}\s+\d{1,2}:\d{2}:\d{2}\s+[AP]M\s+MLD\d+\b", "", text)
    text = re.sub(r"\*MLD\d+\*", "", text)
    text = re.sub(r"Arkansas Code § (\d+)\s*-\s*", r"Arkansas Code § \1-", text)
    lines = []
    for line in text.split("\n"):
        line = re.sub(r"^\s*\d+\s*$", "", line)
        line = re.sub(r"\s+\d+\s*$", "", line)
        if line.strip():
            lines.append(line.strip())
    return "\n".join(lines)


def parse_sections(full_text: str) -> list[dict]:
    body_match = re.search(
        r"BE IT ENACTED BY THE GENERAL ASSEMBLY.*",
        full_text,
        re.IGNORECASE | re.DOTALL,
    )
    body = body_match.group(0) if body_match else full_text
    body = re.split(r"APPROVED:", body, maxsplit=1, flags=re.IGNORECASE)[0]

    sections: list[dict] = []
    for m in SECTION_RE.finditer(body):
        num = m.group(1)
        raw = normalize_text(m.group(2))
        # first sentence often cites Ark Code
        cite_match = re.match(r"(Arkansas Code[^.]+\.)", raw, re.IGNORECASE)
        heading = cite_match.group(1) if cite_match else raw[:160]
        sections.append(
            {
                "sectionNumber": int(num),
                "heading": heading.strip(),
                "statutoryText": raw.strip(),
            }
        )

    if not sections and body.strip():
        sections.append(
            {
                "sectionNumber": 1,
                "heading": "Enrolled act (single-section or unparsed layout)",
                "statutoryText": normalize_text(body)[:12000],
            }
        )
    return sections


def extract_act(bill: str, act: str, session: str) -> dict:
    url = act_pdf_url(act, session)
    pdf_path = TEMP / f"ACT{act}-{session}.pdf"
    try:
        download(url, pdf_path)
        reader = pypdf.PdfReader(str(pdf_path))
        full = "\n".join((p.extract_text() or "") for p in reader.pages)
    except Exception as exc:  # noqa: BLE001
        return {
            "billNumber": bill,
            "actNumber": act,
            "sessionFolder": session,
            "arklegActPdfUrl": url,
            "extractionStatus": "failed",
            "extractionError": str(exc),
            "sections": [],
        }

    sections = parse_sections(full)
    return {
        "billNumber": bill,
        "actNumber": act,
        "sessionFolder": session,
        "arklegActPdfUrl": url,
        "extractionStatus": "ok" if sections else "empty",
        "sections": sections,
    }


def main() -> None:
    bills = []
    for bill, act, session in merge_curated():
        print(f"Extracting {bill} -> Act {act} ({session})...")
        bills.append(extract_act(bill, act, session))

    payload = {
        "generatedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "source": "Arkleg enrolled act PDFs via build-hammer-bill-enrolled-sections.py",
        "claimsGateNote": "Statutory text extracted from enrolled PDFs — verify before broadcast; analysis fields are campaign interpretation.",
        "bills": bills,
    }
    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    ok = sum(1 for b in bills if b.get("sections"))
    print(f"Wrote {OUT} ({ok}/{len(bills)} bills with sections)")


if __name__ == "__main__":
    main()
