/**
 * Victory OS Sprint 4 — optional JSON snapshot for board week-over-week reference.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { VictoryBoardSnapshotFile, VictoryBoardViewModel } from "./types";

const BOARD_DIR = "data/victory-board";
const BOARD_FILE = "board-v1.json";

function boardPath(): string {
  return path.join(process.cwd(), BOARD_DIR, BOARD_FILE);
}

export function loadVictoryBoardSnapshot(): VictoryBoardSnapshotFile | null {
  const p = boardPath();
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as VictoryBoardSnapshotFile;
  } catch {
    return null;
  }
}

export function persistVictoryBoardSnapshot(
  viewModel: VictoryBoardViewModel,
  sourceBriefId: string | null,
): VictoryBoardSnapshotFile {
  const dir = path.join(process.cwd(), BOARD_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const snapshot: VictoryBoardSnapshotFile = {
    ...viewModel,
    doctrinePath: "docs/campaign-events/VICTORY_OS_DOCTRINE.md",
    sourceBriefId,
  };
  writeFileSync(boardPath(), `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}

export function victoryBoardSnapshotPresent(): boolean {
  return existsSync(boardPath());
}
