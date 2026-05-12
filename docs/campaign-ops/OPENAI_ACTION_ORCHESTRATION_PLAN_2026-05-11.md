# OpenAI action orchestration plan (volunteer OS)

**Date:** 2026-05-11  
**Status:** Planning / scaffold — **no** live model calls from public routes in Script 6.

## Environment

- Server-side only: `OPENAI_API_KEY` in deployment secrets (e.g., Netlify / Vercel / CI).
- **Never** expose keys to the browser, logs, or committed `.env` samples.
- All generated outputs default to **draft** until a human marks **campaign-approved**.

## Intended capabilities (future)

- Suggest the **next team task** from maturity + Action Queue history (deterministic `inferVosMaturityFromTeam` remains default until reviewed).
- Draft **email copy** from approved template shells + team context.
- Draft **media / speaking outreach** snippets with safety rails (no unsourced opponent claims).
- **Summarize team progress** for ops briefings (aggregate metrics only — no voter PII).
- Recommend **maturity level** adjustments with rationale for staff review.
- Keep dashboards sparse by selecting **only** the top three relevant actions plus hidden backlog metadata.

## Safety & review gates

1. **Draft-only API responses** stored with `reviewStatus: draft | internal_review | approved`.
2. **Human review** required before any outbound email or public post.
3. **No automatic public-facing publication** without editor sign-off.
4. **PII firewall** — prompts must exclude voter-file fields; prefer aggregated KPIs and public geography labels.
5. **Rate limits & kill switch** — feature flag to disable model calls per environment.

## Script 6 scope

- Dashboard Action Queue uses **local preview** completion — no OpenAI dependency.
- Template library and mailto drafts are **deterministic**.
- This document is the integration contract for Script 7+ when a server action is added.

## Suggested implementation sketch (later)

- Next.js **server action** or Route Handler `POST /api/ai/draft-task` with auth + role checks.
- Structured output (JSON schema) for `{ suggestedStepId, rationale, draftEmail }`.
- Audit log row per generation (operator id, timestamp, template ids).

## Explicit non-goals

- Training models on voter data.
- Auto-sending email or auto-posting to social/Discord from model output.
