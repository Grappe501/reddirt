import publicationRegistry from "./figure-publication-registry.json";

export type FigureAssetStatus = "fallback-svg" | "art-review" | "publication-ready";

export type FigureAssetRecord = {
  id: string;
  canonical: boolean;
  assetPath: string;
  status: FigureAssetStatus;
  alt: string;
  productionNote: string;
  sha256?: string | null;
  proofManifest?: string | null;
};

type PublicationRegistryEntry = {
  status: FigureAssetStatus;
  publicAssetPath: string;
  sha256: string | null;
  proofManifest: string | null;
};

const frozen = new Set(Array.from({ length: 15 }, (_, index) => `fig-${String(index + 2).padStart(2, "0")}`));
const registry = publicationRegistry.figures as Record<string, PublicationRegistryEntry>;

export const FIGURE_ASSETS: FigureAssetRecord[] = Array.from({ length: 18 }, (_, index) => {
  const number = index + 1;
  const id = `fig-${String(number).padStart(2, "0")}`;
  const canonical = frozen.has(id);
  const registered = registry[id];

  return {
    id,
    canonical,
    assetPath: registered?.publicAssetPath ?? `/macroscopic-life/figures/${id}.webp`,
    status: registered?.status ?? "fallback-svg",
    alt: canonical
      ? `Publication Figure ${number} artwork for Macroscopic Life Book One`
      : `Companion Figure ${number} artwork for the Macroscopic Life digital edition`,
    productionNote: canonical
      ? registered?.status === "publication-ready"
        ? "R3 publication composite verified and registered as the canonical public asset."
        : "Frozen publication figure. Deterministic SVG remains authoritative until an R3 composite is proven."
      : "Digital companion figure. Final art is optional and may not displace the frozen Figure 2–16 sequence.",
    sha256: registered?.sha256 ?? null,
    proofManifest: registered?.proofManifest ?? null,
  };
});

export function figureAssetById(id: string) {
  return FIGURE_ASSETS.find((asset) => asset.id === id);
}
