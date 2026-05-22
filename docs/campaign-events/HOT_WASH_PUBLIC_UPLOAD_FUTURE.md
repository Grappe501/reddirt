# Hot Wash public upload link — future design

**Scaffold route:** `/campaign-events/upload/[eventToken]`  
**Status:** Placeholder UI only; no upload API.

---

## Requirements (Steve)

Anyone with a **signed link** can upload media for one event:

- Uploader name, email, optional phone
- Images, videos, audio/speeches
- Optional caption
- Consent / permission checkbox (“I have rights to share this media with the campaign”)
- Submissions go to the **same pending queue** as admin uploads
- **No** merge into official county folders until campaign manager approval

---

## Proposed route

Prefer: `/campaign-events/upload/[eventToken]`

Alternative: `/event-upload/[token]`

Token properties (to implement):

- Opaque, unguessable (≥ 128 bits entropy)
- Bound to single `eventRecordId`
- Optional expiry and max upload count
- Revocable by campaign manager
- Rate-limited per IP (edge/WAF)

---

## Security (before go-live)

| Control | Notes |
|---------|--------|
| Token storage | Hash token at rest; display once on create |
| Auth | No admin session; token is capability |
| File validation | MIME sniff + size cap + extension allowlist |
| Malware | ClamAV or cloud scan hook |
| PII | Captions optional; no voter-file linkage |
| Abuse | CAPTCHA or Turnstile on public form |

---

## API shape (future)

`POST /api/public/campaign-events/upload/[token]`

- Multipart: `file`, `uploaderName`, `uploaderEmail`, `uploaderPhone`, `caption`, `consent`
- Calls same `uploadHotWashMedia()` with `uploadSource: public_link`
- Returns `{ ok, mediaId }` — no file path leak

---

## Operator workflow unchanged

Public uploads appear in `/admin/campaign-events/media-approval` with `uploadSource: public_link`.

---

## SEO / website publish (later)

Approved archive paths feed owned-media / public site only after:

1. CM approval
2. Optional metadata enrichment (event title, county, date, alt text)
3. Separate “publish to web” gate (not this pass)
