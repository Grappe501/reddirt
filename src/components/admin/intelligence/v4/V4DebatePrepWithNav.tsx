"use client";

import { useEffect, useState } from "react";
import type { V3DebatePrepSection } from "@/lib/intelligence/v3/debateIntelligenceV3Types";
export function V4DebatePrepWithNav({ sections }: { sections: V3DebatePrepSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(`v4-prep-${s.id}`))
      .filter(Boolean) as HTMLElement[];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id.replace("v4-prep-", ""));
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <nav className="lg:sticky lg:top-4 lg:h-fit lg:w-56 shrink-0">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">
          {sections.length} sections
        </p>
        <ul className="max-h-[70vh] space-y-1 overflow-y-auto rounded-xl border border-kelly-text/10 bg-white p-2 text-[10px]">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#v4-prep-${section.id}`}
                className={`block rounded px-2 py-1.5 font-semibold leading-snug ${
                  activeId === section.id ? "bg-violet-100 text-violet-950" : "text-kelly-muted hover:bg-kelly-page"
                }`}
              >
                {section.title.replace(/^\d+\)\s*/, "")}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">
        <div className="space-y-4">
          {sections.map((section) => (
            <section key={section.id} id={`v4-prep-${section.id}`} className="scroll-mt-24 rounded-xl border border-kelly-text/10 bg-white p-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{section.title}</h2>
              {section.paragraphs.length > 0 ? (
                <div className="mt-2 space-y-2 text-xs leading-relaxed text-kelly-muted">
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                </div>
              ) : null}
              {section.bullets.length > 0 ? (
                <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
                  {section.bullets.map((bullet) => (
                    <li key={bullet.slice(0, 64)}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
