# EMAIL-AI-QUALITY-EVALUATION-HARNESS-1.0

**Lane:** `RedDirt/` only · **Packet:** repeatable AI output evaluation (synthetic fixtures)

## Goal

Provide a **repeatable harness** to score sample AI-style text against a shared rubric so the team can track whether outputs are improving over time — **without** real PII, **without** sends, and with a **safe default** that does not call OpenAI.

## Artifacts

| Path | Purpose |
|------|--------|
| `data/email-ai-eval-fixtures.json` | Synthetic scenarios (10 types) + `sampleAiOutput` strings — **no real contacts** |
| `scripts/email-ai-quality-eval.mjs` | Runner: heuristic rubric + optional OpenAI JSON adjudication |
| `data/email-ai-quality-eval-report.json` | Latest machine-readable scores (overwritten each run) |
| `docs/email-ai-quality-eval-report.md` | Human-readable companion (overwritten each run) |

## Rubric (1–5 per dimension)

Heuristic scorer (always) and optional LLM adjudicator (when enabled) use:

- `voice_fit` — tone / caps / shoutiness heuristics  
- `clarity` — length + sentence-length proxy  
- `cta_quality` — RSVP / reply / donate / volunteer cues  
- `source_discipline` — hedges, “approved”, “needs source”, official references  
- `no_unsupported_claims` — `%`, “guarantee”, “proven” style risk without mitigation  
- `risk_flagging` — escalation / critique / contrast awareness  
- `audience_fit` — audience / geography / voter language cues  
- `compliance_caution` — finance / legal / unsubscribe posture language  
- `usefulness` — actionable structure (e.g. next step, operator gate)

**Not** legal or compliance sign-off — engineering + comms hygiene only.

## Commands

From `RedDirt/`:

```bash
npm run email:ai:eval
```

**Default:** `--static-only` is baked into the npm script — **no OpenAI HTTP calls**, deterministic heuristic scores only (CI-safe, no token spend).

**Optional full pass** (requires `OPENAI_API_KEY` in the environment, uses `OPENAI_MODEL` or `gpt-4o-mini`):

```bash
node scripts/email-ai-quality-eval.mjs
```

**Force static** (same as npm script):

```bash
node scripts/email-ai-quality-eval.mjs --static-only
# or
EMAIL_AI_EVAL_SKIP_OPENAI=1 node scripts/email-ai-quality-eval.mjs
```

## Hard constraints

- **No real PII** — fixtures use fictional names/places only.  
- **No live sends** — script does not touch SendGrid, Gmail, or queue actions.  
- **OpenAI key missing** → static readiness report (heuristics only).  
- **npm script default** → static-only even if a key is present (opt in to LLM by running the script without flags).

## Checks

Also run the normal lane gates:

- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`
