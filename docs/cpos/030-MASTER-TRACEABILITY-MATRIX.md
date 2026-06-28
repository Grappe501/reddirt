# 030 — CPOS Master Traceability Matrix

**Doc ID:** CPOS-030  
**Manifest:** `kickoff-2026`  
**IA:** [`CPOS_DESIGN_PASS_02_INFORMATION_ARCHITECTURE.md`](./CPOS_DESIGN_PASS_02_INFORMATION_ARCHITECTURE.md)

Legend: **Planned** | **Slice** (build packet) | **Done**

---

## A. Chapter traceability

| Ch | id | Manifest segments | Audience component | Presenter control | API / data | Integration |
|----|-----|-------------------|--------------------|-------------------|------------|-------------|
| 00 | ch00_opening_video | video | CposVideoSegment | auto time / manual skip | session.currentChapterId | media placeholder |
| 01 | ch01_welcome | narrative, login_reminder, countdown | CposOpeningBanner + segments | advance | session | join.bannerCopy |
| 02 | ch02_why | narrative | CposNarrativeSegment | advance + cue panel | session | — |
| 03 | ch03_road_since_november | metric_animation, narrative | CposMetricAnimationSegment | advance | coreNumbers | cues |
| 04 | ch04_golden_circle | golden_circle | CposGoldenCircleSegment | advance | — | — |
| 05 | ch05_bigger_than_one | narrative | CposNarrativeSegment | advance | cues | — |
| 06 | ch06_immersion_house_party | narrative | CposNarrativeSegment | advance | — | — |
| 07 | ch07_power_of_5 | narrative | CposNarrativeSegment | advance | cues | P5 future |
| 08 | ch08_voter_registration | metric_strip, narrative | CposMetricStrip | advance | registration_goal | EP goals future |
| 09 | ch09_social_media | narrative, hashtag | Narrative + hashtag chip | advance | cues | comms lane card |
| 10 | ch10_dashboard_tour | demo_launcher, demo_cards | CposDemoLauncherSegment | CposDemoButtons | activeDemoId | EP counties hub |
| 11 | ch11_choose_lane | interaction_stack, closing_line | CposInteractionStack | — | AudienceResponse | /api/forms CPOS-9 |

---

## B. Demo traceability

| Demo id | Label | Path | Presentation query | Polish | Slice | EP route exists? |
|---------|-------|------|---------------------|--------|-------|------------------|
| county_playbook_hub | County Playbooks | /election-plan/counties | presentation,cpos | v1_primary | CPOS-6 | **Create hub** |
| admin_election_plan | Election Plan Command | /admin/election-plan | presentation,cpos | card_only | CPOS-7 | Yes |
| immersion_missions | Immersion Missions | /election-plan/battlefield | presentation,cpos | card_only | CPOS-7 | Yes |
| calendar_events | Campaign Calendar | /election-plan/operators/events-command | presentation,cpos | card_only | CPOS-7 | Yes |
| power_of_5_placeholder | Power of 5 | /relational | presentation,cpos | placeholder | CPOS-10+ | Yes |
| comms_social_placeholder | Comms / Social | /election-plan/operators/comms-command | presentation,cpos | placeholder | CPOS-10+ | Yes |

---

## C. Interaction traceability

| Interaction id | Type | Options count | Persist | Export | Forms route |
|----------------|------|---------------|---------|--------|-------------|
| poll_where_help | poll | 6 | session + analytics | JSON | optional CPOS-9 |
| poll_lane_natural | poll | 13 | session + analytics | JSON | optional CPOS-9 |
| poll_power_of_5 | poll | 4 | session + analytics | JSON | optional CPOS-9 |

**Combined lane capture form (CPOS-9):** `volunteer_kickoff_lane_selection` → `/api/forms` → WorkflowIntake `volunteer_kickoff`.

---

## Cue traceability

| Cue id | Text (truncated) | Chapters |
|--------|------------------|----------|
| cue_battle_won_before | Every battle is won… | ch02 |
| cue_trust_moves_person | Trust moves person… | ch03 |
| cue_not_social_media_alone | Not won by social… | ch03, ch09 |
| cue_bigger_table | Bigger table | ch05 |
| cue_do_not_attack_trump | Do not attack Trump… | ch09 |
| cue_devalue_national | Devalue national… | ch09 |
| cue_labor_day_visible | Labor Day visible | ch05 |
| cue_every_campaign_stronger | Every campaign stronger | ch05 |
| cue_few_hours_matters | Few hours matters | ch07 |
| cue_co_leads_sustainable | Co-leads sustainable | ch07, ch11 |

Presenter: `CposCuePanel` filters by `currentChapterId`.

---

## D. Route traceability

| URL | Page file (planned) | Slice | Auth |
|-----|---------------------|-------|------|
| /election-plan/team-kickoff | `team-kickoff/page.tsx` | CPOS-3 | EP login |
| /election-plan/team-kickoff/presenter | `team-kickoff/presenter/page.tsx` | CPOS-4 | EP + presenter |
| /election-plan/team-kickoff/manifest | `team-kickoff/manifest/page.tsx` | CPOS-1 | EP login |
| /election-plan/counties | `(portal)/counties/page.tsx` | CPOS-6 | EP login |
| GET /api/cpos/session/[id] | `api/cpos/session/[meetingId]/route.ts` | CPOS-2 | read |
| POST /api/cpos/session/[id] | same | CPOS-4 | presenter |
| POST …/responses | `responses/route.ts` | CPOS-8 | audience |

---

## E. Build slice dependency graph

```
CPOS-1 manifest validator
  └── CPOS-2 session store + GET API
        └── CPOS-3 audience shell
        └── CPOS-4 presenter shell + POST advance
              └── CPOS-5 polling hook (or fold into 3/4)
              └── CPOS-6 counties hub + presentation mode
              └── CPOS-7 demo launcher + soft return
              └── CPOS-8 polls + analytics
                    └── CPOS-9 /api/forms bridge
                          └── CPOS-10 content polish + metrics live
```

---

## F. Analytics event map

| Event | Trigger | chapterId | Stored |
|-------|---------|-----------|--------|
| session.start | presenter start / first audience join | — | session file |
| chapter.enter | chapter change | yes | session file |
| demo.open | demo launch | yes + demoId | session file |
| interaction.submit | poll tap | yes + interactionId | responses + file |
| audience.join | first poll from client | — | session file |

Post-meeting: `data/cpos/sessions/kickoff-2026-YYYYMMDD.json`

---

## G. Risk register

| Risk | Mitigation |
|------|------------|
| `/election-plan/counties` hub missing | Ship battlefield fallback card; hub in CPOS-6 |
| EP login friction at 5:59 | Pre-share login link; ch01 login reminder |
| Opening video file missing | placeholder segment — **tonight OK** |
| Polling lag | Set expectations; presenter narrates |
| Presenter gate not ready | manual advance on presenter route with EP password |

---

*Matrix version: Pass 02 · 2026-06-28*
