import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownBody({ markdown }: { markdown: string }) {
  return (
    <div className="ml-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="ml-prose-title">{children}</h1>,
          blockquote: ({ children }) => <blockquote className="ml-readout">{children}</blockquote>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
