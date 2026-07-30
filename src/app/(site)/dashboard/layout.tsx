import type { Metadata } from "next";

/**
 * Organizing dashboards under (site) chrome are not public marketing.
 * Soft-gate: noindex; index `/dashboard` already redirects to `/about`.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SiteDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
