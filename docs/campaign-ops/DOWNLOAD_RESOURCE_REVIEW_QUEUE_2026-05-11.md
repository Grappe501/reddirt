# Download resource review queue · Ernie polish pipeline

**Date:** 2026-05-11  
**Lane:** `RedDirt/`  
**Authoritative ops rule:** No campaign download (PDF, handout, pack, template file) is **Published** or **direct-linked** until: content exists → visual mockup → **Ernie review** → **campaign approval** → final file uploaded to `public/`.

**Code / UI:**

- Source list: `src/lib/volunteer-resources.ts`
- Publication + gates: `src/lib/volunteer-resource-publication.ts` (`presentVolunteerResource`, `volunteerPublicPdfExists`)
- Volunteer library UI: `src/components/volunteer/VolunteerResourceLibrary.tsx`, `/volunteer/resources`

**Related:** `PRODUCTION_READINESS_AUDIT_2026-05-11.md` §§16–20

---

## Public safety check (2026-05-11)

| Check | Result |
|-------|--------|
| `.pdf` under `public/` | **None** (0 files) |
| Unpublished / `comingSoon` PDFs as direct download | **No** — cards render as non-clickable blocks; `allowDirectFileDownload` is false |
| `publicationStatus: published` alone enables PDF download | **No** — must also satisfy Ernie `ernie_approved`, campaign `approved`, and on-disk file for local PDF paths |
| Accidental public downloads found | **None** in code review |

---

## Summary counts

| Metric | Count |
|--------|------:|
| Total rows in `VOLUNTEER_RESOURCES` | **125** |
| Unique PDF target paths (`/resources/...pdf`) | **11** |
| Resource rows that reference a PDF (includes duplicates) | **14** |
| Rows with `comingSoon: true` | **36** |
| Muslim Community draft anchors (web) | **12** |
| Event-lane playbook links (web, not file downloads) | **8** |

**Interpretation:**

- **Ernie review required (PDF file):** treat **11 unique files** as mandatory pipeline; **14 cards** in the library point at those targets (duplicate cards for launch kit).
- **Ernie / polish relevant (web, coming soon):** **36** rows — send content to Ernie when a print/PDF/export is planned.
- **“Target path only”:** all **11** PDFs — no bytes in `public/` yet.

---

## A. Canonical PDF queue (11 files — one row per path)

| # | Title (primary) | Representative `id` | Category | Audience | Target path | `comingSoon` | Publicly direct? | Ernie (typical) | Mockup | Campaign | Next action |
|---|-----------------|---------------------|----------|----------|-------------|--------------|------------------|-----------------|--------|----------|-------------|
| 1 | Quick start guide | `quick-start` | getting-started | New volunteers | `/resources/getting-started/quick-start-guide.pdf` | yes | No | needs_document_build | not_started | not_started | Draft content → mockup → Ernie |
| 2 | Volunteer welcome packet | `welcome-packet` | getting-started | New volunteers | `/resources/getting-started/volunteer-welcome-packet.pdf` | yes | No | needs_document_build | not_started | not_started | Same |
| 3 | Team launch checklist | `team-launch-checklist` | team-building | Triad leads | `/resources/team-building/team-launch-checklist.pdf` | yes | No | needs_document_build | not_started | not_started | Same |
| 4 | Team builder worksheet | `team-builder-worksheet` | team-building | Triad leads | `/resources/team-building/team-builder-worksheet.pdf` | yes | No | needs_document_build | not_started | not_started | Same |
| 5 | Weekly reporting template | `reporting-template` | weekly-operations | Team coordinators | `/resources/weekly-operations/weekly-reporting-template.pdf` | yes | No | needs_document_build | not_started | not_started | Same |
| 6 | QR code sharing guide | `qr-sharing` | recruitment | Field / tabling | `/resources/recruitment/qr-code-sharing-guide.pdf` | yes | No | needs_document_build | not_started | not_started | Same |
| 7 | Volunteer QR code | `volunteer-qr` | recruitment | Field / tabling | `/resources/recruitment/volunteer-qr-code.pdf` | yes | No | needs_document_build | not_started | not_started | Same |
| 8 | One-page role cards | `role-cards-print` | printables | All lanes | `/resources/printables/role-cards.pdf` | yes | No | needs_document_build | not_started | not_started | Same |
| 9 | Team worksheets | `team-worksheet-print` | printables | Triads | `/resources/printables/team-worksheets.pdf` | yes | No | needs_document_build | not_started | not_started | Same |
| 10 | Event checklists | `event-checklist-print` | printables | Events | `/resources/printables/event-checklists.pdf` | yes | No | needs_document_build | not_started | not_started | Same |
| 11 | Complete field playbook (PDF) | `playbook-pdf` | playbook | Leads / trainers | `/resources/playbook/field-playbook-complete.pdf` | yes | No | needs_document_build | not_started | not_started | Large doc — stage after core PDFs |

**Duplicate cards (same path, additional `id`s):**

| `id` | Duplicates path of |
|------|--------------------|
| `launch-checklist` | #3 |
| `launch-p5-worksheet` | #9 |
| `launch-qr-guide` | #6 |

---

## B. Download-adjacent web resources (`comingSoon: true`)

**36 rows** span categories: `youth-p5-outreach`, `social-media-design`, `team-launch-kit` (web+pdf mix), `muslim-community-outreach` uses draft web anchors without always setting `comingSoon` — see §C.

**Typical row shape in queue:**

| Field | Value |
|-------|--------|
| Intended audience | Category default (youth coordinators, social leads, etc.) |
| Current status | Web **internal_review** (inferred) when `comingSoon` |
| Publicly clickable? | **Yes** as navigation to hub/anchor (not a binary download) |
| Ernie | **not_started** for PDF path N/A; when exporting to PDF, use pipeline |
| Mockup | **not_started** until design assigned |
| Campaign | **not_started** / **pending** |
| Next action | Finish copy on page; if printable/exportable asset planned → **Send content to Ernie for polished mockup** |

**Notable hubs:** `/volunteer/resources/youth-outreach`, `/volunteer/resources/social-media-design`, `/volunteer/resources/team-launch-kit`, `/volunteer/resources/county-party-launch-kit` (tiles may still say “Coming soon” in page-level UI).

---

## C. Muslim Community resources (draft web anchors)

| Title | `id` | Path | Ernie / notes |
|-------|------|------|----------------|
| Live dashboard | `mc-dashboard-live` | `/dashboard/community/muslim` | Product shell — not a file download |
| Resource hub | `mc-hub` | `/volunteer/resources/muslim-community` | **Partner review** — draft sections |
| Youth / Women’s guides | `mc-youth-*`, `mc-women-*` | `muslim-community` anchors | **needs content / mockup** where sections are outline-only |

**Next action:** Community leadership review → then Ernie for any printable exports.

---

## D. Events lane toolkits (field playbook — web)

These are **web playbooks**, not PDFs in `public/` unless exported later:

| `id` | Title | Path |
|------|-------|------|
| `ev-house-party-toolkit` | House Party Toolkit | `/field-playbook/roles/house-party-playbook` |
| `ev-fundraising-toolkit` | Fundraising Event Toolkit | `/field-playbook/roles/fundraising-receptions-county` |
| `ev-weekend-immersion` | Weekend Community Immersion | `/field-playbook/roles/weekend-community-immersion` |
| `ev-two-day-city` | Two-day city immersion | `/field-playbook/roles/two-day-city-immersion` |
| `ev-faith-visits` | Faith community visit guide | `/field-playbook/roles/faith-community-visits` |
| `ev-travel-rhythm` | Travel rhythm model | `/field-playbook/roles/travel-rhythm-model` |
| `ev-clerk-checklist` | County Clerk visit checklist | `/field-playbook/roles/county-clerk-visit-checklist` |
| `ev-local-guide` | Local guide checklist (Kelly visits) | `/field-playbook/roles/festivals-fairs-local-guide` |

**Next action:** If any are repackaged as volunteer PDFs, add a row under §A and run full Ernie + upload gate.

---

## E. Metadata fields (TypeScript)

On `VolunteerResource` (optional; inferred when omitted):

- `ernieReviewRequired?` (default **true** for PDFs)
- `ernieReviewStatus?`
- `mockupStatus?`
- `campaignApprovalStatus?`
- `productionNotes?`

Labels are in `VOLUNTEER_RESOURCES` companion exports: `ERNIE_REVIEW_LABELS`, `MOCKUP_STATUS_LABELS`, `CAMPAIGN_APPROVAL_LABELS`.

---

## F. Direct download gate (implementation checklist)

Direct download allowed only when **all** apply:

1. `isPdfOrFileDownloadHref` / PDF row  
2. `!comingSoon`  
3. `publicationStatus === published` (inferred or explicit)  
4. `ernieReviewStatus === ernie_approved` (or `ernieReviewRequired === false` with documented exception)  
5. `campaignApprovalStatus === approved`  
6. `volunteerPublicPdfExists(href) === true` for site-root `.pdf` paths  

---

## G. Next actions (ops)

1. Prioritize **11 PDFs** for Ernie queue order (quick start → role cards → QR → …).  
2. Upload finished PDFs to `public/` **only after** approvals; then set explicit metadata on the row.  
3. Keep this document updated when statuses change (or replace with Notion/Sheet and link here).
