import { Button } from "@/components/ui/Button";
import { communityPartnerDashboardHrefs } from "@/lib/field-structure/field-dashboard-paths";

type CommunityCard = {
  title: string;
  status: string;
  description: string;
  href: string;
  cta: string;
  statusTone: "active" | "scaffold" | "hub";
};

const cards: CommunityCard[] = [
  {
    title: "Muslim Community",
    status: "Active build / community review",
    description:
      "Community region dashboard with P5/VR, events, social, youth, women’s outreach, mosque polling readiness, and rollup.",
    href: communityPartnerDashboardHrefs.muslim,
    cta: "Open Muslim Dashboard",
    statusTone: "active",
  },
  {
    title: "Hispanic Community",
    status: "Partner review",
    description: "Conversational Spanish organizing — same triad lanes as geographic teams; content expands after community signoff.",
    href: communityPartnerDashboardHrefs.conversationalSpanish,
    cta: "Open Hispanic Dashboard",
    statusTone: "scaffold",
  },
  {
    title: "Marshallese Community",
    status: "Partner review",
    description: "Marshallese civic organizing — reserved for community leadership to shape names, stories, and KPIs.",
    href: communityPartnerDashboardHrefs.marshallese,
    cta: "Open Marshallese Dashboard",
    statusTone: "scaffold",
  },
  {
    title: "County Democratic Parties",
    status: "Active build",
    description: "County party meeting, P5 invites, precinct team, and local organizing dashboard.",
    href: communityPartnerDashboardHrefs.countyDemocratsHub,
    cta: "Open County Party Hub",
    statusTone: "active",
  },
  {
    title: "All Community Dashboards",
    status: "Hub",
    description: "Index of community and partner organizing systems.",
    href: communityPartnerDashboardHrefs.communityHub,
    cta: "Open Community Hub",
    statusTone: "hub",
  },
];

function statusClass(tone: CommunityCard["statusTone"]): string {
  switch (tone) {
    case "active":
      return "border-emerald-400/50 bg-emerald-50/90 text-emerald-950";
    case "scaffold":
      return "border-kelly-text/15 bg-kelly-fog/60 text-kelly-deep";
    case "hub":
      return "border-kelly-navy/20 bg-kelly-navy/[0.06] text-kelly-navy";
    default:
      return "border-kelly-text/15 bg-kelly-fog/50 text-kelly-deep";
  }
}

export function FieldCommunityPartnerDashboards() {
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-fog/[0.35] p-5 md:p-6" aria-labelledby="community-partner-dash">
      <div className="max-w-3xl">
        <h3 id="community-partner-dash" className="font-heading text-lg font-bold text-kelly-text md:text-xl">
          Community & Partner Dashboards
        </h3>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/75">
          Community-specific organizing systems, partner dashboards, and county party organizing lanes.
        </p>
      </div>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <li key={c.href}>
            <article className="flex h-full flex-col rounded-xl border border-kelly-text/10 bg-white p-4 shadow-sm transition hover:border-kelly-navy/20 hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="font-heading text-base font-bold text-kelly-navy">{c.title}</h4>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide ${statusClass(c.statusTone)}`}
                >
                  {c.status}
                </span>
              </div>
              <p className="mt-3 flex-1 font-body text-xs leading-relaxed text-kelly-text/75 md:text-sm">{c.description}</p>
              <Button href={c.href} variant="primary" className="mt-4 w-full py-2.5 text-xs md:text-sm">
                {c.cta}
              </Button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
