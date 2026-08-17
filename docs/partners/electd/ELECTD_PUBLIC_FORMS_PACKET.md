# Kelly Grappe for Arkansas Secretary of State
## Electd public forms packet

**Date:** 2026-08-17  
**Public site:** https://kgrappe.netlify.app  
**Campaign contact:** kelly@kellygrappe.com  
**Timezone for dates/times:** America/Chicago (Central)

This packet is the build spec for every **public voter/volunteer form** currently used on the Kelly Grappe website. Electd should create these forms in the Electd dashboard. Submissions should land in Electd **and** be available to populate the Kelly campaign database. Electd then returns **hosted URLs** (and embed snippets if available) so we can replace the native site forms with Electd links.

Do not start swapping live site buttons until Electd returns URLs. This packet is the handoff.

---

## What we need back

For each `form_id` below, please return:

1. Hosted form URL
2. Embed snippet (iframe or script), if you support it
3. Confirmation that submitted field names match `field_key` in `ELECTD_FIELDS.csv`
4. How we receive data: webhook URL we can give you, native Electd export, or both
5. Test/preview URL if different from production

Optional but helpful: UTM capture (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`) stored with each submission.

---

## Shared rules (every form)

### Hidden fields

| field_key | required | value |
|---|---|---|
| `form_id` | yes | Exact id from this packet (`join_movement`, `volunteer`, etc.) |
| `sourcePage` | no | Path of the page that linked to the form, e.g. `/get-involved` |
| `sourceComponent` | no | Short name of the CTA, e.g. `JoinMovementForm` |
| `sourceCampaign` | no | Optional campaign tag, e.g. `volunteer-kickoff` |
| `referrerCode` | no | Optional volunteer/share code |

If Electd cannot set `sourcePage` automatically, we will append it as a query param on our links (`?sourcePage=/get-involved`). Please preserve query params into hidden fields when possible.

### County dropdown

Use **`ARKANSAS_COUNTIES.csv`**. 75 counties. Exact spellings matter:

- `Hot Spring` is Malvern. `Garland` is Hot Springs. Do not merge them.
- `St. Francis` includes the period.

Show the county name only (do not append the word "County" to the stored value).

### Consent

- `consentEmail` and `consentSms` must be **unchecked by default**.
- Submitting the form is **not** consent.
- Do not infer SMS opt-in unless `consentSms` is checked **and** a phone number is present.
- Preserve existing opt-outs if your system already has that person; do not flip OPT_OUT to OPT_IN unless they check the box again.

Suggested labels:

- Email: `Email me campaign updates.`
- SMS: `Text me campaign updates. Message and data rates may apply.`

### Spam

Electd may use its own bot protection. Our native forms use a hidden honeypot named `website` that must stay empty. You do not need to recreate that field if Electd already blocks bots.

### Legal / paid-for

If Electd hosts a full-page form (not just an embed inside our site), include:

`Paid for by Kelly Grappe for SOS`

Do not collect street addresses unless the form below says so. Private home hosts may omit a street address on Invite Kelly.

### Out of scope — do not build

| Thing | Why |
|---|---|
| Donate | GoodChange processor on `/donate` |
| Substack subscribe | Canonical journal is Substack; site links out |
| `/contact` | mailto `kelly@kellygrappe.com` only; no contact form |
| Event RSVP join links | Google Meet / Facebook / Arkansas Youth Coalition URLs on event records |
| Admin, volunteer-board login, GOTV internal cards | Operator-only |
| `direct_democracy_commitment` | Schema exists in our code; **not mounted** on the public site. Do not recreate unless we ask. |

---

## Form catalog

### 1. `join_movement` — Stay connected / Join the campaign — **P0**

**Site URLs today:** `/get-involved#join`  
**Submit button:** Stay connected  
**Success idea:** Thanks. We'll be in touch.

| field_key | label | type | required |
|---|---|---|---|
| name | Full name | text | yes |
| email | Email | email | yes |
| phone | Phone | tel | no |
| zip | ZIP | text | no |
| county | County | select (75 counties) | no |
| interests | How you want to help | multi-select | no |
| message | Anything we should know? | textarea max 2000 | no |
| consentEmail | Email me campaign updates | checkbox default off | no |
| consentSms | Text me (SMS) | checkbox default off | no |
| form_id | hidden `join_movement` | hidden | yes |

**interests options (store the key, show the label):**

| key | label |
|---|---|
| field | Field / events |
| digital | Digital help |
| faith_communities | Faith communities |
| voter_education | Voter education |
| party_or_civic_meeting | Party or civic meeting invite |
| direct_democracy | Ballot access & initiatives |

Note: the current native form does not show consent checkboxes. **Electd should add them.**

---

### 2. `volunteer` — Volunteer signup — **P0**

**Site URLs today:** `/get-involved#volunteer`, `/volunteer#signup`  
**Submit button:** Volunteer  

Query-param prefills we use today (preserve if Electd supports URL prefills):

- `leadership=1` → check `leadershipInterest`
- `lane=event_representation` → add that token to `interests`
- `resource={slug}` → add `resource:{slug}` to `interests`

| field_key | label | type | required |
|---|---|---|---|
| firstName | First name | text | yes |
| lastName | Last name | text | yes |
| email | Email | email | yes |
| phone | Phone | tel | no (preferred) |
| zip | ZIP code | text | no |
| county | County | select | no |
| city | City | text | no |
| preferredRole | Preferred role | select | yes (default `not_sure`) |
| preferredLanguage | Preferred language | select | yes (default `english`) |
| student | I am a student | checkbox | no |
| schoolCampus | School / campus | text | no; show if student |
| discordInterest | I want a Discord invite (manual follow-up; no auto-join) | checkbox | no |
| hostingInterest | I am interested in hosting a gathering | checkbox | no |
| fundraisingInterest | I am interested in fundraising | checkbox | no |
| leadershipInterest | I'm open to leadership training | checkbox | no |
| interests | Ways to help | multi-select | no |
| notes | Notes | textarea max 3000 | no |
| availability | Availability | textarea max 500 | no |
| skills | Skills / experience | textarea max 2000 | no |
| consentEmail / consentSms | same as join | checkbox default off | no |
| form_id | hidden `volunteer` | hidden | yes |

**preferredRole**

| key | label |
|---|---|
| events | Events |
| social_media | Social media |
| power_of_five | Power of 5 / voter registration |
| youth_outreach | Youth outreach |
| womens_outreach | Women's outreach |
| fundraising | Fundraising |
| not_sure | Not sure yet |

**preferredLanguage:** `english` English · `spanish` Spanish · `marshallese` Marshallese

**interests shown on the current volunteer page**

| key | label |
|---|---|
| resource:postcard-outreach | Handwritten postcards |
| resource:phone-banking | Phone banking |
| resource:text-banking | Peer-to-peer text banking |

**Recommended extra interests (full taxonomy — include if Electd has room):**

canvassing, phone_banking, texting, voter_registration, events, county_organizing, data_entry, digital_outreach, social_media, photography, video, graphic_design, writing, research, election_protection, business_outreach, nonprofit_outreach, faith_community_outreach, youth_engagement, senior_outreach, transportation, accessibility_support, office_admin, hosting, fundraising, yard_signs, relational_organizing, other

---

### 3. `invite_kelly` — Invite Kelly / schedule a campaign stop — **P0**

**Site URLs today:** `/schedule`  
Invite pathway pages `/events/request` and `/events/request/how-it-works` should end on this form.

**Submit button:** Submit request  
**Not a promise that every request is accepted.** Follow-up only.

| field_key | label | type | required |
|---|---|---|---|
| requesterName | Your name | text | yes |
| organization | Organization | text | no |
| email | Email | email | yes |
| phone | Phone | tel | yes |
| eventTitle | Event title | text | yes |
| eventType | Event type | select | yes |
| county | County | select | yes |
| city | City | text | no |
| address | Venue / address | textarea | no — do not require street address |
| preferredDate | Preferred date | date | yes unless flexibility is `campaign_suggests` |
| alternateDatesText | Alternate dates | textarea | no — YYYY-MM-DD, one per line or comma-separated, max 12 |
| preferredStartTime | Preferred start time | time | no |
| preferredEndTime | Preferred end time | time | no |
| flexibility | Date flexibility | select | yes |
| audienceSize | Expected audience size | number | no |
| eventPurpose | Purpose / what you want from the visit | textarea max 4000 | no |
| eventVisibility | Visibility | select | yes |
| pressInvited | Press invited | yes/no | yes |
| pressReleaseInterest | Press release interest | select | yes |
| localIssueAngle | Local issue angle | textarea max 2000 | no |
| speakingRequested | Speaking requested | yes/no | yes |
| localHostAvailable | Local host available | yes/no | yes |
| notes | Notes | textarea max 8000 | no |
| permissionToContact | Campaign may contact me about this request | checkbox | **must be checked** |
| form_id | hidden `invite_kelly` | hidden | yes |

**eventType**

| key | label |
|---|---|
| county_party_meeting | County party meeting |
| house_party | House party |
| civic_club | Civic club |
| school_campus | School / campus event |
| fair_festival | Fair / festival |
| fundraiser | Fundraiser |
| listening_session | Listening session |
| church_community | Church / community event |
| press_media | Press / media |
| volunteer_event | Volunteer event |
| other | Other |

**flexibility:** `exact_date_only` Exact date only · `same_week` Same week · `same_month` Same month · `campaign_suggests` Campaign can suggest  

**eventVisibility:** `public` Public · `private` Private / invitation-only  

**pressReleaseInterest:** `no` No · `maybe` Maybe · `yes` Yes · `staff_decide` Staff decide  

Boolean fields (`pressInvited`, `speakingRequested`, `localHostAvailable`) can be yes/no radios. Store true/false.

---

### 4. `host_gathering` — Host a gathering — **P0**

**Site URLs today:** `/host-a-gathering`, `/listening-sessions` (pre-select `listening_session`)  
**Submit button:** Send host request  

| field_key | label | type | required |
|---|---|---|---|
| name | Full name | text | yes |
| email | Email | email | yes |
| phone | Phone | tel | no |
| zip | ZIP | text | yes |
| county | County | select | no |
| community | Town or neighborhood | text | yes |
| gatheringType | Gathering type | select | yes (default `living_room`) |
| gatheringTypeOther | If other, what kind? | text | required when type is `other` |
| preferredTiming | Preferred timing | textarea | no |
| expectedGuests | Expected guests | text | no |
| needs | What you need from the campaign | textarea | no |
| form_id | hidden `host_gathering` | hidden | yes |

**gatheringType**

| key | label |
|---|---|
| front_porch | Front porch conversation |
| living_room | Living room gathering |
| coffee_meetup | Coffee meetup |
| listening_session | Local listening session |
| issue_briefing | Issue briefing |
| postcard_party | Postcard writing party |
| phone_bank_party | Phone bank party |
| other | Something else |

---

### 5. `local_team` — Start a local team — **P1**

**Site URL today:** `/start-a-local-team`  
**Submit button:** Start a local team  

| field_key | label | type | required |
|---|---|---|---|
| name | Full name | text | yes |
| email | Email | email | yes |
| phone | Phone | tel | no |
| zip | ZIP | text | yes |
| county | County | select | no |
| community | Town or community | text | yes |
| teamGoal | What you want this team to do | textarea max 2000 | no |
| form_id | hidden `local_team` | hidden | yes |

---

### 6. `suggest_community_event` — Suggest a community event — **P1**

**Site URL today:** `/events`  
**Submit button:** Submit for review  
These are **suggestions**, not confirmed calendar events. Staff review before anything goes public.

| field_key | label | type | required |
|---|---|---|---|
| eventName | Event name | text | yes |
| shortDescription | Short description | textarea | no |
| startDate | Start date | date | yes |
| startTime | Start time | time | yes |
| endDate | End date | date | yes |
| endTime | End time | time | yes; end on or after start |
| city | City | text | no |
| county | County | select | no |
| venueName | Venue | text | no |
| infoUrl | Event info URL | url (https) | no |
| submitterName | Your name | text | yes |
| submitterEmail | Your email | email | yes |
| form_id | hidden `suggest_community_event` | hidden | yes |

---

### 7. `story_submission` — Share a story — **P2**

**Site URL today:** `/stories`  
**Submit button:** Submit story  
Do not auto-publish. Staff follow-up only.

| field_key | label | type | required |
|---|---|---|---|
| name | Full name | text | yes |
| email | Email | email | yes |
| phone | Phone | tel | no |
| county | County | select | no |
| title | Short title | text 3–200 chars | yes |
| story | Your story | textarea min 40 / max 12000 | yes |
| consentPublic | I understand the campaign may follow up and will not publish without explicit OK | checkbox | **must be checked** |
| form_id | hidden `story_submission` | hidden | yes |

---

### 8. `volunteer_kickoff` — Volunteer leadership kickoff — **P2**

Please build **four hosted forms** that share most fields. Hidden `pathway` differs.

| hosted form | pathway value | URL on our site today | submit button |
|---|---|---|---|
| volunteer_kickoff_local | `local` | `/volunteer-kickoff/join/local` | Join My Local Team |
| volunteer_kickoff_campaign | `campaign` | `/volunteer-kickoff/join/campaign` | Join a Statewide Campaign Team |
| volunteer_kickoff_youth | `youth` | `/volunteer-kickoff/join/youth` | Join the Youth Coalition Effort |
| volunteer_kickoff_match | `match` | `/volunteer-kickoff/join/match` | Help Me Find My Place |

**Shared required fields:** `name`, `email`, `phone` (required on kickoff), `county`, `preferredContact`, hidden `form_id=volunteer_kickoff`, hidden `pathway`

**preferredContact:** `email` Email · `phone` Phone call · `text` Text

**Show by pathway**

| field | local | campaign | youth | match |
|---|---|---|---|---|
| roles (local role checkboxes) | yes | | | |
| primaryTeam | | yes | | |
| secondaryTeam | | yes | | |
| regions | | yes | | |
| youthIntent | | | yes | |
| enjoyDoing | | | | yes |
| preferScope | | | | yes |
| skills | | yes | | yes |
| canHost / canRecruit | yes | | | yes |
| willingToTravel / leadershipInterest | | yes | | yes |
| organizationName | yes | | yes | |
| availability | yes | yes | yes | yes |
| notes | yes | yes | yes | yes |
| consentEmail | yes | yes | yes | yes |

**Local roles (`roles` multi-select)**

| key | label |
|---|---|
| county_lead | County Lead Organizer |
| local_events | Local Events Team |
| community_outreach | Community Outreach Team |
| local_media | Local Media Contact |
| voter_registration | Local Voter Registration Team |
| canvassing | Local Canvassing Team |
| local_gotv | Local GOTV Team |
| event_host | Local Event Host |

**Campaign teams (`primaryTeam` / `secondaryTeam`)**

| key | label |
|---|---|
| volunteer_leadership | Volunteer Leadership Team |
| social_creative | Social Media & Creative |
| logistics | Logistics & Scheduling |
| statewide_outreach | Statewide Outreach |
| data_technology | Data & Technology |
| project_organizer | Campaign Project Organizer |
| fundraising | Grassroots Fundraising |
| strike_team | Traveling Strike Teams |
| grassroots_guitar_strings | Grassroots & Guitar Strings Planning Team |
| statewide_gotv | Statewide GOTV |

**Strike regions (`regions`)**

| key | label |
|---|---|
| northwest | Northwest Arkansas |
| northeast | Northeast Arkansas |
| southwest | Southwest Arkansas |
| southeast | Southeast Arkansas |
| central | Central Arkansas |

**youthIntent:** `join` I am 16–24 and want to join · `refer` I know a young person who should join · `help` I want to help the Youth Coalition  

**preferScope:** `local` Local · `statewide` Statewide · `either` Either / not sure  

URL prefills we use today: `?role=`, `?team=`, `?event=`, `?intent=`

---

### 9. `ask_kelly_beta` — Ask Kelly beta feedback — **P3**

Invite-only site dock. Build last. Hidden `form_id` value we store internally is `ask_kelly_beta_feedback`; Electd may use `ask_kelly_beta` as the public form name if easier, but please send us `form_id=ask_kelly_beta_feedback` in the payload.

**Submit button:** Send to Kelly  

| field_key | label | type | required |
|---|---|---|---|
| name | Full name | text | yes |
| email | Email | email | yes |
| phone | Phone | tel | no |
| category | Category | select | yes |
| pagePath | Page path | text | no — path only, no query PII |
| feedback | Feedback | textarea min 10 / max 8000 | yes |
| form_id | hidden `ask_kelly_beta_feedback` | hidden | yes |

**category**

| key | label |
|---|---|
| website_issues_ease_of_use | Website issues / ease of use / intuitiveness |
| volunteer_questions_onboarding | Volunteer questions and onboarding |
| message_content_feedback | Message / content feedback |

---

## Suggested payload we can ingest

JSON example for Stay connected:

```json
{
  "form_id": "join_movement",
  "name": "Jane Example",
  "email": "jane@example.com",
  "phone": "",
  "zip": "72201",
  "county": "Pulaski",
  "interests": ["field", "digital"],
  "message": "",
  "consentEmail": true,
  "consentSms": false,
  "sourcePage": "/get-involved",
  "submittedAt": "2026-08-17T21:00:00-05:00"
}
```

Use fake names only in tests. Do not send real voter PII in sample payloads.

---

## After Electd returns URLs

We will replace native forms on the site with Electd hosted links or embeds. Until then, the live site continues to post to our own `/api/forms` (and `/api/forms/schedule-campaign-event` for Invite Kelly).

Please send the URL list to kelly@kellygrappe.com.
