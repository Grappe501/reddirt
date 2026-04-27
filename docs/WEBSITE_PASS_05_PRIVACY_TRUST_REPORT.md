# Website Pass 05 — Public trust and privacy (organizing)

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Depends on:** `docs/WEBSITE_PASS_04_COUNTY_STANDARDIZATION_REPORT.md`; internal guidance in `docs/POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md`, `docs/MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md`, `docs/WEBSITE_UPGRADE_PASSES_AFTER_MESSAGE_SYSTEM.md`, `docs/audits/MESSAGE_AND_NARRATIVE_DISTRIBUTION_SYSTEM_AUDIT.md`

---

## 1. Mission

Ship a **public-facing trust page** that explains—in **plain language**—how the organizing system is meant to protect people: Power of 5 relationships, voter-file **reference** (not browsing), public vs private surfaces, and consent/safety. Avoid **legal overclaims** and **public “AI”** product wording (aligned with Pass 4 language audit and homepage guardrails).

---

## 2. Read-in summary (sources)

| Source | Use |
|--------|-----|
| `WEBSITE_PASS_04_COUNTY_STANDARDIZATION_REPORT.md` | Confirms prior pass scope; no voter/auth changes there; trust page complements county/OIS copy. |
| `POWER_OF_5_RELATIONAL_ORGANIZING_SYSTEM_PLAN.md` | §5 voter reference layer; §6 gamification “avoid”; §12 privacy tiers (public / member / leader / organizer / admin). |
| `MESSAGE_SYSTEM_LANGUAGE_AUDIT_REPORT.md` | Public vocabulary: organizing insights, message support, conversation tools; no “AI” on visitor surfaces. |
| `WEBSITE_UPGRADE_PASSES_AFTER_MESSAGE_SYSTEM.md` | Pass 5 call for privacy/trust pages; cross-link from search and handoffs. |
| `MESSAGE_AND_NARRATIVE_DISTRIBUTION_SYSTEM_AUDIT.md` | §12 privacy risks: aggregates on public dashboards; no voter ids in public builders. |
| `src/app/(site)/privacy/page.tsx` | Structural pattern: `PageHero`, `FullBleedSection`, `ContentContainer`, `pageMeta`; draft-for-counsel framing. |

---

## 3. Deliverables

### 3.1 Route

| Public URL | File |
|------------|------|
| `/privacy-and-trust` | `src/app/(site)/privacy-and-trust/page.tsx` |

**Note:** The page lives under the **`(site)`** route group (same shell as `/privacy`, `/terms`) so header/footer match other public pages. The user-preferred path string `src/app/privacy-and-trust/page.tsx` maps to this URL; the repo convention is `(site)/…` for the marketing shell.

### 3.2 Page sections (all present)

1. **Our promise** — dignity, no spectacle, serious boundaries.  
2. **How Power of 5 uses relationships responsibly** — small trusted circles, aggregates on public geography, healthy gamification.  
3. **What voter-file reference tools are and are not** — reference for organizers vs public search/maps.  
4. **What is public vs private** — public rollups vs volunteer-scoped vs staff tools (high level).  
5. **No public household maps** — explicit.  
6. **No public voter-file browsing** — explicit.  
7. **Consent and safety** — opt-out, norms, reporting (no guarantee to fix every interpersonal case).  
8. **How to ask questions** — links to `/privacy`, `/get-involved`.

Opening callout cross-links **Privacy** (counsel draft), **Terms**, **Disclaimer**. Hero subtitle states the page is **not a substitute** for counsel-reviewed legal policies.

### 3.3 Discovery

| Change | File |
|--------|------|
| Footer item **Trust & organizing data** → `/privacy-and-trust` | `src/config/navigation.ts` |
| Semantic search chunk `route:/privacy-and-trust` | `src/lib/content/fullSiteSearchChunks.ts` |

---

## 4. Guardrails honored

- **Plain language**; no statutory citations or “we guarantee” legal claims.  
- **No public “AI”** wording on the page.  
- **No** description of live product behavior that is not yet shipped; uses “expectations,” “when we use,” and “goals” where appropriate.  
- Aligns with internal docs: **aggregate-first public OIS**, **voter file as stewarded reference**, **no public household maps / no casual voter browsing**.

---

## 5. Verification

From `RedDirt/`:

```bash
npm run check
```

(Lint + `tsc --noEmit` + `next build`.)

---

## 6. Follow-ups (not in this pass)

- Counsel review: align any overlapping sentences with finalized Privacy/Terms.  
- Optional: one-line cross-link from `/privacy` body to `/privacy-and-trust` for parity.  
- When `/dashboard` gains real sessions, add a short “your data” callout linking here at account handoff (per upgrade pass notes).

---

**End of report.**
