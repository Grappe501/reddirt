/**
 * Kelly Grappe — sourced public-record brief for debate prep.
 * CourtConnect/UCC staff searches remain in kelly-court-diligence-log.json (NOT_SEARCHED until completed).
 */

export type KellyPublicRecordFact = {
  id: string;
  category: "civics" | "campaign" | "media" | "family" | "business";
  headline: string;
  summary: string;
  howOpponentsUseIt: string[];
  kellyResponseFramework: string[];
  verificationStatus: "VERIFIED" | "PARTIAL";
  sources: Array<{ label: string; url?: string; note?: string }>;
};

export const KELLY_PUBLIC_RECORD_BRIEF: KellyPublicRecordFact[] = [
  {
    id: "stand-up-arkansas",
    category: "civics",
    headline: "Stand Up Arkansas co-founder — rural civics leadership",
    summary:
      "Kelly Grappe co-founded Stand Up Arkansas, a grassroots organization focused on rural civic engagement and ballot-measure organizing. Opponents will frame this as partisan activism; it is documented public leadership.",
    howOpponentsUseIt: [
      "Hammer ties Kelly to petition drives he restricted in 2025 — contrast organizer vs administrator.",
      "Mail may call her a 'professional activist' rather than an election administrator.",
    ],
    kellyResponseFramework: [
      "Own the civics chapter — lawful participation is Arkansas tradition.",
      "Separate organizing history from SOS administrator role for this race.",
      "Pivot within 10 seconds: SOS serves every lawful petition and every county clerk equally.",
    ],
    verificationStatus: "VERIFIED",
    sources: [
      { label: "Arkansas Times — SOS candidacy profile", url: "https://arktimes.com/arkansas-blog/2025/10/08/kelly-grappe-announces-run-for-secretary-of-state" },
      { label: "DASS candidate profile — Stand Up Arkansas", note: "Documents co-founder role and rural focus" },
    ],
  },
  {
    id: "learns-capes-spouse",
    category: "family",
    headline: "LEARNS / CAPES referendum — spouse Steve Grappe connection",
    summary:
      "Kelly's husband Steve Grappe led CAPES (Citizens for Arkansas Public Education and Students), which opposed the LEARNS referendum. Hammer camp may use family ties to education fights as proof she cannot be neutral on ballot measures.",
    howOpponentsUseIt: [
      "Contrast Kelly's petition history with Hammer's 2025 petition-restriction package.",
      "Spin: 'The Grappe household fights ballot measures — she can't administer them fairly.'",
      "May cite Dem-Gaz coverage of CAPES executive director role without full context.",
    ],
    kellyResponseFramework: [
      "Do not attack Steve or CAPES on stage — one sentence boundary if asked.",
      "Agree: families care about schools; SOS administers rules for every lawful drive.",
      "Public stance: decline circulating petitions during this race — serve all sides equally.",
      "Pivot: clerk training, published rules, hotline when new act lands Friday afternoon.",
    ],
    verificationStatus: "VERIFIED",
    sources: [
      { label: "Arkansas Democrat-Gazette — CAPES / LEARNS referendum", note: "Steve Grappe as CAPES ED; referendum rejection coverage" },
      { label: "For AR Kids signature effort (July 2024)", note: "Kelly petition leadership documented separately from spouse role" },
    ],
  },
  {
    id: "for-ar-kids-petition",
    category: "civics",
    headline: "For AR Kids / ballot-measure signature leadership",
    summary:
      "Kelly has publicly led or supported citizen-initiative signature efforts (including For AR Kids themes). This is the core 'petition organizer vs SOS administrator' attack surface — prepare with speak-order drills.",
    howOpponentsUseIt: [
      "Bundle LEARNS, For AR Kids, Sherwood petition hub in one moderator question.",
      "Hammer lists 2025 act numbers (218, 240, 274, 241, 768) without county implementation detail.",
    ],
    kellyResponseFramework: [
      "Agree: integrity and lawful participation are both non-negotiable.",
      "Contrast: writing more rules without funding is not service — SOS answers for 75 counties.",
      "Never end on agree alone — always bridge to implementation plan.",
    ],
    verificationStatus: "VERIFIED",
    sources: [
      { label: "Arkansas Times — SOS run announcement", url: "https://arktimes.com/arkansas-blog/2025/10/08/kelly-grappe-announces-run-for-secretary-of-state" },
    ],
  },
  {
    id: "depoliticize-sos-campaign",
    category: "campaign",
    headline: "Depoliticizing SOS — county fairness campaign frame",
    summary:
      "Kelly's campaign publicly emphasizes depoliticizing the Secretary of State's office, county election fairness, and election security through service — not partisan enforcement theater.",
    howOpponentsUseIt: [
      "Hammer: 'She's a Democratic activist pretending to be neutral.'",
      "Packo may agree establishment failed — Kelly must distinguish reform voice without attacking Pakko voters.",
    ],
    kellyResponseFramework: [
      "Lead with office plan: transparent rules, clerk partnership, equal treatment.",
      "Use 'call balls and strikes' language — verified on kellygrappe.com messaging.",
      "Do not relitigate party labels for 45 seconds.",
    ],
    verificationStatus: "VERIFIED",
    sources: [
      { label: "kellygrappe.com — campaign site", url: "https://kellygrappe.com" },
    ],
  },
  {
    id: "media-paper-trail",
    category: "media",
    headline: "Regnat Populus, Forevermost, KUAR / Arkansas Times paper trail",
    summary:
      "Long-form essays, letters, and interviews create clip potential. Editorial boards more likely than debate stage to use gotcha quotes.",
    howOpponentsUseIt: [
      "Movement-politics language clipped out of context.",
      "Hammer camp frames as 'radical organizer' vs 'steady senator.'",
    ],
    kellyResponseFramework: [
      "One sentence max on stage — own civics leadership, pivot to SOS plan.",
      "Do not apologize for lawful civic engagement.",
      "No new controversial quotes in spin room.",
    ],
    verificationStatus: "PARTIAL",
    sources: [
      { label: "Arkansas Times archive", note: "Staff maintain clip binder — candidate eyes only" },
      { label: "KUAR / public radio interviews", note: "Verify dates before cite" },
    ],
  },
  {
    id: "forevermost-business",
    category: "business",
    headline: "Forevermost / small-business operator frame",
    summary:
      "Kelly operates Forevermost and related ventures — opposition may search UCC and entity standing. Farm-economics stress post-COVID may be spun as instability in whisper campaigns, not on debate stage.",
    howOpponentsUseIt: [
      "UCC lien and entity-standing searches (see diligence log — staff NOT_SEARCHED).",
      "GotV whisper: 'business filings' without sourced hit.",
    ],
    kellyResponseFramework: [
      "If clean search logged: pivot to small-business survival and service frame in one sentence.",
      "If hit exists: counsel + single-sentence factual response only.",
      "Never fabricate denial of specific cases.",
    ],
    verificationStatus: "PARTIAL",
    sources: [
      { label: "Arkansas SOS business entity search", note: "Staff diligence — see kelly-court-diligence-log.json" },
    ],
  },
];

export const KELLY_COURT_DILIGENCE_PUBLIC_NOTE =
  "CourtConnect, UCC, and property-tax searches are staff protocols — log outcomes in data/intelligence/kelly-court-diligence-log.json. Do not claim 'clean search' until logged. Public brief above covers verified media and campaign sources only.";

export const KELLY_PUBLIC_RECORD_PREP_SEQUENCE = [
  "Review public brief facts — rehearse petition + LEARNS/CAPES spouse boundary separately.",
  "Complete court diligence log searches — counsel review before debate.",
  "Staff plays Hammer 'check my record' — Kelly uses verified Arkleg counter once only.",
  "Culture-war pivot drill: 10 seconds to acts and clerks.",
];
