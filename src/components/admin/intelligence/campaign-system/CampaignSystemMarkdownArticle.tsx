import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import {
  CAMPAIGN_SYSTEM_MANUAL_HUB_HREF,
  campaignSystemDocHref,
} from "@/lib/campaign-strategy/campaign-system-nav-shared";

type CampaignSystemMarkdownArticleProps = {
  pathKey: string;
  markdown: string;
  sourceFile: string;
};

function resolveInternalHref(href: string | undefined, currentPathKey: string): string | null {
  if (!href || href.startsWith("http") || href.startsWith("mailto:")) return null;
  const [pathPart, hash] = href.split("#");
  if (!pathPart.endsWith(".md")) return null;

  const currentDir = currentPathKey.includes("/")
    ? currentPathKey.split("/").slice(0, -1).join("/")
    : "";

  let rel = pathPart.replace(/^\.\//, "");
  if (rel.startsWith("../")) {
    const parts = currentDir.split("/").filter(Boolean);
    while (rel.startsWith("../")) {
      rel = rel.slice(3);
      parts.pop();
    }
    rel = [...parts, rel].join("/");
  } else if (!rel.includes("/") && currentDir) {
    rel = `${currentDir}/${rel}`;
  }

  const pathKey = rel.replace(/\.md$/i, "");
  const url = campaignSystemDocHref(pathKey);
  return hash ? `${url}#${hash}` : url;
}

export function CampaignSystemMarkdownArticle({
  pathKey,
  markdown,
  sourceFile,
}: CampaignSystemMarkdownArticleProps) {
  return (
    <article>
      <nav className="mb-6 text-xs text-kelly-muted">
        <Link href={CAMPAIGN_SYSTEM_MANUAL_HUB_HREF} className="font-semibold text-kelly-navy hover:underline">
          Campaign system hub
        </Link>
        <span className="mx-1">/</span>
        <span>{pathKey}</span>
      </nav>

      <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11px] text-amber-950">
        Internal staff manual · source{" "}
        <code className="rounded bg-white/80 px-1">campaign-system-manual/{sourceFile}</code> · not candidate-safe
        unless explicitly marked
      </p>

      <div className="prose prose-sm max-w-none prose-headings:font-heading prose-headings:text-kelly-navy prose-a:text-kelly-blue">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={{
            a: ({ href, children }) => {
              const internal = resolveInternalHref(href, pathKey);
              if (internal) {
                return (
                  <Link href={internal} className="font-medium text-kelly-blue underline">
                    {children}
                  </Link>
                );
              }
              if (href?.startsWith("http")) {
                return (
                  <a href={href} className="font-medium text-kelly-blue underline" target="_blank" rel="noreferrer">
                    {children}
                  </a>
                );
              }
              return <span>{children}</span>;
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </article>
  );
}
