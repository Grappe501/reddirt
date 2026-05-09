"use client";

import Link from "next/link";

export default function CampaignStrategyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      className="max-w-[40rem] rounded-xl border border-red-200 bg-red-50/90 px-5 py-6 text-kelly-deep"
    >
      <h2 className="font-heading text-lg font-bold">This strategy page hit an error</h2>
      <p className="mt-2 font-body text-sm leading-relaxed text-kelly-slate">
        Try again, or return to the strategy hub. If this persists after deploy, note the message below for
        engineering.
      </p>
      <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-white/80 p-3 font-mono text-xs text-red-900/90">
        {error.message}
      </pre>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-kelly-deep px-4 py-2 font-body text-sm font-semibold text-white hover:bg-kelly-deep/90"
        >
          Try again
        </button>
        <Link
          href="/admin/campaign-strategy"
          className="rounded-lg border border-kelly-text/20 px-4 py-2 font-body text-sm font-semibold hover:bg-white"
        >
          Strategy home
        </Link>
      </div>
    </div>
  );
}
