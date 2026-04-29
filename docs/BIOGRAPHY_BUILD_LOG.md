# Biography build log

Structured notes for the literary narrative biography manuscript (`src/content/biography/`).

## Editorial standards (standing rules)

- **Anchor scene:** Every chapter must include **at least one anchor memory or scene**—a vivid, concrete moment readers can return to (Chapter 1: Highway 7; prom · Chapter 2: Ziglar tapes + Dixie · Chapter 3: playground dirt · Chapter 4: Little Rock training room + earlier WM glimpses · Chapter 5: **Steve and Kelly — BFF** tree carving; Christmas-room certainty to adopt; carving rediscovered ~20 ft high · Chapter 6: Rose Bud between Romance and Joy; kitchen ↔ yard; Verizon Little Rock call center ~800+; Arkansas River high-rise · Chapter 7: Sherwood duplex HQ; six concurrent petitions; people showing up · Chapter 8: river tower / Sherwood / Capitol triptych—scale shifts, ethic unchanged; operational trust framing SOS duties · Epilogue: Arkansas roads & fields; Grace’s next generation (**Weston**; baby **summer 2026**); **Highway 7** closing beat; **Steve Grappe** signature).
- **Facts:** Polishing and sensory *experience* language are allowed; **no new factual claims** unless sourced.
- **Tone:** Literary narrative biography—not campaign copy. Restraint over melodrama.

---

## 2026-04-29 — Meet Kelly ↔ biography UX (dropdown + About drill-down)

- **`navigation.ts`:** Meet Kelly submenu adds **Biography arcs (on About)** → `/about#kelly-biography-arcs`, plus four **Biography — {navShortLabel} (Ch. x–y)** → `/biography#pillar-{id}` (driven from `biography-narrative-pillars` **`navShortLabel`**).
- **`AboutBiographyDrilldown` + `BiographyPillarSection`:** `/about` now surfaces arc cards with **deep-dive chapter lists** under each pillar; `/biography` reuses the same grid (**`variant="hub"`**, no redundant jump row).
- **`KellyFullStory`:** Top callout routes readers to arcs hub + `/biography`.

---

## 2026-04-29 — Epilogue — Still Driving That Road (Cursor polish pass)

- **Source:** Steve narrative draft; continuous prose (`epilogue.md`). **ChatGPT image URLs stripped.** Closing attribution **— Steve Grappe** retained.
- **Facts retained:** story settles into continuity without spectacle; **Arkansas** landscape / roads / towns / early family drive as choice of life; **Grace** grown—past systemic helplessness—home/community/family belonging; **Weston**; **second grandchild expected summer 2026**; grandparent shift (**urgency softens, responsibility stays**; moments/time); synthesis of prior arcs as **one road**; values beyond titles (consistent showing-up, unwatched work, building to last); forward motion as continuation not slogan; **Highway 7** return—beautiful, difficult, “felt right”; completeness vs “finished”; intentional life / family / work / road home.
- **Anchors:** Highway 7 closing; Grace’s children named timeline.
- **Mini-novel:** manuscript chapters **1–8 + epilogue** now drafted in `src/content/biography/chapters/`.

---

## 2026-04-29 — Chapter 5 — The Long Road Back (Cursor polish pass)

- **Source:** Steve narrative draft; continuous prose (`chapter-05-leaving-stability.md`). **ChatGPT image URLs stripped.**
- **Facts retained:** Steve/Kelly bond; **Selmer** / **grandparents**; **Fort Leonard Wood** graduation with Kelly’s family present; tree behind **grandfather’s house**, carving **Steve and Kelly — BFF**, later ~**twenty feet** up; drift/silence; intersections (**training reunion** → **December** tied to father’s work); girl **~four**, blonde, adoption spoken **that night**; legal process; **Grace** as chosen name; Steve breakfast **meet my daughter**; **eight years** until she is **his daughter too**; return to Tennessee / carving.
- **Anchors:** bark heart; tinsel certainty; letters overhead.
- **Bridge:** Chapter 6 — Between Romance and Joy.

---

## 2026-04-29 — Chapter 5 — Steve editorial micro-pass (third tighten)

- Opening softened (**surface again / stepped away**) vs **shoulder back into view** / forced noticing.
- **High school** lead trimmed slightly around furniture metaphor (**furniture holds a room** kept verbatim).
- **Untouched:** *“Wood held the joke until memory could circle back for it.”*; adoption declaration block (**Logic protested…** through conscience/paper—Steve asked adopt-only tweak omitted to preserve balance); **coffee steamed; syllables stayed small…**
- Tree return: kept opener **“The carving rode higher than memory remembered”** + **Wood remembers what phones lose.**—compressed middle (**lifted toward light / rings** → tighter overhead wording).
- Closing collapsed stacked metaphors (**weather / itinerary**) into **two short grafs**; retained closing road sentence.

---

## 2026-04-29 — Chapter 6 — Between Romance and Joy (Cursor polish pass)

- **Source:** Steve narrative draft; continuous prose (`chapter-06-forevermost.md`). **ChatGPT image URLs stripped.**
- **Facts retained:** intentional family with **Grace** at center; **Steve** choosing Kelly + Grace; move to **Rose Bud** between **Romance** and **Joy** for village texture; home rhythms (table, yard); **Verizon** leadership of **Little Rock call center** (**800+** people); **high-rise** on **Arkansas River**; parallel ethic across scales; subtle bridge toward broader responsibility (Chapter 7 civic arc).
- **Anchors:** kitchen vs river tower parallels.
- **Bridge:** Chapter 7 — The People Showed Up.

---

## 2026-04-29 — Chapter 8 — Steve editorial micro-pass (closing tighten)

- Opening split into two sentences; dropped **sketched on paper** for simpler cadence.
- Preparation graf broken before **Three distances on the map** for punch.
- **Sherwood / SOS / trust blocks:** intentionally untouched beyond wording trims elsewhere.
- “People rarely crave complexity…” softened into **Most people do not want labyrinthine government…**.
- Buildings graf trimmed stacked metaphor (**silhouette + colon list + dash clause**) → shorter spine sentence before scale line.
- Closing softened **mystique…care** → **plain upkeep beats theater** / **stance**.

---

## 2026-04-29 — Chapter 8 — The Office (Cursor polish pass)

- **Source:** Steve narrative draft; continuous prose (`chapter-08-the-office.md`). **ChatGPT image URLs stripped.**
- **Facts retained:** convergence—not sudden—of Verizon river-tower scale, intentional family with Grace, Sherwood ground-up organizing; **Secretary of State** duties framed as **elections**, **business filings**, **public records**, operational **trust**; management/maintenance/accountability; Capitol parallel to prior “rooms”; reliability over visibility; trust through transparency / willingness to explain systems plainly (“under the hood” idea in literary paraphrase); not career-politician framing but lived systems/volunteer/family experience; continuation not endpoint tone.
- **Anchors:** three-building parallel (tower · duplex · Capitol).
- **Bridge:** Epilogue — Still Driving That Road (Steve draft pending).

---

## 2026-04-29 — Biography hub — four narrative pillars + Meet Kelly nav

- **`biography-narrative-pillars.ts`:** Four arcs for `/biography` cards — (1) **Formation** Ch 1–3, (2) **Scale & home** Ch 4–6, (3) **Civic ground** Ch 7, (4) **Office & road** Ch 8–9 — short summaries map mini-novel → chapter nav without replacing `/about/[slug]` essays.
- **`navigation.ts`:** Meet Kelly dropdown adds **Kelly’s story — chapters** → `/biography`.
- **`NavDesktop` (`theme=dark`):** `html.dark` remapped **`--kelly-fog`** so navy-bar labels went **dark-on-navy**; pale submenu panels plus **`text-kelly-text`** went **light-on-light**. Bar labels/chevron now **`text-white/*`**; dark-theme dropdown uses **white panel + `text-kelly-navy`** so dark reading mode cannot wash chrome.

---

## 2026-04-29 — Chapter 7 — The People Showed Up (Cursor polish pass)

- **Source:** Steve narrative draft; continuous prose (`chapter-07-the-people-showed-up.md`). **ChatGPT image URLs stripped.**
- **Facts retained:** concern/listening before tactics; **Steve** leads **LEARNS** **referendum** organizing; **Kelly** supports structure (training, clarity, volunteer placement); **Sherwood** **duplex** HQ—petitions, **notaries**, steady answers; **six** concurrent **initiative petitions**; grind/long hours; parallel discipline to corporate steadiness without org-chart fiction; lease temporary; narrative-not-persuasion tone.
- **Anchors:** duplex HQ; six-petition precision.
- **Bridge:** Chapter 8 — The Office.

---

## 2026-04-29 — Chapter 4 — Steve editorial micro-pass

- Opening shortened (seasons line tightened); **rooms** paragraph grounded (**numbers, rosters, quotas**) vs stacked metaphors.
- Leadership block **split** into two paragraphs; retained scale vs consequence clarity.
- Steve beat: first sentence shortened at walk-in; reflective graf tightened while preserving **“two histories brushing inside fluorescent certainty.”**
- Closing **de-poeticized** (removed **terrain / narrative gravity** framing).
- **Left verbatim:** *“Speaking could lift a moment; teaching could change what happened after the lights stayed on.”*; measurable kindness / throughput; destiny **flicker** lines; breakfast scene.

---

## 2026-04-29 — Chapter 4 — Learning to Lead at Scale (Cursor polish pass)

- **Source:** Steve narrative draft; continuous prose (`chapter-04-learning-to-lead.md`). **ChatGPT image URLs stripped** (same policy as Ch 3).
- **Facts retained:** Industrial-psychology bridge from Ch 3; **Alltel → Verizon** arc; leadership/teaching at scale; **Steve** in **Jonesboro** (pager/text era); **bag phones** / **Alltel** certification path → **Little Rock** training; **Kelly as trainer**, Steve as trainee—reconnection; drift and reopening without forcing romance; **Modern Woodmen**–linked holiday gathering with brief encounter with **a little girl**; separate beat—breakfast / **“come meet my daughter”** (Steve’s daughter) during reunion-related travel.
- **Anchors:** fluorescent training-room recognition; quieter table scenes as foreshadow only (no Grace/name ahead of timeline).
- **Bridge:** Chapter 5 — Long Road Back (tree, adoption arc, fuller Steve + family).

---

## 2026-04-29 — Chapter 3 — Steve editorial micro-pass (second tighten)

- Opening trimmed (faster landing); strength line shortened per note; decision question sharpened (**“again and again”** → **“kept arriving”**); closing grounded (**“changed clothes”** → **“shifted”**).
- **Left untouched:** *“The sentence landed quietly and refused to lift.”*; attachment / paperwork line; afford-to-carry logic; children who “did not pack up and leave.”

---

## 2026-04-29 — Chapter 3 — The Child Who Changed the Path (Cursor polish pass)

- **Source:** Steve narrative draft; continuous prose in-repo (`chapter-03-the-turning-point.md`). **External ChatGPT image URLs stripped** from manuscript—replace with owned imagery later if needed.
- **Facts retained:** Lyon → psychology → daycare assignment; four foster siblings ages **one through four**; Kelly assigned **two-year-old**; playground escapes; **repeated dirt eating**; therapist explains **malnourishment** instinct; attachment; **return** to prior placement; pivot to **industrial psychology**; inner pull toward children persists as seed for later chapters (no Grace/adoption named here).
- **Anchors:** playground scene; honesty about limits inside the system.
- **Bridge:** Chapter 4 — operational leadership (Alltel / Verizon).

---

## Manuscript outline — refined (Steve, Apr 2026)

Working titles and narrative spine; **markdown filenames** (`chapter-03-…`) unchanged so `/about/deep-dive/[slug]` URLs stay stable.

| Order | Working title | Planned beats (not all drafted) |
|-------|----------------|--------------------------------|
| 1 | The Road That Brought Her Here | Faith, Arkansas, Steve origin |
| 2 | Finding Her Voice | Identity, communication, seed toward children |
| 3 | The Child Who Changed the Path | Foster / daycare pivot → emotional weight |
| 4 | Learning to Lead at Scale | Alltel → Verizon |
| 5 | The Long Road Back | Steve reunion arc; training-room moment; tree motif; adoption decision seeds |
| 6 | Between Romance and Joy | Grace, farm, Rose Bud |
| 7 | The People Showed Up | Stand Up Arkansas, organizing |
| 8 | The Office | Secretary of State |
| Epilogue | Still Driving That Road | Grandchildren, legacy |

**Cause → echo → fulfillment → legacy:** Grace / family material lands mid-book (Chapters 5–6); Chapter 3 sets up only what sourced drafts support.

---

## 2026-04-29 — Chapter 2 — Steve editorial micro-pass (applied in repo)

- Split through-line block into **surface episodes** vs **habits / children thread**; fixed awkward “from above” → **on the surface**.
- Closing tightened: dropped generalized “what almost no one sees”; shorter rails paragraph; Lyon + purpose paragraphs streamlined.
- Dixie: shifted to **past perfect** (“had died only recently”) per optional distance note.
- **Preserved:** opening line; Zig + Steve **“nerd joy”** car anchor (untouched).

---

## 2026-04-29 — Chapter 1 — editorial tighten pass

- **10% tighten, improved flow, surgical edits only** (opening trim, compressed “preparation” arc, strengthened Highway 7 sensory layer without new facts, sharper band line, faster prom setup, split closing for breath).
- **Preserved verbatim:** the prom payoff sentence beginning *“because some stories do not begin where romance begins.”*
- **Next:** human micro-edit pass; Chapter 2 added (see below).

---

## 2026-04-29 — Chapter 2 — Finding Her Voice (Cursor polish pass)

- **Source:** Steve full narrative outline; tightened to continuous prose (no mid-chapter headings or bullet lists), matching Chapter 1 literary style.
- **Added facts per Steve/Cursor handoff:** Dixie Martin as journalism mentor (noted as recently deceased); shared Zig Ziglar tapes in the car with Steve—two self-aware “nerds.”
- **Seed only:** quiet attention toward children; the fuller family story is **not** told here (reserved for Chapters 5–6 per plan).
- **Anchors:** car rides with Zig on cassette; Dixie / yearbook craft.
- **Preserved bridge:** Lyon College, psychology—Chapter 3 setup (“the child who changed the path”).
- **Next:** human micro-edit; then **Chapter 3 — The Child Who Changed the Path.**

---

## 2026-04-29 — Chapter 1 — initial draft

- **Chapter 1** drafted from Steve-provided source facts (`chapter-01-the-road-that-brought-her-here.md`).
- Cursor polished sentence rhythm, transitions, and pacing only; **no new factual claims** added beyond the supplied outline.
- **[VERIFY]** notes: none placed in this chapter; denominations and church names were intentionally omitted per source constraints.
- **Next recommended chapter:** Chapter 2 — Finding Her Voice.
