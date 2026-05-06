# Email Command Center — Selective Git Staging Guide

**Packet:** **EMAIL-COMMAND-CENTER-CLOSEOUT-1.0** + **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0** (staging order + warnings)  
**Lane:** `RedDirt/` only  
**Purpose:** When the working tree contains **many** unrelated changes, stage **only** Email Command Center (ECC) work for a clean commit — **without** secrets, **without** accidental schema/env churn from other packets.

**Important:** This guide lists **suggested** commands. **Do not** run `git add` or `git commit` from automation unless Steve explicitly asks. **Do not** use destructive git commands (`reset --hard`, `clean -fd`, etc.) here.

All paths below are relative to **`H:\SOSWebsite\RedDirt`** (the repo root for this lane).

---

## 0. Recommended full-repository staging order (launch / multi-packet trees)

When several build streams touched the repo, **bucket commits** in this order so reviewers can reason about risk (**functional packet grouping**):

1. **DB / env tooling docs** — `README.md`, `docs/deployment.md`, **`npm run email:db:diagnose`** / preflight docs, **non-secret** `.env.example` only. **Never** stage `.env`, `.env.local`, or **`.env.backup*`** / **`.env.backup-*`**.  
2. **Gmail foundation** — OAuth, sync, watch, review→queue, Pub/Sub scaffold (as applicable to the packet).  
3. **AI / profile / audience** — queue intelligence, profile graph, audience studio.  
4. **SendGrid foundation** — config, webhook receiver, foundation UI.  
5. **Contact import staging** — import actions, `/imports` routes, `contact-import.ts`.  
6. **Message Studio** — local drafts, Campaign Voice, editorial, templates, send packet panel, `message-studio-ai-actions` if touched.  
7. **Governance / Daily / Analytics / Automation** — shells + Daily + send-execution doctrine + map/readiness when touched with this stream.  
8. **Closeout / hardening docs** — route inventory, selective staging, **launch hardening**, first-run checklist, progress ledger, operator smoke test.

**Schema / migrations (when applicable):** only when a **database packet** was explicitly completed and reviewed — `prisma/schema.prisma`, `prisma/migrations/**` — ideally **their own commit** with a clear message; **not** mixed blindly with doc-only hardening.

**Final staging discipline (before `git add`):**

- **Do not** stage `.env`, **`.env.backup*`**, or any file you know contains **secrets**.  
- **Review** `prisma/schema.prisma` and **`package-lock.json`** **intentionally** — every hunk should match the story of the commit.  
- **Stage new untracked** components **on purpose** (name each path); avoid `git add -A` without reading `git status`.  
- Prefer **`git add <paths…>`** grouped by the numbered buckets above.  
- Run **`npm run email:no-send-scan`** when anything under **`email-command-center`** changed.

---

## 1. Do not stage

| Category | Examples / patterns |
|----------|---------------------|
| **Secrets** | `.env`, `.env.local`, `.env.*.local`, **`.env.backup*`** / **`.env.backup-*`** (machine-local backups), any file containing tokens, private keys, webhook signing secrets, database passwords. |
| **Personal machine noise** | IDE-only files not part of the packet (unless your team standard includes them — default **no**). |
| **Unrelated product areas** | `src/components/home/**`, `src/components/county/**`, large `social/**` or `calendar/**` edits **unless** they are explicitly part of a **different** reviewed packet. |
| **Accidental lane drift** | Anything outside `RedDirt/` (other product folders in the multi-product workspace). |
| **Schema / migrations** | If your intent is **docs-only closeout**, avoid staging `prisma/schema.prisma` or `prisma/migrations/**` unless a **database packet** was actually completed and reviewed. |
| **CI / lockfile churn** | `.github/workflows/**`, `package-lock.json`, `package.json` — only when the ECC work **required** dependency or workflow changes. |

**Rule of thumb:** Run `git diff --stat` on a path **before** staging it. If the hunk is not yours and not part of the ECC story, **exclude** it.

---

## 2. Inspect first (suggested commands — not executed by agents by default)

```bash
cd H:\SOSWebsite\RedDirt
git status --short
git diff --stat
```

Review **unrelated** modified files and **mentally bucket** them into “ECC”, “other packet”, “noise”.

---

## 3. Stage Email Command Center feature paths by packet grouping

Adjust globs if your shell does not expand `**` — use explicit files from `git status` instead.

### Gmail

Suggested paths:

- `src/app/admin/(board)/workbench/email-command-center/gmail/**`
- `src/app/api/gmail/**` (if touched for Gmail OAuth / PubSub)
- `src/lib/gmail/**`
- `src/app/admin/gmail-review-actions.ts` (or current path for review actions)

### AI (queue intelligence)

- `src/lib/email-workflow/ai/**`
- `src/app/admin/**` — server actions for `runEmailWorkflowAiAnalysis*` (search repo for exact file)
- `src/app/admin/(board)/workbench/email-queue/[id]/page.tsx`
- `src/components/admin/email-workflow/**` (queue AI panels)

### Profile graph

- `src/lib/email-command-center/profile-graph.ts`
- `src/app/admin/email-profile-graph-actions.ts`
- `src/app/admin/(board)/workbench/email-command-center/profiles/page.tsx`
- `src/components/admin/email-workflow/ProfileReviewAudienceHints.tsx` (if profile-related)

### Audience Studio

- `src/lib/email-command-center/audience-studio.ts`
- `src/app/admin/email-audience-actions.ts`
- `src/components/admin/email-command-center/AudienceStudioPreviewForm.tsx`
- `src/app/admin/(board)/workbench/email-command-center/audiences/page.tsx`

### SendGrid foundation

- `src/lib/sendgrid/**`
- `src/lib/email-command-center/sendgrid-foundation.ts`
- `src/app/api/sendgrid/**`
- `src/app/admin/(board)/workbench/email-command-center/sendgrid/page.tsx`

### Contact import

- `src/lib/email-command-center/contact-import.ts`
- `src/app/admin/email-contact-import-actions.ts`
- `src/app/admin/(board)/workbench/email-command-center/imports/**`

### Message Studio

- `src/components/admin/email-command-center/MessageStudioView.tsx`
- `src/components/admin/email-command-center/MessageStudioDraftPlanner.tsx` (if present)
- `src/app/admin/(board)/workbench/email-command-center/message-studio/page.tsx`

### Automation / Analytics

- `src/components/admin/email-command-center/AutomationStudioView.tsx`
- `src/components/admin/email-command-center/AnalyticsDeliverabilityView.tsx` (or equivalent names)
- `src/app/admin/(board)/workbench/email-command-center/automation/page.tsx`
- `src/app/admin/(board)/workbench/email-command-center/analytics/page.tsx`

### Final polish (map, readiness, cockpit)

- `src/app/admin/(board)/workbench/email-command-center/map/page.tsx`
- `src/app/admin/(board)/workbench/email-command-center/readiness/page.tsx`
- `src/components/admin/email-command-center/EmailCommandCenterRouteMapView.tsx`
- `src/components/admin/email-command-center/EmailCommandCenterReadinessView.tsx`
- `src/components/admin/email-command-center/EmailCommandCenterContent.tsx`
- `src/lib/email-command-center/read-model.ts` (if snapshot drives readiness)

### Docs (ECC)

Suggested doc paths (non-exhaustive — add what `git status` shows):

- `docs/email-command-center*.md` (include **`email-command-center-launch-hardening.md`**, **`email-command-center-first-run-operator-checklist.md`** when present)
- `docs/email-command-center-operator-smoke-test.md`
- `docs/campaign-email-command-center-*.md`
- `docs/email-dashboard-operator-runbook.md` (if ECC section touched)
- `docs/email-workflow-intelligence-AI-HANDOFF.md`
- `docs/PROJECT_MASTER_MAP.md`
- `docs/THREAD_HANDOFF_MASTER_MAP.md`
- `docs/DIVISION_MASTER_REGISTRY.md`

---

## 4. Example selective staging (copy/paste — review before running)

**Single file:**

```bash
git add docs/email-command-center-route-inventory.md
```

**Multiple explicit paths:**

```bash
git add docs/email-command-center-closeout-2026-05-05.md docs/email-command-center-selective-staging-guide.md docs/campaign-email-command-center-progress-ledger.md
```

**Verify staged set:**

```bash
git diff --cached --stat
git diff --cached --name-only
```

**Unstage a mistake:**

```bash
git restore --staged path/to/file
```

---

## 5. Commit message suggestion (when Steve is ready)

Example pattern:

```text
docs(comms): Email Command Center closeout — route inventory + staging guide

EMAIL-COMMAND-CENTER-CLOSEOUT-1.0. No feature changes.
```

If **code** is included in the same commit, say so explicitly and list **routes** touched.

---

*Last updated: **EMAIL-COMMAND-CENTER-LAUNCH-HARDENING-1.0** (staging order + no-send scan hook).*
