import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildRelationshipGraph,
  buildRelationshipHealthBrief,
} from "../src/lib/communications/relationship-intelligence/relationship-intelligence-engine";
import { scoreContactEngagement } from "../src/lib/communications/relationship-intelligence/engagement-scoring";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const graph = buildRelationshipGraph(false);
  const health = buildRelationshipHealthBrief(graph);
  const sample = graph.nodes[0];
  const score = sample
    ? scoreContactEngagement({
        contact: {
          id: sample.contactId,
          email: sample.email,
          roleTags: ["volunteer"],
          source: "test",
          consent: "explicit",
          suppressed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        sendCount: 1,
      })
    : 0;

  console.log("Relationship graph test");
  console.log("  nodes:", graph.nodes.length);
  console.log("  health:", health.headline);
  console.log("  sample score:", score);

  const ok = graph.generatedAt && graph.summary.totalContacts >= 0 && health.topPriorities.length >= 1;
  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — relationship graph loads and scores");
}

main();
