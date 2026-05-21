import "server-only";

import { getApprovalEmailConfig } from "../approval-email/approval-email-config";
import { getApprovalTokenById } from "../approval-email/approval-token-store";
import { traceEmailArchitecture } from "./sprint4-tool-helpers";

/** Tool: approval-email-config-checker (server) */
export function checkApprovalEmailConfig() {
  return getApprovalEmailConfig();
}

/** Tool: email-architecture-tracer (server-enriched) */
export function traceEmailArchitectureServer() {
  const envTrace = traceEmailArchitecture();
  const config = getApprovalEmailConfig();
  return { ...envTrace, ...config, mergedReady: config.readyToSend };
}

/** Tool: approval-token-validator */
export async function validateApprovalToken(tokenId: string) {
  const token = await getApprovalTokenById(tokenId);
  if (!token) return { valid: false as const, reason: "unknown" };
  return {
    valid: token.status === "active",
    token,
    reason: token.status,
  };
}
