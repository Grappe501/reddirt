# Manual Pass 3B — completion report

**Lane:** `H:\SOSWebsite\RedDirt\campaign-system-manual`  
**Scope:** Markdown / manual only — no app code, no DB, no auth, no dependencies, no commit  
**Date:** 2026-04-27  
**Pass:** *Manual Pass 3B — Fundraising acceleration, 5,000 active volunteer goal, travel field program, and no-hired-staff growth model*

---

## Files read

`CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md`, `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md`, `MANUAL_PASS_3_COMPLETION_REPORT.md`, `SYSTEM_CROSS_WIRING_REPORT.md`, `SYSTEM_READINESS_REPORT.md`, `WORKFLOW_INDEX.md`, `ROLE_MANUAL_INDEX.md`, `workflows/DAY_ONE_TO_ELECTION_DAY_CAMPAIGN_LIFECYCLE.md`, `workflows/PRECINCT_SIGN_HOLDER_AND_VISIBILITY_PROGRAM.md`, `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md`, `docs/audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md`; `prisma/schema.prisma` (targeted read of `CampaignEvent`, `CountyCampaignStats`, `FinancialTransaction`); `src/components/county/CountyCommandExperience.tsx` (public “visits” / road copy).

---

## Files created

- `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` — standalone manual chapter (baseline, goals, pacing, flywheel, travel and repo notes, volunteer scenarios, county ladder, no-hired-staff, redundancy, dashboards, simulation inputs, risks, Steve decisions).
- `MANUAL_PASS_3B_COMPLETION_REPORT.md` — this report.

---

## Files updated

- `CAMPAIGN_STRATEGY_AND_LIFECYCLE_MANUAL.md` — §1–2, **§3** (base **$250K** / stretch **$500K**, unlock rule, weekly needs, **Floor–Breakout** fundraising scenarios), **§7** (5,000 **stretch** honesty, **Floor** 250 / **Base** ~1,000 / **Momentum** ~2,500 / **Stretch** 5,000 volunteer scenarios), **Part B** (B.1–B.6), **§22–23**.
- `SIMULATION_AND_FORECASTING_SYSTEM_PLAN.md` — inputs, baseline, models, new **§19** Pass 3B extensions.
- `MANUAL_BUILD_PLAN.md` — Pass 3B complete; Pass 4 priority role order from 3B.
- `MANUAL_TABLE_OF_CONTENTS.md` — Pass 3B entries; appendices I–J.
- `WORKFLOW_INDEX.md` — Pass 3B cross-links.

---

## New fundraising math (directional)

| Item | Value |
|------|--------|
| Base goal | **$250,000** cumulative by **2026-08-31** |
| Stretch goal | **$500,000** cumulative (after two consecutive reporting periods beating required pace — see strategy §3) |
| Raised to date (baseline) | **~$55,000** |
| Remaining to base | **~$195,000** |
| Remaining to stretch | **~$445,000** |
| Weekly need to base by **Aug 1** (from Apr 28) | **~$14.2K/week** (range ~$13–16K) |
| Weekly need to base by **Aug 31** | **~$10.8K/week** (range ~$9.5–12K) |
| Weekly need to stretch by **Aug 1** | **~$32.5K/week** (range ~$30–35K) |
| Weekly need to stretch by **Aug 31** | **~$24.7K/week** (range ~$22–28K) |

---

## 5,000 active volunteer math (honest)

- From **~10** to **5,000** active ≈ **+4,990** net active; **~18** weeks (Apr 28 → Aug 31) ⇒ **~277** net new active per week if linearized — **not** achievable by ordinary signups alone; requires **movement**-scale mechanisms (house parties, tours, P5, county cells) as documented in §7 and the acceleration plan.
- **5,000** is **not** labeled as “likely” in the manual; it is an **aggressive stretch** for simulation and internal planning.

---

## Travel / event system findings (repo)

- **`CampaignEvent`** (`prisma/schema.prisma`): county, location, time, workflows; **no** dedicated **mileage** field in the reviewed model — use **expense** records and SOP for miles.
- **`CountyCampaignStats.campaignVisits`**: optional **Int** per county — not a per-stop narrative log; can be stale.
- **`FinancialTransaction`**: `category`, `relatedEventId` — appropriate for **paid travel** as third-largest expense when categorized and confirmed.
- **No** `RoadTrip` / tank-receipt entity found in this pass — gap documented; spreadsheet or future model.
- **UI:** `CountyCommandExperience` surfaces “Campaign visits” and latest visit content — **operator** and **provenance** matter; Steve’s external list of stops is **not** verified current in-app.

---

## County activation ladder, no-hired-staff, redundancy

- **Full** **ladder** (stages 0–9) and **RACI**-style **notes** in `FUNDRAISING_AND_VOLUNTEER_ACCELERATION_PLAN.md` and **Part** **B.5** of the strategy manual.
- **No-hired-staff** default: wide volunteer benched roles, **2-deep** where possible, **Pathway** sideways moves, **Workbench** continuity.

---

## Biggest risks

- Public or donor-facing **hype** on **$500K** or **5,000** active before **pace** and **SOP** support them.
- **OIS** / **tour** / **treasurer** numbers **diverge** (Field Intelligence vs ledger).
- **Single** human per critical function (no **backup**).
- **Stretch** **spend** or **narrative** before **treasurer**-confirmed **two-period** **unlock**.

---

## Next recommended pass

**Manual Pass 4 — Role Playbooks, Training Modules, and Dashboard Attachment**

**Prioritize** deeper playbooks and onboarding for, **in this order:** fundraising lead → house party host captain → volunteer coordinator → county coordinator → road team lead → sign holder captain → Power of 5 leader → campaign manager → candidate → owner. First **24h** / **7d** / **30d** task templates; dashboard–manual attachment rules; web manual IA in `web-presentation/`.

(See `MANUAL_BUILD_PLAN.md` and `ROLE_MANUAL_INDEX.md`.)

---

**Last updated:** 2026-04-27 (Pass 3B)
