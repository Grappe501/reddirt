"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function IntelligenceSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[intelligence-section]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-rose-200 bg-rose-50 p-6 text-kelly-text">
      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-900">Something went wrong</p>
      <h1 className="mt-2 font-heading text-xl font-bold text-kelly-navy">This intelligence page could not load</h1>
      <p className="mt-3 text-sm text-kelly-muted">
        Your data may still be fine — try the hub or debate prep, or reload this page. If this keeps happening, staff
        can check Netlify logs after deploy.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white"
        >
          Try again
        </button>
        <Link
          href="/admin/intelligence"
          className="rounded-full border border-kelly-navy/30 px-4 py-2 text-xs font-bold text-kelly-navy"
        >
          Back to start here
        </Link>
        <Link
          href="/admin/intelligence/kim-hammer/debate-prep"
          className="rounded-full border border-kelly-navy/30 px-4 py-2 text-xs font-bold text-kelly-navy"
        >
          Debate prep
        </Link>
      </div>
    </div>
  );
}
