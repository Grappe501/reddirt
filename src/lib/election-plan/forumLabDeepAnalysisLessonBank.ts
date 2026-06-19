/**
 * Professor lesson bank — forum lab deep analysis v2 drill-downs.
 */
import type { ForumDeepProfessorLesson } from "@/lib/election-plan/forumLabDeepAnalysisDrillDown";
import {
  epDebatePrepDayHref,
  epForumLabAnalysisItemHref,
  epForumLabCapitalizeMoveHref,
  epForumLabDeepAnalysisLessonHref,
  epForumLabIntegrationDayHref,
  epOppositionResearchModuleHref,
} from "@/lib/election-plan/debate-prep-links";

function prof(
  id: string,
  blockType: ForumDeepProfessorLesson["blockType"],
  title: string,
  summary: string,
  professorLead: string,
  data: Omit<
    ForumDeepProfessorLesson,
    "id" | "blockType" | "title" | "summary" | "professorLead"
  >,
): ForumDeepProfessorLesson {
  return { id, blockType, title, summary, professorLead, ...data };
}

export const FORUM_DEEP_PROFESSOR_LESSONS: ForumDeepProfessorLesson[] = [
  prof(
    "executive-brief",
    "executive-brief",
    "Deep analysis v2 — executive brief",
    "Kelly's ACCA through-line: clerk partnership, civic engagement, integrity with transparency — not legislative authorship.",
    "This brief is the debate's thesis statement. Every answer Kelly gives should sound like a footnote to these three pillars.",
    {
      sections: [
        {
          heading: "What v2 analysis captured",
          body:
            "ACCA was a clerk-room forum — not a partisan rally. Kelly's performance scored on listening, people-over-politics, and administrator credibility. Hammer scored on experience and security rhetoric. Pakko scored on outsider reform energy. v2 tells Kelly which lanes to press and which to avoid.",
        },
        {
          heading: "Clerk partnership (primary)",
          body:
            "Kelly's differentiation is operational: roundtables, county visits, feedback before tech spend, DMV process cleanup. The brief's 'collaboration' is not a slogan — it is the SOS job description in front of the people who run elections.",
        },
        {
          heading: "Civic engagement (secondary)",
          body:
            "Youth programs, creative on-ramps, under-50 electorate — Kelly owns hope and specifics where opponents offer duty or structural critique.",
        },
        {
          heading: "Integrity + innovation (tertiary)",
          body:
            "Agree elections are secure; add show-don't-tell transparency and modernization advocacy. Never let Hammer's bill list become the debate — let clerk implementation become it.",
        },
      ],
      psychology: [
        {
          heading: "Audience in v2",
          body:
            "Undecided viewers want calm competence after years of election anxiety. Kelly wins when she sounds like the chief servant of a process voters already trust locally.",
        },
        {
          heading: "Emotional palette",
          body:
            "Warmth without softness; confidence without arrogance. The brief rejects polarizing rhetoric — that is both ethics and optics.",
        },
      ],
      kellyStrategy: [
        {
          heading: "One-sentence debate north star",
          body:
            "I will listen to clerks, show voters how secure elections work, and bring people back to the table — people over politics.",
        },
        {
          heading: "Staff crosswalk",
          body:
            "Map every forum-lab module to this brief: profiles forecast tone; quotes forecast lines; capitalize moves forecast pivots; integration map forecasts rehearsal week.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Closing callback",
          line:
            "My mission is service — secure elections run by county clerks, with a Secretary of State who shows up and listens.",
          when: "90-second close or final rebuttal.",
        },
      ],
      forumEvidence: [
        "Kelly forum arc: opponent respect → clerk partnership → youth engagement → transparency.",
        "Clerk audience reaction cues: agreement when politics kept out of election administration.",
      ],
      doNotSay: [
        "I'll fix what Hammer broke — unproven and petty.",
        "Elections are under attack in Arkansas — fear without clerk credit.",
      ],
      practiceSteps: [
        "Read brief aloud — underline three pillars in your debate binder.",
        "Open each profile lesson — note one capitalize move per opponent.",
        "Day 4 command course forum intelligence block.",
      ],
      claimsGate: ["Executive brief is strategic — not a citation source on stage."],
      relatedLinks: [
        { href: epForumLabDeepAnalysisLessonHref("profile-hammer"), label: "Hammer profile" },
        { href: epForumLabDeepAnalysisLessonHref("profile-kelly"), label: "Kelly profile" },
        { href: epForumLabIntegrationDayHref(4), label: "Day 4 integration" },
      ],
    },
  ),

  prof(
    "profile-hammer",
    "profile",
    "Hammer profile — rhetoric & forecast",
    "Direct and assertive; experience, collaboration, and '#1 state' security pride.",
    "Hammer is the familiarity candidate in a clerk room. Kelly cannot beat him on 'I've known you for years' — she beats him on 'I will run the office you depend on.'",
    {
      sections: [
        {
          heading: "Rhetorical style",
          body:
            "Declarative sentences, anecdote-first, faith and service framing, legislative identity. He speaks like a senator who has visited every county — because he has.",
        },
        {
          heading: "Signature phrases",
          body:
            "'If it isn't broke, don't fix it' — status-quo defense for paper ballots and current EMS. 'Iron sharpeneth iron' — disagreement as virtue; pre-bunks attacks as uncivil.",
        },
        {
          heading: "Strongest ACCA moments",
          body:
            "Teamwork with clerks, quarterly meetings, cell-phone access, offense on integrity messaging, 16-year experience close.",
        },
        {
          heading: "Forecast on debate night",
          body:
            "Opens with service and security; cites bills when pressed; agrees on clerk partnership then claims authorship credit; may get combative on misinformation ('call a spade a spade').",
        },
      ],
      psychology: [
        {
          heading: "Viewer read",
          body:
            "Hammer reads as confident elder statesman to R-leaning viewers; risk is 'career politician' to change voters if Pakko or Kelly contrast implementation.",
        },
        {
          heading: "Pressure tells",
          body:
            "Runs long when storytelling; bristles at time limits; doubles down on rankings when challenged — watch for overclaim on '#1 state.'",
        },
      ],
      kellyStrategy: [
        {
          heading: "Author vs administrator",
          body:
            "Honor service; pivot to SOS duties. Never mock faith framing.",
        },
        {
          heading: "Agree-add toolkit",
          body:
            "Security → clerk credit + videos. Collaboration → feedback loops. Civic ed → creative youth programs.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Contrast line",
          line:
            "Senator Hammer knows the legislature — I know how to run a large service organization for 75 counties.",
          when: "Qualifications comparison — only if moderator asks.",
        },
      ],
      forumEvidence: [
        "Opening: 16 years, God's will, work with clerks not against.",
        "Hand-count segment: don't break proven system.",
        "Close: experience matters, iron sharpens iron.",
      ],
      doNotSay: [
        "He's just a legislator — dismissive.",
        "Hammer doesn't care about clerks — unproven.",
      ],
      practiceSteps: [
        "List five Hammer quotes from verbatim lesson set.",
        "Pair each with a capitalize move.",
        "Open opposition research Hammer modules.",
      ],
      claimsGate: ["Bill sponsorship — verify before Kelly cites."],
      relatedLinks: [
        { href: epForumLabCapitalizeMoveHref("hammer-work-together"), label: "Capitalize · work together" },
        { href: epForumLabAnalysisItemHref("hammer-themes", "election-security"), label: "Hammer · security theme" },
        { href: epOppositionResearchModuleHref("dossier-hammer"), label: "Hammer dossier" },
      ],
    },
  ),

  prof(
    "profile-pakko",
    "profile",
    "Pakko profile — rhetoric & forecast",
    "Outsider economist; competition, transparency, and anti-duopoly populism.",
    "Pakko is the respect candidate in three-way geometry — not the attack target. Kelly validates participation, then claims neutral administration.",
    {
      sections: [
        {
          heading: "Rhetorical style",
          body:
            "Professorly, reform-oriented, cites statistics and legal cases; bumper-sticker slogans; JQA quotes; 'redneck populace' direct democracy identity.",
        },
        {
          heading: "Signature phrases",
          body:
            "'Elections are too important to leave to the Democrats and Republicans' — frames Kelly and Hammer as duopoly agents. 'Redneck populace' — Arkansas direct democracy pride.",
        },
        {
          heading: "Strongest ACCA moments",
          body:
            "Machine testing transparency, federalism warnings on Save Act, ballot access critique, technology modernization for SOS business services.",
        },
        {
          heading: "Forecast on debate night",
          body:
            "Challenges two-party structure; agrees on secure elections; offers process reforms; may surprise with humor (restaurant question energy).",
        },
      ],
      psychology: [
        {
          heading: "Viewer read",
          body:
            "Attracts disaffected and libertarian-leaning viewers; Kelly must not alienate them while keeping SOS neutrality.",
        },
        {
          heading: "Respect signal",
          body:
            "Small nod when Pakko speaks competition — viewers punish pile-ons on third candidates.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Three-way rules",
          body:
            "Never ask Pakko voters to vote for Kelly on stage. Agree on voices + fair rules.",
        },
        {
          heading: "Overlap lanes",
          body:
            "Transparency, tech modernization, clerk burden on new rules — agree and add implementation detail.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Respect line",
          line:
            "Dr. Pakko is right that more voices strengthen democracy — my job is fair ballots for every party.",
          when: "After Pakko duopoly line.",
        },
      ],
      forumEvidence: [
        "Opening: competition within and between parties.",
        "Misinformation: low engagement tied to lack of competition.",
        "Close: vote Libertarian to be noticed.",
      ],
      doNotSay: [
        "Third parties are spoilers — validates wrong frame.",
        "Libertarian ideas are extreme — insults potential allies.",
      ],
      practiceSteps: [
        "Memorize one Pakko respect line.",
        "Open Pakko dossier and three-way techniques.",
      ],
      claimsGate: ["Ballot access statistics — verify before echo."],
      relatedLinks: [
        { href: epForumLabCapitalizeMoveHref("pakko-competition"), label: "Capitalize · competition" },
        { href: epOppositionResearchModuleHref("dossier-pakko"), label: "Pakko dossier" },
      ],
    },
  ),

  prof(
    "profile-kelly",
    "profile",
    "Kelly profile — rhetoric & forecast",
    "Service-oriented listener; people over politics; marketing truth and clerk credit.",
    "Kelly's profile is the brand to protect. Debate night is not reinventing — it is amplifying ACCA with tighter clocks and zero unverified claims.",
    {
      sections: [
        {
          heading: "Rhetorical style",
          body:
            "Warm, collaborative, process-specific; business leadership without corporate jargon; opponent respect; clerk-forward.",
        },
        {
          heading: "Signature phrases",
          body:
            "'People over politics' — unity without naivety. 'My commitment is to listen' — operational promise, must pair with examples.",
        },
        {
          heading: "Strongest ACCA moments",
          body:
            "Opponent civility pledge, youth civic creativity, DMV data process story, transparency/video plan, clerk trust line.",
        },
        {
          heading: "Risks to manage",
          body:
            "Can sound soft if only unity lines; must add firm administrator beats. Avoid over-promising unfunded programs.",
        },
      ],
      psychology: [
        {
          heading: "Viewer read",
          body:
            "Kelly reads as the only candidate auditioning to serve rather than fight — powerful with women, clerks, and exhausted moderates.",
        },
        {
          heading: "Authenticity anchor",
          body:
            "Forum proof beats new slogans. Callback to mural artist, roundtables, Verizon process — specificity = trust.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Protect the brand",
          body:
            "Every answer: listen → clerk → show → people. Do not chase Hammer into bill tennis.",
        },
        {
          heading: "Energy management",
          body:
            "Security answers calm and fast; engagement answers warmer; attacks get validate-repair not counter-punch.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Brand compact",
          line:
            "People over politics — and politics stays out of election administration.",
          when: "When debate gets partisan.",
        },
      ],
      forumEvidence: [
        "Opening: one-word mission 'people.'",
        "Misinformation: truth louder than rhetoric.",
        "Close: text Kelly — accessibility signal.",
      ],
      doNotSay: [
        "I'm not a politician — overuse sounds evasive.",
        "I'll fix everything — sounds unprepared.",
      ],
      practiceSteps: [
        "Film 60-second 'people over politics' answer.",
        "List three forum proofs — use one per block.",
      ],
      claimsGate: ["Bio claims — verified before air."],
      relatedLinks: [
        { href: epForumLabDeepAnalysisLessonHref("executive-brief"), label: "Executive brief" },
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "listen-county-clerks"), label: "Kelly · clerk listening" },
        { href: epDebatePrepDayHref("day-4-forum-intelligence"), label: "Day 4 course" },
      ],
    },
  ),

  // —— Verbatim quotes (claims-gated) ——
  prof(
    "quote-hammer-if-it-isnt-broke",
    "quote",
    "Hammer · \"If it isn't broke, don't fix it\"",
    "Status-quo defense for Arkansas EMS — expect on hand-count and machine questions.",
    "This line signals Hammer will resist change narratives and paint reformers as reckless. Kelly agrees on security, adds transparency and funding — not wholesale system swaps.",
    {
      quoteMeta: {
        speaker: "Hammer",
        quote: "If it isn't broke, don't fix it, but trust and verify.",
        context: "Discussing the current election system and its integrity.",
        stageUse: "Opening statement",
        claimsGateStatus: "verified",
      },
      sections: [
        {
          heading: "Line anatomy",
          body:
            "Classic conservative frame: proven system + trust-but-verify nod to skeptics without endorsing conspiracy. Pairs with '#1 state' ranking elsewhere in forum.",
        },
        {
          heading: "When it returns",
          body:
            "Hand-marked hand-count questions, EMS vendor debates, any Pakko or audience push for radical change.",
        },
        {
          heading: "Kelly counter-frame",
          body:
            "Agree secure today → clerks deserve funding and visible process → counties choose within law.",
        },
      ],
      psychology: [
        {
          heading: "Viewer comfort",
          body:
            "Line reduces anxiety for risk-averse voters — attacking it head-on looks reckless. Agree-add is mandatory.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Capitalize",
          body:
            "Trigger capitalize move · hammer-election-security. Add: 'Show people how secure it is.'",
        },
      ],
      optionalPhrasing: [
        {
          label: "Agree-add",
          line:
            "It works because clerks run it — I'll help voters see that, and fight for the upgrades you need.",
          when: "Immediately after this Hammer line.",
        },
      ],
      forumEvidence: ["Full hand-count exchange in ACCA transcript."],
      doNotSay: ["It's broke — fights the room."],
      practiceSteps: ["Shadow-box hand-count segment with this trigger."],
      claimsGate: ["verified — quote matches transcript."],
      relatedLinks: [
        { href: epForumLabCapitalizeMoveHref("hammer-security"), label: "Capitalize · security" },
        { href: epForumLabDeepAnalysisLessonHref("profile-hammer"), label: "Hammer profile" },
      ],
    },
  ),
  prof(
    "quote-pakko-duopoly-line",
    "quote",
    "Pakko · duopoly bumper sticker",
    "Elections are too important to leave to Democrats and Republicans.",
    "Pakko's brand in one sentence — respect it, don't debate party philosophy on stage.",
    {
      quoteMeta: {
        speaker: "Pakko",
        quote: "Elections are too important to leave to the Democrats and Republicans.",
        context: "Summarizing his campaign's focus on competition.",
        stageUse: "Opening statement",
        claimsGateStatus: "verified",
      },
      sections: [
        {
          heading: "Strategic meaning",
          body:
            "Positions Pakko as reformer; implicitly frames Hammer and Kelly as party creatures. Kelly rejects that frame by sounding like neutral SOS.",
        },
        {
          heading: "Kelly response architecture",
          body:
            "Agree more voices → SOS administers fair rules for all parties on ballot → people over politics.",
        },
      ],
      psychology: [
        {
          heading: "Alienated voter magnet",
          body:
            "Line attracts viewers angry at parties — validate anger, offer competence not revolution.",
        },
      ],
      kellyStrategy: [
        { heading: "Capitalize", body: "Use pakko-competition capitalize move verbatim." },
      ],
      optionalPhrasing: [
        {
          label: "Respect pivot",
          line:
            "I agree we need more voices — my job is making sure every voice gets fair rules.",
          when: "Right after this line.",
        },
      ],
      forumEvidence: ["Pakko opening and close echo this theme."],
      doNotSay: ["Two parties are fine — sounds establishment."],
      practiceSteps: ["Rehearse 15-second respect pivot."],
      claimsGate: ["verified"],
      relatedLinks: [
        { href: epForumLabCapitalizeMoveHref("pakko-competition"), label: "Capitalize · competition" },
        { href: epForumLabDeepAnalysisLessonHref("profile-pakko"), label: "Pakko profile" },
      ],
    },
  ),
  prof(
    "quote-kelly-security-integrity-goal",
    "quote",
    "Kelly · security & integrity goal",
    "My number one goal is to make sure that our elections maintain their security and their integrity.",
    "Kelly's anchor line — use as template for all security questions.",
    {
      quoteMeta: {
        speaker: "Kelly",
        quote: "My number one goal is to make sure that our elections maintain their security and their integrity.",
        context: "Discussing her vision for the Secretary of State's office.",
        stageUse: "Opening statement",
        claimsGateStatus: "verified",
      },
      sections: [
        {
          heading: "Why it works",
          body:
            "Affirms clerk-room consensus before adding differentiation. No hedge words — calm confidence.",
        },
        {
          heading: "Extension beat",
          body:
            "Always follow with clerk credit or show-don't-tell — otherwise sounds generic.",
        },
      ],
      psychology: [
        {
          heading: "Parenthetical trust",
          body:
            "Voters hear 'my kids' elections' — security line must feel parental, not technical.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Template",
          body:
            "Security goal → clerks execute → I'll show and fund → people over politics.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Extended",
          line:
            "…maintain security and integrity — because county clerks already run fair elections, and my job is to support them.",
          when: "90-second opening or integrity block.",
        },
      ],
      forumEvidence: ["Kelly opening statement ACCA."],
      doNotSay: ["Integrity is under threat — fear frame."],
      practiceSteps: ["Open with this line + extension — 20 seconds."],
      claimsGate: ["verified — Kelly may use on stage."],
      relatedLinks: [
        { href: epForumLabDeepAnalysisLessonHref("profile-kelly"), label: "Kelly profile" },
        { href: epForumLabCapitalizeMoveHref("not-secure"), label: "Capitalize · not secure attack" },
      ],
    },
  ),
  prof(
    "quote-hammer-office-loud",
    "quote",
    "Hammer · \"office that is loud\"",
    "Proactive offense against conspiracy narratives — combative tone risk.",
    "Hammer signals he will fight noise with noise. Kelly differentiates as educator-in-chief — truth louder than rhetoric.",
    {
      quoteMeta: {
        speaker: "Hammer",
        quote:
          "We need to be an office that is loud because if we are loud then that puts those that have the conspiracy mentality into question.",
        context: "Discussing proactive communication about election integrity.",
        stageUse: "Response to a question",
        claimsGateStatus: "verified",
      },
      sections: [
        {
          heading: "Rhetoric read",
          body:
            "Sports offense metaphor — plays well with frustrated R voters; can sound partisan or crude on split screen.",
        },
        {
          heading: "Kelly lane",
          body:
            "Match energy with clarity not combat — videos, clerk spotlights, machine tests open to public.",
        },
      ],
      psychology: [
        {
          heading: "Exhaustion factor",
          body:
            "Many viewers tired of shouting — Kelly's calmer truth campaign can read as maturity if specific.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Contrast without attack",
          body:
            "I'll be loud about facts — clerks deserve the microphone, not politicians dunking on conspiracies.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Contrast",
          line:
            "We don't need more yelling — we need voters to see the process clerks already run.",
          when: "If moderator asks communication styles.",
        },
      ],
      forumEvidence: ["Misinformation / confidence segment."],
      doNotSay: ["Hammer is inflammatory — personal attack."],
      practiceSteps: ["Compare Hammer loud vs Kelly educate tone on video."],
      claimsGate: ["verified"],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "marketing-public-trust"), label: "Kelly · marketing trust" },
        { href: epForumLabDeepAnalysisLessonHref("profile-hammer"), label: "Hammer profile" },
      ],
    },
  ),
  prof(
    "quote-pakko-county-handbook",
    "quote",
    "Pakko · county handbook (needs_review)",
    "Handbook for counties and ballot question committees — staff verify before Kelly echoes.",
    "Substantive process reform idea — Kelly can agree on clarity without adopting Pakko's petition politics wholesale.",
    {
      quoteMeta: {
        speaker: "Pakko",
        quote: "We need a handbook for our counties and for the ballot question committees at the state level.",
        context: "Addressing petition and direct democracy processes.",
        stageUse: "Response to a question",
        claimsGateStatus: "needs_review",
      },
      sections: [
        {
          heading: "Policy substance",
          body:
            "Pakko highlights documentation gap for local petitions — overlaps Kelly's process-improvement brand.",
        },
        {
          heading: "Claims gate",
          body:
            "needs_review — staff confirm current SOS materials before Kelly cites 'no handbook' claim.",
        },
        {
          heading: "Safe Kelly line",
          body:
            "Clerks deserve clear playbooks — I'll build what counties can pull off the shelf.",
        },
      ],
      psychology: [
        {
          heading: "Clerk empathy",
          body:
            "Documentation frustration resonates in clerk room — agreement builds trust.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Agree on clarity",
          body:
            "Do not litigate initiative politics — stay on clerk support and plain-language guides.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Pattern language",
          line:
            "If a clerk can't find the answer on the shelf, that's on the Secretary of State's office.",
          when: "Direct democracy questions without citing Pakko quote.",
        },
      ],
      forumEvidence: ["Petition / direct democracy forum block."],
      doNotSay: ["Pakko is right there's no handbook — until verified."],
      practiceSteps: ["Staff: inventory existing SOS clerk guides."],
      claimsGate: ["needs_review — do not quote Pakko's claim on stage until verified."],
      relatedLinks: [
        { href: epForumLabDeepAnalysisLessonHref("profile-pakko"), label: "Pakko profile" },
      ],
    },
  ),
  prof(
    "quote-kelly-show-secure",
    "quote",
    "Kelly · \"show people how secure it is\"",
    "Kelly's transparency differentiator — marketing as public service.",
    "This is Kelly's answer to fear — show, don't tell. Build debate answers around it.",
    {
      quoteMeta: {
        speaker: "Kelly",
        quote: "I want to show people how secure it is.",
        context: "Discussing plans to improve public confidence in elections.",
        stageUse: "Response to a question",
        claimsGateStatus: "verified",
      },
      sections: [
        {
          heading: "Strategic core",
          body:
            "Shifts debate from abstract rankings to visible process — clerks, observers, tests, videos.",
        },
        {
          heading: "Execution",
          body:
            "Name one deliverable: county toolkit video, SOS truth campaign, open machine tests — pick one for debate.",
        },
      ],
      psychology: [
        {
          heading: "Visual learners",
          body:
            "TV audience believes eyes more than stats — 'show' beats '#1 ranking.'",
        },
      ],
      kellyStrategy: [
        {
          heading: "Stack with clerk line",
          body:
            "Pair with county clerks trust quote for one-two punch.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Specific",
          line:
            "I'll put clerks on camera so voters see what you already do every election.",
          when: "Security or misinformation blocks.",
        },
      ],
      forumEvidence: ["Security question + misinformation answers."],
      doNotSay: ["Trust us — empty."],
      practiceSteps: ["Storyboard 30-second 'show secure' video."],
      claimsGate: ["verified"],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "marketing-public-trust"), label: "Kelly · marketing trust" },
        { href: epForumLabCapitalizeMoveHref("dont-trust-gov"), label: "Capitalize · distrust government" },
      ],
    },
  ),
  prof(
    "quote-hammer-capitalize-balance",
    "quote",
    "Hammer · capitalize / balance (needs_review)",
    "Funding election tech — vague fiscal language; verify before Kelly responds with numbers.",
    "Hammer agrees upgrades needed — Kelly differentiates on clerk-led requirements before spending.",
    {
      quoteMeta: {
        speaker: "Hammer",
        quote: "We need to capitalize on that and take a look at the balance that would need to be necessary.",
        context: "Discussing funding for election technology upgrades.",
        stageUse: "Response to a question",
        claimsGateStatus: "needs_review",
      },
      sections: [
        {
          heading: "Context",
          body:
            "Clerk audience question on 20-year-old EMS — all three agreed on modernization; Hammer pushes legislature/federal money.",
        },
        {
          heading: "Claims gate",
          body:
            "needs_review — 'capitalize' and 'balance' are vague; don't cite dollar figures Kelly can't verify.",
        },
        {
          heading: "Kelly add",
          body:
            "Advocate for funds after roundtables — right upgrades, not vendor-driven spends.",
        },
      ],
      psychology: [
        {
          heading: "Competence test",
          body:
            "Viewers judge who can execute — Kelly's process story beats Hammer's fiscal jargon.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Modernize lane",
          body:
            "Open kelly-opportunities modernize-election-tech lesson.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Safe response",
          line:
            "I'll fight for funding — after clerks tell us what actually needs upgrading.",
          when: "Tech funding questions.",
        },
      ],
      forumEvidence: ["Clerk software Q&A at forum end."],
      doNotSay: ["Hammer won't fund tech — unproven."],
      practiceSteps: ["Draft 3-bullet tech funding plan without numbers."],
      claimsGate: ["needs_review — no uncited dollar amounts."],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "modernize-election-tech"), label: "Kelly · modernize tech" },
      ],
    },
  ),
  prof(
    "quote-pakko-tech-up-to-date",
    "quote",
    "Pakko · bring technology up to date",
    "Shared modernization theme — Kelly out-executes with clerk feedback loops.",
    "Agreement zone with both opponents — Kelly must sound like the implementer.",
    {
      quoteMeta: {
        speaker: "Pakko",
        quote: "We need to bring technology up to date.",
        context: "Discussing improvements for the Secretary of State's office.",
        stageUse: "Response to a question",
        claimsGateStatus: "verified",
      },
      sections: [
        {
          heading: "Overlap map",
          body:
            "Hammer: federal money + vendors. Pakko: SOS clunky systems. Kelly: clerk requirements + advocacy.",
        },
        {
          heading: "Differentiation",
          body:
            "Kelly adds Verizon process discipline — clean data, training, feedback before purchase.",
        },
      ],
      psychology: [
        {
          heading: "Modernity signal",
          body:
            "Voters want SOS to feel 2026 not 1996 — Kelly's business background is the proof point.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Agree-add",
          body:
            "Yes — and I'll upgrade with clerks at the table, not vendors in a back room.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Process proof",
          line:
            "I've cleaned messy data pipelines before — that's the work I'll do with DMV and your offices.",
          when: "Tech / registration crossover.",
        },
      ],
      forumEvidence: ["Beyond elections SOS duties + clerk software Q."],
      doNotSay: ["I'll replace everything day one — unrealistic."],
      practiceSteps: ["Link to DMV registration process story from forum."],
      claimsGate: ["verified"],
      relatedLinks: [
        { href: epForumLabDeepAnalysisLessonHref("profile-pakko"), label: "Pakko profile" },
        { href: epForumLabAnalysisItemHref("predicted-debate-questions", "election-technology-changes"), label: "Predicted Q · tech" },
      ],
    },
  ),
  prof(
    "quote-kelly-clerks-trust",
    "quote",
    "Kelly · clerks build trust",
    "County clerks are why people trust government — Kelly's moral authority line.",
    "Borrow trust from the most trusted actors in the room — essential for security and distrust triggers.",
    {
      quoteMeta: {
        speaker: "Kelly",
        quote: "I believe that the county clerks are a big part of why people trust our government.",
        context: "Emphasizing the importance of county clerks.",
        stageUse: "Opening statement",
        claimsGateStatus: "verified",
      },
      sections: [
        {
          heading: "Trust transfer",
          body:
            "Voters trust neighbors running elections more than statewide politicians — Kelly positions as clerk ally not rival.",
        },
        {
          heading: "Reuse everywhere",
          body:
            "Security, misinformation, distrust-government capitalize moves all bridge here.",
        },
      ],
      psychology: [
        {
          heading: "Localism",
          body:
            "Arkansas viewers identify with county — 'clerks' beats 'government.'",
        },
      ],
      kellyStrategy: [
        {
          heading: "Anchor line",
          body:
            "When stuck, return to clerks — safest credibility reset in the debate.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Short reset",
          line:
            "Elections are local — clerks earn trust every cycle. I'll lift them up.",
          when: "Any defensive moment.",
        },
      ],
      forumEvidence: ["Kelly opening + clerk partnership answers."],
      doNotSay: ["Washington is broken — generic."],
      practiceSteps: ["Use as mid-debate reset phrase — rehearse calm delivery."],
      claimsGate: ["verified"],
      relatedLinks: [
        { href: epForumLabCapitalizeMoveHref("hammer-work-together"), label: "Capitalize · work together" },
        { href: epForumLabDeepAnalysisLessonHref("profile-kelly"), label: "Kelly profile" },
      ],
    },
  ),
  prof(
    "quote-hammer-work-together-team",
    "quote",
    "Hammer · work together as a team",
    "Closing collaboration line — setup for Kelly agree-add capitalize move.",
    "Expect near close or any clerk partnership question — Kelly's capitalize move #1.",
    {
      quoteMeta: {
        speaker: "Hammer",
        quote: "We need to work together as a team.",
        context: "Closing statement emphasizing collaboration.",
        stageUse: "Closing statement",
        claimsGateStatus: "verified",
      },
      sections: [
        {
          heading: "Placement",
          body:
            "Closing callback — Hammer leaves on unity. Kelly should not break unity; add process proof.",
        },
        {
          heading: "Capitalize link",
          body:
            "Direct map to capitalize move hammer-work-together — full professor page there for phrasing variants.",
        },
      ],
      psychology: [
        {
          heading: "Warm close",
          body:
            "Viewers remember last emotional note — Kelly's agree-add can feel like the mature final word.",
        },
      ],
      kellyStrategy: [
        {
          heading: "Close beat",
          body:
            "Absolutely — team means clerks in the room before we change your systems.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Close",
          line:
            "We are a team — and I'll prove it with office hours in every county.",
          when: "Final 30 seconds if Hammer closes on unity.",
        },
      ],
      forumEvidence: ["Hammer closing ACCA."],
      doNotSay: ["Words without action — ironic attack on Hammer."],
      practiceSteps: ["Rehearse closing capitalize after Hammer unity close."],
      claimsGate: ["verified"],
      relatedLinks: [
        { href: epForumLabCapitalizeMoveHref("hammer-work-together"), label: "Capitalize · full lesson" },
        { href: epForumLabDeepAnalysisLessonHref("profile-hammer"), label: "Hammer profile" },
      ],
    },
  ),
];
