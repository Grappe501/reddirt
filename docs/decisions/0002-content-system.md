# ADR 0002 — Content system

## Status

Accepted

## Context

Editorial velocity requires **structured, grep-friendly content** without a CMS in early phases.

## Decision

- **Stories, editorial, explainers** live in `src/content/**` as TypeScript + typed shapes (`DocumentBlock`, sections, FAQ).
- **Imagery** is referenced via `src/content/media/registry.ts` (paths under `/public/media/...`).
- **Related content** uses shared tag overlap (`src/lib/content/related.ts`) where appropriate.

## Consequences

- Editors comfortable with Git can change copy via PR; others will need a CMS later (Script 6+).
- Renaming slugs requires redirects if URLs are already public.
