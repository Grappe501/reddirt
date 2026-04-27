# Power of 5 — relational organizing system (RedDirt)

**Lane:** `RedDirt/` only.  
**Status:** **System design + architecture** — **no feature implementation** in this document.  
**Date:** 2026-04-27.  
**Supersedes nothing;** extends `docs/RED_DIRT_ORGANIZING_INTELLIGENCE_SYSTEM_PLAN.md` (OIS-1) and `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md` with a **spine** for product and data: **Power of 5** as the default relational engine.

**Constraint reminders:** no public voter microtargeting, no public household maps, no casual voter-file browsing, voter data as **reference** behind permission boundaries, aggregate-first public OIS.

---

## 1. System vision

**Power of 5** is the **organizing spine** of RedDirt: a visual, fair, geography-aware program where each volunteer builds and completes small trusted networks that **roll up** through place.

**Human model (bottom → up):**  
`Individual` → `Power Team` (≈5) → `Precinct` (aggregate coverage) → `City` → `County` → `Region` → `State`.

**What every person should always understand (in-product copy + UI):**

| Question | Answer surface |
|----------|----------------|
| Who am I responsible for? | Roster, invites, “My Five” completion meter |
| What team do I belong to? | Team card, leader name (visibility rules), team XP |
| What geography I affect? | City/precinct **badges** (aggregates), not other people’s addresses on public view |
| What pipeline I fill? | Signup / invite / activation / follow-up / GOTV strip |
| How my work moves larger numbers? | **Impact line** on every dashboard: “Your team +N conversations moved precinct X coverage this week (aggregate)” |

**North-star vs tools like Reach:** same **relational** idea; RedDirt wins on **(a)** integrated Arkansas geography and campaign hierarchy, **(b)** honest gamification without shame, **(c)** pipeline clarity, **(d)** voter file as **stewarded reference** (not a public people browser), **(e)** role-native dashboards, **(f)** OIS visual language shared from state to block-adjacent.

---

## 2. Product principles

1. **Fun before complicated** — one primary next action; depth in drawers.  
2. **Every person sees their own impact** — self vs last week, not public shame.  
3. **Every action feeds a pipeline** — no orphan buttons.  
4. **Every team belongs to geography** — `GeographyAssignment` is mandatory for rollup.  
5. **Every geography has a scoreboard** — coverage, teams, pipeline stages (aggregates).  
6. **Every scoreboard says what to do next** — one verb + one owner.  
7. **Voter-file = reference and targeting** — not a dossier for volunteers; staff rules for match quality.  
8. **Privacy and trust are product features** — consent, opt-out, audit, and “why you see this.”

---

## 3. User roles

| Role | Sees (summary) | Does | KPIs that matter (examples) | Pipelines they manage |
|------|----------------|------|----------------------------|-------------------------|
| **Member** | Own tasks, own team (limited), own geography badge, public aggregates | Complete profile, invite, log conversation, do follow-up | My Five completion, streak, weekly mission | Signup, invite, activation, follow-up |
| **Power Team Leader** | Team roster (consent-scoped), team pipeline, follow-up queue, leader coaching tips | Approve/nudge invites, assign follow-ups, celebrate milestones | Team completion %, follow-up latency, healthy diversity of invites | Same + team health |
| **Precinct Captain** | **Aggregate** precinct scoreboard, team list in turf (not voter list on phone web) | Assign teams to gaps, run precinct challenges | Precinct coverage, team density, drop-off | GOTV, conversation, coverage |
| **City Captain** | City rollups, peer precinct highlights | Recruit captains, balance asks | City coverage, captain bench | Volunteer, event, city pipeline |
| **County Organizer** | County OIS + rosters (staff) | Reconcile data, set targets, support captains | County readiness, pipeline funnel health | All county-scoped |
| **Regional Organizer** | Region dashboards, cross-county peer tables | Resource allocation, playbooks | Region leaderboard (safe), gap closure | Cross-county programs |
| **State Admin** | System health, exports (gated), audit | Config missions, review matches | Throughput, error rates, opt-outs | System-wide |
| **Owner** | All admin + break-glass | Policy, DPA, retention | Compliance metrics | All |

*Permission truth lives in the privacy model (§12); this table is UX-facing.*

---

## 4. Core objects / data model (TypeScript-style)

*Illustrative interfaces — names may align with Prisma in future packets. No PII in public fields on these types.*

```ts
/** Authenticated app user; may link 0..1 PowerNode. */
export interface PowerUser {
  id: string;
  displayName: string; // or pseudonym for some surfaces
  role: PowerRole; // member | leader | ... (fine-grained in ACL)
  createdAt: string;
}

export interface PowerNode {
  id: string;
  userId: string | null; // pre-invite can be null with token
  status: "invited" | "active" | "paused";
  teamId: string;
  createdAt: string;
}

export interface PowerTeam {
  id: string;
  name: string;
  leaderNodeId: string;
  targetSize: 5; // or configurable
  status: "forming" | "complete" | "dormant";
  geography: GeographyAssignment;
  createdAt: string;
}

export interface PowerInvite {
  id: string;
  fromNodeId: string;
  toEmailOrPhoneHash: string; // never raw on logs
  channel: "email" | "sms" | "in_person";
  status: "pending" | "accepted" | "expired";
  createdAt: string;
}

export interface RelationshipEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  kind: "invited" | "mentor" | "co_volunteer";
  visibility: "private" | "team" | "leader";
}

export interface OrganizingActivity {
  id: string;
  actorNodeId: string;
  type: "conversation" | "door" | "text" | "event_touch";
  relatedPipelineId: string;
  createdAt: string;
  noteEncryptedRef?: string; // store ciphertext ref, not body in public API
}

/** Reference to voter file row — not exposed by default. */
export interface VoterReference {
  id: string; // internal
  fileRecordId: string; // VoterRecord id
  lastMatchedAt: string;
  matchConfidence: number; // 0-1, model + rules
  privacyScope: PrivacyScope;
}

export interface VoterMatchCandidate {
  fileRecordId: string;
  confidence: number;
  reasons: ("name" | "address" | "dob" | "precinct")[];
}

export interface HouseholdReference {
  id: string;
  fileHouseholdKey: string; // hash or token, not full address in events
  memberRefs: VoterReference[];
}

export interface GeographyAssignment {
  stateFips: string;
  countySlug: string;
  citySlug: string | null;
  precinctId: string | null;
  communitySlug: string | null;
  censusGeoId: string | null; // future
}

export type PipelineId =
  | "signup" | "invite" | "activation" | "volunteer" | "event" | "conversation" | "followup"
  | "candidate" | "donor" | "petition" | "gotv";

export interface Pipeline {
  id: PipelineId;
  displayName: string;
  stages: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  label: string;
  order: number;
  /** Roll-up metric key for dashboard */
  kpiKey: string;
}

export interface Mission {
  id: string;
  title: string;
  weekOf: string;
  scope: "personal" | "team" | "precinct" | "city" | "county";
  rewardXp: number;
}

export interface Badge {
  id: string;
  label: string;
  tier: 1 | 2 | 3;
  criteria: string; // human rule ref, not a SQL
}

export interface ScoreEvent {
  id: string;
  subject: { kind: "user" | "team" | "geo"; id: string };
  delta: number;
  reason: "mission" | "conversation" | "team_complete" | "streak" | "adjustment";
  at: string;
}

export interface Leaderboard {
  id: string;
  scope: "team" | "city" | "county" | "region" | "state";
  refId: string; // which geography or cohort
  /** Safe aggregates only: team names optional; never paste voter propensity. */
  rows: { rank: number; label: string; score: number; demoFlag?: boolean }[];
}

export interface ImpactProjection {
  scope: GeographyAssignment;
  label: string; // "If 3 more teams complete, modeled coverage +X% (planning)"
  modelVersion: string;
  confidence: "low" | "medium" | "high";
}

export interface FollowUpTask {
  id: string;
  ownerNodeId: string;
  dueAt: string;
  status: "open" | "done" | "snoozed";
  linkedActivityType?: OrganizingActivity["type"];
}

export interface ContactAttempt {
  id: string;
  targetRef: { kind: "relational" | "voter_ref"; id: string };
  outcome: "reached" | "no_answer" | "refused" | "wrong_person";
  at: string;
}

export interface ConsentRecord {
  id: string;
  subjectId: string;
  purpose: "relational_contact" | "voter_match" | "sms";
  granted: boolean;
  at: string;
  evidenceRef: string; // DPA / policy pointer
}

export type PrivacyScope = "public_agg" | "member" | "leader" | "organizer" | "admin" | "owner";
```

---

## 5. Voter file reference layer

**Purpose:** help organizers **ground** relationship work in real geography and accurate identity **without** turning RedDirt into a consumer-facing voter search engine.

**Controls:**

| Control | Design |
|--------|--------|
| Search by name/address | **Admin / authorized organizer** only; rate limits; min characters; no “browse all in precinct.” |
| Household reference | **Hash/key** references; “confirm this household” flow with strict UI; no public map. |
| Precinct / district | Lookup returns **metadata** the user is allowed to see (e.g. precinct code + county), not every voter. |
| Match confidence | Store score + **reason codes**; low confidence → re-prompt, not auto-link. |
| Duplicates | Merge queue for staff; volunteers see only “pending” on their own submissions. |
| “Is this your person?” | Required step before binding `VoterReference` to a `PowerNode` when confidence < threshold. |
| Public | **No** voter browsing; **no** propensity, history, or score on public pages. |
| Sensitive fields | Scrub in API responses by role; field-level allowlists. |
| Audit | Log **who** opened **which** file join (not contents in public logs). |
| Exports | Role-gated; watermark; suppression lists respected. |
| Suppression / opt-out | Hard stop: no contact, no display, no gamification nudge against opted-out file IDs. |

**User flows (names only — UI in app):**

- **Add one of my five** — Relational add first; optional “match to voter” behind gate.  
- **Find my neighbor** — **Not** a public file search; “suggest from my area” = aggregate prompts only, or staff tool.  
- **Confirm household** — Multi-step: select candidates → confirm → consent.  
- **Assign to precinct** — `GeographyAssignment` from verified turf or file match.  
- **Invite into Power Team** — Tokenized invite, relationship edge + invite pipeline.  
- **Log conversation** — `OrganizingActivity` + pipeline stage.  
- **Create follow-up** — `FollowUpTask` with leader queue.

---

## 6. Gamification system

**Objectives:** joy, momentum, clarity — not surveillance, not shaming, not political voyeurism.

| Mechanic | Application |
|----------|-------------|
| Personal XP | Actions that match missions (capped per day to prevent spam) |
| Team XP | Team missions + completion |
| Scores (precinct → state) | **Aggregate** coverage & pipeline; label demo until backed |
| Streaks | Check-ins, conversation logs — personal/team, not public voter streaks |
| Badges | Verifiable behaviors (“Complete 5,” “7-day check-in,” “3 listening sessions”) |
| Missions | Weekly, cooperative challenges (“city closes gap 2% in aggregate this month”) |
| Progress rings | My Five, pipeline stage, team completion meter |
| Team completion meter | Central widget |
| Pipeline fill meter | Funnel on personal + admin |
| Coverage map “unlocks” | Metaphor: unlock **narrative** and coach tips, not real household dots on public |
| Leaderboards | **By team / city aggregate**; optional first-name + initial; no propensity |
| Cooperative challenges | Region vs “baseline” not vs vulnerable individuals |
| Beat baseline | Self historical compare |
| Complete your five / activate block / close precinct gap | **Copy patterns**; math is aggregate and honest |

**Avoid:** shame copy, public ranking by vote history, any “this voter is D/R” to volunteers in public, dense tracking language.

---

## 7. Pipeline system

| Pipeline | Stages (example) | Owner | Example KPIs | Drop-offs | P5 connection |
|----------|------------------|------|-------------|-----------|----------------|
| Signup | interest → account → profile | self | time-to-activate | abandoned forms | First node created |
| Invite | draft → send → accept | inviter/leader | accept rate | ghost invites | “My Five” count |
| Activation | first shift / first act | member | 7-day activation | silent joins | team XP event |
| Volunteer | app → training → role | org | time to first task | no-show | team supports volunteer pipeline display |
| Event | rsvp → show → follow-up | host | no-show, follow-up | P5 invites feed RSVPs | |
| Conversation | log → outcome → follow-up | member | conv/week | not logging | team completion |
| Follow-up | due → done → coach | leader | latency | stale tasks | leader dashboard |
| Candidate | prospect → vet → public | staff | stage aging | P5 surfaces pipeline score only, not names on web | |
| Donor | interest → commited | dev | n/a (often gated) | | optional late packet |
| Petition | sign → verify | org | | | | |
| GOTV | plan → contact → vote | turf | plan completion | P5 = relational backbone of GOTV | |

**Dashboard:** each pipeline = funnel with **one** recommended recovery action for the role viewing.

---

## 8. Personal dashboard design (concept)

**Blocks:** `My Five` · `My Team` · `My neighborhood` (aggregate / story) · `My precinct` (label + goals) · `My Missions` · `My impact` (one number + explanation) · `My pipeline` (strip) · `My Badges` · `Next best action` (big CTA).

**Sample copy:**  
- “Two more people complete your Power Team.”  
- “Your team helped increase precinct coverage this week in your assigned area (aggregate).”  
- “Invite one neighbor to move the city conversation pipeline—your choice who to trust.”

---

## 9. Leader dashboard design (concept)

Roster, incomplete teams, weak links, follow-ups, health (velocity), pipeline gaps, geography gaps, **coaching prompts** (“pair A with B”), **safe** leaderboard, mission assignment. No public voter PII; roster only where consent + role allows.

---

## 10. Admin / organizer dashboard design (concept)

Voter **match** review, duplicate review, assignment review, precinct coverage (aggregate) map, funnel, Power Team graph, growth/churn, burnout heuristics (flag only), workload, county/region rollups, audit. **Gated**.

---

## 11. Integration with existing dashboards (OIS)

| Surface | P5 + pipeline surfacing |
|---------|------------------------|
| State `/organizing-intelligence` | Statewide P5 rollups, demo-safe; “what to do next” |
| Region `regions/...` | `RegionPowerOf5Panel` pattern; peer counties |
| County (Pope v2, future OIS county) | `CountyPowerOf5Panel` + coverage + next actions |
| City (future) | City P5, density placeholders until data |
| Precinct (future) | List-first coverage; team count vs target |
| Personal / Leader / Admin | Full §8–10 |

**Every** dashboard: Power Teams, people activated, coverage, pipeline movement, next actions, one **impact** sentence.

---

## 12. Privacy, legal, and safety model

| Tier | Data examples | Rule |
|------|---------------|------|
| Public | Aggregate counts, geography labels, public events | no microdata |
| Member | own roster invites, own tasks | no other households |
| Leader | team roster w/ consent | no county-wide file |
| Organizer | campaign assignments, aggregate gaps | no bulk export to volunteers |
| Admin | file match queue, PII in controlled UI | audit + DPA |
| Owner | break-glass, policy | logged |

**Strict:** no public household maps; no public voter browser; no unnecessary voter fields in JSON; no sensitive microtargeting in UI; consents and audit; exports restricted; **suppression** honored everywhere.

---

## 13. Technical architecture proposal (code homes)

| Concern | Likely path |
|--------|-------------|
| Domain types + invariants | `src/lib/power-of-5/` (new, future) or `src/lib/organizing-intelligence/` |
| Pipelines, missions | `src/lib/organizing-intelligence/pipelines/` |
| Voter ref / match rules | `src/lib/voter-reference/` (separate from raw ingest) |
| UI primitives | `src/components/power-of-5/`, `src/components/dashboard/personal/`, `src/components/dashboard/leader/` |
| Routes | `src/app/dashboard/`, `src/app/dashboard/leader/`, `src/app/admin/organizing-intelligence/` |
| **Existing today** (hooks only): | `src/lib/campaign-engine/relational-*.ts`, `county-political-profile` aggregates, OIS state/region builders |

*Do not move voter ingest into “power-of-5” — **reference** layer sits between.*

---

## 14. Implementation roadmap (safe packets)

| Packet | Description |
|--------|-------------|
| **P5-1** | Audit existing relational/voter/contact code — `POWER_OF_5_EXISTING_CODE_AUDIT.md` |
| **P5-2** | Types only (`types.ts` packages, no Prisma change if unsafe) |
| **P5-3** | Demo seed: Pope only, no PII |
| **P5-4** | Personal dashboard prototype (static/demo) |
| **P5-5** | Leader dashboard prototype (static/demo) |
| **P5-6** | P5 panels on county/region/state (reuse shells) |
| **P5-7** | Pipeline model + demo funnel |
| **P5-8** | Voter reference design + permission matrix doc |
| **P5-9** | Voter lookup prototype **behind** gate (admin first) |
| **P5-10** | Scoring engine (aggregate, testable) |
| **P5-11** | Missions, badges, streaks |
| **P5-12** | Precinct/city rollup integration (data-dependent) |
| **P5-13** | Audit logs + export restrictions |
| **P5-14** | Real data integration plan |
| **P5-15** | Security / privacy review |
| **P5-16** | Production hardening |

---

## 15. Next Cursor script — Packet P5-1 (read-only)

Use this as the **exact** handoff for the next session:

> **P5-1 — Power of 5 existing code audit (read-only)**  
> **Lane:** `H:\SOSWebsite\RedDirt` only.  
> **Do not** change feature behavior, add routes, add dependencies, touch auth, or add mock voter PII.  
> 
> 1. Read `README.md`, `docs/RED_DIRT_ORGANIZING_INTELLIGENCE_SYSTEM_PLAN.md`, `docs/POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md` (this file), `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md`.  
> 2. Grep and read: `relational-contacts.ts`, `relational-matching.ts`, `relational-rollups.ts`, `relational-dedupe.ts`, `voter-model.ts` / `voter-interactions.ts`, `VoterRecord` usage under `prisma/`, `county-priority-voter-universe.ts`, `docs/identity-and-voter-link-foundation.md`, `docs/data-targeting-foundation.md`, and admin county intelligence pages under `src/app/admin/(board)/`.  
> 3. List **safe extension points** (files/functions) for Power of 5 vs **frozen** areas (ingest, raw export).  
> 4. Output: create **`docs/audits/POWER_OF_5_EXISTING_CODE_AUDIT.md`** with: inventory table, PII risk notes, recommended code homes, **no code edits** unless an explicit doc typo fix.  
> 5. Report: files read, key findings, blockers, recommended P5-2 scope.

---

## Risks and blockers

- **Schema:** Power Team not first-class in DB yet — P5-2+ must align with Prisma policy (no drive-by models).  
- **Voter data:** any match feature needs legal/ops + ADR.  
- **Auth:** personal/leader routes blocked until session + roles.  
- **Taxonomy:** campaign region slugs vs registry IDs — already documented; P5 must not break CANON-REGION-1.  
- **Scope creep:** implement **P5-1** before UI prototypes to avoid duplicating `relational-*` behavior.

---

**End of plan.**
