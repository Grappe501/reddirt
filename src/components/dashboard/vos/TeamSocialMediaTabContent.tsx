import type { ReactNode } from "react";
import Link from "next/link";

import type { Team } from "@/types/dashboard";
import {
  MOCK_CONTENT_REQUESTS,
  MOCK_LOCAL_POST_IDEAS,
  MOCK_SOCIAL_PRIORITY_POSTS,
  SOCIAL_MEDIA_KPIS,
  SOCIAL_MEDIA_MONTHLY_GOALS,
  SOCIAL_MEDIA_WEEKLY_TASKS,
  UNIVERSAL_DAILY_TASK,
} from "@/lib/dashboard/mock-data";
import { getResourceRequestMailtoHref } from "@/lib/campaign-links";
import { KELLY_ACCENT_SOCIAL_MEDIA, KELLY_HEADSHOT_LIBRARY } from "@/lib/campaign-assets";
import { inferVosMaturityFromTeam } from "@/lib/volunteer-ops/vos-team-maturity";
import { VosDailyUniversalTaskCard } from "@/components/dashboard/vos/VosDailyUniversalTaskCard";
import { KellyAccentCutout } from "@/components/dashboard/vos/KellyAccentCutout";
import { VosKpiMiniGrid } from "@/components/dashboard/vos/VosKpiSummary";
import { LocalMediaOutreachWorkspace } from "@/components/dashboard/vos/LocalMediaOutreachWorkspace";

const LOCAL_GRAPHIC_EXAMPLES = [
  "Local event announcement",
  "Kelly visit graphic",
  "House party invitation",
  "Voter registration reminder",
  "Campus event flyer",
  "County clerk visit recap",
  "Power of 5 invitation",
  "Volunteer recruitment graphic",
  "Local quote card",
  "“Join our team” graphic",
] as const;

const LOCAL_MEDIA_GRAPHICS_CHANNELS = [
  "Facebook groups",
  "Local newsletters",
  "Community calendars",
  "Event pages",
  "School and campus posts",
  "Chamber and community pages",
  "Local media outreach",
] as const;

export function TeamSocialMediaTabContent({ team, teamSlug }: { team: Team; teamSlug: string }) {
  const resourcesHref = `/dashboard/team/${teamSlug}/resources#local-post-ideas`;
  const designHub = "/volunteer/resources/social-media-design";
  const reviewMail = getResourceRequestMailtoHref();
  const maturity = inferVosMaturityFromTeam(team);
  const showLocalMedia = maturity >= 3;
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Social media lane</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Daily rhythm</h2>
        <p className="mt-3 font-body text-sm text-kelly-text/80">
          Like and comment on one campaign post every day — same as the universal card below. The Social lane also owns original
          local content, simple graphics, and coordination with the campaign social lead.
        </p>
      </section>

      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Canva and basic graphic design</h3>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">
          Every team should move fast on local visuals without waiting on campaign staff. The{" "}
          <span className="font-semibold text-kelly-deep">Social Media Coordinator</span> should either know basic Canva / graphic
          design or <span className="font-semibold text-kelly-navy">recruit someone into the social lane</span> who can help create
          graphics.
        </p>
        <p className="mt-3 font-body text-xs font-bold uppercase text-kelly-text/50">Graphic ideas (keep claims factual)</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
          {LOCAL_GRAPHIC_EXAMPLES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-3 border-t border-kelly-navy/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg font-body text-xs text-kelly-text/72">
            Use campaign-approved Kelly cutouts (transparent PNGs) in Canva — see the design hub for placement and approval rhythm.
          </p>
          <KellyAccentCutout src={KELLY_ACCENT_SOCIAL_MEDIA} />
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-blue/25 bg-kelly-blue/[0.06] p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Create local graphics</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          <span className="font-semibold text-kelly-deep">Weekly:</span> create or update one local graphic.
        </p>
        <p className="mt-1 font-body text-sm text-kelly-text/85">
          <span className="font-semibold text-kelly-deep">Monthly goal:</span> four local graphics created (tracked in lane KPIs).
        </p>
        <p className="mt-4 font-body text-xs font-bold uppercase text-kelly-navy">Local media graphics</p>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          Teams should be able to make simple graphics for: {LOCAL_MEDIA_GRAPHICS_CHANNELS.join(", ")}.
        </p>
        <p className="mt-3 rounded-lg border border-kelly-success/30 bg-white/80 px-3 py-2 font-body text-sm font-semibold text-kelly-deep">
          Keep it local, clear, and easy to share.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <PlaceholderTile title="Canva template library" body="Campaign-approved starters — link when assets are uploaded." />
          <PlaceholderTile
            title="Upload graphic for review"
            body={
              <>
                Until uploader ships, email HQ with subject line “Graphic review” — or use{" "}
                <a href={reviewMail} className="font-semibold text-kelly-blue underline">
                  resource request mailto
                </a>
                .
              </>
            }
          />
          <PlaceholderTile title="Download brand kit" body={`Coming soon — see ${designHub}#brand-kit`} />
          <PlaceholderTile
            title="Kelly headshots"
            body={
              <span className="block font-mono text-[11px] text-kelly-text/70">
                {KELLY_HEADSHOT_LIBRARY.filter((h) => !h.comingSoon)
                  .map((h) => h.path)
                  .join(", ") || "Paths in hub — uploads pending"}
              </span>
            }
          />
          <PlaceholderTile title="Local graphic examples" body="Screenshots folder / shared drive — wire when ready." />
        </div>
        <p className="mt-4 font-body text-xs text-kelly-text/65">
          Training:{" "}
          <Link href={`/dashboard/team/${teamSlug}/training#training-module-graphic-design-canva`} className="font-semibold text-kelly-blue underline">
            Basic Graphic Design / Canva module
          </Link>{" "}
          ·{" "}
          <Link href={designHub} className="font-semibold text-kelly-blue underline">
            Design resource hub
          </Link>
          .
        </p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Advanced execution · local media & press</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          Move past baseline Canva: maintain a small outreach sheet for reporters, ship quote cards with tight attribution, and prep
          press-safe crops when comms requests a packet.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
          <li>
            <Link href="/field-playbook/roles/social-advanced-local-press" className="font-semibold text-kelly-blue underline">
              Social · local media & press graphics (playbook)
            </Link>
          </li>
          <li>
            <Link href="/volunteer/resources/social-media-design" className="font-semibold text-kelly-blue underline">
              Design hub (templates & headshots)
            </Link>
          </li>
        </ul>
      </section>

      {showLocalMedia ? (
        <LocalMediaOutreachWorkspace />
      ) : (
        <section className="rounded-2xl border border-dashed border-kelly-text/25 bg-kelly-fog/40 p-6 md:p-8">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Coming later · Local media list</p>
          <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Build your local media list</h3>
          <p className="mt-2 font-body text-sm text-kelly-text/80">
            This workspace unlocks at <span className="font-semibold text-kelly-deep">Level 3 · Operate</span> (mature downstream
            work). Your team is currently inferred at <span className="font-semibold text-kelly-navy">Level {maturity}</span> — keep
            daily engagement and weekly lane rhythm first.
          </p>
        </section>
      )}

      <VosDailyUniversalTaskCard task={UNIVERSAL_DAILY_TASK} moreHref={`/dashboard/team/${teamSlug}/training`} />

      <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/60">Weekly · Social coordinator</p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Weekly tasks</h3>
        <ol className="mt-4 list-decimal space-y-3 pl-6 font-body text-sm leading-relaxed text-kelly-text/85">
          {SOCIAL_MEDIA_WEEKLY_TASKS.map((t, i) => (
            <li key={t.id} className="pl-1">
              <strong className="text-kelly-deep">
                {i + 1}. {t.title}
              </strong>
              {t.description ? <span className="mt-1 block text-kelly-text/75">{t.description}</span> : null}
            </li>
          ))}
        </ol>
        <h4 className="mt-8 font-heading text-base font-bold text-kelly-navy md:mt-10">Monthly goals</h4>
        <ul className="mt-3 space-y-2 font-body text-sm text-kelly-text/85">
          {SOCIAL_MEDIA_MONTHLY_GOALS.map((t) => (
            <li key={t.id} className="flex gap-2">
              <span aria-hidden>·</span>
              <span>
                {t.title}
                {t.description ? <span className="block text-xs text-kelly-text/70">{t.description}</span> : null}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-text/50">Social lane · planning KPIs</p>
          <VosKpiMiniGrid kpis={SOCIAL_MEDIA_KPIS} />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
          <h3 className="font-heading text-lg font-bold text-kelly-navy">Local post ideas</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-sm text-kelly-text/85">
            {MOCK_LOCAL_POST_IDEAS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-4 font-body text-xs text-kelly-text/65">
            More starters on the Resources tab:{" "}
            <Link href={resourcesHref} className="font-semibold text-kelly-navy underline">
              local post ideas
            </Link>
            .
          </p>
        </section>
        <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
          <h3 className="font-heading text-lg font-bold text-kelly-navy">Campaign priority posts</h3>
          <ul className="mt-4 space-y-3">
            {MOCK_SOCIAL_PRIORITY_POSTS.map((p) => (
              <li key={p.id} className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
                <p className="font-body text-sm font-semibold text-kelly-deep">{p.title}</p>
                <p className="mt-1 font-body text-xs text-kelly-text/75">{p.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Content requests</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/75">
          Short asks from the campaign social lead. Submit through your upstream contact until upload is wired.
        </p>
        <ul className="mt-4 space-y-2">
          {MOCK_CONTENT_REQUESTS.map((c) => (
            <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-kelly-text/10 bg-kelly-fog/40 px-3 py-2">
              <span className="font-body text-sm font-medium text-kelly-deep">{c.label}</span>
              {c.dueLabel ? <span className="font-body text-xs text-kelly-text/60">{c.dueLabel}</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PlaceholderTile({ title, body }: { title: string; body: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-kelly-text/25 bg-white/90 px-4 py-3">
      <p className="font-body text-xs font-bold uppercase text-kelly-text/50">{title}</p>
      <div className="mt-2 font-body text-sm text-kelly-text/75">{body}</div>
    </div>
  );
}
