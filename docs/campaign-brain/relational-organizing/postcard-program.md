# Postcard Program

> Scalable · relational · county-specific. Fits the relational model better than mass mail alone.

---

## Four engines

### 1. Visit announcement cards

Sent **before** Kelly visits.

- Invite community members
- Promote local events
- Drive local media awareness

Track: `postcardPrograms.visitAnnouncement` in [`relationship-assets.json`](../../data/campaign-brain/relationship-assets.json)

---

### 2. Senior GOTV cards

Peer-to-peer · relational · trusted messenger.

Track: `postcardPrograms.seniorGotv`

---

### 3. Youth GOTV cards

18–24 outreach · registration · participation.

Track: `postcardPrograms.youthGotv`

---

### 4. Volunteer writing teams

- County-specific lists
- Pre-built templates
- Activated when needed (event surge · GOTV window)

Track: `programs.postcardTeams` (active / planned / goal)

Roll up handwritten volume to `relationshipCapital.postcardsWritten`.

---

## Activation rhythm

| Phase | Primary postcard type |
| ----- | --------------------- |
| Campaign Phase | Visit announcements |
| Pre-election 60d | Senior + youth relational GOTV |
| Final 30d | GOTV + follow-up to event attendees |

---

## Dashboard

[relationship-capital-dashboard.md](./relationship-capital-dashboard.md)
