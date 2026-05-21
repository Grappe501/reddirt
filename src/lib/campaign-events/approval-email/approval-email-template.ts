import type { ApprovalPackagePayload } from "../approval-package-types";
import type { ApprovalEmailAssist } from "./approval-email-assist";

export type ApprovalEmailTemplateInput = {
  payload: ApprovalPackagePayload;
  assist: ApprovalEmailAssist;
  links: {
    review: string;
    approve: string;
    hold: string;
    deny: string;
    requestInfo: string;
  };
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildApprovalEmailBodies(input: ApprovalEmailTemplateInput): { html: string; text: string } {
  const { payload, assist, links } = input;
  const s = payload.eventSummary;
  const zip = payload.missingFields.includes("ZIP code (helps confirm county)") ? "ZIP TBD" : "";
  const loc = [s.city, s.county, zip].filter(Boolean).join(", ") || "Location TBD";

  const warnings: string[] = [];
  if (payload.conflicts.length) warnings.push(...payload.conflicts.map((c) => `${c.label}: ${c.detail}`));
  if (payload.missingFields.length) warnings.push(`Missing: ${payload.missingFields.join(", ")}`);

  const text = [
    "Kelly Grappe for Secretary of State — Event approval package",
    "",
    s.title,
    `${s.dateYmd} · ${s.timeLabel}`,
    `${s.eventType} · ${loc}`,
    "",
    assist.shortSummary,
    "",
    assist.missingInfoLanguage,
    `Risks: ${assist.riskNote}`,
    `Travel: ${payload.travelEstimate.line}${payload.travelEstimate.reimbursementDisplay ? ` · ${payload.travelEstimate.reimbursementDisplay}` : ""}`,
    `Recommended: ${assist.recommendedAction}`,
    "",
    "Actions (secure links):",
    `Review package: ${links.review}`,
    `Approve: ${links.approve}`,
    `Hold / request info: ${links.hold}`,
    `Deny: ${links.deny}`,
    `Request more info: ${links.requestInfo}`,
    "",
    "Google Calendar promotion is not enabled yet. Decisions update the campaign ledger only.",
    "",
    "Paid for by Kelly Grappe for Secretary of State",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>${escapeHtml(assist.subject)}</title></head>
<body style="font-family:Georgia,serif;background:#f8f7f4;color:#1a1a1a;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #d4d0c8;border-radius:12px;padding:28px">
    <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5c6b7a;margin:0 0 8px">Kelly Grappe · Secretary of State</p>
    <h1 style="font-size:22px;margin:0 0 16px;color:#0b1f3a">${escapeHtml(s.title)}</h1>
    <p style="font-size:14px;line-height:1.5"><strong>${escapeHtml(s.dateYmd)}</strong> · ${escapeHtml(s.timeLabel)}<br/>
    ${escapeHtml(s.eventType)} · ${escapeHtml(loc)}</p>
    <p style="font-size:14px;line-height:1.55;margin-top:16px">${escapeHtml(assist.shortSummary)}</p>
    <p style="font-size:13px;color:#5a4a00;background:#fffbeb;border:1px solid #e8d48b;border-radius:8px;padding:12px;margin-top:16px">
      <strong>Missing / gaps:</strong> ${escapeHtml(assist.missingInfoLanguage)}<br/>
      <strong>Risks:</strong> ${escapeHtml(assist.riskNote)}
    </p>
    <p style="font-size:13px;margin-top:12px"><strong>Travel:</strong> ${escapeHtml(payload.travelEstimate.line)}</p>
    <p style="font-size:14px;margin-top:16px"><strong>Recommended:</strong> ${escapeHtml(assist.recommendedAction)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px"><tr>
      <td style="padding-right:8px"><a href="${links.review}" style="display:inline-block;background:#0b1f3a;color:#fff;text-decoration:none;font-weight:bold;font-size:13px;padding:10px 16px;border-radius:999px">Review</a></td>
      <td style="padding-right:8px"><a href="${links.approve}" style="display:inline-block;background:#166534;color:#fff;text-decoration:none;font-weight:bold;font-size:13px;padding:10px 16px;border-radius:999px">Approve</a></td>
      <td style="padding-right:8px"><a href="${links.hold}" style="display:inline-block;border:2px solid #b45309;color:#b45309;text-decoration:none;font-weight:bold;font-size:13px;padding:8px 14px;border-radius:999px">Hold</a></td>
      <td><a href="${links.deny}" style="display:inline-block;border:2px solid #991b1b;color:#991b1b;text-decoration:none;font-weight:bold;font-size:13px;padding:8px 14px;border-radius:999px">Deny</a></td>
    </tr></table>
    <p style="font-size:12px;color:#6b7280;margin-top:20px">Google Calendar promotion is not enabled yet. Your decision updates the campaign event ledger only.</p>
    <hr style="border:none;border-top:1px solid #e5e2db;margin:24px 0 12px"/>
    <p style="font-size:11px;color:#6b7280;margin:0">Paid for by Kelly Grappe for Secretary of State</p>
  </div>
</body>
</html>`;

  return { html, text };
}
