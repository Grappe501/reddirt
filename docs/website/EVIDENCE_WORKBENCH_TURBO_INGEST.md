# Evidence Workbench — Turbo Ingest Pass

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)

## Goal

Major automation toward fully automated intake: **identify proposals + website-fit rankings** against live homepage / journey / albums / From the Road inventory — with human confirm before Approve.

## Operator path

```text
Drop stills → Intake (optional)
        │
        ▼
Turbo: Identify + Fit
  · heuristic and/or OpenAI geography proposals
  · score against live website surfaces
  · write turbo-ingest-proposals.json only
        │
        ▼
Photos tab → review Turbo card → Apply identify / fit flags
        │
        ▼
Save → Approve / Homepage (existing Pass 9 controls)
```

## Website surfaces scored

homepageGallery · acrossArkansas · journey · countyAlbums · fromTheRoad · meetKelly · hero · kellySpeaks (video note)

Inventory uses the same selectors RSC pages use (`listCampaignPhotosLive` + strategic placement helpers).

## Acceptance

- [x] Surface catalog + live inventory
- [x] Fit scorer (Unknown blocks geo surfaces)
- [x] Turbo orchestrator (heuristic + optional AI)
- [x] Proposal store `data/campaign-media/turbo-ingest-proposals.json`
- [x] Intake UI: Turbo buttons + dashboard
- [x] Photos UI: Turbo fit card + Apply
- [x] AI tools: inventory / score / turbo_ingest / apply_turbo
- [x] Never silent Approve / homepage publish from turbo apply
- [x] Smoke: `scripts/smoke-turbo-ingest.ts`

## Deferred (true full auto)

- Auto-Approve / auto-mutate curated `HOMEPAGE_*` ID tables
- Draft → registry graduation
- Owned Media bridge

## Commit

| Pass | Commit | Note |
| --- | ---: | --- |
| Turbo Ingest | *(pending)* | Identify + website-fit automation |
