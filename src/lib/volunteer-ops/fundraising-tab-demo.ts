import type { FundraisingLead } from "@/types/fundraising-lead";

export const DEMO_FUNDRAISING_LEADS: FundraisingLead[] = [
  {
    id: "fld-1",
    name: "Jordan M.",
    geography: "Creek County · Liberty",
    track: "adult",
    status: "active",
    personalFundraisingUrl: null,
    personalQrCodeUrl: null,
    donorCount: 18,
    dollarsRaised: 4200,
    eventsHosted: 2,
    hostsRecruited: 1,
    newDonors: 9,
    notes: "House party + reception pipeline",
  },
  {
    id: "fld-2",
    name: "Sam K.",
    geography: "Campus cluster · demo",
    track: "college",
    status: "training",
    personalFundraisingUrl: null,
    personalQrCodeUrl: null,
    donorCount: 64,
    dollarsRaised: 380,
    eventsHosted: 3,
    hostsRecruited: 0,
    newDonors: 52,
    notes: "Small-dollar focus — donor count first",
  },
  {
    id: "fld-3",
    name: "Riley T.",
    geography: "Neighborhood host circle",
    track: "adult",
    status: "invited",
    personalFundraisingUrl: null,
    personalQrCodeUrl: null,
    donorCount: 0,
    dollarsRaised: 0,
    eventsHosted: 0,
    hostsRecruited: 0,
    newDonors: 0,
  },
];

export type FundraisingReviewStage =
  | "Draft"
  | "Internal review"
  | "Ernie review"
  | "Mockup ready"
  | "Approved"
  | "Published";

export type FundraisingResourceItem = {
  title: string;
  stage: FundraisingReviewStage;
  note: string;
};

/** Review-gated library — no downloadable “final” assets on this surface. */
export const FUNDRAISING_RESOURCE_LIBRARY: FundraisingResourceItem[] = [
  { title: "Fundraising Lead Guide", stage: "Draft", note: "Awaiting internal review." },
  { title: "Adult Fundraising Playbook", stage: "Draft", note: "Awaiting internal review." },
  { title: "College Fundraising Playbook", stage: "Draft", note: "Awaiting internal review." },
  { title: "Small-Dollar Fundraising Guide", stage: "Draft", note: "Awaiting internal review." },
  { title: "QR Code Fundraising Guide", stage: "Draft", note: "Awaiting internal review." },
  { title: "Fundraising Event Ideas", stage: "Draft", note: "Consolidated from this dashboard; Ernie review pending." },
  { title: "Host Circle Guide", stage: "Draft", note: "Awaiting internal review." },
  { title: "County Fundraising Party Checklist", stage: "Draft", note: "Awaiting internal review." },
  { title: "Compliance Review Notes", stage: "Internal review", note: "Not for public distribution until Approved." },
];

export const FUN_FUNDRAISING_IDEAS: string[] = [
  "Karaoke night",
  "Paint and sip",
  "Progressive dinner",
  "House concert",
  "Coffee fundraiser",
  "Dessert night",
  "Backyard reception",
  "Student challenge night",
  "Trivia night",
  "Community potluck (where appropriate)",
  "Campus donor challenge",
  "Friend-to-friend QR night",
];

export type FundraisingKpiSnapshot = {
  leadsRecruited: number;
  activeFundraisers: number;
  donorCount: number;
  dollarsRaised: number;
  eventsHosted: number;
  hostsRecruited: number;
  newDonors: number;
  collegeDonorCount: number;
  adultDonorCount: number;
  countyPartiesScheduled: number;
  countyPartiesCompleted: number;
};

export function buildDemoFundraisingKpis(leads: FundraisingLead[]): FundraisingKpiSnapshot {
  const activeFundraisers = leads.filter((l) => l.status === "active" || l.status === "training").length;
  const collegeDonorCount = leads.filter((l) => l.track === "college").reduce((a, l) => a + l.donorCount, 0);
  const adultDonorCount = leads.filter((l) => l.track === "adult").reduce((a, l) => a + l.donorCount, 0);
  return {
    leadsRecruited: leads.length,
    activeFundraisers,
    donorCount: leads.reduce((a, l) => a + l.donorCount, 0),
    dollarsRaised: leads.reduce((a, l) => a + l.dollarsRaised, 0),
    eventsHosted: leads.reduce((a, l) => a + l.eventsHosted, 0),
    hostsRecruited: leads.reduce((a, l) => a + l.hostsRecruited, 0),
    newDonors: leads.reduce((a, l) => a + l.newDonors, 0),
    collegeDonorCount,
    adultDonorCount,
    countyPartiesScheduled: 6,
    countyPartiesCompleted: 2,
  };
}

/** Map KPI to 0–100 for 20-square display (demo caps). */
export function fundraisingKpiPercent(value: number, cap: number): number {
  if (cap <= 0) return 0;
  return Math.min(100, Math.round((value / cap) * 100));
}
