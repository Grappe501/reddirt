import Link from "next/link";

import {
  dpaCountyPartyHref,
  dpaOfficerMailtoHref,
  dpaOfficerTelHref,
  formatDpaMailingAddress,
  type DpaOfficer,
  type DpaOfficerOrg,
} from "@/lib/election-plan/load-dpa-county-officers";

type Variant = "full" | "contacts" | "compact";

type Props = {
  orgs: DpaOfficerOrg[];
  variant?: Variant;
  title?: string;
  theme?: "election-plan" | "dashboard";
};

function OfficerRow({ officer, variant }: { officer: DpaOfficer; variant: Variant }) {
  const mailto = dpaOfficerMailtoHref(officer);
  const tel = dpaOfficerTelHref(officer);
  const address = variant === "full" ? formatDpaMailingAddress(officer) : null;
  const vacant = officer.vacant || !officer.displayName;

  return (
    <li className="border-b border-current/10 py-3 last:border-0">
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">{officer.office}</p>
      <p className="font-semibold">{vacant ? "Vacant" : officer.displayName}</p>
      {vacant ? null : (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {tel && officer.phone ? (
            <a href={tel} className="underline-offset-2 hover:underline">
              {officer.phone}
            </a>
          ) : null}
          {mailto ? (
            <a href={mailto} className="underline-offset-2 hover:underline">
              {officer.email}
            </a>
          ) : null}
          {variant === "contacts" && officer.city ? <span>{officer.city}</span> : null}
        </div>
      )}
      {address ? <p className="mt-1 text-xs opacity-70">{address}</p> : null}
      {variant === "full" && (officer.myCampaignVanId || officer.voterVanId) ? (
        <p className="mt-1 text-[10px] opacity-50">
          {officer.myCampaignVanId ? `MyC ${officer.myCampaignVanId}` : ""}
          {officer.myCampaignVanId && officer.voterVanId ? " · " : ""}
          {officer.voterVanId ? `Voter VAN ${officer.voterVanId}` : ""}
        </p>
      ) : null}
    </li>
  );
}

export function CountyPartyOfficerRoster({
  orgs,
  variant = "full",
  title = "County party officers",
  theme = "election-plan",
}: Props) {
  if (orgs.length === 0) return null;
  const shell =
    theme === "dashboard"
      ? "rounded-2xl border border-kelly-text/10 bg-white p-5 text-kelly-text"
      : "ep-card border-l-4 border-blue-600";

  if (variant === "compact") {
    return (
      <div className={theme === "dashboard" ? "text-sm text-kelly-text/85" : "text-sm text-[var(--ep-navy-muted)]"}>
        {orgs.map((org) => (
          <p key={org.orgSlug}>
            <Link href={org.href} className="font-semibold hover:underline">
              {org.orgName}
            </Link>
            {org.chair?.displayName ? ` · ${org.chair.office} ${org.chair.displayName}` : " · officers on file"}
            {org.chair?.phone ? ` · ${org.chair.phone}` : ""}
          </p>
        ))}
      </div>
    );
  }

  return (
    <section className={shell}>
      <p className={theme === "dashboard" ? "font-heading text-sm font-bold text-kelly-navy" : "text-xs font-bold uppercase tracking-[0.15em] text-blue-700"}>
        DPA public officer list
      </p>
      <h2 className={theme === "dashboard" ? "mt-1 font-heading text-xl font-bold text-kelly-navy" : "font-heading text-lg font-bold text-[var(--ep-navy)]"}>
        {title}
      </h2>
      <p className={theme === "dashboard" ? "mt-1 font-body text-xs text-kelly-text/70" : "mt-1 text-xs text-[var(--ep-navy-muted)]"}>
        Operator contacts for outreach and event booking. Do not publish phones, emails, or addresses on the public site.
      </p>
      <div className={orgs.length > 1 ? "mt-4 grid gap-6 lg:grid-cols-2" : "mt-4"}>
        {orgs.map((org) => (
          <div key={org.orgSlug}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-heading font-bold">{org.orgName}</h3>
              <Link href={dpaCountyPartyHref(org.orgSlug)} className="text-xs font-semibold hover:underline">
                Full roster →
              </Link>
            </div>
            <ul className="mt-2">
              {org.officers.map((officer) => (
                <OfficerRow key={officer.id} officer={officer} variant={variant} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
