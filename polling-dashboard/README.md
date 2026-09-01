# Red Dirt Polling Dashboard

This folder is the canonical planning and build domain for the Red Dirt statewide polling, survey, sampling, volunteer calling, public-opinion analytics, and election-simulation system.

## Purpose

Build a continuous statewide research system that uses the existing Red Dirt voter registration, voter history, geography, and phone data to create controlled probability-based calling samples; coordinate multiple volunteers from shared dashboards; collect standardized survey responses; preserve raw observations; calculate defensible weighted estimates; ingest external and online survey evidence separately; and eventually simulate plausible election outcomes.

## Core rule

The polling system must extend the existing Red Dirt voter/person architecture. It must not create a second independent voter database.

## AI rule

OpenAI may assist with aggregate analysis, open-ended response coding, anomaly detection, research summaries, and analyst queries. Statistical/random sampling must be implemented with auditable deterministic/probability sampling code rather than an LLM choosing individual voters.

## Canonical files

- `MASTER_BUILD_PLAN.md` — governing phased build plan and slice sequence.
- `architecture/SYSTEM_SPINE.md` — system boundaries, major components, data flow, and integration points.
- `methodology/POLLING_METHODOLOGY.md` — survey research and sampling rules that code must honor.
- `governance/BUILD_STATUS.json` — machine-readable current build status and next slice.

## Planned subdomains

- `architecture/` — system design and data-flow contracts.
- `methodology/` — sampling, weighting, questionnaire, experimental, and reporting standards.
- `questionnaires/` — versioned survey instruments and scripts.
- `data-contracts/` — proposed schemas and interfaces before Prisma/database implementation.
- `volunteer-workbench/` — caller UX, supervisor UX, disposition definitions, and QA rules.
- `analytics/` — weighting, uncertainty, rolling estimates, geography, trends, and external poll aggregation.
- `simulation/` — turnout and election simulation methodology.
- `ai-research/` — permitted AI analysis functions and guardrails.
- `compliance/` — privacy, calling, consent, campaign, voter-file, and research review notes.
- `research/` — source notes, methodological references, decisions, and experiments.

## Local path

Expected local workspace: `H:\SOSWebsite\RedDirt\polling-dashboard\`

The local Red Dirt checkout should pull this branch/repository so the folder exists on the H: drive. This GitHub commit establishes the canonical folder even if the local machine has not pulled it yet.
