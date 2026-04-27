# Message system language audit report

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Goal:** Replace public-facing “AI” / vendor-heavy phrasing with trust-building organizing vocabulary (message engine, conversation tools, organizing insights, field intelligence, communication system, story engine, message support, research support) without renaming internal env vars, breaking routes, or changing technical config.

**Protocol read-in:** `README.md`, `docs/RED_DIRT_ORGANIZING_INTELLIGENCE_SYSTEM_PLAN.md` (present; planning-only; no code changes required from that doc for this pass).

---

## 1. Files scanned (method)

Automated search over `RedDirt/` for visitor-relevant and API-facing strings:

- Patterns: `Artificial Intelligence`, `ai-powered`, `automated intelligence`, `smart assistant` (no hits in `src/`).
- Broader: `OpenAI`, `\bAI\b`, `AI-powered` in `src/**/*.tsx`, `src/**/*.ts`, `src/app/api/**/*.ts`, `src/content/**/*`, plus spot checks of `src/app/(site)/**`, onboarding, organizing-intelligence, county-briefings routes.
- **Explicitly out of scope for edits (internal / staff tooling):** `src/app/admin/**`, most `src/components/admin/**`, `src/lib/openai/**`, `src/lib/comms/ai.ts`, Prisma metadata keys (`metadata.ai`), compliance “approved for AI reference” labels, engineer docs under `docs/**` (left readable for build context per mission).

---

## 2. Public-facing language changed

| Area | File(s) | Change (summary) |
|------|---------|------------------|
| Voter registration hub | `src/components/voter/VoterRegistrationCenter.tsx` | Section id `ai-assist` → `message-support`; heading id updated; copy uses **conversation tools** / **message support**; removes “AI” and vendor name; clarifies official SoS systems as source of truth. |
| Ask Kelly dock | `src/components/campaign-guide/CampaignGuideDock.tsx` | Error copy for `not_configured` / `openai_chat_failed` uses **conversation tool** / **guide** framing; badge “AI guide” → **Message support**. |
| Site search dialog | `src/components/search/SearchDialog.tsx` | Description uses **organizing insights** + semantic index; status lines use **Semantic index on** / **Keyword-only mode**; empty-index hint removes public `OPENAI_API_KEY` callout (keeps `DATABASE_URL` + ingest). |
| Host gathering planner | `src/components/planning/HostPlanningCalendarHelper.tsx` | Section title **Organizing insights — date ideas**; errors and body copy avoid “AI”; textarea id `host-plan-ai-notes` → `host-plan-helper-notes`. |
| Homepage festivals | `src/components/home/sections/HomeArkansasFestivalsSection.tsx` | “AI field map” → **Field intelligence (draft)**. |
| Assistant API | `src/app/api/assistant/route.ts` | `not_configured` message is voter-safe; search-failure hint drops env var name; chat failure prefix uses **guide** not **model**. |
| Search API | `src/app/api/search/route.ts` | Fallback answer when semantic path off uses **semantic index** + **message support** (not “AI service”). |
| Planning API | `src/app/api/planning/suggest-dates/route.ts` | Doc comment; `503` message and parse caveat avoid “AI” / env var in public `message` / `caveat` strings. |

**Vocabulary mapping used:** organizing insights, message support, conversation tools, field intelligence, semantic index / planning helper (where a technical noun was needed without saying “AI”).

---

## 3. Internal language left alone (representative)

- **Admin UI:** workbench “AI draft / rewrite”, calendar “AI briefing”, compliance “Approved for AI reference”, social analytics placeholders, etc. — staff-only surfaces; unchanged in this pass.
- **Code & config:** `OPENAI_API_KEY`, `isOpenAIConfigured`, `getOpenAIClient`, JSON field `openai` on `/api/search` GET and `/api/assistant` GET, error code `openai_unconfigured`, rate-limit keys, file paths under `lib/openai/`.
- **Repository docs:** `README.md` “New AI thread” section, `docs/PROJECT_MASTER_MAP.md`, handoff docs — retained for engineer context.
- **Content comment:** `src/content/campaign-guide-quick-prompts.ts` file header still references implementation details for maintainers (not rendered to visitors).

---

## 4. Risks / blockers

1. **Leaked vendor strings:** Rare error paths may still append text from `formatOpenAIErrorForClient` (or similar) into JSON `message` fields; those strings are not fully controlled in this pass.
2. **Answer body from search:** When semantic path is on, the **model-generated** answer text can still use the word “AI” depending on prompt behavior; prompts under `src/lib/openai/prompts.ts` were not modified (copy-trust review is a separate, counsel/content task).
3. **Fragment ID change:** `/voter-registration#message-support` is the new anchor for the former `#ai-assist` block; no in-repo links to `#ai-assist` were found (official links use `#help` / `#refer`).
4. **Tooling quirk:** `SearchDialog.tsx` was recreated in place (delete + write) after in-place patch tooling failed on that file; content was verified to match intent and `npm run check` was run from `RedDirt/`.

---

## 5. Next recommended script

1. **Optional second pass — admin chrome:** Align workbench / calendar / compliance labels with the same vocabulary where it improves staff clarity (“draft assist”, “briefing assistant”, “approved for knowledge base”) without renaming schema columns.
2. **Prompt / RAG review:** Audit `SEARCH_DIALOG_GUIDE_PROMPT`, assistant system prompts, and festival ingest comments for public-tone consistency (still no unsourced claims).
3. **Legal / privacy:** When counsel finalizes `privacy` / `terms`, ensure any disclosure uses plain “automated tools” or “message support” as they prefer, without binding this engineering audit to legal wording.
4. **Regression grep:** Periodically run ripgrep for `\bAI\b` and `OpenAI` under `src/components` (excluding `admin`) and `src/app/(site)` to catch new marketing copy.

---

## 6. Commands

From `h:\SOSWebsite\RedDirt`:

```bash
npm run check
```

(Executed in session; exit code 0.)
