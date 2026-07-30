# Campaign photo ingest — launch-first workflow

**Lane:** RedDirt  
**Mode:** FILE_BACKED  
**Priority:** Launch beats infrastructure — structured photo records without a full workbench  

Photos are at least as valuable as videos for authenticity (Kelly with Arkansans across the state).

## What already exists

| Surface | Path |
|---------|------|
| Trail stills (sync pool) | `src/content/media/campaign-trail-photos.ts` |
| Trail use tags | `src/content/media/campaign-trail-photo-use.ts` |
| Brand/still registry | `src/content/media/registry.ts` |
| **Structured photo contract** | `src/content/media/campaign-photo-types.ts` |
| **Structured photo registry** | `src/content/media/campaign-photo-registry.ts` (starts empty) |

Promote trail stills into `CAMPAIGN_PHOTO_REGISTRY` only when captions, alt text, and geography are known.

## Per-upload record

```text
Photo ID / original filename
Basic: dimensions · orientation · type · EXIF date/GPS/camera (if present)
Campaign: event · county · city · venue · date · photographer
People / orgs (only if identified — never invent)
Topics · related video IDs · related pages
Hero level: HERO | FEATURE | SUPPORTING | UNREVIEWED
Homepage candidate / Featured: boolean
Alt · Caption · SEO description
Unknown fields marked Unknown (not guessed)
```

## Hero levels

- **HERO** — Homepage / major landing banners  
- **FEATURE** — Issue, county, story pages  
- **SUPPORTING** — Galleries, documentation, archives  

## County connection

When county/city are known, county pages can select photos via `listCampaignPhotosByCounty` without hard-coding placements.

## Hard rules

- No fabricated counties, events, or people  
- No Track C homepage personality until Track C opens  
- Prefer promoting existing trail assets with real metadata over inventing new copy  
- Full photo workbench deferred until after public launch  

## Next step for Steve

Upload photos (or point at folders under `campaign-media/` / trail sync). Each batch will get structured records + polished alt/caption where content is visible; unknowns stay **Unknown**.
