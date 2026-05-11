import Link from "next/link";

import type { Announcement, CampaignAlert, PriorityAction, SharedFile, TeamMessage } from "@/types/dashboard";

type Props = {
  announcements: Announcement[];
  priorityActions: PriorityAction[];
  messages: TeamMessage[];
  sharedFiles: SharedFile[];
  alerts: CampaignAlert[];
  compact?: boolean;
  /** Full messages tab URL for this team (Phase 1 team dashboard) */
  messagesHref?: string;
};

export function VosCommunicationHub({
  announcements,
  priorityActions,
  messages,
  sharedFiles,
  alerts,
  compact = false,
  messagesHref,
}: Props) {
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">Communication hub</p>
          <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Stay in the loop</h3>
          <p className="mt-1 font-body text-sm text-kelly-text/70">
            Placeholder feed — future: announcements, DMs, and file drops. Auth not wired in this pass.
          </p>
        </div>
        {messagesHref ? (
          <Link
            href={messagesHref}
            className="min-h-[44px] shrink-0 font-body text-sm font-semibold text-kelly-navy underline sm:min-h-0"
          >
            Messages &amp; alerts →
          </Link>
        ) : null}
      </div>

      {alerts.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className={`rounded-lg px-3 py-2 font-body text-xs ${
                a.severity === "warning" ? "bg-amber-50 text-amber-950" : "bg-kelly-blue/10 text-kelly-deep"
              }`}
            >
              {a.label}
            </li>
          ))}
        </ul>
      ) : null}

      <h4 className="mt-6 font-heading text-sm font-bold text-kelly-navy">Priority actions</h4>
      <ul className="mt-2 space-y-2">
        {priorityActions.map((p) => (
          <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-kelly-text/10 bg-kelly-fog/40 px-3 py-2">
            {p.href ? (
              <Link href={p.href} className="font-body text-sm font-medium text-kelly-blue underline">
                {p.label}
              </Link>
            ) : (
              <span className="font-body text-sm font-medium text-kelly-deep">{p.label}</span>
            )}
            {p.dueLabel ? <span className="font-body text-xs text-kelly-text/60">{p.dueLabel}</span> : null}
          </li>
        ))}
      </ul>

      <h4 className="mt-6 font-heading text-sm font-bold text-kelly-navy">Announcements</h4>
      <ul className="mt-2 space-y-3">
        {announcements.map((a) => (
          <li key={a.id} className="rounded-lg border border-kelly-text/10 bg-kelly-page/80 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading text-sm font-bold text-kelly-deep">{a.title}</span>
              {a.priority === "high" ? (
                <span className="rounded bg-kelly-gold/30 px-1.5 py-0.5 font-body text-[10px] font-bold uppercase">Priority</span>
              ) : null}
            </div>
            <p className="mt-1 font-body text-xs text-kelly-text/80">{a.body}</p>
            <p className="mt-1 font-body text-[10px] text-kelly-text/50">{a.createdAt}</p>
          </li>
        ))}
      </ul>

      {!compact ? (
        <>
          <h4 className="mt-6 font-heading text-sm font-bold text-kelly-navy">Team messages (preview)</h4>
          <ul className="mt-2 space-y-2">
            {messages.slice(0, 2).map((m) => (
              <li key={m.id} className="rounded-lg border border-kelly-text/10 px-3 py-2">
                <p className="font-body text-xs font-semibold text-kelly-deep">{m.fromName}</p>
                <p className="font-body text-xs text-kelly-text/75">{m.preview}</p>
                <p className="font-body text-[10px] text-kelly-text/50">{m.createdAt}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h4 className="mt-6 font-heading text-sm font-bold text-kelly-navy">Shared files</h4>
      <ul className="mt-2 space-y-1">
        {sharedFiles.map((f) => (
          <li key={f.id}>
            <Link href={f.href} className="font-body text-sm text-kelly-blue underline">
              {f.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
