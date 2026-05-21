import {
  EMAIL_SEND_DISABLED_NOTICE,
  getApprovalRecipientsDisplay,
  getCandidateApprovalToLine,
} from "@/lib/campaign-events/approval-recipients";

export function ApprovalRecipientsBanner({ compact }: { compact?: boolean }) {
  const r = getApprovalRecipientsDisplay();

  return (
    <div
      className={`rounded-xl border border-amber-700/25 bg-amber-50 font-body text-sm text-amber-950 ${compact ? "px-3 py-2" : "px-4 py-3"}`}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-amber-900/80">Candidate approval recipients</p>
      {!compact ? <p className="mt-1 text-xs text-amber-900/70">{EMAIL_SEND_DISABLED_NOTICE}</p> : null}
      <ul className={`${compact ? "mt-1" : "mt-2"} space-y-0.5 text-sm`}>
        <li>
          <strong>Candidate primary:</strong> {r.candidate.primary}
        </li>
        <li>
          <strong>Candidate campaign account:</strong> {r.candidate.campaign}
        </li>
        {r.campaignManager ? (
          <li>
            <strong>Campaign manager:</strong> {r.campaignManager}
          </li>
        ) : (
          <li className="text-amber-900/60">
            <strong>Campaign manager:</strong> not configured
          </li>
        )}
      </ul>
      {!compact ? (
        <p className="mt-2 font-mono text-xs text-amber-900/70">Draft To: {getCandidateApprovalToLine()}</p>
      ) : null}
    </div>
  );
}
