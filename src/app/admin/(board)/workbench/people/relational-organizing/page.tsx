import Link from "next/link";

export const dynamic = "force-dynamic";

const WORKBENCH = "/admin/workbench";
const TEXT_REACH = "/admin/workbench/communication-command-center/text-reach";

export default function RelationalOrganizingPreviewPage() {
  return (
    <div className="min-w-0 max-w-3xl space-y-6 px-1 py-2">
      <div className="flex flex-wrap gap-2">
        <Link href={WORKBENCH} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Workbench
        </Link>
        <Link href={TEXT_REACH} className="rounded border border-violet-300/50 bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-950">
          Text + Reach
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">RedDirt Reach — preview</h1>
        <p className="font-body text-sm text-kelly-text/85">
          This area will help volunteers organize through <strong>people they already know</strong>. Today it is a preview only —
          no saving from this page, no bulk uploads, no mass texting.
        </p>
      </header>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">What this tool will do</h2>
        <p className="mt-2 font-body text-xs text-kelly-text/88">
          Volunteers will add someone they know, say how they are connected, and pick a respectful follow-up. Staff will review
          new relationships before anything sensitive goes wider.
        </p>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Volunteer relationship entry</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ["Manual add person", "Name and best way to reach them — no automatic imports."],
            ["Relationship type", "Friend, neighbor, coworker, family, and so on."],
            ["Trust level", "How well the volunteer knows them."],
            ["County or community", "Where they live or vote so the right team can help."],
            ["Suggested ask", "Event invite, ride, yard sign — optional."],
            ["Follow-up date", "When the volunteer plans to check back in."],
          ].map(([title, body]) => (
            <div key={title} className="rounded border border-dashed border-kelly-text/15 bg-kelly-page/30 p-3 font-body text-xs text-kelly-text/80">
              <p className="font-heading text-[11px] font-bold text-kelly-navy">{title}</p>
              <p className="mt-1">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-4 shadow-sm">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Staff review queue</h2>
        <p className="mt-1 font-body text-xs text-kelly-text/80">These lanes will show up as cards once the product ships.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            "New relationships to review",
            "Needs follow-up",
            "Potential volunteer leader",
            "Needs ride or help",
            "Event invite opportunity",
          ].map((title) => (
            <div
              key={title}
              className="rounded-lg border border-dashed border-kelly-text/20 bg-kelly-page/25 p-3 text-center font-body text-xs text-kelly-text/70"
            >
              {title}
              <div className="mt-1 text-[10px] text-kelly-text/55">Not active yet</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-amber-200/80 bg-amber-50/90 p-4">
        <h2 className="font-heading text-sm font-bold text-amber-950">Safety and privacy</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-xs text-amber-950/90">
          <li>Large contact file imports stay off until a separate headquarters decision.</li>
          <li>Public mass texting stays off until compliance and approvals are complete.</li>
          <li>Sensitive notes about people deserve care — train volunteers and staff before go-live.</li>
        </ul>
      </section>
    </div>
  );
}
