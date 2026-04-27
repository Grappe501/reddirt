# Power of 5 × Message Engine × Narrative Distribution — integration report

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Scope:** Visual and logical cross-links only — **no database writes**, **no auth changes**, **no private or voter-linked data**. All copy remains **demo / seed** or registry-derived.

## Executive summary

The three tracks (Power of 5 onboarding and dashboards, Message Content Engine surfaces, Narrative Distribution registry + public member hub) are now **explicitly wired** through shared callouts and one state-level summary panel. Volunteers and operators can move from **relational onboarding → What to Say → weekly narrative shelf → dashboards** without new APIs or persistence.

---

## Routes integrated

| Surface | Path | Integration |
|--------|------|-------------|
| Power of 5 onboarding | `/onboarding/power-of-5` | Screen 5 already embeds `WhatToSayPanel` (Message Engine). Screen 9 preview grid includes **Message hub** (`/messages`). Screen 11 adds **`MessageHubLinkCard`** CTA to the full hub. |
| Message hub | `/messages` | Intro copy links to **onboarding**, **personal dashboard**, and **leader dashboard** (`NarrativeMemberHubView`). |
| Personal dashboard | `/dashboard` | **`WhatToSayPanel`** + **`MessageHubLinkCard`** (“Weekly line & missions shelf”). **`MyTasksPanel`** titled **Missions — follow-ups & conversations**. |
| Leader dashboard | `/dashboard/leader` | **`MessageHubLinkCard`** (“Team message packet”) after pipeline visualization. |
| Pope v2 (gold sample) | `/county-briefings/pope/v2` | **`MessageIntelligencePanel`** (existing) + **`MessageHubLinkCard`** (“County message packet”). |
| State organizing intelligence | `/organizing-intelligence` | **`MessageIntelligencePanel`** (existing) + **`NarrativeDistributionSummaryPanel`** (narrative shelf summary + link to `/messages`). |
| Narrative distribution (admin) | `/admin/narrative-distribution` | **`PowerOf5LaunchIntegrationPanel`** at top of command center (`getPowerOf5LaunchPacket()` + outbound links). |

---

## Components reused

| Component | Role |
|-----------|------|
| `WhatToSayPanel` | Message Engine — already on onboarding (training step) and personal dashboard. |
| `MessageIntelligencePanel` | Message Engine — already on state OIS and Pope v2; unchanged behavior. |
| `MessageHubLinkCard` | **New** (`src/components/integrations/MessageHubLinkCard.tsx`) — client component, gold-left-border card, links to `/messages`. Used: onboarding completion, personal dashboard, leader dashboard, Pope v2. |
| `NarrativeDistributionSummaryPanel` | **New** (`src/components/integrations/NarrativeDistributionSummaryPanel.tsx`) — server-safe; calls `buildPublicMemberHubModel()` for MOTW + share-packet checklist excerpt; used on state OIS. |
| `PowerOf5LaunchIntegrationPanel` | **New** (`src/components/narrative-distribution/admin/PowerOf5LaunchIntegrationPanel.tsx`) — `getPowerOf5LaunchPacket()` + links to onboarding, `/dashboard`, `/messages`, `/organizing-intelligence`. |
| `NarrativeDistributionCommandCenter` | Composes admin prototype; now mounts `PowerOf5LaunchIntegrationPanel` above KPI strip. |
| `NarrativeMemberHubView` | Public hub; intro augmented with P5 route links. |
| `CountySectionHeader`, `CountySourceBadge`, `countyDashboardCardClass` | Shared county dashboard primitives on new panels. |

---

## Demo values (sources)

- **Message hub model:** `buildPublicMemberHubModel()` — static **message of the week** (`STATIC_MESSAGE_OF_WEEK`), **volunteer share packet** checklist/copy, county cards from `getCountyNarrativePacket` for slugs `pope`, `washington`, `jefferson`, Power of 5 prompts from `POWER_OF_5_ORGANIZING_PIPELINES`.
- **Power of 5 launch packet (admin):** `getPowerOf5LaunchPacket()` — builds from `DEMO_NARRATIVE_PACKETS` (`nde.demo.packet.power_of_5_launch` or title fallback), template `mce.p5_onboarding.circle_invite.v1`, pipeline ladder string from `POWER_OF_5_ORGANIZING_PIPELINES`.
- **Message intelligence (state / county):** `getMessageIntelligenceDemoModel(scope)` — unchanged deterministic demo mix per scope.
- **Onboarding dashboard preview:** `DASHBOARD_PREVIEWS` in `lib/power-of-5/onboarding-demo.ts` — added **Message hub** row; county gold-sample route corrected to **`/county-briefings/pope/v2`**.

---

## Remaining gaps

1. **No single sign-on or session** — `/dashboard` and `/dashboard/leader` remain public demo routes; “missions” and leader rollups are not tied to real users.
2. **No write path** — hub, packets, and intelligence panels do not create drafts, sends, or workbench rows; admin narrative page stays read-only prototype.
3. **No live telemetry** — message performance, narrative gaps, and distribution KPIs are illustrative until conversation logging and comms rails feed aggregates.
4. **County hub cards vs. command slugs** — narrative registry uses short slugs in some demo cards (`/counties/pope`); gold-sample briefing uses `pope-county` elsewhere. Harmonizing slugs is a content/registry pass, not done here.
5. **Region / precinct futures** — onboarding preview still marks future drill routes; no new geography wiring.
6. **Admin sidebar** — `/admin/narrative-distribution` may not appear in `AdminBoardShell` nav; discovery is via direct URL or internal links (optional follow-up).

---

## Reference reading (this pass)

- `README.md` — lane context and quality gate.
- Power of 5: `docs/POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md`, `docs/POWER_OF_5_ONBOARDING_PROTOTYPE_REPORT.md`, `docs/POWER_OF_5_PERSONAL_DASHBOARD.md`, `docs/POWER_OF_5_LEADER_DASHBOARD.md`, `docs/POWER_OF_5_DASHBOARD_INTEGRATION.md`.
- Message Engine: `docs/MESSAGE_ENGINE_DASHBOARD_INTEGRATION_REPORT.md`, `docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md`, `docs/MESSAGE_RECOMMENDATION_ENGINE_REPORT.md`.
- Narrative Distribution: `docs/NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md`, `docs/NARRATIVE_DISTRIBUTION_TYPES_REPORT.md`.
- Routes verified: `src/app/onboarding/power-of-5/page.tsx`, `src/app/(site)/messages/page.tsx`, `src/app/(site)/dashboard/page.tsx`, `src/app/(site)/dashboard/leader/page.tsx`, `src/app/organizing-intelligence/page.tsx`, `src/app/admin/narrative-distribution/page.tsx`, Pope v2 app route under county-briefings.

---

## Verification

From `RedDirt/`: `npm run check` (lint + `tsc` + build) should pass after these edits.
