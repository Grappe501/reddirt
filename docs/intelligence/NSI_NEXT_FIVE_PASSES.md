# NSI Next Five Major Passes

**After:** NSI-15 (Human Action Queue) — LIVE  
**Planning date:** 2026-05-29  
**Scope:** Major passes only — each is multi-week engineering + operator validation.

---

## Pass 1 — NSI-16: Campaign Operations Command Center

| Field | Value |
| ----- | ----- |
| **Purpose** | Unify daily operator workflow into one governed command center |
| **Expected impact** | Converts tool collection → daily habit; cuts tab fatigue 70%+ |
| **Difficulty** | Medium |
| **Dependencies** | NSI-7, 13, 14, 15 LIVE; brain coordinator stable |
| **Completion gain** | +12% program maturity (74% → ~86% for operator UX) |
| **Progress bar** | Operator Command Center 32% → **85%** |
| **Operator value** | Campaign manager opens one page each morning |
| **Long-term value** | Institutionalizes intelligence OS as “how we run the race” |

**Deliverables:** `/admin/intelligence/command-center`, role tabs, delta strip, weekly packet export (human-triggered), tests `agents:test-operations-command-center`.

---

## Pass 2 — NSI-17: Intelligence Persistence & Hosted Queue Layer

| Field | Value |
| ----- | ----- |
| **Purpose** | Move critical JSON queues (action, LLM, media, memory) to Postgres with audit parity |
| **Expected impact** | Netlify-safe writes; multi-operator concurrency; backup discipline |
| **Difficulty** | High |
| **Dependencies** | Prisma tenancy patterns; no cross-lane imports |
| **Completion gain** | +8% production readiness |
| **Progress bar** | Production Persistence 55% → **88%** |
| **Operator value** | Status changes survive deploys |
| **Long-term value** | Foundation for real-time and multi-user war room |

**Deliverables:** Schema models, migration, dual-read adapters, retirement plan for file queues.

---

## Pass 3 — NSI-18: Rapid Response Desk (Governed)

| Field | Value |
| ----- | ----- |
| **Purpose** | Same-day signal → triage → prep workflow for media/opponent breaks |
| **Expected impact** | Cuts rapid response prep from hours to governed minutes |
| **Difficulty** | Medium–High |
| **Dependencies** | NSI-8–10 production feeds; NSI-16 hub; optional NSI-17 persistence |
| **Completion gain** | Rapid Response 48% → **75%** |
| **Operator value** | Comms lead has one rapid response queue |
| **Long-term value** | Professional crisis comms capability without auto-publish |

**Deliverables:** Rapid response route, severity taxonomy, NSI-15 action type extensions, cron monitor hooks, drill playbook doc.

**Explicit non-goals:** Auto-post, auto-press-release, auto-social.

---

## Pass 4 — NSI-19: Probabilistic Pathway & Scenario Calibration

| Field | Value |
| ----- | ----- |
| **Purpose** | Connect registration/turnout assumptions to scenario outputs with sensitivity tables |
| **Expected impact** | Leadership sees “if X then Y” with labeled assumptions — not fake precision |
| **Difficulty** | High |
| **Dependencies** | NSI-6 adapters; election data ingest; NSI-14 engine refactor |
| **Completion gain** | Forecasting 38% → **62%** |
| **Operator value** | Strategy meetings use one calibrated workbook |
| **Long-term value** | Elite differentiator vs. static opposition folders |

**Deliverables:** Pathway scenario matrix, assumption registry UI, `agents:test-pathway-scenario-calibration`.

---

## Pass 5 — NSI-20: Adversary Digital Observatory

| Field | Value |
| ----- | ----- |
| **Purpose** | Continuous opponent surface monitoring (web, video, social signals) into intake queue |
| **Expected impact** | Opponent move detection without manual refresh |
| **Difficulty** | High |
| **Dependencies** | NSI-8–10; media ethics gates; storage budget |
| **Completion gain** | Intelligence Collection 68% → **82%** |
| **Operator value** | Research desk sees opponent deltas daily |
| **Long-term value** | Approaches professional opposition tracking firms |

**Deliverables:** Source connectors (governed), change-detection summaries, NSI-13 drift integration, no auto-claims.

---

## Summary table

| Pass | Name | Difficulty | Maturity lift | Operator wow-factor |
| ---- | ---- | ---------- | ------------- | ------------------- |
| NSI-16 | Command Center | Medium | ★★★★★ | ★★★★★ |
| NSI-17 | Persistence | High | ★★★★☆ | ★★★☆☆ |
| NSI-18 | Rapid Response Desk | Med–High | ★★★★☆ | ★★★★☆ |
| NSI-19 | Pathway Calibration | High | ★★★☆☆ | ★★★★☆ |
| NSI-20 | Adversary Observatory | High | ★★★★☆ | ★★★★☆ |

---

## Suggested sequencing

```text
NSI-16 (now) → NSI-17 (parallel start) → NSI-18 → NSI-19 → NSI-20
```

NSI-16 delivers immediate operator value without blocking on DB migration. NSI-17 should begin early because file-backed queues are the main production risk on Netlify.

---

## Test expansion per pass

| Pass | New test script |
| ---- | --------------- |
| NSI-16 | `agents:test-operations-command-center` |
| NSI-17 | `agents:test-intelligence-persistence` |
| NSI-18 | `agents:test-rapid-response-desk` |
| NSI-19 | `agents:test-pathway-scenario-calibration` |
| NSI-20 | `agents:test-adversary-observatory` |
