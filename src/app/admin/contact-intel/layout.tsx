import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/require-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ContactIntelLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6">
      <header className="mb-6 border-b border-kelly-text/15 pb-4">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-muted">
          RedDirt · standalone
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-kelly-navy">Contact Intelligence</h1>
            <p className="mt-1 max-w-2xl font-body text-sm text-kelly-text/80">
              One library for every email and phone you ingest. Original rows stay attached. Nothing is sent.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            <Link className="rounded border border-kelly-text/20 bg-white px-3 py-1.5 text-kelly-navy" href="/admin/contact-intel">
              Library
            </Link>
            <Link
              className="rounded border border-kelly-forest/40 bg-kelly-fog/80 px-3 py-1.5 text-kelly-navy"
              href="/admin/contact-intel/import"
            >
              Import
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
