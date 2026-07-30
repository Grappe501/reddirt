# Production build log summary

**Pass:** `KELLY-PUBLIC-PRODUCTION-CONFIDENCE-1.0`  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Starting baseline (authorized):** `ffcdbc9b`  
**Working tip at pass start:** `acfc76f5` (includes endorsements + calendar architecture docs after baseline)

## Command

```bash
cd H:/SOSWebsite/RedDirt
node scripts/run-with-h-drive-env.cjs npm run build
```

Log: `H:/SOSWebsite/.local/temp/production-confidence-build.log`  
Rebuild (county degrade): `H:/SOSWebsite/.local/temp/production-confidence-rebuild.log`

## First quiet production build (clean)

| Gate | Result |
| --- | --- |
| Exit code | **0** |
| Next.js | 15.5.15 |
| Environments loaded | `.env.local`, `.env` |
| Compile | ✓ Compiled successfully |
| Type collection / page data | Completed |
| Static generation | Completed |
| Fatal build errors | **0** |
| BUILD_ID | Present (`rAFGAhPNGOz-1Pbq35pJD` on first green build) |

### Contended attempt (documented failure mode)

An earlier attempt hung at “Creating an optimized production build” for ~28 minutes with **no** `.next` progress because a leftover `next` start-server process was holding the tree. Killing that contender and cleaning `.next` restored a normal build (~19 minutes wall clock on H:).

**Operator rule:** Do not run `next build` concurrent with `next dev` / `next start` on this lane.

## Lint / warnings (non-fatal)

Build completed with ESLint **warnings** only (unused vars across OS modules; several `@next/next/no-img-element` on marketing surfaces). **No fatal errors.** Image optimization via `next/image` is a post-launch craftsmanship item — documented under performance, not a launch blocker.

## Typecheck (separate gate)

```bash
node scripts/run-with-h-drive-env.cjs npm run typecheck
```

| Gate | Result |
| --- | --- |
| `tsc --noEmit` | **exit 0** |

## Production serve proof

```bash
node scripts/run-with-h-drive-env.cjs npx next start -p 3457 -H 127.0.0.1
```

Homepage and primary public routes returned **HTTP 200** against this binary (see `ROUTE_VERIFICATION_LEDGER.md`).

## Stabilization rebuilds

1. **Schema degrade:** homepage county CTAs 500’d on local Prisma drift (`counties.createdAt` missing). Hardened `resolveCountyCommandBySlug` / `getCountyPageSnapshot` to registry stub + empty secondary panels.  
2. **Slug alias + href fix:** registry routes use `polk-county`; homepage had linked `/counties/polk`. Added short-slug alias + `homepagePhotoCountyHref` → `resolveRegistryCountyFromLabel`.  
3. **Final quiet rebuild:** exit **0** (`production-confidence-rebuild2.log`). Temporary check script that broke typecheck was removed before green.

### Post-fix production serve

`next start` :3457 — `/counties/polk` and `/counties/polk-county` both **200**; primary route ledger **17/17**.
