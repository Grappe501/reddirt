"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function WorkbenchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("workbench", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="font-heading text-lg font-bold text-deep-soil">Campaign workbench</h1>
      <p className="mt-2 font-body text-sm text-red-800">Something went wrong loading this view.</p>
      <p className="mt-1 font-mono text-xs text-deep-soil/60">{error.message || "Error"}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded border border-deep-soil/20 bg-white px-2 py-1 font-body text-sm font-semibold"
        >
          Try again
        </button>
        <Link href="/admin/workbench" className="rounded border border-washed-denim/30 bg-cream-canvas px-2 py-1 font-body text-sm font-semibold text-civic-slate">
          Back to workbench
        </Link>
      </div>
    </div>
  );
}
