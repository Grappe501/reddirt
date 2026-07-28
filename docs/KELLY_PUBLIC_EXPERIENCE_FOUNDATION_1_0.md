# KELLY-PUBLIC-EXPERIENCE-FOUNDATION-1.0

**Phase:** 1 — Public Media Bridge and Intake Enrichment  
**Lane:** `H:\SOSWebsite\RedDirt`  
**Status:** Phase 1 implementation  
**Baseline branch:** `feature/kelly-schedule-settlement-dashboard`  
**Baseline HEAD (start):** `e0b901323c530192d28c1ffe3e9e2a28d50aacf4`

---

## 1. Build identity

Connect the existing `OwnedMediaAsset` DAM and existing `POST /api/forms` intake pipeline to the public-site experience **without replacing either system**. This foundation must exist before homepage personality / cinematic media work (`KELLY-HOMEPAGE-PERSONALITY-1.0`).

## 2. Problem statement

The public site still resolves imagery primarily through a static `ContentImage` / brand-media registry, while campaign binaries and governance live in Owned Media. Public forms already create `User` + `Submission` + `WorkflowIntake`, but do not reliably write channel consent, intake audit actions, or normalized volunteer interests. Without a bridge, every page reinvented media and intake logic.

## 3. Existing architecture (baseline)

| Area | Canonical pieces |
|------|------------------|
| DAM | `OwnedMediaAsset`, Media Center (`/admin/owned-media`), Supabase + local storage, SHA-256 `ingestContentSha256`, `approvedForPublicSite`, derivative job **planning** |
| Public stills | `src/content/media/registry.ts`, `ContentImage`, Squarespace / `/public` fallbacks |
| Forms | `POST /api/forms` → `persistFormSubmission` → User email upsert → Submission → WorkflowIntake |
| Consent store | `ContactPreference` (`emailOptInStatus`, `smsOptInStatus`) — not written by public join/volunteer |
| Audit | `WorkflowAction` on intakes — not created on public form create |
| Interests | Free-form `User.interests` string arrays + volunteer preferredRole tokens |

**Unrelated dirty worktree (do not commit):** `scripts/netlify-enforce-env-scopes.cjs`, election-plan / volunteer middleware, `src/middleware.ts`.

## 4. Canonical system decisions (locked)

- `OwnedMediaAsset` remains canonical managed media.
- Static `ContentImage` remains supported during transition.
- Public resolution prefers an approved owned placement, then falls back to static.
- A placement is **not** approval; `approvedForPublicSite` remains mandatory.
- Public slots are typed and explicit (`pageKey` + `slotKey`).
- Focal points affect presentation only (normalized 0–1).
- Email remains the public identity upsert key.
- Human merge remains required for ambiguous people.
- Consent must be explicit and recorded; no inferred opt-in.
- `WorkflowIntake` remains mandatory on successful public persist.
- Public submissions add audit/interaction history via `WorkflowAction`.
- No automatic outreach.

## 5. Scope (Phase 1)

- Focal-point fields on assets + placement overrides
- Typed home page slots + `PublicMediaPlacement` graph
- Public media resolver + ContentImage transitional bridge
- Minimal Media Center placement admin
- Executable WEB_JPEG + THUMBNAIL derivative worker path
- Media diagnostics helper
- Join/volunteer consent → `ContactPreference`
- Create-path `WorkflowAction`
- Volunteer interest taxonomy + normalization
- Focused tests + operator docs in this packet

## 6. Non-goals

Homepage cinematic bands; autoplay video; perceptual dedupe; Person table; second form API; automatic merges; automatic email/SMS; Hot Wash merge; full page composer; Invite-Kelly / newsletter full unification beyond contract fields.

## 7. Data model changes

- `OwnedMediaAsset.focalX` / `focalY` (`Float?`, 0–1)
- Enum `PublicMediaPlacementKind`
- Model `PublicMediaPlacement` (page/slot → asset, window, overrides, enabled)

## 8. Public media resolution flow

1. Validate page + slot against registry  
2. Load enabled placement in publication window  
3. Fail closed unless `approvedForPublicSite` (via `canPublicReadOwnedMedia` rules)  
4. Resolve WEB/THUMB derivative (or safe source URL)  
5. Apply focal precedence: placement → asset → 0.5/0.5  
6. Else fall back to static `ContentImage` / MediaRef  

## 9. Placement and focal-point doctrine

Focal points are presentation metadata. Placement overrides exist so one asset can crop differently per slot without mutating the asset default.

## 10. Approval and publication gates

Publishable only when: placement enabled, asset exists, not archived/rejected, `approvedForPublicSite` (or legacy `isPublic`+`APPROVED` via existing helper), window valid, derivative ready or documented safe fallback.

## 11. Derivative-generation flow

Reuse `OwnedMediaDerivativeJob` + `planDefaultDerivativeJobsForSource`. Worker claims `PLANNED`/`QUEUED` jobs for `WEB_JPEG` and `THUMBNAIL`, writes child `OwnedMediaAsset` rows with lineage, marks job `SUCCEEDED`/`FAILED`.

## 12. Public intake flow

Unchanged spine: User upsert → Submission → WorkflowIntake. Phase 1 adds consent writes, WorkflowAction, interest normalization for `join_movement` and `volunteer`.

## 13. Consent doctrine

| Situation | Behavior |
|-----------|----------|
| Missing consent field / false | Do not create OPT_IN |
| Explicit email consent true | Upsert email OPT_IN with source + timestamp notes |
| Existing OPT_OUT + no re-consent | Preserve OPT_OUT |
| Existing OPT_OUT + explicit email consent | Record OPT_IN with auditable source (`public_form_reconsent`); note in WorkflowAction |
| SMS consent without phone | Do not OPT_IN SMS; flag in metadata |
| SMS consent with phone | OPT_IN SMS when phone present |

## 14. Interaction/audit doctrine

On successful join/volunteer create: `WorkflowAction` kind `OTHER` (or NOTE), actor null (public/system), summary + safe metadata (formType, sourcePage, consent summary, interest keys). No raw request dump.

## 15. Interest taxonomy doctrine

Canonical keys in code (`volunteer-interest-taxonomy.ts`). Unknown tokens map to `other` + free-text notes preserved. No auto organizer assignment.

## 16. Identity and deduplication posture

Email-only upsert. No phone/name auto-match. Future richer resolution goes through People / REL governance.

## 17. Privacy and security

Reuse honeypot + IP rate limit. No private storage keys in public resolver output. Prefer `/api/owned-campaign-media/[id]/file` style public paths. Redact emails in submission `raw` fields (existing).

## 18. Failure behavior

Resolver: fail closed → static fallback. Intake: do not return success without WorkflowIntake. Consent/action failures after intake should be logged and recoverable; prefer same transaction where practical.

## 19. Rollback plan

1. Disable placements (`enabled=false`) or delete Phase 1 placement rows.  
2. Revert migration / drop `PublicMediaPlacement` + focal columns if needed.  
3. Redeploy prior commit; static ContentImage path remains.  
4. Consent fields are additive; opt-outs remain authoritative.

## 20. Validation commands

```bash
cd H:/SOSWebsite/RedDirt
node scripts/run-with-h-drive-env.cjs npm run typecheck
node scripts/run-with-h-drive-env.cjs npm run lint
npm run stack:migrate
npx tsx scripts/test-public-experience-foundation-phase1.ts
```

## 21. Track C entry criteria

See build return gate table. Homepage personality (`KELLY-HOMEPAGE-PERSONALITY-1.0`) starts only when gates pass.

## 22. Deferred Phase 2 items

Cinematic homepage bands; Kelly Across Arkansas wall; AI alt-text; perceptual dedupe; Person abstraction; phone matching; auto nurture; newsletter/invite unification; donation identity; bulk archive ingestion.

## 23. Files changed (Phase 1)

See git commit for authoritative list. Core additions:

- `docs/KELLY_PUBLIC_EXPERIENCE_FOUNDATION_1_0.md`
- `prisma/migrations/20260727200000_public_experience_foundation_phase1/`
- `src/lib/public-media/*`
- `src/lib/owned-media/process-derivative-jobs.ts`
- `src/lib/forms/public-form-consent.ts`, `public-form-audit.ts`, `volunteer-interest-taxonomy.ts`
- `src/components/media/PublicSlotImage.tsx`
- `src/app/admin/(board)/owned-media/public-placements/page.tsx`
- Form schema/handler enrichments

## 24. Final build return

### Migration status

**Phase 1B (2026-07-28):** Failed `20260719160000_google_oauth_and_routes` reconciled via **Path B** (`migrate resolve --rolled-back`; `applied_steps_count=0`). `npm run stack:migrate` applied `20260727200000_public_experience_foundation_phase1`. See [`KELLY_PUBLIC_EXPERIENCE_PHASE_1B_MIGRATION_REMEDIATION.md`](./KELLY_PUBLIC_EXPERIENCE_PHASE_1B_MIGRATION_REMEDIATION.md).

**Track C:** Remains **CLOSED** until Netlify production redeploy + public form smoke against PascalCase `"Submission"` (see Phase 1B/1C reports). Local Submission/User parity was reconciled in Phase 1C.

**Approved Track C video inputs (documented only; homepage canon LOCKED):** see Phase 1C §15, `docs/KELLY_SPEAKS_MEDIA_LIBRARY_ARCHITECTURE.md` (living documentary · Story Engine · Kelly In Her Own Words), and `data/public-experience/kelly-homepage-personality-approved-videos.json`. Locked homepage: `eKVz5pFJxtk`, `aO712RsR0pQ`. Also registered: `Hl_n-A9aL1s`, `KZ33iSxZ0ZQ`, `SrzDUJBvFrs`. Track C remains CLOSED.

### Track C entry gates (partial)

| # | Gate | Status |
|---|------|--------|
| 1 | Typed slots | Pass (code) |
| 2 | Approved resolution | Pass (code; needs migrate for DB proof) |
| 3 | Static fallback | Pass |
| 4 | Focal points | Pass (helpers + schema) |
| 5–6 | WEB/THUMB worker | Pass (code path; needs migrate + source assets) |
| 7 | Media Center assign UI | Pass (`/admin/owned-media/public-placements`) |
| 8 | Fail closed | Pass |
| 9–12 | Intake enrichments | Pass (code; DB migrate for full E2E) |
| 13 | No competing systems | Pass |
| 14 | Typecheck | Pass |
| 15 | Focused tests | Pass |
| 16 | Build / migrate | See Phase 1B + 1C (local migrate applied; Netlify redeploy pending) |
| 17 | Operator docs | This packet + Phase 1B/1C |
| 18 | Next slice | `KELLY-HOMEPAGE-PERSONALITY-1.0` after Netlify gate + approved video inputs in 1C §15 |

### Recommended next slice

1. Netlify production redeploy on Phase 1C commit; smoke public join/volunteer → `"Submission"`.  
2. Operator smoke: approve asset → run derivative worker → assign slots (still fail-closed).  
3. Only then open **KELLY-HOMEPAGE-PERSONALITY-1.0** using the approved videos in Phase 1C §15.
