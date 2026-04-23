# Submission → ledger bridge (FIN-1) (RedDirt)

The **`Submission`** model is a **flexible** **intake** **log** **:** **`type` **(string) **+** **`content` **(text) **+** **optional** **`structuredData` **(JSON) **. **It** **is** **not** **a** **financial** **schema** **;** most **public** **forms** **(join,** **volunteer,** **story) **are **not** **money**-**bearing** **. **

**Seam (code):** `src/lib/campaign-engine/financial-ingest.ts` — **`isFinancialSubmission`**, **`extractDraftTransactionsFromSubmission` **(often **empty) **. **

**Cross-ref:** [`financial-ledger-foundation.md`](./financial-ledger-foundation.md) · `prisma/schema.prisma` (`Submission`, `FinancialTransaction`)

---

## 1. Why a bridge

- **Classify** **whether** **a** **submission** **even** **deserves** **a** **ledger** **row** **(human** **+** **optional** **flags) **. **
- **Extract** **financial** **meaning** **from** **structured** **JSON** **where** **you** **intentionally** **add** **it** **—** **not** **by** **guessing** **dollar** **amounts** **from** **free** **text** **in** **FIN-1** **. **
- **Materialize** **`FinancialTransaction` **rows** **(typically** **DRAFT) **only** **after** **Review** **in** **a** **future** **admin** **flow** **(FIN-2+) **. **

---

## 2. Target pipeline (human-governed)

1. **Submission** **review** — **staff** **opens** the **intake** **(existing** **admin** / **intake** **UIs) **. **
2. **Classification** **—** **financial** **vs** **not** **(default** **not) **; **`isFinancialSubmission` **is** **a** **hint** **only** **. **
3. **Extraction** **—** **manual** **entry** **or** **assisted** **(future) **from **`structuredData` **; **`extractDraftTransactionsFromSubmission` **returns** **draft** **lines** **only** **when** **explicit** **JSON** **keys** **exist** **(e.g. **`ledgerAmountDollars` **+ **`ledgerCategory`) **. **
4. **Ledger** **row** **creation** **—** **create** **`FinancialTransaction` **with **`sourceType` **=** **SUBMISSION**, **`sourceId` **=** **submission** **id,** **`status` **=** **DRAFT** **by** **default** **(FIN-2** **wiring) **. **
5. **Human** **confirmation** **—** **flip** **`status` **to** **CONFIRMED** **only** **when** **treasury** / **compliance** **is** **satisfied** **(future** **UI) **. **

---

## 3. Honest limits in FIN-1

- **No** **NLP** **/ regex** **on** **`content` **to** **pull** **amounts** **(too** **error**-**prone) **. **
- **No** **automatic** **create** **from** **every** **submission** **. **
- **Optional** **keys** you **can** **add** **to** **structured** **data** **later** (product decision): **`ledgerAmountDollars` **, **`ledgerCategory` **, **`ledgerCandidate: true` **, **etc** **. **

---

*Last updated: Packet FIN-1.*
