# Kelly SOS — firewall rules (RedDirt copy) (KELLY-FW-1)

**Authoritative cross-repo copy:** `H:\SOSWebsite\brands\kelly-grappe-sos\FIREWALL_RULES.md`  
This file is the **in-repo** operational checklist for Kelly Grappe for Arkansas Secretary of State work inside `RedDirt/`.

---

## Kelly campaign data ownership

All **operational** data held in this app’s **Postgres** database (via Prisma) for the Kelly SOS race — including but not limited to relational contacts, volunteer profiles, submissions, financial transactions, compliance documents, voter-adjacent models, comms artifacts, owned media metadata, and county intelligence — is **Kelly Grappe for SOS campaign data**. It is **not** generic demo data and **not** reusable as a public template dataset.

## Contacts firewall

- **Contacts** (including `RelationalContact`, inbox/intake records, email workflow entities, and any PII captured through forms) are **Kelly-only**.
- **Exports** (CSV, reports, admin downloads) must use **Kelly production** or **Kelly staging** only; do not import into AJAX, PhatLip, countyWorkbench, or “template” databases.

## Volunteers firewall

- **Volunteer** profiles, asks, onboarding documents, and volunteer intake queues are **Kelly-only**.
- Routing rules (interest, county, role) must not send Kelly volunteer PII to non-Kelly systems without explicit legal review.

## Donor / finance firewall

- **Donor** and **finance** data (`FinancialTransaction`, budgets, compliance tied to filings) are **Kelly-only** and **high sensitivity**.
- **Donate CTAs** may point externally (e.g. GoodChange); webhook and finance admin routes remain **Kelly-scoped**.

## Compliance data firewall

- **Compliance** documents and approval flags are **Kelly-only** and may contain legally sensitive material.
- File-serving APIs (e.g. compliance document download routes) must enforce **auth** and **least privilege** in production.

## Internal strategy firewall

- Briefings, opposition intel, owned media annotations, comms plans, and GOTV read models are **internal Kelly strategy**. They must not be copied into generic templates or other campaigns’ repos.

## Environment variables and secrets policy

- **Per-environment, per-brand** configuration. Production Kelly secrets **never** shared with other products.
- **Never** commit secrets. Use Netlify/host secret stores and local `.env.local` only on operator machines.
- Document **names** of required vars in `docs/deployment.md` and checklists; **never** paste values into chat or docs.

## Database isolation policy

- **One production Kelly database** (or explicit primary + read replica under same governance). **No** shared production DB with AJAX, PhatLip, countyWorkbench, or future generic engine demos.
- `DATABASE_URL` in production must point only to **Kelly** infrastructure.

## No AJAX data mixing

- **AJAX** (Jacksonville product) is a **separate** codebase and deploy. Do not merge datasets, imports, or env from AJAX into Kelly RedDirt.

## No PhatLip data mixing

- **PhatLip** (youth lane) is separate. No PhatLip PII or content databases in Kelly Postgres.

## No countyWorkbench data mixing (except public aggregates)

- **countyWorkbench** is a **sister** county portal repo. Kelly RedDirt may consume **public** or **campaign-approved** aggregate references (e.g. linking, copy alignment) per product decisions — **not** raw countyWorkbench private operator data in Kelly DB without a written boundary.
- Docs may reference `../countyWorkbench/` paths for **navigation** only (see `PROJECT_MASTER_MAP.md`); **`src/`** should not import runtime code from sister repos.

## Future template extraction

- No future **generic template** artifact may ship with **Kelly PII**, **donor**, **volunteer**, **finance**, **secrets**, or **private strategy** content.
- Template work = **fork + scrub + new seeds**, executed only after Kelly launch stability and a dedicated extraction packet.

## Rules for exports

- Exports are **Kelly-internal** by default. Distribution outside the campaign requires **treasurer / counsel / data governance** approval depending on content (especially finance and voter-adjacent fields).
- When exporting for vendors, use **minimum necessary** columns and time-bounded access.

## Rules for anonymized fixtures (later)

- Any **anonymized** or **synthetic** fixtures for tests or template demos must be **generated or scrubbed** so they cannot be joined back to real Arkansans or real donors.
- Do not “lightly redact” production dumps for reuse — build **fresh** synthetic data for non-Kelly environments.

## Related

- [`RED_DIRT_OPERATING_SYSTEM_MAP.md`](./RED_DIRT_OPERATING_SYSTEM_MAP.md) — sister app boundaries
- [`KELLY_SOS_ROUTE_MAP.md`](./KELLY_SOS_ROUTE_MAP.md) — sensitive admin/API surfaces
