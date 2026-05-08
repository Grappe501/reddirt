type RelationalSlice = {
  status: "foundation_ready" | "setup_needed";
  peopleGraphAvailable: boolean;
  manualRelationshipEntryPlanned: boolean;
  volunteerFollowUpPlanned: boolean;
  actionCardsPlanned: boolean;
  nextStep: string;
};

type Props = {
  relational: RelationalSlice;
};

function card(title: string, body: string, ready: boolean) {
  return (
    <div
      className={`rounded-lg border p-3 font-body text-xs ${
        ready ? "border-emerald-200 bg-white" : "border-kelly-text/10 bg-kelly-page/40"
      }`}
    >
      <p className="font-heading text-[11px] font-bold text-kelly-navy">{title}</p>
      <p className="mt-1 text-kelly-text/85">{body}</p>
    </div>
  );
}

export function RelationalOrganizingPanel({ relational }: Props) {
  const headline =
    relational.status === "foundation_ready"
      ? "Foundation ready — volunteers will log people they know and staff will review."
      : "Setup needed — database tables for people and volunteers must be in place.";

  return (
    <section className="rounded-lg border border-violet-300/45 bg-violet-50/90 p-4 shadow-sm">
      <h2 className="font-heading text-sm font-bold text-violet-950">RedDirt Reach</h2>
      <p className="mt-2 font-body text-sm text-violet-950/90">{headline}</p>
      <p className="mt-2 font-body text-xs text-violet-950/85">
        Relational organizing means trusted volunteers record real relationships, follow-ups, and asks — not mass imports or
        anonymous blasts.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {card(
          "Manual relationship entry",
          "Volunteers add someone they know with context and consent-minded notes.",
          relational.manualRelationshipEntryPlanned,
        )}
        {card(
          "Trust level and relationship type",
          "Simple labels so staff see how strong the tie is.",
          relational.manualRelationshipEntryPlanned,
        )}
        {card(
          "Suggested ask",
          "Optional prompt for what the volunteer might invite them to.",
          relational.actionCardsPlanned,
        )}
        {card(
          "Follow-up reminder",
          "Gentle nudges for the volunteer to check back in.",
          relational.volunteerFollowUpPlanned,
        )}
        {card(
          "Staff review queue",
          "HQ reviews new ties before anything public-facing happens.",
          relational.peopleGraphAvailable,
        )}
      </div>
      <p className="mt-3 font-body text-[11px] font-semibold text-violet-950/90">Primary next action</p>
      <p className="font-body text-xs text-violet-950/85">Review the relational organizing plan in the staff guide.</p>
      <p className="mt-2 font-body text-[11px] text-violet-900/80">{relational.nextStep}</p>
    </section>
  );
}
