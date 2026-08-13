import type { Metadata } from "next";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { MeetKellySubnav } from "@/components/about/MeetKellySubnav";
import { professionalExperienceCopy } from "@/content/about/professional-experience";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const c = professionalExperienceCopy;

export const metadata: Metadata = pageMeta({
  title: "Professional experience",
  description:
    "Public-facing professional experience for Kelly Grappe: operations leadership, Learning & Development, small business, and civic organizing.",
  path: "/about/experience",
});

export default function ProfessionalExperiencePage() {
  return (
    <>
      <MediaPageHero
        slotKey="about.experience"
        layout="split"
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        subtitle={c.hero.subtitle}
      >
        <Button href="/about" variant="outlineOnDark">
          Meet Kelly
        </Button>
        <Button href="/priorities" variant="outlineOnDark">
          See My Plan
        </Button>
      </MediaPageHero>

      <FullBleedSection variant="subtle" className="!py-6">
        <ContentContainer className="max-w-3xl">
          <MeetKellySubnav current="/about/experience" />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <p className="rounded-card border border-kelly-ink/10 bg-kelly-wash/60 px-5 py-4 font-body text-sm leading-relaxed text-kelly-slate">
            {c.disclaimer}
          </p>
          <div className="mt-10 space-y-8">
            {c.roles.map((role) => (
              <article key={role.title} className="rounded-card border border-kelly-ink/10 bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-kelly-navy">{role.title}</h2>
                <p className="mt-1 font-body text-sm font-semibold text-kelly-gold">{role.org}</p>
                <p className="mt-3 font-body text-base leading-relaxed text-kelly-slate">{role.body}</p>
              </article>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-kelly-ink">{c.relevance.title}</h2>
          {c.relevance.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="mt-4 font-body text-base leading-relaxed text-kelly-slate">
              {p}
            </p>
          ))}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={c.linkedInHref} variant="outline">
              Public LinkedIn record
            </Button>
            <Button href="/about/why-im-running" variant="primary">
              Why I’m running
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
