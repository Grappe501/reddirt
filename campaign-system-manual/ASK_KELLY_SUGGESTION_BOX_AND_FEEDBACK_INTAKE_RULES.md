# Ask Kelly — suggestion box and feedback intake rules (Manual Pass 5H)

**Lane:** `RedDirt/campaign-system-manual`  
**Type:** **Governance** **—** **Ask** **Kelly** is **the** **controlled** **suggestion** **box** **and** **feeds** **approval**-**ready** **packets** **;** **not** **a** **second** **MCE** **send** **channel** **,** not **a** **public** **debate** **thread** **(see** `ASK_KELLY_BETA_FEEDBACK_TO_APPROVAL_FEED_WORKFLOW.md` **,** `CANDIDATE_TO_ADMIN_UPDATE_PACKET_SYSTEM.md` **).**  

**Ref:** `ASK_KELLY_EXPLAIN_WHY_GUIDE.md` · `CAMPAIGN_COMPANION_PUBLIC_SIMPLE_VIEW_RULES.md` · `playbooks/APPROVAL_AUTHORITY_MATRIX.md` · `playbooks/ESCALATION_PATHS.md` · `MANUAL_INFORMATION_REQUESTS_FOR_STEVE.md` **§**45

---

## 1. What Ask Kelly is for (launch)

- **The** **public** / **beta** path for **suggestions,** not **a** **spray** of **untracked** DMs.  
- **A** **generator** **of** **routable** **items** **(feedback** **items** that **become** **or** **attach** to **packets) ** for **admin** **/ ** **candidate** **/ ** **comms** **/ ** **counsel** **per** **RACI** **. **

---

## 2. Suggestion types (categorize on intake)

- Typo / wording  
- Confusing page or section  
- Missing explanation  
- Feature idea (small UX / clarity / flow — not a promise to build)  
- Organizing or volunteer experience suggestion  
- Volunteer onboarding / Pathway / first-action suggestion  
- Policy / FAQ phrasing (routes to MCE + counsel as needed)  
- Accessibility issue  
- Mobile / iPad usability issue  
- County or local context suggestion  
- Risk / compliance / trust concern (escalation path — not a public flamewar)  

---

## 3. Required specificity (intake form fields)

Answer **as** **well** as **the** user **can**; **rejects** **vague** **rants** with **a** **polite** **“** **need** **more** **detail** **”** **(see** **§**5** **).**  

| Prompt | What we need |
|--------|----------------|
| **What** **page** **or** **feature?** | e.g. “Get Involved” **—** not “the site.” |
| **What** **exact** **text** **or** **UI** **?** | Quote **or** **describe** **the** **button/line** **. ** |
| **What** **is** **confusing?** | One **sentence** on **cognitive** **friction** **. ** |
| **What** **change** **do** **you** **suggest?** | **Concrete,** not “make** **it** **better** **. **” |
| **Why** **would** **this** **help?** | **User**-**centric** **reason** **. ** |
| **Who** **would** **benefit?** | e.g. first-time **volunteer,** **rural** **county,** **screen** **reader** **. ** |
| **Urgent?** | Yes/No/unsure. |
| **Does** **this** **touch** **public** **claims,** **$$,** **legal,** **data,** **or** **outreach?** | Checkbox **(routes** **risk) **. **

---

## 4. Good vs bad examples

**Bad:** “**Make** this **better** **. **”  
**Good:** “**On** **Get** **Involved,** the **top** **button** **says** **[quote]** **. ** New **volunteers** may **bail** if **it** **sounds** **like** a **huge** **time** **ask** **. ** Suggest: **“** **Start** **with** **one** **person** **”** or **a** **two**-**line** **subtext** **on** **time** **. **”

**Bad:** “**I** **hate** **onboarding** **. **”  
**Good:** “**I** **got** **stuck** **after** **[step] **: **I** **didn’t** **know** if **[X]** **was** **required** **. ** Suggest: **a** **single** **line** **: ****‘** **You** **can** **save** **and** **come** **back** **. ****’**”

---

## 5. How suggestions become packets and queue items

1. **Submitted** (timestamp, role slice: public / beta, no raw PII in public logs).  
2. **Categorized** (type from §2).  
3. **Deduped** (near-duplicate text + same page; merge or link).  
4. **Impact**-**scored** (per `WEBSITE_EDIT_IMPACT_...` and risk flags: legal, $, 4B, GOTV, contrast).  
5. **Routed** (owner: admin, comms, counsel, product/engineering backlog — see `playbooks/ESCALATION_PATHS` **+** **matrix) **. **  
6. **Status** (see `ASK_KELLY_BETA_FEEDBACK_...` **: ** New** **→** **Implemented** / **Declined** / **Parked,** **etc.) **. **

**Not** every item becomes **static** **copy** the **same** **day** **;** **high**-**impact** **touches** **MCE+** **/ ** **LQA** **/ ** **counsel** **as** **governed** **. **

---

## 6. Public / beta response (what the user may see)

- **Thank** them; **confirm** what **was** **captured** **(summary,** not **a** **full** **internal** **ticket** **id** in **a** **voter**-**facing** **line) **. **  
- **Do** **not** **promise** adoption; **do** **promise** **review** in **a** **plain** way **(“** the **team** **will** **look** at **this** in **[cadence] **,** not **a** **guarantee** of **a** **date** **in** **beta) **) **. **  
- **Explain** **the** **next** **governance** **step** at **high** **level;** **not** an **open** **comment** **war** on **the** **public** page **(no** **public** **argument** **loop) **. **

---

## 7. Admin view (design fields)

- **Source** (beta / public, channel).  
- **Page** or **feature** id **(human,** not **`src/...` **).**  
- **Full** **suggestion** **+ ** **specificity** **score** **(qualitative** **or** **0**–**3) **. **  
- **Impact** **(none** **/ ** **low** **/ ** **med** **/ ** **high) **. **  
- **Routing** **/ ** **owner** **. **  
- **Recommended** **next** **action** (Preview to packet, MCE, counsel, **park) **. **

---

## 8. No public argument loop

- **We** do **not** **debate** **individuals** in **public** over **a** **suggestion;** **we** **thank,** **triage,** and **govern** **(see** 5B **+ **5D **+ **5F **) **. **

---

**Last updated:** 2026-04-28 (Pass 5H)
