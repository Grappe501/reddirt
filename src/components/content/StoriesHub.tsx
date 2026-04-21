"use client";

import { useMemo, useState } from "react";
import type { StoryCategory, StoryEntry } from "@/content/stories";
import { storyCategoryFilters } from "@/content/stories";
import { StoryCard } from "@/components/blocks/StoryCard";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

type StoriesHubProps = {
  stories: StoryEntry[];
  featured: StoryEntry[];
};

export function StoriesHub({ stories, featured }: StoriesHubProps) {
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

  const shown = gridSource.slice(0, visible);
  const hasMore = gridSource.length > shown.length;

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
                "rounded-full border px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-dirt",
                active
                  ? "border-red-dirt/40 bg-red-dirt/12 text-deep-soil"
                  : "border-deep-soil/15 bg-deep-soil/[0.04] text-deep-soil/75 hover:border-red-dirt/25",
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

      {category === "all" && featured.length ? (
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-deep-soil">Featured</h2>
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

      {filtered.length === 0 ? (
        <p className="rounded-card border border-dashed border-deep-soil/25 p-10 text-center font-body text-deep-soil/75" role="status">
          No stories in this category yet. Try another filter—or{" "}
          <a className="font-semibold text-red-dirt underline" href="#share">
            share yours
          </a>
          .
        </p>
      ) : (
        <>
          {category === "all" ? (
            <h2 className="font-heading text-xl font-bold text-deep-soil">More voices</h2>
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
                className="rounded-btn border-2 border-deep-soil/20 bg-transparent px-6 py-3 font-body text-sm font-semibold text-deep-soil hover:bg-deep-soil/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-dirt"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Load more
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
