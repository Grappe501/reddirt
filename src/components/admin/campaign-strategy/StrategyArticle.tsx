import type { StrategyDoc } from "@/lib/campaign-strategy/types";
import { StrategyBreadcrumb } from "./StrategyBreadcrumb";
import { StrategyBlockRenderer } from "./StrategyBlockRenderer";
import { StrategyReaderToolbar } from "./StrategyReaderToolbar";

export function StrategyArticle({ doc, pathKey }: { doc: StrategyDoc; pathKey: string }) {
  return (
    <article className="max-w-[40rem] pb-16 md:pb-24">
      <StrategyBreadcrumb pathKey={pathKey} />
      <div className="rounded-lg border border-kelly-gold/25 bg-kelly-gold/10 px-3 py-2 font-body text-[11px] leading-snug text-kelly-deep">
        <strong className="font-semibold">Internal —</strong> placeholder page; strategy manual lives in Markdown for
        other chapters.
      </div>
      <StrategyReaderToolbar pathKey={pathKey} />
      {doc.eyebrow ? (
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-gold">
          {doc.eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-kelly-deep md:text-[2rem]">
        {doc.title}
      </h2>
      {doc.subtitle ? (
        <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate">{doc.subtitle}</p>
      ) : null}
      <div className="mt-10">
        <StrategyBlockRenderer blocks={doc.blocks} />
      </div>
    </article>
  );
}
