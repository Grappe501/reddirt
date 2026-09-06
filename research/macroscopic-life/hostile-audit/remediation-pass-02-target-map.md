# Hostile-Audit Remediation Pass 02 — Physical Target Map

**Pass:** HOSTILE-AUDIT REMEDIATION PASS 02  
**Purpose:** Promote the fourteen P1 hostile-audit repairs into the active PUB-9C reader-build chain without mutating frozen PUB-7L sources, then force scholarly requalification against the rebuilt physical master.  
**Starting main:** `4567ccde5673f7894430036cffdd3a33226d1cd9`

## Governing Rule

The physical publication target is generated. It is not a currently committed canonical manuscript file.

`research/macroscopic-life/scripts/promote-pub-9c-r9-reader-revisions.mjs` reads frozen PUB-7L Act II / IV / V sources and generates PUB-9C reader derivatives. `research/macroscopic-life/scripts/materialize-book-one-master-pub-9c.mjs` then combines those generated derivatives with frozen Act I / III reader sources into `manuscript/book-one-master-pub-9c-reader-materialized.md`.

Pass 02 must therefore operate in the derivative/generator layer. Direct edits to historical PUB-7L reader manuscripts are forbidden.

## Frozen historical inputs

The following GitHub blobs are the frozen inputs at Pass-02 start and MUST NOT be overwritten:

| Act | Frozen source | Git blob SHA |
|---|---|---|
| I | `manuscript/pub-7l-r1-act-i-redundancy-cut-reader-manuscript.md` | `afbb70e0431d3816c7132f506abe39b5c0022461` |
| II | `manuscript/pub-7l-r1-act-ii-redundancy-cut-reader-manuscript.md` | `2faebc4b2e0c311622e28c315979a3b7f8096a78` |
| III | `manuscript/pub-7l-r1-act-iii-redundancy-cut-reader-manuscript.md` | `85e0dac1c6357ffa12a6dd41ceb7c572d9b5a04c` |
| IV | `manuscript/pub-7l-r1-act-iv-redundancy-cut-reader-manuscript.md` | `1d8114be54f5b2f25523d4932b0205d1113260a4` |
| V | `manuscript/pub-7l-r1-act-v-redundancy-cut-reader-manuscript.md` | `132f78da05ebbc77ffff1c7ecf803660537dce8a` |

## Active build chain before Pass 02

1. `promote-pub-9c-r9-reader-revisions.mjs`
   - reads frozen Act II, IV, V;
   - writes `pub-9c-r9-act-ii-reader-manuscript.md`, `pub-9c-r9-act-iv-reader-manuscript.md`, `pub-9c-r9-act-v-reader-manuscript.md`;
   - inserts the four-evidence-barrier ladder, consciousness module, null model, Chapter 14 model-comparison architecture, and Chapter 16 research-program material.
2. `materialize-book-one-master-pub-9c.mjs`
   - currently reads frozen Act I, generated R9 Act II, frozen Act III, generated R9 Act IV, generated R9 Act V;
   - writes the physical PUB-9C reader master;
   - verifies Chapters 1–16, the canonical Eleven Tests, PUB-9C revision locks, Model C, and the consciousness note slot.
3. R13/R14 scholarly architecture
   - the 46-slot exact-anchor review is tied to the exact physical reader-master text/hash;
   - a changed Pass-02 physical master invalidates the previous physical-hash proof by design.
4. R15 RC1 merge gate
   - requires clean scholarly closure plus physical Figure 2–16 production closure;
   - Pass 02 does not authorize publication freeze.

## Pass-02 derivative architecture

Pass 02 will add a deterministic remediation promoter which:

1. runs or requires the existing R9 promotion layer;
2. reads the resulting R9 Act II / IV / V derivatives and the frozen Act I / III inputs;
3. applies only exact-anchor, idempotent Pass-02 repairs;
4. writes **new PUB-9C hostile-audit derivatives for all five acts**;
5. never writes any `pub-7l-*` path.

The materializer will then be switched to the five Pass-02 derivatives. This gives every act a single PUB-9C reader-layer provenance and prevents Acts I/III from requiring mutation of frozen historical text.

## Physical outputs

Generated Pass-02 act derivatives:

- `manuscript/pub-9c-ha2-act-i-reader-manuscript.md`
- `manuscript/pub-9c-ha2-act-ii-reader-manuscript.md`
- `manuscript/pub-9c-ha2-act-iii-reader-manuscript.md`
- `manuscript/pub-9c-ha2-act-iv-reader-manuscript.md`
- `manuscript/pub-9c-ha2-act-v-reader-manuscript.md`

Generated physical master remains:

- `manuscript/book-one-master-pub-9c-reader-materialized.md`

The generated master is a proof target, not a historical source.

## Existing manuscript defenses that Pass 02 must preserve rather than duplicate

The live reader sources already contain several important hostile-audit protections:

- Act I: `THE MICROBE IS A PERSPECTIVE, NOT A DIAGNOSIS.`
- Act I: sensory limitation is explicitly not evidence of an unsupported hidden phenomenon.
- Act I: frequency is already defined as measurement rather than explanation.
- Act III: `Electricity in the body is ordinary physics organized by living systems.`
- Act III: `FREQUENCY IS A MEASUREMENT, NOT AN EXPLANATION.`
- Act III: regeneration already distinguishes restored outcome from explicit target representation, goal awareness, and conscious intention.
- Act III: prediction already requires prospective testing, future target, outcome measure, serious baselines, and events not used to construct the prediction.
- Act IV: capability distributed across civilization is already distinguished from capability owned by civilization as one agent.
- Act IV: system-level capability is explicitly separated from higher-order individuality.
- Act IV: Whole-Only Information is already operationalized against component baselines.
- Act IV: the Eleven Tests are already called a project synthesis, explicitly not eleven independent votes, and grouped into dependence clusters.
- Act IV: Model Competition is already mandatory.
- Act IV: Model C is already the current winner and a positive middle category.

Pass 02 therefore uses `MERGE` or `CONFIRM_AND_LOCALIZE` wherever the idea is already taught. It does not paste Pass-01 repair prose blindly.

## Scholarly consequence

Any successful Pass-02 promotion changes the physical reader master. Therefore:

- the old materialized-master hash cannot be reused;
- the prior approved exact-anchor manifest cannot be assumed physically valid;
- all 46 anchors must be classified for impact;
- only affected anchors may be regenerated/re-reviewed through the existing PUB-9C scholarly architecture;
- no publication-freeze claim is permitted in Pass 02.

## Hard boundaries

- zero frozen PUB-7L mutations;
- zero approved Figure 2–16 redesigns;
- no new chapter or act;
- no change to any Eleven Test name;
- Test 11 Model Competition remains mandatory;
- consciousness remains outside the Eleven Tests;
- Generative Recurrence is not Test 12;
- Model C remains the current evidentiary winner;
- no new speculative factual claim may be promoted as established science;
- physical proof, not prose intention, controls closure.
