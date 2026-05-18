# Compliance SaaS Blueprint

Status: production-grade foundation blueprint  
Scope: RedDirt Compliance Command Center as a future standalone compliance product  
Legal status: not filing-certified without verified jurisdiction rules and human compliance approval

## Tenant Model

- `Tenant`: campaign, committee, PAC, nonprofit, or consultant client.
- `TenantUser`: staff, treasurer, candidate, compliance officer, consultant, auditor.
- `TenantJurisdiction`: state/county/municipal rule profile and filing calendar.
- `TenantStorageRoot`: private object prefix for every document and filing package.
- `TenantAuditLedger`: append-only approval, reconciliation, filing, and amendment events.

## Subscription Tiers

- Starter: receipt/cash/check intake, basic reports, local export.
- Professional: bank reconciliation, filing readiness, task center, private storage, AI extraction.
- Treasurer: approval chains, immutable filing packets, W-9/1099 workflows, audit manifests.
- Enterprise/Consultant: multi-tenant dashboard, white-label portal, API, bulk imports, custom jurisdiction packs.

## Storage Architecture

- Private object storage only for receipts, slips, W-9s, contracts, invoices, check images, and filing snapshots.
- Local dev fallback is allowed only for non-production and remains ignored by git.
- Supabase Storage production mode should use a private bucket, signed URLs, and RLS policies on `storage.objects`.
- Service role keys are server-only. Browser clients must never receive secret keys.

## Scaling Strategy

- Move JSON fallback stores into tenant-scoped database tables.
- Partition large audit and import tables by tenant and filing period.
- Store immutable filing package manifests separately from mutable staged records.
- Build reconciliation as event-sourced records: suggested, reviewed, approved, locked.

## API Roadmap

- `/api/compliance/imports/*` for upload/analyze/stage.
- `/api/compliance/documents/*` for private upload and signed download.
- `/api/compliance/reconciliation/*` for matches, approval, variance, lock.
- `/api/compliance/filings/*` for snapshot, certify, file, amend.
- `/api/compliance/tasks/*` for generated and assigned tasks.
- `/api/compliance/rules/*` for rule corpus retrieval and citation checks.

## White-Label Options

- Tenant branding, committee name, paid-for line, filing calendar, and jurisdiction rule packs.
- Candidate mobile mode with branded receipt upload and task checklists.
- Treasurer dashboard with approval and filing package workflows.

## Commercial Readiness Gates

- Verified rule corpus for each supported jurisdiction.
- Tenant-authenticated private storage and RLS.
- Immutable database-backed audit ledger.
- Filing package export templates validated by jurisdiction.
- Security review of storage, service keys, signed URLs, and admin roles.
