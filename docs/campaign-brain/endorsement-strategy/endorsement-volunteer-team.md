# Endorsement Volunteer Team

Small dedicated team — **not** a new Brain phase. Operates under Phase 15 with a single queue and weekly scorecard review.

## Purpose

Move validators through the endorsement pipeline and activate every endorsement after it is secured. Field teams stay on voter contact (Phase 16); this team owns **asks, follow-ups, and activation**.

## Team size

**3–5 volunteers** plus one staff liaison (Burt or designee).

| Role | Responsibility |
| ---- | -------------- |
| **Team lead** | Weekly scorecard · priority tier order · Kelly briefing prep |
| **Institutional tracker** | Labor · NAACP · AEA · union halls — meeting requests and briefing packets |
| **Officials tracker** | Current and former elected — introductions and endorsement asks |
| **Activation coordinator** | Post-endorsement checklist: graphic · social · email · Mobilize · county deployment |
| **Research support** (optional) | Value scores · county geography · validator credibility notes |

## Weekly rhythm

1. **Monday** — Review `endorsement-scorecard.json` and pending queue (election plan Endorsements tab).
2. **Tuesday–Thursday** — Outreach calls · meeting scheduling · briefing packet sends.
3. **Friday** — Update leader records (`endorsementRequested`, `endorsementStatus`, `endorsementActivationLevel`) in coalition JSON sources.
4. **After each endorsement** — Run activation checklist in [`endorsement-announcement-system.md`](./endorsement-announcement-system.md).

## Priority order (first 30 days)

1. Union leadership meetings — briefing package before labor meetings  
2. NAACP branches — speaking opportunities  
3. April Reisma / educator county introductions  
4. Current and former elected officials  
5. Sherwood event validators (local officials · community leaders)  
6. First wave of public endorsers for late-summer announcement  

## Data sources (update — do not duplicate)

- `data/campaign-brain/endorsement-acquisition-queue.json` — built queue  
- `data/campaign-brain/labor-union-engagement.json`  
- `data/campaign-brain/naacp-branch-engagement.json`  
- `data/campaign-brain/aea-teacher-network.json`  
- `data/campaign-brain/current-elected-officials.json` · `former-elected-officials.json`  

```bash
npm run campaign-brain:endorsements:build
```

## Handoff to Phase 16

Endorsers who commit to **volunteer recruitment** or **host events** create tasks for county strike teams and voter-contact channels — not duplicate relationship tracking.

## Phase 17 note

Fundraising system comes **after** voter contact is operational. Endorsement team may log `donorLeadsGenerated` on leader records; finance owns dollars.
