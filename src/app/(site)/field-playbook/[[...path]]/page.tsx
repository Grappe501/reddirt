import { notFound } from "next/navigation";

import { PublicFieldPlaybookMarkdownArticle } from "@/components/volunteer/PublicFieldPlaybookMarkdownArticle";
import { PublicFieldPlaybookMarkdownReadError } from "@/components/volunteer/PublicFieldPlaybookMarkdownReadError";
import { loadFieldPlaybookMarkdown } from "@/lib/field-playbook/load-field-playbook-md";

type Props = {
  params: Promise<{ path?: string[] }>;
};

export default async function PublicFieldPlaybookCatchAllPage({ params }: Props) {
  const { path } = await params;
  const key = path?.join("/") ?? "";

  const loaded = await loadFieldPlaybookMarkdown(key);
  if (loaded.kind === "doc") {
    return (
      <PublicFieldPlaybookMarkdownArticle pathKey={key} markdown={loaded.markdown} sourceFile={loaded.sourceFile} />
    );
  }
  if (loaded.kind === "error") {
    return (
      <PublicFieldPlaybookMarkdownReadError pathKey={key} sourceFile={loaded.sourceFile} message={loaded.message} />
    );
  }

  if (loaded.kind === "absent") {
    notFound();
  }

  return null;
}
