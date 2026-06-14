import { loadPathToVictorySnapshot } from "@/lib/victory-os/path-to-victory-snapshot";
import { PathToVictoryModuleView } from "./PathToVictoryModuleView";

/**
 * Path to Victory — doctrine-locked admin module (server snapshot + presentation).
 * No deployment recommendations until leadership sign-off.
 */
export function PathToVictoryModulePage() {
  const snapshot = loadPathToVictorySnapshot();
  return <PathToVictoryModuleView snapshot={snapshot} />;
}
