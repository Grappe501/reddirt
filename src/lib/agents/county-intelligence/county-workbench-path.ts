import fs from "node:fs";
import path from "node:path";

/**
 * Sibling `../countyWorkbench` exists in the SOSWebsite monorepo (~600MB+). Auto-bridging it on
 * Netlify/CI traces the whole lane into `___netlify-server-handler` and breaks the 250 MB cap.
 * Set COUNTY_WORKBENCH_ROOT for an explicit path, or ALLOW_COUNTY_WORKBENCH_SIBLING_BRIDGE=1 locally.
 */
function allowSiblingCountyWorkbenchBridge(): boolean {
  const flag = process.env.ALLOW_COUNTY_WORKBENCH_SIBLING_BRIDGE?.trim().toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes") return true;
  if (process.env.NETLIFY === "true" || process.env.CI === "true") return false;
  return process.env.NODE_ENV !== "production";
}

/** Approved integration packet: read-only filesystem bridge to sibling lane. */
export function resolveCountyWorkbenchRoot(): string | null {
  const env = process.env.COUNTY_WORKBENCH_ROOT?.trim();
  if (env && fs.existsSync(env)) return path.resolve(env);

  if (!allowSiblingCountyWorkbenchBridge()) return null;

  const sibling = path.resolve(process.cwd(), "..", "countyWorkbench");
  if (fs.existsSync(sibling)) return sibling;

  const monorepo = path.resolve(process.cwd(), "..", "..", "countyWorkbench");
  if (fs.existsSync(monorepo)) return monorepo;

  return null;
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
