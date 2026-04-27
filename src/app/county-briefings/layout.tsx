import type { ReactNode } from "react";
import { AskKellyLayout } from "@/components/campaign-guide/AskKellyLayout";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicLayoutMain } from "@/components/layout/PublicLayoutMain";

/** Same chrome as (site) — county briefings live outside the (site) group for route history. */
export default function CountyBriefingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-btn focus:bg-kelly-gold focus:px-4 focus:py-3 focus:text-kelly-navy focus:shadow-lg"
      >
        Skip to main content
      </a>
      <SiteHeader />
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
