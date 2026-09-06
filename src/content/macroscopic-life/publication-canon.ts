import type { ActId, FigureRecord } from "@/content/macroscopic-life/catalog";

export const PUBLICATION_ACTS: { id: ActId; roman: string; title: string; feeling: string }[] = [
  { id: "i", roman: "I", title: "The World We Cannot See", feeling: "Perception is partial; measurement has to do the rest." },
  { id: "ii", roman: "II", title: "When Many Become One", feeling: "Individuality can evolve, but cooperation is not enough." },
  { id: "iii", roman: "III", title: "The Body Knows More Than the Cell", feeling: "Coordination, form, repair, persistence, anticipation." },
  { id: "iv", roman: "IV", title: "The Intelligence Question", feeling: "Functions can scale without proving that the individual does." },
  { id: "v", roman: "V", title: "The Test", feeling: "The stronger hypothesis must compete, risk failure, and be allowed to lose." },
];

const FIGURE_OVERRIDES: Record<string, Partial<FigureRecord>> = {
  "fig-06": {
    takeaway: "Boundaries can be permeable without being meaningful.",
    brake: "Permeability alone does not make a proposed boundary scientifically meaningful.",
  },
  "fig-16": {
    title: "We Are the Microbe",
    evidenceClass: "hypothesis",
    takeaway: "Local signals can be real without containing a picture of the whole.",
    brake: "Epistemic humility is not positive evidence. Measure. Perturb. Compare models. Allow failure.",
    treatment: "Closing perspective figure. Methodological humility, not a claim that a larger organism has been discovered.",
  },
  "fig-17": {
    title: "Companion Diagram — The Eleven Tests",
    evidenceClass: "model",
    takeaway: "The Eleven Tests are a proposed synthesis for model comparison, not an organism score.",
    brake: "Dependent tests may strengthen one mechanistic story without becoming independent votes.",
    treatment: "Website companion diagram; not part of the frozen Figure 2–16 publication sequence.",
  },
  "fig-18": {
    title: "Companion Diagram — Evidence That Would Move the Needle",
    evidenceClass: "model",
    takeaway: "Model D must outperform Model C, not merely remain compatible with uncertainty.",
    brake: "Future evidence can strengthen or weaken the higher-order-individual hypothesis.",
    treatment: "Website companion diagram; not part of the frozen Figure 2–16 publication sequence.",
  },
};

export function publicationFigure(figure: FigureRecord): FigureRecord {
  return { ...figure, ...(FIGURE_OVERRIDES[figure.id] ?? {}) };
}

export function isFrozenPublicationFigure(id: string): boolean {
  const n = Number(id.replace("fig-", ""));
  return Number.isInteger(n) && n >= 2 && n <= 16;
}
