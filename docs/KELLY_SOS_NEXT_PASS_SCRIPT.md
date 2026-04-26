# Kelly SOS — next pass script for Cursor

**Current slice:** **Post-launch / maintenance** (Kelly SOS stable-operation mode)  
**Active repo:** `H:\SOSWebsite\RedDirt`  
**Updated:** 2026-04-26 (Section 3: [`KELLY_SOS_SECTION_3_LAUNCH_LOCK.md`](./KELLY_SOS_SECTION_3_LAUNCH_LOCK.md).)

Sections 1–3 sprint packets are **closed** in docs. Use this for **ongoing** fixes, Netlify preview smoke when URLs exist, counsel/treasurer follow-through, and small QA — not for template extraction unless Steve opens a packet.

Paste this block into Cursor.

```text
ACTIVE PROJECT:
Kelly Grappe for Arkansas Secretary of State — RedDirt repo.

ACTIVE SLICE:
Maintenance — P0/P1 from KELLY_SOS_SECTION_3_LAUNCH_LOCK.md; optional Netlify preview smoke; no template extraction without Steve approval.

HARD RULES:
- No deletes. No repo moves. No cross-lane imports (AJAX / PhatLip / countyWorkbench / sos-public) without integration packet.
- Kelly-only data, env, DB. No secrets in chat, commits, or logs. No unsourced opponent claims.
- Legal copy: typos/structure only unless counsel approves substance.

READ FIRST:
- docs/KELLY_SOS_SECTION_3_LAUNCH_LOCK.md
- docs/KELLY_SOS_BUILD_LOG.md
- docs/deployment.md
- docs/KELLY_SOS_SECTION_2_SIGNOFF_LOG.md (pending initials)

OBJECTIVE:
Ship small, reviewable PRs: preview smoke when a URL exists; production hotfixes; backlog items (CSV export, comms keys, ingest) as prioritized by Steve.

QUALITY GATE:
- npm run check before merge when code changes

OUTPUT:
- Append KELLY_SOS_BUILD_LOG.md for meaningful verification runs.
```

*Sprint slices archived: Section 1 → [`KELLY_SOS_DAY_6_SECTION_1_REPORT.md`](./KELLY_SOS_DAY_6_SECTION_1_REPORT.md); Section 2 → [`KELLY_SOS_SECTION_2_DEEP_BUILD.md`](./KELLY_SOS_SECTION_2_DEEP_BUILD.md); Section 3 → [`KELLY_SOS_SECTION_3_LAUNCH_LOCK.md`](./KELLY_SOS_SECTION_3_LAUNCH_LOCK.md).*
