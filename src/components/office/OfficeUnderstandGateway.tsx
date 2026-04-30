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
        <h2 id="office-three-layer-gateway" className="mt-3 font-heading text-3xl font-bold text-kelly-navy md:text-[2.1rem]">
          Four areas, explained in plain language
        </h2>
        <p className="mt-5 font-body text-lg leading-relaxed text-kelly-text/85">
          Each topic starts with a short overview. When you’re ready, you can go deeper—why it matters to real
          Arkansans, then how Kelly’s experience maps to the work. Nothing is hidden behind jargon.
        </p>
      </div>
      <div className="mt-12 md:mt-14">
        <OfficeAreaCards />
      </div>
    </ContentContainer>
  );
}
