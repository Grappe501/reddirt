import Link from "next/link";
import { PAGE_KEYS } from "@/lib/content/page-blocks";

export default function AdminPagesHubPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Page copy</h1>
      <p className="mt-3 font-body text-sm text-kelly-text/75">
        Adjust hero eyebrow, title, and subtitle for major public pages. Deeper blocks stay code-defined until you
        extend the block model. When you open a page, you review once, then confirm before anything is saved to the
        database.
      </p>
      <ul className="mt-8 divide-y divide-kelly-text/10 rounded-card border border-kelly-text/10 bg-kelly-page shadow-[var(--shadow-soft)]">
        {PAGE_KEYS.map((key) => (
          <li key={key}>
            <Link
              href={`/admin/pages/${key}`}
              className="flex items-center justify-between px-5 py-4 font-body text-sm font-medium transition hover:bg-kelly-text/[0.04]"
            >
              <span className="capitalize text-kelly-text">{key.replace(/-/g, " ")}</span>
              <span className="text-kelly-navy">Open editor →</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-lg border border-kelly-forest/15 bg-kelly-fog/50 px-4 py-3 text-sm text-kelly-text/90">
        <p className="font-semibold text-kelly-navy/95">If you’re looking for something else</p>
        <ul className="mt-2 list-inside list-disc space-y-1 pl-0.5 text-kelly-text/85">
          <li>
            <span className="font-medium">Page content (hero for each page)</span> — you’re in the right place. Pick a page above, then use{" "}
            <span className="font-medium">Review change</span> and <span className="font-medium">Confirm update</span> before anything saves.
          </li>
          <li>
            <span className="font-medium">Campaign feedback (Ask Kelly triage)</span> —{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/admin/workbench/ask-kelly-beta">
              /admin/workbench/ask-kelly-beta
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
