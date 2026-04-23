# Contactability and call-time precheck — foundation (FUND-1) (RedDirt)

This document defines a **governed** process for **phone** **(and, where relevant, channel)** **readiness** before a number appears on a **candidate**-facing or **principals**-only call sheet. It is **architectural**; FUND-1 does not ship a vendor integration or a dialer.

**Cross-ref:** [`fundraising-desk-foundation.md`](./fundraising-desk-foundation.md) · [`user-scoped-ai-context-foundation.md`](./user-scoped-ai-context-foundation.md) · [`automation-override-and-impact-foundation.md`](./automation-override-and-impact-foundation.md) · `User.phone` in Prisma · `src/lib/campaign-engine/fundraising.ts` (`ContactabilityStatus`)

---

## 1. Why precheck exists

- **Candidate** and **principals** have **scarce** time; a sheet full of **wrong**, **unreachable**, or **channel**-mismatched numbers wastes that time and **damages** trust in **data**.
- **Compliance** and **opt-in** **rules** (SMS, **TCPA**-adjacent) mean **line** **suitability** is not a **one**-size **E.164** string.
- **AI** and **vendors** can **assist** **classification**; they **must not** **silently** mark numbers “**approved**” for **regulated** use without **policy** and **override** **hooks**.

---

## 2. Contactability model (stages)

Conceptual **pipeline** (not all persisted in the repo in FUND-1):

1. **Raw** — a phone value exists (e.g. on `User.phone`, a CSV import, or a future `Prospect` record).
2. **Normalized** — digits-only / E.164 where applicable; **reject** or **quarantine** obvious garbage.
3. **Validated** — basic **length** and **format**; **not** a **claim** the **subscriber** is **reached**.
4. **Line intelligence** (optional vendor) — **line** **type** (mobile, landline, **VoIP** where available), **carrier**-level **metadata**; **treat** as **probabilistic** **unless** **contracted** **otherwise** **with** **the** **vendor** **.**
5. **Channel** **suitability** — **Voice**-OK, **SMS**-OK (requires **separate** **opt-in** **truth**; see `ContactPreference` / `SmsOptInStatus` for **comms** **users** **—** **donor**-specific **opt-in** may **require** **additional** **model** in **future** **packets** **)** **.**
6. **Candidate**-**call**-**ready** — meets **configurable** **human**-approved **rules** (e.g. not **suppressed**, not **DNC** in **our** list, not **“review”** **unless** **explicit** **ack**).
7. **Questionable** / **review** — ambiguous **line** type, **disposable** **risk** **heuristics**, or **ops** **flag**.
8. **Suppressed** / **do** **not** **use** — **hard** **do**-**not**-**call**, **stale** **protest**, **or** **legal** **hold** **(human**-set**)**.

**Types:** `ContactabilityStatus` in `src/lib/campaign-engine/fundraising.ts` — **naming** **only** in **FUND-1** **.** 

---

## 3. What “good number” should mean (honest)

- **Not** “**donor** **will** **answer**” or “**this** is **a** **good** **person** to **ask** for **money**” — that is **strategic** **(research** **+** **stewardship** **).**
- **Is** “**has** **passed** the **pre**-**flights** we **agreed** to **for** **this** **channel** and **this** **use**-**case**” — **technically** **plausible** and **governance**-**appropriate** **enough** for **this** **candidate** **or** **staff** **call** **block** **.** 
- Vendors and **heuristics** can **misfire**; **overrides** and **re**-**checks** must **remain** **first**-**class** **.** 

---

## 4. Signals to check (categories)

| Category | Notes |
|----------|--------|
| **Format** / **validity** | E.164 / NANP **rules**; **strip** **extensions**; **household** **line** **dedupe** (future) |
| **Line** **type** | Mobile vs landline vs **VoIP** (vendor-dependent) |
| **Status** / **reachability** | **Disconnected** / **suspect** (vendor) — **treat** as **stochastic** **.** |
| **Virtual** / **disposable** **risk** | **Heuristics**; **not** a **banned** **list** in **FUND-1** **.** |
| **Prior** **outcomes** | **Dials** with **0**% **connect** **(when** **we** have **dial** **logs** **)**; **bump** to **review** **.** |
| **Manual** **override** / **ops** **notes** | **ALIGN**-style **provenance**; **must** be **loggable** in **FUND-2+** **.** |

---

## 5. Human governance

- **Thresholds** for “**candidate**-**ready**” must be **configurable** and **per**-**role**-**sensible** (e.g. **stricter** for **principals** than **for** **interns** on **a** **practice** list).
- **Humans** can **downgrade** or **override** any **auto**-**suggested** **state**; **overrides** should **feed** the **override**-**learning** **rail** (ALIGN-1) when **warranted** **.** 
- **Compliance** (DNC, **consent**, **ethics** **rules** on **solicitation** **)** remains **outside** the **“technical**-**ok**” **badge**; **separate** **flags** in **the** **UI** **(future) **.**
- **FUND-1** does **not** **implement** **logging** **tables** for **line**-**level** **history**; **FUND-2+** should **. **

---

## 6. Next packets

- **FUND-2** — Persisted **row**-level **contactability** state + **vendor** **adapter** **interface** (no **vendor** **key** in **open** **source** if **avoidable**).
- **FUND-2** — **Integration** with **prospect** / **import** **pipelines** and **a** **review** **queue** for **“questionable**” **.**
- **FUND-3** — **A** / **B** test **(optional) **on **vendor** **thresholds** **+** **human** **override** **metrics** **.** 

*Last updated: Packet FUND-1.*
