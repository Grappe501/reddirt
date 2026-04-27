# Message engine × voter / contact profiles — integration plan (RedDirt)

**Lane:** `H:\SOSWebsite\RedDirt`  
**Status:** Phase 1 delivered on admin-only surfaces (see [`MESSAGE_ENGINE_VOTER_PROFILE_INTEGRATION_REPORT.md`](./MESSAGE_ENGINE_VOTER_PROFILE_INTEGRATION_REPORT.md)). This document tracks **residual** work — not a substitute for counsel, data governance, or REL-3 scope reviews.

---

## Principles (carry forward)

- **No public voter-file browsing** — conversation tools stay off public routes and off unauthenticated APIs.
- **No sensitive attributes to ordinary users** — voter model + REL-2 detail pages remain **`/admin/(board)`** with existing `requireAdminPage` gate.
- **No invented private facts** — relationship copy is built only from REL-2 fields + county labels; registry snippets are **approved starters**, not personalized intelligence.
- **Vocabulary** — follow [`MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md`](./MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md): use **Conversation Tools**, **message support**, **organizing insights**; avoid **“AI”** and surveillance framing on any volunteer- or public-facing surface.
- **Schema** — new behavior should prefer **metadata conventions, registry ids, and UI** before Prisma changes.

---

## Phase 2 (optional packets)

| Item | Purpose |
|------|---------|
| **REL-3 volunteer-safe profile** | If a future owner-scoped contact detail exists outside full admin, re-use `buildAdminProfileConversationToolsPayload` with **`visibilityTier: "public_volunteer"`** and strip staff-only narrative (no file keys, no match diagnostics). |
| **Clipboard / channel formatting** | Copy-to-clipboard with channel-specific whitespace — only after compliance sign-off (`MESSAGE_ENGINE_PERSONAL_PANEL_REPORT.md` follow-ups). |
| **Message-use telemetry** | `MessageUseEvent` style logging from profile surfaces — **aggregate + permissioned**; no voter id in public-tier metadata keys. |
| **Workbench link-out** | Deep link from a profile to a **`CommunicationPlan`** / draft when `metadataJson` carries pattern ids (MCE-4 in [`MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md`](./MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md)). |

---

## Verification

From `RedDirt/`: `npm run check`. Manual smoke: open `/admin/relational-contacts/[id]` and `/admin/voters/[id]/model` as an admin user; confirm **Conversation Tools** shows registry copy and privacy label, and no new public routes appear.
