import { notFound } from "next/navigation";

import { FieldPlaybookMarkdownArticle } from "@/components/admin/field-playbook/FieldPlaybookMarkdownArticle";
import { FieldPlaybookMarkdownReadError } from "@/components/admin/field-playbook/FieldPlaybookMarkdownReadError";
import { loadFieldPlaybookMarkdown } from "@/lib/field-playbook/load-field-playbook-md";

type Props = {
  params: Promise<{ path?: string[] }>;
};

export default async function FieldPlaybookCatchAllPage({ params }: Props) {
  const { path } = await params;
  const key = path?.join("/") ?? "";

  const loaded = await loadFieldPlaybookMarkdown(key);
  if (loaded.kind === "doc") {
    return (
      <FieldPlaybookMarkdownArticle pathKey={key} markdown={loaded.markdown} sourceFile={loaded.sourceFile} />
    );
  }
  if (loaded.kind === "error") {
    return (
      <FieldPlaybookMarkdownReadError pathKey={key} sourceFile={loaded.sourceFile} message={loaded.message} />
    );
  }

  if (loaded.kind === "absent") {
    notFound();
  }

  return null;
}
