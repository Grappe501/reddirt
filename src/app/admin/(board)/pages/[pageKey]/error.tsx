"use client";

export default function AdminPageKeyError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div
      className="mx-auto max-w-xl rounded-lg border border-red-200/80 bg-red-50/95 px-4 py-4"
      role="alert"
    >
      <p className="font-body text-sm font-medium text-red-900">We couldn&apos;t load this page. Try refreshing.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-3 rounded-md border border-kelly-text/20 bg-white px-3 py-1.5 text-xs font-semibold text-kelly-navy hover:bg-kelly-fog"
      >
        Try again
      </button>
    </div>
  );
}
