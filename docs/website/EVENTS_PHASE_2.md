# Events Phase 2 — map cleanup

**Status:** shipped on `feature/kelly-schedule-settlement-dashboard`  
**Depends on:** Phase 0–1

## Done

1. **One pin style** — single navy pin for all public map markers; no Movement/HQ/fair color palette.
2. **Drop attendance chrome** — public EventCard no longer uses suggested/tentative/confirmed badges or fair card shells (`field-attendance-style` remains for operator/research only).
3. **Exact pins or honest TBA** — region centroids are not mapped; calendar rows without exact coords stay list-only with Location TBA / Unknown.
4. **Drop `includeCalendar`** — removed from filter state; published calendar is always part of the hub merge.

## Notes

- Curated movement events with author-set `mapCoordinates` (and not `mapPinQuality: "region"`) still pin.
- When CampaignOS grows exact lat/lng on public DTOs, wire them into `publicCampaignEventToEventItem` with `mapPinQuality: "exact"`.
