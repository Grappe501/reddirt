import { ContentContainer } from "@/components/layout/ContentContainer";
import { OfficeAreaCards } from "./OfficeAreaCards";

/**
 * Introduces the four responsibility areas and links to Layer 1 only.
 */
export function OfficeUnderstandGateway() {
  return (
    <ContentContainer wide>
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-kelly-gold">The Office</p>
        <h2 id="office-three-layer-gateway" className="mt-3 text-pretty font-heading text-3xl font-bold text-kelly-navy md:text-[2.1rem]">
          Four areas, one path: clarity, then stakes, then the full picture
        </h2>
        <p className="mt-5 font-body text-lg leading-relaxed text-kelly-text/85">
          Elections, business &amp; filings, transparency &amp; records, and Capitol stewardship—each starts with a
          calm overview (Layer 1). From there you choose how far to go: why it matters in real life, then how Kelly’s
          leadership fits the work. Same tone everywhere: plain language, non-partisan administration, People over
          Politics.
        </p>
      </div>
      <div className="mt-12 md:mt-14">
        <OfficeAreaCards />
      </div>
    </ContentContainer>
  );
}
