# Macroscopic Life — PUB-8O

## Physical Master Execution + Bibliography Normalization Queue

**Status: EXECUTION HARNESS BUILT — LOCAL EXECUTION REQUIRED**

PUB-8O closes two production gaps without reopening reader prose: physical manuscript materialization and bounded bibliography metadata normalization.

## Physical master

The existing deterministic materializer remains authoritative:

`research/macroscopic-life/scripts/materialize-book-one-master.mjs`

It assembles only the five canonical PUB-7L R1 act sources, strips implementation ledgers, verifies Chapters 1–16, verifies all Eleven Tests, and verifies the final scientific locks before writing:

`research/macroscopic-life/manuscript/book-one-master-v1.0-reader-materialized.md`

PUB-8O adds a Windows production runner:

`research/macroscopic-life/scripts/run-pub-8o-production.ps1`

Run from the RedDirt root:

```powershell
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-8o-production.ps1
```

The runner fails if the materializer fails, the output is absent, chapter count is not 16, or build-only implementation text leaks into the reader master.

**Repository connector limitation:** this control pass cannot execute Node/PowerShell on Steve's H-drive checkout. Therefore the physical output is not claimed generated until the runner is executed on an execution-capable checkout and its generated artifacts are reviewed/committed.

## Bibliography normalization

PUB-8O adds:

`research/macroscopic-life/scripts/build-bibliography-normalization-queue.mjs`

It converts the working publication apparatus into a bounded metadata queue under:

`research/macroscopic-life/recovery/bibliography-normalization/`

Initial high-value anchor queue includes West 2015; Bourke 2023; Michod source family; bioelectricity, morphogenesis, regeneration, trained-immunity, circadian and PID reviews; Kameda 2022; Hutchins; Helbing 2013; and Franklin-Hall.

The queue records what is known and what remains missing. It does not invent authors, dates, titles, journal metadata, pages, editions, or DOIs.

## Production doctrine

> **VERIFY OR LEAVE OPEN. NEVER FABRICATE BIBLIOGRAPHIC METADATA.**

> **MATERIALIZE THE FROZEN BOOK. DO NOT REWRITE IT.**

## Current gate

PUB-8O infrastructure: **PASS**

Physical master execution: **OPEN until locally run**

Bibliography normalization queue generation: **OPEN until locally run**

Bibliographic metadata verification: **OPEN**

Scientific architecture: **FROZEN**

## Next production gate

**PUB-8P — Bibliographic Authority Resolution + Endnote Numbering Map**

Resolve the normalization queue against authoritative records, assign stable publication bibliography IDs, and map chapter claims/endnote families into final endnote numbering without changing the scientific burden or reader prose.
