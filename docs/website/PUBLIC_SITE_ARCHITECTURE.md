# Public Architecture Freeze v1

**Declared:** 2026-06-10  
**Scope:** `RedDirt/` public-facing site (`src/app/(site)/`, public content, public nav)  
**Supersedes:** ad-hoc homepage/about/office redesign threads through Election Day  
**Internal Victory OS:** **not frozen** — continues on [`VICTORY_OS_DOCTRINE.md`](../campaign-events/VICTORY_OS_DOCTRINE.md)

---

## Public stack (locked)

| Layer | Route(s) | Purpose |
|-------|----------|---------|
| **Trust** | `/` | Homepage trust funnel |
| **Trust** | `/about`, `/about/journey`, `/about/community`, `/about/why-im-running` | Meet Kelly |
| **Competence** | `/understand`, `/office/*` | Secretary of State explainer (3 levels) |
| **Visibility** | `/arkansas`, `/arkansas/counties` | County presence — verified visits only |
| **Action** | `/get-involved`, `/events/request`, `/schedule` | Volunteer + invite Kelly |

**Voter journey (do not reorder without leadership + freeze amendment):**

```text
Homepage → Meet Kelly → Understand the Office → Why I'm Running → Get Involved / Invite Kelly
                                              ↘ Arkansas Presence
```

---

## Allowed without freeze amendment

- Content updates within existing pages (copy, media, approved biography)
- New **approved** biography or policy content slotted into existing routes
- Published public campaign events (calendar + county presence derive from these)
- County visit updates via published events (not manual counters)
- Media / news / editorial additions on existing news routes
- Bug fixes, accessibility, performance, SEO metadata
- Integrity queue and verification matrix updates

---

## Not allowed without freeze amendment

- New major navigation structures or top-level nav groups
- New public microsites or parallel “Meet Kelly” / office frameworks
- Homepage redesigns or trust-funnel re-architecture
- Rewriting the voter journey or adding persuasion layers ahead of competence
- New public frameworks (e.g. second office explainer pattern, new “six questions” variants)
- Exposing Victory OS outputs on public routes (map, decisions, missions, deployment scores)
- Invented stats, county intelligence, or volunteer metrics on public pages

**Rule of thumb:** Every hour spent redesigning the public site is an hour not spent improving Victory OS.

---

## Content integrity (mandatory)

All public copy changes should update:

- [`PUBLIC_CONTENT_APPROVAL_QUEUE.md`](./PUBLIC_CONTENT_APPROVAL_QUEUE.md)
- [`KELLY_BIOGRAPHY_VERIFICATION_MATRIX.md`](./KELLY_BIOGRAPHY_VERIFICATION_MATRIX.md) (biographical claims)

Placeholders only: “Content pending campaign approval”, “Source needed before publication”, or hide — never fake data.

---

## Development priority (post-freeze)

Public site is **not the bottleneck**. Campaign operating system is.

| Priority | System | Notes |
|----------|--------|-------|
| **1** | Victory Map (Sprint 0) | All 75 counties classified — **blocks everything else** |
| **2** | Deployment Priority Engine | Deterministic math only — no UI |
| **3** | Decision Engine | Top 10 **decisions** — not events, not missions |
| **4** | County Mission Framework | Long-term → monthly → weekly → daily |
| **5** | Mission Brief UI | Visualize engine output — **never build dashboard first** |
| **6** | Path to Victory Dashboard | Flagship Campaign OS screen after engine exists |
| **7** | Election Day Operations Center | Separate route, separate doctrine — battlefield, not calendar |

See [`VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md`](../campaign-events/VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md) before Sprint 0.

---

## Related docs

- [`PUBLIC_CONTENT_APPROVAL_QUEUE.md`](./PUBLIC_CONTENT_APPROVAL_QUEUE.md)
- [`WEBSITE_CONTENT_INTEGRITY_AUDIT.md`](./WEBSITE_CONTENT_INTEGRITY_AUDIT.md)
- [`VICTORY_OS_DOCTRINE.md`](../campaign-events/VICTORY_OS_DOCTRINE.md)
