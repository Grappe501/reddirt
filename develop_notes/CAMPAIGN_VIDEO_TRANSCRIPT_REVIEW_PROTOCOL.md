# Campaign video transcript — review protocol

## Rules

1. Never publish raw automatic captions without human review.  
2. Preserve Kelly’s meaning and voice — do not rewrite speeches into marketing copy.  
3. Correct obvious transcription errors (spelling, punctuation, proper names).  
4. Do not remove meaningful qualifying language.  
5. Verify names, counties, offices, organizations, and election terms (Kelly Grappe, Secretary of State, county clerks, ballot initiatives, voting systems).  
6. Document any substantive correction in editorial notes.  
7. Do not publish uncertain text as fact — use `[inaudible]` or `[unclear]` when needed.  
8. Require explicit `transcript.status = PUBLISHED` **and** `publicationStatus = PUBLISHED` before public display.  
9. Invented or placeholder speech text must never ship to production.

## Status flow

`NOT_REQUESTED` → `DRAFT` / `REVIEW_REQUIRED` → `APPROVED` → `PUBLISHED`

Pass 2 may add fetch statuses (`FETCH_PENDING`, etc.) when OAuth caption ingest lands.
