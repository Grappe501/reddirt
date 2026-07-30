# BUILD RETURN — KELLY-PUBLIC-WEBSITE-48H-LAUNCH-SPRINT-1.0

```text
BUILD RETURN

Sprint:
KELLY-PUBLIC-WEBSITE-48H-LAUNCH-SPRINT-1.0

Status:
PARTIAL

1. Starting commit and branch
   feature/kelly-schedule-settlement-dashboard @ 976b3a41

2. Current homepage section inventory (as-built before rebuild)
   Hero → Four Pillars → Office Serves → Executive Leadership → Direct Democracy →
   Meet Kelly → Photos (eyebrow Across Arkansas) → Invite → Roles → Listening →
   Trust band → On the Road → Final CTA
   (See HOMEPAGE_48H_LAUNCH_SPRINT_MAP.md)

3. Final homepage narrative order
   Hero → Government That Works → Primary message video → Meet Kelly →
   Kelly Across Arkansas (video + stills) → Latest Campaign Photos →
   Endorsements (shell) → Campaign news & updates → Final action

4. Exact files changed
   docs/website/HOMEPAGE_48H_LAUNCH_SPRINT_MAP.md
   docs/website/HOMEPAGE_FORWARD_PLAN.md
   docs/website/HOMEPAGE_48H_LAUNCH_SPRINT_REPORT.md (this file)
   package.json
   scripts/test-homepage-48h-launch-sprint.ts
   scripts/test-homepage-polish-slice1.ts
   scripts/test-homepage-photos-slice2.ts
   src/components/home/HomeTrustFunnelWireframe.tsx
   src/components/home/trust-funnel/TrustFunnelHero.tsx
   src/components/home/trust-funnel/TrustFunnelFourPillarsSection.tsx
   src/components/home/trust-funnel/TrustFunnelMeetKellySection.tsx
   src/components/home/trust-funnel/TrustFunnelCampaignPhotosSection.tsx
   src/components/home/trust-funnel/TrustFunnelPrimaryMessageSection.tsx
   src/components/home/trust-funnel/TrustFunnelKellyAcrossArkansasSection.tsx
   src/components/home/trust-funnel/TrustFunnelEndorsementsSection.tsx
   src/components/home/trust-funnel/TrustFunnelNewsUpdatesSection.tsx
   src/components/home/trust-funnel/TrustFunnelFinalActionSection.tsx
   src/components/media/CampaignVideoFeature.tsx
   src/content/home/trust-funnel-home.ts
   src/content/media/campaign-media-registry.ts (getCampaignMediaById)
   src/content/media/homepage-campaign-photos.ts
   src/content/media/homepage-campaign-videos.ts

5. Dropdown / disclosure audit table
   Page | Section | Current label | Hidden length | Decision | New destination or content | Reason
   / | Live trust-funnel | — | 0 | — | Keep INLINE | No Read More on mounted home
   / | Orphan OfficeExplainer | A bit more detail | ~1 sentence | REMOVE from home | Already unmounted | One-sentence expand prohibited
   / | CampaignTranscriptDisclosure | Read the transcript | Full when PUBLISHED | EXPAND | Keep when transcript public | Legitimate depth
   / | On the Road swipe hint | Swipe sideways… | N/A | INLINE | UX only | Not a content disclosure

6. Video registry and placements
   office-belongs-to-the-people (eKVz5pFJxtk) → #primary-message via CampaignVideoFeature
   ripples-hot-springs-village (aO712RsR0pQ) → #across-arkansas via CampaignVideoFeature
   LazyYouTubeEmbed: youtube-nocookie.com, click-to-play, poster first

7. Photo registry and curated homepage table
   Latest band: 8 FEATURE homepageCandidate IDs (Slice 2 set retained)
   Across Arkansas stills: 5 geo-leaning FEATURE IDs
   Meet Kelly still: mena-polk-meet-greet-20260411
   Hero still: none (existing media.heroHome; no forced weak trail HERO)

8. Hero decision
   Brand-first: Kelly Grappe / For Arkansas Secretary of State /
   “This office belongs to the people.” / short support /
   Meet Kelly + Join the Campaign — still only, no autoplay

9. Meet Kelly implementation
   Three-paragraph preview (who / trail record / values) + Mena still + Read Kelly’s Story → /about

10. Government That Works implementation
    Four substantive pillars with body + ≥3 commitments each; links to /office/*

11. Kelly Across Arkansas implementation
    Ripples video + 5 curated stills + CTA → /about/journey

12. Campaign photos implementation
    Separate Latest Campaign Photos band (8 stills); Across Arkansas eyebrow removed

13. Endorsement readiness
    Structural navy band + empty confirmed list; no invented org names

14. News readiness
    Restrained band from real From the Road / events only; honest empty state

15. CTA destination audit
    Hero: /about + getVolunteerSignupHref()
    Final: Join, Volunteer (/get-involved#volunteer), About, Updates (#join), Blog, Donate
    Floating donate remains env-gated off

16. Mobile screenshots reviewed
    Not image-captured this pass — local HTTP proof only (follow-up)

17. Accessibility proof
    Hero CTA group; section labelled headings; click-to-play aria-label; transcript disclosure pattern retained when published; reduced-motion no longer relevant to removed hero video

18. Image optimization proof
    Existing next/image campaign photo paths retained; YouTube posters lazy via LazyYouTubeEmbed

19. Transcript status
    Both homepage videos: NOT_REQUESTED — feature shows transcript-ready disclosure copy; captions on YouTube after play

20. Route and broken-link audit
    Not full crawl this pass — homepage mounts verified via local HTML markers

21. Forms regression proof
    Not re-run this pass (no form route edits)

22. Typecheck
    PASS (tsc --noEmit)

23. Tests
    agents:test-homepage-48h-launch-sprint PASS
    agents:test-homepage-polish-slice1 PASS
    agents:test-homepage-photos-slice2 PASS

24. Local production build
    Not run (known agent-host OOM/hang risk) — deferred

25. Local URL and HTTP proof
    http://127.0.0.1:3456/ → 200
    Markers present: Kelly Grappe, promise, Government That Works, primary-message,
    Across Arkansas, photos, endorsements, campaign-updates, take-action

26. Netlify status
    BLOCKED — kgrappe Lambda upload 400; kelly-sos-public early build failure pending UI log

27. Exact remaining launch blockers
    - Netlify production deploy
    - Connected-page pass (/about, volunteer, join, priorities, trail, media, …)
    - Published transcripts for homepage videos
    - Confirmed endorsement records when available
    - Mobile screenshot pack + local production build on a capable host
    - Full public route / broken-link crawl

28. Git commit
    1cc6f602

29. Push status
    pushed to origin/feature/kelly-schedule-settlement-dashboard

30. Recommendation
    READY FOR CONNECTED-PAGE PASS
```
