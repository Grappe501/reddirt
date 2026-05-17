import Link from "next/link";

const cards = [
  {
    href: "/admin/calendar-command-center",
    title: "Kelly Calendar Command Center",
    body: "Candidate cockpit, schedule settlement, coverage plans, event staffing, route planning, GOTV goals, and AI readiness.",
  },
  {
    href: "/admin/travel-ledger",
    title: "Travel Ledger / Reimbursement Wizard",
    body: "Review campaign travel, calculate mileage, approve reimbursement items, and generate invoices.",
  },
  {
    href: "/admin/compliance",
    title: "Compliance Command Center",
    body: "Import fundraising and bank files, reconcile deposits, prepare filing-ready compliance records.",
  },
  { href: "/admin/homepage", title: "Homepage", body: "Hero, sections, quotes, featured rails." },
  { href: "/admin/pages", title: "Page copy", body: "Hero text for belief, movement, and pillar pages." },
  { href: "/admin/blog", title: "Blog / Substack", body: "Sync RSS, feature posts, teasers, placement." },
  { href: "/admin/media", title: "Media library", body: "Register imagery and embeds with metadata." },
  { href: "/admin/settings", title: "Settings", body: "Feed URL, sync status, integration notes." },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Website content board</h1>
      <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-kelly-text/75">
        You’re in the public-site control room: copy, homepage composition, syndicated writing, and media
        metadata. Organizer dashboards and field data stay in the other system.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <p className="rounded-lg border border-kelly-text/15 bg-kelly-page/70 px-4 py-3 font-body text-sm text-kelly-text/85">
          <strong>Candidate-facing console:</strong>{" "}
          <Link className="font-semibold text-kelly-slate underline underline-offset-2 hover:text-kelly-navy" href="/admin/ask-kelly">
            Ask Kelly command console
          </Link>{" "}
          — orientation, command-board links, integrations status, controlled research posture (planned).
        </p>
        <p className="rounded-lg border border-kelly-navy/20 bg-kelly-navy/[0.06] px-4 py-3 font-body text-sm text-kelly-text/85">
          <strong>Communication Command Center:</strong>{" "}
          <Link
            className="font-semibold text-kelly-slate underline underline-offset-2 hover:text-kelly-navy"
            href="/admin/workbench/email-command-center"
          >
            Open Communication Command Center
          </Link>{" "}
          — daily priorities, message follow-ups, readiness checks, audiences, imports, Message Studio, and send governance
          (admin workbench).
        </p>
        <div className="rounded-lg border border-emerald-800/25 bg-emerald-50/90 px-4 py-3 font-body text-sm text-kelly-text/90">
          <strong>Field plan (volunteers):</strong>{" "}
          <Link
            className="inline-flex items-center rounded-md bg-emerald-900 px-3 py-1.5 font-semibold text-white underline-offset-2 hover:bg-emerald-800"
            href="/admin/field-playbook"
          >
            Open three-person field playbook
          </Link>{" "}
          — fractal structure, lane guides, weekly huddles, and step-by-step hosting/social/relational playbooks.
        </div>
        <div className="rounded-lg border border-kelly-navy/20 bg-kelly-navy/[0.06] px-4 py-3 font-body text-sm text-kelly-text/85">
          <strong>Travel Ledger / Reimbursement Wizard:</strong>{" "}
          <Link
            className="inline-flex items-center rounded-md bg-kelly-navy px-3 py-1.5 font-semibold text-white underline-offset-2 hover:bg-kelly-slate"
            href="/admin/travel-ledger"
          >
            Open Travel Ledger
          </Link>{" "}
          — AI-assisted mileage review, approval workflow, invoices, and audit packet.
        </div>
        <div className="rounded-lg border border-kelly-navy/20 bg-kelly-navy/[0.06] px-4 py-3 font-body text-sm text-kelly-text/85">
          <strong>Compliance Command Center:</strong>{" "}
          <Link
            className="inline-flex items-center rounded-md bg-kelly-navy px-3 py-1.5 font-semibold text-white underline-offset-2 hover:bg-kelly-slate"
            href="/admin/compliance"
          >
            Open Compliance
          </Link>{" "}
          — import fundraising and bank files, reconcile deposits, and prepare filing-ready compliance records.
        </div>
        <div className="rounded-lg border border-kelly-navy/20 bg-kelly-navy/[0.06] px-4 py-3 font-body text-sm text-kelly-text/85">
          <strong>Kelly Calendar Command Center:</strong>{" "}
          <Link
            className="font-semibold text-kelly-slate underline underline-offset-2 hover:text-kelly-navy"
            href="/admin/calendar-command-center"
          >
            Open command center
          </Link>{" "}
          — candidate cockpit, schedule settlement, coverage plans, event staffing, route planning, GOTV goals, and AI readiness.
        </div>
      </div>
      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block h-full rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-kelly-navy/25"
            >
              <h2 className="font-heading text-lg font-bold text-kelly-text">{c.title}</h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/70">{c.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
