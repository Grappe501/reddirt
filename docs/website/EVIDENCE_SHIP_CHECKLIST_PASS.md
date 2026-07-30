# Evidence Ship Checklist Pass

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)  
**Audit item:** #2 Local confirm ≠ production ship (P0)

## Goal

Close the integrity loop: operators can see **exactly what still needs to be committed/deployed** after local Approve — dirty `data/campaign-media/` + `campaign-photos` paths, gitignored derivative warning, checklist gates, commit message template, and a **draft→registry stub** (never silent registry rewrite).

## Operator SOP

```text
1. Publish Queue → Save / Approve locally
2. Workbench → Ship tab → Refresh ship report
3. Review checklist + dirty paths (sizes only)
4. If overlays dirty: git add data/campaign-media/ (no secrets) → commit (use template) → push → Netlify
5. If new photos dirty: also add public/media/campaign-photos/ paths
6. Remember: public/media/campaign-derivatives/** is gitignored — Pro Edit packs do NOT ship via git alone
7. Optional: Write registry graduation stub → paste into campaign-photo-registry.ts after Steve confirms
```

## What shipped

| Piece | Role |
| --- | --- |
| `evidence-ship-report.ts` | Git porcelain watch + checklist + stub writer |
| `EvidenceShipPanel.tsx` | Ship tab UI |
| Actions | `buildEvidenceShipReportAction`, `writeRegistryGraduationStubAction` |
| AI tools | `build_evidence_ship_report`, `write_registry_graduation_stub` |
| Store | `data/campaign-media/evidence-ship-reports.json` |
| Stub | `data/campaign-media/registry-graduation-stub.md` |
| Smoke | `scripts/smoke-evidence-ship-checklist.ts` |

## Acceptance

- [x] Dirty path report for `data/campaign-media` + `campaign-photos`
- [x] Gitignored derivative scan warning
- [x] Checklist: overlays · albums · needs-approval · binaries · commit state
- [x] Commit message template
- [x] Draft→registry stub only (no silent registry mutate)
- [x] Smoke lists synthetic dirty marker
- [x] Docs note on EVIDENCE_ENGINE
- [x] AI tools + brain rules

## Explicit out of scope

- Auto-commit / auto-push  
- Silent rewrite of `campaign-photo-registry.ts`  
- Auto-mutate curated `HOMEPAGE_*`  
- Changing Netlify deploy to include gitignored derivatives  

## Commit

| Pass | Commit | Note |
| --- | ---: | --- |
| Ship Checklist | _(this pass)_ | Ship tab + dirty path report + graduation stub |
