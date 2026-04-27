"use client";

import { useMemo, useState } from "react";
import type { StoryCategory, StoryEntry } from "@/content/stories";
import { storyCategoryFilters } from "@/content/stories";
import { StoryCard } from "@/components/blocks/StoryCard";
import { cn } from "@/lib/utils";
import { getCampaignBlogUrl } from "@/config/external-campaign";
import type { PublicSubstackPost } from "@/lib/integrations/substack/list-public-posts";

const PAGE_SIZE = 6;

function formatNotebookDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type StoriesHubProps = {
  stories: StoryEntry[];
  featured: StoryEntry[];
  /** Live Substack / campaign notebook posts (RSS). When non-empty, replaces static “featured” rail. */
  substackPosts?: PublicSubstackPost[];
};

export function StoriesHub({ stories, featured, substackPosts = [] }: StoriesHubProps) {
  const [category, setCategory] = useState<StoryCategory | "all">("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (category === "all") return stories;
    return stories.filter((s) => s.category === category);
  }, [stories, category]);

  const gridSource = useMemo(() => {
    if (category === "all") {
      const fs = new Set(featured.map((f) => f.slug));
      return filtered.filter((s) => !fs.has(s.slug));
    }
    return filtered;
  }, [category, filtered, featured]);

  const notebookFeatured = substackPosts.slice(0, 2);
  const notebookRest = substackPosts.slice(2);

  const shown = gridSource.slice(0, visible);
  const hasMore = gridSource.length > shown.length;

  /** On “All” with a live Substack block, the archive grid below is omitted (no duplicate “more voices” rail). */
  const hideOnSiteGridAfterSubstack = category === "all" && substackPosts.length > 0;

  return (
    <div className="space-y-10">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter stories by category"
      >
        {storyCategoryFilters.map((c) => {
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                "rounded-full border px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy",
                active
                  ? "border-kelly-navy/40 bg-kelly-navy/12 text-kelly-text"
                  : "border-kelly-text/15 bg-kelly-text/[0.04] text-kelly-text/75 hover:border-kelly-navy/25",
              )}
              onClick={() => {
                setCategory(c.id);
                setVisible(PAGE_SIZE);
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {category === "all" && substackPosts.length ? (
        <div className="space-y-4 rounded-card border border-kelly-text/15 bg-white/60 p-6 shadow-[var(--shadow-soft)] md:p-8">
          <div>
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-navy/90">Campaign notebook</p>
            <h2 className="mt-2 font-heading text-xl font-bold text-kelly-text md:text-2xl">From Kelly’s Substack</h2>
            <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/75">
              These summaries are pulled from our live RSS feed and updated automatically. Each card links to the{" "}
              <strong className="font-semibold text-kelly-text/90">full post on Substack</strong> (opens in a new tab)—not
              the on-site story pages below.
            </p>
            <p className="mt-2 font-body text-xs text-kelly-text/60">
              <a
                href={getCampaignBlogUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
              >
                Open the notebook home →
              </a>
            </p>
          </div>
          {notebookFeatured.length ? (
            <ul className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {notebookFeatured.map((p) => {
                const when = formatNotebookDate(p.publishedAtIso);
                const metaBits = [when, p.author, "Substack"].filter(Boolean);
                return (
                  <li key={p.slug}>
                    <StoryCard
                      featured
                      external
                      title={p.title}
                      excerpt={p.summary}
                      href={p.canonicalUrl}
                      meta={metaBits.join(" · ")}
                      imageSrc={p.featuredImageUrl ?? undefined}
                      imageAlt=""
                      ctaLabel="Read on Substack"
                    />
                  </li>
                );
              })}
            </ul>
          ) : null}
          {notebookRest.length ? (
            <div className="space-y-4 pt-2">
              <h3 className="font-heading text-lg font-bold text-kelly-text">More notebook posts</h3>
              <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {notebookRest.map((p) => {
                  const when = formatNotebookDate(p.publishedAtIso);
                  const metaBits = [when, p.author, "Substack"].filter(Boolean);
                  return (
                    <li key={p.slug}>
                      <StoryCard
                        external
                        title={p.title}
                        excerpt={p.summary}
                        href={p.canonicalUrl}
                        meta={metaBits.join(" · ")}
                        imageSrc={p.featuredImageUrl ?? undefined}
                        imageAlt=""
                        ctaLabel="Read on Substack"
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {category === "all" && !substackPosts.length && featured.length ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-700/25 bg-amber-50/90 px-4 py-3 font-body text-sm text-kelly-text/85">
            <strong className="font-semibold text-kelly-text">Featured from the archive.</strong> The live notebook feed
            isn&apos;t available right now—these are stories we&apos;ve published on this site.
          </div>
          <h2 className="font-heading text-xl font-bold text-kelly-text">Featured</h2>
          <ul className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {featured.map((s) => (
              <li key={s.slug}>
                <StoryCard
                  featured
                  title={s.title}
                  excerpt={s.summary}
                  href={`/stories/${s.slug}`}
                  meta={`${s.categoryLabel} · ${s.dek ?? s.category}`}
                  imageSrc={s.image.src}
                  imageAlt={s.image.alt}
                  ctaLabel="Read full story"
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!hideOnSiteGridAfterSubstack && filtered.length === 0 ? (
        <p className="rounded-card border border-dashed border-kelly-text/25 p-10 text-center font-body text-kelly-text/75" role="status">
          No stories in this category yet. Try another filter—or{" "}
          <a className="font-semibold text-kelly-navy underline" href="#share">
            share yours
          </a>
          .
        </p>
      ) : !hideOnSiteGridAfterSubstack ? (
        <>
          {category === "all" ? (
            <h2 className="font-heading text-xl font-bold text-kelly-text">More voices</h2>
          ) : null}
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((s) => (
              <li key={s.slug}>
                <StoryCard
                  title={s.title}
                  excerpt={s.summary}
                  href={`/stories/${s.slug}`}
                  meta={`${s.categoryLabel} · ${s.dek ?? s.category}`}
                  imageSrc={s.image.src}
                  imageAlt={s.image.alt}
                />
              </li>
            ))}
          </ul>
          {hasMore ? (
            <div className="flex justify-center">
              <button
                type="button"
                className="rounded-btn border-2 border-kelly-text/20 bg-transparent px-6 py-3 font-body text-sm font-semibold text-kelly-text hover:bg-kelly-text/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Load more
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
