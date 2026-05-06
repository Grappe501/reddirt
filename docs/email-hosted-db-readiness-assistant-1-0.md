# EMAIL-HOSTED-DB-READINESS-ASSISTANT-1.0

**Lane:** `RedDirt/` only  
**Goal:** Give Steve a **safe** in-app and doc-aligned assistant to verify **Kelly-Grappe-App hosted Supabase** posture — **without** printing secrets, editing env from the UI, running migrations from the app, or performing real imports.

## Routes

| Route | Role |
|-------|------|
| `/admin/workbench/email-command-center/readiness` | Full checklist; **embeds** the assistant with anchor **`#hosted-db-readiness-assistant`**. |
| `/admin/workbench/email-command-center/readiness/hosted-db` | Bookmark-friendly **full-page** assistant (same snapshot fields). |

## Shipped behavior

| Area | Change |
|------|--------|
| **`hosted-db-readiness-assistant.ts`** | Parses **`DATABASE_URL`** / **`DIRECT_URL`** for **presence + URL validity + hostname only**; classifies **local loopback** vs **remote Supabase-style** vs **other remote**; optional **masked** project ref from `db.<ref>.supabase.co`. |
| **`read-model.ts`** | **`operatorGate`** extends with **`HostedDbOperatorGateExtension`** (merged into degraded + healthy snapshots). |
| **`HostedDbReadinessAssistantView.tsx`** | Table: classification, local vs hosted copy, env presence, parse status, hostname (no userinfo), DB reachability, migration summary, contact-import gate, routes to act; operator guidance; gate-chain list. |
| **`HostedDbCopySnippets.tsx`** | Client **copy-to-clipboard** for diagnose / preflight / gate commands + PowerShell **template** (placeholders only). |
| **`EmailCommandCenterReadinessView.tsx`** | Embeds assistant; nav link **Hosted DB assistant**. |
| **`EmailCommandCenterRouteMapView.tsx`** | Route card + nav link. |
| **`EmailCommandCenterContent.tsx`** | Operator path step for hosted assistant. |

## Hard constraints

- **No env edits** from these routes.  
- **No migrations** triggered by the page — `npm run email:contact-import:gate` is documented/copied for **operator shells only** when pointed at the correct DB.  
- **No secrets** in UI (no full URIs, passwords, or API keys).  
- **No real imports** from this packet.

## Operator checks

From `RedDirt/` (after setting session or private env for the **intended** target):

- `npm run email:db:diagnose`
- `npm run email:command-center:preflight`
- `npm run email:contact-import:gate` (includes `prisma migrate deploy` — operator discretion)
- `npm run email:no-send-scan`
- `npm run check`

## Ledger impact

- **Deployment / Env Readiness** → **~90%** for **local + doc + in-app assistant** clarity; **hosted-verified** remains operator-owned until gates pass on production URLs.
