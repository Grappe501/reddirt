# Discord integration foundation (BRAIN-OPS-1) (RedDirt)

**Packet BRAIN-OPS-1 (Part E).** **Architecture-first** posture for **Discord** as a **coordination and delivery** layer—**not** a source of truth, **not** a compliance vault, **not** a replacement for the Campaign Manager Workbench.

**Cross-ref:** [`deterministic-brain-foundation.md`](./deterministic-brain-foundation.md) · [`discord-integration-foundation.md`](./discord-integration-foundation.md) (this doc) · Discord [API](https://discord.com/developers/docs/intro) / [Interactions](https://discord.com/developers/docs/interactions/overview) (external)

---

## 1. North star

- **Discord** notifies, nudges, and **links** volunteers/staff to **in-app** work where **truth** lives (Postgres + workbench).
- **Authoritative state** (assignments, goals, compliance, ledger) is **read and written** through **RedDirt** with the same rules as the web admin—**never** “Discord said so” as proof.
- **Deterministic brain** order still applies: if an action would be **BLOCKED** or **REVIEW_REQUIRED** in the app, Discord cannot bypass it (no parallel secret workflow).

---

## 2. Integration levels

| Level | Description | Fits repo today |
|-------|-------------|-----------------|
| **L0 — None** | No bot, no webhook. | **Default.** |
| **L1 — Outbound notifications** | Server → Discord webhook or bot message: “New task assigned,” “Pipeline error in county X,” link to `/admin/...`. | **Good first step**—read-only from DB, no inbound trust. |
| **L2 — Slash commands / interactions** | User runs `/my-goals`, `/next-action` → bot **calls** secured internal API with OAuth or bot-secret + user mapping. | **Future packet**—requires auth mapping `DiscordUser` → `User`. |
| **L3 — Event ingestion from Discord** | Messages or reactions create **provisional** `WorkflowIntake` / tasks. | **High risk**—only with explicit normalization + review queue; **not** BRAIN-OPS-1. |

---

## 3. Good first uses

- **County lead alert** — registration goal behind pace (data from `CountyCampaignStats` / metrics), link to county admin.
- **Volunteer milestone** — GAME-1 **future**; until then, simple “signup confirmed” from DB events.
- **Launch / re-engagement** — [`launch-reengagement-foundation.md`](./launch-reengagement-foundation.md) / `launch.ts` audience signals → **advisory** ping (no auto-send).
- **Deadline reminder** — calendar-driven **L1** only; compliance deadlines **must** trace to `ComplianceDocument` or official source links, not bot prose as legal truth.
- **Slash command stubs** — `/link-account` (future), `/open-work` (deep link to workbench filtered view).

---

## 4. System boundaries

| Rule | Rationale |
|------|-----------|
| **Discord is not source of truth** | Edits, rumors, bot output are not campaign records. |
| **No sensitive compliance decisions only in Discord** | Filings, approvals, counsel guidance need **`ComplianceDocument`** + human trail. |
| **Actions resolve through the deterministic brain** | Inbound commands must hit the **same** validation as server actions (`requireAdminAction` or volunteer-safe API). |
| **PII discipline** | Do not mirror voter file or donor PII into public channels; notifications should be **summarized** with links. |
| **Raw election files** | Live JSON under `H:\SOSWebsite\campaign information for ingestion\electionResults` is **not** announced as “results truth” until DB ingest validates. |

---

## 5. Next packets (recommended)

| Packet | Build |
|--------|--------|
| **DISCORD-1** | **L1 only:** webhook env vars, `DiscordNotification` log table (optional), one function `notifyDiscord(eventKey, payload)` behind feature flag; templates for county pipeline error + open-work spike. |
| **DISCORD-2** | **L2:** OAuth or verified link table `User.discordId`; slash commands calling **read** APIs first; **no** write without role check. |
| **DISCORD-3** | **L3 (optional):** ingest to `WorkflowIntake` with **REVIEW_REQUIRED** governance and **no** auto-close. |

---

*Last updated: Packet BRAIN-OPS-1.*
