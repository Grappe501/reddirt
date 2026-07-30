import { ContentContainer } from "@/components/layout/ContentContainer";
import { CampaignVideoFeature } from "@/components/media/CampaignVideoFeature";
import { getHomepagePrimaryMessageVideo } from "@/content/media/homepage-campaign-videos";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const copy = trustFunnelHomeCopy.primaryMessage;

/** Featured campaign statement — hear Kelly directly after Government That Works. */
export function TrustFunnelPrimaryMessageSection() {
  const media = getHomepagePrimaryMessageVideo();
  if (!media) return null;

  return (
    <section
      id="primary-message"
      className="border-t border-kelly-ink/10 bg-kelly-wash/40 py-section-y lg:py-section-y-lg"
      aria-labelledby="primary-message-heading"
    >
      <ContentContainer>
        <ScrollReveal yOffset={10}>
          <CampaignVideoFeature
            media={media}
            eyebrow={copy.eyebrow}
            introduction={copy.introduction}
            headingId="primary-message-heading"
          />
        </ScrollReveal>
      </ContentContainer>
    </section>
  );
}
