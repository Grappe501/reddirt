import fs from "node:fs";
import path from "node:path";

/**
 * Read-only bridge to the county workbench lane.
 *
 * Only `COUNTY_WORKBENCH_ROOT` is supported in production/Netlify. Do not add sibling
 * `../countyWorkbench` discovery — Next.js file tracing will bundle the whole monorepo lane
 * (~600MB+) into `___netlify-server-handler` when the SOSWebsite repo is cloned.
 */
export function resolveCountyWorkbenchRoot(): string | null {
  const env = process.env.COUNTY_WORKBENCH_ROOT?.trim();
  if (!env || !fs.existsSync(env)) return null;
  return path.resolve(env);
}

export function countyWorkbenchFile(...segments: string[]): string | null {
  const root = resolveCountyWorkbenchRoot();
  if (!root) return null;
  return path.join(root, ...segments);
}

export function readCountyWorkbenchJson<T>(...segments: string[]): T | null {
  const p = countyWorkbenchFile(...segments);
  if (!p || !fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

export function readCountyWorkbenchText(...segments: string[]): string | null {
  const p = countyWorkbenchFile(...segments);
  if (!p || !fs.existsSync(p)) return null;
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

export function isCountyWorkbenchBridgeAvailable(): boolean {
  return resolveCountyWorkbenchRoot() !== null;
}
