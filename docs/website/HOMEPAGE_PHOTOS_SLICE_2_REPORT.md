# KELLY-HOMEPAGE-PHOTOS-SLICE-2.0 — completion report

**Authority:** `docs/website/HOMEPAGE_PHOTOS_SLICE_2_ERNIE_BRIEF.md`  
**Baseline commit:** `05002b88`  
**Branch:** `feature/kelly-schedule-settlement-dashboard`

---

## BUILD RETURN summary

See chat BUILD RETURN for the numbered fields. This file is the durable record.

### Curated set (8 FEATURE)

| Photo ID | Filename | City | County | County attach | Primary placement |
|----------|----------|------|--------|---------------|-------------------|
| `afl-cio-pre-event-networking-20260629` | `20260629_103631.png` | Unknown | Unknown | NO | Latest Campaign Photos / future endorsement |
| `mena-polk-meet-greet-20260411` | `20260411_112755.png` | Mena | Polk | YES `/counties/polk` | Latest + Meet Kelly |
| `war-memorial-stadium-concourse-20260320` | `20260320_100940.png` | Little Rock | Pulaski | YES | Latest Campaign Photos |
| `toad-suck-daze-toad-race-20260501` | (registry) | Conway | Faulkner | YES | Latest Campaign Photos |
| `johnson-county-peach-festival-parade-20260718` | (registry) | Clarksville | Johnson | YES | Latest Campaign Photos |
| `watermelon-festival-booth-service-20260725` | (registry) | Cave City | Sharp | YES | Latest Campaign Photos |
| `stone-porch-door-conversation-20260301` | `20260301_124500.png` | Unknown | Unknown | NO | Latest Campaign Photos |
| `elks-lodge-breakfast-table-20260228` | `20260228_104908.png` | Unknown | Unknown | NO | Latest Campaign Photos |

### Decisions

- **Meet Kelly still:** YES — `mena-polk-meet-greet-20260411`
- **Hero still:** NO — none meet HERO quality; legacy hero retained
- **Track C / Shorts / admin merge / endorsements / news:** not added

### Selector

`src/content/media/homepage-campaign-photos.ts` — ordered ID allowlist; requires `homepageCandidate: true` + FEATURE/HERO.

### UI

`TrustFunnelCampaignPhotosSection` after Meet Kelly in `HomeTrustFunnelWireframe`.

### QA

- `agents:test-homepage-photos-slice2` PASS
- `agents:test-homepage-polish-slice1` PASS
- `agents:test-campaign-photos` PASS
- `typecheck` PASS
- Local `next build` — **not completed** on this agent host (compile hung / heap pressure after ~25+ min). Slice 1 previously built green on the same branch family; re-run build on a clearer machine before production claim.

### Git

- Commit: `c4d6e3a4`
- Pushed to `feature/kelly-schedule-settlement-dashboard`
- Production redeploy: not attempted (Netlify Lambda 400 + slice rule)
