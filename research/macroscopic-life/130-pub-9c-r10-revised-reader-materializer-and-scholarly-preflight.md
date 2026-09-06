# Macroscopic Life — PUB-9C-R10

## Revised Reader Materializer + Scholarly Preflight

**Status: TOOLING BUILT — LOCAL EXECUTION NOT CLAIMED**

This pass hardens the production path after PUB-9C-R9 without overwriting the historical PUB-7L R1 source layer.

## What changed

### 1. Revised reader materializer

`materialize-book-one-master-pub-9c.mjs`

The revised master now resolves its five acts as:

- Act I — frozen PUB-7L R1
- Act II — PUB-9C-R9 derivative
- Act III — frozen PUB-7L R1
- Act IV — PUB-9C-R9 derivative
- Act V — PUB-9C-R9 derivative

The materializer fails closed unless it finds all 16 chapters, all Eleven Tests, the final verdict locks, the new four-stage evidentiary hierarchy, the consciousness boundary, the adversarial model-comparison transition, and the staged Chapter 12 consciousness note marker.

It also rejects the obsolete three-stage `Pattern, Organization, Individual` heading.

### 2. Bibliography builder corrected for revised manuscript

`build-final-book-one-bibliography-pub-9c.mjs`

This does not reuse the fragile legacy candidate filenames. It requires the actual known authority files and the PUB-9C consciousness amendment. It fails on missing BIB IDs, missing citation text, explicit unverified state, or conflicting duplicate IDs.

Target bibliography is now **BIB-001 through BIB-033**.

The increase from 31 to 33 authorities is distinct from the increase from 45 to 46 endnote slots: one new endnote slot can cite two authorities.

### 3. Single preflight runner

`run-pub-9c-r10-revised-reader-preflight.ps1`

Order:

1. generate PUB-9C-R9 reader derivatives;
2. materialize revised reader master;
3. build BIB-001..033 verified bibliography;
4. require both physical outputs.

## Deliberate stop

The runner does **not** call the legacy exact-anchor/endnote injection chain.

That chain was built around 45 slots and a different physical master. Running it now would risk false exact-anchor reconciliation.

The correct next operation is to amend the insertion manifest, numbering map, exact-anchor manifest/reconciler, injection proof, and final scholarly proof to **46 slots**, then regenerate exact anchors against the new physical PUB-9C master.

## Local command

From the physical repository checkout:

```powershell
cd H:\SOSWebsite\RedDirt
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-9c-r10-revised-reader-preflight.ps1
```

No output from that command is claimed by this control file until it is actually executed on the local checkout.

## Next gate

**PUB-9C-R11 — 46-Slot Exact-Anchor + Endnote Injection Architecture**

Do not reuse the old 45-slot hashes or exact anchors. The revised manuscript has changed sentence positions and introduced a new consciousness note burden.
