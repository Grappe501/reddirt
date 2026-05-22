import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AiDelta } from "./orchestrator-types";
import type { OrchestratorSnapshot } from "./orchestrator-types";

const ORCHESTRATOR_PATH = path.join(process.cwd(), "data", "compliance", "ai", "orchestrator.json");
const DELTA_PATH = path.join(process.cwd(), "data", "compliance", "ai", "delta.json");

async function readPreviousOrchestrator(): Promise<OrchestratorSnapshot | null> {
  try {
    const raw = await readFile(ORCHESTRATOR_PATH, "utf8");
    return JSON.parse(raw) as OrchestratorSnapshot;
  } catch {
    return null;
  }
}

function change(
  area: string,
  before: string,
  after: string,
  direction: "improved" | "regressed" | "unchanged" | "new",
): AiDelta["changes"][0] {
  return { area, before, after, direction };
}

export async function buildAiDelta(current: OrchestratorSnapshot): Promise<AiDelta> {
  const previous = await readPreviousOrchestrator();
  const changes: AiDelta["changes"] = [];

  if (!previous) {
    return {
      generatedAt: new Date().toISOString(),
      commitBase: current.commitBase,
      previousCommit: null,
      previousGeneratedAt: null,
      hasPreviousPass: false,
      changes: [change("orchestrator", "none", "initial pass", "new")],
      summary: "First orchestrator pass — no prior snapshot to compare.",
    };
  }

  if (previous.commitBase !== current.commitBase) {
    changes.push(change("commit", previous.commitBase, current.commitBase, "new"));
  }
  if (previous.filingStatus !== current.filingStatus) {
    changes.push(
      change(
        "filing",
        previous.filingStatus,
        current.filingStatus,
        current.filingStatus === "green" && previous.filingStatus !== "green" ? "improved" : current.filingStatus === "red" ? "regressed" : "unchanged",
      ),
    );
  }
  if (previous.launchOverall !== current.launchOverall) {
    changes.push(change("launch", previous.launchOverall, current.launchOverall, current.launchOverall === "launch_ready" ? "improved" : "unchanged"));
  }
  if (previous.overallPercentComplete !== current.overallPercentComplete) {
    changes.push(
      change(
        "completion %",
        String(previous.overallPercentComplete),
        String(current.overallPercentComplete),
        current.overallPercentComplete > previous.overallPercentComplete ? "improved" : "regressed",
      ),
    );
  }
  if (previous.nextBestAction.action.id !== current.nextBestAction.action.id) {
    changes.push(change("next best action", previous.nextBestAction.action.title, current.nextBestAction.action.title, "new"));
  }

  const summary =
    changes.length === 0
      ? "No material deltas since last orchestrator run."
      : `${changes.length} change(s) since ${previous.generatedAt.slice(0, 10)} (${previous.commitBase}).`;

  return {
    generatedAt: new Date().toISOString(),
    commitBase: current.commitBase,
    previousCommit: previous.commitBase,
    previousGeneratedAt: previous.generatedAt,
    hasPreviousPass: true,
    changes,
    summary,
  };
}

export async function writeAiDelta(delta: AiDelta): Promise<string> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(path.dirname(DELTA_PATH), { recursive: true });
  await writeFile(DELTA_PATH, `${JSON.stringify(delta, null, 2)}\n`, "utf8");
  return DELTA_PATH;
}
