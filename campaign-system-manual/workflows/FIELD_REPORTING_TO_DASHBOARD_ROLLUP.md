# Workflow — Field reporting to dashboard rollup

## Purpose

Show how **field activity** and **program signals** (when permissioned) become **aggregate** health on OIS, county, and P5 **scoreboards** — without public voter dossiers.

## Entry point

- Relational activity logs (future/REL-2), `CampaignEvent` participation, `VolunteerAsk` completion, **imported** result aggregates, admin-entered task closure

## User role

- **Field** and **P5** actors report; **data lead** validates

## System role

- Builders in `campaign-engine` and county dashboards; **not** a single magic ETL in Pass 1

## Data captured

- Aggregate counts, pipeline stages, **opt-in** field outcomes (per privacy)

## Dashboard updates

- **State/region/county** OIS; **Pope** v2; **P5** panels where demo/seed

## Workbench queue

- If reporting reveals intake need — new `WorkflowIntake`

## Approval path

- **Data** for public numbers; **CM** for strategic framing of public strips

## KPI affected

- Coverage, activation rate, event throughput, P5 team health (as wired)

## Training needed

- **Honest** missing data; no fabrication of “persuasion” numbers for public

## Current implementation status

- **3–4** (dashboard shell + partial data); full closed loop **2–3**

## Missing pieces

- Uniform activity type → rollup keys; P5 product completion

## Next build steps

- Field reporting schema alignment per OIS-1; verify each tile data source in Pass 2

**Related:** `chapters/06-dashboard-hierarchy` · `chapters/10-field-organizing` · DATA-1
