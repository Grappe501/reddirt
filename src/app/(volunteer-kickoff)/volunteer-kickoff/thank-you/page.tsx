import { KickoffCtaLink } from "@/components/volunteer-kickoff/SlideChrome";
import {
  CAMPAIGN_TEAM_LABELS,
  LOCAL_ROLE_LABELS,
  type CampaignTeamId,
  type LocalRoleId,
} from "@/content/volunteer-kickoff/roles";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

type PageProps = {
  searchParams: Promise<{ pathway?: string; county?: string; role?: string }>;
};

function roleLabel(role: string | undefined, pathway: string | undefined): string {
  if (!role) {
    if (pathway === "youth") return "Youth Coalition";
    if (pathway === "match") return "Role matching";
    if (pathway === "local") return "Local volunteer";
    if (pathway === "campaign") return "Campaign team";
    return "Volunteer";
  }
  if (role in LOCAL_ROLE_LABELS) return LOCAL_ROLE_LABELS[role as LocalRoleId];
  if (role in CAMPAIGN_TEAM_LABELS) return CAMPAIGN_TEAM_LABELS[role as CampaignTeamId];
  if (role === "youth" || role === "youth_coalition") return "Youth Coalition";
  if (role === "match" || role === "needs_match") return "Role matching";
  return role.replace(/_/g, " ");
}

function followUpOwner(pathway: string | undefined): string {
  switch (pathway) {
    case "local":
      return "Carol Egan and the volunteer leadership team";
    case "campaign":
      return "Steve and the statewide team leads";
    case "youth":
      return "Chance Bradford and the Youth Coalition coordinators";
    case "match":
      return "Volunteer leadership — we’ll help place you";
    default:
      return "the campaign volunteer team";
  }
}

export default async function KickoffThankYouPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const pathway = sp.pathway;
  const county = sp.county;
  const role = roleLabel(sp.role, pathway);

  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-3">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-[var(--kelly-official-gold)]">
          You’re in
        </p>
        <h1 className="font-heading text-3xl font-bold text-[var(--kelly-official-navy)] sm:text-5xl">
          You Are Now Part of the Team
        </h1>
        <p className="text-lg text-[var(--color-secondary)]">
          Kelly and Steve built the foundation. The next phase belongs to all of us.
        </p>
      </header>

      <div className="rounded-[var(--radius-premium)] border border-[var(--kelly-official-gold)]/40 bg-white p-6 shadow-[var(--shadow-premium)]">
        <dl className="space-y-4 font-body text-[var(--color-secondary)]">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--kelly-official-navy)]">
              Selected role
            </dt>
            <dd className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">{role}</dd>
          </div>
          {county ? (
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--kelly-official-navy)]">
                County
              </dt>
              <dd className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">
                {county} County
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--kelly-official-navy)]">
              Who will follow up
            </dt>
            <dd className="mt-1">{followUpOwner(pathway)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--kelly-official-navy)]">
              Next step
            </dt>
            <dd className="mt-1">
              Expect contact within one business day. Meanwhile: recruit one person and stay ready for
              Operation Arkansas after Labor Day.
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        <KickoffCtaLink href={`${KICKOFF_BASE}/join`}>Invite Someone Else</KickoffCtaLink>
        <KickoffCtaLink href={`${KICKOFF_BASE}/calendar`} variant="secondary">
          View Upcoming Events
        </KickoffCtaLink>
        <KickoffCtaLink href={KICKOFF_BASE} variant="outline">
          Return to Presentation
        </KickoffCtaLink>
      </div>
    </article>
  );
}
