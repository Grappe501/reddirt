# V2-09 — Fundamentals + Filing Intelligence

Status: IMPLEMENTED foundation contract
Date: 2026-09-18

V2-09 establishes the provenance-first data layer underneath the financial chapters of every Symbol Intelligence page.

## Fundamental Fact

Every number is a fact with security identity, accounting/financial concept, statement family, fiscal period, raw value, unit, scale, provenance, status and optional derivation. Reported and derived values are never silently mixed.

A derived ratio stores its formula, input fact IDs and method version. Null is preserved as unavailable. Zero is valid only when the source actually reports/calculates zero.

## Filing Record

Filings have stable filing IDs, security IDs, form type, filed date, reporting period, accession, amendment state, source locator/retrieval timestamp and supersession state.

## Restatements

Facts can be reported, derived, restated or superseded. Restatement relationships are explicit so a later filing cannot silently rewrite historical evidence.

## Statement education

knowledgeObjectId can connect an accounting line or ratio directly to the Universal Knowledge Graph. This is the bridge for clicking Gross Margin, EPS, Free Cash Flow, etc. and moving from the actual reported number into definition, calculation, caveats, research depth and exercises.

## Source posture

This phase defines the ingestion and reconciliation contract; it does not invent or seed current company financials. Production facts must arrive from an authoritative/licensed source and retain provenance. SEC filing ingestion can populate primary-source U.S. issuer facts in later data-feed work.

## Acceptance

The architecture can represent reported facts, fiscal periods, units/scales, filings, amendments, restatements, derived metrics, provenance and missing-data states without coercion.
