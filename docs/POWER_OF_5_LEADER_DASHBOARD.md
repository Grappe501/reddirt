# Power of 5 — leader dashboard

**Lane:** `RedDirt/` only.  
**Route:** [`/dashboard/leader`](../src/app/(site)/dashboard/leader/page.tsx) (public site shell via `(site)` layout).  
**Date:** 2026-04-27.  
**Related:** [`POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md`](./POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md), [`audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md`](./audits/DASHBOARD_HIERARCHY_COMPLETION_AUDIT.md).

---

## Purpose

The **leader dashboard** is the **Power Team leader** home: a single surface to see **teams they coach**, **completion gaps**, **fragile nodes**, **follow-up debt**, and a **team health** snapshot. It sits **below** public organizing intelligence (OIS) and **above** individual “my dashboard” in the product hierarchy.

**Today:** the route ships with **demo / seed data** only — no session, no Prisma reads, no voter file, no real roster PII. The UI exists so navigation, copy, and section boundaries stabilize before hydration.

**Target state:** auth-gated (cookie/session per campaign rules), consent-scoped rosters, metrics derived from relational events and team objects described in the Power of 5 plan — still **aggregate-first** on any geography-facing drill.

---

## UI sections (what ships now)

| Section | Intent | Production meaning (future) |
|--------|--------|-----------------------------|
| **Team health** | Executive KPI strip | Rollup of team completion, queue depth, risk counts — leader’s “at a glance.” |
| **Teams under leader** | Card grid | Teams assigned to this leader in the hierarchy; My Five fill rate and health pill. |
| **Incomplete teams** | Filtered list | Open seats or completion below target; drives invite and activation work. |
| **Weak nodes** | Risk cards | Under-connected slots or stale touches — coach, reassign, or pair with a buddy. |
| **Follow-ups due** | Queued items | Relational debt by due bucket (overdue / today / week); clear latency honestly. |

Demo copy is explicitly labeled; team names are **synthetic** (e.g. turf labels), not voter or volunteer identities.

---

## Code map

| Piece | Path |
|-------|------|
| Page | `src/app/(site)/dashboard/leader/page.tsx` |
| View | `src/components/dashboard/leader/PowerOf5LeaderDashboardView.tsx` |
| Demo payload builder | `src/lib/campaign-engine/power-of-5/build-leader-dashboard-demo.ts` |
| Shared primitives | `CountySectionHeader`, `CountyKpiStrip`, `countyDashboardCardClass` from county dashboard shell |

---

## Constraints and safety

- **No PII** on the public demo path; do not bind real names, phones, or voter keys to this page until auth and ACLs exist.
- **Voter file** remains staff-side reference per campaign policy — this dashboard is **relational team health**, not a people browser.
- **OIS** (`/organizing-intelligence`) stays the public aggregate story; leader view is **role-native** and gated when live.

---

## Next implementation packets (suggested)

1. **Auth + team scope** — resolve “teams under leader” from `PowerUser` / team membership (see plan §3–4).
2. **Event-backed metrics** — replace demo KPIs with aggregates from logged touches, invites, follow-ups (retention rules TBD).
3. **Weak node rules** — configurable thresholds (SLA drift, touch gap, diversity of paths) with audit-friendly explanations.
4. **Follow-up sync** — optional integration with tasks/inbox (`/admin` queues) without duplicating relational truth.

---

## Changelog

- **2026-04-27:** Initial doc; `/dashboard/leader` populated with five sections and demo builder.
