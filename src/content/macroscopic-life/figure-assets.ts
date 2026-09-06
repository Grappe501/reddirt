export type FigureAssetStatus = "fallback-svg" | "art-review" | "publication-ready";

export type FigureAssetRecord = {
  id: string;
  canonical: boolean;
  assetPath: string;
  status: FigureAssetStatus;
  alt: string;
  productionNote: string;
};

const frozen = new Set(Array.from({ length: 15 }, (_, index) => `fig-${String(index + 2).padStart(2, "0")}`));

export const FIGURE_ASSETS: FigureAssetRecord[] = Array.from({ length: 18 }, (_, index) => {
  const number = index + 1;
  const id = `fig-${String(number).padStart(2, "0")}`;
  const canonical = frozen.has(id);
  return {
    id,
    canonical,
    assetPath: `/macroscopic-life/figures/${id}.webp`,
    status: "fallback-svg",
    alt: canonical
      ? `Publication Figure ${number} artwork for Macroscopic Life Book One`
      : `Companion Figure ${number} artwork for the Macroscopic Life digital edition`,
    productionNote: canonical
      ? "Frozen publication figure. Final art may replace the base image only; scientific text remains deterministic."
      : "Digital companion figure. Final art is optional and may not displace the frozen Figure 2–16 sequence.",
  };
});

export function figureAssetById(id: string) {
  return FIGURE_ASSETS.find((asset) => asset.id === id);
}
