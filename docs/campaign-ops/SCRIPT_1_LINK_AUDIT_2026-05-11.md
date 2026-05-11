# Script 1 — Full page / link audit (unfinished routes only)

**Date:** 2026-05-11  
**Branch:** `field-structure-preview`  
**Lane:** `RedDirt/`  
**Scope:** Public routes under `src/app/(site)/` plus material dashboard/community/team/volunteer surfaces. Admin routes are **out of scope** for this pass (operational, not volunteer meeting-facing).

**Method:** Static inventory of `page.tsx` files, code search for `coming soon`, `scaffold`, `draft`, `Form coming soon`, placeholder copy, and verification that `/public` contains no volunteer PDF assets at referenced paths.

**Related:** `PRODUCTION_READINESS_AUDIT_2026-05-11.md`

---

## 1. Pages audited (counts)

| Bucket | Approx. count | Notes |
|--------|---------------|--------|
| `(site)` routes (`page.tsx`) | **115** | Main public + volunteer + dashboard tree |
| New scaffold sub-routes (this pass) | **+4** | `conversational-spanish/resources`, `rollup`; `marshallese/resources`, `rollup` |
| Admin `(board)` and tools | **130+** | Not exhaustively classified here |

---

## 2. Community slugs — confirmed

| Slug | Route | Status |
|------|-------|--------|
| Muslim | `/dashboard/community/muslim` | **Live shell** — full nav (Overview, P5/VR, Events, Social, Youth, Women’s, mosque polling, resources, messages, rollup). **Draft / partner review** labels. |
| Conversational Spanish | `/dashboard/community/conversational-spanish` | **Scaffold upgraded** — `layout` + `CommunityRegionScaffoldShell`, tabs Overview · Resources · Rollup; countdown + community goal card on Overview. |
| Marshallese | `/dashboard/community/marshallese` | Same as Spanish. |
| County Democrats hub | `/dashboard/community/county-democrats` | Hub + picker to counties. |
| County Democrats instance | `/dashboard/community/county-democrats/[countySlug]` | Per-county shell + lanes (monthly meeting, P5/VR, events, social, youth, women’s, precinct, resources, messages, rollup). |

**Fix this pass:** Spanish and Marshallese previously used `PageHero` only while `CommunityRegionHero` quick actions assume `/resources` and `/rollup` exist — those paths are now **real stub pages** so hero links **do not 404**.

---

## 3. Percent complete — community lanes (meeting-readiness)

Judgment call for **Ernie / stakeholder review**, not a code metric:

| Lane | % complete | Blockers |
|------|------------|----------|
| **Muslim Community** | **~45%** | Partner review banner; draft metadata; mock/placeholder KPI rollups; community contribution vs county file not wired. |
| **Conversational Spanish** | **~30%** | Scaffold only; no lane modules (Events/Social/P5/etc.); no partner content packs; rollup is prose stub. |
| **Marshallese** | **~30%** | Same as Spanish. |
| **County Democratic Party** (template) | **~55%** | Real county shell and workflows; KPI strips partly mock; depends on county slug and DB stats coverage. |

---

## 4. Unfinished pages only (route → issue → % complete)

Only routes that are **not** meeting-ready are listed. Omitted: stable marketing pages, field-playbook, blog shells, donate, privacy, counties index, etc.

### 4.1 Volunteer & resources

| Route | % | Issue |
|-------|---|--------|
| `/get-involved` | **25%** | **Form coming soon** — no production signup. |
| `/get-involved/bring-5` | **20%** | **Signup coming soon.** |
| `/start-a-local-team` | **25%** | **Form coming soon.** |
| `/volunteer/resources/county-party-launch-kit` | **60%** | Content exists; **Coming soon** tiles for downloadable/table rows. |
| `/volunteer/resources/team-launch-kit` | **55%** | **Coming soon** sections. |
| `/volunteer/resources/social-media-design` | **55%** | **Coming soon** for templates; brand download gated. |
| `/volunteer/resources` (library) | **70%** | Functional; **all PDF hrefs are unshipped files** (see broken links). |
| `/resources/volunteer` | **65%** | Legacy/alternate entry — verify parity with `/volunteer/resources` in Script 2. |

### 4.2 Events / organizing

| Route | % | Issue |
|-------|---|--------|
| `/events/county-fairs` | **40%** | **County map — coming soon.** |

### 4.3 Dashboard — team workspaces

| Route pattern | % | Issue |
|---------------|---|--------|
| `/dashboard/team/[teamSlug]/*` | **50–65%** | Mix of **mock seed** and DB-backed teams; invite/QR placeholders; role task placeholders; brand kit **Coming soon** on Social tab. |
| `/dashboard/team` | **70%** | Entry/list — depends on auth/product rules. |
| `/dashboard/messages` | **55%** | Verify wiring vs mock in production review. |
| `/dashboard/power-of-5-preview` | **45%** | Preview/draft nature of route name — confirm before external link. |

### 4.4 Dashboard — community regions

| Route | % | Issue |
|-------|---|--------|
| `/dashboard/community/muslim/*` | **45%** | Draft/review; incomplete live metrics. |
| `/dashboard/community/conversational-spanish/*` | **30%** | Scaffold tabs only. |
| `/dashboard/community/marshallese/*` | **30%** | Scaffold tabs only. |
| `/dashboard/community/county-democrats/[countySlug]/*` | **55%** | Production shape; DB/stats coverage varies; mock KPI helpers may apply. |

### 4.5 County goals / clocks

| Item | % | Notes |
|------|---|--------|
| County registration deadline in UI | **80%** | Shown with **pending legal confirmation** — not final for public compliance until SOS + counsel. |
| Community regional contribution to 50k | **15%** | Placeholder on `CountyRegistrationGoalCard` community mode. |

---

## 5. Broken links & asset gaps

### 5.1 PDFs (high severity if directly linked as static files)

All `VOLUNTEER_RESOURCES` entries pointing at `/resources/...pdf` have **no matching files under `RedDirt/public/`** (verified: **0 PDFs** in `public`). UI **should** gate downloads until `published` — **direct URL entry still 404s**.

| Example path | Result |
|--------------|--------|
| `/resources/getting-started/quick-start-guide.pdf` | **404** (asset not in repo) |
| `/resources/playbook/field-playbook-complete.pdf` | **404** |
| (9+ similar PDF paths) | **404** |

**Action:** Script 2 — Ernie queue + upload + `publicationStatus` — do not mark Published until file exists.

### 5.2 Fixed this pass

| Before | After |
|--------|-------|
| `CommunityRegionHero` → `/dashboard/community/conversational-spanish/resources` | **200** — stub page |
| Same for `/rollup` | **200** — stub page |
| Same for Marshallese | **200** |

### 5.3 To verify in Script 2 (spot checks)

- External `https://` links in static content (manual or crawler).
- `field-playbook` deep links vs `md-manifest` (separate ticket if mismatches found).

---

## 6. Mock / draft signals (not exhaustive)

- `MuslimCommunityReviewBanner` on Muslim lanes.
- `mock-data.ts` shared files / messages.
- `VosRoleTasksSection` references `role-task-placeholders.ts`.
- Team Social: **Download brand kit** placeholder tile.
- Admin ECC / Message Studio: **no send** disclaimers — correct for ops, not “unfinished” for volunteers.

---

## 7. Deliverable checklist (Script 1)

- [x] Crawl `(site)` route tree (+ community scaffolds corrected).
- [x] Unfinished-only narrative with % estimates.
- [x] Community slug confirmation + scaffold upgrade for Spanish/Marshallese.
- [x] Broken link report (PDFs + pre-fix hero stubs).
- [x] Push pending (see git commit below).

---

## 8. Next scripts (queued)

2. Resource download review queue (Ernie).  
3. Forms + global BCC to ops email.  
4. GOTV lane.  
5. Fundraising OS.  
6. Automation + Discord plan (no bots).

---

## 9. Honest production verdict

**Not production-ready:** stubs, draft banners, missing PDFs, mock-heavy dashboards, and unverified sitewide links remain. **Meeting-ready = production-ready** — this audit lists gaps explicitly for Ernie and counsel review.
