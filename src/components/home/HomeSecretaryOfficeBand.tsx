import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { HomeSplitSection } from "@/components/home/sections/HomeSplitSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import type { MergedHomepageConfig } from "@/lib/content/homepage-merge";

type Props = Pick<MergedHomepageConfig, "splitDemocracy" | "splitLabor">;

export function HomeSecretaryOfficeBand({ splitDemocracy, splitLabor }: Props) {
  return (
    <div className="border-y border-kelly-ink/10 bg-kelly-mist/35">
      <ContentContainer className="py-12 lg:py-16">
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">The office</p>
          <h2 className="mt-4 font-heading text-[clamp(1.75rem,3.8vw,2.65rem)] font-bold tracking-tight text-kelly-ink">
            What the Secretary of State&apos;s office should be
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-kelly-slate md:text-xl">
            Fair elections and honest administration come down to predictable rules, plain-language help, and respect for every county.
            Here are two parts of the job Kelly is focused on.
          </p>
        </FadeInWhenVisible>
      </ContentContainer>
      <HomeSplitSection variant="democracy" copy={splitDemocracy} />
      <HomeSplitSection variant="labor" copy={splitLabor} />
    </div>
  );
}
