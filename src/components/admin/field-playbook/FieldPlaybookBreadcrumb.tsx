import Link from "next/link";

import { findFieldPlaybookNavLabel } from "@/lib/field-playbook/md-manifest";

function humanizeSegment(seg: string): string {
  return seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function FieldPlaybookBreadcrumb({ pathKey }: { pathKey: string }) {
  if (pathKey === "") return null;
  const segments = pathKey.split("/");
  const crumbs = segments.map((_, i) => {
    const partial = segments.slice(0, i + 1).join("/");
    return {
      label: findFieldPlaybookNavLabel(partial) ?? humanizeSegment(segments[i] ?? ""),
      href: `/admin/field-playbook/${partial}`,
    };
  });
  return (
    <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 font-body text-xs text-kelly-slate">
      <Link href="/admin/field-playbook" className="font-semibold text-kelly-blue hover:underline">
        Field plan home
      </Link>
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center gap-2">
          <span className="text-kelly-text/35" aria-hidden>
            /
          </span>
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-kelly-text">{c.label}</span>
          ) : (
            <Link href={c.href} className="text-kelly-blue hover:underline">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
