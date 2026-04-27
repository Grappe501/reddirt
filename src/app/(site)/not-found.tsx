import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <FullBleedSection variant="subtle" padY className="min-h-[min(70vh,640px)] border-b border-kelly-text/10">
      <ContentContainer className="flex flex-col items-start justify-center py-16 lg:py-24">
        <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-kelly-navy">404</p>
        <h1 className="mt-4 max-w-2xl font-heading text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight text-kelly-text">
          That page isn’t here—but the campaign site is.
        </h1>
        <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-kelly-text/78">
          The URL may have moved. Try home, priorities for the office, or get involved—or use search from the header.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/" variant="primary">
            Home
          </Button>
          <Button href="/local-organizing" variant="outline">
            Local organizing
          </Button>
          <Button href="/stories" variant="subtle">
            Stories
          </Button>
        </div>
        <p className="mt-12 font-body text-sm text-kelly-text/50">{siteConfig.name}</p>
      </ContentContainer>
    </FullBleedSection>
  );
}
