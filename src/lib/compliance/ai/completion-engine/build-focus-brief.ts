import type { buildCompletionContext } from "./build-completion-context";
import { buildCriticalPath } from "./build-critical-path";

type Ctx = Awaited<ReturnType<typeof buildCompletionContext>>;

export function buildFocusBrief(ctx: Ctx): { plainEnglish: string; today: string[]; doNotDo: string[] } {
  const path = buildCriticalPath(ctx);
  const top = path[0];
  const inv = ctx.inventory.summary;

  return {
    plainEnglish: `Today: ${top.title}. You have ${inv.uploadedCheckCount} checks and ${inv.ledgerExpenditureCount} bank expenditures cataloged — only ${inv.exactMatchCount} exact matches. Open the audit checklist and compare Part A to physical checks and Part B to your bank statement. Do not enter addresses until payees are confirmed.`,
    today: path.slice(0, 5).map((p) => `[${p.owner}] ${p.title}`),
    doNotDo: [
      "Do not invent addresses or vendors",
      "Do not auto-match uncertain checks",
      "Do not batch-approve rule_review",
      "Do not mark filing green early",
    ],
  };
}
