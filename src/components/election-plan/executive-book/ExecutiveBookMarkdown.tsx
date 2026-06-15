import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

type Props = {
  markdown: string;
};

/** Map legacy doc paths in chapter markdown to in-app election plan routes. */
function rewriteElectionPlanHref(href: string): string | null {
  if (href.startsWith("/election-plan")) return href;
  const lower = href.toLowerCase();
  if (lower.includes("big-table-democrat-doctrine")) return "/election-plan/big-table-doctrine";
  if (lower.includes("candidate-version")) return "/election-plan/how-we-win/candidate-version";
  return null;
}

export function ExecutiveBookMarkdown({ markdown }: Props) {
  return (
    <div className="ep-chapter-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: ({ href, children }) => {
            const resolved = href ? rewriteElectionPlanHref(href) : null;
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
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
