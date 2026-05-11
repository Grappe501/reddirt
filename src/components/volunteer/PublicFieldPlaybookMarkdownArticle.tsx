import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { StrategyOnThisPage } from "@/components/admin/campaign-strategy/StrategyOnThisPage";
import { buildFieldPlaybookMarkdownComponents } from "@/components/field-playbook/field-playbook-markdown-shared";
import { getFieldPlaybookFileToPathMap } from "@/lib/field-playbook/md-manifest";
import { extractStrategyOutline } from "@/lib/campaign-strategy/strategy-outline";

import { PublicFieldPlaybookBreadcrumb } from "./PublicFieldPlaybookBreadcrumb";
import { PublicFieldPlaybookReaderToolbar } from "./PublicFieldPlaybookReaderToolbar";

const PUBLIC_BASE = "/field-playbook";

export function PublicFieldPlaybookMarkdownArticle({
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
  const components = buildFieldPlaybookMarkdownComponents(fileToPath, PUBLIC_BASE);

  return (
    <>
      <a
        href="#public-field-playbook-main"
        className="sr-only font-body font-semibold text-kelly-blue focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg print:hidden"
      >
        Skip to chapter content
      </a>
      <p className="mb-6 font-body text-sm text-kelly-text/80 print:hidden">
        <Link href="/volunteer" className="font-semibold text-kelly-navy underline underline-offset-2 hover:text-kelly-blue">
          Back to volunteer onboarding
        </Link>
      </p>
      <div className="flex flex-col-reverse gap-6 lg:flex-row lg:items-start lg:gap-10 lg:justify-between">
        <div id="public-field-playbook-main" className="min-w-0 flex-1 print:max-w-none">
          <article className="max-w-[40rem] pb-16 md:pb-24 print:max-w-none">
            <PublicFieldPlaybookBreadcrumb pathKey={pathKey} />
            <div className="rounded-lg border border-kelly-navy/15 bg-kelly-navy/[0.04] px-3 py-2 font-body text-[11px] leading-snug text-kelly-deep print:border-kelly-text/20 print:bg-transparent">
              <strong className="font-semibold">Volunteer field guide.</strong> Use campaign-approved messaging. When in doubt,
              ask HQ before sharing process or legal details.
            </div>
            <PublicFieldPlaybookReaderToolbar />
            <p className="mt-4 font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-gold">
              Field playbook · {sourceFile}
            </p>
            <div className="strategy-md-prose mt-6 font-body text-[17px] leading-[1.65] text-kelly-slate md:text-base md:leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
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
