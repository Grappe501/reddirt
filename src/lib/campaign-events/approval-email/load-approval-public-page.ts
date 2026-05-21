import "server-only";

import { notFound } from "next/navigation";
import { loadCalendarEventDrilldown } from "../load-campaign-calendar-events";
import { buildApprovalPackageWithLogs } from "../approval-package";
import { getApprovalTokenById, type ApprovalPackageToken } from "./approval-token-store";
import { loadApprovalEmailContext, mapTokenLinksForPayload } from "./load-approval-email-context";

export type ApprovalPublicPageData = {
  token: ApprovalPackageToken;
  payload: ReturnType<typeof buildApprovalPackageWithLogs>;
  canDecide: boolean;
};

export async function loadApprovalPublicPage(tokenId: string): Promise<ApprovalPublicPageData> {
  const token = await getApprovalTokenById(tokenId);
  if (!token || token.status === "revoked") notFound();

  const loaded = await loadCalendarEventDrilldown(token.recordId);
  if (!loaded) notFound();

  const ctx = await loadApprovalEmailContext(token.recordId);
  const tokenLinks = mapTokenLinksForPayload(ctx);
  const payload = buildApprovalPackageWithLogs(loaded.row, ctx.logs, tokenLinks);

  const canDecide =
    token.status === "active" && token.action !== "review" && !loaded.row.rawDecision;

  return { token, payload, canDecide };
}
