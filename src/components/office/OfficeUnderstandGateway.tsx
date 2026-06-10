import { ContentContainer } from "@/components/layout/ContentContainer";
import { OfficeAreaCards } from "./OfficeAreaCards";

/**
 * Pass 2 hub — five responsibility areas, Layer 1 entry only.
 */
export function OfficeUnderstandGateway() {
  return (
    <ContentContainer wide>
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-kelly-gold">The Office</p>
        <h2 id="office-three-layer-gateway" className="mt-3 text-pretty font-heading text-3xl font-bold text-kelly-navy md:text-[2.1rem]">
          What the Secretary of State does—in plain language
        </h2>
        <p className="mt-5 font-body text-lg leading-relaxed text-kelly-text/85">
          Elections, business filings, notaries, public records, and Capitol stewardship. Each area starts with civic
          education, then why it matters to real Arkansans, then what Kelly brings—with verified credentials only.
        </p>
      </div>
      <div className="mt-12 md:mt-14">
        <OfficeAreaCards />
      </div>
    </ContentContainer>
  );
}
