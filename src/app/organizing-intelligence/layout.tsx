import type { ReactNode } from "react";
import { AskKellyLayout } from "@/components/campaign-guide/AskKellyLayout";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicLayoutMain } from "@/components/layout/PublicLayoutMain";

/** Public shell: same as county briefings (full site header/footer). */
export default function OrganizingIntelligenceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-btn focus:bg-kelly-gold focus:px-4 focus:py-3 focus:text-kelly-navy focus:shadow-lg"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <div aria-hidden className="pointer-events-none shrink-0 [height:var(--site-header-shim)]" />
      <main id="main-content" className="flex-1 scroll-mt-0">
        <PublicLayoutMain>{children}</PublicLayoutMain>
      </main>
      <SiteFooter />
      <AskKellyLayout />
    </>
  );
}
