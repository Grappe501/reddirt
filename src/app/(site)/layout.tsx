import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicLayoutMain } from "@/components/layout/PublicLayoutMain";

/**
 * Public marketing site — header, road band, footer. Isolated from `/admin` so campaign manager
 * pages are not wrapped in sticky public nav (which broke layout, clicks, and type rhythm).
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-btn focus:bg-red-dirt focus:px-4 focus:py-3 focus:text-cream-canvas focus:shadow-lg"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <PublicLayoutMain>{children}</PublicLayoutMain>
      </main>
      <SiteFooter />
    </>
  );
}
