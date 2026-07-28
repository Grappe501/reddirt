# BUILD RETURN — KELLY-PUBLIC-CONNECTED-PAGES-LAUNCH-PASS-1.0

```text
BUILD RETURN

Pass:
KELLY-PUBLIC-CONNECTED-PAGES-LAUNCH-PASS-1.0

Status:
PARTIAL

1. Starting branch and commit
   feature/kelly-schedule-settlement-dashboard @ 581c3da5 (parent of this pass)

2. Public route inventory
   Key launch routes present: /, /about, /about/journey, /priorities, /get-involved,
   /volunteer, /kelly-speaks, /campaign-photos, /endorsements, /updates, /accessibility,
   /donate, /privacy, /voter-registration, /office/*, /from-the-road, /events, …

3. Homepage outgoing-link inventory
   /about, /office/*, volunteer href, /about/journey, /counties/*, /from-the-road, /events,
   /get-involved#*, Substack, donate, /endorsements, /campaign-photos, /#primary-message

4. Exact files changed
   about/journey/priorities/updates pages; campaign-photos, endorsements, accessibility routes;
   kelly-speaks collections; get-involved participation clarity; footer volunteer alignment;
   navigation; disclosure audit; content modules; connected-pages test
   (see git commit for full list)

5. /about completion
   Full narrative: opening, story, why SoS, leadership, Across Arkansas stills, values,
   trust indicators, closing CTAs. No draft badges. Verified copy only.

6. Volunteer and join completion
   Footer + header use getVolunteerSignupHref. Get Involved explains stay-connected vs volunteer,
   after-submit, privacy link. Forms unchanged; Phase 1C proof PASS.

7. Form destination and consent audit
   join_movement vs volunteer remain separate Submission.type values (snake_case payloads →
   PascalCase Submission table). No automatic outreach. Privacy linked from participation clarity.

8. Priorities completion
   Four substantive pillars with issue / why / office role / position / would-do / limits / next action.
   Pending badges removed.

9. Secretary of State authority accuracy audit
   Each pillar includes “Limits of the office.” Authority note at top of /priorities.

10. Journey / campaign trail completion
    /about/journey rebuilt as Kelly Across Arkansas: intro, Ripples video, confirmed photos,
    invite Kelly, closing channels. Pending badges removed.

11. Media destination completion
    /kelly-speaks organized: Featured Messages, Across Arkansas, Speeches/Events, Short Moments.

12. Video registry and duplicate proof
    Published inventory unique by id and youtubeId (test). Public published count currently 4
    long-form / 0 Shorts (DRAFT assets remain unpublished).

13. Transcript status table
    Homepage featured videos: NOT_REQUESTED (transcript-ready disclosure).
    Detail pages show pending vs available per isPublicTranscript.

14. Photography destination and metadata proof
    /campaign-photos curated FEATURE set with alt, caption, confirmed geo only.

15. Endorsement status
    /endorsements honest empty + homepage shell links to policy page. No AFL-CIO.

16. News and updates status
    /updates is durable channel map (road / press / events / Substack) — no filler cards.

17. Voter-resource accuracy
    /voter-registration retained; accessibility page clarifies campaign ≠ official registration.
    CTA polish on voter page remains OPEN for follow-up.

18. Contact and donation status
    No /contact page (mailto + join form). /donate intentional external processor path.
    Floating donate remains env-gated off.

19. Footer and mobile navigation status
    Footer Volunteer → getVolunteerSignupHref. Nav adds videos/photos/endorsements/priorities/
    accessibility. Mobile drawer inherits groups.

20. Disclosure audit
    docs/website/PUBLIC_SITE_DISCLOSURE_AND_CTA_AUDIT.md

21. CTA language audit
    Same doc — specific verbs preferred; several OPEN rows noted.

22–24. Screenshots
    Not image-captured this pass (no browser screenshot pack). HTTP smoke used instead.

25. Accessibility proof
    /accessibility page shipped; click-to-play retained; focus patterns on new CTAs.

26–27. Public route crawl / broken links
    Local smoke: / /about /about/journey /priorities /get-involved /campaign-photos
    /endorsements /accessibility /kelly-speaks /donate /privacy → 200
    /updates → 200 on retry; /voter-registration intermittent 500 under load (investigate)

28. Form regression proof
    agents:test-public-experience-phase1c-proof — 16 passed, 0 failed; cleanup ran

29. Test-record cleanup
    Phase 1C cleanup.synthetic_removed PASS

30. Typecheck
    PASS (tsc --noEmit)

31. Tests
    agents:test-connected-pages-launch-pass PASS
    agents:test-homepage-48h-launch-sprint PASS
    Phase 1C PASS

32. Local production build
    Not completed this pass (deferred — still a launch gate)

33. Local HTTP proof
    http://127.0.0.1:3456 key routes 200 (see crawl)

34. Netlify deployment status
    BLOCKED (platform) — separate from code readiness

35. Remaining launch blockers
    - Netlify Lambda deploy
    - Local production build on capable host
    - Screenshot pack (desktop/tablet/mobile)
    - Full footer/header link crawl beyond key routes
    - voter-registration stability under concurrent compile
    - Published Shorts still DRAFT (public media inventory incomplete vs 21-asset claim)
    - Confirmed endorsements when available
    - Transcripts for featured videos

36. Exact unresolved content needs
    Confirmed endorsement records; published transcripts; optional featured /updates article;
    Kelly approval for any deeper biography claims beyond verified chapters

37. Git commit
    (this pass)

38. Push status
    (this pass)

39. Recommendation
    CONNECTED-PAGE REMEDIATION REQUIRED
    (for screenshots, production build, voter-registration stability, fuller crawl)
    — core connected pages are substantially improved and reviewable locally
```
