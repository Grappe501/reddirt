# KELLY-HOMEPAGE-POLISH-SLICE-1.0 — completion report

**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Baseline:** `f64e603e`  
**Authorization:** KELLY-HOMEPAGE-POLISH-SLICE-1.0  
**Decision source:** `docs/website/HOMEPAGE_FORWARD_PLAN.md`

---

## Before → after

| Behavior | Before | After |
|----------|--------|--------|
| Header Volunteer | `getJoinCampaignHref()` → often `mailto:` | `getVolunteerSignupHref()` → `/get-involved#volunteer` (or native `/volunteer#signup` / env override) — same as Get Involved card |
| Floating donate gate | Always mounts after ~1.6s on `/` | **Off by default**; only if `NEXT_PUBLIC_HOME_DONATE_FLOATING_GATE=true` |
| Meet Kelly band | Draft badge + pending note | Concise preview + CTA to `/about`; no draft badge |
| Hero body | Longer office list | Slightly tightened copy |
| Hero video + reduced motion | Autoplay even with reduced motion | Still image when `prefers-reduced-motion` |
| Final CTA / Meet Kelly links | Missing focus rings on some | Visible `focus-visible` outlines |
| Trust-funnel shell | Mounted | Unchanged (no redesign) |
| Track C / Shorts / photos / news | Off / not present | Still off (later slices) |
| Admin homepage merge on `/` | Unused | Still unused |

---

## Files changed

- `src/components/layout/SiteHeader.tsx`
- `src/app/(site)/page.tsx`
- `src/components/home/HomeDonateFloatingGate.tsx` (docs only)
- `src/components/home/trust-funnel/TrustFunnelMeetKellySection.tsx`
- `src/components/home/trust-funnel/TrustFunnelHero.tsx`
- `src/components/home/HomeTrustFunnelWireframe.tsx`
- `src/content/home/trust-funnel-home.ts`
- `.env.example`
- `package.json` (`agents:test-homepage-polish-slice1`)
- `scripts/test-homepage-polish-slice1.ts`
- `docs/website/HOMEPAGE_FORWARD_PLAN.md`
- `docs/website/HOMEPAGE_POLISH_SLICE_1_REPORT.md` (this file)

---

## QA

| Check | Result |
|-------|--------|
| `npm run agents:test-homepage-polish-slice1` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` (production) | PASS (exit 0) |

Deployment: code pushed to feature branch; Netlify production redeploy is **not** claimed by this slice (merge/deploy is Steve/ops).

---

## Recommendation

```text
READY FOR SLICE 2 — CAMPAIGN PHOTOS
```
