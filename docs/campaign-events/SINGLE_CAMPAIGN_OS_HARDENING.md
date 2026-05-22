# Single-Campaign OS Hardening

**Lane:** `RedDirt/` · Kelly SOS primary · May 2026

## Course correction

Sprint 10 multi-tenant scaffolding remains in JSON/Prisma but **operators see Kelly SOS only**:

- `KellySingleCampaignBadge` replaces visible campaign switcher
- `resolveActiveCampaignTenant()` forces `kelly-sos-2026` unless `NEXT_PUBLIC_CAMPAIGN_OS_DEV_TENANCY=true`
- SaaS onboarding/portals de-emphasized in nav; replaced with `/admin/onboarding` and dashboard builder

## New surfaces

| Route | Purpose |
|-------|---------|
| `/admin/onboarding` | Role onboarding wizard |
| `/admin/ai-command-center/dashboard-builder` | On-demand dashboard blueprints |

## Test

`npm run agents:test-single-campaign-hardening`
