# County candidate briefs & public planning pages — 75-county rollout plan

**Status:** Plan — in motion (Pope live; NWA staff brief; hub at `/county-briefings`).  
**App:** `RedDirt` (Kelly Grappe for SOS) · **Sister:** `countyWorkbench` (Pope-first portal, separate deploy).  
**Last updated:** 2026-04-26.

---

## 1. What we are building (two layers)

| Layer | Audience | What it is |
|------|-----------|------------|
| **A. Public planning briefing** (this site) | Voters, press, volunteers | **Aggregate-only** political profile, honest data gaps, GOTV *illustrations* — `/county-briefings/{slug}`. No PII. |
| **B. Staff / CM candidate brief** (admin) | Steve, regional leads, comms | **Dense** one-pager: strategy, opposition bills, KPI slots — `/admin/candidate-briefs/...` from `docs/briefs/*.md`. |
| **C. County workbench** (sister) | County teams, organizers | **Dashboards**, registration goals, static exports — not in this DB. Linked via `NEXT_PUBLIC_COUNTY_WORKBENCH_URL`. |

**Rule:** No voter-level data on public. Internal briefs may reference model tiers; still no export of PII in markdown committed to a wide-access branch.

---

## 2. Sequencing (suggested)

1. **Template lock** — One **county public page** pattern (`pope`); one **admin markdown viewer** pattern (`candidate-briefs/[slug]`).  
2. **Data** — FIPS in `County`, election results ingest, optional ACS/BLS for demographics; **Pope** first, then **NWA** (Benton + Washington) public stub or deep link to staff NWA brief.  
3. **Scale** — Add counties in **waves** (e.g. River Valley, Central, NWA, Delta) based on field priority — not 75 at once.  
4. **QA** — Per county: `npm run build`, spot-check `lang`, no absolute disk paths, counsel on election-adjacent claims.

---

## 3. File and route conventions

| Output | Path |
|--------|------|
| Public hub | `src/app/county-briefings/page.tsx` |
| Public county (dynamic later) | `src/app/county-briefings/[countySlug]/page.tsx` *(future; today `pope` is static)* |
| Staff brief markdown | `docs/briefs/KELLY_*_CANDIDATE_BRIEF.md` |
| Admin list | `src/app/admin/(board)/candidate-briefs/page.tsx` — add a row per shipped brief |
| County record | Prisma `County` (slug, fips, published, `heroIntro`, …) |

**Slug** — use `pope-county`, `benton-county`, … consistent with `src/content` and festivals.

---

## 4. Checklist per new county (public + optional staff brief)

- [ ] `County` row seeded or created in admin; **FIPS** correct (5 char).  
- [ ] `published: true` when copy approved.  
- [ ] `buildCountyPoliticalProfile` or dedicated builder wired; **empty states** if data missing.  
- [ ] Staff brief file added; entry in `BRIEFS` array in candidate-briefs page (if needed).  
- [ ] `npm run build` green; internal review on opposition lines (arkleg verify).

---

## 5. County workbench connection

- **Link only** from RedDirt — `siteConfig.countyWorkbenchUrl` — no shared production DB.  
- **Zip / static exports** (`emit:pope-county-intel`, `dist-county-briefings/pope`) are **packaging** for mirror sites; not a substitute for Prisma data on RedDirt.

---

## 6. Style hub

- **Admin:** `/admin/style-guide` — index to this doc, public copy guide, and brand folder references.

---

*Maintainers: when a new county goes live on the public hub, add it to `BRIEFINGS` in `county-briefings/page.tsx` and bump the “coming” blurb if needed.*
