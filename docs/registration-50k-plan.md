# 50,000 new registrations (statewide anchor)

**Nonpartisan civic participation** — this section frames why the campaign points to a concrete registration goal, how counties contribute, and how progress is **aggregate-only** in RedDirt (no public person lists).

## Why 50K matters

A large, lawful registration push:

- Grows the pool of people who *can* participate in democracy (turnout, jury pools, and accountability all start with being on the roll where eligible).
- Demonstrates the kind of **scale and discipline** a Secretary of State’s office should model: clear processes, reliable data, and respect for the law.
- Pairs with **verifiable** tools (file snapshots, county dashboards) so growth is not a slogan—it is checkable in the product.

## Framing (nonpartisan)

Registration assistance, where the law allows, is about **access and accuracy**—not about labeling voters by party. Party preference is a separate, voluntary act. Training for volunteers should emphasize **neutral** help: deadlines, ID rules, and where to get official information.

## County contribution

When `CountyVoterMetrics.totalRegisteredCount` (or `CountyRegistrationSnapshot`) exists, we can show a **proportional “fair share”** of a statewide 50,000 target for planning conversations—not a cap on speech and not a legal obligation. See `buildCountyRegistrationGoal` in `src/lib/campaign-engine/registration-kpis.ts`.

## Coalition and volunteer roles

- **Partners** host tables, supply translators, and connect trusted messengers in communities the campaign does not own.
- **Volunteers** follow campaign compliance and state rules; the **kellygrappe.com** front door and RedDirt **team engine** coordinate tasks without exposing PII in public drops.

## How we track progress

- Prefer **file-derived** `CountyVoterMetrics` and/or manual `CountyRegistrationSnapshot` for county totals.
- **Statewide** line: `buildStatewideRegistrationGoalProgress` sums `CountyCampaignStats.newRegistrationsSinceBaseline` when populated—treat as a **planning** sum until the finance/data SOP is verified.

## Why this shows Secretary of State readiness

Competent administration is measured in part by whether the office can make participation **legible**—filing, notice, and professional handling of the roll. A campaign that can describe registration growth with sourced data and safe tooling is aligned with the job.

## Warnings (legal and ethical)

- Registration work must follow **federal and Arkansas law** and any applicable training for deputy registrars.
- **Nonpartisan** where the context requires; do not condition help on party.
- This document is for **internal** planning; the public `registration-50k` static page summarizes the same ideas without private metrics.

*COUNTY-INTEL-2 — 2026-04-24*
