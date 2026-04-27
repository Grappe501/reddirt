import Link from "next/link";

/**
 * Admin shell placeholder: uses existing `requireAdminPage` from `(board)` layout only.
 * No Prisma, voter import, or live Power of 5 aggregates in this view.
 */
export default function AdminOrganizingIntelligencePlaceholderPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-kelly-text">Organizing intelligence — operator hub</h1>
      <p className="mt-2 max-w-3xl text-sm text-kelly-text/70">
        This route is a <strong>placeholder</strong> for campaign-side OIS tooling (queues, exports, QA) that complements the public{" "}
        <Link href="/organizing-intelligence" className="font-semibold text-kelly-navy underline" target="_blank" rel="noreferrer">
          organizing intelligence
        </Link>{" "}
        experience. No voter file, relational graph, or production Power of 5 rollups are wired here yet.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-kelly-text/80">
        <li>
          Public state rollup:{" "}
          <Link href="/organizing-intelligence" className="font-semibold text-kelly-navy underline" target="_blank" rel="noreferrer">
            /organizing-intelligence
          </Link>
        </li>
        <li>
          County placeholder under OIS:{" "}
          <code className="rounded bg-kelly-text/5 px-1">/organizing-intelligence/counties/[countySlug]</code> (e.g.{" "}
          <Link
            href="/organizing-intelligence/counties/pope-county"
            className="font-semibold text-kelly-navy underline"
            target="_blank"
            rel="noreferrer"
          >
            pope-county
          </Link>
          )
        </li>
        <li>
          Volunteer placeholders:{" "}
          <Link href="/dashboard" className="font-semibold text-kelly-navy underline" target="_blank" rel="noreferrer">
            /dashboard
          </Link>
          ,{" "}
          <Link href="/dashboard/leader" className="font-semibold text-kelly-navy underline" target="_blank" rel="noreferrer">
            /dashboard/leader
          </Link>
        </li>
        <li>
          Related admin:{" "}
          <Link href="/admin/county-intelligence" className="font-semibold text-kelly-navy underline">
            County intel
          </Link>
          ,{" "}
          <Link href="/admin/intelligence" className="font-semibold text-kelly-navy underline">
            Opposition intelligence
          </Link>
        </li>
      </ul>
    </div>
  );
}
