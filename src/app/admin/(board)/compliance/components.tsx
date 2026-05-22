import Link from "next/link";
import type { ReactNode } from "react";

const basePath = "/admin/compliance";

export type ComplianceStatusTone = "green" | "yellow" | "red" | "neutral" | "navy";

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
    <section className="os-hero">
      <p className="os-eyebrow">{eyebrow}</p>
      <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-kelly-navy">{title}</h1>
          <p className="mt-3 max-w-3xl os-body-muted">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

export function ComplianceNav() {
  const links = [
    ["Ernie (start)", `${basePath}/ernie`],
    ["Command center", `${basePath}/command-center`],
    ["Hub", basePath],
    ["Wizard", `${basePath}/wizard`],
    ["Approval", `${basePath}/approval`],
    ["April26", `${basePath}/april26`],
    ["Tasks", `${basePath}/tasks`],
    ["Money", `${basePath}/money`],
    ["Receipts", `${basePath}/receipts`],
    ["Cash", `${basePath}/cash`],
    ["Checks", `${basePath}/checks`],
    ["In-kind auction", `${basePath}/in-kind/ozark-auction`],
    ["Reconcile", `${basePath}/reconciliation`],
    ["Can we file?", `${basePath}/filing-readiness`],
    ["Filings", `${basePath}/filings`],
    ["Rules", `${basePath}/rules`],
    ["April26", `${basePath}/april26`],
    ["Reports", `${basePath}/reports`],
    ["Mobile", `${basePath}/mobile`],
    ["Settings", `${basePath}/settings`],
  ] as const;
  return (
    <nav className="os-card flex flex-wrap gap-2 p-3" aria-label="Compliance">
      {links.map(([label, href]) => (
        <Link key={href} href={href} className="os-chip hover:border-kelly-navy/30">
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
  highlight,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <article
      className={`h-full rounded-2xl border p-5 shadow-[var(--shadow-soft)] ${
        highlight ? "border-kelly-navy/30 bg-kelly-navy text-kelly-inverse" : "border-kelly-border bg-[var(--color-surface-elevated)]"
      }`}
    >
      {eyebrow ? (
        <p className={`font-body text-[11px] font-bold uppercase tracking-[0.2em] ${highlight ? "text-kelly-inverse-soft" : "text-kelly-subtle"}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`mt-1 font-heading text-xl font-bold ${highlight ? "text-kelly-inverse" : "text-kelly-navy"}`}>{title}</h2>
      <div className={`mt-3 font-body text-sm leading-relaxed ${highlight ? "text-kelly-inverse-soft" : "text-kelly-muted"}`}>{children}</div>
    </article>
  );

  if (!href) return content;
  return (
    <Link href={href} className="block h-full transition hover:-translate-y-0.5">
      {content}
    </Link>
  );
}

export function ComplianceMetricCard({ label, value, tone = "neutral" }: { label: string; value: string | number; tone?: ComplianceStatusTone }) {
  const toneClass =
    tone === "green"
      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
      : tone === "yellow"
        ? "border-amber-300 bg-amber-50 text-amber-950"
        : tone === "red"
          ? "border-red-300 bg-red-50 text-red-950"
          : tone === "navy"
            ? "border-kelly-navy/20 bg-[var(--color-surface-elevated)] text-kelly-navy"
            : "border-kelly-border bg-[var(--color-surface-elevated)] text-kelly-text";
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-kelly-subtle">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold">{value}</p>
    </div>
  );
}

export function ComplianceStatusBadge({ label, tone }: { label: string; tone: ComplianceStatusTone }) {
  const className =
    tone === "green"
      ? "bg-emerald-100 text-emerald-900"
      : tone === "yellow"
        ? "bg-amber-100 text-amber-900"
        : tone === "red"
          ? "bg-red-100 text-red-900"
          : tone === "navy"
            ? "bg-kelly-navy text-kelly-inverse"
            : "bg-kelly-mist text-kelly-navy";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${className}`}>{label}</span>;
}

export function ComplianceEmptyState({ title, description, href, actionLabel }: { title: string; description: string; href?: string; actionLabel?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-kelly-border bg-[var(--color-surface-elevated)] p-8 text-center">
      <h3 className="font-heading text-lg font-bold text-kelly-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-md os-body-muted">{description}</p>
      {href && actionLabel ? (
        <Link href={href} className="mt-4 inline-flex rounded-full bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-inverse">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function ComplianceWarningPanel({ title, children, tone = "amber", id }: { title: string; children: ReactNode; tone?: "amber" | "red"; id?: string }) {
  const className = tone === "red" ? "border-red-300 bg-red-50 text-red-950" : "border-amber-300 bg-amber-50 text-amber-950";
  return (
    <div id={id} className={`rounded-2xl border px-4 py-3 font-body text-sm ${className}`}>
      <p className="font-bold">{title}</p>
      <div className="mt-1 leading-relaxed">{children}</div>
    </div>
  );
}

export function ComplianceActionButton({
  href,
  onClick,
  label,
  variant = "primary",
  type = "button",
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
}) {
  const className =
    variant === "primary"
      ? "rounded-full bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-inverse hover:bg-kelly-blue"
      : variant === "danger"
        ? "rounded-full border border-red-700 px-5 py-2.5 text-sm font-bold text-red-900"
        : "rounded-full border border-kelly-border bg-[var(--color-surface-elevated)] px-5 py-2.5 text-sm font-bold text-kelly-navy";
  if (href) return <Link href={href} className={`inline-flex ${className}`}>{label}</Link>;
  return (
    <button type={type} onClick={onClick} className={className}>
      {label}
    </button>
  );
}

export function StorageModeNotice() {
  return (
    <ComplianceWarningPanel title="Storage mode: JSON fallback (needs setup for production DB)">
      Operational data lives under <code className="rounded bg-white/80 px-1 text-kelly-navy">data/compliance</code>. Uploaded CSVs, receipts, and donor JSON are gitignored. Records here are <strong>staged, not filed</strong> until human approval and export gates pass.
    </ComplianceWarningPanel>
  );
}

export function ComplianceOperatorChecklist({ steps }: { steps: string[] }) {
  return (
    <section className="rounded-2xl border border-[#0f2744]/20 bg-[#0f2744] p-5 text-white shadow-sm">
      <h2 className="font-heading text-lg font-bold">Operator checklist</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 font-body text-sm leading-relaxed text-slate-100">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}

export function ComplianceStagedNotice() {
  return (
    <p className="rounded-xl border border-kelly-border bg-kelly-mist px-4 py-2 text-xs font-semibold text-kelly-navy">
      Staged for review — not filed. Treasurer/compliance officer approval required. Not legal certification.
    </p>
  );
}

export function ComplianceHeroActions() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <ComplianceCard eyebrow="Primary" title="Start Compliance Wizard" href="/admin/compliance/wizard" highlight>
        Choose contribution, receipt, cash, check, vendor, bank CSV, or GoodChange — guided intake with human approval.
      </ComplianceCard>
      <ComplianceCard eyebrow="Primary" title="Lightning Approval Workbench" href="/admin/compliance/approval" highlight>
        Review AI-prepared records one at a time with evidence, inline edits, and audit-safe approve/reject.
      </ComplianceCard>
    </section>
  );
}

export { basePath as complianceBasePath };
