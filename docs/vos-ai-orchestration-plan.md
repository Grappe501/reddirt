# Volunteer Operating System — AI orchestration plan

**RedDirt · Kelly SOS field structure.** This document describes how **optional** AI assistance should plug into the Volunteer OS **without** committing secrets or bypassing human judgment.

## Environment

- **`OPENAI_API_KEY`** — set only in Netlify / hosting environment variables or local `.env` (never committed). If unset, dashboards use **deterministic** maturity and task ordering only.
- Do **not** log API keys, prompts containing PII, or raw voter data.

## Intended AI responsibilities

When wired (future server actions or API routes):

1. **Suggest next team tasks** — Input: team maturity level, lane completion signals, open pipeline rows. Output: ranked list aligned with rubric levels 1–5.
2. **Draft outreach emails** — Input: intent (invite, media follow-up, speaking ask), tone, factual anchors from approved messaging. Output: draft for human edit; no auto-send from volunteer surfaces in Phase 1.
3. **Draft local media contact scripts** — Short call/opening scripts; must label as draft; cite compliance (e.g. paid media / disclaimer) when relevant.
4. **Draft speaking opportunity requests** — Email or phone bullet scripts to program chairs; human approval before use.
5. **Summarize team progress** — For upstream contacts: 3–5 bullet recap from dashboard KPIs and narrative fields (no voter-file enrichment in this path).
6. **Recommend next maturity level** — Proposed level + rationale; deterministic `inferVosMaturityFromTeam` remains the default until AI path is reviewed.
7. **Keep dashboards clean** — Select **at most** a handful of “next actions” for the overview; push the rest to “coming up” or archived suggestions.

## Architecture notes

- Prefer **server-side** calls (Route Handler or Server Action) so keys never reach the browser.
- Cache or rate-limit; degrade gracefully when API unavailable.
- Log **audit metadata** only (team slug, timestamp), not message bodies, when possible.

## Cross-references

- Maturity inference: `src/lib/volunteer-ops/vos-team-maturity.ts`
- Task bucketing: `src/lib/volunteer-ops/vos-maturity-tasks.ts`
- Campaign Manager orchestration context: `docs/campaign-manager-orchestration-map.md`

**Status:** Plan only — implementation of OpenAI calls is a follow-on task once Ernie’s preview branch is green and env vars are configured on Netlify.
