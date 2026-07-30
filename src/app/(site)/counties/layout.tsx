import type { Metadata } from "next";

/**
 * County command / OS surfaces are not marketing nav.
 * Soft-gate: keep reachable for field deep links, but do not index for casual web search.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CountiesSegmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
