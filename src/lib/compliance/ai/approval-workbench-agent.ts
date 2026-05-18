import { prepareApprovalItemAi, toWorkbenchAgentResult } from "../approval/approval-ai-prep";
import type { ApprovalItem, ApprovalWorkbenchAgentResult } from "../approval/approval-types";

export async function runApprovalWorkbenchAgent(item: ApprovalItem): Promise<ApprovalWorkbenchAgentResult> {
  const refreshed = {
    ...item,
    ...prepareApprovalItemAi(item),
    updatedAt: new Date().toISOString(),
  };
  return toWorkbenchAgentResult(refreshed);
}

export { prepareApprovalItemAi, toWorkbenchAgentResult };
