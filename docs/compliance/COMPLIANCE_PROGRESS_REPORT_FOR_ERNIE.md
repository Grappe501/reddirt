# Compliance progress report — for Ernie

**Generated:** 2026-05-20 · **Repo:** `RedDirt-main-travel-ledger` · **Branch:** `main` (post build-hardening `c8e5cc6`)

**Bottom line:** The compliance **application is built and runs locally**, but it is **not “done” for filing** and feels unusable because (1) **222 open queue items** with **zero batch-eligible**, (2) **in-kind pages show almost no extracted data** in the approval workbench, (3) **checks and in-kind use different tools**, and (4) **filing stays red** by design until human/treasurer sign-off. This report separates **what works today** from **what still blocks Ernie’s daily work**.

---

## How to start (Ernie’s 5-minute path)

| Step | URL / action |
|------|----------------|
| 1 | Log in → **`/admin/compliance/command-center`** (mission control) |
| 2 | April sources → **`/admin/compliance/april26`** |
| 3 | **Checks (SOS copy board)** → **`/admin/compliance/checks/sos-entry`** (7 donation photos, multi-check extract) |
| 4 | **Ozark auction in-kind list (spreadsheet)** → **`/admin/compliance/in-kind/ozark-auction`** (49 rows, CSV download) |
| 5 | **In-kind approval (3 photos)** → **`/admin/compliance/approval/april-2026-compliance-review?filter=in_kind`** |
| 6 | Rebuild queues only if lists are empty → Approval hub → **Rebuild queues** |

**Env required locally:** `COMPLIANCE_APRIL26_DIR=H:\SOSWebsite\Compliance\April26` in `.env.local` (already set on Steve’s machine).

---

## Live system metrics (machine-verified today)

| Metric | Value | Meaning |
|--------|------:|---------|
| QA full score | **66** (yellow) | Automation passes; program not launch-complete |
| Approval queues | **10** | Virtual lanes + April primary queue |
| Approval items | **222** open | Large backlog — main “unusable” feeling |
| Batch eligible | **0** | 98% confidence gate; no shortcuts |
| GoodChange rows | **52** | Staged from April26 CSV |
| Bank CSV | **Present** | `bank-april-2026.csv` — reconciliation **active** but messy |
| Bank rehearsal | 0 high-confidence, **10** unmatched bank, **14** ambiguous | Treasurer matching work |
| In-kind pages | **3** | `att.*.jpg` auction donation lists |
| Check images | **7** | HEIC folder under Checks donations |
| Receipt images | ~21 | Expense evidence |
| Filing readiness | **Red** | Expected until rules + queue + sign-off |
| Deploy readiness script | `readyForNetlifyDeploy: true` | **Build** can deploy; **compliance program** is not green |

---

## Complete vs incomplete (by area)

### ✅ Built and working

| Area | Status | Evidence |
|------|--------|----------|
| Admin routes & nav | Complete | `/admin/compliance/*` compiles; dev server 200s on approval/command-center |
| Command center | Complete | AI brain, progress %, bank status, next action |
| April26 import desk | Complete | Source counts, bank guide, expenditure inventory panel |
| Approval workbench | Complete | Per-item review, guards, initials, keyboard shortcuts |
| Check SOS workbench | Complete | Multi-check-per-photo, vision extract API, CSV export |
| Bank import / QA | Complete | `compliance:bank:qa` → `reconciliation_ready` |
| Reconciliation UI | Complete | Workbench + rehearsal (needs operator matching) |
| Rules corpus & rules page | Complete | 24 topics need **human** verification |
| Filing readiness UI | Complete | Honest red + blocker list |
| QA script chain | Complete | `compliance:qa-full`, `april26:qa`, `deploy-readiness` |
| Ozark auction CSV export | Complete | `npm run compliance:export-ozark-auction-donations` → 49 rows |
| Production `next build` | Complete | Marketing `force-dynamic` fix on `main` |

### 🟡 Partially complete (usable with training)

| Area | % | What works | What’s missing |
|------|--:|------------|----------------|
| Queue burn-down | ~5% | Can review item-by-item | 221 items; rule_review lane noisy |
| GoodChange contributions | ~95% | Rows in queue | Per-row approval |
| Receipt ↔ expense matching | ~75% | Images in queue | Manual link to approvals |
| Reconciliation | ~50% | Bank file + UI | 14 ambiguous, 10 unmatched bank lines |
| April check audit | ~8% | Checklist script + SOS board | 36 unmatched checks vs ledger |
| Operator docs | ~88% | Smoke test, launch rehearsal docs | Must be walked once |

### ❌ Not complete (blocks “we can file”)

| Area | Blocker |
|------|---------|
| Filing green | 6+ hard gates; treasurer sign-off |
| Rule topics | 44 `rule_review` items — cannot batch |
| In-kind in approval queue | Only `reviewNote` field; **no line-item extract in UI** (spreadsheet is separate) |
| Production storage | `local_private` — not Supabase RLS |
| DB migration | JSON on disk only — Prisma cutover not applied |
| Netlify compliance data | April26 folder not on server unless synced |
| Ethics workbook | Optional source often absent |

---

## Why it feels “unusable” (root causes)

1. **Wrong tool for in-kind auction** — The three `att.*.jpg` pages are **multi-donor auction inventories** (~49 items). The approval queue treats each photo as **one** `in_kind_contribution` with a blank form. The **spreadsheet** (`ozark-forward-auction-donations-2026.csv`) holds the real line items; the queue is for **sign-off on evidence**, not data entry.

2. **Checks are a separate workbench** — Physical checks use **`/admin/compliance/checks/sos-entry`**, not the lightning approval item screen (which only shows a review note for check images too).

3. **Queue size + zero batch** — 222 items, 0 batch-eligible, 44 rule-review tasks → every visit feels like an infinite list.

4. **No image in approval workbench (fixed this pass)** — Evidence panel showed filenames only; images now render when `evidence.path` points at April26 files.

5. **Filing red everywhere** — Correct honesty, but UI reads as “broken.”

---

## Operator workflows (which slug / route)

| Job | Route |
|-----|--------|
| Mission control | `/admin/compliance/command-center` |
| April folder status | `/admin/compliance/april26` |
| Approve April records | `/admin/compliance/approval/april-2026-compliance-review` |
| In-kind photos only | `...?filter=in_kind` |
| Ozark auction spreadsheet (49 rows) | `/admin/compliance/in-kind/ozark-auction` |
| April checks → SOS entry | `/admin/compliance/checks/sos-entry` |
| Bank matching | `/admin/compliance/reconciliation` |
| Can we file? | `/admin/compliance/filing-readiness` |
| Rules human review | `/admin/compliance/rules` |

---

## Recommended completion order (next 2 weeks)

### Week 1 — Make Ernie productive

1. **Use Ozark auction page + CSV** for in-kind auction line items (not empty approval fields).
2. **Use SOS check board** for all April check photos; export CSV for SOS typing.
3. **Burn down queue** starting with `filter=ready` then `filter=in_kind` (3 items).
4. **Bank reconciliation** — resolve 14 ambiguous matches (`/admin/compliance/reconciliation`).
5. Run **`npm run compliance:april-audit-checklist`** — Part A checks, Part B expenditures.

### Week 2 — Toward filing rehearsal

6. Rules page — verify topics (campaign workflow, not legal advice).
7. Drive filing readiness from red → yellow (documented exceptions OK).
8. Steve: Supabase storage + Netlify env OR explicit “JSON-only local” decision.
9. Treasurer sign-off recorded in settings / checklist.

---

## Engineering backlog (to “get it working” for real)

| Priority | Task | Owner |
|----------|------|-------|
| P0 | ~~Show April26 images in approval workbench~~ | Done this pass |
| P0 | In-kind Ozark auction table page + nav link | Done this pass |
| P1 | Link from in-kind queue items → Ozark auction page filtered by source image |
| P1 | Vision extract for in-kind pages (donor/item rows) into approval fields |
| P1 | “Start here” card on approval hub: Checks board vs In-kind vs GoodChange |
| P2 | Reduce rule_review noise (separate lane from April26 images) |
| P2 | Netlify: document April26 sync or admin upload path |
| P3 | DB migration per `COMPLIANCE_DB_MIGRATION_EXECUTION_PLAN.md` |

---

## Commands (regenerate status)

```powershell
cd H:\SOSWebsite\RedDirt-main-travel-ledger
$env:COMPLIANCE_APRIL26_DIR = "H:\SOSWebsite\Compliance\April26"
npm run compliance:qa-full
npm run compliance:april26:qa
npm run compliance:bank:qa
npm run compliance:deploy-readiness
npm run compliance:april-audit-checklist
npm run compliance:export-ozark-auction-donations
```

---

## Sign-off

| Role | Question | Status |
|------|----------|--------|
| Ernie (operator) | Can I process checks? | **Yes** — SOS check board |
| Ernie | Can I get in-kind auction data? | **Yes** — Ozark auction page + CSV |
| Ernie | Can I clear the whole queue quickly? | **No** — manual review; 0 batch |
| Treasurer | Can we file from this app today? | **No** — filing red; human gates |
| Steve | Can we deploy the site? | **Yes** — build green; compliance data is local |

*Not legal certification. Treasurer and compliance officer must approve all filings.*
