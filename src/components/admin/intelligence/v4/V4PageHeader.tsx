import Link from "next/link";

export function V4BackLinks() {
  return (
    <>
      <Link href="/admin/intelligence" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
        Hub
      </Link>
      <Link
        href="/admin/intelligence/kim-hammer/debate-prep"
        className="rounded-full border border-violet-800/30 px-3 py-1 text-xs font-bold text-violet-950"
      >
        Debate prep
      </Link>
    </>
  );
}

export function V4PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 border-b border-kelly-text/10 pb-4">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-violet-900">{eyebrow}</p>
      <h1 className="font-heading text-3xl font-bold text-kelly-navy">{title}</h1>
      <p className="mt-2 max-w-4xl font-body text-sm text-kelly-muted">{description}</p>
      {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
    </header>
  );
}
