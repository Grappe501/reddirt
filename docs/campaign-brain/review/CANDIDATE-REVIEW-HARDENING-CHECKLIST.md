# Candidate Review Hardening Checklist

Use when Kelly, Ernie, or Steve reviews the Election Plan or Executive Book live.

## Key presentation line (county party intelligence)

> This is not pretending every county page is perfectly current. It ingests public data, flags what is verified, flags what needs a phone call, and turns county party information into an actionable routing plan.

## Expected objections — and where to look

| Objection | What to check |
|-----------|----------------|
| Is this final or proposed? | Labels: **locked** · **proposed** · **scheduled** · **intelligence** · **needs verification** |
| Where did this number come from? | Source path on panel footer · Executive Book disclaimer · county victory targets cite win-target scenario |
| Who owns this? | Org chart · responsibility matrix · meeting action items |
| What happens this week? | Monday leadership · weekly packet · weekly dashboard |
| What is public vs internal? | Election Plan is password-gated · public site is separate · ArkDems data is public source |
| What is verified vs needs confirmation? | County party `needsHumanVerification` · meeting candidates marked **proposed** |
| What does a county leader do with this? | County playbook victory target + party intelligence + recommended action |
| What is the source of meeting data? | [Arkansas Democrats county pages](https://www.arkdems.org/counties/) · scrape timestamp on panel |
| What if a county party page is outdated? | **Call the chair.** Never auto-schedule from scrape alone. |

## PageBrief standard (every drill-down)

1. **What is this?** — one sentence
2. **Why does it matter?** — one sentence tied to votes or execution
3. **What do we do next?** — one concrete action with owner type

## Label dictionary

| Label | Meaning |
|-------|---------|
| Locked | On calendar · leadership confirmed |
| Proposed | Planning target · needs approval |
| Scheduled | On calendar · not yet confirmed attended |
| Intelligence | Ingested public data · not verified by phone |
| Needs verification | Do not schedule until chair confirms |

## County party intelligence rules

- Public ArkDems.org data only
- Cite source URL + fetch date
- Do not expose Cloudflare email-protection links as contact emails
- Do not auto-email chairs from the platform
- Parseable meeting dates are **candidates** until confirmed

## Search rules

- Keyword search is default
- AI answer (if enabled) must cite local source paths and public URLs
- AI must say **Needs human verification** when confidence is low
- AI cannot access admin, donor, voter, or private contact corpora

## Review pass order

1. Weekly Dashboard — stale metrics?
2. County playbook — victory target + party panel readable in 60 seconds?
3. Executive Book Ch. 6 — county math in local language?
4. County parties hub — verification flags obvious?
5. Search — try “Searcy County chair”, “budget”, “direct democracy”
