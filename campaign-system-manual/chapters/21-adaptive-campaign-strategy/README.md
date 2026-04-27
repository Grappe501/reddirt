# Chapter 21 — Adaptive campaign strategy (system design, current vs future)

**Audience:** CM, owner, data, field — **not** an automated “strategy engine” in production today per repo inspection.

## 1. How the system creates a *starting* plan (today)

- **Content:** priorities pages, OIS “strategy” copy, **county** briefings, **comms** plans.  
- **Data:** `CountyStrategyKpi`, `County*`, `Volunteer` pipelines — **suggest** programs; **humans** choose.

## 2. How adaptation *should* work (target)

- **Volunteer growth:** shift capacity targets and **ask** types (`VolunteerAsk` mix).  
- **County performance:** reallocate field attention via **regional** + **workbench** priorities — **SOP**; not automatic.  
- **Message performance:** **MCE/NDE** learning loops in docs — **aggregate** outcome tags, not individual grades.  
- **Voter contact / GOTV progress:** `VoterInteraction`, **vote plan** where used — **permissioned** reporting only.

## 3. Wins and losses (framing)

- **Losses** in digital metrics: trigger **comms** review and **message** pattern updates, not **shame** for volunteers.  
- **Wins:** reinforce **P5** and **OIS** **honest** numbers.

## 4. When strategic changes need approval

- **Paid** or **contrast** comms, **any** new **voter** use policy, **geographic** de-emphasis: **owner** + **compliance** + **counsel** as **MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md** describes.

## 5. KPIs that may govern *recommendation* to humans (not auto-exec)

- **Open** intake **age**; **county** pipeline conversion; **event** no-show; **GOTV** plan completion.  
- All require **data quality** **and** **human** sign-off to change *strategy in public*.

## 6. Current vs future (Pass 2B)

| Current | Future |
|---------|--------|
| Human CM sets priorities | In-app **phase** and **RACI** object |
| OIS and county static copy w/ honest-data warnings | **Single** `CountyIntelligenceViewModel` per county plan |
| MCE/NDE partial | Full **Narrative wave** ↔ **Comms** send telemetry |

**Status:** **Pass 2B** — 2026-04-27
