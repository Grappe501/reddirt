# Evidence Workbench — Intake upgrade (one pass)

**Status:** Complete  
**Lane:** `RedDirt/` only  
**Parent:** [`EVIDENCE_ENGINE.md`](./EVIDENCE_ENGINE.md)  
**Prior board (locked):** [`EVIDENCE_WORKBENCH_10_PASS_UPGRADE.md`](./EVIDENCE_WORKBENCH_10_PASS_UPGRADE.md)

## Goal

Make photo intake **simple and strong**: one drop folder → one Intake action → Photos queue → Save → Approve.

## Operator path (locked)

```text
Drop stills into public/media/campaign-photos/   (subfolders OK)
        │
        ▼
Intake all new   (UI or npm run evidence:intake)
  · flatten nested copies (never delete sources)
  · queue drafts in photo-ingest-drafts.json
        │
        ▼
Photos tab → Draft / Unknown → confirm geography → Save
        │
        ▼
Approve / Homepage / Featured   (batch publish; undoable)
```

## Language (locked)

| Word | Meaning |
| --- | --- |
| **Intake** | Disk → labeling queue (drafts). Not public. |
| **Save** | Write geography / evidence overlay. |
| **Approve** | Raise public flags for albums. |
| **Promote (derivative)** | Photos tab only — point `publicSrcOverride` at a derivative. Different from Intake. |

## Acceptance

- [x] Nested dumps intake without a separate flatten CLI
- [x] One primary UI button: **Intake all new**
- [x] Single-file **Add to queue** also flattens nested
- [x] Intake status cards (on disk / queue / next step)
- [x] `npm run evidence:intake` wraps the same lib path
- [x] AI tools: `get_photo_intake_status`, `intake_all_photos` (confirm required)
- [x] Photos deep-link `?tab=photos&filter=draft`
- [x] Smoke: `scripts/smoke-photo-intake.ts`
- [x] Docs updated in EVIDENCE_ENGINE

## Out of scope (wall)

- Owned Media watcher / Prisma `OwnedMediaAsset`
- Legacy `campaign-trail` / `photos:sync`
- Automatic graduation into `campaign-photo-registry.ts` (live paths already merge drafts)

## Commit

| Pass | Commit | Note |
| --- | ---: | --- |
| Intake | *(pending)* | Unified flatten+queue intake; basename reuse (no -2/-3 dupes) |
