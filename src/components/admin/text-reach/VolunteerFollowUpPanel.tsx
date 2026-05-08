type FollowSlice = {
  status: "foundation_ready" | "setup_needed";
  messageFollowUpsPlanned: boolean;
  volunteerFollowUpsPlanned: boolean;
  eventFollowUpsPlanned: boolean;
  nextStep: string;
};

type Props = {
  followUp: FollowSlice;
};

function emptyCard(title: string, hint: string) {
  return (
    <div className="rounded-lg border border-dashed border-kelly-text/20 bg-kelly-page/30 p-3 text-center font-body text-xs text-kelly-text/75">
      <p className="font-heading text-[11px] font-bold text-kelly-navy">{title}</p>
      <p className="mt-1">{hint}</p>
    </div>
  );
}

export function VolunteerFollowUpPanel({ followUp }: Props) {
  return (
    <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
      <h2 className="font-heading text-sm font-bold text-kelly-navy">Follow-up cockpit</h2>
      <p className="mt-1 font-body text-xs text-kelly-text/85">
        One place for people who need attention — messages, events, volunteer asks, and county or team handoffs.{" "}
        {followUp.status === "foundation_ready"
          ? "Core campaign records are in place to build this view."
          : "Finish hosted readiness so message and event records are trusted."}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {emptyCard("People needing attention", "Nothing queued yet — cockpit comes next.")}
        {emptyCard("Message replies", "Inbox-style triage will land here.")}
        {emptyCard("Event follow-ups", "After events, who still needs a call or text.")}
        {emptyCard("Volunteer asks", "Who offered rides, turf, or hosting.")}
        {emptyCard("County or team handoffs", "When someone should move to another lead.")}
      </div>
      <p className="mt-3 font-body text-[11px] text-kelly-text/70">{followUp.nextStep}</p>
    </section>
  );
}
