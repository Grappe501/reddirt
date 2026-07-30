# Pass 1 — Manual QA checklist

## Desktop (automated + build proof)

- [x] `/kelly-speaks` lists only published videos (registry selectors + static routes)
- [x] Detail pages for published slugs generate (`this-office-belongs-to-the-people`, ripples, clerk forum, election night)
- [x] Click-to-play uses youtube-nocookie (component + test)
- [x] Transcript disclosure absent when transcript not PUBLISHED (gate + SSR test)
- [ ] Related links — spot-check in browser after deploy

## Mobile

- [x] Short 9:16 presentation enforced in `CampaignShortCard` / tests
- [ ] Visual mobile pass after local `npm run dev` or deploy

## Accessibility

- [x] Native `<details>` / `<summary>` (no JS required)
- [x] Timestamp links include accessible “Jump to …” text when used
- [x] iframe titles present on embeds
- [ ] Keyboard/focus visual check in browser

## Local review URL

```text
http://localhost:3000/kelly-speaks
http://localhost:3000/kelly-speaks/this-office-belongs-to-the-people
```

## Production proof notes

No fabricated Kelly transcript is published. Enter real transcripts via editorial protocol before setting `transcript.status = PUBLISHED`.
