import Link from "next/link";

export type FieldCrumb = { label: string; href?: string };

export function FieldBreadcrumbs({ items }: { items: FieldCrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-kelly-text/75">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <span className="text-kelly-text/40">/</span> : null}
            {c.href ? (
              <Link href={c.href} className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                {c.label}
              </Link>
            ) : (
              <span className="font-semibold text-kelly-text">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
