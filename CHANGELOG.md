# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.8.0] - 2026-04-21

### Added

- One-step local launchers: `npm run dev:full`, `scripts/launch-dev.cjs`, `scripts/dev.ps1`, `scripts/dev.sh`.
- npm scripts: `dev:web`, `dev:db`, `dev:prepare`, `typecheck`, `lint:all`, `check`, `harden`.
- `src/lib/env.ts` for database availability helpers and friendly API error payloads.
- `src/app/not-found.tsx` branded 404.
- Documentation: README, CONTRIBUTING, deployment, quick-start, ADRs, future-pipelines, release template.
- `.editorconfig`, `.gitattributes`, expanded `.gitignore`.
- Footer navigation groups (`footerNavGroups`) for clearer IA.
- Search dialog: focus management, `aria-describedby`, loading/empty states, `ok` on search JSON.

### Changed

- **package version** bumped to `0.8.0` (stabilization / release-engineering track).
- `siteConfig` no longer `as const` (runtime `NEXT_PUBLIC_SITE_URL` strip).
- Header: primary nav from **lg** breakpoint with horizontal scroll + compact type on smaller desktops.
- API `/api/search` and `/api/forms`: **503** with clear message when `DATABASE_URL` is missing.
- Netlify-oriented notes in `docs/deployment.md`.

### Fixed

- Search API success body includes `ok: true` for consistent client parsing.

## [0.1.0] - earlier

Initial public iteration (Scripts 1–5): architecture, pillars, forms, search, organizing, editorial.
