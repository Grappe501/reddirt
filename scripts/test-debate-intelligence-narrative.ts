import { getBillOperatorPlaybook, listCuratedBillPlaybookNumbers } from "../src/lib/intelligence/v4/debateBillOperatorPlaybooks";
import { findV4BillNarrative, loadDebateIntelligenceV4Packet } from "../src/lib/intelligence/v4/debateIntelligenceV4";
import {
  OPPONENT_TRAP_LANES,
  RECORD_ITEM_FRAMING_PRIMER,
  SOS_JOB_CONTRAST,
} from "../src/lib/intelligence/v4/kellyOpponentContrastPlaybook";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const v4 = loadDebateIntelligenceV4Packet();
const anchors = listCuratedBillPlaybookNumbers();
assert(anchors.length >= 5, "curated anchor playbooks");

for (const bill of anchors) {
  const narrative = findV4BillNarrative(v4, bill);
  assert(narrative != null, `narrative for ${bill}`);
  const pb = getBillOperatorPlaybook(bill, narrative!);
  assert(pb.steps.length >= 6, `${bill} steps`);
  assert(pb.debateUse.openingLine.length > 10, `${bill} debate script`);
  assert(pb.socialMediaUse.threadOutline.length >= 3, `${bill} social outline`);
  assert(pb.peopleImpactFrame.length > 20, `${bill} people frame`);
}

const anyBill = v4.billNarratives[0];
const synth = getBillOperatorPlaybook(anyBill.billNumber, anyBill);
assert(!synth.isCurated, "synthesized playbook for non-anchor");
assert(synth.steps.length >= 6, "synthesized steps");

assert(OPPONENT_TRAP_LANES.length >= 6, "trap lanes");
assert(SOS_JOB_CONTRAST.backgroundWeaknessesSafe.length >= 4, "background angles");
assert(RECORD_ITEM_FRAMING_PRIMER.steps.length >= 6, "framing primer");

console.log("Debate intelligence narrative playbooks");
console.log("  curated anchors:", anchors.join(", "));
console.log("  trap lanes:", OPPONENT_TRAP_LANES.length);
console.log("  synthesized sample:", anyBill.billNumber);
console.log("OK — extended operator narratives ready");
