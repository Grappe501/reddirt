import { notFound } from "next/navigation";
import { getStrategyDoc } from "@/lib/campaign-strategy/registry";
import { loadStrategyMarkdown } from "@/lib/campaign-strategy/load-strategy-md";
import { StrategyArticle } from "@/components/admin/campaign-strategy/StrategyArticle";
import { StrategyMarkdownArticle } from "@/components/admin/campaign-strategy/StrategyMarkdownArticle";
import { StrategyMarkdownReadError } from "@/components/admin/campaign-strategy/StrategyMarkdownReadError";

type Props = {
  params: Promise<{ path?: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseExternalShare(sp: Record<string, string | string[] | undefined> | undefined): boolean {
  if (!sp) return false;
  const raw = sp.share;
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "external" || v === "1" || v === "true";
}

export default async function CampaignStrategyCatchAllPage({ params, searchParams }: Props) {
  const { path } = await params;
  const key = path?.join("/") ?? "";
  const sp = searchParams ? await searchParams : undefined;
  const externalShare = parseExternalShare(sp);

  const loaded = await loadStrategyMarkdown(key);
  if (loaded.kind === "doc") {
    return (
      <StrategyMarkdownArticle
        pathKey={key}
        markdown={loaded.markdown}
        sourceFile={loaded.sourceFile}
        externalShare={externalShare}
      />
    );
  }
  if (loaded.kind === "error") {
    return (
      <StrategyMarkdownReadError pathKey={key} sourceFile={loaded.sourceFile} message={loaded.message} />
    );
  }

  /** Unknown slug (not in manifest) — avoid falling through to TS registry and a generic 404. */
  if (loaded.kind === "absent") {
    notFound();
  }

  const doc = getStrategyDoc(key);
  if (!doc) notFound();
  return <StrategyArticle doc={doc} pathKey={key} />;
}
