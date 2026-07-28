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

```text
Track C: CLOSED
Reason: Database parity / production intake gate remains unresolved for Track C entry.
No homepage personality implementation authorized.
```

**Homepage video canon is LOCKED.** Do not reopen homepage video decisions unless Steve explicitly changes direction.  
**Architecture doctrine:** `docs/KELLY_SPEAKS_MEDIA_LIBRARY_ARCHITECTURE.md` (Kelly Speaks · content modules · page borrowing).  
**Machine-readable registry:** `data/public-experience/kelly-homepage-personality-approved-videos.json`

### Approved homepage video canon (locked)

| Role | YouTube ID | Title | Homepage slot | Placement / purpose |
|------|------------|-------|---------------|---------------------|
| **Primary campaign message** | `eKVz5pFJxtk` | This Office Belongs to the People! | `home.message.primary` | Immediately after Four Pillars / Leadership band |
| **Personality / momentum** | `aO712RsR0pQ` | Creating the Ripples in Hot Springs Village | `home.personality.primary` | Kelly Across Arkansas · personality · community · momentum |

### Broader library roles (not homepage principals)

| Asset | Role | Emotional / page function |
|-------|------|---------------------------|
| **County Clerk Convention Candidate Forum 2026** | Qualification / election administration | Secure Elections · county partnerships; homepage **excerpt only** |
| **Video 4 (`KZ33iSxZ0ZQ`)** | Leadership speech | Kelly Speaks · Leadership · Hear Directly From Kelly; homepage-eligible pending Track C |
| **Video 5 (`SrzDUJBvFrs`)** | Campaign speech module | Themes pending transcript review; Story Engine links TBD; homepage-eligible if selected |
| **Video 6 (`c2v1uZNUMf4`)** | Campaign video module | Approved for public site (registry); CampaignVideoCard; themes/visitor-question pending review |
| **Video 7 (`amiTVLt85AM`)** | Campaign moment / election night | Primary Election Night — campaign journey · Meet Kelly; homepage supporting only |
| **Video 8 (`m7Mlk_bUbq4`)** | Campaign speech (provisional) | Review status: Imported → placement after transcript/tagging; homepage Review Required |
| **Video 9 (`72oKVAwfzZw`)** | Campaign video (Imported) | Collections pending; Campaign Media Center browse by topic/format/location/date |

**Classification doctrine (every speech):** **message · audience · emotional function · page · exact slot** — no random placements. Also capture Story Engine links: photos · events · counties · issues · blogs · news · actions.

### Locked presentation rules

```text
✓ youtube-nocookie embeds
✓ click-to-play
✓ reusable campaign media assets
✓ contextual placement
✓ transcript-ready
✓ searchable metadata
✓ reusable throughout the website
✓ no homepage implementation until Track C opens
```

### 15.1 Canonical external video records

Privacy-enhanced embed hosts (preferred):

```text
https://www.youtube-nocookie.com/embed/eKVz5pFJxtk
https://www.youtube-nocookie.com/embed/aO712RsR0pQ
https://www.youtube-nocookie.com/embed/Hl_n-A9aL1s
https://www.youtube-nocookie.com/embed/KZ33iSxZ0ZQ
https://www.youtube-nocookie.com/embed/SrzDUJBvFrs
https://www.youtube-nocookie.com/embed/c2v1uZNUMf4
https://www.youtube-nocookie.com/embed/amiTVLt85AM
https://www.youtube-nocookie.com/embed/m7Mlk_bUbq4
https://www.youtube-nocookie.com/embed/72oKVAwfzZw
```

Watch URLs (source of truth for IDs):

- Message: https://youtu.be/eKVz5pFJxtk
- Ripples: https://youtu.be/aO712RsR0pQ
- County Clerk Forum: https://youtu.be/Hl_n-A9aL1s
- Leadership (Video 4): https://youtu.be/KZ33iSxZ0ZQ
- Campaign speech (Video 5): https://youtu.be/SrzDUJBvFrs
- Campaign video (Video 6): https://youtu.be/c2v1uZNUMf4
- Primary Election Night (Video 7): https://youtu.be/amiTVLt85AM
- Campaign speech provisional (Video 8): https://youtu.be/m7Mlk_bUbq4
- Campaign video Imported (Video 9): https://youtu.be/72oKVAwfzZw

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

### 15.6 Record C — qualification / election administration (major asset)

**Asset type:** External video / full speech or forum  
**Emotional function:** Qualification and election-administration credibility (not primary homepage personality)

```text
Provider: YouTube
Video ID: Hl_n-A9aL1s
Title: Arkansas County Clerk Convention Secretary of State Candidate Forum 2026
Display card label: Kelly Grappe at the Arkansas County Clerk Convention
Card sublabel: Secretary of State Candidate Forum · 2026
Primary topic: Election administration
Supporting topics: County clerk partnerships · Election security · Voting systems ·
  County resources · Accurate vote counting · Government leadership
Primary slot: secure-elections.county-partnerships.featured-video  (proposed)
Secondary slots:
  office.elections.featured-video
  plan.election-administration.supporting-video
  meet-kelly.executive-readiness.supporting-video
  video-library.forums
Audience: County clerks · Election officials · Voters concerned about election security ·
  Local government leaders · Civic organizations
Publication posture: Operator approved · Click-to-play · No autoplay ·
  Transcript and chapter markers recommended
```

#### Best primary placement — Secure Elections / County Partnerships

County clerks administer elections locally; Kelly speaking in that setting shows she understands the SOS ↔ 75-county working relationship.

Suggested section:

```text
## Working With Every County

Secure elections depend on strong cooperation between the Secretary of State’s
office and the county clerks who administer elections in their communities.
Kelly will listen to local officials, help counties obtain the resources they
need, improve statewide processes, and work across voting systems to support
results that are timely, secure, accurate, and transparent.
```

Then place a large polished **speech card** (same campaign video chrome as §15.3) with the display card label / sublabel above.

#### Secondary placements

- **What the Office Does** — election administration and county support  
- **Our Plan** — county-clerk resources and secure-election infrastructure  
- **Meet Kelly** — proof she is prepared to lead the office  
- **Election Security** — full position in her own words  
- **County pages** — common statewide election-administration video  
- **Kelly Speaks** / future speech library — full forum and major addresses  

#### Homepage rule

On the homepage, use only a **short visual reference or excerpt card**, **not** the full forum as the principal personality video. Homepage leads with emotionally direct speeches (Records A/B); this longer forum is strongest when a visitor is evaluating knowledge and qualifications.

### 15.7 Record D — leadership speech (Video 4)

**Asset type:** External video / leadership speech  
**Status:** Classified into Kelly Speaks library; full title/length/chapters **pending** richer metadata as available  
**Do not** displace locked homepage message (`eKVz5pFJxtk`) or momentum (`aO712RsR0pQ`) principals

```text
Provider: YouTube
Video ID: KZ33iSxZ0ZQ
Privacy embed: https://www.youtube-nocookie.com/embed/KZ33iSxZ0ZQ
Media Type: Leadership Speech
Category: Campaign Speech
Primary Theme: Leadership
Secondary Themes: Government · Transparency · Public Service · Elections · Business · Community
Audience: General Public
Length: (pending)
Suggested Emotion: Inspirational
Placement Priority: High
Homepage Eligible: Yes (supporting / Hear Directly From Kelly — not a replacement for locked message/momentum canon)
Transcript: Pending
Featured: Yes
Suggested Kelly Speaks section: Leadership
Reusable band: Hear Directly From Kelly
Suggested future slots (proposed):
  kelly-speaks.leadership.featured-video
  meet-kelly.leadership.supporting-video
  home.hear-kelly.supporting-video
```

**Content-module posture:** Treat as a campaign knowledge module (title, ID, transcript, summary, pull quote, topics, related pages, CTA) — not a bare iframe. See `docs/KELLY_SPEAKS_MEDIA_LIBRARY_ARCHITECTURE.md`.

### 15.8 Record E — campaign speech module (Video 5)

**Asset type:** External video / campaign speech module  
**Status:** Registered in canonical media registry; **primary/secondary themes pending transcript review**  
**Story Engine:** Related photos, blogs, plans, news, and actions to be linked after theme finalization  
**Do not** displace locked homepage message (`eKVz5pFJxtk`) or momentum (`aO712RsR0pQ`) principals

```text
Provider: YouTube
Video ID: SrzDUJBvFrs
Privacy embed: https://www.youtube-nocookie.com/embed/SrzDUJBvFrs
Media Type: Speech
Category: Campaign Speech
Status: Approved (registry) — themes pending review
Homepage Eligible: Yes (if selected; supporting only vs locked canon)
Transcript: Attach when available
Primary Theme: (to be finalized after transcript review)
Secondary Themes: (to be tagged after review)
Counties Mentioned: (pending)
Office Responsibilities: (pending)
Audience: General Public
Related Pages / Photos / Blogs: (pending Story Engine links)
Suggested bands: Hear Kelly Explain It · Hear Directly From Kelly · Kelly In Her Own Words
Suggested future slots (proposed):
  kelly-speaks.campaign-speech.SrzDUJBvFrs
  kelly-in-her-own-words.pending-theme.featured-video
  policy.hear-kelly-explain-it.supporting-video
```

### 15.9 Record F — campaign video module (Video 6)

**Asset type:** Campaign video (reusable content asset)  
**Display:** `CampaignVideoCard` only — no raw iframe  
**Status:** Approved for Public Site (registry; operator enablement still required at publish)  
**Do not** displace locked homepage message (`eKVz5pFJxtk`) or momentum (`aO712RsR0pQ`) principals

```text
Asset Type: Campaign Video
Provider: YouTube
Video ID: c2v1uZNUMf4
Privacy embed: https://www.youtube-nocookie.com/embed/c2v1uZNUMf4
Status: Approved for Public Site
Display Style: CampaignVideoCard
Autoplay: No
Captions: Enabled (when available)
Transcript: Attach when available
Poster: Custom campaign image preferred
Primary Theme / visitor question: (pending review)
Related Pages: (assign via visitor-question map after review)
```

### 15.10 Record G — Primary Election Night (Video 7)

**Asset type:** Campaign moment / election-night speech  
**Public title:** Primary Election Night  
**Placement family:** Campaign story (not office-policy pages)  
**Do not** displace locked homepage message (`eKVz5pFJxtk`) or momentum (`aO712RsR0pQ`) principals

**Best fit pages:** Meet Kelly · Campaign Journey · Kelly Across Arkansas · Kelly In Her Own Words · future election-night / campaign-milestones timeline  

Suggested section:

```text
## A Campaign Built With the People
```

Shows the human side of the campaign (volunteers, supporters, family, work, community) — evidence of a growing Arkansas movement, not only a candidate biography.

```text
Asset type: Campaign moment / election-night speech
Provider: YouTube
Video ID: amiTVLt85AM
Privacy embed: https://www.youtube-nocookie.com/embed/amiTVLt85AM
Public title: Primary Election Night
Primary theme: Campaign journey
Supporting themes: Gratitude · Community · Volunteers · Momentum · Public service · People-powered campaign
Primary slot: meet-kelly.campaign-journey.featured-video
Secondary slots:
  campaign-trail.milestones
  kelly-speaks.campaign-moments
  get-involved.community-proof
  homepage.personality.supporting-video
Homepage role: Supporting only — not the main homepage message video
Publication: Click-to-play · No autoplay · Transcript recommended · Custom campaign thumbnail preferred
Display: CampaignVideoCard only
```

### 15.11 Record H — campaign speech provisional (Video 8)

**Asset type:** Campaign Video / Campaign Speech  
**Review status:** **Imported** (provisional — do not lock to a single page until Tagged + Placement Approved)  
**Homepage:** **Review Required** — not authorized for homepage until Homepage Eligible is set  
**Do not** displace locked homepage message (`eKVz5pFJxtk`) or momentum (`aO712RsR0pQ`) principals

```text
Asset Type: Campaign Video / Campaign Speech
Provider: YouTube
Video ID: m7Mlk_bUbq4
Privacy embed: https://www.youtube-nocookie.com/embed/m7Mlk_bUbq4
Status: Approved for Public Site (registry ingest) — placement pending review
Display Component: CampaignVideoCard
Autoplay: Disabled
Captions: Enabled (when available)
Transcript: Attach when available
Thumbnail: Campaign-selected custom poster preferred
Primary Theme: Pending transcript review
Secondary Themes: Pending transcript review
Audience: General Public
Homepage Eligible: Review Required
Primary Slot: To be assigned after content tagging
Supporting homes (candidates until tagged):
  Meet Kelly (if biographical / leadership)
  Our Plan (if priorities)
  Get Involved (if CTA)
  Kelly Speaks (speech library)
  Campaign Journey (if milestone)
Related Assets (Story Engine): Transcript · event photos · campaign blog · related speeches
```

### 15.12 Record I — campaign video Imported (Video 9)

**Asset type:** Campaign Video  
**Review status:** **Imported** — topics and placement pending classification  
**Collection:** Unassigned until tagged (see Collections doctrine in `docs/CAMPAIGN_MEDIA_REGISTRY.md`)  
**Do not** displace locked homepage message (`eKVz5pFJxtk`) or momentum (`aO712RsR0pQ`) principals

```text
Asset Type: Campaign Video
Provider: YouTube
Video ID: 72oKVAwfzZw
Privacy embed: https://www.youtube-nocookie.com/embed/72oKVAwfzZw
Display Component: CampaignVideoCard
Status: Imported
Transcript: Pending
Topics: Pending review
Placement: Pending classification
Homepage Eligible: Review Required
```
