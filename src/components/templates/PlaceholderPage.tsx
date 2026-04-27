import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";

type PlaceholderPageProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  sections?: number;
};

export function PlaceholderPage({
  title,
  subtitle,
  eyebrow,
  sections = 2,
}: PlaceholderPageProps) {
  return (
    <>
      <PageHero title={title} subtitle={subtitle} eyebrow={eyebrow} />
      {Array.from({ length: sections }).map((_, i) => (
        <FullBleedSection key={i} variant={i % 2 === 0 ? "default" : "subtle"}>
          <ContentContainer>
            <SectionHeading
              eyebrow="Placeholder"
              title={`Section ${i + 1}`}
              subtitle="Layout shell only — replace with real content, media, and CTAs."
            />
            <div className="mt-10">
              <ResponsiveGrid cols="3">
                {[1, 2, 3].map((k) => (
                  <div
                    key={k}
                    className="min-h-[160px] rounded-card border border-dashed border-kelly-text/25 bg-kelly-text/[0.02] p-6"
                  >
                    <p className="font-body text-sm text-kelly-text/50">Content block {k}</p>
                  </div>
                ))}
              </ResponsiveGrid>
            </div>
          </ContentContainer>
        </FullBleedSection>
      ))}
    </>
  );
}
