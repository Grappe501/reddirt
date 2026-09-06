# Macroscopic Life — PUB-8K

## Candidate Visual Verification + R1 → R2 Promotion

**Status: TOOLING READY / AWAITS RECOVERED CANDIDATES**

PUB-8K converts the recovery pipeline from file discovery into controlled provenance verification. It does not auto-approve recovered images.

The new guarded promotion tool is:

`research/macroscopic-life/scripts/promote-recovered-figure-candidates.ps1`

It consumes the latest PUB-8J candidate intake and a human-authored decision file. A candidate reaches R2 only when all of the following are true:

1. the candidate binary exists at the recorded path;
2. SHA-256 is recorded;
3. the reviewer confirms the image is the approved composition;
4. the reviewer confirms the frozen version matches;
5. the reviewer confirms the panel architecture matches the final hostile review/composite lock;
6. the reviewer confirms rejected mystical/pseudoscientific/obsolete visual language has not reappeared;
7. detached screenshot safety is acceptable.

If any gate fails, the candidate remains R1.

R2 means only:

> **APPROVED FROZEN BASE COMPOSITION VERIFIED.**

It does not mean publication-ready.

R3 still requires deterministic scientific typography/copy, exact brake language, verified or removed quantitative text, caption, alt text, web/mobile proof, detached screenshot proof, and print proof.

## Decision file

A template is stored at:

`research/macroscopic-life/recovery/intake/pub-8k-visual-decisions.template.json`

Copy it to:

`research/macroscopic-life/recovery/intake/pub-8k-visual-decisions.json`

and add one object per reviewed candidate using the candidate SHA-256 produced by PUB-8J.

## Run sequence

```powershell
cd H:\SOSWebsite\RedDirt
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\recover-figure-binaries.ps1
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\verify-recovered-figure-candidates.ps1
# Review candidate images against the frozen figure locks and populate pub-8k-visual-decisions.json
powershell -ExecutionPolicy Bypass -File .\research\macroscopic-life\scripts\promote-recovered-figure-candidates.ps1
```

Outputs are written to:

`research/macroscopic-life/recovery/verified/`

in JSON, CSV, and Markdown form.

## Figure-order doctrine

Review one figure at a time, beginning with Figure 2. Do not bulk-promote fifteen images based on filenames alone.

For Figure 2, compare against the V4 final hostile review and preserve the locked scientific brake:

> **A signal's absence from unaided perception is a reason to measure — not evidence that an unsupported hidden phenomenon exists.**

The image can reach R2 even if its AI-rendered text still needs replacement, because R2 verifies the approved base composition. It cannot reach R3 until canonical text is deterministic.

## Next gate

**PUB-8L — Deterministic Composite Builder + R2 → R3 Proof Harness**

Once the first recovered image reaches R2, build the deterministic overlay/composite path and proof system for web, mobile, detached screenshot, and print export. Do not alter the frozen figure concept during that work.
