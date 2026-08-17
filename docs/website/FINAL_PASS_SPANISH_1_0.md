# FINAL-PASS-SPANISH-1.0 — Voter-Critical Arkansas Spanish

**Doc ID:** FINAL-PASS-SPANISH-1.0  
**Lane:** `RedDirt/`  
**Status:** Wired for voter-critical slice — native review pending on some body copy  
**Updated:** 2026-08-17

## Target outcome

A Spanish-speaking Arkansas voter can arrive at the site, understand who Kelly is, register or find voting information, volunteer, join the campaign, or invite Kelly **without being thrown back into English halfway through the task**.

Spanish is a **voter-access product**, not a promise that all 158+ public pages are bilingual on day one.

## Governing rules

1. **English is canonical.** Spanish exists only where an approved translation exists.
2. **No raw machine translation goes public.** AI may draft; every string carries review state: `draft → native_review → approved`.
3. Only `native_review` and `approved` Spanish renders on the public site. `draft` always falls back to English.
4. **Graceful fallback:** missing Spanish page copy shows English — never auto-generated filler.
5. **Arkansas conversational Spanish** — not Spain Spanish. Use `usted` for public civic tone unless a page explicitly targets youth voice.
6. **Canonical glossary:** `src/i18n/glossary.ts` (Secretary of State, voter registration, ballot initiative, polling place, county, election, volunteer, etc.).

## Architecture (extensible, page-by-page)

| Piece | Path | Role |
| --- | --- | --- |
| Locale types + review states | `src/i18n/types.ts` | `AppLocale`, `TranslationReviewStatus` |
| Path helpers | `src/i18n/path.ts` | `/es` prefix, `withLocaleHref`, English-only exclusions |
| Resolver | `src/i18n/resolve.ts` | Approved-string lookup with English fallback |
| Glossary | `src/i18n/glossary.ts` | Shared civic terms |
| Site chrome | `src/i18n/chrome.ts` | Header, footer, nav labels |
| Form copy | `src/i18n/forms/public-forms.ts` | Join, volunteer, Invite Kelly form UI |
| Middleware | `src/middleware.ts` | `/es/*` rewrite + `x-locale` header |
| Language switch | `src/components/i18n/LanguageSwitcher.tsx` | **English \| Español** in header + mobile menu |

**URL model:** `/es` hub + `/es/voter-registration`, `/es/get-involved`, etc. Same route tree as English; middleware rewrites and sets locale. No duplicated page files per language.

## Release scope (FINAL-PASS-SPANISH-1.0)

### In scope — ship this pass

| Surface | English route | Spanish route |
| --- | --- | --- |
| Language switch | header + mobile | header + mobile |
| Voter hub | `/es` (existing) | expanded hub |
| Voter registration | `/voter-registration` | `/es/voter-registration` |
| Get involved (join + volunteer) | `/get-involved` | `/es/get-involved` |
| Volunteer onboarding | `/volunteer` | `/es/volunteer` |
| Invite Kelly form | `/schedule` | `/es/schedule` |
| Invite Kelly pathway (layer 1–3) | `/events/request/*` | `/es/events/request/*` |
| Bilingual chrome | nav, footer, CTAs | when locale is `es` |

### Post-launch expansion (not this pass)

- Meet Kelly (`/about` tree)
- My Plan (`/priorities`)
- Secretary of State / office explainer (`/understand`, `/office/*`)

### Explicit exclusions (this release)

| Surface | Rule |
| --- | --- |
| From the Road | English (Substack journal stays English) |
| Press coverage | Original language of coverage |
| Event titles / proper names | Do not translate |
| Admin / operator tools | English only |
| Privacy / terms / disclaimer | No improvised legal Spanish — counsel when ready |
| Direct Democracy commitment form | Not mounted — out of scope |

## Review workflow for new strings

1. Author drafts in `src/i18n/**` with `status: "draft"`.
2. Native Arkansas Spanish reviewer sets `native_review` or `approved`.
3. Only then does `resolveLocalizedString` return Spanish on the public site.

## Success check (Steve / operator)

- [ ] Header shows **English | Español** on desktop and mobile.
- [ ] `/es/voter-registration` — hero, CTAs, and key voter-ed copy in Spanish; chrome in Spanish.
- [ ] `/es/get-involved#join` and `#volunteer` — form labels, validation, success in Spanish.
- [ ] `/es/schedule` — Invite Kelly form in Spanish through submit confirmation.
- [ ] `/from-the-road` and `/press-coverage` stay English when linked from Spanish nav (no machine fill).
- [ ] No `draft` strings visible on production.

## Electd note

When Electd hosted forms replace native forms, Spanish form labels should follow the same glossary and review states in the Electd packet (`docs/partners/electd/`).
