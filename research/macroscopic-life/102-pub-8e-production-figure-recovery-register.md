# MACROSCOPIC LIFE

## PUB-8E — Production Figure Recovery Register

**Status: RECOVERED FROM GITHUB HISTORY — DO NOT REDESIGN**

This register corrects the temporary assumption that Figures 2–16 still needed conceptual artwork creation. They do not. The production history in `research/macroscopic-life/visuals/` contains the iterative generative compositions, hostile reviews, deterministic-copy requirements, and final composition locks.

The remaining distinction is between **recovered production design** and **binary artwork physically stored in GitHub**. A figure can be compositionally/scientifically frozen even when the generated binary itself was not committed.

## Recovery doctrine

- Do not regenerate a figure merely because its PNG/WebP binary is absent from GitHub.
- Do not reopen a frozen composition unless a genuine scientific error is discovered.
- Use the final hostile review / deterministic composite lock as the source of truth for reconstruction or asset retrieval.
- AI-rendered scientific text is never canonical. Final labels, titles, arrows, numbers, legends, brakes, and captions remain deterministic.
- When a frozen generative binary can be retrieved from its original generation record, use that composition as the base and rebuild the deterministic overlay exactly from the lock.
- Until the binary is physically restored, the live site may retain the deterministic SVG fallback; that fallback is a delivery mechanism, not a replacement design.

---

# Frozen production lineage

| Figure | Frozen recovered version | Recovery anchor | Recovered state |
|---|---|---|---|
| 2 | V4 | `786b9dec0e763906198954c8b6b5b2b723321730` — `FIG-02-V4-FINAL-HOSTILE-REVIEW.md` | Scientific + visual composition locked; approved for deterministic finish |
| 3 | V4 | `681159c5f3cc2b988c58d52627b48d749e695027` — FIG-03 v4 final hostile review | Final hostile-review composition recovered |
| 4 | V4 | `ce516935f999e52decc3e2561a048f5896e5383c` — FIG-04 v4 final hostile review | Final hostile-review composition recovered |
| 5 | V3 | `90e4dccf0e90471190b73968634df982b6ddde73` — FIG-05 v3 final hostile review | Final hostile-review composition recovered |
| 6 | V3 | `c276a9e9ba211a07c487d70379625b734898780a` — FIG-06 v3 final hostile review | Final hostile-review composition recovered; preserve frozen figure wording intentionally |
| 7 | V3 | `76149c8c8ce1ee9c61fb2cb03ee9e925a57de9bc` — `FIG-07-V3-FINAL-HOSTILE-REVIEW.md` | **Scientific + visual composition locked; NO V4 required** |
| 8 | final controlled composition | `30885f9e1980cc32075f1d42b3edf9196a24cfac` | Deterministic scientific copy and composition locked |
| 9 | V2 | `7cbf92241d851e08a6ddf0e18f00660f86587de0` | Deterministic copy and composite specification locked |
| 10 | V3 | `7350f0edfe7817fb969796c5150b604dd693a9ab` | Deterministic scientific copy and composite specification locked |
| 11 | V2 | `e0c839a341759bbab894f6ce3442d004915fe0b3` | Deterministic scientific copy and composite locked |
| 12 | V3 composition + deterministic lock | `760edc5306a06e9feb0ebab64b1165973ee6a5f4` + `51fe578231eb0a70960b4c29c8106b90a37c2584` | Final controlled generative revision recovered; composite spec locked |
| 13 | V3 | `c429e923a9f533e3faa30da06100a8014fffde99` + `8834c60209e50e88febb48dabe77007a8b291830` | V3 generative build recovered; deterministic scientific composite locked |
| 14 | V3 | `98245e1dd46d37b709106a0018972493aeccd2de` + `97007d01dcdc8aaf2cd2a287a81e8204736688d3` | V3 generative composition recovered; deterministic composite locked |
| 15 | V3 | `1f9e52b5a1539c0c5e0b2d3131c3980a7369fd0b` + `69f59749f701213f4ee63c7c98b8b49578debbcf` | V3 generative composition recovered; deterministic composite production locked |
| 16 | frozen publication canon | production canon + PUB-8B/PUB-7L locks | Exact deterministic three-line close recovered; no standalone FIG-16 generative commit was located in GitHub commit search during this pass |

---

# Figure 2 recovered proof

The final Figure 2 review explicitly states:

> **CONDITIONAL APPROVAL — SCIENTIFIC/NARRATIVE CONTENT LOCKED; GENERATED POSTER IS NOT YET THE PUBLICATION-MASTER TEXT ASSET**

and later:

> **FIG-02 SCIENTIFIC + VISUAL COMPOSITION: LOCKED**

It also says the V4 image is the canonical visual reference and requires only deterministic typography/copy, verification/removal of generated numerical ranges, schematic/false-color labels, caption/alt text, and export checks. Therefore Figure 2 is **not a redesign task**.

# Figure 7 recovered proof

The final Figure 7 review states:

> **FINAL STATUS: FIGURE 7 SCIENTIFIC + VISUAL COMPOSITION LOCKED**

> **NO V4 CONCEPT GENERATION REQUIRED.**

This establishes the general recovery principle used for the later locked figures.

# Figure 15 recovered proof

The Figure 15 deterministic lock records:

- generative composition frozen at V3;
- deterministic scientific copy locked;
- composite rules locked;
- P0: 0 / P1: 0 / NO V4;
- frozen visual generation ID `4f242418-1a59-4f11-b478-47d8f778cca4`.

It also explicitly warns that the generated binary is **not asserted to be stored in GitHub**. That distinction applies to recovery: the design is preserved even if the image file itself must be retrieved from the original generation system or reconstructed from the frozen production record.

---

# Binary recovery status

A recursive/default-branch inspection did not reveal a committed canonical WebP/PNG set for the Macroscopic Life production figures. The newly created `public/macroscopic-life/figures/` path is therefore a **destination**, not evidence that the original binaries were lost or never made.

Current safe live behavior:

1. use a recovered final artwork binary when physically present and verified;
2. otherwise use the deterministic SVG fallback;
3. never generate a new conceptual replacement simply to fill the missing binary slot.

# Figure 16 special handling

Figure 16 is protected by exact production canon even though this pass did not locate a standalone generative-history commit comparable to Figures 7–15. Its deterministic closing trio remains:

- **LOCAL SIGNALS CAN BE REAL WITHOUT CONTAINING A PICTURE OF THE WHOLE.**
- **EPISTEMIC HUMILITY IS NOT POSITIVE EVIDENCE.**
- **MEASURE. PERTURB. COMPARE MODELS. ALLOW FAILURE.**

`NESTED SCALE ≠ NESTED ORGANISMS` may not replace those lines.

---

# PUB-8E verdict

**Figures 2–15: PRODUCTION DESIGN RECOVERED.**

**Figure 16: DETERMINISTIC PUBLICATION CANON RECOVERED; standalone generative lineage not yet located.**

**Conceptual redesign required: NO.**

**Binary asset retrieval/reconstruction required where binaries are absent: YES.**

**Live SVG fallback may remain temporarily: YES.**

Next production gate:

**PUB-8F — Binary Asset Retrieval + Deterministic Composite Restoration.**
