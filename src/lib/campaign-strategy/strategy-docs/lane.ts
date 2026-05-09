import type { StrategyDoc } from "../types";

export const laneDocument: StrategyDoc = {
  path: "lane",
  title: "Targets & budget (LANE)",
  subtitle: "Single numbers lane: replace cells after each file refresh, finance close, or path-to-victory recalc.",
  eyebrow: "LANE · Budget · Victory math",
  blocks: [
    {
      kind: "callout",
      tone: "gold",
      title: "Owner + cadence",
      body: "Campaign Manager + Finance + Data triad signs off monthly. GOTV season: weekly LANE review; E-week: daily cash vs lockbox check.",
    },
    {
      kind: "h2",
      text: "1. Victory math (statewide)",
    },
    {
      kind: "p",
      text: "Use official turnout history for comparable statewide races as baseline. Scenarios below are a worksheet — not a prediction.",
    },
    {
      kind: "table",
      caption: "Illustrative SOS turnout scenarios (replace from data team)",
      headers: ["Scenario", "Implied turnout (votes)", "Approx. votes for majority", "Planning net margin cushion"],
      rows: [
        ["Low", "650,000", "325,001", "+15k – +25k"],
        ["Mid", "900,000", "450,001", "+25k – +40k"],
        ["High", "1,100,000", "550,001", "+35k – +55k"],
      ],
    },
    {
      kind: "p",
      text: "Planning hypothesis: build programs capable of producing ≥ ~35,000 net votes of combined value across persuasion, turnout, and registration attribution — replace with modeled gap after polling/file integration.",
    },
    {
      kind: "h3",
      text: "Margin allocator (by county tier)",
    },
    {
      kind: "table",
      headers: ["Tier", "Share of planning margin goal", "Role"],
      rows: [
        ["Tier 1 — Core PTV", "62% (range 58–68%)", "Registration velocity, persuasion IDs, GOTV depth"],
        ["Tier 2 — Expansion", "26% (range 22–30%)", "Fairs, LTE, one anchor per county"],
        ["Tier 3 — Long tail", "12% (range 10–15%)", "Visibility, digital geofence, annual touch"],
      ],
    },
    {
      kind: "h2",
      text: "2. Registration targets",
    },
    {
      kind: "ul",
      items: [
        "Statewide ambition: 50,000 new registrations (cycle) — aligns county workbench narrative",
        "Primary milestone (hypothesis): 12,000–18,000 before primary window",
        "Allocation: proportional to active registrants × tier multiplier, renormalized to 50K; floors Tier1 600 / Tier2 280 / Tier3 80",
        "Weekly pace (planning): ramp 350–600; peak fair season 900–1,400; final 8 weeks before deadline 1,200–2,000 / week",
      ],
    },
    {
      kind: "h2",
      text: "3. County tiers (scaffold)",
    },
    {
      kind: "p",
      text: "Tier 1 default includes Central (Pulaski, Faulkner, Saline, Lonoke, Pope), NWA (Benton, Washington), River Valley (Sebastian, Crawford), Northeast (Craighead, Greene, Mississippi), Delta (Crittenden, Jefferson, St. Francis), South (Union, Miller, Ouachita, Columbia). CM may trim to ~15 if capacity-constrained — document in changelog.",
    },
    {
      kind: "h2",
      text: "4. Budget mix (% of spend)",
    },
    {
      kind: "table",
      headers: ["Category", "Bootstrap phase", "General phase"],
      rows: [
        ["Travel & field logistics", "28–38%", "18–28%"],
        ["Paid media (radio, digital, print ads)", "12–22%", "34–46%"],
        ["Direct mail", "4–8%", "14–22%"],
        ["Merch, booths, printing, fairs", "10–16%", "8–14%"],
        ["People (payroll, stipends)", "18–28%", "14–22%"],
        ["Professional (legal, accounting)", "6–10%", "4–8%"],
        ["Tech / data / file", "2–5%", "3–6%"],
        ["Contingency + GOTV reserve", "≥10%", "≥15% from T-60"],
      ],
    },
    {
      kind: "h3",
      text: "GOTV lockbox (cash before T-21)",
    },
    {
      kind: "ul",
      items: [
        "Bootstrap: $35k – $75k reserved",
        "Primary scale: $75k – $125k",
        "General: $120k – $250k — finance adjusts to mail quotes and contracts",
      ],
    },
    {
      kind: "h2",
      text: "5. GOTV master backward plan",
    },
    {
      kind: "table",
      headers: ["Gate", "Time", "Objective"],
      rows: [
        ["GOTV-56", "T-56", "Captains named; training schedule"],
        ["GOTV-42", "T-42", "Mail land; shift signup ≥70%"],
        ["GOTV-21", "T-21", "Early vote chase; digital/SMS peak"],
        ["GOTV-7", "Final week", "Surge contact; SOS name in every script"],
        ["GOTV-4", "96h", "Rides; weather; hours verification"],
        ["GOTV-2", "48h", "Triple-confirm shifts; calm messaging"],
        ["E-Day", "E", "Lawful presence; hotline; incidents"],
      ],
    },
    {
      kind: "p",
      text: "Full program × time matrix (registration / persuasion / youth / relational / comms / faith / fundraising) lives in the manual LANE §6.2 — every program row spikes or stops on the same clock.",
    },
  ],
};
