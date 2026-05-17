import Link from "next/link";
import type { ReactNode } from "react";

const basePath = "/admin/compliance";

export function CompliancePageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
      <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-kelly-slate">{eyebrow}</p>
      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-kelly-text">{title}</h1>
          <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

export function ComplianceNav() {
  const links = [
    ["Home", basePath],
    ["Wizard", `${basePath}/wizard`],
    ["Money", `${basePath}/money`],
    ["Receipts", `${basePath}/receipts`],
    ["Cash", `${basePath}/cash`],
    ["Checks", `${basePath}/checks`],
    ["Vendors", `${basePath}/vendors`],
    ["Documentation", `${basePath}/documentation`],
    ["Imports", `${basePath}/imports`],
    ["GoodChange", `${basePath}/imports/goodchange`],
    ["Bank", `${basePath}/imports/bank`],
    ["Reconciliation", `${basePath}/reconciliation`],
    ["Rules", `${basePath}/rules`],
    ["Reports", `${basePath}/reports`],
    ["Settings", `${basePath}/settings`],
  ] as const;
  return (
    <nav className="flex flex-wrap gap-2 rounded-2xl border border-kelly-text/10 bg-kelly-wash p-3" aria-label="Compliance">
      {links.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className="rounded-full border border-kelly-text/10 bg-kelly-page px-3 py-1.5 font-body text-xs font-semibold text-kelly-text/75 transition hover:border-kelly-navy/30 hover:text-kelly-navy"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function ComplianceCard({
  eyebrow,
  title,
  children,
  href,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  href?: string;
}) {
  const content = (
    <article className="h-full rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
      {eyebrow ? <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-slate">{eyebrow}</p> : null}
      <h2 className="mt-1 font-heading text-xl font-bold text-kelly-text">{title}</h2>
      <div className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">{children}</div>
    </article>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block h-full transition hover:-translate-y-0.5">
      {content}
    </Link>
  );
}

export function StorageModeNotice() {
  return (
    <div className="rounded-2xl border border-amber-700/20 bg-amber-50 px-4 py-3 font-body text-sm text-amber-950">
      <strong>Storage mode:</strong> JSON fallback in <code>data/compliance</code>. Uploaded private CSV files and per-upload analyses are ignored by git.
    </div>
  );
}

export { basePath as complianceBasePath };
