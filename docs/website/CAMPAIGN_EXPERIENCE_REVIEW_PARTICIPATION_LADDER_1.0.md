# CAMPAIGN EXPERIENCE REVIEW — Participation Ladder

**Pass:** `KELLY-PUBLIC-PARTICIPATION-LADDER-1.0` (Final Pass 2 / Forensic Pathway Pass B)  
**Lane:** RedDirt public marketing  
**Date:** 2026-07-30  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Authority:** [`CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_PATHWAY_2.0.md`](./CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_PATHWAY_2.0.md) · [`CAMPAIGN_EXPERIENCE_REVIEW_PATHWAY_HONESTY_1.0.md`](./CAMPAIGN_EXPERIENCE_REVIEW_PATHWAY_HONESTY_1.0.md)

---

## Executive Summary

One participation ladder is now visible and wired: **Stay connected → Volunteer → Bring 5 → Local team → Donate last**. Join and Volunteer no longer collapse to the same URL. Header Volunteer and Final Action Volunteer both land on `/get-involved#volunteer`. Field Team onboarding stays at `/volunteer` as an explicit track, not the default CTA.

---

## What changed

### Canon URLs (`external-campaign.ts`)

| CTA | Destination |
| --- | --- |
| Stay connected / Join | `/get-involved#join` (`getJoinCampaignHref`) |
| Volunteer | `/get-involved#volunteer` (`getVolunteerSignupHref`) |
| Field Team onboarding | `/volunteer` (explicit only) |

Native-form env no longer redirects marketing Volunteer CTAs to `/volunteer#signup`.

### Homepage

- Hero “Join the Campaign” → Stay connected (`#join`)
- Final Action: Stay connected (primary) + Volunteer (outline) + Priorities + Donate
- Labels clarified (“Stay connected” / “Volunteer”)

### Nav

- Get Involved menu: Stay connected, Volunteer, Bring 5, Local team, Invite Kelly, Donate
- Events: “Campaign Calendar” → “Events”; Share → “Suggest a public event” (`/events#suggest`)
- Duplicate Share removed from Get Involved
- Footer mirrors Stay connected / Volunteer

### Get Involved page

- Hero CTAs follow ladder order
- “One ladder — pick your step” ordered list
- Field Team note points to `/volunteer` without stealing the default Volunteer CTA

---

## Hesitations removed

1. Join and Volunteer identical destinations on Final Action  
2. Header Volunteer bouncing to Field Team when native form on  
3. Unclear Get Involved vs Volunteer naming in nav  

## Hesitations remaining

1. Media proof discipline / admin empty-slot copy (Pass C)  
2. News reading-door collapse (Pass D)  
3. Live URL parity (Pass F)

---

## Next

**Pass C — Media Proof Discipline**
