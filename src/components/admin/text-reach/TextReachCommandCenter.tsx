type TextingSlice = {
  status: "foundation_ready" | "setup_needed";
  twilioWebhookReady: boolean;
  smsSendingLocked: boolean;
  stopHelpComplianceRequired: boolean;
  stopHelpHandlingDetected: boolean;
  audienceBuilderPlanned: boolean;
  replyInboxPlanned: boolean;
  nextStep: string;
};

type Props = {
  texting: TextingSlice;
};

function pill(ok: boolean, label: string) {
  return (
    <div
      className={`rounded border px-2 py-1.5 font-body text-[11px] ${
        ok ? "border-emerald-300/70 bg-emerald-50/90 text-emerald-950" : "border-amber-300/60 bg-amber-50/90 text-amber-950"
      }`}
    >
      <span className="font-semibold">{label}</span>
      <span className="ml-1">{ok ? "On track" : "Still to wire"}</span>
    </div>
  );
}

export function TextReachCommandCenter({ texting }: Props) {
  const headline =
    texting.status === "foundation_ready"
      ? "Foundation ready — text tools are being built inside RedDirt."
      : "Setup needed — finish hosted readiness and webhook checks first.";

  return (
    <section className="rounded-lg border border-sky-300/50 bg-sky-50/90 p-4 shadow-sm">
      <h2 className="font-heading text-sm font-bold text-sky-950">Text Command Center</h2>
      <p className="mt-2 font-body text-sm text-sky-950/90">{headline}</p>
      <p className="mt-2 font-body text-xs text-sky-950/85">
        Text messaging is being prepared here. Outbound SMS is <strong>not</strong> turned on from this page. Staff will use a
        dedicated cockpit later; today is planning, readiness, and safety only.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {pill(texting.twilioWebhookReady, "Twilio webhook")}
        {pill(texting.stopHelpHandlingDetected, "STOP / HELP handling in code")}
        {pill(texting.replyInboxPlanned, "Reply inbox")}
        {pill(texting.audienceBuilderPlanned, "Audience builder")}
        {pill(texting.smsSendingLocked, "Sending locked (safe)")}
      </div>
      <p className="mt-3 font-body text-[11px] font-semibold text-sky-950/90">Primary next action</p>
      <p className="font-body text-xs text-sky-950/85">Review the text launch checklist in the staff guide below.</p>
      <p className="mt-2 font-body text-[11px] text-sky-900/80">{texting.nextStep}</p>
    </section>
  );
}
