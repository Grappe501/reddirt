# Public site + Evidence Workbench — forensic hardening (team brief)

**Date:** 2026-07-30  
**Lane:** `RedDirt/` only  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Doctrine:** Prefer Unknown · Detect ≠ Intake ≠ Save ≠ Approve ≠ Ship · Never silent Approve

## Verdict

The **intended** operator path is sound. Speeches/videos are gated by `PUBLISHED`. Forms create WorkflowIntake. Arrival Folder→Website is Prefer-Unknown aligned.

The **largest real gaps** were: (1) Turbo Fit / homepage flags could grant county albums without Batch Approve, (2) Ship checklist could read “ready” with Unknown / needs-approval backlog, (3) Netlify function bundle excluded Evidence overlay JSON so local holds might not apply on SSR.

Those three are **hardened in this pass**. Residual risks below remain for conscious waiver.

---

## Public site — end-to-end

| Journey | Path | Gate |
| --- | --- | --- |
| Home trust funnel | `/` | Curated videos `PUBLISHED` + homepageEligible |
| Campaign photos | `/campaign-photos` → `/campaign-photos/[county]` | `isAlbumEligible` (geo + Approve **or** legacy FEATURE/HERO) |
| Speeches | `/kelly-speaks` → `[slug]` | `PUBLISHED` + not held |
| Events | `/events` | `isPublicOnWebsite` + workflow PUBLISHED |
| Invite / schedule | `/events/request*`, `/schedule` | Forms APIs |
| Volunteer / join | `/get-involved`, `/volunteer` | `POST /api/forms` → WorkflowIntake |
| Donate | `/donate` | External donate URL |
| Edit hub | `/edit` | Admin session / local admin host |

### Public hardening applied

- Album eligibility no longer treats `homepageCandidate` / `featuredPhoto` alone as live.
- Netlify SSR re-includes Evidence overlay JSON (`photo-evidence`, `speech-evidence`, album index, ingest drafts).

### Residual (present knowingly)

- Legacy **registry FEATURE/HERO** stills with confirmed geo can still appear on albums without Batch Approve (launch catalog). Hold with `approvedForPublic: false`.
- Static files under `public/media/**` remain URL-fetchable if basename is known.
- Soft-gated OS routes (`/counties/[slug]`, etc.) stay reachable with `noindex`.
- Trail gallery pool does not use publicationStatus.

---

## Evidence Workbench — every desk

| Desk | Job | Prefer Unknown checkpoint |
| --- | --- | --- |
| Arrival | Drop → Detect → Bring in | No `-2/-3`; soft-watch detect-only; masters attach never invents |
| Identify | Save → Route | Vision clamp; Hold keeps Unknown |
| County | Batch Approve | Unknown skipped |
| Edit | Pro Edit / promote | Promote now blocks Approve on Unknown |
| Publish | Surfaces + Ship | confirmCurate; Ship ≠ git |
| Calendar | Presence side desk | Export → County still required for Approve |

### Workbench hardening applied

- Turbo Fit Apply cannot set FEATURE/HERO (SUPPORTING/UNREVIEWED only).
- Identify Save blocks Approve / homepage / featured while county is Unknown.
- Promote blocks Approve while county is Unknown.
- Ship `checklistReady` requires needs-approval **and** Unknown backlog clear.

---

## Operator go-live checklist (Netlify)

1. County ≠ Unknown for claimed presence  
2. Identify Saved + Routed  
3. Batch Approve (or intentional FEATURE registry still)  
4. Consent holds cleared  
5. Curated homepage IDs only via confirmCurate when changing lists  
6. Ship binaries → `campaign-shipped/` if promoted  
7. Ship checklist green  
8. `git commit` + `push` overlays, photos, shipped binaries, curated TS  
9. Netlify deploy finished on that commit  
10. Spot-check `/campaign-photos`, journey, `/kelly-speaks`

**Local Approve alone never updates Netlify.**

---

## Ranked residual backlog (not blocked this pass)

| Sev | Item |
| --- | --- |
| P1 | Optionally retire FEATURE album shortcut after registry graduation |
| P1 | Trail photo pool publication gate |
| P2 | Soft-404 confusion on `/counties` redirect vs `/counties/:slug` |
| P2 | Browser drop ignores folder structure (`webkitRelativePath`) |
| P3 | Localhost admin bypass unless `ADMIN_REQUIRE_AUTH_ON_LOCALHOST=1` |
