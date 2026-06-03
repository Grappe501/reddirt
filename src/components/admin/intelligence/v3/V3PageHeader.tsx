import Link from "next/link";
import type { ReactNode } from "react";

export function V3PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-6 border-b border-kelly-text/10 pb-4">
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-violet-900">{eyebrow}</p>
      <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-navy lg:text-3xl">{title}</h1>
      <p className="mt-3 max-w-4xl text-sm leading-relaxed text-kelly-muted">{description}</p>
      {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
    </header>
  );
}

export function V3BackLinks() {
  return (
    <>
      <Link href="/admin/intelligence" className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy">
        ← Start here
      </Link>
      <Link
        href="/admin/intelligence/kim-hammer/debate-prep"
        className="rounded-full bg-kelly-navy px-3 py-1 text-xs font-bold text-white"
      >
        Debate prep
      </Link>
    </>
  );
}
