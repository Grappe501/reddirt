# Candidate county brief — foundation (visit prep) (RedDirt)

**Purpose:** Define how the campaign produces a **dense, honest county brief** for the candidate **before field visits**: a **one-page summary** (socio-economics, population, demographics, youth pipeline where data exists) plus an **unabridged reference** (Wikipedia-based context + links), delivered **by email the day before** and surfaced on the **Campaign Manager workbench**—without pretending low-quality estimates are census truth.

**Cross-ref:** [`county-wikipedia-reference-ingest.md`](./county-wikipedia-reference-ingest.md) · [`deterministic-brain-foundation.md`](./deterministic-brain-foundation.md) · [`truth-governance-ownership-map.md`](./truth-governance-ownership-map.md) · [`campaign-manager-workbench-spec.md`](./campaign-manager-workbench-spec.md) · [`geographic-targeting-model.md`](./geographic-targeting-model.md) · `prisma/schema.prisma` (`County`, `CountyPublicDemographics`, `CountyVoterMetrics`, `CountyCampaignStats`, `CampaignEvent`) · [`youth-pipeline-foundation.md`](./youth-pipeline-foundation.md)

**Truth posture (BRAIN-OPS-1):** The **summary** mixes **AUTHORITATIVE** (fields explicitly stored and reviewed), **MIRRORED** (metrics snapshots), **INFERRED** (heuristics), and **reference** (Wikipedia). Every non-authoritative number **must** be labeled in the brief. **AI** may **assemble** copy from resolved rows but **must not** invent statistics.

---

## 1. North star

- **When:** **Day before** each scheduled **county visit** (driven by `CampaignEvent` with `countyId` / confirmed geography).
- **Who:** Candidate (+ optional traveling staff) receives **email**; the **same artifact** appears on the **CM workbench** as a **Visit brief** (future row or document).
- **What:**  
  1. **Executive summary** — scannable bullets and small tables (one screen on mobile).  
  2. **Unabridged** — full Wikipedia-sourced narrative sections + optional staff notes; collapsed or below the fold in email; full page on workbench.
- **Granularity:** **County** today; **city / community** add-ons as volunteers contribute structured local notes (REL-2 / field packets)—**no** fake city granularity from guessing.

---

## 2. Summary page — required blocks

| Block | Primary sources (today) | Truth class |
|-------|-------------------------|-------------|
| **County identity** | `County.displayName`, `County.slug`, FIPS; county seats from `ARKANSAS_COUNTY_EVENT_DIRECTORY` | AUTHORITATIVE (DB + directory) |
| **Population & voting-age** | `CountyPublicDemographics.population`, `votingAgePopulation`, `asOfYear`, `sourceDetail` | AUTHORITATIVE when row populated + reviewed; else PROVISIONAL |
| **Socio-economics** | `medianHouseholdIncome`, `povertyRatePercent`, `bachelorsOrHigherPercent`, `laborEmploymentNote` | Same as above |
| **Registration context** | `CountyVoterMetrics` (latest snapshot): `totalRegisteredCount`, deltas; `CountyCampaignStats.registrationGoal` | AUTHORITATIVE / MIRRORED per [`truth-governance-ownership-map.md`](./truth-governance-ownership-map.md) |
| **Geography / communities (narrative)** | First paragraph + “Communities / geography” from ingested `docs/ingested/county-wikipedia/*.md` **or** link to Wikipedia | Reference (CC BY-SA); not SOS data |
| **Youth / high school seniors** | See §3 — **no** dedicated column in Prisma today | Usually INFERRED or TBD until ACS/ADE ingest |

Optional later blocks: **elected roster** (`CountyElectedOfficial`), **recent events** in county (`CampaignEvent`), **field lead** (`TeamRoleAssignment` / volunteer roster when wired).

---

## 3. High school seniors (and youth pipeline)

**Ideal (future `BRIEF-DATA-1`):** County-level **Census ACS** tables (e.g. enrollment by grade / age bands) or **Arkansas Department of Education** aggregates imported with `source`, `asOfYear`, `reviewStatus`—same pattern as `CountyPublicDemographics`.

**Until then — if the candidate wants a number:**

1. **Preferred gap filler:** Show **“Not yet imported — request ACS S1401 / ADE summary for {county}”** rather than a fake precise count.
2. **Allowed heuristic (optional, ops-approved):** A **campaign-defined** rule documented in code/docs, e.g. approximate **grades 9–12 cohort** as a share of county population using **state-average** age structure applied to `population`, with **wide uncertainty** and label **MODELED ESTIMATE — NOT ACS**.  
   - Example structure only (numbers are **illustrative**, not calibrated):  
     `estimatedUpperSecondary ≈ population * stateYouthShare * stateHSEnrollmentProxy`  
   - **Never** present as “official” or use for targeting without separate DATA packet review.

**Youth program alignment:** Longer term, tie to [`youth-pipeline-foundation.md`](./youth-pipeline-foundation.md) for **program** context—not for substituting census.

---

## 4. Unabridged section

- **Source:** Ingested county Wikipedia markdown (`npm run ingest:county-wikipedia`) — multiple `## Encyclopedia text (part N)` sections.
- **Presentation:** Email = link **“Full county background (Wikipedia + attribution)”** to workbench or static render; include **CC BY-SA** notice and canonical Wikipedia URL (already in generated markdown).
- **Staff overlay:** Optional `notes` field on a future **`VisitBrief`** model for **human** local color (still not “truth” for compliance).

---

## 5. Delivery mechanics (target — not fully built)

| Channel | Target behavior |
|---------|-----------------|
| **Email (T−1 day)** | Scheduled job: for each `CampaignEvent` **tomorrow** with `countyId`, render summary HTML + link to full brief; send via governed comms path (template + review if policy requires). |
| **Workbench** | **Visit Briefs** panel on CM hub: list upcoming visits; open brief for county; same HTML/PDF artifact; **audit** `generatedAt`, `sourcesUsed`. |

**Intentionally out of scope for this doc:** Implementing cron, templates, or new Prisma tables—see **BRIEF-1** below.

---

## 6. City / sub-county expansion

- **Phase 1:** County-only brief; Wikipedia already mentions **county seats** and many communities.
- **Phase 2:** Add **curated** city pages (Wikipedia or local brief markdown) when volunteers **confirm** coverage; **REL-2** contacts may attach **local intel** with provenance—still **PROVISIONAL** until reviewed.
- **Do not** auto-split county demographics into city shares without a **documented** allocation method.

---

## 7. Implementation packets (suggested)

| Packet | Deliverable |
|--------|-------------|
| **BRIEF-1** | Prisma `VisitBrief` or reuse `ComplianceDocument`-style blob + metadata: `campaignEventId`, `countyId`, `summaryHtml`, `fullMarkdownRef`, `truthManifestJson` (which fields were authoritative vs estimated). |
| **BRIEF-2** | Renderer: `getCountyBriefInputs(countyId)` composes DB + Wikipedia path; **unit tests** on one county. |
| **BRIEF-3** | Email + workbench surface: T−1 send, link, audit log. |
| **BRIEF-DATA-1** | Optional ACS/ADE columns on `CountyPublicDemographics` or child table for **enrollment / age bands**—replace heuristics. |

---

## 8. Relationship to Wikipedia ingest

[`county-wikipedia-reference-ingest.md`](./county-wikipedia-reference-ingest.md) feeds the **unabridged** lane and **assistant** context. The **summary** lane should **prioritize** `CountyPublicDemographics` and **campaign** metrics; Wikipedia **supports** narrative, not income/poverty **authority**.

---

*Last updated: candidate county brief foundation (visit prep).*
