# Voter signal combination logic (DATA-3) (RedDirt)

**Packet DATA-3 (multi-signal).** How **multiple signals** resolve to **one** strength tier **without** arithmetic scores. Suitable for **rules engine** or **human review** queue in DATA-4+.

**Cross-ref:** [`voter-strength-model.md`](./voter-strength-model.md) · [`voter-signal-inventory.md`](./voter-signal-inventory.md)

---

## 1. Inputs

- Per-person **signal set**: booleans / enums from DB and future ingests (donor, volunteer, initiative match, history frequency, REL-2 disposition, suppression flags).
- Each signal carries **`source`**, **`asOfDate`**, **`confidence`** (optional qualitative: `HIGH|MEDIUM|LOW`).

---

## 2. Precedence rules (ordered)

1. **Hard suppression / opposed** — if **`Opposed`** conditions met → **Opposed** (stop).
2. **Strong Base rules** — if **any** “strong” combo matches (see §3) → **Strong Base** unless (1).
3. **Likely Supporter** — else if **any** “likely” combo → **Likely Supporter**.
4. **Leaning** — else if **any** “leaning” combo → **Leaning**.
5. **Low Propensity Supporter** — else if **history** shows **low frequency** **and** **positive** non-history signals → **Low Propensity Supporter** (only when history ingest exists).
6. **Persuadable** — else if **on roll** + **reachable** (contact info or relational path) → **Persuadable**.
7. **Unknown** — default.

**Tie-break:** **highest** tier wins among non-conflicting positives; **Opposed** always wins.

---

## 3. Example combinations (illustrative, not code)

| Signals | Outcome tier |
|---------|----------------|
| **Confirmed CONTRIBUTION** (repeat or high threshold per SOP) + **volunteer** | **Strong Base** |
| **CONTRIBUTION** once **or** **approved** initiative match + **on roll** | **Likely Supporter** |
| **Initiative signer** only | **Leaning** |
| **Volunteer / event** only | **Leaning** or **Likely** per SOP depth |
| **REL-2 warm** + **no** other signals | **Leaning** |
| **Frequent voter** (future history) + **no** positive campaign signals | **Persuadable** or **Unknown** — **do not** call “base” without positive **campaign** signal |
| **Infrequent voter** (future) + **donor** | **Low Propensity Supporter** |
| **No signals** | **Unknown** |

---

## 4. Conflict handling

| Conflict | Resolution |
|----------|------------|
| **Positive donor** + **explicit do-not-contact** | **Opposed** / suppressed — **comms** wins over money for **outreach**. |
| **Contradictory** segment tags | **Lower** confidence; route to **manual** review bucket. |
| **Stale** data | **Recency** rule: ignore signals older than **policy** window unless **marked** persistent (e.g. lifetime donor flag — future field). |

---

## 5. Missing data handling

- **Absence** of signals → **Unknown** or **Persuadable** (if on roll + contactable) — **never** **Opposed**.
- **Partial** match (e.g. name only) → **do not** promote tier; keep **Unknown** until **`VoterRecord`** or **`User`** link **confirmed**.

---

## 6. Implementation note (DATA-4+)

Store **`VoterStrengthAssignment`** (name TBD) with `tier`, `signalSnapshotJson`, `reviewStatus`, `decidedByUserId` — **human** can **override** rules with reason.

---

*Last updated: Packet DATA-3 (multi-signal, Part C).*
