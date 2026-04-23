# Media Center (Lightroom-style DAM) — phase integration

## 1. Schema (authoritative: `OwnedMediaAsset`)

- **Lineage & naming**: `originalFileName` (camera/import as-seen), `canonicalFileName` (deterministic campaign name from `campaign-filename.ts`), `fileName` (usually aligned to canonical in DB; storage `storageKey` remains object-unique), `importBatchId` **in API =** `mediaIngestBatchId` → **`MediaIngestBatch`** (no second batch table).
- **Triage**: `rating` (0–5, null = not rated in UI we use 1–5 or empty), `pickStatus` (`UNRATED` | `PICK` | `REJECT`), `colorLabel`, `isFavorite`, `stackGroupId`, `parentAssetId` / `rootAssetId`, `derivativeType`.
- **Governance**: `approvedForSocial` (workbench gate), `approvedForPress`, `approvedForPublicSite`, `reviewStatus` / `isPublic` (lifecycle).
- **Media Center review**: `reviewedAt`, `reviewedByUserId` (→ `User`), `reviewNotes` (short handoff; separate from `staffReviewNotes` / `operatorNotes`).
- **Import session**: `MediaIngestBatch` (counts, `metadataJson` duplicate samples, `clientBatchCode`). Local index creates one batch per `indexLocalMediaRoots` run; assets link with `mediaIngestBatchId`.
- **Collections**: `OwnedMediaCollection` + `OwnedMediaCollectionItem` (join only; not a second library).
- **Optional audit / jobs**: `OwnedMediaReviewLog`, `OwnedMediaDerivativeJob` (scaffold for proxies/renditions).

## 2. Naming engine

- Module: `campaign-filename.ts` — `slugifySegment`, `buildCampaignFileStem`, `buildCampaignFileName`, `fingerprintIngestKey`, `extFromFileName`, `buildIngestOriginalCanonicalName`, `buildDerivativeCanonicalFileName`.
- **Ingest (local index)** and **admin upload** set `originalFileName` + `canonicalFileName` and use canonical for `fileName` where applicable.
- **Derivatives**: new rows use `buildDerivativeCanonicalFileName` + `parentAssetId` / `rootAssetId` + `derivativeType` (worker TODO).

## 3. Ingest (local)

- `index-local-roots.ts`: creates `MediaIngestBatch` (`sourceType: LOCAL_FILESYSTEM`), writes assets with `mediaIngestBatchId`, `originalFileName`, `canonicalFileName`, and batch counters (`importedCount`, `duplicateCount`, `failedCount`, `metadataJson.duplicatePathSamples`).

## 4. Media Center UI

- **Grid / list** (`/admin/owned-media/grid`): left **sidebar** (views, collections, batches, workbench link), **toolbar** (search, sort, filters: county, event, source, transcript, press/site, reviewed-at, date range, batch kind), **center** (grid or list), **right inspector** (triage forms, `reviewedAt`, workbench attach, collection add).
- **Previews**: existing preview routes only; no raw `storageKey` in client.

## 5. Search / filters

- `MediaLibraryListFilters` + `queryMediaLibrary` / `buildWhere`: county, event, approvals, transcript, rating, pick, color, source type, issue tag, collection, date (capture or **created/ingest**), ingest batch, unreviewed shortcut, `isReviewed` (on `reviewedAt`), `sort` (updated / capture / import / rating / title), text `q` on title, file, original, canonical, description.

## 6. Social Workbench & Author Studio

- **`SocialContentMediaRef` → `OwnedMediaAsset`**: only join; all attach flows go through `attachOwnedMediaToSocialAction` in `media-library-actions.ts` (governance: `approvedForSocial` or `confirmUnapproved`).
- **Purposes** (`SocialContentMediaRefPurpose`): `SOCIAL_PLAN`, `VIDEO_REPURPOSE`, `VISUAL` — quick actions in `media-center-workbench-attach.tsx`; `PLATFORM_VARIANT` still needs a variant id in the workbench (TODO in UI).
- **Drawers / Author Studio**: reuse `MediaLibraryListItem` + `ownedMediaPreviewUrl` patterns; do not fork a parallel media type.

## TODO (explicit)

- **Smart collections**: evaluate `OwnedMediaCollection.filterJson` in-app; transcript full-text in library; derivative worker rendering; batch triage for multi-select in grid; `PLATFORM_VARIANT` one-click from inspector when `SocialPlatformVariant` list is available in context.
