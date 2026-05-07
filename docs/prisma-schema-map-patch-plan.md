# Prisma schema map patch plan (REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-AND-SHADOW-PROOF-1.0)

## 1. Purpose

Offline-engineered alignment between RedDirt `schema.prisma` and the audited Supabase production catalog, without mutating production data or migration history.

## 2. Current production DB state

- Reachable (audit): **true**
- `public._prisma_migrations`: **absent**
- Observed public tables (audit-derived count in this run): **115**

## 3. Why baseline is still blocked

public._prisma_migrations absent; production baseline and migrate deploy remain explicitly blocked until shadow proof and human approval.

## 4. Safe auto-eligible map candidates (this packet)

- **Submission** → `@@map("submissions")` (submissions)
- **MediaAsset** → `@@map("media_assets")` (media_assets)
- **County** → `@@map("counties")` (counties)

## 5. Human-review map candidates (excerpt)

- **User** — users — Explicit governance: do not auto-map in this packet.
- **VolunteerProfile** — volunteer_profiles — Reconciliation flagged needs_mapping_review or model-specific governance (EventRequest).
- **WorkflowIntake** — — — Explicit governance: do not auto-map in this packet.
- **EventRequest** — event_requests — Reconciliation flagged needs_mapping_review or model-specific governance (EventRequest).
- **CountyCampaignStats** — county_campaign_targets — Reconciliation flagged needs_mapping_review or model-specific governance (EventRequest).
- **RelationalContact** — contacts — Explicit governance: do not auto-map in this packet.
- **CampaignEvent** — events — Explicit governance: do not auto-map in this packet.
- **EventSignup** — volunteer_signups — Reconciliation flagged needs_mapping_review or model-specific governance (EventRequest).

## 6. Do-not-map models and tables

- **VoterRecord** and voter warehouse tables (e.g. `ar02_voters`, `voters`, voter metrics) — preserve; no forced @@map.
- **auth.*** — Supabase provider-owned; not RedDirt Prisma migration-owned.
- **User / WorkflowIntake / RelationalContact / CampaignEvent** — blocked from auto-map in this packet.

## 7. New Prisma-owned table candidates

Models with no confident live match (shadow migrations later): **136** (see JSON).

## 8. Migration implications

@@map only changes Prisma's physical table name expectation; it does not run DDL. Shadow clone must still prove column compatibility before any migrate deploy.

## 9. Shadow proof requirement

See `docs/production-db-shadow-proof-plan.md` and `data/production-db-shadow-proof-plan.json`.

## 10. Production baseline execution remains blocked

Do not run production `migrate deploy`, `db push`, `migrate resolve`, or `migrate reset` until shadow proof passes and Steve explicitly approves the draft execution packet.

## 11. Operator checklist

1. Run shadow clone proof sequence (see shadow plan).
2. Confirm `npx prisma validate` on patched schema.
3. Compare `prisma migrate diff` on shadow only.
4. Obtain explicit approval before any production baseline commands.

## 12. Next recommended slice

Execute shadow DB proof, then human-reviewed baseline packet on **non-production** first.

---

Artifacts: `data/prisma-schema-map-patch-plan.json`
