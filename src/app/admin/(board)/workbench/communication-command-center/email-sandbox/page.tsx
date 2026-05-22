import Link from "next/link";
import { getEmailSandboxReadiness } from "@/lib/communication-command-center/email-sandbox-readiness";

export const dynamic = "force-dynamic";

const WORKBENCH = "/admin/workbench";
const READINESS = "/admin/workbench/communication-command-center/readiness";

export default async function EmailSandboxProofPage() {
  const r = await getEmailSandboxReadiness();
  const blocked = !r.ok;

  const preAllGreen =
    r.preconditions.hostedDbProofPassed &&
    r.preconditions.communicationCommandCenterReadinessPassed &&
    r.preconditions.gmailCalendarProofPassed;

  return (
    <div className="min-w-0 max-w-2xl space-y-6 px-1 py-2">
      <div className="flex flex-wrap gap-2">
        <Link href={WORKBENCH} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Workbench
        </Link>
        <Link href={READINESS} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          Communication readiness
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Sandbox email proof</h1>
        <p className="font-body text-sm text-kelly-text/85">
          A careful way to test email plumbing with <strong>one internal address</strong> when headquarters says go. This is not
          blast mail, not volunteer outreach, and not a live campaign send.
        </p>
      </header>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">1. Sandbox email proof</h2>
        <p className="mt-2 font-body text-sm font-semibold text-kelly-text">
          Status: {blocked ? "Blocked — see checks below" : "Ready to prepare"}
        </p>
        <p className="mt-2 font-body text-xs text-kelly-text/85">
          {blocked
            ? "Some readiness checks are not green yet. Finish the items below before asking for a one-time internal test."
            : "You may prepare a single internal test when Steve or the lead operator approves. Still use only one staff address."}
        </p>
        {!preAllGreen ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-[11px] text-kelly-text/80">
            <li>Hosted database proof: {r.preconditions.hostedDbProofPassed ? "Good" : "Needs attention"}</li>
            <li>Communication Command Center readiness: {r.preconditions.communicationCommandCenterReadinessPassed ? "Good" : "Needs attention"}</li>
            <li>Gmail + Calendar proof artifact: {r.preconditions.gmailCalendarProofPassed ? "Good" : "Needs attention"}</li>
          </ul>
        ) : null}
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">2. Provider status</h2>
        <ul className="mt-2 space-y-2 font-body text-xs text-kelly-text/88">
          <li>
            <span className="font-semibold text-kelly-navy">Gmail:</span>{" "}
            {r.providers.gmail.oauthReady ? "Sign-in routes look ready." : "Sign-in routes not fully ready."} Sending from tools
            stays {r.providers.gmail.sendLocked ? "locked" : "unlocked — review with headquarters"}.
          </li>
          <li>
            <span className="font-semibold text-kelly-navy">SendGrid:</span>{" "}
            {r.providers.sendgrid.authCheckRoutePresent ? "Auth check route present." : "Auth check route missing."}{" "}
            {r.providers.sendgrid.sandboxSendRoutePresent ? "Sandbox diagnostic route present." : "Sandbox diagnostic route missing."}{" "}
            Live sending stays {r.providers.sendgrid.liveSendLocked ? "locked" : "unlocked — review"}.
          </li>
          <li>
            <span className="font-semibold text-kelly-navy">Live sending:</span> Locked for campaign-wide use until a separate
            headquarters decision.
          </li>
        </ul>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">3. Safety locks</h2>
        <ul className="mt-2 space-y-1 font-body text-xs text-kelly-text/88">
          <li>Bulk send: {r.safety.bulkSendApproved ? "Unlocked — review" : "Locked"}</li>
          <li>Gmail live send: {r.safety.gmailLiveSendApproved ? "Unlocked — review" : "Locked"}</li>
          <li>SendGrid live send: {r.safety.sendgridLiveSendApproved ? "Unlocked — review" : "Locked"}</li>
          <li>Contact import: {r.safety.contactImportApproved ? "Unlocked — review" : "Locked"}</li>
          <li>Automation workers: {r.safety.automationWorkersApproved ? "Unlocked — review" : "Locked"}</li>
          <li>Allowed recipients for proof: {r.safety.allowedRecipientMode.replace(/_/g, " ")}</li>
        </ul>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-4">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">4. Next steps</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 font-body text-xs text-kelly-text/88">
          <li>Pick one internal staff email address for the test.</li>
          <li>Confirm no public list or volunteer file is selected.</li>
          <li>Run SendGrid auth or sandbox diagnostics only under operator supervision (see staff technical guide).</li>
          <li>Review the result together before any wider send is discussed.</li>
        </ol>
        <p className="mt-3 font-body text-[11px] text-kelly-text/75">{r.nextRecommendedStep}</p>
        <p className="mt-2 font-body text-[10px] text-kelly-muted">
          Staff guide: <span className="font-medium">docs/email-sandbox-send-proof.md</span>
        </p>
      </section>
    </div>
  );
}
