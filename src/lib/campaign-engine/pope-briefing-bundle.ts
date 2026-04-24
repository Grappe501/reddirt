/**
 * Assembles Pope + COUNTY-INTEL-2 static briefing JSON (aggregate only, no PII).
 */
import hammerDryRun from "../../../data/intelligence/generated/arkleg-hammer-ingest-summary.dryrun.json";
import { buildAggregateDropoffProfile } from "./aggregate-dropoff";
import { buildPopeCountyPoliticalProfile } from "./county-profiles/pope-county";
import { buildCountyWinStrategy } from "./county-win-strategy";
import {
  buildCountyRegistrationGoal,
  buildStatewideRegistrationGoalProgress,
  getCountyRegistrationSnapshotSummary,
} from "./registration-kpis";

type HammerRow = { billNumber: string; session: string; title: string; topics?: string[]; role: string };

function pushCap<T extends { billNumber: string; session: string }[]>(arr: T, item: T[number], cap = 20) {
  if (arr.length >= cap) return;
  if (arr.some((x) => x.billNumber + x.session === item.billNumber + item.session)) return;
  arr.push(item);
}

function categorizeHammer(rows: HammerRow[]) {
  type Item = { billNumber: string; session: string; title: string; titleConfidence: "title-metadata-only" };
  const by = {
    directDemocracy: [] as Item[],
    sosElectionAuthority: [] as Item[],
    countyClerks: [] as Item[],
    votingSystems: [] as Item[],
    electionFinance: [] as Item[],
    capitolSos: [] as Item[],
    publicEducation: [] as Item[],
    other: [] as Item[],
  };

  for (const r of rows) {
    const t = r.title;
    const item: Item = { billNumber: r.billNumber, session: r.session, title: t, titleConfidence: "title-metadata-only" };
    const tl = t.toLowerCase();
    if (/initiative|referendum|ballot title|petition/i.test(t)) pushCap(by.directDemocracy, item);
    else if (/secretary of state|state board of election/i.test(t)) pushCap(by.sosElectionAuthority, item);
    else if (/county clerk/i.test(t)) pushCap(by.countyClerks, item);
    else if (/voting machine|absentee|ballot (?!title)/i.test(t)) pushCap(by.votingSystems, item);
    else if (/campaign finance|election.*ethics/i.test(t)) pushCap(by.electionFinance, item);
    else if (/capitol|SB307|state capitol/i.test(t)) pushCap(by.capitolSos, item);
    else if (/\b(school|education|teacher|student)\b/i.test(tl)) pushCap(by.publicEducation, item);
    else pushCap(by.other, item);
  }
  return by;
}

export const KELLY_HOME = "https://www.kellygrappe.com";
export const KELLY_VOLUNTEER = "https://www.kellygrappe.com/volunteer";

export async function buildPopeIntelBriefingBundle() {
  const [profile, dropoff, regSum, regState, regGoal] = await Promise.all([
    buildPopeCountyPoliticalProfile(),
    buildAggregateDropoffProfile("Pope", "05115"),
    getCountyRegistrationSnapshotSummary("Pope"),
    buildStatewideRegistrationGoalProgress(50_000),
    buildCountyRegistrationGoal("Pope", 50_000),
  ]);
  const win = buildCountyWinStrategy(profile);
  const controversial = (hammerDryRun as { controversial: HammerRow[] }).controversial ?? [];
  const hammerCategorized = categorizeHammer(controversial);
  const fileSupplement = {
    primaryTurnoutComparison: {
      source: "electionResults (canonical set)",
      pope2024Primary: { file: "2024_Primary.json", note: "See election ingest for current DB rows." },
      pope2026PreferentialPrimary: { file: "2026_Preferential_Primary.json", note: "Preferential — verify certified totals for messaging." },
      state2026Primary: { note: "Statewide 2026 primary turnout in file set — not candidate-level." },
    },
    fieldAssessmentNotInData: {
      threeWayLibertarian:
        "Narrative about protest votes or party splits is not in election JSON; cite public reporting.",
    },
  };

  const siteSearch = {
    entries: [
      { href: "index.html", title: "Home", keywords: "pope kelly grappe" },
      { href: "pages/how-we-win.html", title: "How we win", keywords: "strategy aggregate" },
      { href: "pages/registration-50k.html", title: "50K registration", keywords: "register civic" },
      { href: "pages/turnout-dropoff.html", title: "Turnout drop-off", keywords: "midterm primary" },
      { href: "pages/county-demographics.html", title: "Demographics", keywords: "census acs" },
      { href: "pages/plurality-libertarian.html", title: "Plurality", keywords: "three way" },
      { href: "pages/hammer-record.html", title: "Hammer record", keywords: "bills" },
      { href: "pages/campaign-plan.html", title: "Campaign plan", keywords: "engine" },
      { href: "pages/get-involved.html", title: "Get involved", keywords: "volunteer" },
      { href: "pages/sources.html", title: "Sources", keywords: "verify" },
    ],
  };

  return {
    packet: "COUNTY-INTEL-2" as const,
    profile,
    aggregateDropoff: dropoff,
    registrationKpis: { county: regSum, statewide50k: regState, countyShare: regGoal },
    howWeWin: win,
    hammer: {
      researchNote:
        "Hammer rows are title/metadata level from arkleg-hammer dry-run. Do not state legal effects beyond what staff verifies on Arkleg text.",
      categories: hammerCategorized,
    },
    fileSupplement,
    siteSearch,
    links: { kellyHome: KELLY_HOME, kellyVolunteer: KELLY_VOLUNTEER },
    generatedAt: new Date().toISOString(),
  };
}
