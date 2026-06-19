/**
 * Professor lesson bank — predicted debate script phases (forum lab v2).
 */
import type { PredictedScriptLesson } from "@/lib/election-plan/forumLabPredictedScriptDrillDown";
import {
  epDebatePrepDayHref,
  epForumLabAnalysisItemHref,
  epForumLabCapitalizeMoveHref,
  epForumLabDeepAnalysisLessonHref,
  epForumLabElectionLawTopicHref,
  epForumLabIntegrationDayHref,
  epForumLabPredictedScriptPhaseHref,
} from "@/lib/election-plan/debate-prep-links";

function beat(
  id: string,
  phase: string,
  title: string,
  summary: string,
  professorLead: string,
  scriptBeat: PredictedScriptLesson["scriptBeat"],
  data: Omit<
    PredictedScriptLesson,
    "id" | "phase" | "title" | "summary" | "professorLead" | "scriptBeat"
  >,
): PredictedScriptLesson {
  return { id, phase, title, summary, professorLead, scriptBeat, ...data };
}

export const FORUM_PREDICTED_SCRIPT_LESSONS: PredictedScriptLesson[] = [
  beat(
    "opening",
    "opening",
    "Opening — vision for the SOS office",
    "Kelly leads with people, clerk partnership, and administrator competence — not party war.",
    "First impressions on split screen are 70% tone, 30% content. Kelly's ACCA opening won civility and service; debate opening must do the same in 60–90 seconds.",
    {
      moderatorQuestion: "What is your vision for the Secretary of State's office?",
      hammerLikely: "Focus on experience and collaboration.",
      pakkoLikely: "Emphasize competition and transparency.",
      kellyBest: "Highlight service and support for county clerks.",
      kellyAvoid: "Polarizing political rhetoric.",
    },
    {
      sections: [
        {
          heading: "Debate architecture",
          body:
            "Openings are stacked: Kelly may draw first, second, or third. Prepare 90-second and 45-second versions. Lead with one word if needed: people.",
        },
        {
          heading: "Kelly content stack",
          body:
            "1) Service role for 75 counties. 2) Secure elections maintained through clerk excellence. 3) Listen-first — roundtables, visits. 4) People over politics — opponent respect if time allows.",
        },
        {
          heading: "Forum proof",
          body:
            "ACCA: Kelly thanked Hammer and Pakko for running the race right; cited 30 years business, 800-person team; pledged clerk partnership.",
        },
        {
          heading: "After opponents speak",
          body:
            "Do not rewrite opening in rebuttal unless attacked. If Hammer leads experience, agree service then administrator pivot in next answer — not opening redo.",
        },
      ],
      psychology: [
        {
          heading: "Viewer first frame",
          body:
            "Voters decide 'who looks like SOS' in opening 30 seconds. Warmth + competence beats bill lists and duopoly lectures.",
        },
        {
          heading: "Avoid polarizing",
          body:
            "Any partisan jab in opening paints Kelly as 'another politician.' Clerk-forward language is automatically de-partisanizing.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Beat Hammer forecast",
          body:
            "He will claim years of service and clerk relationships. Kelly does not compete on Senate years — compete on running a service organization.",
        },
        {
          heading: "Beat Pakko forecast",
          body:
            "He will pitch competition and transparency. Nod once mentally — your opening already implies fair process for all.",
        },
      ],
      opponentForecast: [
        {
          heading: "Hammer likely lines",
          body:
            "16 years, God's will, work with clerks, #1 state security, experience on close.",
        },
        {
          heading: "Pakko likely lines",
          body:
            "Outsider economist, duopoly critique, stand above partisan bickering, fair elections.",
        },
      ],
      optionalPhrasing: [
        {
          label: "90-second opening",
          line:
            "I'm running for Secretary of State because this job is service — for every county clerk and every voter. Our elections are secure because local offices run them; my vision is to listen, remove barriers, and show people how the process works. People over politics — that's how I'll lead.",
          when: "Full opening slot.",
        },
        {
          label: "45-second",
          line:
            "Service for 75 counties — secure elections, clerk partnership, and a Secretary of State who shows up and listens. People over politics.",
          when: "Short clock or third to speak.",
        },
      ],
      forumEvidence: [
        "Kelly ACCA opening: 'people' one-word frame; opponent civility pledge.",
        "Clerk room: politics doesn't belong in election administration.",
      ],
      doNotSay: [
        "My opponents are… — never open negative.",
        "Republicans/Democrats failed — polarizing.",
        "I'll change everything day one — vague hype.",
      ],
      practiceSteps: [
        "Record 90s and 45s openings — check for partisan words.",
        "Open Day 1 command foundation posture block.",
        "Read profile-kelly professor page.",
      ],
      claimsGate: ["Business bio — verified titles only."],
      relatedLinks: [
        { href: epForumLabDeepAnalysisLessonHref("profile-kelly"), label: "Kelly profile" },
        { href: epForumLabDeepAnalysisLessonHref("executive-brief"), label: "Executive brief" },
        { href: epDebatePrepDayHref("day-1-command-foundation"), label: "Day 1 course" },
      ],
    },
  ),
  beat(
    "integrity",
    "integrity",
    "Election integrity beat",
    "Agree secure → clerk credit → show the process — never debate whether Arkansas runs honest elections.",
    "Integrity is the emotional parent topic. Kelly's forum answers were calm affirmations plus transparency — that wins anxious viewers.",
    {
      moderatorQuestion: "How will you ensure election integrity?",
      hammerLikely: "Discuss current laws and proactive measures.",
      pakkoLikely: "Advocate for transparency and public engagement.",
      kellyBest: "Emphasize communication and education.",
      kellyAvoid: "Avoiding technical jargon.",
    },
    {
      sections: [
        {
          heading: "Three-beat answer",
          body:
            "Affirm security → credit clerks → show voters (videos, open tests, truth campaign). Optional fourth: fund upgrades after clerk input.",
        },
        {
          heading: "Hammer collision",
          body:
            "Expect bill sponsorship and '#1 state' ranking. Agree on security; pivot to implementation and county burden if he lists acts.",
        },
        {
          heading: "Pakko collision",
          body:
            "Transparency overlap — agree on public machine testing; do not adopt anti-ranking skepticism without sources.",
        },
        {
          heading: "Hand-count / EMS sub-lane",
          body:
            "Forum heated segment — Kelly line: secure today, counties choose within law, support either with training.",
        },
      ],
      psychology: [
        {
          heading: "Speed = confidence",
          body:
            "Pause before integrity answers reads as doubt. First word should be yes/secure/certain.",
        },
        {
          heading: "Jargon trap",
          body:
            "EMS, TAB, Help America Vote — staff knows, voters don't. Say 'voter lists' and 'paper ballots' not acronyms.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Communication & education",
          body:
            "v2 'Kelly best' maps to marketing truth campaign + civic education — forum misinformation answer.",
        },
        {
          heading: "Capitalize triggers",
          body:
            "Pair with capitalize moves: hammer-security, not-secure attack, dont-trust-gov.",
        },
      ],
      opponentForecast: [
        {
          heading: "Hammer",
          body: "Laws he sponsored, Heritage ranking, loud SOS office, don't break system.",
        },
        {
          heading: "Pakko",
          body: "Public testing, good information beats bad, hand-count skepticism.",
        },
      ],
      optionalPhrasing: [
        {
          label: "90-second integrity",
          line:
            "Elections are secure because county clerks run them locally — I'll say that everywhere I go. My job is to fund your work, fix broken processes like DMV data, and show voters what you already do — videos, open tests, plain English. Truth louder than rumor.",
          when: "Standard integrity question.",
        },
        {
          label: "If attacked as soft",
          line:
            "I'm not soft on security — I'm specific. Clerks are the proof. I'll put them on camera.",
          when: "Hammer implies Kelly weak on fraud.",
        },
      ],
      forumEvidence: [
        "Kelly: elections maintain security and integrity; show people how secure.",
        "Hand-count forum exchange — all three affirmed current system strength.",
      ],
      doNotSay: [
        "Fraud is rampant — fear without proof.",
        "Act 1234 — unless rehearsed verified card.",
        "Heritage says — unless verified year.",
      ],
      practiceSteps: [
        "Time 90s integrity answer — no acronyms.",
        "Shadow-box 'elections not secure' capitalize move.",
        "Open election law study · 2021 package pattern only.",
      ],
      claimsGate: ["Ranking and bill cites — verify before stage."],
      relatedLinks: [
        { href: epForumLabCapitalizeMoveHref("hammer-security"), label: "Capitalize · security" },
        { href: epForumLabCapitalizeMoveHref("not-secure"), label: "Capitalize · not secure" },
        { href: epForumLabElectionLawTopicHref("2021-integrity-package"), label: "2021 package study" },
        { href: epForumLabIntegrationDayHref(5), label: "Day 5 integration" },
      ],
    },
  ),
  beat(
    "funding",
    "funding",
    "Election technology funding beat",
    "Clerk-led requirements → advocate to legislature → federal/state dollars — no vague promises.",
    "Clerk forum Q on 20-year-old software made funding a consensus moment — Kelly wins by sounding like the implementer with a plan.",
    {
      moderatorQuestion: "What are your plans for election technology funding?",
      hammerLikely: "Call for legislative support.",
      pakkoLikely: "Suggest innovative funding solutions.",
      kellyBest: "Propose a clear advocacy plan.",
      kellyAvoid: "Avoid vague statements.",
    },
    {
      sections: [
        {
          heading: "Kelly advocacy plan (4 bullets)",
          body:
            "1) Roundtables with clerks on requirements. 2) Inventory contracts and gaps with Elections Division. 3) Legislative package with county burden analysis. 4) Pursue federal funds + state match — no dollar amounts unless staff verified.",
        },
        {
          heading: "Forum consensus",
          body:
            "All three agreed upgrades needed; Hammer emphasized federal money; Pakko tech modernization; Kelly feedback-before-spend.",
        },
        {
          heading: "Differentiation",
          body:
            "Hammer talks legislature relationships; Kelly talks process discipline and clerk voice before vendor sales.",
        },
      ],
      psychology: [
        {
          heading: "Competence test",
          body:
            "Vague 'I'll fight for funding' fails. Viewers want steps — even three verbs: listen, plan, advocate.",
        },
        {
          heading: "Libertarian angle",
          body:
            "Pakko may resist spending — Kelly frame: integrity infrastructure is core government, not bloat.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Clear advocacy plan",
          body:
            "Name first action: 'Week one roundtables' or 'publish clerk tech needs report' — pick one deliverable.",
        },
        {
          heading: "Avoid vagueness",
          body:
            "Ban phrases: 'we'll look at it,' 'all options on table' without next step.",
        },
      ],
      opponentForecast: [
        {
          heading: "Hammer",
          body: "Legislature leverage, federal capitalization, finish Cole's projects, vendor competition.",
        },
        {
          heading: "Pakko",
          body: "Modernize SOS systems; reluctant on spending except election integrity tech.",
        },
      ],
      optionalPhrasing: [
        {
          label: "90-second funding",
          line:
            "I'll bring clerks to the table first — document what you need after 20 years on the same systems. Then I'll advocate to the legislature and pursue every federal dollar with a county burden analysis so you're not holding the bag. No purchases without your requirements in writing.",
          when: "Tech funding question.",
        },
        {
          label: "Short",
          line:
            "Listen to clerks, build the case, fight for the funds — in that order.",
          when: "Under 20 seconds.",
        },
      ],
      forumEvidence: [
        "Clerk: system not updated in 20 years.",
        "Kelly: advocate for dollars after understanding contracts and feedback.",
      ],
      doNotSay: [
        "$50 million on day one — unverified.",
        "Hammer failed to fund — attack without proof.",
      ],
      practiceSteps: [
        "Write 3-step advocacy plan on index card for headset.",
        "Open kelly modernize-election-tech analysis lesson.",
      ],
      claimsGate: ["No funding figures without sourced budget brief."],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "modernize-election-tech"), label: "Kelly · modernize tech" },
        { href: epForumLabDeepAnalysisLessonHref("quote-hammer-capitalize-balance"), label: "Quote · Hammer capitalize" },
        { href: epForumLabIntegrationDayHref(3), label: "Day 3 · technology" },
      ],
    },
  ),
  beat(
    "direct_democracy",
    "direct_democracy",
    "Local petitions & direct democracy",
    "Neutral SOS helps people navigate petitions — clarity for clerks, not picking winners.",
    "Hot lane: Hammer legal team access vs Pakko easier ballot access. Kelly stays clerk-support + plain-language handbooks without litigating initiative politics on stage.",
    {
      moderatorQuestion: "What is your stance on local petitions?",
      hammerLikely: "Support for legal clarity and assistance.",
      pakkoLikely: "Advocate for easier access to the ballot.",
      kellyBest: "Emphasize the importance of public participation.",
      kellyAvoid: "Avoid dismissing concerns.",
    },
    {
      sections: [
        {
          heading: "Kelly lane",
          body:
            "Sacred right to petition + clerks need shelf-ready guides + SOS helps people follow the law — impartial gatekeeper.",
        },
        {
          heading: "Hammer forum",
          body:
            "Legal team for clerks, petition language review, court cases — Kelly can agree on clarity without endorsing restrictive rules debate.",
        },
        {
          heading: "Pakko forum",
          body:
            "Handbook gap, redneck populace, easier access — Kelly agrees clerks need documentation; defer ballot-access reform details.",
        },
        {
          heading: "Dismissal trap",
          body:
            "Never wave off petition burdens as 'that's the law' — validates Pakko and alienates populists.",
        },
      ],
      psychology: [
        {
          heading: "Populist respect",
          body:
            "Arkansas pride in direct democracy — Kelly honors it even when process is messy.",
        },
        {
          heading: "Clerk burden empathy",
          body:
            "County officials hear petition questions — Kelly as ally reduces their stress on camera.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Public participation",
          body:
            "Frame: help citizens use their power lawfully — SOS as coach not blocker.",
        },
        {
          heading: "Claims gate",
          body:
            "Pakko handbook quote needs_review — use pattern language about clear guides, not 'no handbook exists' until verified.",
        },
      ],
      opponentForecast: [
        {
          heading: "Hammer",
          body: "Legal clarity, court-tested rules, clerk legal access.",
        },
        {
          heading: "Pakko",
          body: "Deep pockets vs ordinary citizens, Thurston, easier signatures.",
        },
      ],
      optionalPhrasing: [
        {
          label: "90-second petitions",
          line:
            "Direct democracy is part of who we are — and county clerks shouldn't have to guess. I'll publish plain-language guides for clerks and ballot question committees, and my legal team will answer your calls so petitions are fair, clear, and secure.",
          when: "Petition / initiative question.",
        },
        {
          label: "Respect Pakko without endorsing",
          line:
            "I want more participation — through rules everyone can understand. That's on the Secretary of State's office to document.",
          when: "After Pakko access argument.",
        },
      ],
      forumEvidence: [
        "Pakko: handbook needed for counties and BQCs (needs_review).",
        "Kelly: sacred constitutional process, hold the hand of the people securely.",
      ],
      doNotSay: [
        "Petitions are a nuisance — dismissive.",
        "I'll block bad initiatives — sounds partisan.",
      ],
      practiceSteps: [
        "Rehearse 60s without naming Pakko/Hammer bills.",
        "Staff verify SOS petition materials inventory.",
      ],
      claimsGate: ["Handbook existence claims — verify before echo."],
      relatedLinks: [
        { href: epForumLabDeepAnalysisLessonHref("quote-pakko-county-handbook"), label: "Quote · Pakko handbook" },
        { href: epForumLabDeepAnalysisLessonHref("profile-pakko"), label: "Pakko profile" },
      ],
    },
  ),
  beat(
    "closing",
    "closing",
    "Closing statement",
    "Service, clerks, people over politics — warm close, no attacks.",
    "Closings are remembered emotionally. Kelly's ACCA close was accessible (text Kelly) and clerk-forward — debate close should echo that warmth.",
    {
      moderatorQuestion: "",
      hammerLikely: "Reiterate teamwork and experience.",
      pakkoLikely: "Encourage voting for change.",
      kellyBest: "Summarize commitment to service.",
      kellyAvoid: "Avoid negative campaigning.",
    },
    {
      sections: [
        {
          heading: "Close order",
          body:
            "Forum used reverse open order — know draw for debate. If Kelly closes last, callback opponent civility + clerk pledge. If first, set themes others must follow.",
        },
        {
          heading: "Content",
          body:
            "One sentence people over politics; one sentence clerk partnership; one sentence invitation (website/engagement) — no new policy.",
        },
        {
          heading: "Hammer forecast",
          body:
            "Teamwork, experience, #1 state, iron sharpens iron — capitalize with agree-add if immediately before Kelly.",
        },
        {
          heading: "Pakko forecast",
          body:
            "Vote for change / notice Libertarian vote — do not engage; close on service.",
        },
      ],
      psychology: [
        {
          heading: "Last frame wins",
          body:
            "Viewers remember final tone. Smile, thank opponents and moderators, slow down.",
        },
        {
          heading: "Negative close backfire",
          body:
            "Even subtle digs reset Kelly to 'politician.' Clerk gratitude reads as authentic.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Commitment to service",
          body:
            "Mirror opening 'people' word — bookend the debate.",
        },
        {
          heading: "If Hammer closes on unity",
          body:
            "Use hammer-work-together capitalize close line — agree then office hours proof.",
        },
      ],
      opponentForecast: [
        {
          heading: "Hammer",
          body: "16 years, team, secure elections, experience elect me.",
        },
        {
          heading: "Pakko",
          body: "JQA quote, wasted vote inversion, vote Libertarian to be heard.",
        },
      ],
      optionalPhrasing: [
        {
          label: "90-second close",
          line:
            "Thank you — and thank Senator Hammer and Dr. Pakko for a race we're running the right way. My commitment is service: secure elections through county clerks, listening in every county, and bringing Arkansans back to the table — people over politics. I'd be honored to earn your vote.",
          when: "Standard close.",
        },
        {
          label: "After Hammer unity",
          line:
            "We are a team — I'll prove it with office hours in your county and feedback before we change your systems. People over politics. Thank you.",
          when: "Hammer immediately prior.",
        },
      ],
      forumEvidence: [
        "Kelly close: thank clerks, plug in more people, contact info.",
        "Hammer close: team, experience, secure elections.",
      ],
      doNotSay: [
        "My opponents can't… — negative close.",
        "Only I can win — desperate.",
      ],
      practiceSteps: [
        "Record close within 90s hard stop.",
        "Practice bookend with opening 'people' line.",
        "Day 7 integration refine drill.",
      ],
      claimsGate: [],
      relatedLinks: [
        { href: epForumLabCapitalizeMoveHref("hammer-work-together"), label: "Capitalize · work together" },
        { href: epForumLabPredictedScriptPhaseHref("opening"), label: "Opening beat" },
        { href: epForumLabIntegrationDayHref(7), label: "Day 7 integration" },
      ],
    },
  ),
];
