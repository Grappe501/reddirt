import Link from "next/link";
import { PAGE_KEYS } from "@/lib/content/page-blocks";

export default function AdminPagesHubPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Page copy</h1>
      <p className="mt-3 font-body text-sm text-deep-soil/75">
        Adjust hero eyebrow, title, and subtitle for major public pages. Deeper blocks stay code-defined until you
        extend the block model.
      </p>
      <ul className="mt-8 divide-y divide-deep-soil/10 rounded-card border border-deep-soil/10 bg-cream-canvas shadow-[var(--shadow-soft)]">
        {PAGE_KEYS.map((key) => (
          <li key={key}>
            <Link
              href={`/admin/pages/${key}`}
              className="flex items-center justify-between px-5 py-4 font-body text-sm font-medium transition hover:bg-deep-soil/[0.04]"
            >
              <span className="capitalize text-deep-soil">{key.replace(/-/g, " ")}</span>
              <span className="text-red-dirt">Edit →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
