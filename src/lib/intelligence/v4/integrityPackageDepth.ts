/**
 * 2021 integrity foundation package — operator depth for v6.2 opposition strategy layer.
 * Source: data/opposition/kim-hammer-profile/kim-hammer-kh0b-2021-integrity-foundation.json
 */

export type Integrity2021BillAnchor = {
  billNumber: string;
  actNumber: number;
  theme: string;
  clerkImpact: string;
  actProofHref: string;
  arklegUrl: string;
};

export type Integrity2021PackageDepth = {
  packageId: string;
  sessionYear: string;
  headline: string;
  plainEnglishSummary: string;
  narrativeArc: string[];
  billAnchors: Integrity2021BillAnchor[];
  debateTrap: {
    baitLine: string;
    setupQuestion: string;
    kellyPivot: string;
    whyItWorks: string;
  };
  kellyMessageHelp: string;
  whenNotToUse: string;
  continuityLink2025: string;
};

export const INTEGRITY_2021_PACKAGE_DEPTH: Integrity2021PackageDepth = {
  packageId: "kh0b-2021-integrity-foundation",
  sessionYear: "2021/2021R",
  headline: "2021 six-bill integrity architecture — continuity trap anchor",
  plainEnglishSummary:
    "Kim Hammer primary-sponsored six bills (Acts 727–729, 973–974, 1051) resetting enforcement, precinct control, ballot-record access, absentee handling, election-board governance, and a complaint hotline — the earliest documented integrity architecture in the KH-0B set.",
  narrativeArc: [
    "2021 establishes enforcement-first posture before later petition fights.",
    "County administration centralized early — not a 2025 discovery.",
    "Transparency narrows for voted ballots while compliance duties expand for counties.",
    "Absentee tightening precedes 2023 drop-box debates.",
    "2025 petition friction continues procedural control — not a fresh start.",
    "Kelly contrast: SOS implementation partner vs legislator stacking unfunded mandates.",
  ],
  billAnchors: [
    {
      billNumber: "SB486",
      actNumber: 728,
      theme: "Electioneering penalties",
      clerkImpact: "Poll workers absorb new enforcement boundaries at the door.",
      actProofHref: "/admin/intelligence/kim-hammer/bills/SB486/act-proof",
      arklegUrl: "https://www.arkleg.state.ar.us/Bills/Detail?id=SB486&ddBienniumSession=2021%2F2021R",
    },
    {
      billNumber: "SB487",
      actNumber: 729,
      theme: "Precincts / polling sites / vote centers",
      clerkImpact: "Site changes require lead time — rural voters feel drive-time shifts.",
      actProofHref: "/admin/intelligence/kim-hammer/bills/SB487/act-proof",
      arklegUrl: "https://www.arkleg.state.ar.us/Bills/Detail?id=SB487&ddBienniumSession=2021%2F2021R",
    },
    {
      billNumber: "SB488",
      actNumber: 727,
      theme: "Voted ballot records / FOIA",
      clerkImpact: "Clerks navigate narrowed public inspection rules for voted ballots.",
      actProofHref: "/admin/intelligence/kim-hammer/bills/SB488/act-proof",
      arklegUrl: "https://www.arkleg.state.ar.us/Bills/Detail?id=SB488&ddBienniumSession=2021%2F2021R",
    },
    {
      billNumber: "SB582",
      actNumber: 1051,
      theme: "County election board governance",
      clerkImpact: "Election board procedures change — another training cycle for counties.",
      actProofHref: "/admin/intelligence/kim-hammer/bills/SB582/act-proof",
      arklegUrl: "https://www.arkleg.state.ar.us/Bills/Detail?id=SB582&ddBienniumSession=2021%2F2021R",
    },
    {
      billNumber: "SB643",
      actNumber: 973,
      theme: "Absentee ballot handling",
      clerkImpact: "Absentee process tightened — clerks reprogram workflows.",
      actProofHref: "/admin/intelligence/kim-hammer/bills/SB643/act-proof",
      arklegUrl: "https://www.arkleg.state.ar.us/Bills/Detail?id=SB643&ddBienniumSession=2021%2F2021R",
    },
    {
      billNumber: "SB644",
      actNumber: 974,
      theme: "Election-law complaint hotline",
      clerkImpact: "New compliance channel — counties field hotline-driven complaints.",
      actProofHref: "/admin/intelligence/kim-hammer/bills/SB644/act-proof",
      arklegUrl: "https://www.arkleg.state.ar.us/Bills/Detail?id=SB644&ddBienniumSession=2021%2F2021R",
    },
  ],
  debateTrap: {
    baitLine: "‘My 2025 bills are a fresh start on election security.’",
    setupQuestion: "You sponsored six major election bills in 2021 — how is 2025 different for county clerks?",
    kellyPivot: "Open 2021 package timeline — continuity of architecture, not a new direction.",
    whyItWorks: "Pre-briefed voters see pattern; he must defend cumulative record.",
  },
  kellyMessageHelp:
    "Kelly runs the office that trains counties — contrast legislator adding duties vs SOS delivering service.",
  whenNotToUse:
    "Do not cite FOIA exemption scope beyond verified act text. No stolen-election framing.",
  continuityLink2025:
    "2025 petition package (Acts 218, 240, 274, 241, 768) stacks on 2021 architecture — use trap lane 2021-vs-2025-pivot.",
};

export type Petition2025BillAnchor = {
  billNumber: string;
  actNumber: string | null;
  theme: string;
  actProofHref: string;
};

export type Petition2025ClusterDepth = {
  headline: string;
  plainEnglishSummary: string;
  billAnchors: Petition2025BillAnchor[];
  hammerExpectedFrame: string;
  kellyOffensiveLead: string;
  packoAngle: string;
  trapLaneHref: string;
};

export const PETITION_2025_CLUSTER_DEPTH: Petition2025ClusterDepth = {
  headline: "2025 petition / direct-democracy restriction cluster",
  plainEnglishSummary:
    "Hammer's 2025 session adds friction to initiative and referendum canvassing — Kelly frames as continuity from 2021 architecture, not a pivot. Verify each act on Arkleg before stage citations.",
  billAnchors: [
    { billNumber: "SB207", actNumber: "218", theme: "Petition signature verification", actProofHref: "/admin/intelligence/kim-hammer/bills/SB207/act-proof" },
    { billNumber: "SB208", actNumber: "240", theme: "Canvasser registration", actProofHref: "/admin/intelligence/kim-hammer/bills/SB208/act-proof" },
    { billNumber: "SB210", actNumber: "274", theme: "Petition process restrictions", actProofHref: "/admin/intelligence/kim-hammer/bills/SB210/act-proof" },
    { billNumber: "SB211", actNumber: "241", theme: "Ballot title / summary rules", actProofHref: "/admin/intelligence/kim-hammer/bills/SB211/act-proof" },
    { billNumber: "SB296", actNumber: "768", theme: "Petition package capstone", actProofHref: "/admin/intelligence/kim-hammer/bills/SB296/act-proof" },
  ],
  hammerExpectedFrame: "Fraud prevention and election security require tighter petition rules.",
  kellyOffensiveLead:
    "Arkansas voters cherish ballot measures — SOS protects lawful signatures with transparent rules, not slogans.",
  packoAngle: "May agree on access theme — distinguish Kelly as daily administrator vs reform voice.",
  trapLaneHref: "/admin/intelligence/trap-lanes/2021-vs-2025-pivot",
};
