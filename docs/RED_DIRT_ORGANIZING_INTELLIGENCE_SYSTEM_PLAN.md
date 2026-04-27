# RedDirt Organizing Intelligence System — Master Plan (OIS-1)

**Status:** Planning document only — **no application code, routes, or dependencies in this packet.**  
**Lane:** `RedDirt/` only (no cross-lane imports; no `sos-public` or other product lanes).  
**Supersedes in scope (does not delete):** extends [`COUNTY_INTELLIGENCE_SYSTEM_PLAN.md`](./COUNTY_INTELLIGENCE_SYSTEM_PLAN.md) with Power of 5, full geography stack, gamification, permissions, UI wireframes, and a 16-packet safe roadmap.  
**Prototype geography:** **Pope County** (`pope-county`, FIPS `05115`); next stress-test: **Benton** and **Washington** (NWA rollup).  
**Principle (rollup vs drill-down):** Organizing **rolls up** from the smallest human unit; dashboards **drill down** from statewide scope. **Every level must sync** — numbers roll upward; strategy and tactics sharpen as users go deeper. **Every small action should visibly move a larger system.**

**Last updated:** 2026-04-26

---

## Protocol read-in (this session)

| # | Document | Result |
|---|----------|--------|
| 1 | `README.md` | Read — Kelly SOS production site; Next.js, Prisma/Postgres, admin workbench; `npm run check` quality gate. |
| 2 | `docs/COUNTY_INTELLIGENCE_SYSTEM_PLAN.md` | **Exists** — county intelligence plan, Pope assessment, region taxonomy notes, dashboard hierarchy, visual requirements, 10-packet legacy roadmap; use as input to §8/§12 and Packet 1 script. |
| 3 | `docs/data-targeting-foundation.md` (DATA-1) | Read — county-scoped goals; `VoterRecord.precinct` optional string; no precinct geometry; no universe-type enum on voters; comms/segments opaque JSON. |
| 4 | `docs/field-structure-foundation.md` (FIELD-1) | Read — `FieldUnit` (COUNTY \| REGION), `FieldAssignment`; no GIS; parallel to public `County`, not a voter map product. |
| 5 | `docs/audits/POPE_COUNTY_INTELLIGENCE_PACKET1_AUDIT.md` | **Not present** (folder `docs/audits/` not created yet) — create in **Packet 1** per §13. |
| 6 | Pope / engine / workbench (plan-identified) | **See §8** — engine: `county-political-profile.ts`, `county-profiles/pope-county.ts`, `pope-briefing-bundle.ts`; routes: `/counties/[slug]`, `/county-briefings/pope`, `/admin/county-profiles`, `/admin/county-intelligence`; registry: `arkansas-county-registry.ts` (Pope FIPS 05115, `regionId: "central"`). |

---

## 1. Executive System Vision

RedDirt is **not** a collection of static county profile pages or a single analytics wall. It is a **human organizing intelligence system (OIS)**: a **visual operating system** where **personal action**, **Power of 5 teams**, **neighborhood and precinct coverage**, **city progress**, **county strategy**, **regional movement**, and **statewide goals** connect in one coherent interface.

**What users should feel:**  
- A volunteer sees **their** next step and how it **lifts** a block, precinct, and county.  
- A leader sees **gaps and momentum** at the right geographic resolution **without** exposing private voter microdata.  
- Staff and owners see **health**, **integrity**, and **readiness** — not just vanity metrics.

**Design law:** **Every small action should visibly move a larger system.** If a number does not connect to a person’s next action or a leader’s decision, it belongs in an appendix, not the executive strip.

**Non-goals in v1:** Replacing VAN, inventing a second voter file, or public microtargeting. DATA-1 and FIELD-1 guardrails remain binding.

---

## 2. Canonical Geography Hierarchy

**Full canonical stack (organizing model — bottom up):**

1. **State**  
2. **Region** (campaign geography — e.g. NWA, River Valley)  
3. **County**  
4. **City** (municipal / primary place)  
5. **Community / Neighborhood** (organizing sub-city unit — optional layer)  
6. **Precinct** (electoral)  
7. **Block / Census unit** (future fine grain — Census / operational)  
8. **Household** (private; staff/ops-gated)  
9. **Individual** (person + **Power of 5** “power node”)

**Dashboard order (top down):** State → Region → County → City → Community / Neighborhood → Precinct → Block / Census (future) → Household (restricted) → Individual / Power Team.

### 2.1 Which layers exist now (RedDirt repo reality)

| Layer | Status | Evidence / notes |
|-------|--------|------------------|
| **State** | **Partial** | No dedicated public “Arkansas OIS” shell; narrative/implicit in site; candidate scope statewide. |
| **Region** | **Partial** | `arkansas-county-registry` has internal `regionId` + `ARKANSAS_COMMAND_REGIONS`; **not** yet unified with stakeholder “River Valley / NWA” display names in one canonical enum everywhere (`COUNTY_INTELLIGENCE_SYSTEM_PLAN` §3). `FieldUnit` REGION exists (FIELD-1). |
| **County** | **Strong** | `County` table; `CountyVoterMetrics`, `CountyCampaignStats`; county command pages; political profile engine; Pope fully wired. |
| **City** | **Partial / ad hoc** | Content (events, festivals) uses city names; **no** first-class `CityProfile` or city dashboard route pattern yet. |
| **Community / Neighborhood** | **Future-ready** | Conceptual in county plan; no stable ID or API. |
| **Precinct** | **Sparse** | `VoterRecord.precinct` string when import has column; **no** precinct table, no geometry, no precinct goal columns (DATA-1). |
| **Block / Census unit** | **Future** | No schema; political profile may reference Census *aggregates* at county level — not block maps in UI. |
| **Household** | **Not in product model** | Do not improvise; link only via future ADR + legal review. |
| **Individual** | **Exists as User / volunteer**; **Power node** | `User`, `VolunteerProfile`; identity bridge to `VoterRecord` (admin-assisted). Power of 5 as *organizing* overlay is **to be modeled** (§4, §10). |

### 2.2 Placeholder strategy (do not block development)

- **Precinct without shapes:** show **ordered lists, rankings, and aggregate bars** from engine top/bottom lists + string-keyed rollups; map panel = **placeholder** outline or county boundary with “precinct data: list mode” until GeoJSON.  
- **City without FIPS subcounty table:** use **municipal name** + county slug in content/config until a `CityKey` is canonical.  
- **Block/census:** **explicit “future layer”** card — do not fabricate block KPIs.  
- **All placeholders** share one **empty-state component**: what we have, what we need, next pipeline step (matches existing honest-data posture).

---

## 3. Dashboard Drill-Down Hierarchy

Each dashboard is a **standard shell** so users learn once and apply everywhere. **Power of 5 KPIs appear on every dashboard** (summary depth scales by scope; see §4).

**Every dashboard includes:**

| Block | Purpose |
|-------|--------|
| **Executive KPI strip** | 3–7 numbers: scope health, Power of 5, momentum — each tied to a verb (“recruit,” “close gap,” “follow up”). |
| **Map or visual panel** | Aggregate-only on public; choropleth, dot-density buckets, or placeholder frame. |
| **Strategy panel** | “Why this place matters / theory of the race or turf.” |
| **Action panel** | Prioritized next moves (assignable, time-bound). |
| **Trend chart** | Time series or small-multiple — registration, team growth, coverage, etc. |
| **Drilldown table or cards** | Sortable, dense; peer or child geography. |
| **“What this means / what to do next”** | Plain-language block — same component family at every level. |

### 3.1 State dashboard

- **Audience:** State leadership, campaign principals (mixed public / staff variants possible).  
- **Emphasis:** Balance of regions, **Power of 5** statewide totals, **aggregate** registration story (DATA-1: no fake persuasion universes).  
- **Drill:** Region → County.

### 3.2 Region dashboard

- **Audience:** Regional leads, coalitions.  
- **Emphasis:** County comparison table, **NWA** or **River Valley** narrative once taxonomy locked.  
- **Drill:** County; optional city once city routes exist.

### 3.3 County dashboard

- **Audience:** County chairs, partners, public (subset).  
- **Emphasis:** County political profile + organizing readiness; **Pope = prototype** (§8).  
- **Drill:** City (when exists) / community / precinct list.

### 3.4 City dashboard

- **Audience:** Municipal anchors, local hosts, campus (where relevant).  
- **Emphasis:** City-specific events density, team density **aggregates**, gap vs sister cities in same county.  
- **Drill:** Community → precinct.

### 3.5 Community / Neighborhood dashboard

- **Audience:** Block captains, local hosts.  
- **Emphasis:** Relational **coverage** and **stories** — still aggregate-first on public.  
- **Drill:** Precinct, teams.

### 3.6 Precinct dashboard

- **Audience:** Canvass leads, team leads (public = aggregates only; walk lists = elevated permission).  
- **Emphasis:** Coverage, **Power of 5** completion vs precinct target, follow-ups.  
- **Drill:** Team → individual (gated).

### 3.7 Block / Census dashboard (future layer)

- **Audience:** Data/ops, advanced field (gated).  
- **Emphasis:** Census **aggregates** and operational buckets — **not** public household maps in v1.  
- **Placeholder** until data pipeline + ethics review.

### 3.8 Personal dashboard

- **Audience:** Any volunteer / member.  
- **Emphasis:** **My** Power of 5, **my** streaks/missions, **my** next asks; **my** team’s lift on **aggregate** turfs.  
- **No** public display of other people’s private links.

### 3.9 Leader dashboard

- **Audience:** Team leader, captain, sub-regional field roles.  
- **Emphasis:** Roster health (with consent/visibility rules), follow-up queue, **geographic** assignment coverage **aggregates**, escalations.  
- **Drill:** Teams and individuals per §11.

### 3.10 Admin / command dashboard

- **Audience:** Staff, **Owner**.  
- **Emphasis:** Pipeline health, data freshness, import errors, **PII** access audit hooks, comms/ops alignment.  
- **Not** a duplicate of public pretty charts — add **operational** KPIs (§6, §6 admin strip).

**Route note:** Concrete URL patterns in [`COUNTY_INTELLIGENCE_SYSTEM_PLAN.md`](./COUNTY_INTELLIGENCE_SYSTEM_PLAN.md) (§4) remain starting points: extend with `/intelligence/...` or county-nested city/precinct when packets land — **not implemented in this document.**

---

## 4. Power of 5 Relational Organizing Layer

**Central product thesis:** **Relational organizing** is the spine. Every screen reinforces **recruitment → completion → activation → follow-through.**

### 4.1 Concepts

| Concept | Definition |
|--------|------------|
| **Individual Power Node** | One person as the atomic organizing unit, optionally linked to `User` / volunteer identity; may link to `VoterRecord` only per IDENTITY-1 / admin policy. |
| **Power Team** | Typically **5** members including the **Team Leader** (or “core + extended” — lock copy in one packet; numbers may flex by program rules). |
| **Team Leader** | Accountable for roster health and follow-up rhythm; visible in leader dashboards. |
| **Captain / Organizer** | Geographic or functional coverage owner (maps to field roles + `FieldAssignment` over time; FIELD-1). |
| **Geographic assignment** | Node/team **scoped** to city/precinct/county/region for rollup — **synthetic keys** until official IDs exist. |
| **Relationship tree** | Who invited whom, **for coaching** and recognition — **not** a public social graph. |
| **Status tracking** | Invited, signed up, active, needs follow-up, paused — drives lists and **gamified** milestones. |
| **Activity tracking** | Conversations logged, doors (if used), event touches — **aggregates** roll up. |
| **Relational invitations** | Track invitation source for **fair** leaderboards (growth by relationship, not just raw spam). |
| **Voter / contact linkage** | Only where **legal, ethical, and product-approved**; default **aggregate** or **anonymized** on public. |

### 4.2 Power of 5 KPIs (show on *every* dashboard, scope-adjusted)

| KPI | What it’s for |
|-----|----------------|
| **Total Power Teams** | Scale of relational net. |
| **Complete Power Teams** | Ready multipliers. |
| **Incomplete Power Teams** | **Direct ask:** “add N people to complete.” |
| **People signed up** | Acquisition. |
| **People invited** | Top-of-funnel relationship work. |
| **People activated** | Doing meaningful actions (define per program). |
| **Conversations logged** | Quality / depth. |
| **Follow-ups due** | Operational discipline. |
| **Weekly growth** | Momentum. |
| **Team completion rate** | Program health. |
| **Coverage rate by geography** | Precinct/city **aggregate** % of “claimed” or “active” teams vs target. |
| **Leader-to-team ratio** | Managerial load. |
| **Retention / drop-off** | Early warning. |
| **Estimated vote impact** | **Optional, modeled, caveated** — never private scores on public. |

**Copy pattern:** Nudge, don’t shame; tie every KPI to a **next step** (see §5 examples).

---

## 5. Gamification System

**Intent:** **Motivate civic action** and **team completion** without **publicizing** private voter data or **humiliating** low-propensity individuals.

**Rules:**

- **Public / member views:** show **buckets, badges, and team milestones** that reference **aggregates** and **self/team** data the user is allowed to see.  
- **No** public maps of **who** hasn’t voted or **which** household is weak.  
- **Competition** is **precinct/ city / county** level using **team counts, completion %, growth velocity** — not individual voter file stats.

### 5.1 Layers

- **Personal score:** Streak, missions completed, invites, **personal growth** (private by default; opt-in to share in team).  
- **Team score:** Completion, collective streaks, “team missions.”  
- **Precinct / City / County / Regional** scores: **aggregate**; **“your contribution”** as **delta** or **% of local goal** with friendly copy.  
- **Leaderboards:** Default to **region or county**; show **first names + last initial** or **team names** per privacy settings — never PII from voter file.  
- **Streaks, badges, milestone unlocks:** e.g. first complete team, 10 conversations, 3-week consistency.  
- **Weekly missions:** e.g. “Add 2 members,” “log 5 conversations,” “host 1 follow-up call.”  
- **Power Team completion rewards:** digital recognition + **impact explanation** (what turf moved).  
- **Impact explanations (examples, public-safe):**  
  - “**Add 2 more people** to **complete** your Power Team.”  
  - “**Your team** helped move **Precinct 12** from **41% to 47%** **team coverage**.” (Not vote propensity in public — **organizing** coverage.)  
  - “**Three** more **complete teams** will **close the city gap** to goal.”

**Anti-patterns:** Publishing **support scores**; **doxxing**-adjacent map pins; shaming tracts. **All gated by** §11.

---

## 6. KPI Framework

**Dense framework:** every KPI row answers: **(1) What? (2) Why? (3) What action? (4) Roll up? (5) Visibility class?**

**Visibility class legend:** `public` | `member` | `team_leader` | `organizer` | `admin` | `owner`

### 6.1 Personal KPIs

| KPI | What | Why | Action | Roll up | Vis |
|-----|------|-----|--------|---------|-----|
| My invites sent | Count of invitations I initiated | Drives 1:1 growth | Log invites / use tools | **Sum** to team (with consent) | member+ |
| My team completion | # on my team vs 5 (or program target) | Core program | Recruit to complete | Feeds team % | member+ |
| My follow-ups due | Dated tasks | Prevents drop-off | Complete calls/texts | manager views | member / leader+ |
| My weekly streak | Consistency | Habit | Show up | motivational aggregate | member (opt-in public) |
| My conversations logged | Depth metric | Quality > vanity | Debrief and coach | team / precinct agg | member+ |

### 6.2 Team KPIs

| KPI | What | Why | Action | Roll up | Vis |
|-----|------|-----|--------|---------|-----|
| Team completion % | Filled vs target roster | Readiness | Recruit or merge teams | city/county | member+ (team), aggregate public as % |
| Active vs dormant members | last activity | Retention | Re-engage | larger avg | leader+ |
| Relational growth rate | new adds / week | Momentum | Push missions | **Sum** | leader+ (detail), **agg** public |

### 6.3 Precinct KPIs

| KPI | What | Why | Action | Roll up | Vis |
|-----|------|-----|--------|---------|-----|
| Team coverage % | teams active / goal | Allocate captains | Deploy leaders | **Avg / sum** to city | public aggregate |
| Persuasion **organizing** coverage (if defined) | doors/canvass **aggregate** | Field planning | **Never** home-level public | city | public **agg** only |

### 6.4 City KPIs

| KPI | What | Why | Action | Roll up | Vis |
|-----|------|-----|--------|---------|-----|
| City team density | teams per 1k registered (organizing) | Compare turf | Reallocate | county | public aggregate |
| Event touch throughput | check-ins, **aggregate** | Calendar strength | Add hosts | region | public/member |
| Bilingual / campus reach (if tracked) | program flags | Inclusive reach | Resource | region | **Careful** — aggregate |

### 6.5 County KPIs

| KPI | What | Why | Action | Roll up | Vis |
|-----|------|-----|--------|---------|-----|
| Registration pace vs goal | DATA-1 honest | Win path | Voter reg pushes | state | public (existing posture) + staff detail |
| Organizing readiness index | composite | Compare counties | investment | state | public **index**; **weights** staff |
| County Power Team totals | count + completion | Relational scale | **Recruit** | region | public **counts**; detail member |

### 6.6 Region KPIs

| KPI | What | Why | Action | Roll up | Vis |
|-----|------|-----|--------|---------|-----|
| Cross-county peer table | same metrics, aligned | Resource fights | **Support** weak county | state | public (aggregate) |
| NWA / River Valley narrative drivers | 3–5 highlights | Comms + field | **Message** | state | public |

### 6.7 State KPIs

| KPI | What | Why | Action | Roll up | Vis |
|-----|------|-----|--------|---------|-----|
| Statewide team coverage / growth | OIS “north star” for relational | Momentum | Surge weeks | n/a | public (agg) |
| Region imbalance | who’s behind | Move staff | Reassign | n/a | **staff-heavy** for precision |

### 6.8 Admin / health KPIs

| KPI | What | Why | Action | Roll up | Vis |
|-----|------|-----|--------|---------|-----|
| Data freshness (as-of) | snapshot dates | Trust | Re-import | n/a | admin+ |
| Import / pipeline errors | from `CountyCampaignStats` pipeline fields | Reliability | Fix ETL | n/a | admin+ |
| Access anomalies | logins, exports | **PII** safety | **Audit** | n/a | admin / owner |
| “Story drift” (optional) | known gaps vs claimed | Honesty (DATA-1) | Document | n/a | staff |

**Roll-up rule of thumb:** **Sums and weighted averages** for **counts and rates**; **never** roll up disclosable **microdata** to public.

---

## 7. Visual and Map System (visual-first)

**North star:** **One visual language** — executive strip, **map/visual**, then drill content. **Dense but readable** (per existing county plan §9 / §5 here).

| Asset | Use |
|-------|-----|
| **Arkansas state map** | Region coloring, **county** choropleth, **KPI** selector. |
| **Region map** | Highlight in-state counties; mute others. |
| **County map** | County outline; **optional** precinct once GeoJSON. |
| **City map** | Point / polygon **when** licensed; else **list + card** with map placeholder. |
| **Precinct map** | **Aggregate** choropleth or dot-density **buckets** — **no** household pins public. |
| **Block / Census map (future)** | **Staff / research** gating. |
| **Power Team density map** | **Dot density** or **hex** by **count** of teams (not voters). |
| **Coverage gap map** | team goal vs current **by precinct** (aggregate). |
| **Growth map** | WoW or MoM **team growth** (organizing, not private vote propensity). |
| **Turnout trend charts** | Historical **public** results + registration trends (sourced). |
| **Vote share charts** | Past races; honest uncertainty. |
| **Volunteer / candidate pipeline charts** | **Counts** in stages — **no** names on public funnel. |
| **Relational tree graphics** | **Schematic** in leader tools — not public Facebook graph. |
| **Issue intensity heatmaps** | **County × issue** matrix — **no** individual targeting. |
| **Leaderboard visuals** | **Teams / counties** — not voters. |
| **Progress rings** | Completion, goals, missions. |
| **Drilldown cards** | Standard component; `geoScope` prop for future rollups. |
| **Comparison tables** | Peer counties / precincts; export **CSV** admin-only. |

**Stack (unchanged from county plan):** Leaflet in repo; consider MapLibre / deck for later heavy lifting; start **SVG/TopoJSON placeholders** where DATA-1 blocks geometry.

---

## 8. Pope County Prototype Upgrade

**Goal:** **Pope** is the **end-to-end template**: same cards that will later **hydrate** Benton, Washington, and any county — **not** a one-off.

### 8.1 What exists now (2026-04-26)

- **Public command:** `/(site)/counties/pope-county` — `CountyCommandExperience`, snapshot + metrics (per county plan).  
- **Engine:** `buildCountyPoliticalProfile` + `buildPopeCountyPoliticalProfile` — aggregates, **precinct top lists** without GIS.  
- **Public briefing:** `/county-briefings/pope`.  
- **Admin:** `/admin/county-profiles` (Pope preview), `/admin/county-intelligence` (workbench, export script refs).  
- **Bundle / script:** `pope-briefing-bundle`, `emit-pope-county-intel-site.ts`.  
- **Registry:** Pope FIPS 05115; **region** currently `central` in code — **reconcile** with “River Valley” **stakeholder** label in Packet 2 (do not break seeds casually).

### 8.2 What to add (prototype backlog — planning only)

- **Power of 5 panels** on county (and then personal) surfaces — using **shared schema** (Packet 3–4), **seed data** (Packet 5) before production wiring.  
- **City under Pope:** e.g. Russellville, Atkins, Dover **cards** and future `/counties/pope-county/cities/[cityKey]` pattern (Packet 8) — start with **config-driven** list if no table.  
- **Precinct placeholders:** list + **aggregate** from engine strings; “map coming” panel.  
- **Maps:** state → county → (future) precinct **placeholder stack** consistent with §7.  
- **Organizing readiness scoring:** 4–6 inputs documented (volunteer growth, event cadence, team counts — all **public-safe**).  
- **Personal / leader examples:** **demo/seed** only in Packet 5+ per roadmap — no production PII.  
- **Roll-up to River Valley / NWA (wrong peers avoided):** when region model locked, **Pope** rolls to **river-valley** (or display-mapped) **and** can appear in **peer** tables with **Saline, Faulkner, etc.** as chosen defensibly in Packet 1 audit.

---

## 9. Benton and Washington Expansion Path

**Why next:** NWA = **highest** population block in CD3, **strong** event/campus/employer **density**; **Benton** and **Washington** **stress-test** the engine **after** Pope without **bespoke** page logic (same components, new data + copy).

| Aspect | Plan |
|--------|------|
| **Same schema** | `buildCountyPoliticalProfile({ countyName, fips })` pattern; FIPS from registry. |
| **Data needed** | `County` row health, `CountyVoterMetrics` / `CountyCampaignStats`, same DATA-1 constraints; local narrative from approved briefs. |
| **NWA region rollup** | `CampaignRegionSlug` (or mapping from `COUNTY_INTELLIGENCE_SYSTEM_PLAN` §3) + **childCountySlugs: benton, washington, ...** — one **Region dashboard** (Packet 12) reads **shared cards**. |
| **Comparison dashboards** | **Standard** `PeerComparisonTable` with `geoScope` — **Pope vs Benton vs Washington** is **row selection**, not new CSS per county. |
| **Custom one-off avoidance** | County-specific only in **data + content modules** (`county-profiles/benton.ts` pattern), **not** in **layout** forks. |

**Internal brief** (content source, not a dependency for this file): `docs/briefs/KELLY_NWA_BENTON_WASHINGTON_CANDIDATE_BRIEF.md`.

---

## 10. Data Model Proposal (TypeScript — planning only)

**Not implemented in this pass.** Suggested file homes after ADR:

- `src/lib/organizing-intelligence/types.ts` — core node/rollup types.  
- `src/lib/organizing-intelligence/rollup.ts` — pure **merge** of **child** → parent metrics.  
- `src/lib/county/region-model.ts` — region slugs (from prior county plan).  
- `prisma/` — new tables only with **steve/counsel** on PII (roadmap **Packet 15**).

```ts
// --- Geography (canonical ID surfaces for UI + API contracts)

export type GeographyLevel =
  | "state"
  | "region"
  | "county"
  | "city"
  | "community"
  | "precinct"
  | "census_unit"
  | "household"
  | "individual";

export interface GeographyNode {
  id: string;
  level: GeographyLevel;
  displayName: string;
  parentId: string | null;
  /** e.g. FIPS, AR precinct key, place key — may be partial until data exists */
  externalKeys: Record<string, string | undefined>;
  /** True if this node is a placeholder pending ingest */
  isPlaceholder: boolean;
}

export interface RegionProfile {
  regionSlug: string;
  displayName: string;
  childCountySlugs: string[];
  /** Aggregated when implemented */
  rollupMetrics: RollupMetric[];
  narrative: { summary: string; strategicNotes: string[] };
}

export interface CountyProfile {
  countySlug: string;
  fips: string;
  regionSlug: string | null;
  /** Overlap with existing political profile; subset here for OIS */
  engineRef: { politicalProfileKey: string };
  cities: CityProfile[];
  readinessScore: { value: number | null; components: { label: string; weight: number }[] };
  powerOf5: PowerTeamRollup;
}

export interface CityProfile {
  cityKey: string;
  countySlug: string;
  displayName: string;
  isPlaceholder: boolean;
  precincts: PrecinctProfile[];
  powerOf5: PowerTeamRollup;
}

export interface CommunityProfile {
  communityId: string;
  countySlug: string;
  displayName: string;
  isPlaceholder: boolean;
  linkedPrecinctKeys: string[];
}

export interface PrecinctProfile {
  precinctKey: string;
  countySlug: string;
  displayName: string;
  isPlaceholder: boolean;
  hasGeometry: boolean;
  teamCoverage: { current: number; target: number | null; rate: number | null };
}

export interface CensusUnitProfile {
  censusBlockGroupKey: string;
  countySlug: string;
  isFuture: true;
  /** No household / voter exports in v1 */
  note: string;
}

export interface HouseholdProfile {
  id: string;
  censusScope?: string;
  /** Encrypted or admin-only in real impl — here as stub */
  privacyClass: "admin" | "owner";
}

// --- Power of 5

export interface PowerNode {
  id: string;
  userId: string | null;
  displayName: string;
  teamId: string;
  status: "invited" | "signed_up" | "active" | "dormant";
  role: "member" | "team_leader" | "captain";
  invitedByNodeId: string | null;
  geographicScope: GeographyNode;
}

export interface PowerTeam {
  id: string;
  leaderNodeId: string;
  name: string;
  targetSize: number;
  memberNodeIds: string[];
  /** Aggregate-only when exposed to public */
  publicSafeSummary: { completionRate: number; lastActivityAt: string | null };
}

export type OrganizingActivityType =
  | "conversation"
  | "event_touch"
  | "follow_up"
  | "mission_complete"
  | "import_note";

export interface OrganizingActivity {
  id: string;
  nodeId: string;
  type: OrganizingActivityType;
  occurredAt: string;
  /** No raw voter PII in public logs */
  summary: string;
  visibility: "public_safe" | "team" | "leader" | "admin";
}

// --- Dashboard / metrics

export interface DashboardKpi {
  key: string;
  label: string;
  value: number | null;
  format: "number" | "percent" | "currency" | "days";
  /** What a human does next */
  actionPrompt: string;
  /** For executive strip ordering */
  priority: number;
  visibility: "public" | "member" | "team_leader" | "organizer" | "admin" | "owner";
}

export interface RollupMetric {
  key: string;
  scope: Pick<GeographyNode, "id" | "level" | "displayName">;
  asOf: string;
  value: number | null;
  rollUpFrom: "sum" | "avg" | "weighted_avg" | "min" | "max";
  source: { kind: "prisma" | "computed" | "seed" | "manual"; ref?: string };
}

export interface PowerTeamRollup {
  teamCount: number;
  completeTeams: number;
  incompleteTeams: number;
  peopleInvited: number;
  peopleActive: number;
  weeklyGrowth: number | null;
  completionRate: number | null;
}

export interface GamificationProfile {
  userId: string;
  personalScore: number;
  teamScore: number;
  streakDays: number;
  badges: { id: string; earnedAt: string }[];
  activeMissions: { id: string; title: string; progress: number; target: number }[];
  optInPublicLeaderboard: boolean;
}

export interface UserDashboardProfile {
  userId: string;
  powerNode: PowerNode;
  team: PowerTeam;
  myKpis: DashboardKpi[];
  gamification: GamificationProfile;
  /** "What it means" copy */
  explanation: string;
}

export interface LeaderDashboardProfile {
  leaderUserId: string;
  teams: PowerTeam[];
  roster: PowerNode[];
  followUpsDue: OrganizingActivity[];
  /** Aggregate coverage only */
  geographicCoverage: RollupMetric[];
  explanation: string;
}
```

---

## 11. Permission and Privacy Model

| Level | Typical roles | **Can** see / do |
|-------|--------------|------------------|
| **Public** | Unauthenticated / world | **Aggregate** maps and KPIs; **no** walk lists, **no** voter PII, **no** **exact** home locations; public-safe Power of 5 **counts** only. |
| **Member** | Logged-in volunteer | **Self** + **team** where invited; own missions; **not** other teams’ rosters in detail unless program allows. |
| **Team leader** | Power Team lead | **Roster** for own team; **activity** in scope; may see **anonymized** peer precinct stats. |
| **Organizer** | Field staff / captains | **Broader** roster **within assigned** geography; may export per **data policy** — **not** a blanket voter file. |
| **Admin** | Campaign staff / data | **Operational** health, imports, comms; **PII** only per **minimization**; audit exports. |
| **Owner** | Steve / designated | All admin + **key** **rotation**, legal holds, final policy. |

**Careful with:**

- **Household** — default **no** product surface; only after ADR.  
- **Individual voter** — `VoterRecord` stays **gated**; public story is **county** + **organizing** aggregates.  
- **Volunteer** — contact info for **comms** per existing patterns; not for **public** widgets.  
- **Relational graph** — **coaches** and **leaders** see structure **need-to-know**; not **public** social graph.  
- **Map granularity** — **State → region → county** public; **precinct** **aggregate** public if approved; **block/house** **ops**-only.  

---

## 12. UI Layout Wireframe Plan (text)

**Shared:** Top nav → **KPI row** (3–7) → **main visual** (map or hero chart) → **2-column or 3-column** strategy / action / trend → **drill table** → **footer “what it means / next.”**

### 12.1 Personal dashboard

- **Top row:** my completion %, invites pending, follow-ups today, streak, “power impact” (aggregate delta).  
- **Main visual:** **progress ring** or **mission card** (not a map of voters).  
- **Left:** strategy (“why your team matters”).  
- **Right:** actions (add member, log conversation, nudge).  
- **Drill:** my tasks table; team roster **limited**.  
- **Copy block:** one paragraph “what to do in 10 minutes.”

### 12.2 Leader dashboard

- **Top row:** teams managed, at-risk count, this week’s growth, follow-ups **due**.  
- **Main visual:** team list health **bar** or small multiple by team.  
- **Left:** strategy for turf.  
- **Right:** action queue (sorted).  
- **Drill:** roster table; **geographic** coverage **%**.  
- **Copy block:** “who needs a nudge this week — **privacy-safe**.”

### 12.3 County (Pope) dashboard

- **Top row:** registration pace, volunteer/stats from DATA-1, **Power of 5** summary, **readiness** index.  
- **Main visual:** **County** map outline + list toggle (precinct list mode until shapes).  
- **Left:** political + organizing strategy.  
- **Right:** next actions (3–7, owner-tagged in admin variant).  
- **Drill:** city cards → precinct table.  
- **Copy block:** “River Valley + Pope narrative” + honest gaps.

### 12.4 City dashboard

- **Top row:** city team density, event throughput, **gap to goal**.  
- **Main visual:** city placeholder map or key venues **points** (non-PII).  
- **Left:** local story.  
- **Right:** missions for that city.  
- **Drill:** precincts / teams.  
- **Copy block:** “what city hosts can do this month.”

### 12.5 Precinct dashboard

- **Top row:** team coverage, weekly growth, follow-ups, optional **modeled** impact **caveat**.  
- **Main visual:** precinct **aggregate** in county context (or list row highlight).  
- **Left:** turf narrative.  
- **Right:** captain actions.  
- **Drill:** team cards (no voter rows on public).  
- **Copy block:** “add N teams to close gap” (see §5).

### 12.6 Region (e.g. NWA) dashboard

- **Top row:** region rank metrics, **Power of 5** across counties, peer spread.  
- **Main visual:** **multi-county** map with highlight.  
- **Left:** region strategy (from briefs / verified research).  
- **Right:** resource moves.  
- **Drill:** county comparison table.  
- **Copy block:** “where to invest next.”

### 12.7 State dashboard

- **Top row:** statewide registration/organizing **north stars**, **regional** balance, health.  
- **Main visual:** **AR** choropleth (metric select).  
- **Left:** statewide narrative.  
- **Right:** **surge** actions / timeline.  
- **Drill:** region → county.  
- **Copy block:** “this week’s statewide through-line.”

---

## 13. Implementation Packet Roadmap (safe order)

| Packet | Name | Outcome | Guardrails |
|--------|------|---------|------------|
| **1** | Read-only audit: Pope, county engine, workbench, routes | `docs/audits/POPE_COUNTY_INTELLIGENCE_PACKET1_AUDIT.md` | **No** feature code; no deletes |
| **2** | Canonical region + geography hierarchy mapping | Reconcile display vs `regionId` + city keys (additive) | No destructive migrations without plan |
| **3** | Shared dashboard schema + `DashboardKpi` / rollup types | TS types in agreed `src/lib/...` path | Types only or docs |
| **4** | Power of 5 relational data model | Prisma/JSON ADR; entities stubbed | PII/counsel gate |
| **5** | Demo/seed Power of 5 for **Pope only** | Seed scripts / fixtures | **No** real PII in smoke data |
| **6** | Reusable visual dashboard components | Cards, charts, map shells | One chart library choice |
| **7** | Pope v2: Power of 5 panels + **map** placeholders | Enhanced county UI | Preserve existing routes’ behavior for regressions |
| **8** | City route pattern under county | `/counties/[slug]/cities/[cityKey]` or equivalent | Data from config first |
| **9** | Precinct route under city/county | List-first + placeholders | **Public** = aggregates only |
| **10** | Personal dashboard prototype (demo) | `/me` or demo path | Auth optional / demo user |
| **11** | Leader dashboard prototype (demo) | role-sim | No production roster |
| **12** | Region rollup dashboard | NWA + River Valley as data allows | Reuse cards only |
| **13** | State rollup dashboard | AR executive | Same |
| **14** | Benton + Washington expansion | Profiles + same UI | Stakeholder copy sign-off |
| **15** | Privacy / access hardening | RBAC, export logs, field rules | **No** public voter leakage |
| **16** | Documentation + handoff | `docs/README`, thread anchors | **Single** source of truth |

**Dependency rule:** Packets **4–5** not production-facing without **1–3**; **7+** not without **5–6** for UI consistency. **15** before any real roster at scale.

---

## 14. Next Cursor Script (Packet 1 — exact paste for next session)

```text
You are working in H:\SOSWebsite\RedDirt only. Follow lane rules: no other product folders; do not import across lanes.

Read first:
- docs/RED_DIRT_ORGANIZING_INTELLIGENCE_SYSTEM_PLAN.md
- docs/COUNTY_INTELLIGENCE_SYSTEM_PLAN.md
- docs/data-targeting-foundation.md
- docs/field-structure-foundation.md

**Packet 1 — Read-only intelligence audit (no feature changes, no refactors, no deletions, no new routes, no new dependencies, no mock data, no auth changes):**

1) Create docs/audits/POPE_COUNTY_INTELLIGENCE_PACKET1_AUDIT.md (create docs/audits/ if needed).

2) Read and inventory **all** files that touch:
   - Pope County (05115, pope, pope-county) — routes, lib, content, admin, scripts, seed
   - Generic county profile / political engine (county-political-profile, county-profiles, CountyCommandExperience, getCountyPageSnapshot, arkansas-county-registry)
   - County briefings, county intelligence workbench, county profiles admin, emit scripts, bundles
   - Field units / assignments if referenced from county or Pope flows

3) In the audit file, provide:
   - A **table** of: route or module path, purpose, data sources (Prisma models, static, scripts), PII risk (low/med/high), public vs staff-only
   - A **full route list** for county intelligence and related URLs
   - **Reusable components** worth extracting later (name only, no refactors)
   - **Data gaps** vs OIS plan (maps, city layer, Power of 5, precinct geometry)
   - **Files safe to touch in Packet 2** (additive mapping, types) vs **do-not-touch** without ADR
   - Gap list against COUNTY plan §1 / §6 and ORGANIZING plan §8

4) Conclude with **5 recommended PR titles** for Packets 2–6 (titles only, no code).

5) **Do not** change application behavior. **Do not** run destructive DB commands. If you run `npm run check`, report result; fixing failures is out of scope unless pre-existing and trivial documentation-only (prefer zero code changes).

6) End by stating: "Packet 1 complete — ready for Packet 2 (region / geography mapping)."
```

---

## Changelog

| Date | Note |
|------|------|
| 2026-04-26 | OIS-1: Option 3 master plan — architecture lock, UI design, 16-packet path; extends county intelligence plan. |

---

*This document is the organizing-intelligence program contract. Update when region taxonomy, Power of 5 schema, or permissions ADRs change.*
