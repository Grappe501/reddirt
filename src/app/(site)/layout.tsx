import type { ReactNode } from "react";
import { AskKellyLayout } from "@/components/campaign-guide/AskKellyLayout";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicLayoutMain } from "@/components/layout/PublicLayoutMain";

/**
 * Public marketing site — header, footer. Isolated from `/admin` so campaign manager
 * pages are not wrapped in sticky public nav (which broke layout, clicks, and type rhythm).
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-btn focus-visible:bg-kelly-gold focus-visible:px-4 focus-visible:py-3 focus-visible:text-kelly-navy focus-visible:shadow-lg"
      >
        Skip to main content
      </a>
      <SiteHeader />
      {/**
       * In-flow height reserved for the fixed header. A fixed flex child does not consume track
       * space; without this shim, `main` starts at y=0 and the first section still reads as
       * sitting under the navigation bar.
       */}
      <div
        aria-hidden
        className="pointer-events-none shrink-0 [height:var(--site-header-shim)]"
      />
      <main id="main-content" className="flex-1 scroll-mt-0">
        <PublicLayoutMain>{children}</PublicLayoutMain>
      </main>
      <SiteFooter />
      <AskKellyLayout />
    </>
  );
}
