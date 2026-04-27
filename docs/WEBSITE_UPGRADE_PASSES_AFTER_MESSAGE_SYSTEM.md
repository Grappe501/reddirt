# Website upgrade passes (after Message & Narrative system)

**Lane:** `H:\SOSWebsite\RedDirt`  
**Date:** 2026-04-27  
**Purpose:** Ten sequenced, site-wide upgrades that build on the Message Content Engine, Narrative Distribution surfaces, and Power of 5 dashboards **without** collapsing them into a single mega-project. Each pass should ship with `npm run check`, accessibility spot checks on touched routes, and copy review for public trust language.

---

## 1. Navigation and pathway cleanup

Unify primary CTAs across header, footer, and hub pages so volunteers can move **Home → Organizing intelligence → Message hub → Dashboard** (and leader/admin equivalents) without dead ends or duplicate labels. Retire or redirect stale placeholders once county and regional routes stabilize.

---

## 2. Homepage conversion upgrade

Tighten above-the-fold story, proof, and single primary action; align festival/field sections with **field intelligence** vocabulary and ensure every CTA maps to a real route (donate, volunteer, events, message hub). Measure clarity with lightweight content review, not just layout.

---

## 3. County page standardization

Harmonize `/counties/[slug]`, county briefings, and `/organizing-intelligence/counties/[countySlug]` so naming, slugs, and cross-links match. One **content registry** pattern for county narrative blocks; gold-sample (Pope) documented as the template.

---

## 4. Volunteer journey upgrade

Connect onboarding completion, `/messages`, `/dashboard`, and optional auth gates so the journey reads as one story: **train → practice language → take missions → report back**. Add explicit privacy copy at handoff points when accounts or PII appear.

---

## 5. Public trust / privacy page

Publish or refresh dedicated **privacy / data / automation** pages in plain language (counsel-reviewed): what the site collects, what semantic search does, how volunteer tools differ from voter-file tools, and how to opt out or ask questions. Cross-link from Ask Kelly, search, and dashboard demo banners.

---

## 6. Blog / story architecture upgrade

Align **Stories**, blog sync, and the narrative **message hub** so weekly lines and long-form posts have a clear division of labor: durable URLs and editorial workflow vs. volunteer shelf. Avoid duplicate “source of truth” for the same narrative beat.

---

## 7. Regional organizing pages

Complete regional **organizing intelligence** pages with honest geography, shared components, and links into county stubs and message hub regional variants when ready. Reduce Pope-only defaults in copy while keeping one anchor county for training.

---

## 8. Mobile performance and accessibility pass

Audit Largest Contentful Paint, tap targets, and keyboard order on OIS, `/messages`, and dashboards; fix contrast and heading hierarchy on new panels. Treat **demo** banners as first-class content for screen readers.

---

## 9. SEO / content metadata pass

Normalize `metadata`, Open Graph, and canonical paths for new routes (`/messages`, `/dashboard`, `/organizing-intelligence/counties/*`). Ensure titles/descriptions match public vocabulary (no “AI” product framing) and reflect Arkansas SOS campaign context.

---

## 10. Launch readiness and QA pass

End-to-end smoke: admin login, narrative prototype, public hubs, search, forms, and **no accidental demo data** in production builds. Verify `npm run check`, staging content freeze, rollback notes, and a short go/no-go checklist for counsel-sensitive pages (GOTV, finance, legal).

---

**Cross-reference:** [`docs/audits/MESSAGE_AND_NARRATIVE_DISTRIBUTION_SYSTEM_AUDIT.md`](./audits/MESSAGE_AND_NARRATIVE_DISTRIBUTION_SYSTEM_AUDIT.md) for current routes, demo scope, and governance risks.
