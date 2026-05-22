import { mergeSupplementIntoLifecycles } from "../src/lib/campaign-events/ai-tools-supplement";
import { AI_TOOL_LIFECYCLES } from "../src/lib/campaign-events/ai-tools-master-catalog";
import { buildCommandCenterSnapshot } from "../src/lib/campaign-events/ai-tools-command-center";
import { countMasterRegistryByStatus } from "../src/lib/agents/master-tool-registry";

const lifecycles = mergeSupplementIntoLifecycles(AI_TOOL_LIFECYCLES);
const snap = buildCommandCenterSnapshot();
const reg = countMasterRegistryByStatus();

console.log(JSON.stringify({
  catalogTotal: snap.counts.total,
  functional: snap.counts.functional,
  partial: snap.counts.partial,
  scaffolded: snap.counts.scaffolded,
  idea: snap.counts.idea,
  availableNow: snap.counts.availableNow,
  humanApproval: snap.counts.humanApproval,
  automationBlocked: snap.counts.automationBlocked,
  readinessScore: snap.readinessScore,
  lifecycles: lifecycles.length,
  masterRegistryTotal: reg.total,
  lifecyclesByCount: lifecycles.map((lc) => ({
    id: lc.id,
    title: lc.title,
    n: lc.tools.length,
    functional: lc.tools.filter((t) => t.status === "functional").length,
  })).sort((a, b) => b.n - a.n),
}, null, 2));
