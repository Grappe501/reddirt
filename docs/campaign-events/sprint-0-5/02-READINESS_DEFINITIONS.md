# Lock Sheet 2 — Readiness Definitions

**Sprint 0.5 · Status:** Draft — pending leadership lock  
**Problem Sprint 0 exposed:** 66 counties labeled **weak** — mostly **missing KPI data**, not verified organizational weakness.

---

## Principle (lock this)

> **Unknown ≠ Weak.**  
> Until field validates a county, readiness should be **`unknown`** or **`moderate-assumed`**, not **`weak`**, in any engine that multiplies scores.

Sprint 0 used weak as default when county-workbench KPI was absent. **Do not encode that default in Priority 2.**

---

## Strong — what qualifies?

Check all that apply for a county to be labeled **Strong**:

| Criterion | Required? | Leadership: Y/N |
|-----------|-----------|-----------------|
| Named county chair (verified contact) | | |
| Named volunteer captain or Power of 5 lead | | |
| At least one public campaign event hosted or co-hosted in last 60 days | | |
| Event pipeline (≥2 upcoming local activities identified) | | |
| Regular volunteer activity (≥4 active volunteers on roster) | | |
| County workbench KPI score ≥ ___ (if used) | | |

**Locked definition (write in plain language):**

```text
[ LEADERSHIP: e.g. "Strong = chair + captain + visible activity in last 60 days" ]
```

---

## Moderate — what qualifies?

| Criterion | Leadership: Y/N |
|-----------|-----------------|
| Chair OR captain (not both) | |
| Sporadic activity (1–3 volunteers, irregular events) | |
| Pipeline exists but thin | |
| KPI score 35–64 (if used) | |

**Locked definition:**

```text
[ LEADERSHIP ]
```

---

## Weak — what qualifies?

**Only label Weak when field confirms weakness — not when data is missing.**

| Criterion | Leadership: Y/N |
|-----------|-----------------|
| No chair and no captain after outreach window | |
| No verified volunteer roster | |
| No event pipeline | |
| Chair/captain unresponsive ≥ ___ days | |

**Locked definition:**

```text
[ LEADERSHIP: e.g. "Weak = no chair/captain after 30-day outreach AND no volunteer bench" ]
```

---

## Unknown / unverified (recommend adding for engine)

| Label | Meaning |
|-------|---------|
| **unknown** | No KPI, no field validation — **do not multiply in deployment formula** |
| **moderate-assumed** | Interim label until field validates (optional) |

**Leadership decision:** Add `unknown` as fourth readiness state for Sprint 1? ☐ Yes ☐ No

**If Yes — lock these action distinctions:**

| State | Meaning | Field action |
|-------|---------|--------------|
| **Weak** | Verified problem | Intervention — chair, captain, pipeline |
| **Unknown** | Insufficient data | Information gathering — do not score as Weak |

The engine must not multiply Unknown down deployment priority until field validates.

---

## Counties to re-audit first (Sprint 0 Strong/Moderate only)

| County | Sprint 0 readiness | Field validated? | Locked readiness |
|--------|-------------------|------------------|------------------|
| Pulaski | strong | ☐ | |
| Craighead | strong | ☐ | |
| Benton | moderate | ☐ | |
| Washington | moderate | ☐ | |
| Faulkner | moderate | ☐ | |
| Saline | moderate | ☐ | |
| Lonoke | moderate | ☐ | |
| Garland | moderate | ☐ | |
| Sebastian | moderate | ☐ | |

---

## Lock record

| Field | Value |
|-------|-------|
| Locked by | |
| Locked date | |
| Field director sign-off | |
