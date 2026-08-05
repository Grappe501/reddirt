# RCIP Project Charter

**Platform:** RedDirt Civic Intelligence Platform  
**Mission:** `RCIP-PHASE-1-PUBLIC-STATISTICS-SPINE-1.0`  
**Engine repo:** `H:\SOSWebsite\RedDirt`  
**First external proof consumer:** `H:\Constitutional-Capitalism`

## Purpose

Ingest public statistical data once; preserve source; normalize carefully; cross-check honestly; share only approved public data; make every number traceable; let every new connector strengthen every approved civic system.

## Non-negotiable principle

Public data may be shared across approved civic applications. Private campaign, voter, donor, volunteer, relationship, email, calendar, operational, and personally identifying data may not cross the boundary.

## Phase 1 success measure

Not volume of data collected. Success is whether one public statistic can travel:

```text
Official API → RedDirt connector → raw metadata → normalized observation
→ provenance → cross-check → export → CC import → baseline → public-safe display
```

with definition, release, limitations, and provenance intact.

## Phase 1 scope

- Audit existing infrastructure (complete: see `RCIP_EXISTING_INFRASTRUCTURE_AUDIT.md`)
- Isolated `public_statistics` warehouse
- Census + BLS connectors (limited indicator manifest)
- Provenance + cross-check + confidence
- Validated export to Constitutional Capitalism
- No broad DB credentials to CC
- No inflation of CC progress without real mapped metrics

## Out of scope (Phase 1)

- Implementing all future agency connectors
- Unrestricted public API
- Filling all 86 CC baseline metrics
- Campaign data access for research consumers
