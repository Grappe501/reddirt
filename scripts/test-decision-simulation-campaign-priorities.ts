import { readFileSync } from "node:fs";
import {
  formatCampaignPrioritiesPromptLine,
  getCampaignPrioritySnapshot,
  hillCampaignPriorities,
  jonesCampaignPriorities,
} from "../src/lib/agents/decision-simulation/campaign-priorities";
import { loadWritingCorpus } from "../src/lib/agents/decision-simulation/writing-intelligence/catalog";
import { buildWritingIntelligencePromptPacket } from "../src/lib/agents/decision-simulation/writing-intelligence/prompt-packet";
import { chrisJonesPersonality, frenchHillPersonality } from "../src/lib/agents/decision-simulation/personality-catalog";

function assert(ok: boolean, label: string) {
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) throw new Error(label);
}

console.log("Decision Simulator campaign-site priorities");

assert(jonesCampaignPriorities.campaignSite.includes("chrisjonesforcongress.com"), "Jones snapshot points at the campaign site");
assert(hillCampaignPriorities.campaignSite.includes("electfrench.com"), "Hill snapshot points at electfrench.com, not hill.house.gov");
assert(
  jonesCampaignPriorities.priorities.some((item) => item.id === "affordability") &&
    jonesCampaignPriorities.priorities.some((item) => item.id === "accountability") &&
    jonesCampaignPriorities.priorities.some((item) => item.id === "opportunity"),
  "Jones three pillars are OBSERVED",
);
assert(
  jonesCampaignPriorities.priorities.some((item) => item.id === "jobs-economy") &&
    jonesCampaignPriorities.priorities.some((item) => item.id === "democracy"),
  "Jones homepage commitment blocks are present",
);
assert(
  hillCampaignPriorities.priorities.some((item) => item.id === "taxes-jobs") &&
    hillCampaignPriorities.priorities.some((item) => item.id === "border") &&
    hillCampaignPriorities.priorities.some((item) => item.id === "veterans"),
  "Hill campaign lead issues are present",
);
assert(
  jonesCampaignPriorities.priorities.every((item) => item.sourceState === "OBSERVED" && item.sourceUrl.startsWith("https://")),
  "every Jones priority is sourced",
);
assert(
  hillCampaignPriorities.priorities.every((item) => item.sourceState === "OBSERVED" && item.sourceUrl.includes("electfrench.com")),
  "every Hill priority is campaign-site sourced",
);

const dumped = JSON.stringify({ jonesCampaignPriorities, hillCampaignPriorities });
assert(!/48% to 44%|46% to 43%/.test(dumped), "poll graphics were not ingested as facts");
assert(!/\b(Liza|Payne)\b/.test(dumped), "Hill family names were not stored");
assert(!/501-396-9455/.test(dumped), "Jones HQ phone was not stored in the priority snapshot");
assert(!/chris jones is a radical|jones wants to defund/i.test(dumped), "no unsourced opponent attack lines");

assert(formatCampaignPrioritiesPromptLine("chris-jones-ar02").includes("Affordability For All"), "Jones prompt line carries campaign pillars");
assert(formatCampaignPrioritiesPromptLine("french-hill-ar02").includes("Taxes, jobs"), "Hill prompt line carries campaign lead issue");
assert(!formatCampaignPrioritiesPromptLine("generic"), "generic actor has no invented campaign page");

const jonesPacket = buildWritingIntelligencePromptPacket("chris-jones-ar02");
assert(Boolean(jonesPacket && jonesPacket.lines.length < 12 && jonesPacket.lines.some((line) => line.includes("Immediate campaign priorities"))), "writing packet stays compact and includes priorities");

assert(chrisJonesPersonality.version === "jones-ar02-research-1.1", "Jones catalog version bumped after campaign ingest");
assert(frenchHillPersonality.version === "hill-ar02-research-1.1", "Hill catalog version bumped after campaign ingest");
assert(chrisJonesPersonality.sources.some((item) => item.url.includes("/opportunity/")), "Jones catalog cites the opportunity page");
assert(frenchHillPersonality.sources.some((item) => item.url.includes("electfrench.com")), "Hill catalog cites the campaign site");

const corpus = loadWritingCorpus();
const campaign = corpus.filter((item) => item.source.sourceType === "CAMPAIGN_ARTICLE");
assert(campaign.some((item) => item.source.canonicalUrl.includes("chrisjonesforcongress.com/accountability")), "Jones accountability page is in the writing corpus");
assert(campaign.some((item) => item.source.canonicalUrl.includes("electfrench.com")), "Hill campaign home is in the writing corpus");
assert(campaign.every((item) => item.source.excerpt.length <= 280 && item.source.authorshipConfidence === "ATTRIBUTED"), "campaign excerpts stay short and attributed");
assert(
  !campaign
    .filter((item) => item.source.actorId === "chris-jones-ar02")
    .some((item) => /48% to 44%/.test(item.source.excerpt)),
  "Jones campaign excerpts drop the fundraising poll chrome",
);

assert(
  getCampaignPrioritySnapshot("french-hill-ar02")?.uncertainty.some((item) => /not audited|not independently verified/i.test(item)),
  "Hill casework figures stay unverified",
);

const ui = readFileSync("src/components/admin/decision-simulator/PersonalityIntelligence.tsx", "utf8");
assert(ui.includes("Immediate campaign priorities"), "mission lab surfaces the campaign priority drawer");

const roadmap = readFileSync("develop_notes/decision-simulation/DEC_SIM_V1_V2_ROADMAP_1_0.md", "utf8");
assert(roadmap.includes("DEC-SIM-CAMPAIGN-PRIORITIES-1.0"), "Phase 9 campaign-site slice is named on the canonical roadmap");
assert(roadmap.includes("V2-31"), "continuous campaign-site crawler is filed as V2, not implemented");

console.log("OK — campaign priority gates passed");
