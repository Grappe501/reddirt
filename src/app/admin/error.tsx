"use client";

import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-kelly-text px-4 py-16 text-kelly-page">
      <div className="w-full max-w-md rounded-card border border-kelly-page/15 bg-kelly-page/[0.07] p-8 text-center shadow-2xl">
        <h1 className="font-heading text-xl font-bold">Admin could not load</h1>
        <p className="mt-3 font-body text-sm text-kelly-inverse-soft">
          Try the login page directly. If this keeps happening after a fresh deploy, check Netlify env{" "}
          <code className="rounded bg-kelly-text/40 px-1">ADMIN_SECRET</code>.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-[10px] text-kelly-inverse-muted">Ref: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/admin/login"
            className="rounded-btn bg-kelly-gold px-4 py-3 font-body text-sm font-bold text-kelly-navy"
          >
            Go to admin login
          </Link>
          <Link
            href="/admin/intelligence"
            className="rounded-btn border border-kelly-page/25 px-4 py-3 font-body text-sm font-semibold"
          >
            Try intelligence hub
          </Link>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-btn border border-kelly-page/25 px-4 py-2 font-body text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
