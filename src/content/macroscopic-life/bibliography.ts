export type BibliographyEntry = {
  id: string;
  citation: string;
  chapters: number[];
  href?: string;
  note?: string;
};

export const BIBLIOGRAPHY: BibliographyEntry[] = [
  { id: "west-2015", citation: "West, Stuart A., Roberta M. Fisher, Andy Gardner, and E. Toby Kiers. ‘Major Evolutionary Transitions in Individuality.’ Proceedings of the National Academy of Sciences 112, no. 33 (2015): 10112–10119.", chapters: [1, 5, 14], href: "https://pubmed.ncbi.nlm.nih.gov/25964342/", note: "PMID 25964342 · PMCID PMC4547252" },
  { id: "bourke-2023", citation: "Bourke, Andrew F. G. Review/discussion of conflict and major evolutionary transitions (2023).", chapters: [5, 14], href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10565403/", note: "PMCID PMC10565403 · full publication metadata queued for normalization" },
  { id: "bioelectricity-review", citation: "Review literature on bioelectric signaling and membrane-level physiological mechanisms.", chapters: [7], href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8180260/", note: "PMCID PMC8180260 · representative anchor; independent source family retained in research control" },
  { id: "morphogenesis-review", citation: "Review literature on morphogenesis and distributed developmental patterning.", chapters: [8], href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4051191/", note: "PMCID PMC4051191 · representative anchor" },
  { id: "salamander-regeneration", citation: "Review/primary literature on salamander limb regeneration and regenerative patterning.", chapters: [9], href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4036467/", note: "PMCID PMC4036467 · representative anchor" },
  { id: "trained-immunity", citation: "Review literature on trained immunity and persistent innate immune state.", chapters: [10], href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5087274/", note: "PMCID PMC5087274 · representative anchor" },
  { id: "circadian-review", citation: "Review literature on circadian organization, entrainment, and endogenous oscillators.", chapters: [11], href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3378387/", note: "PMCID PMC3378387 · representative anchor" },
  { id: "pid-review", citation: "Review literature on partial information decomposition and multivariate information structure.", chapters: [12, 14], href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10217569/", note: "PMCID PMC10217569 · no single information formalism is treated as uniquely canonical" },
  { id: "hutchins", citation: "Hutchins, Edwin. Cognition in the Wild. Cambridge, MA: MIT Press.", chapters: [12, 13], note: "Edition/year details to be verified against the edition selected for print bibliography" },
  { id: "helbing-2013", citation: "Helbing, Dirk. ‘Globally Networked Risks and How to Respond.’ Nature (2013).", chapters: [13, 14], href: "https://doi.org/10.1038/nature12047", note: "DOI 10.1038/nature12047" },
  { id: "franklin-hall", citation: "Franklin-Hall, Laura. ‘High-Level Explanation and the Interventionist’s Variables Problem.’ British Journal for the Philosophy of Science.", chapters: [14], href: "https://doi.org/10.1093/bjps/axu040", note: "DOI 10.1093/bjps/axu040 · higher-level explanation remains philosophically disputed" },
];

export function bibliographyForChapter(chapter: number) {
  return BIBLIOGRAPHY.filter((entry) => entry.chapters.includes(chapter));
}
