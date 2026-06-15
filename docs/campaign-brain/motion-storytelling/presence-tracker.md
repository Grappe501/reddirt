# Presence Tracker

Every Kelly stop receives a row in [`presence-stops.json`](../../../data/campaign-brain/presence-stops.json).

## Required fields

| Field | Description |
| ----- | ----------- |
| `county` | Arkansas county name |
| `city` | City or community |
| `date` | ISO date (YYYY-MM-DD) |
| `location` | Venue — diner, fairgrounds, church name |
| `type` | county_fair · festival · church · school · diner · library · rotary · naacp · extension_homemakers · clerk_office · house_party · civic_club · sports · business · media · other |
| `storyCategory` | local_business · arkansas_story · community_spotlight · arkansas_problem · arkansas_hope |
| `photos` | Still assets captured |
| `video` | Vertical clip captured |
| `storyPublished` | Local story live |
| `socialPostsPublished` | Count of posts from this stop |
| `substackPublished` | Substack piece live |
| `mediaCoverage` | Local press pickup |
| `contentPyramid` | verticalVideo · photoCarousel · localStory · substack · emailRecap |

## Rule

**No stop without a content plan.** One stop → 5+ content pieces (pyramid).
