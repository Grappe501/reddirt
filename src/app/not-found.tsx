import Link from "next/link";

/**
 * Fallback when `notFound()` is rendered outside the public `(site)` tree (e.g. some admin paths).
 * Public marketing 404 uses `(site)/not-found.tsx` with full chrome.
 */
export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f2ebe2] px-6 font-body text-deep-soil">
      <p className="text-xs font-bold uppercase tracking-wider text-red-dirt">404</p>
      <h1 className="mt-3 text-2xl font-bold [font-family:var(--font-body),system-ui,sans-serif]">Page not found</h1>
      <Link href="/" className="mt-6 text-sm font-semibold text-civic-blue underline underline-offset-2 hover:text-civic-midnight">
        Back to the site
      </Link>
      <Link
        href="/admin/login"
        className="mt-3 text-sm text-deep-soil/75 underline-offset-2 hover:text-deep-soil hover:underline"
      >
        Admin login
      </Link>
    </div>
  );
}
