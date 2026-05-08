type Props = {
  smsLocked: boolean;
  bulkLocked: boolean;
  importLocked: boolean;
  workersLocked: boolean;
  emailLocked: boolean;
  calendarWritesLocked: boolean;
};

function lockRow(label: string, locked: boolean) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-kelly-text/10 py-1.5 font-body text-xs last:border-0">
      <span className="text-kelly-text/90">{label}</span>
      <span className={locked ? "font-bold text-emerald-800" : "font-bold text-amber-900"}>
        {locked ? "Locked" : "Needs review"}
      </span>
    </div>
  );
}

export function TextMessagingSafetyPanel({
  smsLocked,
  bulkLocked,
  importLocked,
  workersLocked,
  emailLocked,
  calendarWritesLocked,
}: Props) {
  return (
    <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
      <h2 className="font-heading text-sm font-bold text-kelly-navy">Safety locks</h2>
      <p className="mt-1 font-body text-xs text-kelly-text/80">
        These should stay locked until headquarters turns each lane on deliberately.
      </p>
      <div className="mt-2">
        {lockRow("Text sending (SMS)", smsLocked)}
        {lockRow("Bulk texting", bulkLocked)}
        {lockRow("Bringing in large contact files", importLocked)}
        {lockRow("Background automation workers", workersLocked)}
        {lockRow("Live campaign email sending", emailLocked)}
        {lockRow("Calendar bulk or automatic writes", calendarWritesLocked)}
      </div>
    </section>
  );
}
