import Link from "next/link";
import { prisma } from "@/lib/db";

const box = "rounded-lg border border-kelly-text/10 bg-white/85 px-2 py-2 text-[10px] text-kelly-text/85";

export async function ImportedCalendarEventsPanel() {
  const now = new Date();
  const rows = await prisma.googleCalendarEventRecord
    .findMany({
      where: { startAt: { gte: new Date(now.getTime() - 365 * 86400000) } },
      orderBy: { startAt: "asc" },
      take: 12,
      select: {
        id: true,
        summary: true,
        startAt: true,
        privacyRedacted: true,
        campaignEventId: true,
        calendarSource: { select: { label: true, displayName: true } },
      },
    })
    .catch(() => []);

  const total = await prisma.googleCalendarEventRecord.count().catch(() => 0);

  return (
    <section className={box}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-[9px] font-bold uppercase tracking-wider text-kelly-subtle">Imported Google events</h2>
        <Link href="/admin/workbench/communication-intelligence" className="text-[10px] font-bold text-kelly-forest underline">
          Communication Intelligence
        </Link>
      </div>
      <p className="mt-1 text-[9px] text-kelly-muted">Read-only ingest rows — total {total}. No Google writes from this list.</p>
      <ul className="mt-2 space-y-1">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap justify-between gap-1 border-b border-kelly-text/5 pb-1">
            <span className="font-semibold text-kelly-navy">{r.summary ?? "(event)"}</span>
            <span className="font-mono text-[9px] text-kelly-muted">{r.startAt?.toISOString() ?? "—"}</span>
            {r.campaignEventId ? (
              <Link className="text-kelly-forest underline" href={`/admin/workbench/calendar?event=${encodeURIComponent(r.campaignEventId)}&view=week`}>
                Linked CampaignEvent
              </Link>
            ) : (
              <span className="text-kelly-subtle">No CampaignEvent link</span>
            )}
            {r.privacyRedacted ? <span className="text-amber-800">redacted</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
