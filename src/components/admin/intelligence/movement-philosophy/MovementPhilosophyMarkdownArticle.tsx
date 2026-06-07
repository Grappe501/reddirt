import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import {
  MOVEMENT_PHILOSOPHY_HUB_HREF,
  movementPhilosophyDocHref,
  findMovementPhilosophyEntry,
} from "@/lib/philosophy/movement-philosophy-nav";

type MovementPhilosophyMarkdownArticleProps = {
  pathKey: string;
  markdown: string;
  sourceFile: string;
};

function resolveInternalHref(href: string | undefined, currentPathKey: string): string | null {
  if (!href || href.startsWith("http") || href.startsWith("mailto:")) return null;
  const [pathPart, hash] = href.split("#");
  if (!pathPart.endsWith(".md")) return null;

  let rel = pathPart.replace(/^\.\//, "");
  if (rel.startsWith("philosophy/")) {
    rel = rel.replace(/^philosophy\//, "");
  }
  if (rel.startsWith("../philosophy/")) {
    rel = rel.replace(/^\.\.\/philosophy\//, "");
  }

  const baseName = rel.replace(/\.md$/i, "");
  const entry = findMovementPhilosophyEntry(baseName === "README" ? "README" : baseName);
  if (!entry && baseName !== "README") {
    const alt = findMovementPhilosophyEntry(baseName.split("/").pop() ?? baseName);
    if (!alt) return null;
    const url = movementPhilosophyDocHref(alt.pathKey);
    return hash ? `${url}#${hash}` : url;
  }
  const key = entry?.pathKey ?? (baseName === "README" ? "README" : currentPathKey);
  const url = movementPhilosophyDocHref(key);
  return hash ? `${url}#${hash}` : url;
}

export function MovementPhilosophyMarkdownArticle({
  pathKey,
  markdown,
  sourceFile,
}: MovementPhilosophyMarkdownArticleProps) {
  const entry = findMovementPhilosophyEntry(pathKey);

  return (
    <article>
      <nav className="mb-6 text-xs text-kelly-muted">
        <Link href={MOVEMENT_PHILOSOPHY_HUB_HREF} className="font-semibold text-kelly-navy hover:underline">
          Movement philosophy hub
        </Link>
        <span className="mx-1">/</span>
        <span>{entry?.label ?? pathKey}</span>
      </nav>

      <p className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-[11px] text-indigo-950">
        Public movement philosophy · source <code className="rounded bg-white/80 px-1">{sourceFile}</code> · candidate-safe
        tone anchor — verify claims before stage use
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
