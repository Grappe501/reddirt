# Kelly adversarial mirror — build plan (candidate-only)

## Purpose

Defensive red-team prep: simulate how **Kim Hammer** and **Michael Packo** would attack **Kelly Grappe** in debate, with a research dossier deeper than opponent modules, plus a full **counter-playbook**.

This is **not** opposition research for broadcast. It is **CANDIDATE_EYES_ONLY**, `NON_PUBLISHABLE`, with explicit `NEEDS_RESEARCH` on court records (no fabricated criminal data).

## Access model

| Layer | Mechanism |
|-------|-----------|
| Staff admin | Existing `ADMIN_SECRET` — required to reach `/admin/*` |
| Hidden entry | Innocuous word **`quorum`** on intelligence hub (county-clerk path blurb) — normal text color, no underline, not in nav |
| Candidate gate | Separate env `KELLY_MIRROR_PASSPHRASE` — 12h httpOnly cookie `kelly_mirror_gate` |

Staff with admin login **cannot** read mirror content without the second passphrase.

## Routes

- Gate + hub: `/admin/intelligence/kelly-mirror`
- API: `POST /api/admin/intelligence/kelly-mirror-gate`
- Data: `data/intelligence/kelly-adversarial-mirror.json`
- Code: `src/lib/intelligence/kellyAdversarialMirror.ts`

**Excluded from:** debate-week nav, hub “Your path” cards, iPad menus, sitemap emphasis.

## Content sections (mirror page)

1. **Research dossier** — 11 finding categories (court, judgments, media, petitions, Stand Up, experience, partisan, spouse, farm, LEARNS shortfall, debate performance)
2. **Hammer red team** — offensive/defensive plans, attack vectors, rebuttals to Kelly, hard-core takedown sequence
3. **Packo red team** — duopoly/reform theft lanes
4. **Counter playbook** — agree · contrast · bridge · claims gate · do-not-say per vector
5. **Build plan** — verification sprint, simulation refresh, post-debate debrief

## Phase 1 — Verification sprint (pre-debate)

- [ ] Arkansas CourtConnect / circuit civil-criminal search — Kelly & Steve Grappe — log in claims ledger
- [ ] Judgments, liens, UCC — SOS business search + county recorder
- [ ] Newspaper/letter harvest — Regnat Populus, Stand Up blog, Forevermost, KUAR, Arkansas Times
- [ ] For AR Kids / LEARNS stats — primary filing confirmation
- [ ] Counsel sign-off on counter-playbook lines

## Phase 2 — Simulation maintenance

- [ ] Update `hammerRedTeam` after each Hammer public event
- [ ] Update `packoRedTeam` when PACKO-02 quote ledger reaches PARTIAL
- [ ] Rehearse one attack vector per 5 minutes standing

## Phase 3 — Post-debate

- [ ] Log actual lines used vs predicted vectors
- [ ] Append new vectors to JSON
- [ ] Rotate `KELLY_MIRROR_PASSPHRASE` if shared

## Netlify setup

```bash
KELLY_MIRROR_PASSPHRASE=<long random string — candidate only>
```

Redeploy after set. Tell Kelly the hidden word: **quorum** (in county-clerk paragraph on hub).

## Governance reminders

- `HAMMER_SIM` / `PACKO_SIM` blocks are **opponent posture simulations**, not quotes to repeat publicly
- Never imply criminal guilt without verified search
- Petition ties are **public record in campaign biography** — prepare pivot, not denial of civics work

## Future depth (optional)

- Sub-routes: `/kelly-mirror/dossier/[findingId]` with retrieval task IDs
- Link counter-playbook rows to SOS questions and trap lanes
- Auto-sync NEEDS_RESEARCH count to human action queue (staff cannot see mirror, but tasks can)
