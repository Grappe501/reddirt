# Compliance SaaS Product Architecture

Status: product architecture foundation  
Scope: RedDirt Compliance subsystem, designed for later standalone extraction  

## Product Shape

The Compliance subsystem is being built as an audit-first campaign finance operations layer:

- guided intake wizards instead of spreadsheets;
- receipt, cash, check, GoodChange, bank, vendor, and reimbursement staging;
- AI extraction and classification with strict human approval boundaries;
- source-backed compliance rule retrieval;
- JSON fallback storage for early operations, with clear DB-backed upgrade paths.

## Reusable Core

Reusable modules should stay under `src/lib/compliance/**`:

- `money/` universal money movement types and JSON storage;
- `receipts/` receipt staging, audit, and receipt-to-money conversion;
- `knowledge/` source, chunk, corpus, and coverage audit types;
- `ai/receipt-intake-agent/` extraction, category, payment, tip, duplicate, readiness, and note helpers;
- `ai/compliance-agent/` human approval guard and tool vocabulary.

These modules should not import RedDirt admin UI. They can later move into a package or service.

## RedDirt-Specific Surface

RedDirt-specific integration lives in:

- `src/app/admin/(board)/compliance/**`;
- RedDirt admin cards/navigation;
- local JSON fallback under `data/compliance/**`;
- existing `SearchChunk` ingestion;
- RedDirt `.env` only.

## DB Models Needed

Future DB-backed SaaS should add:

- `ComplianceMoneyMovement`;
- `ComplianceReceipt`;
- `ComplianceReceiptAuditLog`;
- `ComplianceDocument`;
- `ComplianceRuleSource`;
- `ComplianceRuleChunk`;
- `ComplianceVendor`;
- `ComplianceBankTransaction`;
- `ComplianceReconciliationCandidate`;
- `ComplianceApproval`.

All tenant/campaign SaaS rows need organization/campaign IDs, actor IDs, timestamps, immutable audit events, and role-aware access policies.

## Object Storage Needed

Receipt images, donor slip photos, check images, bank CSVs, and filing PDFs should move from local ignored paths to private object storage:

- private bucket per tenant or strong key prefix isolation;
- signed URLs for admin preview only;
- malware/file-type checks before storage;
- retention policy;
- redaction policy for IDs and tax documents;
- no public URL exposure for private finance documents.

## API Hooks Needed

Future API/service boundaries:

- receipt upload and extraction;
- receipt approval and conversion;
- money movement approval;
- bank CSV import;
- bank match candidate creation;
- rule corpus ingestion;
- rule retrieval with citations;
- filing readiness report generation;
- immutable audit event append.

## AI Boundaries

AI can extract, classify, suggest, warn, explain, score readiness, and cite rules.

AI cannot approve, certify compliance, mark paid, mark reconciled, hide missing fields, alter bank records, or finalize filing records without human action.

## Extraction Path

Standalone extraction later should preserve:

- source-backed rule chunks;
- receipt/money data contracts;
- audit event vocabulary;
- human approval guard;
- storage adapters;
- admin wizard UX as a replaceable shell.
