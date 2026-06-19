/**
 * Deep lesson bank — forum lab capitalize moves (when X, say Y).
 */
import type { CapitalizeMoveLesson } from "@/lib/election-plan/forumLabCapitalizeMovesDrillDown";
import {
  epDebatePrepDayHref,
  epDebateTechniqueHref,
  epForumLabAnalysisItemHref,
  epForumLabCapitalizeMoveHref,
  epForumLabIntegrationDayHref,
  epOppositionResearchModuleHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";

function move(
  id: string,
  trigger: string,
  kellyLine: string,
  whySummary: string,
  data: Omit<CapitalizeMoveLesson, "id" | "trigger" | "kellyLine" | "whySummary">,
): CapitalizeMoveLesson {
  return { id, trigger, kellyLine, whySummary, ...data };
}

export const FORUM_CAPITALIZE_MOVE_LESSONS: CapitalizeMoveLesson[] = [
  move(
    "hammer-work-together",
    "when Hammer says 'we need to work together'",
    "Absolutely, collaboration is key to ensuring our elections run smoothly.",
    "Agree on partnership — then add structured feedback before mandates land on clerks.",
    {
      viewerImpact:
        "Clerks and undecided voters already believe elections are a team sport. Kelly wins the split screen when she sounds like the adult who will actually pick up the phone — not the candidate trying to score a point off a popular line.",
      strategy: [
        {
          heading: "The agree-add architecture",
          body:
            "Beat 1 (agree): one sentence, no but. Beat 2 (add): one concrete SOS behavior — roundtables, county visits, feedback before software buys. Beat 3 (optional proof): one forum fact ('I picked up ideas from clerks this morning'). Total under 25 seconds.",
        },
        {
          heading: "Why Hammer sets this trap for himself",
          body:
            "Hammer's ACCA pitch is relationship-heavy: quarterly meetings, cell phone, front seat not back seat. That is vulnerable to 'great — show me the process.' Kelly does not attack his sincerity; she upgrades the promise to operational discipline.",
        },
        {
          heading: "Three-way geometry",
          body:
            "Pakko will also praise cooperation. Kelly can nod to both, then anchor: 'Clerks run elections — my office will be the service desk.' Do not turn collaboration into a group hug; turn it into governance.",
        },
        {
          heading: "Moderator follow-up prep",
          body:
            "If asked 'how is that different from Senator Hammer?' — answer with administrator vs author: 'He wrote rules; I'll fix workflows and fight for your funding.' No bill numbers unless verified.",
        },
      ],
      psychology: [
        {
          heading: "What the viewer feels",
          body:
            "Relief. Polarization fatigue is real. Viewers reward the candidate who lowers temperature without sounding weak. A clean agree-add signals emotional intelligence — a hidden job requirement for SOS.",
        },
        {
          heading: "Body language",
          body:
            "Turn slightly toward Hammer when agreeing (respect), then turn to camera or moderator on the add (authority). No eye-roll, no sigh, no pen tap. Still hands on the add line.",
        },
        {
          heading: "Tone calibration",
          body:
            "Warm on agree; firm and specific on add. If you sound identical on both beats, you sound scripted. Practice the micro-pause between beats — it reads as thoughtful, not rehearsed.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Default (forum lab)",
          line: "Absolutely, collaboration is key to ensuring our elections run smoothly.",
          when: "Hammer uses 'work together' or 'team' language in a neutral moment.",
        },
        {
          label: "Agree-add (recommended)",
          line:
            "Absolutely — and collaboration only works when clerks have a real voice before we change systems or spend money.",
          when: "You have 90 seconds and need differentiation in the same breath.",
        },
        {
          label: "Clerk-forward",
          line:
            "Yes — elections are local. My commitment is office hours in your counties and feedback loops before any mandate hits your desk.",
          when: "Audience skews clerks/election professionals or moderator cites county burden.",
        },
        {
          label: "Short (rebuttal clock)",
          line: "Yes — and I'll prove it by showing up and listening first.",
          when: "Under 15 seconds left; do not ramble.",
        },
      ],
      phaseGuidance: [
        { phase: "Opening / introduction", body: "Do not lead with this — save for when Hammer claims partnership first." },
        { phase: "Policy block (clerks, DMV, funding)", body: "Highest leverage — triggers are frequent in this lane." },
        { phase: "Three-way crosstalk", body: "Agree once; if Hammer repeats, pivot to specifics without repeating your agree line verbatim." },
        { phase: "Close", body: "Optional callback: 'We'll work together — with a process, not just a promise.'" },
      ],
      forumEvidence: [
        "Hammer opening: 'work with you, not against you' and pre-legislation meetings with clerks.",
        "Kelly opening: commitment with opponents to 'do this the right way' — civility proof for viewers.",
        "Kelly county partnership answer: roundtables, visits, feedback before technology decisions.",
      ],
      doNotSay: [
        "Senator Hammer doesn't really collaborate — sounds petty and unproven.",
        "I'll work with anyone except… — breaks unity frame.",
        "The legislature always messes clerks around — true but sounds partisan without an add.",
      ],
      practiceSteps: [
        "Shadow-box: Hammer audio clip → agree-add in one breath, 5 reps.",
        "Record 30-second version — check for 'but' sneaking in after agree.",
        "Pair with Day 5 command course capitalize block.",
      ],
      claimsGate: ["No claims about Hammer failing to meet clerks unless sourced."],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("hammer-themes", "clerk-collaboration"), label: "Hammer · clerk collaboration" },
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "listen-county-clerks"), label: "Kelly · listen to clerks" },
        { href: epForumLabCapitalizeMoveHref("pakko-competition"), label: "Capitalize · Pakko competition" },
        { href: epForumLabIntegrationDayHref(5), label: "Day 5 integration" },
      ],
    },
  ),
  move(
    "pakko-competition",
    "when Pakko mentions 'competition in politics'",
    "I agree, we need more voices at the table to enrich our democracy.",
    "Respect Pakko's outsider frame — pivot to fair administration for every party on the ballot.",
    {
      viewerImpact:
        "Disaffected viewers lean in when someone attacks the two-party system. Kelly wins by validating the feeling without becoming a Libertarian surrogate. She looks fair, modern, and above the duopoly food fight — exactly what SOS should look like.",
      strategy: [
        {
          heading: "Respect, don't endorse",
          body:
            "Pakko's lane is structural reform (ballot access, primaries, gerrymandering). Kelly's lane is neutral administration. Agree on 'more voices' — add 'fair rules for every party already on the ballot.'",
        },
        {
          heading: "Never ask for Pakko votes on stage",
          body:
            "Three-way rule: contrast Hammer on implementation, respect Pakko on participation. Do not say 'vote for me instead of Michael' or dismiss third parties.",
        },
        {
          heading: "Split the table",
          body:
            "Let Hammer and Pakko argue philosophy. Kelly is the referee who also runs the stadium. One line: 'I'll administer elections fairly — Republicans, Democrats, Libertarians, independents.'",
        },
      ],
      psychology: [
        {
          heading: "Alienated voter psychology",
          body:
            "Many viewers feel the system is rigged. If Kelly dismisses Pakko, she becomes 'the establishment.' If she parrots Pakko, she loses Republicans. The sweet spot is emotional validation + executive competence.",
        },
        {
          heading: "Camera tell",
          body:
            "Glance at Pakko with a small nod on agree — signals respect. Return to center on add — signals you are the neutral officer.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Default",
          line: "I agree, we need more voices at the table to enrich our democracy.",
          when: "Pakko says competition, duopoly, or third parties.",
        },
        {
          label: "Administrator add",
          line:
            "I agree — and the Secretary of State's job is fair access and clear rules for every qualified voice, not picking winners.",
          when: "Moderator asks role of SOS.",
        },
        {
          label: "People over politics",
          line:
            "More voices matter — but someone has to run the process fairly. That's the job I'm asking for.",
          when: "Need sharper contrast without attacking Pakko.",
        },
      ],
      phaseGuidance: [
        { phase: "When Pakko opens on duopoly", body: "Let him finish — interrupting validates his 'politics is broken' frame." },
        { phase: "Ballot access questions", body: "High risk — stay neutral; defer statutory detail to 'fair process for all parties.'" },
        { phase: "Closing", body: "Avoid new competition rhetoric — close on clerk partnership instead." },
      ],
      forumEvidence: [
        "Pakko opening: 'more competition' within and between parties; elections too important for D/R duopoly.",
        "Kelly opening: people over politics; commitment to run race 'the right way' with opponents.",
      ],
      doNotSay: [
        "The Libertarian Party should… — not your lane.",
        "Republicans and Democrats are the same — alienates plurality of viewers.",
        "Vote for me if you want competition — sounds desperate.",
      ],
      practiceSteps: [
        "Rehearse Pakko 20-second respect line + Kelly 20-second add.",
        "Open techniques · three-way and split-the-table.",
        "Read Pakko dossier before debate night.",
      ],
      claimsGate: ["Pakko ballot-access statistics — verify before echoing."],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("pakko-themes", "competition-politics"), label: "Pakko · competition" },
        { href: epDebateTechniqueHref("three-way"), label: "Techniques · three-way" },
        { href: epOppositionResearchModuleHref("dossier-pakko"), label: "Pakko dossier" },
      ],
    },
  ),
  move(
    "hammer-security",
    "when Hammer talks about election security",
    "Election security is paramount, and I will prioritize transparency and integrity.",
    "Own security without bill-number tennis — clerks execute, Kelly shows the process.",
    {
      viewerImpact:
        "Security is the emotional parent of all election issues. Viewers want to hear 'yes, safe' from every candidate. Kelly wins when she sounds equally committed but more vivid — transparency voters can see — while Hammer sounds like a senator reciting rankings.",
      strategy: [
        {
          heading: "Never debate whether elections are secure",
          body:
            "ACCA room agreed: elections are secure because clerks run them. Kelly affirms first — always. The fight is over storytelling and resources, not whether Arkansas runs honest elections.",
        },
        {
          heading: "Add transparency, not skepticism",
          body:
            "After agree: marketing/truth campaign, videos of clerk excellence, tools for counties. This is Kelly's differentiated add without touching conspiracy bait.",
        },
        {
          heading: "Author vs administrator under pressure",
          body:
            "If Hammer cites bills: 'I'm glad those laws exist — my job is making sure counties can implement them with funding and training.' Pivot off Heritage rankings unless staff verified.",
        },
        {
          heading: "Hand-count crossfire",
          body:
            "Forum showed heat on paper ballots. Kelly's forum line: secure today, counties choose within law, support either way. Use that — do not improvise new tech claims.",
        },
      ],
      psychology: [
        {
          heading: "Fear-first voters",
          body:
            "Anxiety scans for hesitation. A micro-pause before answering security reads as doubt. Lead with calm affirmation — speed equals confidence on this topic.",
        },
        {
          heading: "Credibility transfer",
          body:
            "Viewers trust local faces (poll workers they know). Kelly should name clerks as the security engine — transfers trust from abstract 'government' to neighbors.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Default",
          line: "Election security is paramount, and I will prioritize transparency and integrity.",
          when: "Hammer says secure, #1 state, or integrity package.",
        },
        {
          label: "Clerk credit",
          line:
            "Election security is paramount — because county clerks run it locally. I'll fund them and show voters how it works.",
          when: "Best for general audience — recommended upgrade.",
        },
        {
          label: "Show-don't-tell",
          line:
            "Secure — and voters deserve to see it, not just hear rankings. I'll put clerks on camera.",
          when: "When Hammer leans on Heritage or national #1 claims.",
        },
      ],
      phaseGuidance: [
        { phase: "Hand-count / machine questions", body: "Peak trigger zone — have clerk-credit line ready." },
        { phase: "If Hammer attacks Kelly as soft on fraud", body: "Do not get defensive — affirm, clerk credit, process video." },
        { phase: "Post-misinformation segment", body: "Bridge from security to truth campaign — natural Kelly lane." },
      ],
      forumEvidence: [
        "Kelly: 'elections maintain their security and integrity just like they are today.'",
        "Hammer: '#1 state in the nation' repeated; Heritage scorecard alignment.",
        "Hand-count exchange: Kelly affirms security, counties choose within law.",
      ],
      doNotSay: [
        "Elections are perfectly secure — sounds naive if moderator pushes.",
        "Hammer's bills failed counties — needs verified acts.",
        "Fraud is a myth — dismissive to anxious viewers.",
      ],
      practiceSteps: [
        "90-second hand-count answer from forum — time it.",
        "Open trap lane · 2021 vs 2025 if Hammer pivots to package.",
        "Claims-check any ranking before debate.",
      ],
      claimsGate: ["#1 state / Heritage — verify year and methodology.", "Bill lists — Arkleg only."],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("hammer-themes", "election-security"), label: "Hammer · security theme" },
        { href: epTrapLaneHref("2021-vs-2025-pivot"), label: "Trap lane · 2021 vs 2025" },
        { href: epForumLabCapitalizeMoveHref("not-secure"), label: "Capitalize · 'not secure' attack" },
      ],
    },
  ),
  move(
    "pakko-engagement",
    "when Pakko discusses voter engagement",
    "Engaging our youth is crucial, and I have plans to make that happen.",
    "Meet Pakko on participation — out-execute with programs already running.",
    {
      viewerImpact:
        "Youth engagement is a hope topic — viewers reward optimism with specifics. Kelly wins when Pakko sounds academic and she sounds like someone already doing the work (civic ed program, artists, songwriters).",
      strategy: [
        {
          heading: "Out-specific the general",
          body:
            "Pakko cites structural fixes (competition, turnout stats). Kelly cites living programs: civic education with husband, creative on-ramps, under-50 electorate math.",
        },
        {
          heading: "Agree-add with proof",
          body:
            "Agree youth matter → one program example → one outcome ('show them their power'). Avoid promising unfunded mandates.",
        },
        {
          heading: "Don't cede schools to Hammer",
          body:
            "If Pakko trigger follows Hammer schools talk, Kelly can bridge: 'Education in class and in community — meet young people where they are.'",
        },
      ],
      psychology: [
        {
          heading: "Generational signaling",
          body:
            "Parents and grandparents watch debates for 'who gets my kids.' Concrete youth stories beat policy abstractions.",
        },
        {
          heading: "Energy shift",
          body:
            "Slight vocal lift on youth lines — not fake hype, but forward motion. Security topics are calm; engagement topics can be warmer.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Default",
          line: "Engaging our youth is crucial, and I have plans to make that happen.",
          when: "Quick agree when Pakko mentions engagement or apathy.",
        },
        {
          label: "Program proof",
          line:
            "Engaging youth is crucial — my husband and I already run civic education in high schools, and I'm recruiting artists and songwriters to meet them where they are.",
          when: "90-second lane — strongest viewer version.",
        },
        {
          label: "Demographic",
          line:
            "We have more voting-age Arkansans under 50 than over — I'll show them their power before another low-turnout cycle.",
          when: "Moderator asks turnout; verify stat first.",
        },
      ],
      phaseGuidance: [
        { phase: "Civic education / misinformation blocks", body: "Natural trigger — stack with Hammer civic-ed capitalize if needed." },
        { phase: "Close", body: "Youth + people-over-politics callback lands well." },
      ],
      forumEvidence: [
        "Kelly misinformation answer: marketing campaign, youth afraid of ugly politics.",
        "Kelly opening: mural artist, songwriter, under-50 majority.",
        "Pakko: Arkansas low engagement / apathy shame.",
      ],
      doNotSay: [
        "Young people don't care — insults youth and parents.",
        "We'll mandate civics in every school — unfunded mandate risk.",
      ],
      practiceSteps: [
        "Memorize one youth story (30 sec) from forum.",
        "Pair with Hammer civic-ed capitalize move — practice sequence.",
      ],
      claimsGate: ["Under-50 majority stat — verify before air."],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "civic-education-youth"), label: "Kelly · youth engagement" },
        { href: epForumLabCapitalizeMoveHref("hammer-civic-ed"), label: "Capitalize · Hammer civic ed" },
      ],
    },
  ),
  move(
    "hammer-civic-ed",
    "when Hammer emphasizes civic education",
    "Civic education is essential, and I will work to implement programs that inspire participation.",
    "Agree on civics — extend with creativity and youth-led engagement Kelly already runs.",
    {
      viewerImpact:
        "Civic education sounds motherhood-and-apple-pie. Viewers tune out unless someone paints a picture. Kelly wins by agreeing with Hammer then showing color — artists, songs, programs — while Hammer sounds like compulsory school visits.",
      strategy: [
        {
          heading: "Agree-extend, not agree-duplicate",
          body:
            "Do not repeat Hammer's school pipeline verbatim. Extend: 'Essential — and I'll meet students in their communities, not only in government class.'",
        },
        {
          heading: "Steal the lane with proof",
          body:
            "Forum gave Kelly the receipts: running civic ed program, creative campaign ambassadors. This is one of the few topics where Kelly can be more specific than both opponents in the same minute.",
        },
        {
          heading: "Bridge to misinformation fight",
          body:
            "Civics + truth campaign are siblings. Optional second sentence: 'Informed citizens are harder to mislead.'",
        },
      ],
      psychology: [
        {
          heading: "Aspiration emotion",
          body:
            "Viewers want to feel proud of the next generation. Hammer offers duty; Kelly offers invitation — invitation usually polls better on camera.",
        },
        {
          heading: "Avoid teacher-vs-senator",
          body:
            "Do not sound like you're selling curriculum. Sound like you're recruiting participants.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Default",
          line: "Civic education is essential, and I will work to implement programs that inspire participation.",
          when: "Short rebuttal window.",
        },
        {
          label: "Extend (recommended)",
          line:
            "Civic education is essential — I'm already in schools with partners, and we'll meet young people with art and action, not only textbooks.",
          when: "When you have time to differentiate.",
        },
        {
          label: "Forum callback",
          line:
            "Senator Hammer and I both care about schools — I'll add programs that let students use their talents to plug in.",
          when: "Three-way moment; respectful to Hammer.",
        },
      ],
      phaseGuidance: [
        { phase: "Education / misinformation / youth", body: "Primary zone." },
        { phase: "After Hammer poll-worker story", body: "Optional bridge: civics pipeline includes poll workers — agree then extend to schools." },
      ],
      forumEvidence: [
        "Hammer: SOS in schools, community service hours tied to poll work.",
        "Kelly: civic ed program; creative youth engagement examples.",
      ],
      doNotSay: [
        "Hammer doesn't understand youth — ad hominem.",
        "Schools are failing civics — negative without add.",
      ],
      practiceSteps: [
        "Rehearse agree-extend in under 20 seconds.",
        "Open analysis lesson · Hammer civic education.",
      ],
      claimsGate: [],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("hammer-themes", "civic-education"), label: "Hammer · civic education" },
        { href: epForumLabCapitalizeMoveHref("pakko-engagement"), label: "Capitalize · Pakko engagement" },
      ],
    },
  ),
  move(
    "not-secure",
    "Our elections are not secure.",
    "We have robust systems in place to ensure integrity.",
    "Calm affirm → clerk credit → show the process — never argue with anxiety.",
    {
      viewerImpact:
        "This is the highest-stakes trigger in the debate. Viewers with doubts are watching Kelly's face, not her policy. Calm affirmation reads as strength; defensiveness reads as guilt. Kelly wins by sounding like the chief election servant who trusts clerks — and invites skeptics to see the process.",
      strategy: [
        {
          heading: "Affirm first, evidence second",
          body:
            "Beat 1: elections are secure because clerks run them. Beat 2: paper trail, observers, testing — one vivid image. Beat 3: invite transparency (videos, public tests). Do not lead with rebutting the attacker.",
        },
        {
          heading: "Who said it matters",
          body:
            "If Hammer implies softness on fraud — stay SOS-dignified. If Pakko asks for more transparency — agree and merge into show-the-process. If moderator channels audience fear — empathy + facts.",
        },
        {
          heading: "Scan for capitalize follow-up",
          body:
            "Forum lab note: 'Look for opportunities to provide evidence.' Staff should have one clerk story and one process image ready for post-debate clips.",
        },
      ],
      psychology: [
        {
          heading: "Anxiety contagion",
          body:
            "TV amplifies fear faster than reason. Kelly's pace should be slightly slower than Hammer's — paradoxically reads as more confident.",
        },
        {
          heading: "Moral emotion",
          body:
            "Voters want to feel morally safe participating. Name clerks as neighbors protecting the vote — moral clarity without partisan rage.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Default (upgrade recommended)",
          line:
            "Our elections are secure — county clerks prove it every cycle. I'll help show voters exactly how.",
          when: "Any 'not secure' or 'stolen election' framing.",
        },
        {
          label: "Forum-aligned short",
          line: "We have robust systems in place to ensure integrity.",
          when: "Under 10 seconds — then stop talking.",
        },
        {
          label: "Invite skeptics",
          line:
            "Come watch a test count in your county — you'll see what I see: professionals who take this seriously.",
          when: "Town-hall style audience; no specific date promises without staff confirm.",
        },
      ],
      phaseGuidance: [
        { phase: "Any segment", body: "Can appear suddenly — this is headset Card #1." },
        { phase: "Post-attack recovery", body: "Do not trail off with 'but…' hedging — end on clerk credit." },
      ],
      forumEvidence: [
        "Kelly hand-count answer: elections secure like clerks believe.",
        "Pakko: combat bad information with good information at machine tests.",
      ],
      doNotSay: [
        "That's conspiracy nonsense — alienates doubters.",
        "Prove it — challenging the voter.",
        "The election was stolen — ever.",
      ],
      practiceSteps: [
        "Headset drill: partner shouts trigger → Kelly 15-second affirm.",
        "Pair with command drill from forum upgrade JSON.",
        "Open techniques · hammer attacks.",
      ],
      claimsGate: ["No fraud statistics without sources.", "No opponent motive claims."],
      relatedLinks: [
        { href: epForumLabCapitalizeMoveHref("hammer-security"), label: "Capitalize · Hammer security" },
        { href: epDebateTechniqueHref("hammer-attacks"), label: "Techniques · hammer attacks" },
        { href: epForumLabAnalysisItemHref("watch-for-tells", "integrity-question-reactions"), label: "Tells · integrity reactions" },
      ],
    },
  ),
  move(
    "dont-trust-gov",
    "I don't trust the government.",
    "I understand those concerns and want to work to rebuild trust.",
    "Validate distrust — pivot to transparent SOS service and clerk-visible process.",
    {
      viewerImpact:
        "Distrust is the silent majority in many debate audiences. Candidates who lecture voters lose. Kelly wins by naming the feeling, then offering visible repair — truth campaigns, clerk spotlights, accessible SOS — without sounding like a politician asking for blind faith.",
      strategy: [
        {
          heading: "Validate → repair → invite",
          body:
            "Validate: 'I hear that.' Repair: one concrete trust action (videos, office hours, publish decisions). Invite: 'Judge me by whether clerks get heard.'",
        },
        {
          heading: "People over politics as trust asset",
          body:
            "Kelly's forum brand is anti-ugly politics. Use it: trust returns when administration is boring, fair, and visible — not when politicians shout louder.",
        },
        {
          heading: "Differentiate from Hammer 'call out crap'",
          body:
            "Hammer forum tone on misinformation was combative. Kelly tone is educator-in-chief. Viewers exhausted by anger reward the repair frame.",
        },
      ],
      psychology: [
        {
          heading: "Psychological safety",
          body:
            "Distrustful viewers scan for condescension. 'I understand' only works if the next sentence is specific — not a lecture on civics.",
        },
        {
          heading: "Trust transfer via clerks",
          body:
            "People trust county clerks more than statewide politicians. Kelly should borrow that trust explicitly.",
        },
      ],
      optionalPhrasing: [
        {
          label: "Default",
          line: "I understand those concerns and want to work to rebuild trust.",
          when: "Empathy-first moment.",
        },
        {
          label: "Repair add",
          line:
            "I understand — trust is earned by showing the work. I'll put clerks and the process on camera so truth is louder than rumor.",
          when: "Recommended 90-second version.",
        },
        {
          label: "Service pledge",
          line:
            "You shouldn't have to trust politicians — you should see your elections office serve you. That's the SOS I'll run.",
          when: "Anti-politician audience energy.",
        },
      ],
      phaseGuidance: [
        { phase: "Misinformation segment", body: "Highest probability trigger." },
        { phase: "Closing", body: "Trust repair is a strong final sentence if debate stayed negative." },
      ],
      forumEvidence: [
        "Kelly misinformation answer: distrust in government, truth louder than rhetoric.",
        "Hammer: conspiracy mentality, need to be 'loud' on offense.",
        "Pakko: coordinated transparency at machine tests.",
      ],
      doNotSay: [
        "Just trust me — empty.",
        "If you don't vote, you can't complain — shames viewer.",
        "Social media is the problem — sounds evasive.",
      ],
      practiceSteps: [
        "Empathy drill: partner reads distrust line — Kelly validate-repair in 25 sec.",
        "Identify forum scan note: list 3 specific trust actions for follow-up.",
      ],
      claimsGate: [],
      relatedLinks: [
        { href: epForumLabAnalysisItemHref("kelly-opportunities", "marketing-public-trust"), label: "Kelly · marketing trust" },
        { href: epForumLabAnalysisItemHref("predicted-debate-questions", "address-misinformation"), label: "Predicted Q · misinformation" },
        { href: epDebatePrepDayHref("day-5-anticipate-and-capitalize"), label: "Command course · Day 5" },
      ],
    },
  ),
];
