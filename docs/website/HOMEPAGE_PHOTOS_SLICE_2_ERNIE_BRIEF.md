# Ernie brief — Slice 2 Campaign Photography

**Authorization code:** `KELLY-HOMEPAGE-PHOTOS-SLICE-2.0`  
**Status:** READY TO BUILD (do not wait on Netlify production unblock)  
**Depends on:** Slice 1 DONE (`KELLY-HOMEPAGE-POLISH-SLICE-1.0`, commit `b82cecfc`)  
**Decision source:** [`HOMEPAGE_FORWARD_PLAN.md`](./HOMEPAGE_FORWARD_PLAN.md) — Decision 2 STILLS ONLY  
**Baseline:** [`HOMEPAGE_CURRENT_STATE_ASSESSMENT.md`](./HOMEPAGE_CURRENT_STATE_ASSESSMENT.md)  
**Registry:** `src/content/media/campaign-photo-registry.ts` + `public/media/campaign-photos/`

**Parallel note:** Production Netlify Lambda 400 is with human Support. Slice 2 ships on the feature branch; production smoke remains blocked until Support excludes `kgrappe` from the rollout.

---

## Goal

Strengthen the trust-funnel homepage with **curated campaign stills** so visitors see Kelly listening and traveling Arkansas — without Track C video, Shorts, autoplay, or CMS-driven home.

**Launch message to reinforce:**

> Kelly Grappe is a trusted, accessible leader who is traveling Arkansas, listening to people, and prepared to serve as Secretary of State.

---

## Hard constraints

| Rule | Required |
|------|----------|
| Keep hybrid trust-funnel shell | Yes — no redesign |
| Track C video / Shorts / personality embeds | **OFF** |
| `getMergedHomepageConfig` on `/` | **Unused** |
| Photos / news / endorsements as separate later slices | Endorsements = Slice 3; News = Slice 4 — **do not build full endorsement or news bands here** |
| Invent geography / quotes / résumé claims | **Never** — Unknown stays Unknown |
| Minors in frame | SUPPORTING / hold / consent before any homepage surface |
| Unrelated dirty files (middleware, election-plan, etc.) | **Do not stage** |
| Secrets in commits / chat | **Never** |

---

## In scope (Slice 2 only)

1. **Select** a small curated set from `CAMPAIGN_PHOTO_REGISTRY` (prefer `FEATURE`, clear Kelly presence, good alt/caption).
2. **Wire stills** into the existing funnel (swap content inside bands — not new architecture):
   - **Hero support** — secondary still or replace/augment legacy Squarespace banner *only if* a true HERO/FEATURE candidate is Steve-approved; otherwise keep current hero media and add a photo band lower on the page.
   - **Meet Kelly** — one strong portrait/trail still beside or under the concise preview.
   - **Latest Campaign Photos** — new lightweight band (locked Decision 6) driven by registry helpers (`listFeatureCandidates` / county-safe filters), not admin homepage merge.
   - **On the Road** — optional: use a trail still as empty-state visual; do not replace live events/posts.
3. **Mark** chosen records `homepageCandidate: true` only for the curated set (currently all false).
4. **Accessibility:** real alt + caption; keyboard-safe gallery; no autoplay; respect reduced motion.
5. **Proof script** + typecheck + production build (local). Commit/push feature branch.

### Explicitly out of Slice 2

- Endorsement band (Slice 3)
- Latest News / campaign updates band (Slice 4)
- YouTube / Shorts / Track C (Slice 5)
- Publishing DRAFT registry photos to production CDN beyond existing `public/media/campaign-photos/` files
- Guessing Polk/Mena/etc. without locked in-frame evidence

---

## Recommended curation (starting shortlist)

Ernie should open the registry and pick **6–10** max for launch home. Prefer locked geography when available; Unknown is fine if caption stays honest.

**Strong candidates (examples — verify in registry before wiring):**

- Locked geo FEATURE sets: War Memorial / Pulaski, Toad Suck / Faulkner, Watermelon / Sharp, Peach / Johnson, Mena meet-greet if Steve-confirmed
- Retail politics: door conversation, Elks Lodge breakfast, hallway conversation, stadium community stills
- Avoid homepage: SUPPORTING-only backs-to-camera unless paired; minor-heavy frames; protest-sign crops needing legal/comms review; other-candidate button clutter without crop notes

Steve may override the shortlist before merge.

---

## Implementation sequence for Ernie

### A. Prep

1. Branch: `feature/kelly-schedule-settlement-dashboard` (or Steve-approved continuation).
2. Read: forward plan Decisions 1–2 + 6; Slice 1 report; `campaign-photo-types.ts`; registry list helpers.
3. Propose curated ID list in the PR/pass summary **before** large UI work if Steve wants review; otherwise curate carefully and document IDs in the Slice 2 report.

### B. Code

1. Add a small selector module (e.g. `src/content/media/homepage-campaign-photos.ts`) that returns curated homepage stills from the registry — **file-backed**, not DB.
2. Set `homepageCandidate: true` on those records only.
3. Add `TrustFunnelCampaignPhotosSection` (name flexible) mounted in `HomeTrustFunnelWireframe` — suggested placement: after Meet Kelly or before/after On the Road (one band, not three competing galleries).
4. Meet Kelly: optional still with alt from registry; keep copy concise (Slice 1).
5. Hero: only change if curated HERO-quality still exists; default = keep Slice 1 hero + photo band.
6. Do **not** remount `HomeExperience` or Track C components.

### C. Proof

Minimum:

```bash
cd H:/SOSWebsite/RedDirt
node scripts/run-with-h-drive-env.cjs npm run agents:test-campaign-photos
node scripts/run-with-h-drive-env.cjs npm run agents:test-homepage-polish-slice1
# Add: agents:test-homepage-photos-slice2 (new) asserting:
# - no YouTube/Shorts on home wireframe
# - getMergedHomepageConfig unused on page.tsx
# - homepageCandidate count matches curated set
# - photo band mounts
node scripts/run-with-h-drive-env.cjs npm run typecheck
node scripts/run-with-h-drive-env.cjs npm run build
```

### D. Ship

- Commit only Slice 2 files + docs report.
- Push feature branch.
- **Do not** claim production deploy until Netlify Support clears Lambda 400.
- Final recommendation line: `READY FOR SLICE 3 — ENDORSEMENTS` or `SLICE 2 REMEDIATION REQUIRED`.

---

## Pass completion format (Ernie)

- Authorization code
- Curated photo IDs (table: id, heroLevel, county/city, homepage slot)
- Files changed
- Before/after behavior
- QA results (tests / typecheck / build)
- Git: branch, commit, push
- Deploy status: **blocked on Netlify Support** (expected) vs branch green
- Recommendation: READY FOR SLICE 3 or REMEDIATION

---

## What Steve is doing in parallel

Human Netlify Support ticket for Lambda rollout exclusion on `kgrappe`. Ernie does **not** burn clear-cache redeploys. If Support unblocks mid-slice, production smoke is a separate ops pass — not a Slice 2 scope expand.
