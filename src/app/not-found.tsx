import Link from "next/link";

/**
 * Fallback when `notFound()` is rendered outside the public `(site)` tree (e.g. some admin paths).
 * Public marketing 404 uses `(site)/not-found.tsx` with full chrome.
 */
export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-6 font-body text-kelly-text">
      <p className="text-xs font-bold uppercase tracking-wider text-kelly-navy">404</p>
      <h1 className="mt-3 text-2xl font-bold [font-family:var(--font-body),system-ui,sans-serif]">Page not found</h1>
      <Link href="/" className="mt-6 text-sm font-semibold text-kelly-blue underline underline-offset-2 hover:text-kelly-navy">
        Back to the site
      </Link>
      <Link
        href="/admin/login"
        className="mt-3 text-sm text-kelly-text/75 underline-offset-2 hover:text-kelly-text hover:underline"
      >
        Admin login
      </Link>
    </div>
  );
}
