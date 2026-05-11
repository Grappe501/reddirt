import Link from "next/link";
import type { Components } from "react-markdown";

export const FIELD_PLAYBOOK_MD_LINK_CLASS =
  "font-medium text-kelly-blue underline decoration-kelly-blue/30 hover:decoration-kelly-blue";

function resolveMdHref(
  href: string | undefined,
  fileToPath: Map<string, string>,
  basePath: string,
): { internal: string } | { external: string } | { raw: string } | null {
  if (!href) return null;
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
    return { external: href };
  }
  const [pathPart, hash] = href.split("#");
  if (!pathPart.endsWith(".md")) {
    return { raw: href };
  }
  const base = pathPart.replace(/^\.\//, "").split("/").pop() ?? pathPart;
  const pathKey = fileToPath.get(base);
  if (pathKey === undefined) return { raw: href };
  const url = pathKey === "" ? basePath : `${basePath}/${pathKey}`;
  return { internal: hash ? `${url}#${hash}` : url };
}

export function buildFieldPlaybookMarkdownComponents(
  fileToPath: Map<string, string>,
  basePath: string,
): Components {
  return {
    h1: ({ id, children }) => (
      <h2
        id={id}
        className="mt-2 scroll-mt-28 font-heading text-3xl font-bold tracking-tight text-kelly-deep md:text-[2rem]"
      >
        {children}
      </h2>
    ),
    h2: ({ id, children }) => (
      <h3
        id={id}
        className="mt-10 scroll-mt-28 font-heading text-2xl font-bold tracking-tight text-kelly-deep first:mt-0"
      >
        {children}
      </h3>
    ),
    h3: ({ id, children }) => (
      <h4 id={id} className="mt-8 scroll-mt-28 font-heading text-xl font-bold tracking-tight text-kelly-deep">
        {children}
      </h4>
    ),
    h4: ({ id, children }) => (
      <h5 id={id} className="mt-6 scroll-mt-24 font-heading text-lg font-semibold text-kelly-deep">
        {children}
      </h5>
    ),
    h5: ({ id, children }) => (
      <h6 id={id} className="mt-5 scroll-mt-24 font-heading text-base font-semibold text-kelly-deep">
        {children}
      </h6>
    ),
    h6: ({ id, children }) => (
      <h6 id={id} className="mt-4 scroll-mt-24 font-body text-sm font-bold uppercase tracking-wide text-kelly-slate">
        {children}
      </h6>
    ),
    p: ({ children }) => <p className="mb-4 font-body text-base leading-relaxed text-kelly-slate">{children}</p>,
    ul: ({ children }) => (
      <ul className="mb-4 list-disc space-y-2 pl-6 font-body text-base leading-relaxed text-kelly-slate">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-2 pl-6 font-body text-base leading-relaxed text-kelly-slate">{children}</ol>
    ),
    li: ({ children }) => <li className="pl-1 [&>p]:mb-2">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-kelly-gold/70 pl-4 font-body text-kelly-slate/95 italic">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-kelly-text/10" />,
    strong: ({ children }) => <strong className="font-semibold text-kelly-text">{children}</strong>,
    code: ({ children, className }) =>
      className ? (
        <code className={className}>{children}</code>
      ) : (
        <code className="rounded-md bg-kelly-fog/90 px-1.5 py-0.5 font-mono text-[0.9em] text-kelly-deep">
          {children}
        </code>
      ),
    pre: ({ children }) => (
      <pre className="mb-6 overflow-x-auto rounded-xl bg-kelly-deep p-4 text-sm text-white [&_code]:bg-transparent [&_code]:p-0 print:whitespace-pre-wrap print:break-all">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-kelly-text/10 shadow-sm print:shadow-none">
        <table className="w-full border-collapse text-left font-body text-sm text-kelly-slate">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-kelly-fog/80 text-kelly-deep">{children}</thead>,
    th: ({ children }) => (
      <th className="border-b border-kelly-text/15 px-3 py-2.5 font-heading text-xs font-bold uppercase tracking-wide">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="border-b border-kelly-text/10 px-3 py-2.5 align-top">{children}</td>,
    tr: ({ children }) => <tr>{children}</tr>,
    a: ({ href, children }) => {
      const resolved = resolveMdHref(href, fileToPath, basePath);
      if (resolved && "internal" in resolved) {
        return (
          <Link href={resolved.internal} className={FIELD_PLAYBOOK_MD_LINK_CLASS}>
            {children}
          </Link>
        );
      }
      if (resolved && "external" in resolved) {
        return (
          <a href={resolved.external} className={FIELD_PLAYBOOK_MD_LINK_CLASS} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }
      return (
        <a href={href} className={FIELD_PLAYBOOK_MD_LINK_CLASS}>
          {children}
        </a>
      );
    },
  };
}
