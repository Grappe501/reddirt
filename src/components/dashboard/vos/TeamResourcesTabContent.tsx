import Link from "next/link";

import { TeamMessagingLibrary } from "@/components/dashboard/vos/TeamMessagingLibrary";
import { KellyAccentCutout } from "@/components/dashboard/vos/KellyAccentCutout";
import { KELLY_ACCENT_RESOURCES } from "@/lib/campaign-assets";
import { FUNDRAISING_RESOURCE_LIBRARY } from "@/lib/volunteer-ops/fundraising-tab-demo";

function buildQuickLinks(teamSlug: string): { href: string; label: string }[] {
  const base = `/dashboard/team/${teamSlug}`;
  return [
    { href: "/volunteer/resources", label: "Volunteer resource library" },
    { href: "/volunteer/resources/youth-outreach", label: "Youth Outreach (P5/VR) · hub" },
    { href: "/volunteer/resources/social-media-design", label: "Social media & design (Canva) · hub" },
    { href: `${base}/youth-outreach`, label: "Youth (P5/VR) tab — this team" },
    { href: "/volunteer/resources/email-templates", label: "Email templates" },
    { href: "/volunteer/resources/messaging", label: "Messaging & talking points" },
    { href: "/field-playbook", label: "Field playbook (web)" },
    { href: "/field-playbook/roles/events-coordinator", label: "Events coordinator guide" },
    { href: "/field-playbook/roles/social-coordinator", label: "Social media coordinator guide" },
    { href: "/field-playbook/roles/power-of-five-coordinator", label: "Power of 5 / VR coordinator guide" },
    { href: "/volunteer/resources/team-launch-kit", label: "Team Launch Kit (hub)" },
    { href: "/field-playbook/overview/self-building-team-system", label: "Self-Building Team System (doctrine)" },
    { href: "/field-playbook/roles/events-hosting-playbook", label: "Hosting a small gathering (playbook)" },
    { href: `${base}/events`, label: "Events tab — this team" },
    { href: `${base}/fundraising`, label: "Fundraising workspace (Week 4 / Level 4)" },
    { href: "/volunteer/resources/events-lane", label: "Events lane · operating manual (hub)" },
    { href: "/field-playbook/roles/house-party-playbook", label: "House party playbook (field)" },
    { href: "/volunteer/resources#weekly-operations", label: "Event planning templates & weekly ops" },
    { href: "/volunteer/resources", label: "Social media examples (resource library)" },
  ];
}

export function TeamResourcesTabContent({ teamSlug }: { teamSlug: string }) {
  const links = buildQuickLinks(teamSlug);
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Resources</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Library & playbooks</h2>
        <p className="mt-3 font-body text-sm text-kelly-text/80">
          Central links for your triad. Campaign-approved PDFs and templates will continue to roll into the volunteer library and
          field playbook.
        </p>
        <p className="mt-3 font-body text-sm text-kelly-text/80">
          <span className="font-semibold text-kelly-navy">Youth Outreach</span> is a formal sub-lane under Power of 5 / Voter
          Registration — open{" "}
          <Link href={`/dashboard/team/${teamSlug}/youth-outreach`} className="font-semibold text-kelly-blue underline">
            Youth (P5/VR)
          </Link>{" "}
          on this team or the resource hub above.
        </p>
        <div className="mt-4 flex flex-col gap-3 border-t border-kelly-text/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-xs text-kelly-text/70">
            Bookmark the design hub when you need Kelly cutouts for local graphics — stay inside approved assets.
          </p>
          <KellyAccentCutout src={KELLY_ACCENT_RESOURCES} />
        </div>
      </section>

      <TeamMessagingLibrary teamSlug={teamSlug} />

      <section id="fundraising-resources" className="rounded-2xl border border-kelly-gold/30 bg-kelly-gold/[0.06] p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-deep/60">Fundraising resources</p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Review-gated library (no downloads yet)</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/80">
          Assets move Draft → Internal review → Ernie review → Mockup ready → Approved → Published. Use the fundraising workspace for
          lane context and KPI placeholders.
        </p>
        <p className="mt-3">
          <Link href={`/dashboard/team/${teamSlug}/fundraising`} className="font-semibold text-kelly-blue underline">
            Open team fundraising workspace →
          </Link>
        </p>
        <ul className="mt-4 space-y-2">
          {FUNDRAISING_RESOURCE_LIBRARY.map((r) => (
            <li key={r.title} className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2 font-body text-xs text-kelly-text/85">
              <span className="font-semibold text-kelly-navy">{r.title}</span>{" "}
              <span className="text-kelly-text/50">· {r.stage}</span>
              <span className="mt-0.5 block text-kelly-text/65">{r.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="local-post-ideas" className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Local post ideas</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/85">
          Keep stories truthful and local. Pair a photo you have rights to use with a short caption about showing up for community —
          not opponent attacks.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-sm text-kelly-text/85">
          <li>“Why I said yes to volunteering” — 3 sentences + a community photo.</li>
          <li>Event recap: what you heard, what you’ll do next (no private details).</li>
          <li>Invitation: “We’re building a neighbor-led team — start at /volunteer.”</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Quick links</h3>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.href + l.label}>
              <Link href={l.href} className="font-body text-sm font-medium text-kelly-blue underline hover:text-kelly-navy">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
