# Multi-Campaign SaaS Architecture (Sprint 10)

**Lane:** `RedDirt/` · **Status:** V1 foundation (May 2026)

## Tenancy model

| Layer | V1 store | Prisma (migration ready) |
|-------|----------|---------------------------|
| CampaignTenant | `data/campaign-tenancy/tenants.json` | `CampaignTenant` |
| CampaignMembership | JSON | `CampaignMembership` |
| CampaignSettings | JSON | `CampaignSettings` |
| CampaignBranding | JSON | `CampaignBranding` |
| CampaignFeatureFlags | JSON | `CampaignFeatureFlags` |

**Active tenant:** cookie `campaign-tenant-id` via `resolveActiveCampaignTenant()`.

**Default:** `kelly-sos-2026` (Kelly Grappe for SOS).

## UI

- `GlobalCampaignSwitcher` — admin left rail
- `/admin/campaign-onboarding` — wizard creates tenant JSON + switches cookie
- `/admin/campaign-portals` — feature-flagged portal scaffold

## Campaign-scoped operations (V1)

Intelligence and command center read **tenant settings + branding**. Ledger rows remain Kelly-default until hard `tenantId` FK pass (Sprint 11+).

## Guardrails

- No billing / Stripe in V1
- No public multi-tenant auth overhaul
- Onboarding writes JSON only — Prisma sync manual until ops enables migration

## Test

`npm run agents:test-sprint-10`
