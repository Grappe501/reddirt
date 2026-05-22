# April completion workflow (Steve-facing)

**Start here:** `/admin/campaign-events/month-readiness?month=2026-04`

Do **not** seed May until April readiness is **≥ 80%** (target **95%** for month close).

## Recommended cleanup order

1. **Missing city** — Quick card → Month Review with `focus=missing_city`  
2. **Missing county** — `focus=missing_county`  
3. **Missing mileage** — `focus=missing_mileage` (travel queue)  
4. **Conflicts** — `mode=conflicts`  
5. **Work-hours warnings** — `mode=work_hours`  
6. **Approve / deny / hold** — `mode=unreviewed_only`  
7. **Travel report verification** — `/admin/campaign-events/travel-report?month=2026-04`  
8. **May handoff** — only after readiness gate (panel on readiness page)

## Per-event tools (Month Review)

- **Accept city/county guess** — deterministic inference from title, location, notes, registry, prior events; never overwrites human-saved values (`humanLocks` on bundle).  
- **Accept mileage estimate** — haversine city-level round trip from travel origin (Rose Bud / Tue–Fri Little Rock rules) → **Save & recalculate** runs `calculateCityRoute`.  
- **Speed mode** — tighter summary, location/travel first, sticky Approve/Hold/Deny/Save, keyboard **A / H / D / S** (when not typing in a field).  
- **Readiness preview** — current month %, estimated +% if this event is fixed, remaining issue count.

## Quick action cards

Each card on the readiness page shows:

- Open issue count  
- Estimated month score impact (sum of per-event deltas)  
- **Start this queue** → review URL with `autostart=1`

## Duplicate calendar id

April JSON: 37 rows, 36 unique ids. Seed upserts by id — one duplicate does not create two DB rows. Listed on readiness page when present.

## Commands

```powershell
cd H:\SOSWebsite\RedDirt
npm run campaign-events:seed-april
npm run dev
```
