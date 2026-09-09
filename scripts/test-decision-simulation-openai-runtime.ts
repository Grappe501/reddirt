import {
  DECISION_SIMULATION_DOCTRINE,
  runDecisionSimulationOpenAi,
  validateDecisionSimulationSequence,
} from "../src/lib/agents/decision-simulation";

async function main() {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;
  let capturedBody: Record<string, unknown> | null = null;

  process.env.OPENAI_API_KEY = "test-only-not-a-real-key";
  process.env.OPENAI_MODEL = "gpt-4o-mini";

  const moves = Array.from({ length: 6 }, (_, index) => {
    const moveNumber = index + 1;
    const counterparty = moveNumber % 2 === 1;
    return {
      moveNumber,
      side: counterparty ? "COUNTERPARTY" : "OPERATOR",
      kind: counterparty ? "PREDICTED_RESPONSE" : "RECOMMENDED_RESPONSE",
      message: `Move ${moveNumber}`,
      objective: `Objective ${moveNumber}`,
      predictedFrame: `Frame ${moveNumber}`,
      rationaleSummary: `Rationale ${moveNumber}`,
      risks: ["Risk"],
      opportunities: ["Opportunity"],
      assumptions: ["Assumption"],
      confidence: {
        label: "MEDIUM",
        estimatedProbability: 0.6,
        explanation: "Test confidence",
      },
    };
  });

  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    capturedBody = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    return new Response(
      JSON.stringify({
        id: "resp_test",
        model: "gpt-4o-mini",
        output: [
          {
            type: "message",
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  executiveSummary: "Expected path summary",
                  strongestRisk: "Risk",
                  strongestOpportunity: "Opportunity",
                  assumptions: ["Assumption"],
                  moves,
                }),
              },
            ],
          },
        ],
        usage: { input_tokens: 100, output_tokens: 200, total_tokens: 300 },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const result = await runDecisionSimulationOpenAi({
      message: "Announce an endorsement.",
      channel: "PUBLIC_STATEMENT",
      objective: "Test response strategy.",
      operatorActor: { name: "Operator", actorType: "CAMPAIGN" },
      counterpartyActor: { name: "Counterparty", actorType: "CAMPAIGN" },
      context: "Only supplied test context may be used.",
    });

    const validation = validateDecisionSimulationSequence(result.run);
    const textConfig = capturedBody?.text as { format?: { type?: string; strict?: boolean } } | undefined;
    const strictSchema = textConfig?.format?.type === "json_schema" && textConfig?.format?.strict === true;
    const sevenNodes = result.run.moves.length === 7;
    const sixGenerated = result.run.moves.slice(1).every((move) => move.message.startsWith("Move "));
    const noInventedEvidence = result.run.moves.every((move) => move.evidenceRefs.length === 0);
    const usageCaptured = result.usage.totalTokens === 300;
    const noSend = DECISION_SIMULATION_DOCTRINE.autonomousSendEnabled === false;
    const noPost = DECISION_SIMULATION_DOCTRINE.autonomousPostingEnabled === false;

    console.log("Decision Simulation Phase 3 OpenAI runtime checks");
    console.log("  canonical sequence valid:", validation.ok);
    console.log("  strict JSON schema requested:", strictSchema);
    console.log("  seven nodes returned:", sevenNodes);
    console.log("  six AI moves merged:", sixGenerated);
    console.log("  model did not create evidence refs:", noInventedEvidence);
    console.log("  usage metadata captured:", usageCaptured);
    console.log("  autonomous send disabled:", noSend);
    console.log("  autonomous posting disabled:", noPost);

    if (!(validation.ok && strictSchema && sevenNodes && sixGenerated && noInventedEvidence && usageCaptured && noSend && noPost)) {
      process.exitCode = 1;
      return;
    }

    console.log("OK — Decision Simulation Phase 3 OpenAI runtime checks passed");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = originalModel;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
