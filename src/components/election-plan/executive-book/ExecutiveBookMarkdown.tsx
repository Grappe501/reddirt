import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { budgetDocPathToRoute } from "@/lib/election-plan/budget-documents-registry";

type Props = {
  markdown: string;
};

function resolveHref(href: string): string | null {
  if (href.startsWith("/election-plan")) return href;
  const lower = href.toLowerCase();
  if (lower.includes("big-table-democrat-doctrine")) return "/election-plan/big-table-doctrine";
  if (lower.includes("candidate-version")) return "/election-plan/how-we-win/candidate-version";
  const budgetRoute = budgetDocPathToRoute(href);
  if (budgetRoute) return budgetRoute;
  return null;
}

function resolveBudgetDocPath(text: string): string | null {
  if (!text.includes("docs/campaign-brain/budget/") || !text.endsWith(".md")) return null;
  return budgetDocPathToRoute(text);
}

export function ExecutiveBookMarkdown({ markdown }: Props) {
  return (
    <div className="ep-chapter-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: ({ href, children }) => {
            const resolved = href ? resolveHref(href) : null;
            if (resolved) {
              return (
                <Link href={resolved} className="text-[var(--ep-navy)] underline hover:text-[var(--ep-gold)]">
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} className="text-[var(--ep-navy)] underline hover:text-[var(--ep-gold)]">
                {children}
              </a>
            );
          },
          code: ({ children }) => {
            const text = String(children).trim();
            const route = resolveBudgetDocPath(text);
            if (route) {
              const label = text.split("/").pop() ?? text;
              return (
                <Link href={route} className="font-mono text-sm text-[var(--ep-navy)] underline hover:text-[var(--ep-gold)]">
                  {label}
                </Link>
              );
            }
            return <code>{children}</code>;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
