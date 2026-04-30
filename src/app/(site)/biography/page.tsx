import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { BIOGRAPHY_CHAPTERS } from "@/content/biography/biography-config";
import { biographyReadingIntro } from "@/content/biography/biography-reading-experience";
import { pageMeta } from "@/lib/seo/metadata";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { BiographyReaderProgress } from "@/components/biography/BiographyReaderProgress";
import { BiographyEarnedAskSection } from "@/components/biography/BiographyEarnedAskSection";
import { BiographyChapterToc } from "@/components/biography/BiographyChapterToc";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "The Road That Brought Her Here — Kelly Grappe",
  description:
    "Immersive biography: Kelly’s chapters from Arkansas roots through leadership, family, and public service—read at your own pace.",
  path: "/biography",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

async function loadChapterBody(filename: string): Promise<string | null> {
  try {
    const full = path.join(process.cwd(), "src", "content", "biography", "chapters", filename);
    const md = await fs.readFile(full, "utf8");
    return md.replace(/^#\s+.+\n+/, "").trim();
  } catch {
    return null;
  }
}

const beginBtnClass = cn(
  "inline-flex min-h-12 items-center justify-center rounded-btn bg-kelly-navy px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-md",
  "transition duration-300 ease-out hover:bg-kelly-blue hover:shadow-lg motion-safe:hover:-translate-y-0.5",
  "focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/45",
);

export default async function BiographyPage() {
  const loaded = await Promise.all(
    BIOGRAPHY_CHAPTERS.map(async (c) => ({
      ...c,
      body: await loadChapterBody(c.filename),
    })),
  );

  const pillarIdForChapterOrder = (order: number): string | null => {
    if (order === 1) return "pillar-formation";
    if (order === 4) return "pillar-scale-and-home";
    if (order === 7) return "pillar-civic-ground";
    if (order === 8) return "pillar-office-and-road";
    return null;
  };

  const tocItems = loaded.map((c) => ({ id: `bio-chapter-${c.slug}`, label: c.title }));
  const firstAnchor = tocItems[0]?.id ?? "bio-chapter-the-road-that-brought-her-here";

  return (
    <>
      <BiographyReaderProgress />
      <div className="min-h-screen bg-kelly-page">
        <header className="border-b border-kelly-text/10 bg-gradient-to-b from-kelly-wash via-kelly-page to-kelly-page pb-14 pt-24 sm:pb-16 sm:pt-28 md:pt-32">
          <ContentContainer className="max-w-2xl text-center md:max-w-[40rem]">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-text/55">Reading</p>
            <h1 className="mt-4 font-heading text-[clamp(1.75rem,5vw,2.75rem)] font-bold leading-tight text-kelly-ink">
              {biographyReadingIntro.title}
            </h1>
            <p className="mt-6 font-body text-base leading-relaxed text-kelly-slate sm:text-lg">
              {biographyReadingIntro.intro}
            </p>
            <a href={`#${firstAnchor}`} className={cn(beginBtnClass, "mt-10")}>
              {biographyReadingIntro.beginCta}
            </a>
          </ContentContainer>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-[var(--gutter-x)] py-10 sm:py-12 md:py-14 lg:flex-row lg:gap-10 lg:py-16 xl:gap-12">
          <BiographyChapterToc items={tocItems} className="hidden lg:block" />

          <main className="min-w-0 flex-1" id="biography-main">
            <nav aria-label="Chapters" className="mb-10 rounded-card border border-kelly-text/10 bg-kelly-fog/50 p-4 sm:p-5 lg:hidden">
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">Chapters</p>
              <ol className="mt-3 grid list-decimal gap-2 pl-5 font-body text-sm text-kelly-text/85 sm:gap-2.5">
                {tocItems.map((it) => (
                  <li key={it.id} className="pl-1">
                    <a href={`#${it.id}`} className="inline-flex min-h-11 items-center text-kelly-navy underline-offset-2 hover:underline">
                      {it.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {loaded.map((c, i) => {
              const next = i < loaded.length - 1 ? loaded[i + 1] : null;
              const kind = c.slug === "epilogue" ? "Closing" : `Chapter ${c.order}`;
              const pillarAnchor = pillarIdForChapterOrder(c.order);
              return (
                <div key={c.slug}>
                  {pillarAnchor ? (
                    <div id={pillarAnchor} className="scroll-mt-[6.5rem]" aria-hidden />
                  ) : null}
                  <section
                  id={`bio-chapter-${c.slug}`}
                  data-bio-chapter
                  className={cn(
                    "scroll-mt-28 border-b border-kelly-text/10",
                    c.slug === "epilogue"
                      ? "mb-0 pb-16 md:pb-24"
                      : "mb-14 pb-14 md:mb-20 md:pb-20",
                  )}
                >
                  <p className="font-body text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-text/50">{kind}</p>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-navy md:text-3xl">{c.title}</h2>
                  {c.body === null ? (
                    <div className="mt-8 rounded-md border border-amber-700/30 bg-amber-50/80 p-4 font-mono text-sm text-amber-950">
                      {/* TODO: restore chapter source when file is available */}
                      Missing chapter file: <code className="font-semibold">{c.filename}</code>
                    </div>
                  ) : (
                    <article className="biography-chapter-body mt-8 max-w-[44rem] whitespace-pre-wrap font-body text-[1.02rem] leading-[1.72] text-kelly-text/90 sm:text-[1.05rem] sm:leading-[1.75] md:leading-[1.78]">
                      {c.body}
                    </article>
                  )}
                  {next ? (
                    <p className="mt-12 sm:mt-14">
                      <Link
                        href={`#bio-chapter-${next.slug}`}
                        className="inline-flex min-h-11 items-center font-body text-sm font-semibold text-kelly-blue underline decoration-kelly-blue/30 underline-offset-4 transition hover:decoration-kelly-blue"
                      >
                        Continue — {next.title}
                      </Link>
                    </p>
                  ) : null}
                </section>
                </div>
              );
            })}
          </main>
        </div>

        <BiographyEarnedAskSection />

        <footer className="border-t border-kelly-text/10 bg-kelly-wash py-10 text-center">
          <ContentContainer>
            <Link
              href="/about"
              className="font-body text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline"
            >
              ← Meet Kelly overview
            </Link>
          </ContentContainer>
        </footer>
      </div>
    </>
  );
}
