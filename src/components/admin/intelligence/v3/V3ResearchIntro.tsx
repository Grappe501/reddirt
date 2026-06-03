import { V3MarkdownSectionList } from "@/components/admin/intelligence/v3/V3SectionStack";
import type { V3MarkdownSection } from "@/lib/intelligence/v3/markdownSections";

export function V3ResearchIntro({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: V3MarkdownSection[];
}) {
  return (
    <section className="mb-6 rounded-xl border border-violet-200/40 bg-violet-50/25 p-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-violet-950">{title}</h2>
      <p className="mt-1 text-xs text-violet-900/90">{description}</p>
      <div className="mt-4">
        <V3MarkdownSectionList sections={sections} />
      </div>
    </section>
  );
}
