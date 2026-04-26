# Kelly SOS — Section 2 deep build (human gates + hosted smoke + demo)

**Doc ID:** KELLY-S2-DEEP-1  
**Scope:** `H:\SOSWebsite\RedDirt` only  
**Last updated:** 2026-04-26  
**Depends on:** Section 1 complete ([`KELLY_SOS_DAY_6_SECTION_1_REPORT.md`](./KELLY_SOS_DAY_6_SECTION_1_REPORT.md))

## What Section 2 is

Section 2 closes the **non-code** and **hosted-integration** gaps before launch lock:

| Track | Outcome |
|-------|---------|
| **A — Counsel** | `/privacy` and `/terms` reviewed; optional waiver documented if launch proceeds on drafts. |
| **B — Treasurer** | Paid-for line and donate handoff match committee practice; env overrides documented. |
| **C — Hosted smoke** | Deploy **preview** (not localhost) proves routes + `POST /api/forms` + DB; logged in build log. |
| **D — Demo readiness** | Steve can run **15 minutes** without surprises; failure modes covered. |

Section 2 does **not** require rewriting legal copy in code without counsel. Cursor may adjust **structure, typos, or navigation**; substance is **counsel/treasurer**.

---

## Source-of-truth map (engineering)

Use this when answering “where is X wired?”

| Topic | Location |
|-------|----------|
| **Paid-for (footer + policy)** | `src/lib/campaign-engine/policy.ts` → `CAMPAIGN_POLICY_V1.disclaimers.pageFooterPaidForLine` |
| **Paid-for bar component** | `src/components/layout/CampaignPaidForBar.tsx` |
| **Disclaimer body + paid-for paragraph** | `src/app/(site)/disclaimer/page.tsx` |
| **Privacy draft** | `src/app/(site)/privacy/page.tsx` |
| **Terms draft** | `src/app/(site)/terms/page.tsx` |
| **Donate URL resolution** | `src/config/external-campaign.ts` → `resolvePublicDonateHref()`; env `NEXT_PUBLIC_DONATE_EXTERNAL_URL` overrides default GoodChange URL in code |
| **Site donate link** | `src/config/site.ts` → `donateHref: resolvePublicDonateHref()` |
| **Public forms** | `POST /api/forms` → `src/app/api/forms/route.ts`, `src/lib/forms/handlers.ts` |
| **Intake operator view** | `/admin/workbench` (after `ADMIN_SECRET` login) |
| **Compliance checklist** | [`KELLY_SOS_COMPLIANCE_CHECKLIST.md`](./KELLY_SOS_COMPLIANCE_CHECKLIST.md) |
| **Decision log** | [`KELLY_SOS_DECISION_LOG.md`](./KELLY_SOS_DECISION_LOG.md) |

---

## Track A — Counsel workflow (privacy + terms)

### What counsel receives

1. **Live or preview URLs** for `/privacy`, `/terms`, `/disclaimer` on the **same hostname** you will launch.  
2. **This doc** and the **Sign-off log** ([`KELLY_SOS_SECTION_2_SIGNOFF_LOG.md`](./KELLY_SOS_SECTION_2_SIGNOFF_LOG.md)).  
3. Optional: PDF export of those three routes from the browser (no server logs, no secrets).

### Current page intent (draft)

- **`/privacy`** — Describes intent to cover collection, use, retention, choices; explicitly **draft** pending final language.  
- **`/terms`** — Visitor obligations, “no warranty,” education vs legal advice; **draft**.  
- **`/disclaimer`** — Not government site; paid-for references `CAMPAIGN_POLICY_V1`; link to official SOS; stronger than privacy/terms for **identity of site**.

### Questions to ask counsel (non-exhaustive)

1. Is committee name and **paid-for** wording correct for Arkansas campaign finance and your filing style?  
2. Do privacy/terms need **cookie/analytics** sections if / when analytics tags are added?  
3. Should forms disclose retention, vendor subprocessors, or volunteer data routing? (Intake lands in **Kelly Postgres** — operators use workbench.)  
4. Any **required** links (e.g., consumer rights, Ark.-specific references)?

### Approval path

1. Counsel marks **Approved**, **Approved with edits** (provide redlines), or **Not approved** on the sign-off log.  
2. If edits: implement in `privacy/page.tsx` / `terms/page.tsx` **only** from counsel text — not paraphrased by AI for legal substance.  
3. If **waiver** to launch on drafts: record in sign-off log and in [`KELLY_SOS_LAUNCH_STATUS.md`](./KELLY_SOS_LAUNCH_STATUS.md) known risks.

---

## Track B — Treasurer workflow (paid-for + donations)

### Paid-for line

- **Single string** in code: `CAMPAIGN_POLICY_V1.disclaimers.pageFooterPaidForLine` (`policy.ts`).  
- **Must match** mailers, ads, and counsel expectations; changing it requires **treasurer + counsel** alignment.

### Donation handoff

- **Default:** GoodChange URL constant in `external-campaign.ts` (see `resolvePublicDonateHref`).  
- **Override:** `NEXT_PUBLIC_DONATE_EXTERNAL_URL` in Netlify for the target site.  
- **Checklist for treasurer**

  - [ ] Confirm **primary** donation URL matches active processor account.  
  - [ ] Confirm **committee name** on processor receipts matches paid-for line.  
  - [ ] Decide **UTM** convention for donate links from email/social (see [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md)); document **parameter names** only in Netlify or comms doc — not secret values.

### Log decision

Record **Production donate primary path** in [`KELLY_SOS_DECISION_LOG.md`](./KELLY_SOS_DECISION_LOG.md) when resolved (moves out of “Pending decisions”).

---

## Track C — Hosted deploy preview smoke

### Why preview, not apex

Production apex may point at a **different stack** or older deploy. Section 2 proof uses the **Netlify deploy preview** URL for the branch you intend to merge (e.g. `build/reddirt-public-copy-pass-03`).

### Preconditions

- Preview build **green** on Netlify.  
- **Env** on that context: at minimum `DATABASE_URL`, `ADMIN_SECRET`, `NEXT_PUBLIC_SITE_URL` pointing at the **preview origin** if OG/canonical matters for the test.

### Automated helper

Run from repo root (PowerShell):

```powershell
cd H:\SOSWebsite\RedDirt
.\scripts\section2-preview-smoke.ps1 -BaseUrl "https://YOUR--PREVIEW.netlify.app"
```

Optional: `-SkipPost` to only GET legal routes and `/api/forms` OPTIONS/HEAD if needed (script documents behavior).

### Manual must-pass list

| Step | Pass criteria |
|------|----------------|
| GET `/` | 200, campaign layout |
| GET `/privacy`, `/terms`, `/disclaimer` | 200 |
| GET `/get-involved`, `/donate` | 200 |
| POST `/api/forms` | JSON `ok: true` with fake `@example.com` data per [`KELLY_SOS_INTAKE_SMOKE.md`](./KELLY_SOS_INTAKE_SMOKE.md) |
| Admin | Login with `ADMIN_SECRET`; `/admin/workbench` loads |

### Logging

Append [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md):

- Date (UTC), operator, **preview hostname** (no secrets), `join_movement` smoke = OK, optional `volunteer` smoke, Prisma row confirmed if operator checks DB.

---

## Track D — Demo dry-run (15 minutes)

Expand [`KELLY_SOS_DEMO_AND_DEPLOY.md`](./KELLY_SOS_DEMO_AND_DEPLOY.md) § Day 7 with this **contingency** language:

| Minute block | Content | If it fails |
|--------------|---------|------------|
| 0–2 | Home + scroll to footer paid-for | Say: paid-for string lives in `CAMPAIGN_POLICY_V1`; treasurer verified. |
| 2–4 | `/priorities` or `/direct-democracy` | Skip to `/understand` if slow. |
| 4–6 | County or events index | Use `/county-briefings` if events empty. |
| 6–7 | `/donate` — explain external handoff | If wrong URL: “override with `NEXT_PUBLIC_DONATE_EXTERNAL_URL` on Netlify.” |
| 7–9 | `/get-involved` — **do not** submit real PII live | Use staging/preview + fake submit beforehand to prove path. |
| 9–11 | `/admin` login → workbench | If auth broken: “check `ADMIN_SECRET` in host env.” |
| 11–13 | Legal: footer links to `/privacy`, `/terms`, `/disclaimer` | Say: counsel status per sign-off log. |
| 13–15 | Close: draft legal, SLA follow-up, Kelly-only DB | — |

**Close line:** “Intake is workbench + human follow-up per [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md).”

---

## RACI (suggested)

| Task | Responsible | Accountable | Consulted | Informed |
|------|-------------|-------------|-----------|----------|
| Privacy/terms final | Counsel | Steve | Treasurer | Campaign staff |
| Paid-for + donate | Treasurer | Steve | Counsel | Ops |
| Preview smoke + log | Ops / Cursor | Steve | — | Codex |
| Demo | Steve | — | — | Donors / press |

---

## Section 2 exit criteria (all true or waived)

- [x] Counsel row completed or waiver logged in [`KELLY_SOS_SECTION_2_SIGNOFF_LOG.md`](./KELLY_SOS_SECTION_2_SIGNOFF_LOG.md) (**draft waiver** — formal counsel initials still recommended).  
- [x] Treasurer row **partial** — code paths + default donate URL documented; **formal treasurer initials** pending in sign-off log.  
- [x] Intake smoke logged in [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md) (**local** `localhost:3001` — **Netlify preview** rerun still recommended before apex).  
- [x] Track D **automated** dry-run equivalent (GET sequence) completed; **Steve live** walkthrough optional.  
- [x] [`KELLY_SOS_LAUNCH_STATUS.md`](./KELLY_SOS_LAUNCH_STATUS.md) updated; launch lock in [`KELLY_SOS_DEMO_AND_DEPLOY.md`](./KELLY_SOS_DEMO_AND_DEPLOY.md) reviewed.

Move **next pass** to **Section 3** / launch lock in [`KELLY_SOS_NEXT_PASS_SCRIPT.md`](./KELLY_SOS_NEXT_PASS_SCRIPT.md).

*End KELLY-S2-DEEP-1*
