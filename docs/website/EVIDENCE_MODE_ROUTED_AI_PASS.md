# Evidence Mode-Routed AI Brain Pass

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)  
**Audit item:** #5 AI + UI mode routing (P1)

## Goal

~40 tools + 4 rounds made Suggest with AI a God surface. Operators now pick a **mode** so the brain only sees the tool subset for that closed loop — Identify · Fit · Photo prep · Video prep · Publish · General.

## Operator SOP

```text
1. Photos or Videos tab → AI mode pills
2. Choose Identify (default) for county/event/proof
3. Fit for website surfaces / placement propose
4. Photo prep / Video prep for derivatives / excerpts / Pro Edit assist
5. Publish for queue / batch flags / ship / curated apply (still confirm-gated)
6. Suggest with AI (mode) → review → Save / explicit confirm tools
```

## What shipped

| Piece | Role |
| --- | --- |
| `evidence-ai-modes.ts` | Mode meta, tool allow-lists, systemExtra |
| `evidenceAiToolsFor(kind, mode)` | Filters OpenAI tool schemas |
| `runEvidenceAiBrain({ mode })` | Mode rounds + mode Extra + toolCount |
| Suggest actions | `suggestPhotoEvidenceAiAction(id, mode?)` / speech twin |
| `EvidenceAiModeSelector` | Mode pills |
| `EvidenceAiModePanel` | Photos/Videos mode section + next-step loop |
| Workbench catalog | Mode chip summary above full tool list |
| Smoke | `scripts/smoke-evidence-ai-modes.ts` (no OpenAI) |

## Modes

| Mode | Photo tools (approx) | Video tools (approx) |
| --- | --- | --- |
| identify | Grounding + similar + file basics | Grounding + speech registry + transcript |
| fit | Surface inventory + fit score + curated propose | Readiness + speech placement propose |
| photo_prep | Crop / derivative / Pro Edit | — (hidden) |
| video_prep | — (hidden) | Prep / encode / Pro Edit |
| publish | Queue / batch publish / ship / curate apply | Speech confirm queue / batch publish |
| general | Full kind surface | Full kind surface |

## Acceptance

- [x] Modes: identify · fit · photo_prep · video_prep · publish · general
- [x] Tool subsets strictly smaller than general for closed modes
- [x] Identify excludes publish/encode tools
- [x] Photo UI hides video_prep; Videos UI hides photo_prep
- [x] Mode systemExtra appended to brain SYSTEM
- [x] Photos + Speeches mode panel (selector + mode loop) + Suggest label shows mode
- [x] Batch AI uses identify (or fit); other modes coerce to identify
- [x] Identify includes turbo/queue tools for Unknown backlog assist
- [x] Smoke without OpenAI (allow-list ⊆ schemas)
- [x] Docs on EVIDENCE_ENGINE

## Explicit out of scope

- Removing confirm* gates  
- Auto-Approve / invent geography  
- Splitting God panels into separate routes (mode sections only)  
- Changing turbo ingest pipeline core (identify mode can call turbo tools)  

## Commit

| Pass | Commit | Note |
| --- | ---: | --- |
| Mode-routed AI | `b6ce9086` | Mode subsets + UI panel + smoke |
