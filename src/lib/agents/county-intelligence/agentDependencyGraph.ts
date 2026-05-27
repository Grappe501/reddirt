import { loadAgentDependencyGraph } from "./campaignBrainAgentRegistry";

export function agentDependencyGraph() {
  const graph = loadAgentDependencyGraph();
  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    graph,
  };
}

