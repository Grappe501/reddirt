# Text + Reach foundation

**Lane:** `RedDirt/` only · **Slice:** **REDDIRT-NATIVE-TEXT-AND-REACH-FOUNDATION-1.0**

## Purpose

Lay the groundwork for **native campaign texting** and **RedDirt Reach–style relational organizing** inside RedDirt: readiness JSON, an admin hub, preview pages, capability maps, and explicit safety language. This work **does not** turn on outbound SMS, bulk texting, large contact imports, automation workers, live campaign email, or calendar writes.

## What staff get today

- **Text + Reach hub:** `/admin/workbench/communication-command-center/text-reach` — plain-language sections for text, Reach, follow-up cockpit, and safety locks (all locked by policy until separate approvals).
- **RedDirt Reach preview:** `/admin/workbench/people/relational-organizing` — describes what volunteers and HQ will do later; **no** data entry on that page yet.
- **Readiness API (read-only):** `GET /api/admin/communication-command-center/text-reach-readiness` — same diagnostics bearer pattern as other hosted readiness routes (`EMAIL_DIAGNOSTICS_TOKEN` first, `ADMIN_DIAGNOSTIC_TOKEN` fallback, timing-safe compare). **No** Twilio send calls, **no** secrets in the JSON body.

## Native texting

Text messaging is **being built** in RedDirt. **SMS sending is not active** from this slice. **STOP** and **HELP** style compliance and opt-out handling are **required before activation**. Bulk texting needs **separate headquarters approval**.

## RedDirt Reach

Starts with **manual relationship entry** and **staff review** — not mass imports. Volunteers will eventually log people they know; staff will review relationships and follow-ups. **Contact imports stay blocked** here. **Automation workers stay blocked.**

## Capability maps (offline)

- `data/native-text-command-center-capability-map.json` — Twilio webhook paths found, send-path detection (informational), communication-related models from `schema.prisma`.
- `data/relational-organizing-capability-map.json` — people-graph models and conservative readiness flags.

Regenerate maps and report:

```bash
cd H:\SOSWebsite\RedDirt
node scripts/validate-text-reach-foundation.mjs
node scripts/build-text-reach-foundation-report.mjs
```

## Related docs

- [`native-text-command-center.md`](./native-text-command-center.md)
- [`relational-organizing-foundation.md`](./relational-organizing-foundation.md)
- [`communication-command-center-readiness.md`](./communication-command-center-readiness.md)

No live outreach is enabled by this slice.
