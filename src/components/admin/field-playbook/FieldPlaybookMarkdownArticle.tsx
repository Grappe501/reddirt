import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { getFieldPlaybookFileToPathMap } from "@/lib/field-playbook/md-manifest";
import { extractStrategyOutline } from "@/lib/campaign-strategy/strategy-outline";
import { StrategyOnThisPage } from "@/components/admin/campaign-strategy/StrategyOnThisPage";
import { buildFieldPlaybookMarkdownComponents } from "@/components/field-playbook/field-playbook-markdown-shared";
import { FieldPlaybookBreadcrumb } from "./FieldPlaybookBreadcrumb";
import { FieldPlaybookReaderToolbar } from "./FieldPlaybookReaderToolbar";

export function FieldPlaybookMarkdownArticle({
  pathKey,
  markdown,
  sourceFile,
}: {
  pathKey: string;
  markdown: string;
  sourceFile: string;
}) {
  const fileToPath = getFieldPlaybookFileToPathMap();
  const outline = extractStrategyOutline(markdown);
  const components = buildFieldPlaybookMarkdownComponents(fileToPath, "/admin/field-playbook");

  return (
    <>
      <a
        href="#field-playbook-main"
        className="sr-only font-body font-semibold text-kelly-blue focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg print:hidden"
      >
        Skip to chapter content
      </a>
      <div className="flex flex-col-reverse gap-6 lg:flex-row lg:items-start lg:gap-10 lg:justify-between">
        <div id="field-playbook-main" className="min-w-0 flex-1 print:max-w-none">
          <article className="max-w-[40rem] pb-16 md:pb-24 print:max-w-none">
            <FieldPlaybookBreadcrumb pathKey={pathKey} />
            <div className="rounded-lg border border-kelly-text/15 bg-kelly-fog/50 px-3 py-2 font-body text-[11px] leading-snug text-kelly-deep print:border-kelly-text/20 print:bg-transparent">
              <strong className="font-semibold">Internal —</strong> field organizing playbook. Assign access with HQ;
              do not post raw volunteer lists or PII into shared channels.
            </div>
            <FieldPlaybookReaderToolbar />
            <p className="mt-4 font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-gold">
              Field playbook · {sourceFile}
            </p>
            <div className="strategy-md-prose mt-6 font-body text-[17px] leading-[1.65] text-kelly-slate md:text-base md:leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={components}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </article>
        </div>
        <StrategyOnThisPage outline={outline} />
      </div>
    </>
  );
}
