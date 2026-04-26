# Kelly SOS — decision log (KELLY-DEC-1)

**Rules:** One row per decision. No secrets. Steve (or delegate) records **Date**, **Decision**, **Reason**.

| Date | Decision | Owner | Reason / notes |
|------|----------|-------|----------------|
| 2026-04-26 | Treat `RedDirt/` repo as **Kelly Grappe for Arkansas Secretary of State** production stack, not generic template | Program | Reclassification doc + launch planning |
| 2026-04-26 | **Section 2 technical gate** — `section2-preview-smoke.ps1` + demo route GETs passed on **local** `http://localhost:3001`; **counsel/treasurer formal sign-off** still pending; **Netlify deploy-preview** smoke recommended before apex | Steve | Operator-run session; see [`KELLY_SOS_SECTION_2_SIGNOFF_LOG.md`](./KELLY_SOS_SECTION_2_SIGNOFF_LOG.md) |
| 2026-04-26 | **Section 3 launch lock** — go/no-go + backlog documented; **maintenance** next-pass; optional `git tag` in [`KELLY_SOS_SECTION_3_LAUNCH_LOCK.md`](./KELLY_SOS_SECTION_3_LAUNCH_LOCK.md) | Steve | Closes 7-day sprint **doc loop**; commercial launch timing remains campaign decision |
| | | | |

### Pending decisions (move to table when resolved)

- [ ] Canonical **public** domain: RedDirt `(site)` only vs also `sos-public` — see `brands/kelly-grappe-sos/PUBLIC_SURFACE_DECISION.md`
- [ ] Production **donate** primary path (GoodChange vs other) — treasurer/compliance (Section 2 Track B — [`KELLY_SOS_SECTION_2_DEEP_BUILD.md`](./KELLY_SOS_SECTION_2_DEEP_BUILD.md))
- [ ] **OpenAI** required for launch vs optional degrade
- [ ] **Twilio/SendGrid** live vs stub for day-one launch
- [x] **Privacy/terms** — **draft waiver** logged pending formal counsel (`KELLY_SOS_SECTION_2_SIGNOFF_LOG.md`); replace with approval when received
