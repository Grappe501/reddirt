# Message engine × voter / contact profiles — integration report

**Lane:** `H:\SOSWebsite\RedDirt`  
**Date:** 2026-04-27  
**Scope:** Add a **permission-safe Conversation Tools** block to **existing admin-only** voter and relational-contact profile pages. Deterministic message registry only — **no** model calls, **no** schema migrations, **no** new public routes.

---

## Summary

Staff viewing **REL-2 contacts** or **voter model (read-only)** pages now see a **Conversation Tools** section with:

- **Relationship context** — plain language from REL-2 relationship type / closeness + county posture (or explicit “no REL-2 link” copy on the voter page).
- **Suggested opener** — first ranked **conversation starter** from `getConversationStarterSet` (`leader` visibility tier).
- **Listening prompt** — `mce.listening.two_way_open.v1` (registry), with starter-set fallback if needed.
- **Follow-up prompt** — primary `getFollowUpSet` template, else registry follow-up prompt list.
- **Pipeline next step** — human organizing pipeline / follow-up line from REL-2 **only**, plus one optional coaching line from `getMessageRecommendations` next actions (still registry-based).
- **Privacy & permission label** — staff-only, no dossier framing; voter page explicitly warns against echoing file keys / modeling outputs in outreach.

Public wording in the UI avoids **“AI”** and matches the message system language audit. Snippets are **starting points**, not inferred private facts.

---

## Surfaces touched

| Route | Gate | Change |
|-------|------|--------|
| `/admin/relational-contacts/[id]` | `requireAdminPage` + `(board)` | Renders `AdminProfileConversationToolsSection` after relationship / organizing blocks. |
| `/admin/voters/[id]/model` | Same | Renders the same section after relational organizing cards; uses county slug as **display-only** place label when no richer label exists. |

No changes to public `(site)` routes, OIS, or county command pages.

---

## Files added

| File | Role |
|------|------|
| `src/lib/campaign-engine/relational-message-context.ts` | Maps REL-2 enums → message-engine `RelationshipType`; staff labels; `formatCountySlugForConversationContext`. |
| `src/lib/message-engine/admin-profile-conversation-tools.ts` | `buildAdminProfileConversationToolsPayload` — pure composition of registry helpers. |
| `src/components/message-engine/AdminProfileConversationToolsSection.tsx` | Presentational admin section (server component). |

## Files updated

| File | Role |
|------|------|
| `src/lib/campaign-engine/voter-relational-organizing.ts` | `RelationalOrganizingLinkForVoter` now includes `relationshipType` + `relationshipCloseness` (existing Prisma columns; **no DDL**). `relationalOrganizingSnapshotFromContactDetail` passes them through. |
| `src/app/admin/(board)/relational-contacts/[id]/page.tsx` | Builds payload from REL-2 + organizing snapshot. |
| `src/app/admin/(board)/voters/[id]/model/page.tsx` | Builds payload from primary REL-2 link or generic county-only context. |
| `src/components/message-engine/index.ts` | Barrel export for `AdminProfileConversationToolsSection`. |

---

## Privacy / access alignment

- **Guidance consulted:** [`MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md`](./MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md) §6–7 (profiles, disallowed leaks), [`identity-and-voter-link-foundation.md`](./identity-and-voter-link-foundation.md) (voter id semantics), [`MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md`](./MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md) (public vocabulary).
- **Engine context** uses **`visibilityTier: "leader"`** so leader-visible templates may appear; still **registry-only**, no voter id passed into message-engine types.
- **Match suggestions** and **classifications** are **not** fed into snippet selection — only relationship + county posture from allowed fields.

---

## Verification

From `RedDirt/`: `npm run check` (lint, `tsc`, build).

Manual: as admin, open a REL-2 contact with county set; confirm opener / listening / follow-up render. Open a voter with and without REL-2 links; confirm privacy copy and generic county labeling when unlinked.

---

## Forward work

See [`MESSAGE_ENGINE_VOTER_PROFILE_INTEGRATION_PLAN.md`](./MESSAGE_ENGINE_VOTER_PROFILE_INTEGRATION_PLAN.md) for REL-3 / volunteer-safe reuse, telemetry, and workbench link-out.
