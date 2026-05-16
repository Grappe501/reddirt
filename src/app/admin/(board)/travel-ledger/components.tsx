import Link from "next/link";
import type { ReactNode } from "react";
import type { TravelLedgerItem, TravelLedgerStorageMode } from "@/lib/travel-ledger/types";

const basePath = "/admin/travel-ledger";

export function TravelLedgerPageHeader({
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

export function TravelLedgerNav() {
  const links = [
    ["Home", basePath],
    ["Wizard", `${basePath}/wizard`],
    ["Documents", `${basePath}/documents`],
    ["Invoices", `${basePath}/invoices`],
    ["Review", `${basePath}/review`],
    ["Audit", `${basePath}/audit`],
    ["Settings", `${basePath}/settings`],
  ] as const;
  return (
    <nav className="flex flex-wrap gap-2 rounded-2xl border border-kelly-text/10 bg-kelly-wash p-3" aria-label="Travel ledger">
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

export function StorageModeBadge({ mode }: { mode: TravelLedgerStorageMode }) {
  return (
    <div className="rounded-2xl border border-amber-700/20 bg-amber-50 px-4 py-3 font-body text-sm text-amber-950">
      <strong>Storage mode:</strong> {mode === "json-fallback" ? "JSON fallback" : mode}
    </div>
  );
}

export function TravelLedgerCard({
  eyebrow,
  title,
  children,
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  tone?: "default" | "highlight" | "danger";
}) {
  const toneClass =
    tone === "highlight"
      ? "border-kelly-navy/20 bg-kelly-navy/[0.06]"
      : tone === "danger"
        ? "border-red-900/20 bg-red-50"
        : "border-kelly-text/10 bg-kelly-page";
  return (
    <article className={`rounded-2xl border p-5 shadow-[var(--shadow-soft)] ${toneClass}`}>
      {eyebrow ? <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-slate">{eyebrow}</p> : null}
      <h2 className="mt-1 font-heading text-xl font-bold text-kelly-text">{title}</h2>
      <div className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">{children}</div>
    </article>
  );
}

export function PrimaryAdminAction({
  children,
  href,
  type = "button",
  name,
  value,
  variant = "primary",
}: {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  name?: string;
  value?: string;
  variant?: "primary" | "secondary" | "danger" | "quiet";
}) {
  const className =
    variant === "primary"
      ? "inline-flex items-center rounded-full bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white transition hover:bg-kelly-slate"
      : variant === "danger"
        ? "inline-flex items-center rounded-full bg-red-900 px-4 py-2 font-body text-sm font-bold text-white transition hover:bg-red-800"
        : variant === "quiet"
          ? "inline-flex items-center rounded-full border border-kelly-text/15 bg-transparent px-4 py-2 font-body text-sm font-bold text-kelly-text transition hover:border-kelly-navy/30 hover:text-kelly-navy"
          : "inline-flex items-center rounded-full border border-kelly-navy/25 bg-kelly-page px-4 py-2 font-body text-sm font-bold text-kelly-navy transition hover:bg-kelly-wash";
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} name={name} value={value} className={className}>
      {children}
    </button>
  );
}

export function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-kelly-text/10 bg-kelly-wash px-2.5 py-1 font-body text-xs font-semibold text-kelly-text/70">
      {children}
    </span>
  );
}

export function ApprovalSummary({ item }: { item: TravelLedgerItem }) {
  return (
    <TravelLedgerCard eyebrow="Ready for approval" title="Approval Summary" tone="highlight">
      <div className="grid gap-2 sm:grid-cols-2">
        <p>
          <strong>Route:</strong> {item.routeText || "City needed"}
        </p>
        <p>
          <strong>Total reimbursable miles:</strong> {item.totalReimbursableMiles.toFixed(1)}
        </p>
        <p>
          <strong>Reimbursement:</strong> {formatMoney(item.reimbursementAmount)}
        </p>
        <p>
          <strong>Purpose:</strong> {item.businessPurpose || "Save a purpose before approval."}
        </p>
      </div>
    </TravelLedgerCard>
  );
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export { basePath as travelLedgerBasePath };
