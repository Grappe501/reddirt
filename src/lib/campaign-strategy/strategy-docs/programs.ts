import type { StrategyDoc } from "../types";

const gotvIntegration =
  "Every program spikes into LANE §6: use the GOTV program page for the master command rhythm; freeze or redirect activities at T-7 and T-21 per the integration matrix.";

export const programRegistration: StrategyDoc = {
  path: "programs/registration",
  title: "Voter registration & tracking",
  eyebrow: "Program",
  blocks: [
    { kind: "lead", text: "Partner-led execution (e.g. Get Loud Arkansas); campaign owns measurement, county goals, and RedDirt registrationGoal integers." },
    { kind: "h2", text: "KPI framework" },
    { kind: "ul", items: ["File-based new regs by county/week vs LANE §2.3 pace", "Partner trainings and correlated events", "Tier floors: red flag if Tier 1 <80% pro-rata for 4 weeks"] },
    { kind: "h2", text: "GOTV integration" },
    { kind: "ul", items: ["T-56→T-21: max lawful registration pushes", "At deadline: pivot scripts to vote plan only", "E-week: no unlawful registration persuasion at polls"] },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programTurnout: StrategyDoc = {
  path: "programs/turnout-persuasion-youth",
  title: "Turnout gaps, persuasion & youth",
  eyebrow: "Program",
  blocks: [
    { kind: "lead", text: "Close presidential→midterm drop-off with lawful cohorts; persuasion on competence frame; youth registration + vote plan before life transitions." },
    { kind: "h2", text: "Tier touch goals" },
    { kind: "table", headers: ["Tier", "Gap cohort touches (planning)"], rows: [["Tier 1", "≥3"], ["Tier 2", "≥2"], ["Tier 3", "≥1 digital + mail if budget"]]},
    { kind: "h2", text: "Persuasion freeze" },
    { kind: "p", text: "After T-7: no new persuasion arguments — logistics and vote plan only. Digital persuasion suppressed T-48h per LANE matrix." },
    { kind: "h2", text: "Youth" },
    { kind: "ul", items: ["Grad season surge in Tier 1", "Dorm address updates T-28", "Peer text surge T-7 where compliant"] },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programRelational: StrategyDoc = {
  path: "programs/relational-field",
  title: "Relational field & community intelligence",
  eyebrow: "Program",
  blocks: [
    { kind: "lead", text: "Trust density through gatherings and Power of Five; community tips route to events and GOTV inventory." },
    { kind: "h2", text: "Host → Captain pipeline" },
    { kind: "ol", items: ["Prospect → Host (≥1 gathering) → Captain (owns GOTV shift fill in Tier 1)"] },
    { kind: "h2", text: "LANE capacity hooks" },
    { kind: "ul", items: ["Tier 1: ≥8 active five-person molecules (planning)", "By T-56: captains named; by T-42: merch inventory with finance"] },
    { kind: "h2", text: "Fairs & intel" },
    { kind: "p", text: "Major fairs logged ≥T-56 feed sign stakes and GOTV packs; Tier 1 fair decisions in 72h if multi-day." },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programComms: StrategyDoc = {
  path: "programs/comms-media",
  title: "Communications, media & collateral",
  eyebrow: "Program",
  blocks: [
    { kind: "lead", text: "Push cards, fans, keychains, banners, yard signs; APA-assisted radio and newspapers; digital geofence by tier." },
    { kind: "h2", text: "GOTV inventory gates" },
    { kind: "ul", items: ["T-56: audit on-hand vs Tier 1 demand", "T-28: GOTV pack shipped per captain", "T-7: ≤5% contingency print for hours corrections only"] },
    { kind: "h2", text: "Creative cadence" },
    { kind: "ul", items: ["T-21+: every radio spot ends with hours/places tag (official)", "T-48h: digital persuasion off; turnout-only retarget if counsel allows", "Single research owner for hours T-7→E"] },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programRural: StrategyDoc = {
  path: "programs/rural",
  title: "Rural thesis & 75-county scale",
  eyebrow: "Program",
  blocks: [
    { kind: "lead", text: "Rural authenticity as asset; travel is distribution — share of budget in LANE §4.2." },
    { kind: "h2", text: "Tier resourcing" },
    { kind: "table", headers: ["Tier", "GOTV"], rows: [["Tier 1", "Full visibility EV + E-Day"], ["Tier 2", "Best effort + rides hotline"], ["Tier 3", "Signs-on-request + volunteer-dependent"]]},
    { kind: "h2", text: "Checklist" },
    { kind: "ul", items: ["Shift-change visibility where lawful", "Weather plan for outdoor stakes", "Sheriff/clerk liaisons on incident protocol"] },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programFaith: StrategyDoc = {
  path: "programs/faith-communities",
  title: "Faith & diverse communities",
  eyebrow: "Program",
  blocks: [
    { kind: "lead", text: "Invitation not invasion; multi-faith seriousness; electioneering boundaries per venue and counsel." },
    { kind: "h2", text: "Targets" },
    { kind: "ul", items: ["≥12 Methodist/mainline coffees Tier 1 pre-T-21 (planning)", "Spanish shifts T-14→T-7 in high-need counties", "Marshallese: address-update push T-28; centralized ride dispatcher"] },
    { kind: "h2", text: "GOTV" },
    { kind: "p", text: "Mosque-adjacent visibility only with imam approval; ride boards in community channels if moderators agree." },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programDirect: StrategyDoc = {
  path: "programs/direct-contact",
  title: "Direct contact: mail, phone, text, door",
  eyebrow: "Program",
  blocks: [
    { kind: "lead", text: "Consent-first; counsel-approved scripts before T-21 surge; hours-only creative in final week." },
    { kind: "h2", text: "Integrated calendar (summary)" },
    { kind: "table", headers: ["Window", "Focus"], rows: [["T-56–T-43", "ID + turf validation"], ["T-42–T-22", "Persuasion mail + phones"], ["T-21–E", "GOTV across modes"], ["T-7–E", "Double phones; surge text; visibility + doors"]] },
    { kind: "h2", text: "Compliance" },
    { kind: "callout", tone: "gold", title: "TCPA", body: "One bad actor can poison the program — supervise P2P and STOP/HELP paths." },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programGotv: StrategyDoc = {
  path: "programs/gotv",
  title: "GOTV & Election Day",
  eyebrow: "Program · Master execution",
  blocks: [
    { kind: "lead", text: "Authoritative backward plan: LANE §6. This page is field + legal execution depth — command structure, phases, daily rhythm, legal pack." },
    { kind: "h2", text: "Command structure" },
    { kind: "table", headers: ["Role", "Owns"], rows: [["GOTV Director / CM", "LANE §6 milestones; E-7 standup"], ["Legal", "Hotline; electioneering answers"], ["Data", "Public turnout pulse only"], ["Logistics", "Signs, kits, rides"], ["Comms", "Frozen hours creative; one research owner"]] },
    { kind: "h2", text: "Phase table" },
    { kind: "table", headers: ["Phase", "Window", "Focus"], rows: [["Build", "T-56→T-43", "Captains; turfs; training"], ["Arm", "T-42→T-22", "Mail; shift signup ≥70%"], ["Chase EV", "T-21→T-8", "Early vote; digital/SMS peak"], ["Close", "T-7→T-3", "100% supporter verify"], ["Final 48h", "T-48h→T-24h", "Rides; weather; triple confirm"], ["E-Day", "E", "Lawful presence; incidents"]] },
    { kind: "h2", text: "Daily E-week rhythm" },
    { kind: "ul", items: ["05:30 standup — weather, no-shows", "09:00 refresh hours → captains", "12:00 turnout pulse + mid-day fill", "17:00 EV issues + ride queue", "20:00 debrief; 22:00 rumor sweep to legal"] },
    { kind: "h2", text: "Legal pack (volunteer)" },
    { kind: "ul", items: ["Buffer distance one-pager T-7", "Lawyer + sheriff liaison numbers", "Zero tolerance misleading time/place", "Language access on hotline if deployed"] },
    { kind: "h2", text: "Primary vs general" },
    { kind: "p", text: "Primary: narrow visibility must-haves if volunteer pool thin. General: full LANE matrix; lockbox top-up within 14 days post-primary." },
  ],
};

export const programIntegrity: StrategyDoc = {
  path: "programs/integrity-tour",
  title: "Election integrity listening tour",
  eyebrow: "Program",
  blocks: [
    { kind: "lead", text: "Civic, non-threatening conversations — libraries, civic halls, local hosts. Not a forum for unsourced fraud claims." },
    { kind: "h2", text: "Volume & budget" },
    { kind: "ul", items: ["≥8–12 stops / general cycle (planning)", "$300–$800/stop illustrative — venue, coffee, print"] },
    { kind: "h2", text: "GOTV" },
    { kind: "p", text: "Pause new tour after T-21; leaders become GOTV liaisons only." },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programFundraising: StrategyDoc = {
  path: "programs/fundraising",
  title: "Fundraising & operations",
  eyebrow: "Program",
  blocks: [
    { kind: "lead", text: "Fund Tier 1 intensity and media scale; segregate GOTV lockbox — LANE §4." },
    { kind: "h2", text: "Rules" },
    { kind: "ul", items: ["No T-21 media that raids lockbox without dual sign-off", "Travel cluster ≥3 counties/trip where possible", "Promoter cap ~8% monthly gross — counsel final", "E-week travel pre-book T-28"] },
    { kind: "h2", text: "Weekly finance view" },
    { kind: "p", text: "Track plan vs actual: travel, media, mail, people, lockbox contribution — same standup as KPIs." },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programSocial: StrategyDoc = {
  path: "programs/social",
  title: "Distributed social media",
  eyebrow: "Program",
  blocks: [
    { kind: "lead", text: "Regional and county micro-leads; GOTV surge uses approved hours templates only." },
    { kind: "h2", text: "Cadence shift" },
    { kind: "table", headers: ["Layer", "Pre-T-21", "GOTV-21→E"], rows: [["HQ", "Daily review", "Hourly E-week"], ["Regional", "5–7×/wk", "2×/day max; 1 hours graphic"], ["Micro", "3–5×/wk", "Daily reshare approved"]] },
    { kind: "h2", text: "Paid social checklist" },
    { kind: "ul", items: ["Geo AR-only", "Disclaimers on all ads", "T-48h: persuasion off in ad manager", "E-day: low spend; no accidental national"] },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programInstitutional: StrategyDoc = {
  path: "programs/institutional-media",
  title: "Institutional & earned media",
  eyebrow: "Program",
  blocks: [
    { kind: "lead", text: "County parties, Extension-style rooms, APA, LTE waves — tie to captains and GOTV visibility." },
    { kind: "h2", text: "Meeting targets" },
    { kind: "table", headers: ["Tier", "Meetings/cycle", "GOTV deliverable"], rows: [["Tier 1", "≥3", "Named captain + sign inventory"], ["Tier 2", "≥2", "Fair OR GOTV booth"], ["Tier 3", "≥1", "Micro-lead intro"]]},
    { kind: "h2", text: "LTE" },
    { kind: "p", text: "Factual voting pieces T-14→T-3; Kelly byline attempts tracked vs Tier 1+2 goal in manual." },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programKpis: StrategyDoc = {
  path: "programs/kpis",
  title: "KPIs & measurement",
  eyebrow: "Operations",
  blocks: [
    { kind: "lead", text: "North-star dashboard weekly; LANE crosswalk on every metric; GOTV scoreboard T-21→E." },
    { kind: "h2", text: "Examples" },
    { kind: "ul", items: ["Cash vs lockbox §4.3", "Registration pace vs §2.3", "Molecule counts vs §5", "Shifts filled %; rides; hotline SLA"] },
    { kind: "h2", text: "Discipline" },
    { kind: "p", text: "If RedDirt cannot report a LANE metric, name one spreadsheet owner in standup. Post-election: variance memo vs allocator." },
    { kind: "p", text: gotvIntegration },
  ],
};

export const programCompliance: StrategyDoc = {
  path: "programs/compliance",
  title: "Compliance & governance",
  eyebrow: "Risk",
  blocks: [
    { kind: "lead", text: "Counsel on finance and contact law; hours accuracy is legal-adjacent risk T-7→E." },
    { kind: "h2", text: "GOTV pack" },
    { kind: "ul", items: ["Electioneering distances re-print T-14", "Text/call script re-approval if law changed", "STOP/HELP dry run T-28"] },
    { kind: "h2", text: "Incidents" },
    { kind: "table", headers: ["Severity", "Example"], rows: [["S1", "Wrong hours graphic — pull + correct"], ["S2", "Volunteer confrontation — legal + sheriff"], ["S3", "Data leak — counsel"]] },
    { kind: "p", text: "RedDirt readiness gates are organizational feature — no bypass for GOTV emergency without CM + counsel." },
  ],
};

export const programQuarterly: StrategyDoc = {
  path: "programs/quarterly-rhythm",
  title: "Quarterly execution rhythm",
  eyebrow: "Cadence",
  blocks: [
    { kind: "lead", text: "Monthly LANE reconciliation; weekly leadership in GOTV season; ≤8 weeks switches to war-plan mode." },
    { kind: "h2", text: "≤8 weeks checklist" },
    { kind: "table", headers: ["Weeks to E", "Must complete"], rows: [["8", "Captains 100% Tier 1"], ["6", "Shifts ≥70%"], ["4", "96h logistics dry run"], ["3", "Vote-plan sprint"], ["2", "Flake backup roster"], ["1", "Legal pack distributed; comms freeze"]] },
    { kind: "h2", text: "Accountability" },
    { kind: "table", headers: ["Gate", "Lead"], rows: [["T-56", "CM"], ["T-42", "GOTV + Data"], ["T-21", "GOTV + Comms"], ["T-7", "CM + Legal"], ["E", "CM + GOTV"]] },
  ],
};

export const PROGRAM_DOCUMENTS: StrategyDoc[] = [
  programRegistration,
  programTurnout,
  programRelational,
  programComms,
  programRural,
  programFaith,
  programDirect,
  programGotv,
  programIntegrity,
  programFundraising,
  programSocial,
  programInstitutional,
  programKpis,
  programCompliance,
  programQuarterly,
];
