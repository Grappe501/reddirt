# Chapter 23 — Pathway campaign (how people and work split across the system)

**Philosophy (manual, not a single route):** People **choose** pathways. They may move **up** (turf) or **sideways** (skills, family constraints). The **Pathway Guide** in product should **recommend** — **not** shame — and **automation** fills **gaps** only where **compliance** allows until **humans** take over. **Power of 5** grows **network**; **Workbench** coordinates **labor** and **triage**; **OIS** shows **progress** in **aggregates** to **everyone** who can see a dashboard.

## 1. What “pathways” are in code (today)

- **Get involved** / **7-way** (see site) → **`POST /api/forms`** to specific **formType**s.  
- **Power of 5** ` /onboarding/power-of-5`.  
- **Relational** app under `/relational/*` — **parallel** **member** experience (verify auth).  
- **Field** and **OIS** for **geography** progression.  
- There is **no** single `Path` enum in Prisma in Pass 2A; **use** `VolunteerProfile`, `Commitment`, `FieldAssignment`, `TeamRoleAssignment` as **stitch points** when building a future **Pathway** registry.

## 2. Training to expertise

- **Organizing Guide** (content) + in-person/Zoom training **tracked** in **asks** and **events**; **mastery** **badges** are **TBD** (no shame metrics).

## 3. Splitting work

- **Tasks**, **asks**, **P5** teams, **county** leaders — by design; **OIS** should **never** assign **voter** **microtasks** to **unvetted** volunteers (DATA-1).

## 4. Every person sees progress (when dashboard is real)

- **Self** vs **self**-last-week; **team** in **P5** with **consent**; **turf** as **chips/aggregates** only in public OIS.

## 5. Workbench and Pathway (division of labor)

- **Pathway** = **recruitment** and **retention** story; **Workbench** = **operator** and **triage** truth; do **not** confuse a **public** “next step” with **unreviewed** **internal** queue items.

**Status:** **Pass 2B** — 2026-04-27
