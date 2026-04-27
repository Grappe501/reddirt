# Website Pass 04 — County page standardization

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Depends on:** `docs/WEBSITE_PASS_03_GET_INVOLVED_REPORT.md` (pathways into `/counties`); organizing-intelligence county placeholder route (`/organizing-intelligence/counties/[countySlug]`); Pope Dashboard v2 (`/county-briefings/pope/v2`)

---

## 1. Mission

Standardize **public county entry points** around a single **county intelligence model**: one index experience for all 75 counties, explicit **tiers** (prototype / next build / standard scaffold), and consistent copy for **region**, **dashboard status**, **organizing status**, and **next action**—without authoring 75 custom dashboards or changing county slug routes.

---

## 2. County intelligence model

| Tier | Counties | Meaning |
|------|----------|---------|
| **Prototype** | Pope | Published **Dashboard v2** at `/county-briefings/pope/v2`; gold-sample shared shell. |
| **Next build** | Benton, Washington | Command + placeholders active; **v2 dashboard queued** after Pope validation (NWA primary turf). |
| **Standard (scaffold)** | All other registry counties | **County command** (`/counties/[slug]`) + **OIS county placeholder** (`/organizing-intelligence/counties/[slug]`); intelligence tiles roll out per packet. |

Canonical definitions live in **`src/lib/county/county-intelligence-catalog.ts`** (merged with **`src/lib/county/arkansas-county-registry.ts`** for region labels).

---

## 3. `/counties` index (`CountyCommandHub`, public mode)

**Existing behavior preserved:** search, “jump to region” anchors, 75-county roster from `listArkansasCountyCommandRoster()`, admin mode unchanged (compact list + CMS links).

**New behavior:**

- **Card grid** per region (responsive 1 / 2 / 3 columns).
- **Tier filter chips:** All counties · Prototype · Next build · Standard.
- Each card includes:
  - **Region** (command region short label)
  - **Dashboard status** (tier-specific label)
  - **Organizing status** (tier-specific narrative)
  - **Next action** (tier-specific suggestion)
- **Links:** County command (or “Command page (draft)” when `hasPublicPage` is false), organizing intelligence placeholder, and **Dashboard v2** only for Pope; other counties get **placeholder line** explaining v2 is not published yet.

**Files**

| File | Role |
|------|------|
| `src/lib/county/county-intelligence-catalog.ts` | **New** — tier map + copy + hrefs. |
| `src/components/county/CountyCommandHub.tsx` | Public card UI + tier filter; admin list unchanged. |
| `src/app/(site)/counties/page.tsx` | Hero + metadata aligned with intelligence framing. |

---

## 4. County command detail (`/counties/[slug]`)

**No route or data-contract changes.** `CountyCommandExperience` gains a **County intelligence** strip below the hero: summarizes dashboard tier, organizing status, and next action from the catalog, with buttons to the OIS county placeholder, Dashboard v2 (Pope only), and state `/organizing-intelligence`.

**File:** `src/components/county/CountyCommandExperience.tsx`

---

## 5. Explicit non-goals (honored)

- **No** 75 county-specific dashboard pages or builders.
- **No** changes to `resolveCountyCommandBySlug` / `getCountyPageSnapshot` contracts.
- **No** new voter-file or auth behavior.

---

## 6. Verification

From `RedDirt/`:

```bash
npm run check
```

(Lint + `tsc --noEmit` + `next build`.)

---

## 7. Follow-ups (not in this pass)

- Wire Benton/Washington into `next_build` with real v2 builders when packets exist.
- Optional: pull “organizing status” from operator workflow state instead of static tier copy.
- Consider cross-linking from region dashboards to these county cards for parity.
