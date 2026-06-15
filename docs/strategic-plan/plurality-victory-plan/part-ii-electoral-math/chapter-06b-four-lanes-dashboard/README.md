# Four Lanes Dashboard

> **Status:** Scaffold — Phase 4 build
> **Document:** Arkansas Plurality Victory Plan
> **Classification:** CONFIDENTIAL CAMPAIGN DOCUMENT
> **Part:** II — The Electoral Math
> **Chapter:** 6B (insert after Republican Conversion Model)

---

## Purpose

Track progress across all four lanes so every volunteer and county chair understands **where they fit**.

---

## Lane 1 — Democratic Retention

| Field | Value |
| ----- | ----: |
| Goal | 325,814 |
| Current | TBD |
| Gap | TBD |

*Hold traditional Democratic voters. Prevent drop-off. Protect the base.*

---

## Lane 2 — Democratic Reactivation

| Field | Value |
| ----- | ----: |
| Goal | 51,051 (50% of statewide drop-off) |
| Stretch | 76,563 (75%) |
| Current | TBD |
| Gap | TBD |

*Source: [Chapter 4 drop-off summary](./chapter-04-democratic-drop-off/statewide-drop-off-summary.json)*

---

## Lane 3 — New Voters

| Field | Value |
| ----- | ----: |
| Goal | 50,000 |
| Current | TBD |
| Gap | TBD |

*Source: `CountyCampaignStats.registrationGoal` (DB backfill pending)*

---

## Lane 4 — Republican / Independent Conversion

| Field | Value |
| ----- | ----: |
| Goal | TBD (12% peel model) |
| Current | TBD |
| Gap | TBD |

*Norris Republicans, Harrison Republicans, faith communities, Libertarian-leaning voters.*

**Governing philosophy for Lane 4 conversations:** [Big Table Democrat Doctrine](../../../campaign-brain/relational-organizing/BIG-TABLE-DEMOCRAT-DOCTRINE.md) — build a bigger table; convert through trust, not national party branding.

*Surrogate training:* [local-surrogate-training.md](../../../campaign-brain/routing/local-surrogate-training.md)

---

## Build notes

- Auto-populate Lane 2 goals from Chapter 4 county files
- Auto-populate Lane 3 from registration DB when available
- Wire to [Chapter 14 Weekly Victory Scorecard](../part-vi-campaign-dashboard/chapter-14-weekly-victory-scorecard.md)
