import { EvidenceBadge, FigureById } from "@/components/macroscopic-life/figures";
import { figureById } from "@/content/macroscopic-life/catalog";
import { figureAssetById } from "@/content/macroscopic-life/figure-assets";

export function PublicationFigure({ id, href }: { id: string; href?: string }) {
  const asset = figureAssetById(id);
  const figure = figureById(id);

  if (!asset || !figure || asset.status === "fallback-svg") {
    return <FigureById id={id} href={href} />;
  }

  const visual = (
    <figure className="ml-figure" style={{ margin: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.65rem" }}>
        <span className="ml-kicker">{asset.canonical ? `Publication · ${id}` : `Companion · ${id}`}</span>
        <EvidenceBadge evidenceClass={figure.evidenceClass} />
      </div>
      <img src={asset.assetPath} alt={asset.alt} style={{ display: "block", width: "100%", height: "auto" }} />
      <p style={{ margin: "0.7rem 0 0", fontFamily: "var(--ml-serif)", fontSize: "1rem" }}>{figure.takeaway}</p>
      <p className="ml-brake"><strong>Scientific brake. </strong>{figure.brake}</p>
      <p style={{ color: "var(--ml-mute)", fontSize: "0.78rem", margin: "0.65rem 0 0" }}>{asset.productionNote}</p>
    </figure>
  );

  if (!href) return visual;
  return <a href={href} style={{ display: "block", textDecoration: "none" }}>{visual}</a>;
}
