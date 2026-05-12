import {
  MOCK_ANNOUNCEMENTS,
  MOCK_CAMPAIGN_ALERTS,
  MOCK_PRIORITY_ACTIONS,
  MOCK_SHARED_FILES,
  MOCK_TEAM_MESSAGES,
} from "@/lib/dashboard/mock-data";
import { AUTOMATION_EMAIL_TEMPLATES } from "@/lib/volunteer-ops/team-action-queue-demo";
import { DISCORD_VOLUNTEER_BLURB } from "@/lib/volunteer-ops/discord-volunteer-copy";
import { VosCommunicationHub } from "@/components/dashboard/vos/VosCommunicationHub";
import Link from "next/link";
import { KellyAccentCutout } from "@/components/dashboard/vos/KellyAccentCutout";
import { KELLY_ACCENT_MESSAGES } from "@/lib/campaign-assets";

export function TeamMessagesTabContent({ teamSlug }: { teamSlug: string }) {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Messages</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Campaign communications center</h2>
        <p className="mt-3 font-body text-sm text-kelly-text/80">
          Weekly briefing, priority actions, alerts, team discussions, and file drops will consolidate here. Feed below is static for
          Phase 1; future inbox replaces mock items.
        </p>
        <div className="mt-4 rounded-xl border border-kelly-gold/35 bg-kelly-gold/[0.08] p-4">
          <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-deep/80">Messaging library</p>
          <p className="mt-2 font-body text-sm text-kelly-text/85">
            Approved phrases, weekly message seeds, and social captions — live on the Resources tab for easy copying.
          </p>
          <Link
            href={`/dashboard/team/${teamSlug}/resources#messaging-library`}
            className="mt-3 inline-flex font-body text-sm font-semibold text-kelly-blue underline"
          >
            Open Messaging Library →
          </Link>
        </div>

        <div className="mt-4 rounded-xl border border-kelly-navy/15 bg-kelly-navy/[0.04] p-4">
          <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-navy/75">Discord (day-to-day)</p>
          <p className="mt-2 font-body text-sm text-kelly-text/85">{DISCORD_VOLUNTEER_BLURB}</p>
        </div>

        <section id="automation-templates" className="mt-4 scroll-mt-24 rounded-xl border border-kelly-text/10 bg-kelly-page/80 p-4">
          <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-text/55">Automation · email template library (scaffold)</p>
          <p className="mt-2 font-body text-sm text-kelly-text/80">
            Draft templates for future automation — all entries stay in <span className="font-semibold">draft</span> review status until
            campaign editorial approves them. No live sends from this panel in Script 6.
          </p>
          <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
            {AUTOMATION_EMAIL_TEMPLATES.slice(0, 8).map((t) => (
              <li key={t.id} className="rounded-lg border border-kelly-text/10 bg-white px-3 py-2 font-body text-xs text-kelly-text/85">
                <span className="font-semibold text-kelly-navy">{t.title}</span>
                <span className="text-kelly-text/50"> · {t.reviewStatus}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`/dashboard/team/${teamSlug}/resources#automation-templates-list`}
            className="mt-3 inline-flex font-body text-sm font-semibold text-kelly-blue underline"
          >
            Full template list on Resources →
          </Link>
        </section>
        <div className="mt-4 flex flex-col gap-3 border-t border-kelly-text/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-xs text-kelly-text/70">Escalate policy questions upstream — keep routine comms local.</p>
          <KellyAccentCutout src={KELLY_ACCENT_MESSAGES} />
        </div>
      </section>

      <VosCommunicationHub
        announcements={MOCK_ANNOUNCEMENTS}
        priorityActions={MOCK_PRIORITY_ACTIONS}
        messages={MOCK_TEAM_MESSAGES}
        sharedFiles={MOCK_SHARED_FILES}
        alerts={MOCK_CAMPAIGN_ALERTS}
      />

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Team discussions (preview)</h3>
        <ul className="mt-4 space-y-3">
          {MOCK_TEAM_MESSAGES.map((m) => (
            <li key={m.id} className="rounded-xl border border-kelly-text/10 bg-white px-4 py-3">
              <p className="font-body text-sm font-semibold text-kelly-deep">{m.fromName}</p>
              <p className="mt-1 font-body text-sm text-kelly-text/80">{m.preview}</p>
              <p className="mt-2 font-body text-[10px] text-kelly-text/50">{m.createdAt}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
