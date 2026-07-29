/**
 * AI suggestions for Evidence Workbench — never auto-confirm geography.
 * Suggestions must be Steve-reviewed before Status/Confirmed or overlay save.
 */

export type EvidenceAiSuggestion = {
  county: string;
  city: string;
  venue: string;
  eventDate: string;
  eventName: string;
  photographer: string;
  peopleVisible: string[];
  whatThisProves: string;
  confidence: "high" | "medium" | "low";
  warnings: string[];
  /** Short model rationale (operator-facing). */
  rationale: string;
  /** Optional scene / composition tags from tool-assisted vision pass. */
  sceneTags?: string[];
  /** Optional accessibility draft (operator must review). */
  altTextDraft?: string;
  /** Optional crop / framing note for galleries. */
  cropAdvice?: string;
  /** Optional video/speaker notes grounded in transcript tools. */
  speakerNotes?: string;
  /** Tool names invoked during the suggestion (operator transparency). */
  toolsUsed?: string[];
};

export type EvidenceAiMemoryExample = {
  assetKind: "photo" | "speech";
  assetId: string;
  county: string;
  city: string;
  venue?: string;
  eventName?: string;
  peopleVisible?: string[];
  whatThisProves?: string;
  captionOrTitle?: string;
  updatedAt: string;
};

export type EvidenceAiMemoryStore = {
  version: 1;
  updatedAt: string;
  purpose: string;
  examples: EvidenceAiMemoryExample[];
};

/** Extensive outgoing metadata packet for DB / intelligence reuse. */
export type EvidenceOutgoingMetadataPacket = {
  version: 1;
  packetId: string;
  assetKind: "photo" | "speech";
  assetId: string;
  generatedAt: string;
  generator: "evidence-workbench-ai";
  model: string;
  status: "draft" | "operator_ready" | "published_eligible";
  identity: {
    src?: string;
    title?: string;
    slug?: string;
    youtubeVideoId?: string;
    originalFilename?: string;
  };
  geography: {
    county: string;
    city: string;
    venue: string;
    confidence: "confirmed" | "suggested" | "unknown";
  };
  event: {
    eventName: string;
    eventDate: string;
    photographer: string;
    peopleVisible: string[];
    organizations: string[];
  };
  proof: {
    whatThisProves: string;
    journeyVerbs: string[];
    campaignThemes: string[];
    relatedIssues: string[];
  };
  accessibility: {
    altText: string;
    caption: string;
    seoDescription: string;
    extendedDescription: string;
  };
  outgoing: {
    pressCaption: string;
    socialCaption: string;
    countyPageBlurb: string;
    journeyCaption: string;
    keywords: string[];
    searchHints: string[];
  };
  intelligence: {
    entities: string[];
    places: string[];
    reusableFacts: string[];
    openQuestions: string[];
    doNotClaim: string[];
  };
  provenance: {
    overlaySource: "photo-evidence.json" | "speech-evidence.json" | "registry" | "mixed";
    operatorConfirmedGeography: boolean;
    aiAssisted: boolean;
    warnings: string[];
  };
  rawModelNotes?: string;
};

export const EVIDENCE_AI_MEMORY_REL = "data/campaign-media/evidence-ai-memory.json";
export const EVIDENCE_PACKETS_DIR_REL = "data/campaign-media/intelligence-packets";
