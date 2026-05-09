# Kelly Grappe for Arkansas Secretary of State — Campaign Strategic Plan Manual

**Document type:** Production-grade strategic and operating manual (campaign program + technology alignment).  
**Lane:** `RedDirt/docs/kelly-grappe-sos-strategic-plan-manual/` (documentation only; does not modify application code).  
**Numbers lane (budget, victory math, counties, GOTV clock):** **[`LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md`](./LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md)** — **read this for all targets and dollar mix.**  
**Companion technical manual:** `RedDirt/campaign-system-manual/` (Campaign Operating System owner’s manual).  
**Canonical engineering map:** `RedDirt/docs/PROJECT_MASTER_MAP.md`  
**Sister product (county portal):** `countyWorkbench/` — see Part 2 audit.

**Version:** 1.1  
**Date:** 2026-05-08  
**Classification:** Internal campaign planning — redact before external distribution as needed.

---

**Operator UI (RedDirt):** After sign-in, open **Campaign strategy** in the admin sidebar (`/admin/campaign-strategy`). The reader renders the Markdown files in this folder as the canonical text (manifest in `src/lib/campaign-strategy/md-manifest.ts`). A TypeScript placeholder remains only for the future county workbench page. **Strategy partner (AI):** with the same admin session, `GET /api/admin/campaign-strategy/chunks` returns H2/H3-aligned chunks (id, plain text, nav metadata); add `?id=…` and `&include=body` for one chunk’s Markdown. **Sharing:** use toolbar **Copy external-safe link** (adds `?share=external`) when you need a URL that hides LANE body text; full internal links omit that query.

## Purpose

This manual unifies:

1. **Strategic program design** — registration, turnout, persuasion, youth, relational field, media, rural thesis, faith and multi-community partnership, GOTV, tours, fundraising, and distributed social.
2. **Technology and data reality** — honest audit of what **RedDirt** (campaign OS) and **county workbench** (county portal) can support today and what requires separate process or future build.
3. **Execution rhythm** — KPIs, governance, compliance posture, and quarter-style cadence.
4. **Victory math and resourcing** — centralized in **[`LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md`](./LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md)** so every chapter stays aligned on **margins, registration goals, county tiers, budget envelopes, and the master GOTV backward clock**.

It is written for **campaign leadership, regional leads, operators using the Workbench, and coalition partners** (appropriate excerpts only for partners — **never** the full **LANE** dollar tables).

---

## How to read this manual

| Part | File | Audience |
|------|------|----------|
| **LANE** | [`LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md`](./LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md) | CM, Finance, Data — **authoritative targets** |
| Meta | [`00-META-AND-DISCLAIMERS.md`](./00-META-AND-DISCLAIMERS.md) | Everyone |
| 1 | [`01-EXECUTIVE-SUMMARY.md`](./01-EXECUTIVE-SUMMARY.md) | Leadership, finance, leads |
| 2 | [`02-BUILD-AUDIT-REDDIRT-AND-COUNTY-WORKBENCH.md`](./02-BUILD-AUDIT-REDDIRT-AND-COUNTY-WORKBENCH.md) | CM, data, engineering, operators |
| 3 | [`03-STRATEGIC-FRAMEWORK-AND-THEORY-OF-CHANGE.md`](./03-STRATEGIC-FRAMEWORK-AND-THEORY-OF-CHANGE.md) | Leadership, communications |
| 4 | [`04-PROGRAM-VOTER-REGISTRATION-AND-TRACKING.md`](./04-PROGRAM-VOTER-REGISTRATION-AND-TRACKING.md) | Field, partners, data |
| 5 | [`05-PROGRAM-TURNOUT-GAPS-PERSUASION-AND-YOUTH.md`](./05-PROGRAM-TURNOUT-GAPS-PERSUASION-AND-YOUTH.md) | Data, field, youth leads |
| 6 | [`06-PROGRAM-RELATIONAL-FIELD-AND-COMMUNITY-INTELLIGENCE.md`](./06-PROGRAM-RELATIONAL-FIELD-AND-COMMUNITY-INTELLIGENCE.md) | Field, volunteers, regional leads |
| 7 | [`07-PROGRAM-COMMUNICATIONS-MEDIA-COLLATERAL.md`](./07-PROGRAM-COMMUNICATIONS-MEDIA-COLLATERAL.md) | Comms, finance, events |
| 8 | [`08-PROGRAM-RURAL-THESIS-AND-COUNTY-SCALE.md`](./08-PROGRAM-RURAL-THESIS-AND-COUNTY-SCALE.md) | Leadership, regional leads |
| 9 | [`09-PROGRAM-FAITH-AND-DIVERSE-COMMUNITIES.md`](./09-PROGRAM-FAITH-AND-DIVERSE-COMMUNITIES.md) | Coalitions, faith liaisons |
| 10 | [`10-PROGRAM-DIRECT-CONTACT-MAIL-PHONE-TEXT-DOOR.md`](./10-PROGRAM-DIRECT-CONTACT-MAIL-PHONE-TEXT-DOOR.md) | Field, compliance, data |
| 11 | [`11-PROGRAM-GOTV-AND-ELECTION-DAY.md`](./11-PROGRAM-GOTV-AND-ELECTION-DAY.md) | Field, legal, logistics |
| 12 | [`12-PROGRAM-ELECTION-INTEGRITY-LISTENING-TOUR.md`](./12-PROGRAM-ELECTION-INTEGRITY-LISTENING-TOUR.md) | Program leads, hosts |
| 13 | [`13-PROGRAM-FUNDRAISING-AND-OPERATIONS.md`](./13-PROGRAM-FUNDRAISING-AND-OPERATIONS.md) | Finance, CM, travel |
| 14 | [`14-PROGRAM-SOCIAL-MEDIA-DISTRIBUTED-NETWORK.md`](./14-PROGRAM-SOCIAL-MEDIA-DISTRIBUTED-NETWORK.md) | Digital, regional leads |
| 15 | [`15-PROGRAM-INSTITUTIONAL-AND-EARNED-MEDIA.md`](./15-PROGRAM-INSTITUTIONAL-AND-EARNED-MEDIA.md) | CM, coalitions, APA liaison |
| 16 | [`16-KPIS-MEASUREMENT-AND-TOOL-MAPPING.md`](./16-KPIS-MEASUREMENT-AND-TOOL-MAPPING.md) | Data, CM, finance |
| 17 | [`17-COMPLIANCE-GOVERNANCE-AND-RISK.md`](./17-COMPLIANCE-GOVERNANCE-AND-RISK.md) | Legal, compliance, CM |
| 18 | [`18-QUARTERLY-EXECUTION-RHYTHM.md`](./18-QUARTERLY-EXECUTION-RHYTHM.md) | Leadership, all leads |
| A | [`APPENDIX-GLOSSARY-AND-REFERENCES.md`](./APPENDIX-GLOSSARY-AND-REFERENCES.md) | Everyone |

---

## Relationship to other docs

- **`CURSOR_CODEX_COORDINATION_PROTOCOL.md`** (workspace root) — lane boundaries; RedDirt vs `sos-public` vs `countyWorkbench`.
- **`RedDirt/docs/REDDIRT_AI_BUILD_MASTER_HANDOFF.md`** — current engineering focus and safety gates (no live send until approved, etc.).
- **`countyWorkbench/docs/COUNTY_WORKBENCH_MASTER_PLAN.md`** — county portal vision and public rules (no backend jargon on public pages).

---

## Maintenance

Update this manual when: strategy pivots, major RedDirt/county workbench capabilities ship, or compliance counsel sets new rules. **Always update [`LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md`](./LANE-BUDGET-VICTORY-MATH-AND-TARGETS.md) when vote, registration, county tier, or budget hypotheses change** — then bump manual **patch** version in **`00-META-AND-DISCLAIMERS.md`**.
