import { FigureById, FigureObject } from "@/components/macroscopic-life/figures";
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
        <span className="ml-kicker">{asset.status === "publication-ready" ? "Reviewed artwork" : "Artwork under review"}</span>
      </div>
      <img
        src={asset.assetPath}
        alt={asset.alt}
        style={{ display: "block", width: "100%", height: "auto" }}
      />
      <div style={{ marginTop: "0.7rem" }}>
        <FigureObject figure={figure} />
      </div>
      <p style={{ color: "var(--ml-mute)", fontSize: "0.78rem", margin: "0.65rem 0 0" }}>
        {asset.productionNote}
      </p>
    </figure>
  );

  if (!href) return visual;

  return (
    <a href={href} style={{ display: "block", textDecoration: "none" }}>
      {visual}
    </a>
  );
}
