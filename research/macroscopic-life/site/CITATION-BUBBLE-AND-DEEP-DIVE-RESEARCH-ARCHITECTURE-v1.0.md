# Macroscopic Life — Citation Bubble + Deep-Dive Research Architecture v1.0

## Goal

Every factual claim in the public Macroscopic Life experience should be able to expose its evidence ancestry without forcing the reader to leave the argument.

The interaction model is:

**inline citation → evidence bubble → source dossier page → deeper ancestry / methods / limits / related evidence**

The site should feel like a research instrument, not a decorative bibliography.

---

## 1. Inline citation behavior

Any claim with external support may carry a compact citation marker.

On click/tap, open an accessible popover/card containing:

- source title;
- authors;
- year/journal;
- one-paragraph plain-language summary;
- `What this source supports`;
- `What this source does NOT establish`;
- evidence type (review, experiment, theory, philosophy, historical analysis, etc.);
- relationship to Macroscopic Life (`ancestry`, `direct support`, `analogy/calibration`, `method`, `counterargument`);
- DOI/authoritative-source link;
- **Deep dive** action.

The bubble should never imply that one citation proves an entire Macroscopic Life theory.

---

## 2. Deep-dive route

Proposed route:

`/macroscopic-life/sources/[sourceId]`

Each source dossier should contain:

1. **Why this source is here**
2. **Citation and authoritative links**
3. **Plain-language summary**
4. **Research question / methods**
5. **Key findings**
6. **Claim-support matrix**
7. **What the source does not support**
8. **Limitations / controversy / replication status where known**
9. **How Macroscopic Life uses it**
10. **Idea ancestry** — earlier traditions and later descendants
11. **Related sources**
12. **Which chapter / theory / test depends on it**
13. **Open research questions**
14. **Evidence-state badge** (`ESTABLISHED`, `SUPPORTED`, `MIXED`, `PROJECT SYNTHESIS`, `SPECULATIVE`, etc.)

The source page can go far deeper than the print endnote without changing the book's prose.

---

## 3. Claim-first data model

A citation should attach to a **claim**, not merely a chapter.

Proposed source record fields:

```ts
export type MacroscopicSourceDossier = {
  id: string;
  title: string;
  authors: string[];
  year?: number;
  journalOrPublisher?: string;
  doi?: string;
  authoritativeUrl?: string;
  evidenceType: string;
  evidenceState: string;
  summary: string;
  supports: string[];
  doesNotSupport: string[];
  limitations: string[];
  ancestry: string[];
  macroscopicLifeUse: string[];
  chapters: number[];
  theoryIds: string[];
  testIds: string[];
  relatedSourceIds: string[];
  deepDiveSections?: { heading: string; body: string }[];
};
```

Proposed claim record:

```ts
export type MacroscopicClaim = {
  id: string;
  text: string;
  status: 'established' | 'supported' | 'mixed' | 'project-synthesis' | 'speculative';
  sourceIds: string[];
  counterSourceIds?: string[];
  theoryId?: string;
  chapter?: number;
};
```

This permits one source to support multiple claims and one claim to expose multiple supporting or competing sources.

---

## 4. Ancestry must be visible

Macroscopic Life should explicitly credit prior traditions.

Example bubble labels:

- **ANCESTRY — Major transitions in evolution**
- **ANCESTRY — Distributed cognition**
- **ANCESTRY — Causal interventionism**
- **DIRECT SUPPORT — Coupled circadian oscillators**
- **CALIBRATION — Superorganism literature**
- **COUNTERMODEL — Ordinary distributed organization**
- **PROJECT SYNTHESIS — Macroscopic Evidence Ladder**

This protects originality claims while making the project's actual synthesis easier to see.

---

## 5. Research-mode UX

Every theory/test page should have a `Research` mode that displays:

- claims;
- evidence state;
- linked source bubbles;
- competing explanations;
- unanswered questions;
- what would falsify or weaken the claim;
- latest project verdict.

The public reader can therefore move vertically:

**book sentence → evidence → paper → methods → theory/test → open research problem**

rather than horizontally into an undifferentiated bibliography.

---

## 6. Citation integrity rule

Every bubble must answer two questions:

> **What does this citation support?**

and

> **What would be an overclaim based on this citation?**

That second field is mandatory.

It is especially important for bioelectricity, resonance, predictive processing, cultural convergence, causal emergence, and philosophy/theology where a reader can easily extend a legitimate source beyond its actual evidence.

---

## 7. Initial source dossiers to prioritize

- major evolutionary transitions / individuality;
- conflict suppression during transitions;
- biological individuality philosophy;
- causal emergence / macro-level causal information;
- higher-level explanation / intervention;
- circadian coupled oscillators and entrainment;
- collective intelligence / distributed cognition;
- multiple independent discovery;
- cultural convergence / cultural attractors;
- gene-culture coevolution;
- religion/science and teleological/cosmological argument ancestry for the God question.

---

## 8. UI rule

The bubble is a summary, not a tooltip-sized bibliography dump.

The deep-dive page is where the reader should be able to go as deep as the project can responsibly support.

The interaction should reward curiosity without interrupting first-pass readability.
