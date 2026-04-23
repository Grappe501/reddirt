# Voter strength model — multi-signal classification (DATA-3) (RedDirt)

**Packet DATA-3 (multi-signal).** **Composite labels** for organizing and targeting **without** numeric scores. Labels are **assigned** only when **supported by ingested, reviewable signals** — see [`voter-signal-inventory.md`](./voter-signal-inventory.md).

**Cross-ref:** [`voter-strength-foundation.md`](./voter-strength-foundation.md) (DATA-2 — pre-score concepts) · [`voter-signal-combination.md`](./voter-signal-combination.md)

---

## 1. Principles

- **Labels ≠ predictions** — they summarize **observed** behavior and **declared** relationships.
- **No scores in DATA-3** — ordinal **tiers** only, with **audit** of which signals fired.
- **Opposed** is included **only** when **explicit** negative signal exists (e.g. documented opt-out, public opposition flag in governed data — **not** inferred from silence).

---

## 2. Classification tiers

| Tier | Meaning | Typical signal families (examples — not requirements) |
|------|---------|--------------------------------------------------------|
| **Strong Base** | Repeated **support behaviors**: giving, repeated volunteering, **multiple** high-trust touches. | Confirmed **CONTRIBUTION**; **repeat** `EventSignup` / leadership role; REL-2 **committed** disposition **when** exists; **not** contradicted by negative signals. |
| **Likely Supporter** | Clear positive **without** “strong” depth. | Single **contribution**; active **volunteer**; **matched** initiative signer sheet; **comms** segment tagged “supporter” **with** SOP. |
| **Leaning** | Positive **indicators** but thin evidence. | One event; **single** relational contact **warm**; initiative signer **without** other signals. |
| **Persuadable** | **No** strong positive or negative; **reachable**. | On roll + **contact path**; or **only** geographic/context signals. |
| **Low Propensity Supporter** | **Aligned** signals but **infrequent participation** **when** history exists. | **History ingest** shows **rare** voting **with** positive non-vote signals — **requires** DATA-4 history data. |
| **Unknown** | **Insufficient** data after merge — default. | New registrants; **no** match to lists; **no** volunteer/donor/comms row. |
| **Opposed** | **Explicit** opposition or **hard** suppression. | **Documented** “do not contact”; **legal/opt** flags in `ContactPreference` or vendor status **where** campaign defines “opposed”; **never** from missing data. |

---

## 3. Network proximity (REL-2)

When **`RelationalContact`** exists:

- **Proximity** to **Strong Base** volunteer (short path, **trusted** tie) may **elevate** tier **at most** one step **if** policy allows — **human** or **rule** documented in [`voter-signal-combination.md`](./voter-signal-combination.md).
- **Never** replace **explicit** negative signals.

---

## 4. Donor status

| Observation | Directional use |
|-------------|-----------------|
| **`CONTRIBUTION` + `relatedUserId`** | Strong **material** support for **Likely** or **Strong** depending on **recency/repeat** (manual or future rollup). |
| **No contribution** | **No** negative inference. |

---

## 5. Participation history

| Observation | Directional use |
|-------------|-----------------|
| **`EventSignup`**, **`VolunteerProfile`**, **`Commitment`** | **Engagement** toward **Likely** / **Strong**. |
| **Future vote-history ingest** | **Frequency** → **Low Propensity Supporter** vs **Persuadable** splits **only** with DATA-4. |

---

## 6. Engagement (comms / digital)

| Observation | Directional use |
|-------------|-----------------|
| **Segment membership**, **reply** patterns (if stored) | **Tactical** only — **governed** by comms policy; **weak** alone for **Strong Base**. |

---

*Last updated: Packet DATA-3 (multi-signal, Part B).*
