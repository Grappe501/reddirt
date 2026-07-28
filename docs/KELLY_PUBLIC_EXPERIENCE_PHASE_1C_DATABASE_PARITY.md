# KELLY-PUBLIC-EXPERIENCE-FOUNDATION-1.0 — Phase 1C

**RedDirt Database Identity and Schema Parity**  
**Lane:** `H:\SOSWebsite\RedDirt`  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Start HEAD:** `4d0e860b33e98af6b370c519b6e84a3ca7be4ec8`  
**Date:** 2026-07-28 (UTC)

---

## 1. Baseline (redacted)

| Item | Value |
|------|--------|
| Prisma | 5.22.0 |
| DB host family | Supabase **session pooler** `*.pooler.supabase.com:5432` |
| Database name | `postgres` |
| DATABASE_URL / DIRECT_URL | Same pooler family (credentials redacted) |
| Schemas | `public`, `auth` (Prisma `multiSchema`) |
| `_prisma_migrations` finished rows | ~110 |
| Local migrations on branch (after 1C) | **95** |
| Unrelated dirty files (not staged) | `scripts/netlify-enforce-env-scopes.cjs`, election-plan auth, volunteer middleware, `src/middleware.ts` |
| Application tables (public approx.) | ~323 (shared / multi-generation) |

---

## 2. Database identity classification

**Conclusion: B — Shared multi-application database**  
(also consistent with **C — Legacy partially adopted by RedDirt**)

### Evidence

1. **RedDirt PascalCase anchors present:** `"User"`, `"WorkflowIntake"`, `"OwnedMediaAsset"`, `"PublicMediaPlacement"`, `"ContactPreference"`, `"WorkflowAction"`.
2. **Legacy / other-system tables coexist:** lowercase `submissions`, `users`, `voters`, `counties`, `volunteer_intake_submissions`, many `ar02_*` / voter warehouse tables, plus `auth.*`.
3. **Core Prisma tables missing despite “applied” migrations:** `"Submission"` was absent; `"VoterRecord"` absent; `"County"` PascalCase absent (snake `counties` exists and is `@@map`'d for County).
4. **Baseline lie markers:** `20260421120000_init`, `20260421221514_volunteer_signup_sheet_intake`, `20260425130000_campaignos_phase1_workflow_intake`, and `20260221143000_voter_file_snapshots_and_metrics` are marked finished with **`applied_steps_count = 0`** — history claims applied without durable objects.
5. **Not identity D (wrong DB):** RedDirt operational tables and Phase 1 media objects live here; Netlify migrate failures in 1B targeted this same migration history.

**Not A** (not exclusively RedDirt). **Not E** (evidence is sufficient for ownership decisions below).

---

## 3. RedDirt schema fingerprint

Machine-readable diagnostic (derived from Prisma + migrations; **not** a second source of truth):

`data/database/red-dirt-schema-fingerprint.json`

Focus models for public experience foundation:

| Model | Expected physical table | Exclusive RedDirt-owned? |
|-------|-------------------------|----------------------------|
| User | `"User"` | Yes |
| Submission | `"Submission"` (PascalCase) | Yes — must **not** claim legacy `submissions` |
| WorkflowIntake | `"WorkflowIntake"` | Yes |
| WorkflowAction | `"WorkflowAction"` | Yes |
| ContactPreference | `"ContactPreference"` | Yes |
| OwnedMediaAsset | `"OwnedMediaAsset"` | Yes |
| PublicMediaPlacement | `"PublicMediaPlacement"` | Yes |
| VoterRecord | `"VoterRecord"` | Intended yes; **absent** on linked DB |

---

## 4. Legacy `submissions` ownership

**Classification: SUBMISSION-C** — belongs to a different application/system; must not be claimed by Prisma `Submission`.

| Fact | Evidence |
|------|----------|
| Physical name | `public.submissions` |
| Shape | `id uuid`, `module_id`, `raw_data`, `source`, `processed`, `created_at` |
| Row count | **0** |
| Overlap with Prisma Submission | **None meaningful** (Prisma: `userId`, `type`, `content`, `structuredData`) |
| Init migration intent | `CREATE TABLE "Submission"` (PascalCase) |
| `@@map("submissions")` origin | Commit `ff53b3db` schema-map refresh + `align-prisma-schema-map.mjs` curated “common plural” proposal — **incorrect** on this shared DB |
| WorkflowIntake FK | Column `submissionId` exists; FK to `"Submission"` was **missing** (campaignos migration baseline-lied) |

**Not SUBMISSION-A/B** — shape and provenance do not match RedDirt forms.

---

## 5. User / `linkedVoterRecordId` parity

**Classification: USER-A** — intended additive nullable field; missing due to migration drift (baseline marker without durable column).

| Fact | Evidence |
|------|----------|
| Schema | `User.linkedVoterRecordId String?` + optional relation to `VoterRecord` |
| Introducing migration | `20260421221514_volunteer_signup_sheet_intake` |
| DB before 1C | Column **absent** on `"User"` |
| `VoterRecord` table | **Absent**; voter warehouse tables are different physical objects |
| FK posture | **Deferred** until `VoterRecord` exists — column only, no invented voter links |

**Not USER-B** (no equivalent column under another name on `"User"`).

---

## 6. Migration history findings

- Current branch was **not** missing the volunteer / init SQL files; those migrations are present but were historically **marked applied with zero steps**.
- Do **not** re-run or rewrite those historical migrations.
- Correct approach: **new additive** migration that creates the missing RedDirt objects safely.
- `scripts/align-prisma-schema-map.mjs` updated so Submission is **doNotAutoMap** (never map to legacy `submissions` again).

---

## 7. Selected reconciliation strategy

**STRATEGY B — Shared database, isolate RedDirt tables** (for Submission)  
**plus additive USER-A column** (no FK until `VoterRecord` exists)

Preferred principle applied:

1. Leave legacy `public.submissions` untouched.
2. Give Prisma `Submission` its RedDirt-owned physical table: PascalCase `"Submission"` (remove incorrect `@@map("submissions")`).
3. Additive migration only.
4. Preserve application model name `Submission`.

---

## 8. Exact schema changes

### Prisma

- Removed `@@map("submissions")` from `model Submission` (default physical name `"Submission"`).
- Documented why lowercase map is forbidden.

### Migration

**Name:** `20260728010000_phase1c_reddirt_submission_user_parity`

**Actions (additive / reversible in intent):**

1. `CREATE TABLE IF NOT EXISTS "Submission"` (RedDirt columns).
2. `Submission_userId_fkey` → `"User"` when missing.
3. `WorkflowIntake_submissionId_fkey` → `"Submission"` when missing.
4. `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "linkedVoterRecordId" TEXT`.
5. Conditionally add `User_linkedVoterRecordId_fkey` **only if** `"VoterRecord"` exists (it does not today).

**Not done:** drop/rename/truncate legacy `submissions`; `migrate reset`; `db push`; env URL changes.

---

## 9. Proofs

### Operator proof — `scripts/phase1c-operator-proof.cjs`

**Result: 16/16 PASS** (synthetic `phase1c-proof` / `@example.invalid`; cleaned up).

Covered:

- Both tables present; legacy shape unchanged; legacy row count unchanged (0)
- Prisma writes to PascalCase `"Submission"`
- User upsert + null `linkedVoterRecordId`
- Submission create/read + User relation
- Join: User + Submission + WorkflowIntake + WorkflowAction + ContactPreference
- Volunteer: interests persist + intake spine
- Repeat submission safe
- No automatic outreach APIs called

### Focused tests

`npm run agents:test-public-experience-foundation` — **PASS** (includes Phase 1C Submission map assertion).

### Migrate / validate / typecheck

| Command | Result |
|---------|--------|
| `npm run stack:migrate` | Applied Phase 1C migration; status **up to date** |
| `npx prisma validate` | Valid |
| `npm run typecheck` | Pass |

### Netlify

| Check | Result |
|-------|--------|
| Site | `kgrappe` |
| `DATABASE_URL` / `DIRECT_URL` keys | Present in production context listing |
| Host family classify via CLI | Timed out / incomplete this pass — **no env vars changed** |
| Same-family inference | Local linked DB is the Phase 1B migrate target; 1C migration already applied there — Netlify deploy should see clean status when rebuild runs |
| Production redeploy | **Not completed in this pass** (operator / Netlify UI) |
| Env mutation | **None** (correct — no approval to change targets) |

---

## 10. Legacy data preservation

- Legacy `submissions` columns unchanged (`module_id`, `raw_data`, …).
- Legacy row count remained **0** through proofs.
- No truncate, drop, or rename of legacy tables.

---

## 11. Remaining risks

1. **Baseline-lied migrations** remain in history (`applied_steps_count = 0`) — other missing objects (e.g. full `VoterRecord` graph) may still surprise other features.
2. **`User.linkedVoterRecordId` has no FK** until `VoterRecord` exists — intentional soft integrity.
3. **Netlify production redeploy + live form smoke** still required before declaring production intake proven.
4. Shared DB means future `@@map` “plural snake” heuristics remain dangerous.

---

## 12. Track C gate

| Gate | Status |
|------|--------|
| Database identity confirmed | **Yes — B** |
| Submission ownership documented | **Yes — SUBMISSION-C** |
| Legacy submissions preserved | **Yes** |
| Prisma Submission create/read | **Yes** |
| User upsert + linkedVoterRecordId parity | **Yes** (column; FK deferred) |
| Join / volunteer E2E spine | **Yes** (operator proof) |
| Consent / WorkflowAction / Intake / interests | **Yes** |
| No automatic outreach | **Yes** |
| stack:migrate clean | **Yes** |
| Typecheck / focused tests | **Yes** |
| Build | **Pass** (`npm run build`, Next.js 15.5.15) |
| Netlify DB target verified | **Partial** |
| Netlify redeploy + homepage smoke | **Pending** |
| Unrelated dirty files untouched | **Yes** |
| Operator report complete | **Yes (this doc)** |

**Track C: KEEP CLOSED** until Netlify redeploy + public homepage/form smoke on production.

---

## 13. Cleanup

Proof marker: `phase1c-proof` / emails `phase1c.*.@example.invalid`.  
Script auto-deletes after success. Manual leftover sweep already run once this pass.

```text
node scripts/run-with-h-drive-env.cjs node scripts/phase1c-operator-proof.cjs
```

---

## 14. Final recommendation

**KEEP TRACK C CLOSED**

Database ownership and schema parity for Submission/User are reconciled on the linked shared Supabase database. Open `KELLY-HOMEPAGE-PERSONALITY-1.0` only after Netlify production redeploy confirms migrate status clean and public join/volunteer write against PascalCase `"Submission"`.

---

## 15. Approved Track C video inputs (preserved for homepage personality)

**Status:** Documented approved inputs only — **not** implemented on the public homepage in Phase 1C.  
**Track C:** Remains **CLOSED** until the Netlify / production intake gate in §12 clears.  
**Machine-readable companion:** `data/public-experience/kelly-homepage-personality-approved-videos.json`

These two YouTube assets are distinct website roles. Do not treat them as interchangeable.

| Asset | Role | Why it exists |
|-------|------|----------------|
| **This Office Belongs to the People!** | Core **message** video | Reinforces governing philosophy and homepage framing: *Government That Works for Every Arkansan — People Over Politics.* |
| **Creating the Ripples in Hot Springs Village** | **Personality / momentum** video | Shows Kelly in community, campaign energy, and geographic presence across Arkansas. |

### 15.1 Canonical external video records

Privacy-enhanced embed hosts (preferred):

```text
https://www.youtube-nocookie.com/embed/eKVz5pFJxtk
https://www.youtube-nocookie.com/embed/aO712RsR0pQ
```

Watch URLs (source of truth for IDs):

- Message: https://youtu.be/eKVz5pFJxtk
- Ripples: https://youtu.be/aO712RsR0pQ

#### Record A — message / office vision

```text
Provider: YouTube
Video ID: eKVz5pFJxtk
Title: This Office Belongs to the People!
Display title: This Office Belongs to the People
Suggested page role: campaign philosophy / office vision
Suggested homepage slot: home.message.primary  (proposed — register in Track C; not in Phase 1 slot registry yet)
Public approval: operator controlled
Featured: yes (homepage message band)
```

**Required metadata fields when registered in media architecture:** custom poster, transcript or summary, short summary, location (optional), event date (optional), county (optional), topics, page placements, display title, accessibility description, featured status.

**Later reusable placements (same canonical record, multiple approved slots):** Our Plan · What the Office Does · People Over Politics · Direct Democracy · Meet Kelly.

#### Record B — campaign momentum / community story

```text
Provider: YouTube
Video ID: aO712RsR0pQ
Title: Creating the Ripples in Hot Springs Village
Display title: Creating Ripples Across Arkansas (section may retitle; asset title stays canonical)
Suggested page role: campaign momentum / community story
Suggested homepage slot: home.personality.primary  (existing registry key; Track C should extend for VIDEO + poster)
Public approval: operator controlled
Featured: yes (homepage personality / trail prototype)
Location context: Hot Springs Village, Arkansas
```

**Later reusable placements:** Campaign Trail · Events · Invite Kelly · Get Involved · County pages · Meet Kelly.

### 15.2 Homepage placement doctrine (Track C first pass)

#### Message video — use first

Place **This Office Belongs to the People!** after the four pillars and before or within **Proven Executive Leadership**.

Suggested section:

```text
## This Office Belongs to the People

The Secretary of State’s office should not belong to political insiders,
corporations, or one part of Arkansas. It should serve every voter, every
county, every small business, every nonprofit, and every community.
```

UI treatment: large cinematic video card — thumbnail/poster, Kelly name + location/context, play control, short runtime label, caption beneath, optional transcript link, text link to **Our Plan**. **Click-to-play only** (no autoplay with sound).

#### Personality / trail video — campaign-in-motion band

Place **Creating the Ripples in Hot Springs Village** in a **Kelly Across Arkansas / Campaign Trail** personality band.

Suggested section:

```text
## Creating Ripples Across Arkansas

Real change begins when people gather, listen to one another, and decide
their community deserves better.
```

Suggested companions: 2–3 Hot Springs Village campaign photos · county/community name · short field note · link to more trail stories · invite/host Kelly CTA. This is the **first prototype** for a future Kelly Across Arkansas video + photo system — not a bulk archive ingest.

### 15.3 Presentation and embed rules (locked for Track C)

Avoid a bare YouTube iframe as the primary chrome. Use a purpose-built campaign video component with:

- Rounded cinematic frame · 16:9 responsive ratio · campaign-branded poster  
- Title + context · location/date when available · accessible caption  
- Transcript or summary · privacy-enhanced YouTube (`youtube-nocookie.com`)  
- Lazy load · **click-to-load** embed · mobile-safe sizing · graceful fallback link  
- Suppress unrelated recommended-video clutter where YouTube params allow  
- No autoplay with sound on homepage

### 15.4 Media architecture registration (Track C / follow-on)

Register as **external video assets** (canonical one record per Video ID), placeable in multiple approved slots — not hardcoded into a single component.

Phase 1 still-image slots remain; Track C must:

1. Add or extend slots for message video (`home.message.primary` proposed).  
2. Allow VIDEO + poster on the personality band slot used for Ripples.  
3. Keep `approvedForPublicSite` / operator enablement fail-closed (placement ≠ approval).  
4. Curate a **small** photo set around these two videos — do not ingest the full campaign archive in the first personality slice.

### 15.5 First homepage personality slice order (when Track C opens)

1. **This Office Belongs to the People!** as the central message video.  
2. **Creating the Ripples in Hot Springs Village** as the first campaign-in-motion story.  
3. Small curated photo collection around those videos only.

**Do not open Track C solely because these inputs are documented.** Database/Netlify gates in §12 still apply.
