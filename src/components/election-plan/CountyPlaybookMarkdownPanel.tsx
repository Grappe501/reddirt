import { ExecutiveBookMarkdown } from "@/components/election-plan/executive-book/ExecutiveBookMarkdown";

type Props = {
  countyName: string;
  markdown: string;
};

/** Level 2 county strategy prose — generated Chapter 9 playbook (missions, electoral math, field targets). */
export function CountyPlaybookMarkdownPanel({ countyName, markdown }: Props) {
  return (
    <section id="playbook" className="mb-8 scroll-mt-24">
      <div className="ep-card ep-chapter-article">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--ep-gold)]">
          County campaign playbook · {countyName}
        </p>
        <ExecutiveBookMarkdown markdown={markdown} />
      </div>
    </section>
  );
}
