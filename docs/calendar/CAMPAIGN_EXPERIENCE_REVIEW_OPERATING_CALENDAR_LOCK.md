# CAMPAIGN EXPERIENCE REVIEW

**Pass:** Campaign Operating Calendar architecture lock (no product migration this pass)  
**Launch Principle:** When faced with a choice between saying more and proving more, prove more.

---

## Executive Summary

Long-term calendar architecture is now locked: the calendar is the **Campaign Operating Calendar** inside RedDirt — not a sibling app embedded in the website. One canonical event powers public Next Stops, events, journey, missions, press, media, and relationship follow-up through visibility layers (Public / Internal / Kelly-only).

Today’s inventory still shows two sources of truth (Kelly-calendar `Event` in schema `kelly_calendar` vs RedDirt `CampaignEvent`). Migration is phased and must not jump the queue ahead of public **production confidence** without Steve authorization.

---

## Hesitation hunt

### Top three hesitations removed

1. Ambiguity about embedding Kelly-calendar as a separate product inside the public site — rejected.  
2. Ambiguity about “moving UI” vs “promoting OS” — OS promotion is the frame.  
3. Ambiguity about public vs private schedule leakage — visibility levels locked.

### Top three hesitations remaining

1. Dual SoT (KCCC Event vs CampaignEvent) until mapping/promotion lands.  
2. Public launch still needs production confidence proof.  
3. Homepage still needs a disciplined “Next Stops” consumer once canon is stable — not a full grid.

---

## Trust Ledger

| Item | Status |
| --- | --- |
| Unsupported claims removed | ✅ (architecture doc only) |
| Media accurately captioned | ✅ N/A this pass |
| Endorsements confirmed only | ✅ |
| Unknown dates left blank | ✅ |
| Unknown locations not inferred | ✅ |
| Office authority accurately described | ✅ |
| Testimonial accuracy | ✅ |
| Remaining verification needed | Canonical schema design · Phase 1 inventory packet · Prod confidence |

---

## The Three Hardest Decisions

1. **Left alone:** Live public pages and Kelly-calendar runtime — doctrine only this pass.  
2. **Biggest tradeoff:** Accepted near-term dual SoT rather than a risky big-bang merge before launch confidence.  
3. **Evidence that would change recommendation:** An approved integration packet + Phase 1 inventory complete would unlock Phase 2 schema design; a failed dual-sync incident would accelerate retirement of one write path.

---

## Campaign Manager Eye

Tell staff: **one schedule will rule them all** — but the public launch still ships on RedDirt’s current public event gate. Do not promise “calendar OS done” until Phase 3 proves operator parity.

---

## Kelly first-look

**Proud:** clear OS vision; public/internal/private separation; one-event-many-outputs.  
**Improve:** production confidence first; then deliberate calendar migration without enlarging the marketing site.
