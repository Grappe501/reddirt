# Macroscopic Life — PUB-8X

## Controlled Endnote Marker Injection + Post-Injection Manuscript Integrity Proof

**Status: PRODUCTION GATE BUILT — LOCAL EXECUTION REQUIRED**

PUB-8X creates the publication derivative without modifying the frozen clean reader master.

### Pipeline

1. Run PUB-8W and require PASS.
2. Confirm the physical master SHA-256 still matches the reconciled master.
3. Inject exactly one marker for each of the 45 exact unique anchors.
4. Create `book-one-master-v1.0-reader-endnoted.md` as a derivative.
5. Append the controlled endnote definitions and verified bibliography.
6. Run a destructive-assumption check: remove all markers and apparatus from the derivative and require the resulting reader prose to equal the frozen clean master byte-for-byte after terminal newline normalization.

### Added machinery

- `scripts/inject-controlled-endnotes.mjs`
- `scripts/proof-post-injection-manuscript-integrity.mjs`
- `scripts/run-pub-8x-endnote-injection.ps1`

### Integrity requirements

- 45 note markers.
- 45 note definitions.
- 90 total Markdown note tokens.
- 16-chapter clean reader remains unchanged.
- No build/editorial ledger leakage.
- Locked civilization verdict preserved.
- `MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.` preserved.
- `WE ARE THE MICROBE.` preserved.

### Run

```powershell
cd H:\SOSWebsite\RedDirt
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\run-pub-8x-endnote-injection.ps1
```

### Current truth

The injector and integrity proof are committed. They have not been executed on the H-drive by this connector environment. Therefore the derivative endnoted manuscript and PASS report are **not yet claimed to exist**.

### Next production gate

**PUB-8Y — Publication Package Assembly + Release Candidate Manifest**

After PUB-8X passes locally, package the frozen clean master, endnoted master, verified bibliography, figure registry, figure proof states, and scholarly integrity reports into one release-candidate manifest. Release remains blocked on any figure lacking verified R3 publication state.
