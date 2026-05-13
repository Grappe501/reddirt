# Production readiness audit · Kelly SOS / RedDirt

**Date:** 2026-05-11  
**Status:** Working master checklist — not a compliance sign-off  
**Owner:** Campaign ops + engineering (Steve / Burt lane)  

This document is the **authoritative audit and planning source** for the next production-hardening phases. It confirms the system is **not yet production-ready**, outlines cultural onboarding, KPI inventory, database posture, GOTV roadmap, unfinished surfaces, form gaps, and planned programs (fundraising, postcards, phone banks, canvassing, Discord, community-native Hispanic and Marshallese).

**Operating rule — downloads:** Any downloadable campaign asset must be routed through **Ernie** before publication. Use §16 and `src/lib/volunteer-resources.ts` + publication helpers as the implementation checklist.

**Build cadence:** Work **one production item at a time**. Future phases after Item 1 are ordered at the end of this document.

---

## Executive summary

- **Core architecture is strong** (Volunteer OS surfaces, community lanes, county party dashboards, admin/workbench separation per lane rules).
- **Production readiness is still incomplete** (links, forms, live KPI wiring, automation, and legal confirmation of public dates).
- **Critical pages and hubs remain draft or partial**; **mock data** still drives many dashboards.
- **County goals** exist in the database (`CountyCampaignStats`) but are **not consistently surfaced** across every lane (see §8 and Item 1 status).
- **Countdown clocks** were a documented gap in the audit narrative; **Item 1** addresses election + registration countdown in code (see §7).
- **Forms and email automation** are incomplete relative to a full production standard.

---

## §1 Cultural onboarding architecture

**Intent:** Phased cultural onboarding so volunteers and leads absorb norms (priorities, accountability, community-specific respect) without relying on a single static “culture.doc.”

**Working approach (product):**

1. **Embed norms in journeys** — onboarding copy, field playbook sections, dashboard disclosures, and resource hub intros (not only a monolithic doc).
2. **Lane-specific coaching** — Events / Social / P5·VR tabs reference the same triad doctrine and escalation patterns.
3. **Community regions** — Muslim, county party, and future Hispanic/Marshallese hubs mirror leadership + cross-lane coordination docs under `docs/campaign-ops/` and `/volunteer/resources/*`.

**Gap:** No single “culture PDF” is required for launch, but **consistent copy review** and **partner review** (e.g. Muslim Community draft flags) must complete before calling those surfaces “final.”

---

## §2 Full KPI inventory (high level)

| Area | Primary surface | Data posture (typical) |
|------|----------------|------------------------|
| Team VOS | Team overview, metrics tab | Mix of **mock seed** and DB-backed teams |
| County command | Public county pages, workbench | **CountyCampaignStats**, voter metrics snapshots where wired |
| Community regions | Muslim / county Democrats dashboards | **Partial** — rollups and contribution math often **placeholder** |
| Youth / Women’s | Dashboard modules | Often **scenario / mock** until wired to field outcomes |
| Admin / workbench | KPI strips, orchestration | Operational; not volunteer-facing |

**Gap:** Roll up **live** county registration progress + **global 50k ambition** everywhere it matters; label **live vs demo vs not connected** on every public dashboard card.

---

## §3 Database wiring status

**In DB (examples):**

- `County` + `CountyCampaignStats` — `registrationGoal`, `newRegistrationsSinceBaseline`, pipeline metadata.
- Read-only helpers: `src/lib/campaign-engine/county-goals.ts`, loader `county-registration-goal-load.ts`.

**Gaps:**

- Team/community dashboards **not fully unified** on live county aggregates.
- **VOS P5 registration counts** are **not** the same as county-file totals — product copy must keep that distinction.
- **Muslim / multi-county community** contribution to statewide goal — **not yet** a DB rollup.

---

## §4 GOTV operations lane foundation (§6)

**Target:** Concrete GOTV readiness (timeline, registration cutoff communication, capacity) under **P5 / VR** and eventual **GOTV Operations Lane** — **not built in the May 2026 hardening pass** beyond foundations below.

**Foundations in scope for Item 1:**

- Election date + **working** registration deadline constant with **legal confirmation note** (`src/lib/campaign-dates.ts`).
- County registration goal card + statewide goal context on team, county party, and community overview where applicable.

**Explicitly out of scope for Item 1:** Full GOTV lane UI, Discord, postcard/phone/canvass programs, fundraising OS.

---

## §7 Campaign clock

**Requirement:**

- **Election Day:** 2026-11-03 (central constant).
- **Voter registration deadline:** working date in code with **“pending legal confirmation”** — **do not** treat as final for public legal messaging until **Arkansas Secretary of State calendar** + **campaign counsel** confirm.

**Implementation status (codebase, post–Item 1):**

- `src/lib/campaign-dates.ts` — centralized constants + compliance comments.
- `src/components/campaign/CampaignCountdown.tsx` — days to election + days to working deadline + status note.
- **Placements:** `/volunteer` (below hero), team overview, Muslim community overview, county Democratic Party overview (`/dashboard/community/county-democrats/[countySlug]`).

**Remaining gap:** Swap working deadline and copy to **final** only after compliance sign-off; optionally add sitewide instances (e.g. homepage, `/register`) in a later pass.

---

## §8 County goals integration

**Requirement:** Surface county **goal**, **progress**, **remaining**, **percent complete**, and **context vs statewide 50,000** where geography is known.

**Implementation status (codebase, post–Item 1):**

- `CountyRegistrationGoalCard` + `loadCountyRegistrationGoalCardData` (Prisma when DB configured; demo path when not).
- Team overview infers county via `linkedCountySlug` or `inferTeamCountyRegistrySlug`.
- County party overview loads by route slug.
- **20-square** progress strip (5% per square) when goal numeric.
- **Status badges:** live / demo / not connected.

**Remaining gaps:**

- **“Everywhere”** roll-out (other community lanes, youth/women’s hubs, homepage) not complete.
- **Community regional** contribution remains placeholder pending rollup design.

---

## §9 Unfinished pages and placeholders (non-exhaustive)

Captured for **Item 2** (full link audit). Examples codified in app:

- `get-involved` — volunteer form **coming soon**.
- `bring-5` — signup **coming soon**.
- `start-a-local-team` — form **coming soon**.
- `events/county-fairs` — Arkansas county map **coming soon**.
- Volunteer resource hubs — **Coming soon** tiles (e.g. county party launch kit, social media design, team launch kit sections).
- Dashboard: **Download brand kit** placeholder (`TeamSocialMediaTabContent`).

**Community completion estimates** (planning only — verify in Item 2):

| Lane | ~Complete |
|------|-----------|
| Muslim Community | ~45% |
| Hispanic Community | ~25% |
| Marshallese Community | ~25% |
| Youth Outreach | ~60% |
| Women’s Outreach | ~50% |
| County Democratic Parties | ~55% |

---

## §10 Form inventory

**Gap:** Public volunteer intake should move to **system-native** form (queued as Item 3). Until then, multiple surfaces still say **“coming soon”** instead of a single authoritative form + `/api/forms` contract documented in the Kelly SOS launch plan.

---

## §11 Email automation and orchestration

**Status:** **Planned / partial** in admin workbench — not volunteer-facing “set and forget” automation at production standard. Queued after GOTV lane (Item 5 in phased list below).

---

## §12 Fundraising operating system

**Status:** **Not operational** in this audit window — architecture and admin tools may exist; **production OS** for fundraising is a **future phase** (Item 6).

---

## §13 Postcards, phone banks, canvassing

**Status:** **Plans only** for this document — implementation queued (Item 7).

---

## §14 Discord integration

**Status:** Onboarding and bot strategy **out of scope** until Item 8; no production bot requirement in this audit.

---

## §15 Community-native Hispanic and Marshallese systems

**Status:** **Future phase** (Item 9 in extended queue) — parity with Muslim/county-party **dashboard shell + resources** pattern; completion estimates in §9.

---

## §16 Downloadable assets — Ernie review queue

**Policy:** No PDF or handout goes to **Published** / direct download until **Ernie** review.

**Code sources:**

- Registry: `src/lib/volunteer-resources.ts` (`VOLUNTEER_RESOURCES`).
- Gating: `src/lib/volunteer-resource-publication.ts` (`presentVolunteerResource`, `allowDirectFileDownload` only when `published` and not `comingSoon`).

**PDF paths currently defined** (most rows use `comingSoon: true` → **not** direct-download eligible until status flips after review):

| Resource id (excerpt) | Path | Notes |
|-------------------------|------|--------|
| quick-start | `/resources/getting-started/quick-start-guide.pdf` | Draft / coming soon |
| welcome-packet | `/resources/getting-started/volunteer-welcome-packet.pdf` | Draft / coming soon |
| team-launch-checklist | `/resources/team-building/team-launch-checklist.pdf` | Draft / coming soon |
| team-builder-worksheet | `/resources/team-building/team-builder-worksheet.pdf` | Draft / coming soon |
| reporting-template | `/resources/weekly-operations/weekly-reporting-template.pdf` | Draft / coming soon |
| qr-sharing | `/resources/recruitment/qr-code-sharing-guide.pdf` | Draft / coming soon |
| volunteer-qr | `/resources/recruitment/volunteer-qr-code.pdf` | Draft / coming soon |
| role-cards-print | `/resources/printables/role-cards.pdf` | Draft / coming soon |
| team-worksheet-print | `/resources/printables/team-worksheets.pdf` | Draft / coming soon |
| event-checklist-print | `/resources/printables/event-checklists.pdf` | Draft / coming soon |
| playbook-pdf | `/resources/playbook/field-playbook-complete.pdf` | Draft / coming soon |

**Repo check:** As of this audit, **no `.pdf` files** were present under `public/` — paths are **targets** for assets once produced and approved.

**Other download-adjacent:**

- `CampaignBriefingLibrary` and admin ECC panels include export/download behaviors for **staff** — separate from volunteer public PDF policy; still treat candidate-facing exports with care.

---

## §17 Production readiness gaps — verdict

The platform **does not yet meet** the production standard summarized in stakeholder review because:

1. **Critical pages remain incomplete** (forms, maps, several resource sections).
2. **Sitewide links** have **not** been fully verified (Item 2).
3. **Mock data** still drives **many** dashboards.
4. **County goals** are **not shown everywhere** they should be (partial fix: Item 1).
5. **Countdown clocks** were a gap in the audit narrative; **operational** in key surfaces after Item 1 — still expand + legally finalize dates.
6. **Forms and automation** are incomplete.

**When Item 1 is “done” for checklist purposes:** §7–§8 acceptance criteria met on **volunteer**, **team overview**, **Muslim overview**, **county party overview**; remaining work tracked as §17 bullets and §8 “everywhere” roll-out.

---

## §18 Phased build queue (authoritative order)

After **Item 1** (Campaign clock + county goals — §6–§8, §17):

1. **Item 2:** Full page/link audit and unfinished-page report.
2. **Item 3:** System-native volunteer form replacement + form inventory.
3. **Item 4:** GOTV Operations Lane under P5 / VR.
4. **Item 5:** Email automation + action orchestration.
5. **Item 6:** Fundraising OS.
6. **Item 7:** Postcards / phone banks / canvassing.
7. **Item 8:** Discord integration.
8. **Item 9:** Community-native Hispanic and Marshallese systems (extend queue per stakeholder).

---

## §19 Document control

- **Saved at:** `RedDirt/docs/campaign-ops/PRODUCTION_READINESS_AUDIT_2026-05-11.md`
- **Updates:** Append dated addenda for each hardening pass; do not silent-delete findings until resolved and verified.

---

## §20 Immediate next actions

1. Treat this file as **master production gap list**.
2. Keep **Item 1** closed only when §7–§8 and acceptance tests are signed off in engineering notes.
3. Route **all** new PDFs through **Ernie** before setting `publicationStatus: "published"` in `VOLUNTEER_RESOURCES`.
4. Start **Item 2** link audit using §9 as seed list.
