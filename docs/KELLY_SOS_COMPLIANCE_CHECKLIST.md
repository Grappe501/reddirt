# Kelly SOS — compliance & security checklist (Day 5)

**Doc ID:** KELLY-COMPLIANCE-1  
**Scope:** `H:\SOSWebsite\RedDirt`  
**Last updated:** 2026-04-26

**Section 2 deep build:** counsel/treasurer workflows, hosted smoke, demo — [`KELLY_SOS_SECTION_2_DEEP_BUILD.md`](./KELLY_SOS_SECTION_2_DEEP_BUILD.md).

## Footer & public legal

- [x] **Paid-for line** — `CampaignPaidForBar` + `CAMPAIGN_POLICY_V1.disclaimers.pageFooterPaidForLine`; optional `NEXT_PUBLIC_COMMITTEE_SITE_URL`.
- [x] **Legal routes live** — `/privacy`, `/terms`, `/disclaimer` (draft structure; **counsel** replaces body copy as needed).
- [x] **Footer** — Legal group links in `footerNavGroups` (`src/config/navigation.ts`); four-column layout on large screens.

## Donation

- [x] **External handoff** — `siteConfig.donateHref` / `resolvePublicDonateHref` pattern; `NEXT_PUBLIC_DONATE_EXTERNAL_URL` in `.env.example`.
- [ ] **UTM** — add query params on production donate links when comms finalizes a standard (document in `external-campaign` or Netlify env).

## Admin & PII

- [x] **`/admin/*`** — `middleware.ts` requires `ADMIN_SECRET` (except `/admin/login`); no secret → redirect to `?error=config`.
- [x] **`/admin/(board)/*`** — `requireAdminPage()` in layout; financial ledger at `/admin/financial-transactions` is not publicly reachable.
- [ ] **Fine-grained RBAC** — many routes; document who may view PII vs finance in campaign SOP (not all enforced in code).

## Repository hygiene

- [x] **`.env.example`** — `DATABASE_URL`, `ADMIN_SECRET`, email/SMS block names, `NEXT_PUBLIC_*` campaign URLs documented.
- [x] **Cross-lane imports** — see grep note in **Day 5 completion report**; no accidental `ajax`/`phatlip` code imports in `src/`.

## Counsel / treasurer follow-ups

- [ ] Replace **placeholder** text on `/privacy` and `/terms` with final campaign policies.
- [ ] Confirm **paid-for** and any **FEC** wording on new pages and mailers.

*End KELLY-COMPLIANCE-1*
