import type { DebateDepthTopic } from "@/lib/intelligence/v4/debateEncounterDepthTypes";
import {
  UNIVERSAL_ADVERSITY,
  UNIVERSAL_CULTURE_WAR,
  UNIVERSAL_IF_STUCK,
} from "@/lib/intelligence/v4/debatePlainLanguageDepth";

export const DEBATE_DEPTH_TOPICS: DebateDepthTopic[] = [
  {
    topicId: "adversity",
    title: "Handling adversity on stage",
    summary: "Tough crowd, pile-on, unfair framing, lost exchanges — stay in the SOS service frame.",
    href: "/admin/intelligence/debate-depth/adversity",
    estimatedMinutes: 12,
    depth: {
      whatToExpectPlain:
        "Adversity in a debate is not the same as a hostile town hall. Time is short, cameras are tight, and Hammer is trained to bait interruption. You will have moments where the room feels against you — that is when voters decide if you can hold a statewide office.",
      howHeWillAttack: [
        "Double-team with Packo after you answer",
        "Crowd reaction to a zinger — do not play to the loudest voices",
        "Moderator follow-up that assumes Hammer's premise",
        "Cutting your mic or time while he keeps talking",
      ],
      howToHandleIt: [
        "Shorten the next answer — one direct sentence, one safe fact, one unity bridge.",
        "Thank the moderator and answer only what was asked.",
        "If piled on: agree on the smallest shared fact, then add what neither opponent said about counties.",
        "Never apologize for running — pivot to what you will do for clerks.",
        "Lower your voice when he raises his — voters read that as leadership.",
      ],
      ifYouGetHungUp: UNIVERSAL_IF_STUCK,
      handlingAdversity: UNIVERSAL_ADVERSITY,
    },
    relatedLinks: [
      { href: "/admin/intelligence/trap-lanes", label: "Trap lanes" },
      { href: "/admin/intelligence/kelly-debate-coaching", label: "Debate coaching" },
      { href: "/admin/intelligence/sos-debate-questions", label: "SOS questions" },
    ],
  },
  {
    topicId: "culture-war",
    title: "Culture-war attacks — decline, pivot, survive",
    summary: "Biography bait, partisan war words, church fights — 15-second boundary and pivot to substance.",
    href: "/admin/intelligence/debate-depth/culture-war",
    estimatedMinutes: 15,
    depth: {
      whatToExpectPlain:
        "Culture-war segments are designed so you spend your precious seconds defending who you are instead of what you will do as Secretary of State. Hammer may not need to win the argument — he only needs you to look rattled or partisan. Your win condition is composure plus a visible pivot to acts and counties.",
      howHeWillAttack: [
        "Personal biography or faith framing",
        "Asking you to condemn voters or groups",
        "Hot-button words you must not repeat back",
        "Provoking interrupt so clips show you as angry",
      ],
      howToHandleIt: [
        "Boundary: office for every voter — acts and clerks.",
        "Eyes on moderator, not Hammer, during decline.",
        "Within 10 seconds: bill, county burden, or transparency pledge.",
        "Do not match volume — steady tone wins undecided voters.",
        "If Packo amplifies bait: add county line; never ask for his vote.",
      ],
      ifYouGetHungUp: [
        "Say the 15s decline script even if it feels repetitive.",
        "If emotion spikes: pause, breathe, one sentence only.",
        "Staff signal for water — do not debate Hammer off-mic.",
      ],
      handlingAdversity: UNIVERSAL_ADVERSITY,
      cultureWarDefense: UNIVERSAL_CULTURE_WAR,
    },
    relatedLinks: [
      { href: "/admin/intelligence/trap-lanes/culture-war-escalation", label: "Trap lane 6 — culture war" },
      { href: "/admin/intelligence/claims", label: "Claims gate" },
      { href: "/admin/intelligence/debate-depth/if-stuck", label: "If you get stuck" },
    ],
  },
  {
    topicId: "if-stuck",
    title: "If you get hung up — recovery scripts",
    summary: "Brain freeze, forgotten bill number, interruption, wrong lane — reset in one sentence.",
    href: "/admin/intelligence/debate-depth/if-stuck",
    estimatedMinutes: 8,
    depth: {
      whatToExpectPlain:
        "Every first-time debater freezes at least once. Hammer's advantage is rhythm, not truth. Your recovery is a practiced reset line, not improvisation. The moderator and audience forgive a pause; they do not forgive rambling or guessing act numbers.",
      howHeWillAttack: ["Talking over your pause", "Mocking hesitation", "Filling silence with wrong facts you must rebut"],
      howToHandleIt: UNIVERSAL_IF_STUCK,
      ifYouGetHungUp: [
        "Repeat: 'Let me answer directly.'",
        "Safe fact: non-partisan SOS · 75 counties · published rules.",
        "If wrong lane: 'The question is about X — here is my answer on X.'",
        "After segment: staff debrief only — not public self-critique.",
      ],
      handlingAdversity: UNIVERSAL_ADVERSITY,
    },
    relatedLinks: [
      { href: "/admin/intelligence/agent-tooling", label: "Agent tooling — do-not-say run" },
      { href: "/admin/intelligence/kim-hammer/debate-prep", label: "Debate prep packet" },
    ],
  },
  {
    topicId: "hammer-attacks",
    title: "How Hammer attacks — pattern playbook",
    summary: "Six predictable lanes: record, participation, counties, fraud dare, experience, culture war.",
    href: "/admin/intelligence/debate-depth/hammer-attacks",
    estimatedMinutes: 20,
    depth: {
      whatToExpectPlain:
        "Kim Hammer debates as a legislator who authored election law. He will cite bill numbers quickly, imply you are soft on fraud, and invite you into biography or culture fights. Expect confidence and interruption — your counter is calm structure, not matching his pace.",
      howHeWillAttack: [
        "Check my record — rapid act list",
        "2025 fresh start vs 2021 package",
        "Integrity without participation",
        "Clerk partnership without funding",
        "Fraud statistics dare",
        "Experience equals SOS-ready",
        "Culture-war escalation",
      ],
      howToHandleIt: [
        "Open trap lane index — rehearse 1–2 lanes for tonight.",
        "Argument map: agree → contrast implementation → bridge.",
        "Never motive without source.",
        "SOS bank for moderator-style pivots.",
      ],
      ifYouGetHungUp: UNIVERSAL_IF_STUCK,
      handlingAdversity: UNIVERSAL_ADVERSITY,
    },
    relatedLinks: [
      { href: "/admin/intelligence/trap-lanes", label: "All trap lanes" },
      { href: "/admin/intelligence/kim-hammer", label: "Opponent record" },
      { href: "/admin/intelligence/film-room", label: "Film room" },
    ],
  },
  {
    topicId: "three-way",
    title: "Three-way debate — Kelly · Hammer · Packo",
    summary: "Speak order, agreement traps, never end on 'I agree' alone, never ask Packo to vote for you.",
    href: "/admin/intelligence/debate-depth/three-way",
    estimatedMinutes: 14,
    depth: {
      whatToExpectPlain:
        "Three candidates means less time per answer and more agreement traps. Packo may sound reform-minded and align with Hammer on security or access. You may speak third after two agree — your job is to add a fresh county or unity line, not repeat their sentences.",
      howHeWillAttack: [
        "Hammer and Packo agree on your flank",
        "Moderator asks only one follow-up of you",
        "Packo steals 'reform' language without county detail",
      ],
      howToHandleIt: [
        "Rehearse SOS speak-order position 2 and 3 for HIGH questions.",
        "Agree narrow fact only, then Civic Index or cross-aisle education line.",
        "Do not ask Packo to vote for Kelly on stage.",
        "Contrast implementation, not personalities.",
      ],
      ifYouGetHungUp: UNIVERSAL_IF_STUCK,
      handlingAdversity: UNIVERSAL_ADVERSITY,
    },
    relatedLinks: [
      { href: "/admin/intelligence/sos-debate-questions", label: "SOS question bank" },
      { href: "/admin/intelligence/opponents", label: "Opponents hub" },
    ],
  },
];

export function getDebateDepthTopic(topicId: string): DebateDepthTopic | undefined {
  return DEBATE_DEPTH_TOPICS.find((t) => t.topicId === topicId);
}
