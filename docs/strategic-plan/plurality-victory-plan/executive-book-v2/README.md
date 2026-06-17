# Executive Book 2.0 — The Arkansas Way to Win

> **Campaign Operating System manual** · Internal · Election Plan portal

Executive Book 1.x was a leadership briefing. **Executive Book 2.0** is the operating manual for the full Campaign OS:

```text
Campaign Plan  →  Campaign Operating System
```

## Structure

| Part | Chapters | Focus |
|------|----------|--------|
| Doctrine | 0 | Movement philosophy |
| Part I — Victory Strategy | 1–6 | Math, counties, communities, coalitions, PPEN, leadership |
| Part II — Field Operations | 7–10 | County & community workbenches, events, voter engagement |
| Part III — Communications | 11–14 | CCH, SMOS, storytelling, calendar |
| Part IV — Fundraising | 15–17 | FOS, opportunities, leadership |
| Part V — Infrastructure | 18–20 | Onboarding, technology, accountability |
| Part VI — Execution | 21–24 | Immersion, calendar, Labor Day, Election Day |
| Appendices | H+ | Architecture, registries, glossary |

## Portal routes

Each chapter: `/election-plan/executive-book/{slug}`

Hub: `/election-plan/executive-book`

## Build

```bash
npm run campaign-brain:executive-book:v2:scaffold   # chapter scaffolds (this folder)
npm run campaign-brain:executive-book:completion    # v1 JSON companions
npm run election-plan:build
```

V1 prose chapters remain in `../executive-book-v1/` and are linked from the V2 registry where content already exists.
