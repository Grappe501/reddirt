/**
 * Phase 1 — Candidate dossier briefing book layer.
 * Bio narrative chapters, read-aloud rehearsal blocks, depth scoring for build progress.
 */
import { loadKellyGrappeCandidateDossier } from "@/lib/intelligence/v4/loadKellyCandidateDossier";
import {
  loadKimHammerCandidateDossier,
  loadMichaelPackoBioTimeline,
  loadMichaelPackoCandidateDossier,
} from "@/lib/intelligence/v4/loadOpponentCandidateDossier";
import { getKellyDossierSections } from "@/lib/intelligence/v4/kellyCandidateDossierDepth";
import {
  getOpponentDossierSectionsForCandidate,
  type OpponentDossierDepthSection,
} from "@/lib/intelligence/v4/opponentCandidateDossierDepth";

export type BioNarrativeChapter = {
  candidateId: string;
  displayName: string;
  eyebrow: string;
  paragraphs: string[];
  readAloudClerkRoom: string;
  readAloudDebate: string;
  sourceNote?: string;
};

export type DossierBriefingBookProgress = {
  kellyPct: number;
  hammerPct: number;
  pakkoPct: number;
  overallPct: number;
  kellySectionsAtBar: number;
  hammerSectionsAtBar: number;
  pakkoSectionsAtBar: number;
};

const MIN_NARRATIVE_PARAGRAPHS = 2;
const MIN_WORDS_PER_PARAGRAPH = 35;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sectionMeetsBriefingBar(
  narrativeOverview: string[],
  debateScripts: string[],
): boolean {
  const richParagraphs = narrativeOverview.filter((p) => wordCount(p) >= MIN_WORDS_PER_PARAGRAPH);
  return richParagraphs.length >= MIN_NARRATIVE_PARAGRAPHS && debateScripts.length >= 1;
}

function scoreSections(sections: Array<{ narrativeOverview: string[]; howToUseInDebate: string[] }>): {
  pct: number;
  atBar: number;
} {
  if (!sections.length) return { pct: 0, atBar: 0 };
  const atBar = sections.filter((s) => sectionMeetsBriefingBar(s.narrativeOverview, s.howToUseInDebate)).length;
  return { pct: Math.round((atBar / sections.length) * 100), atBar };
}

function scoreKellySections(
  sections: Array<{ narrativeOverview: string[]; howToUseInDebate: string[]; debateFramingExample: string }>,
): { pct: number; atBar: number } {
  if (!sections.length) return { pct: 0, atBar: 0 };
  const atBar = sections.filter((s) =>
    sectionMeetsBriefingBar(
      s.narrativeOverview,
      s.howToUseInDebate.length ? s.howToUseInDebate : [s.debateFramingExample],
    ),
  ).length;
  return { pct: Math.round((atBar / sections.length) * 100), atBar };
}

export function computeDossierBriefingBookProgress(): DossierBriefingBookProgress {
  const kellySections = getKellyDossierSections();
  const hammerSections = getOpponentDossierSectionsForCandidate("kim-hammer");
  const pakkoSections = getOpponentDossierSectionsForCandidate("michael-packo");

  const kelly = scoreKellySections(
    kellySections.map((s) => ({
      narrativeOverview: s.narrativeOverview,
      howToUseInDebate: s.howToUseInDebate,
      debateFramingExample: s.debateFramingExample,
    })),
  );
  const hammer = scoreSections(hammerSections);
  const pakko = scoreSections(pakkoSections);

  const overallPct = Math.round((kelly.pct + hammer.pct + pakko.pct) / 3);

  return {
    kellyPct: kelly.pct,
    hammerPct: hammer.pct,
    pakkoPct: pakko.pct,
    overallPct,
    kellySectionsAtBar: kelly.atBar,
    hammerSectionsAtBar: hammer.atBar,
    pakkoSectionsAtBar: pakko.atBar,
  };
}

export function buildKellyBioNarrativeChapter(): BioNarrativeChapter {
  const dossier = loadKellyGrappeCandidateDossier();
  const { past, present, future } = dossier.thirtySecondBioFramework;

  return {
    candidateId: "kelly-grappe",
    displayName: dossier.displayName,
    eyebrow: "Briefing book · biography chapter",
    paragraphs: [
      dossier.executiveSummary,
      `Kelly Grappe's career arc centers on organizational leadership and training systems — from Verizon operations to Rock Dental management — where success meant building reliable processes, developing people, and coordinating large teams under pressure. That is not résumé padding for a statewide office: the Secretary of State runs election administration across seventy-five counties, each with different staffing, equipment, and quorum-court politics. Kelly's frame is Experience → Skill → Office — lived management translated into clerk support, not abstract promises.`,
      `Parallel to corporate leadership, Kelly co-founded Stand Up Arkansas and invested years in rural civic education — helping Arkansans understand how government works and how to participate lawfully. The SOS office runs elections education, public records literacy, and Capitol stewardship programs. Kelly's civic-education work maps directly to those duties: she has already done the "explain complex systems in plain English" job that clerks and voters need from a Secretary of State.`,
      `Rose Bud roots and small-farm ownership anchor Kelly's rural perspective — the communities that depend on state filing systems, notary networks, and county election infrastructure every day. Her campaign pledge is transparent administration and depoliticized service: the office belongs to every voter. In debate, Kelly connects past (${past.join("; ")}) to present (${present.join("; ")}) and closes on future (${future.join("; ")}).`,
      `Staff should treat this biography chapter as the spine for every dossier section — not a standalone speech. When Kelly opens with Experience → Skill → Office, each credential (Verizon, Rock Dental, Stand Up Arkansas, farm stewardship) must map to a specific SOS duty within two sentences: elections guidance, business filings, records access, or county clerk support. Rehearsal fails if anecdotes float without operational translation.`,
      `The ACCA Mountain View panel (Jun 11, 2026) is the first high-stakes clerk audience where biography meets implementation. Kelly should not recite résumé dates; she should name one county pain point (training lag after statute changes, grant ledger visibility, hotline responsiveness) and show how her management background produces a fix with a published deadline. Clerks reward specificity over slogan density.`,
      `Contrast discipline matters in three-way settings. Kelly acknowledges Hammer's election-law focus and Pakko's reform analysis without ceding the administrator frame. Her biography close should always return to daily SOS service in all seventy-five counties — published rules, training calendars, and transparent ledgers voters can verify. Claims gate applies to every number and quote before broadcast adaptation.`,
    ],
    readAloudClerkRoom:
      "I've spent my career building systems people can trust and helping communities understand how government works. As Secretary of State I will show up for every county — published rules, training calendars, and a hotline clerks can reach.",
    readAloudDebate:
      "Throughout my career I've worked in organizations where success depended on creating systems that worked reliably, training people well, and helping large groups work toward a common goal. That's the job of Secretary of State — not writing laws in the Senate, but administering them fairly in all seventy-five counties.",
    sourceNote: "Classification: CANDIDATE_EYES_ONLY — verify claims gate before public adaptation.",
  };
}

export function buildHammerBioNarrativeChapter(): BioNarrativeChapter {
  const dossier = loadKimHammerCandidateDossier();

  return {
    candidateId: "kim-hammer",
    displayName: dossier.displayName,
    eyebrow: "Briefing book · opponent biography",
    paragraphs: [
      dossier.executiveSummary,
      `Kim David Hammer is a long-tenure Arkansas legislator — State Senator for District 33 — who built his statewide brand on election-law authorship and security framing. Public record positions him as primary sponsor of the 2021 six-bill integrity package and subsequent 2023/2025 election clusters. He is also a pastor with deep community identity in central Arkansas. Staff must never attack personal faith; Kelly's contrast stays on job fit — senator writes rules, secretary administers service.`,
      `Hammer won a competitive 2026 Republican runoff — a narrow margin that suggests coalition fragility Kelly can address with values-forward contrast, not insult. His campaign emphasizes #1 ranking claims, clerk solidarity rhetoric, and GOP base alignment. Kelly's homework: verify each claim tier in the claims ledger, pre-read the CVSGF trap questions, and rehearse agree-then-contrast scripts before ACCA Mountain View and any three-way forum.`,
      `In clerk rooms Hammer will likely repeat "I wrote the integrity laws" and "I stand with clerks." Kelly's answer is not motive attack — it is implementation: training dollars, published ledgers, poll-watcher training ownership, and Monday-morning readiness when a new act lands. Fair acknowledgment of one strength (election-law focus) before contrast builds moderator trust.`,
      `Hammer's legislative record clusters around election security framing — six-bill 2021 package, subsequent 2023/2025 clusters, CVSGF governance questions, and poll-watcher statute authorship. Staff homework is tier-by-tier verification in the claims ledger: which bills he primary-sponsored vs co-sponsored, which mandates landed unfunded at county level, and which talking points exceed public record. Kelly never improvises bill numbers on stage.`,
      `Runoff margin data suggests a coalition that can fracture when clerk burden stories land with evidence. Hammer may lean on GOP base alignment and pastor identity; Kelly stays on job-fit contrast — senator writes rules, secretary administers service. Personal faith is off-limits; implementation gaps are fair game when sourced and claims-gated.`,
      `ACCA prep should rehearse Hammer's top three clerk-room lines with agree-then-contrast scripts: acknowledge election-law attention, pivot to training budgets and published grant ledgers, close with SOS hotline and guidance cadence Kelly would operate on day one. Trap lanes (CVSGF, Act 350 burden, poll-watcher training ownership) need under-twelve-second pivots without sounding prosecutorial.`,
    ],
    readAloudClerkRoom:
      "Senator Hammer and I both want secure elections. My question is whether counties received enough support to implement each mandate — training budgets, grant ledgers, and a SOS staff ratio clerks can reach.",
    readAloudDebate:
      "I respect Senator Hammer's focus on election law. My focus is administering it fairly for every clerk in all seventy-five counties — published rules, training calendars, and transparency voters can verify.",
    sourceNote: "Biography fields sourced from kim-hammer-biography.json — verify DOB/education before broadcast.",
  };
}

export function buildPakkoBioNarrativeChapter(): BioNarrativeChapter {
  const dossier = loadMichaelPackoCandidateDossier();
  const bio = loadMichaelPackoBioTimeline();

  const timelineProse = bio.timeline
    .slice(0, 5)
    .map((t) => `${t.year}: ${t.event}`)
    .join(" ");

  return {
    candidateId: "michael-packo",
    displayName: bio.displayName,
    eyebrow: "Briefing book · third-candidate biography",
    paragraphs: [
      dossier.executiveSummary ||
        "Dr. Michael Pakko is the 2026 Libertarian nominee for Arkansas Secretary of State — economist, communicator, and LPAR chair running on reform and fiscal-transparency themes.",
      `${bio.spellingNote ?? ""} Residence: ${bio.residence ?? "Roland, Arkansas"}. Education: ${(bio.education ?? []).map((e) => `${e.credential} (${e.year})`).join("; ")}. Career arc: ${timelineProse}. Pakko is not a county clerk administrator — his credential is analysis and reform ideas. Kelly should never mock the Ph.D. or treat him as a novelty; underestimating Pakko loses Libertarian-leaning clerks and protest voters.`,
      `Pakko's 2024 Libertarian run for State Treasurer established a fiscal-transparency platform he now carries into SOS. His anti-duopoly framing may sound clerk-friendly when Hammer defends unfunded mandates — Kelly agrees on clerk pain, then adds funding, ledger publication, and training. Three-way rule: when Hammer and Pakko both attack mandate burden, do not pile on Pakko to hurt Hammer in front of clerks.`,
      `Scheduled ACCA panel Jun 11 with Hammer and Grappe — Pakko may validate Kelly's burden frame. Kelly's job is to supply the SOS solution: publish-the-ledger, clerk hotline, training calendar. Contrast gate governs rehearsal modules — no personal attack without counsel.`,
      `Pakko's economist credential is an asset in fiscal-transparency conversations — Kelly should treat him as a serious interlocutor, not a spoiler. When Pakko critiques unfunded mandates or duopoly dynamics, Kelly can agree on clerk pain without endorsing LP platform planks. The winning move is to add SOS operational detail Hammer cannot supply from the Senate: implementation timelines, county communication standards, and error-correction loops.`,
      `Libertarian-leaning clerks and protest voters may listen to Pakko's anti-establishment frame. Kelly wins them with administrator credibility — not by attacking Pakko. Rehearse a respectful three-way close: "Dr. Pakko raises reform questions; Senator Hammer wrote election law; I am running to administer it fairly in all seventy-five counties every day."`,
      `Bio timeline anchors (${timelineProse.slice(0, 120)}…) should stay in staff packets only until claims gate clears education and residence fields for public use. Panel logistics: Pakko may speak second or third depending on draw — Kelly maintains curious tone, passes mic cleanly, and never piles on Pakko to score points against Hammer in front of clerks.`,
    ],
    readAloudClerkRoom:
      "If asked about third candidates: I respect Dr. Pakko's reform ideas. My job is daily SOS administration for seventy-five counties — training, transparency, and clerk support.",
    readAloudDebate:
      "Dr. Pakko and I both want voters to trust the process. I am running to administer it in all seventy-five counties every day — not just analyze it from the outside.",
    sourceNote: bio.spellingNote,
  };
}

export function buildOpponentSectionReadAloud(section: OpponentDossierDepthSection): {
  clerkRoom: string;
  debate: string;
} {
  const debate =
    section.howToUseInDebate[0] ??
    `Respectful acknowledge — then administrator contrast: "${section.whyItMattersForKelly}"`;
  const clerk =
    section.howToUseInClerkRoom[0] ??
    "Clerk rooms: stay on SOS service framing — do not elevate third-candidate geometry unless asked.";
  return { clerkRoom: clerk, debate };
}

export function buildKellySectionReadAloud(debateFramingExample: string, howToUseInDebate: string[]): {
  clerkRoom: string;
  debate: string;
} {
  return {
    clerkRoom: howToUseInDebate[0] ?? debateFramingExample.slice(0, 200),
    debate: debateFramingExample,
  };
}

export function getAllBriefingBookBioChapters(): BioNarrativeChapter[] {
  return [buildKellyBioNarrativeChapter(), buildHammerBioNarrativeChapter(), buildPakkoBioNarrativeChapter()];
}
