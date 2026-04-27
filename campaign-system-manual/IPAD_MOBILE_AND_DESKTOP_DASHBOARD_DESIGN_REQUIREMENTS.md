# iPad, mobile, and desktop dashboard design requirements

**Lane:** `RedDirt/campaign-system-manual`  
**Status:** **Manual Pass 4B** — UX / product requirements in prose. **Not** a shipped UI.  
**Date:** 2026-04-28  
**Public language:** **Workbench**, **Campaign Companion**, **Guided Campaign System** — **not** “AI assistant UI.”

**See also:** `CANDIDATE_AND_CAMPAIGN_MANAGER_STRATEGY_DASHBOARD_REQUIREMENTS.md`, `INTERACTIVE_STRATEGY_WORKBENCH_AND_SCENARIO_SLIDER_SYSTEM.md`, `playbooks/DASHBOARD_ATTACHMENT_RULES.md`, `SYSTEM_READINESS_REPORT.md`.

---

## 1. Executive summary

**Most** day-to-day campaign work will happen on **iPads** in the field, in vehicles, and at events. The **admin Workbench** and **future** **strategy** surfaces must be **iPad-first**: large **touch** targets, **landscape-optimized** primary flows, and **read-only** or **gated** controls on small screens. **Desktop** remains the **edge-to-edge** **command** view for long sessions, bulk triage, and **finance**-heavy review. **Phone** is **alert + light read**; **not** the primary place to **change** high-impact **assumptions** unless **policy** explicitly allows.

---

## 2. iPad-first operating reality

- **Field staff, CM, and often candidate** will carry tablets with **cellular** where affordable.  
- **Offline** and **low-connectivity** (rural routes) are **expected**; **no** design may assume **permanent** **live** data (see **§**13).  
- **Security:** devices should support **MDM** or **minimum** **screen** **lock** and **session** **timeout** (Steve — MI **§**38).

---

## 3. Candidate dashboard on iPad

- **Emphasis:** **schedule**, **time** **load**, **message** **discipline**, **one**-**screen** “**ahead/behind** on **our** **plan**” (not on vote).  
- **Sliders** that affect **time** and **public** **schedule** = **tight** gating; **$**-linked sliders **read-only** or **request**-only by default.  
- **No** PII or **voter** **rows** on **candidate** **tablet** unless **counsel** and **data** **policy** **explicitly** allow.

---

## 4. Campaign manager dashboard on iPad

- **Primary** work surface: **open** work, **tasks**, **intakes** — as today in **admin** (readiness 5 in area per `SYSTEM_READINESS_REPORT.md`).  
- **Add (future):** **strategy** **panel** with **scenarios** in **Preview**; **Propose** **changes** that **flow** to **approvals** on **desktop** if **complex** (multi-sim).

---

## 5. Field / county dashboard on iPad

- **OIS**-adjacent, **county** **context**, **event** and **tour** **SOPs** — **read-only** to **turf** and **voter** **rows** by **role** only.  
- **Maps** and **lists:** **no** **screenshots** to **unsecured** **channels** (SOP, not just UI).

---

## 6. Volunteer dashboard on mobile

- **Member** `dashboard` is **shallow** today — do **not** overpromise in copy. **Future:** **Pathway** **steps**, **tasks** assigned to **self**, **no** **strategy** sim.

---

## 7. Desktop edge-to-edge command view

- **Multi**-**pane** layout: **left** navigation, **center** work area (tasks / intakes), **right** **context** (strategy strip, sim **preview** when present).  
- **Tables** and **wide** **diffs** (scenario **A** vs **B**) — **primary** on **wide** **displays** only.  
- **Theme:** **serious** **ops** **tooling**; **not** a **game**.

---

## 8. Touch target standards (guidance)

- **Minimum** **48×48** **pt**-equivalent for **primary** **actions**; **padding** for **thumb** **collision** in **car** and **standing** use.  
- **Sliders** with **haptic**-optional; **label** the **value** and **implied** **$** or **hour** **cost** where relevant.

---

## 9. Navigation model

- **Top** **tab** or **left** **rail** for **Workbench** sub-apps (tasks, email, intakes, **future** **strategy**).  
- **Deep** links to **calendar** and **comms** **briefs**; **breadcrumbs** for **“which** **scenario** **am** **I** **in?**”

---

## 10. Slider and scenario UI behavior

- **Preview** does **not** **mutate** **ledger** or **send** **vendor** **orders**.  
- **Save** “**Proposed**” **→** **approval** **queue** (future in-app) or **manual** **RACI** **today**.  
- **Show** **coupled** **warnings** (travel + call time) per `INTERACTIVE_STRATEGY_...` §22.

---

## 11. KPI card behavior

- **Cards** show **trend** + **confidence** + **source** **label** (“**trailing** **3** **weeks** **treasurer** **export**” vs “**assumption**”).  
- **No** public **P**II or **per**-**voter** **stats**.

---

## 12. Map and table behavior

- **Map:** **cluster** at **low** **zoom**; **no** **home**-**level** **dots** in **public** or **shared** **screenshots**. **Staff**-only **turf** **as** product allows.  
- **Tables:** **sort** and **filter**; **export** = **LQA** **gated** (see matrix).

---

## 13. Offline / low-connectivity expectations

- **Show** last **sync** **time**; **degrade** **sim** to **stale** **with** **banner**; **block** “**lock** **baseline**” if **stale** **> TBD** (Steve).  
- **Queue** **changes** for **reconcile** when **online** (product future).

---

## 14. Accessibility requirements

- **WCAG**-aligned color **contrast**; **text** **resize**; **reduced** **motion** for **KPI** **animations**; **VoiceOver**-friendly **labels** for **readiness** **strips** and **alerts** (iPad).

---

## 15. Budget requirement: 3–5 iPads (planning)

- **Plan** to **purchase/lease** **3–5** iPads (mix of **base** and **cellular** as needed). **Line** item **lives** in **treasurer** **budget** and **`FinancialTransaction`** when bought — not **only** in this manual.

---

## 16. Device assignment policy (TBD with Steve)

- **Which** **roles** get **cellular** vs **wifi**-only.  
- **Check**-in / **return** for **shared** **pool** devices.  
- **No** **shared** **1Password**-style **secrets** in **notes** (use **MDM** or **env**-appropriate **tools** per ops).

---

## 17. Data and security on devices

- **Screen** **lock**; **MDM** if **funded**; **remote** **wipe** for **loss**.  
- **No** **voter** **file** in **ungoverned** **Dropbox**; use **defined** **exports** and **DPA** path.

---

## 18. Current repo support (honest)

- **Admin** **Next** app with **Workbench** path — **use** for **triage** **today** on **desktop**; **iPad** may work in **browser** but **is** **not** **a** **certified** **“optimal”** **tablet** **shell** in this doc’s sense. **Personal** `dashboard` remains **low** **maturity** for **volunteers** (`SYSTEM_READINESS_REPORT.md`).

---

## 19. Missing product features

- **Responsive** **breakpoints** and **hardened** **iPad** **CSS** for **all** **admin** **workflows** (incomplete today — verify before claiming).  
- **Offline** **queue**; **assumption** **registry**; **sim** **service**; **KPI** **explainer** **panel**; **assumption** **diff** and **approvals**.

---

## 20. Steve decision list

- **iPad** **count**, **cellular** **lines**, and **per**-**role** **assignment** (see MI **§**38).  
- **Minimum** **bar** to **operate** **sliders** from **iPad** (edit vs. view).  
- **Data** **retention** on **devices**; **bypass** of **2FA** in **emergency** (if any) — **data** and **compliance** lead.

---

**Last updated:** 2026-04-28 (Pass 4B)
