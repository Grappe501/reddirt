# Narrative public member hub — prototype report

**Lane:** `H:\SOSWebsite\RedDirt` only.  
**Date:** 2026-04-27.  
**Route:** [`/messages`](../src/app/(site)/messages/page.tsx) (public site group `(site)` — same header/footer shell as marketing pages).  
**Scope:** **Additive** prototype — demo/seed data, NDE packet builder read-only composition, **no** blog or comms replacement, **no** new npm dependencies, **no** voter/PII, **no** “AI” product language on the surface.

---

## 1. Purpose

Ship a **volunteer-facing narrative shelf** that mirrors vocabulary from the Narrative Distribution Engine (NDE) docs: **story**, **message support**, **distribution packet**, **Power of 5** conversation practice. The hub gives field teams a single URL for “what we’re saying this week” plus shareable copy blocks — while **Stories**, **Blog**, editorial, and workbench remain the durable publishing and approval rails.

---

## 2. Public wording

- **Primary page title / metadata:** “Conversations & Stories.”
- **Hero eyebrow:** “Message hub.”
- **No** use of “AI” in user-facing strings on this route.

---

## 3. Files created or touched

| Path | Role |
|------|------|
| [`src/app/(site)/messages/page.tsx`](../src/app/(site)/messages/page.tsx) | Public route; `pageMeta` for `/messages`; builds model and renders hub. |
| [`src/lib/narrative-distribution/public-member-hub.ts`](../src/lib/narrative-distribution/public-member-hub.ts) | `buildPublicMemberHubModel()` — static slices + `getCountyNarrativePacket` / `getPowerOf5LaunchPacket`. |
| [`src/components/narrative-distribution/public/NarrativeMemberHubView.tsx`](../src/components/narrative-distribution/public/NarrativeMemberHubView.tsx) | Section layout: message of the week, county cards, P5 prompts, share packets, listening prompts, CTA. |
| [`src/lib/narrative-distribution/index.ts`](../src/lib/narrative-distribution/index.ts) | Re-exports hub builder + types. |
| [`src/config/navigation.ts`](../src/config/navigation.ts) | **Additive** nav + footer link: “Conversations & Stories” → `/messages` (Get Involved + footer “News & action”). |

**Not modified:** `src/app/(site)/blog/**`, workbench comms routes, or story pipelines.

---

## 4. Content blocks (all demo/seed or registry-driven)

1. **Message of the week** — static object in `public-member-hub.ts` (placeholder until wired to approved weekly narrative).
2. **County story cards** — three slugs (`pope`, `washington`, `jefferson`) via `getCountyNarrativePacket`; links to `/counties/[slug]` and `/organizing-intelligence/counties/[slug]`.
3. **Power of 5 conversation prompts** — coaching snapshot from `getPowerOf5LaunchPacket` plus per-stage openers from `POWER_OF_5_ORGANIZING_PIPELINES`.
4. **Volunteer share packet** — checklist + copy-paste block (bracketed slots).
5. **Event invite packet** — checklist + copy-paste block.
6. **Listening prompts** — three static cards; cross-link to `/listening-sessions`.
7. **“Bring this to your five” CTA** — links to `/start-a-local-team`, `/get-involved`, plus `/events`.

Every section is labeled in UI with **Demo / seed** where appropriate; the intro includes a compliance-safe disclaimer.

---

## 5. Relationship to NDE docs

- Aligns with [`NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md`](./NARRATIVE_DISTRIBUTION_ENGINE_SYSTEM_PLAN.md): public vocabulary, geography honesty, MCE vs NDE split.
- Reuses deterministic helpers from [`NARRATIVE_PACKET_BUILDER_REPORT.md`](./NARRATIVE_PACKET_BUILDER_REPORT.md) — no publishing or sends.
- Does **not** implement NDE-2 persistence, amplification queues, or telemetry.

---

## 6. Verification

From the RedDirt folder:

```bash
npm run check
```

---

## 7. Follow-on (optional)

- Wire `messageOfWeek` to an approved CMS or plan metadata when `CommunicationPlan` / narrative wave ids are stable.
- Add region-scoped variant using `getRegionNarrativePacket` behind a selector (still public-safe).
- When volunteer auth exists, gate a “my assignments” strip without exposing this page’s demo badge to production copy.

---

**End of report.**
