# Macroscopic Life — PUB-8J

## Candidate Intake + Visual Provenance Verification

**Status: INTAKE TOOLING BUILT / EXECUTION AWAITS LOCAL RECOVERY REPORT**

This pass builds the deterministic intake layer that sits between the local binary scanner from PUB-8I and any promotion of a recovered figure from R0 to R1/R2/R3.

The repository cannot directly inspect Steve's Windows/H-drive filesystem from the GitHub connector. Therefore this pass does **not** claim that any candidate binary has been found or verified. It creates the verification machinery and hardens the promotion rules so the next local run can be evaluated without reopening design.

---

## 1. New verifier

Script:

`research/macroscopic-life/scripts/verify-recovered-figure-candidates.ps1`

Purpose:

- reads the most recent PUB-8I recovery JSON, or an explicitly supplied JSON file;
- normalizes candidate records from several possible JSON shapes;
- maps candidate filenames/paths to Figures 2–16 where possible;
- attaches each figure's frozen version and canonical lock commit;
- preserves or calculates SHA-256 where the file is locally reachable;
- records file size and modification timestamp where available;
- distinguishes candidate intake from publication approval;
- emits JSON, CSV, and Markdown candidate-intake reports;
- performs no moves, copies, renames, deletions, or publication writes.

Output directory:

`research/macroscopic-life/recovery/intake/`

---

## 2. Critical promotion doctrine

A filename match is not provenance.

A hash is identity for a binary, but not proof that the binary is the frozen approved composition.

A visually similar image is not automatically the approved version.

Therefore the verifier assigns matched files only as:

**R1-CANDIDATE**

It never automatically promotes to R2 or R3.

### R1 → R2 requires

A human/visual comparison against the frozen hostile-review and deterministic composite specification demonstrating that the candidate is the approved visual base.

The comparison must check:

- correct figure number;
- correct final version;
- correct panel architecture;
- correct major visual composition;
- no earlier rejected concept accidentally resurfaced;
- no missing scientific mechanism required by the final review;
- no visual language later removed for pseudoscience/screenshot-risk reasons;
- no obsolete AI-rendered copy treated as canonical.

### R2 → R3 requires

- deterministic typography;
- exact scientific labels;
- exact frozen brakes;
- quantitative statements verified or removed;
- evidence-class treatment correct;
- caption finalized;
- alt text finalized;
- desktop/web proof;
- mobile proof;
- screenshot safety proof;
- print-resolution/export proof.

Only R3 may set the site's `FigureAssetStatus` to `publication-ready`.

---

## 3. Canonical frozen versions attached by the verifier

| Figure | Frozen version | Canonical lock/review commit |
|---:|---|---|
| 2 | V4 | `786b9dec0e763906198954c8b6b5b2b723321730` |
| 3 | V4 | `681159c5f3cc2b988c58d52627b48d749e695027` |
| 4 | V4 | `ce516935f999e52decc3e2561a048f5896e5383c` |
| 5 | V3 | `90e4dccf0e90471190b73968634df982b6ddde73` |
| 6 | V3 | `c276a9e9ba211a07c487d70379625b734898780a` |
| 7 | V3 | `76149c8c8ce1ee9c61fb2cb03ee9e925a57de9bc` |
| 8 | V2 | `30885f9e1980cc32075f1d42b3edf9196a24cfac` |
| 9 | V2 | `7cbf92241d851e08a6ddf0e18f00660f86587de0` |
| 10 | V3 | `7350f0edfe7817fb969796c5150b604dd693a9ab` |
| 11 | V2 | `e0c839a341759bbab894f6ce3442d004915fe0b3` |
| 12 | V3 | `51fe578231eb0a70960b4c29c8106b90a37c2584` |
| 13 | V3 | `8834c60209e50e88febb48dabe77007a8b291830` |
| 14 | V3 | `97007d01dcdc8aaf2cd2a287a81e8204736688d3` |
| 15 | V3 | `69f59749f701213f4ee63c7c98b8b49578debbcf` |
| 16 | Frozen canon | `3178eaf81abd53c42ab613316e144907c6736b65` + manuscript locks |

---

## 4. Local execution sequence

From the RedDirt root on Steve's Windows machine:

```powershell
cd H:\SOSWebsite\RedDirt
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\recover-figure-binaries.ps1
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\verify-recovered-figure-candidates.ps1
```

The second command will automatically select the newest recovery JSON unless `-InputJson` is supplied.

Example explicit intake:

```powershell
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\verify-recovered-figure-candidates.ps1 -InputJson ".\research\macroscopic-life\recovery\<recovery-file>.json"
```

---

## 5. What this pass does not do

PUB-8J does not:

- regenerate a figure;
- alter a recovered candidate;
- copy a candidate into `public/`;
- declare a candidate R2;
- declare a candidate R3;
- change `figure-assets.ts` to `publication-ready`;
- claim any Netlify deployment;
- infer that a candidate is correct from filename alone.

---

## 6. Next production gate

**PUB-8K — Candidate Visual Verification + R1→R2 Promotion**

PUB-8K begins only after the local recovery/intake reports exist and at least one candidate binary has been surfaced.

The next work should be one figure at a time:

1. select the strongest candidate for Figure 2;
2. compare it against the V4 frozen review;
3. approve or reject it;
4. if approved, record SHA-256 and provenance and move Figure 2 to R2;
5. repeat sequentially through Figure 16.

No batch auto-approval is permitted.
