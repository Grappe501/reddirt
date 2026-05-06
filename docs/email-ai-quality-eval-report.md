# Email AI quality evaluation report

**Generated:** 2026-05-06T17:21:54.615Z
**Harness:** EMAIL-AI-QUALITY-EVALUATION-HARNESS-1.0
**Mode:** static_readiness
**OpenAI adjudication:** skipped_static_only_cli

## Summary

- Fixtures evaluated: **10**
- Mean heuristic overall (0–1): **0.8**
- Mean LLM overall (0–1): **n/a (static run)**
- Mean conservative merge (0–1, where LLM ran): **n/a**

## Rubric dimensions

- `voice_fit`
- `clarity`
- `cta_quality`
- `source_discipline`
- `no_unsupported_claims`
- `risk_flagging`
- `audience_fit`
- `compliance_caution`
- `usefulness`

## Per scenario

| Scenario | Type | Heuristic overall | LLM | Notes |
|---|---|---:|---:|---|
| Shift thank-you (synthetic) | `volunteer_follow_up` | 0.8 | — |  |
| Stewardship note (synthetic) | `donor_thank_you` | 0.8 | — |  |
| Community forum invite (synthetic) | `event_invitation` | 0.8 | — |  |
| Media inquiry reply (synthetic) | `press_response` | 0.8 | — |  |
| Policy explainer snippet (synthetic) | `issue_update` | 0.7 | — | Explicit needs-source discipline. |
| Inbox item summary (synthetic) | `queue_triage_summary` | 0.8 | — |  |
| Staged profile hint (synthetic) | `profile_fact_suggestion` | 0.7 | — |  |
| Audience framing (synthetic) | `audience_strategy` | 0.7 | — |  |
| Red-team style note (synthetic) | `draft_critique` | 0.7 | — |  |
| Operator task suggestion (synthetic) | `task_recommendation` | 0.7 | — |  |

## Safety

- Synthetic fixtures only — no live sends, no real contacts.
- This report is **not** a compliance sign-off.
