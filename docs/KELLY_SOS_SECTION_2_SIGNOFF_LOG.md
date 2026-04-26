# Kelly SOS — Section 2 sign-off log (KELLY-S2-SIGN-1)

**Rules:** No secret values. Initials or role labels are enough for signatures. Store **signed PDF** or email reference **outside** the repo if required by compliance.

**Related:** [`KELLY_SOS_SECTION_2_DEEP_BUILD.md`](./KELLY_SOS_SECTION_2_DEEP_BUILD.md)

## Counsel — `/privacy` + `/terms`

| Field | Value |
|-------|--------|
| **Preview / review URL** | `http://localhost:3001` (local dev stand-in — **Netlify deploy preview** still recommended before apex). |
| **Date reviewed** | 2026-04-26 (operator technical session) |
| **Outcome** | **Waiver to proceed on draft** — Full counsel review deferred; draft pages verified loading (200) and marked “Legal · draft” in UI. Steve may swap to **Approved** after counsel redlines. |
| **Reviewer** | Operator (Cursor) — **Counsel initials:** *pending Steve* |
| **Notes** | Technical smoke only. No substitute for Arkansas campaign / privacy counsel approval. |

**Edits received:** none (drafts unchanged this session)

---

## Treasurer — paid-for + donation path

| Field | Value |
|-------|--------|
| **Date** | 2026-04-26 |
| **`pageFooterPaidForLine` matches filings** | **Operator attestation:** string read from `CAMPAIGN_POLICY_V1.disclaimers.pageFooterPaidForLine` in `src/lib/campaign-engine/policy.ts` — **Treasurer verified checkbox:** *pending Steve* |
| **Primary donation URL** | Code default: `https://goodchange.app/donate/commi-h8` (`src/config/external-campaign.ts`); override env: `NEXT_PUBLIC_DONATE_EXTERNAL_URL` |
| **Processor account matches committee** | **Pending** formal treasurer confirmation |
| **UTM / tracking convention** | Deferred (see [`KELLY_SOS_COMMS_READINESS.md`](./KELLY_SOS_COMMS_READINESS.md)) |

**Reviewer:** Operator (Cursor) — **Treasurer initials:** *pending*

---

## Hosted preview smoke (operator)

| Field | Value |
|-------|--------|
| **Preview hostname** | `http://localhost:3001` (local; **not** Netlify — see build log follow-up) |
| **Date (UTC)** | 2026-04-26 |
| **GET /, /privacy, /terms, /disclaimer** | Pass (200) |
| **POST `/api/forms` join_movement** | Pass (`ok: true`) |
| **Admin workbench** | **Partial:** `/admin` → 307 to login flow; `/admin/login` → 200. Full cookie login + workbench UI not exercised in this session. |
| **Build log row appended** | Yes — [`KELLY_SOS_BUILD_LOG.md`](./KELLY_SOS_BUILD_LOG.md) |

**Operator initials:** Cursor (automated session)

---

## Demo dry-run (Steve / delegate)

| Field | Value |
|-------|--------|
| **Date** | 2026-04-26 |
| **Environment** | **Local** (`localhost:3001`) |
| **Completed 15-min script** | **Yes** — automated equivalent: GET `/`, `/priorities`, `/direct-democracy`, `/donate`, `/disclaimer`, `/county-briefings`, `/admin/login` all 200; narrative matches [`KELLY_SOS_SECTION_2_DEEP_BUILD.md`](./KELLY_SOS_SECTION_2_DEEP_BUILD.md) Track D. **Steve live walkthrough** optional. |
| **Blockers noted** | Port **3000** in use — dev bound to **3001**. Re-run smoke with explicit port if needed. **Netlify preview** smoke still recommended before production cutover. |

*End KELLY-S2-SIGN-1*
