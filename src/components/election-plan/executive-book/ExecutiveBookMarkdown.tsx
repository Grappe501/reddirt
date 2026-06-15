import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

type Props = {
  markdown: string;
};

export function ExecutiveBookMarkdown({ markdown }: Props) {
  return (
    <div className="ep-chapter-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
