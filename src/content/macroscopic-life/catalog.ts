export const ML_BASE = "/macroscopic-life";

export type EvidenceClass = "observed" | "model" | "hypothesis";

export type ActId = "i" | "ii" | "iii" | "iv" | "v";

export type ChapterRecord = {
  number: number;
  slug: string;
  title: string;
  act: ActId;
  figureIds: string[];
  displayLine: string;
  source: { file: string; chapter: number | "file" };
};

export type FigureRecord = {
  id: string;
  chapter: number;
  title: string;
  evidenceClass: EvidenceClass;
  takeaway: string;
  brake: string;
  treatment: string;
};

export type TestRecord = {
  number: number;
  name: string;
  question: string;
  perturbation: string;
  strengthens: string;
  weakens: string;
  caveat: string;
};

export const ACTS: { id: ActId; roman: string; title: string; feeling: string }[] = [
  { id: "i", roman: "I", title: "The World We Cannot See", feeling: "There is more than my senses show." },
  { id: "ii", roman: "II", title: "When Many Become One", feeling: "The edge of a self is a scientific problem." },
  { id: "iii", roman: "III", title: "The Body Knows More Than the Cell", feeling: "Local physics can keep a whole." },
  { id: "iv", roman: "IV", title: "When the Network Begins to Think", feeling: "The question is now scientific." },
  { id: "v", roman: "V", title: "We Are the Microbe", feeling: "The idea may survive only where it can fail." },
];

export const CHAPTERS: ChapterRecord[] = [
  { number: 1, slug: "01-the-microbe", title: "The Microbe", act: "i", figureIds: ["fig-01"], displayLine: "We are not trying to prove Macroscopic Life. We are trying to break it.", source: { file: "pub-7l-r1-act-i-redundancy-cut-reader-manuscript.md", chapter: 1 } },
  { number: 2, slug: "02-the-world-your-senses-built", title: "The World Your Senses Built", act: "i", figureIds: ["fig-02"], displayLine: "A signal's absence from unaided perception is a reason to measure — not evidence that an unsupported hidden phenomenon exists.", source: { file: "pub-7l-r1-act-i-redundancy-cut-reader-manuscript.md", chapter: 2 } },
  { number: 3, slug: "03-the-clock-is-another-sense", title: "The Clock Is Another Sense", act: "i", figureIds: ["fig-03"], displayLine: "Perceptual limitation is not evidence for a hidden organism.", source: { file: "pub-7l-r1-act-i-redundancy-cut-reader-manuscript.md", chapter: 3 } },
  { number: 4, slug: "04-the-civilization-inside-your-skin", title: "The Civilization Inside Your Skin", act: "ii", figureIds: ["fig-04"], displayLine: "Precedent is not a diagnosis.", source: { file: "pub-7l-r1-act-ii-redundancy-cut-reader-manuscript.md", chapter: 4 } },
  { number: 5, slug: "05-when-parts-become-a-whole", title: "When Parts Become a Whole", act: "ii", figureIds: ["fig-05"], displayLine: "Individuality can evolve. Cooperation is not enough.", source: { file: "pub-7l-r1-act-ii-redundancy-cut-reader-manuscript.md", chapter: 5 } },
  { number: 6, slug: "06-where-does-the-individual-end", title: "Where Does the Individual End?", act: "ii", figureIds: ["fig-06"], displayLine: "Boundaries can be permeable without being meaningless.", source: { file: "pub-7l-r1-act-ii-redundancy-cut-reader-manuscript.md", chapter: 6 } },
  { number: 7, slug: "07-the-body-electric", title: "The Body Electric", act: "iii", figureIds: ["fig-07"], displayLine: "Frequency is a measurement, not an explanation.", source: { file: "pub-7l-r1-act-iii-redundancy-cut-reader-manuscript.md", chapter: 7 } },
  { number: 8, slug: "08-the-body-builds-itself", title: "The Body Builds Itself", act: "iii", figureIds: ["fig-08"], displayLine: "No individual cell needs to contain the finished body for the body to be reliably built.", source: { file: "pub-7l-r1-act-iii-redundancy-cut-reader-manuscript.md", chapter: 8 } },
  { number: 9, slug: "09-the-missing-limb", title: "The Missing Limb", act: "iii", figureIds: ["fig-09"], displayLine: "Restored outcome is not explicit target representation, goal awareness, or conscious intention.", source: { file: "pub-7l-r1-act-iii-redundancy-cut-reader-manuscript.md", chapter: 9 } },
  { number: 10, slug: "10-memory-without-a-brain", title: "Memory Without a Brain", act: "iii", figureIds: ["fig-10"], displayLine: "Trace is not storage, functional memory, or conscious recollection.", source: { file: "pub-7l-r1-act-iii-redundancy-cut-reader-manuscript.md", chapter: 10 } },
  { number: 11, slug: "11-living-ahead-of-now", title: "Living Ahead of Now", act: "iii", figureIds: ["fig-11"], displayLine: "If it cannot be wrong before the outcome, it is not a strong prediction claim.", source: { file: "pub-7l-r1-act-iii-redundancy-cut-reader-manuscript.md", chapter: 11 } },
  { number: 12, slug: "12-intelligence-without-a-little-man", title: "Intelligence Without a Little Man", act: "iv", figureIds: ["fig-12"], displayLine: "The whole can solve a problem that no single component solves alone.", source: { file: "pub-7l-r1-act-iv-redundancy-cut-reader-manuscript.md", chapter: 12 } },
  { number: 13, slug: "13-the-nervous-system-we-built", title: "The Nervous System We Built Outside Ourselves", act: "iv", figureIds: ["fig-13"], displayLine: "We have shown that the functions can scale. We have not yet shown that the individual does.", source: { file: "pub-7l-r1-act-iv-redundancy-cut-reader-manuscript.md", chapter: 13 } },
  { number: 14, slug: "14-is-civilization-becoming-an-individual", title: "Is Civilization Becoming an Individual?", act: "iv", figureIds: ["fig-14"], displayLine: "Current evidence strongly supports macroscopic organization. It does not yet require higher-order individuality.", source: { file: "pub-7l-r1-act-iv-redundancy-cut-reader-manuscript.md", chapter: 14 } },
  { number: 15, slug: "15-the-case-against-macroscopic-life", title: "The Case Against Macroscopic Life", act: "v", figureIds: ["fig-15"], displayLine: "A theory that cannot lose is not a scientific theory.", source: { file: "pub-7l-r1-act-v-redundancy-cut-reader-manuscript.md", chapter: 15 } },
  { number: 16, slug: "16-we-are-the-microbe", title: "We Are the Microbe", act: "v", figureIds: ["fig-16", "fig-17", "fig-18"], displayLine: "Epistemic humility is not positive evidence.", source: { file: "pub-7l-r1-act-v-redundancy-cut-reader-manuscript.md", chapter: 16 } },
];

export const FIGURES: FigureRecord[] = [
  { id: "fig-01", chapter: 1, title: "The Embedded Observer", evidenceClass: "hypothesis", takeaway: "Accurate local knowledge is not complete access to the containing scale.", brake: "This is a thought experiment. Ignorance of a larger whole does not prove a larger organism exists.", treatment: "Nested cutaway: local window inside a cell inside a body." },
  { id: "fig-02", chapter: 2, title: "Same Landscape, Different Worlds", evidenceClass: "observed", takeaway: "One physical environment can yield different biologically available information.", brake: "Unknown sensory channels do not validate any particular hidden phenomenon.", treatment: "Comparative sensory windows over one landscape." },
  { id: "fig-03", chapter: 3, title: "The Clock Is Another Sense", evidenceClass: "model", takeaway: "A process can be real and still invisible inside an observer's available time window.", brake: "Slow behavior is not automatically life.", treatment: "Duration windows from a second to geological time." },
  { id: "fig-04", chapter: 4, title: "The Civilization Inside Your Skin", evidenceClass: "observed", takeaway: "Everyday selfhood is already higher-order organization built from living parts.", brake: "A body is not merely a political civilization in miniature.", treatment: "Nested molecule-to-organism ladder, observational not progressive." },
  { id: "fig-05", chapter: 5, title: "The Ladder of Individuality", evidenceClass: "model", takeaway: "Individuality can evolve. Cooperation is not enough.", brake: "Not every cooperative group is a new organism. Do not read this as a progress stair.", treatment: "Branching transitions with conflict-control and inheritance." },
  { id: "fig-06", chapter: 6, title: "Where Does the Individual End?", evidenceClass: "model", takeaway: "Boundaries can be permeable without being meaningless.", brake: "A vague boundary is not no boundary.", treatment: "Overlapping physical, regulatory, and evolutionary edges." },
  { id: "fig-07", chapter: 7, title: "The Body Electric", evidenceClass: "observed", takeaway: "A mechanism can be entirely local while the function it implements belongs to a larger organizational level.", brake: "Bioelectricity is ordinary biophysics. It does not establish intelligence, consciousness, organismhood at another scale, or a hidden life force.", treatment: "Ion gradient to membrane to coupled tissue. No aura." },
  { id: "fig-08", chapter: 8, title: "No Cell Holds the Blueprint", evidenceClass: "model", takeaway: "No individual cell needs to contain the finished body for the body to be reliably built.", brake: "This does not establish a universal morphogenetic field, conscious cells, or organismhood at another scale.", treatment: "Distributed genes, signals, mechanics, geometry." },
  { id: "fig-09", chapter: 9, title: "Rebuilding What Is Missing", evidenceClass: "observed", takeaway: "Macroscopic absence can become local physical difference without a molecule labeled missing limb.", brake: "Restored outcome is not explicit target representation or conscious intention.", treatment: "Injury, local signals, restored pattern." },
  { id: "fig-10", chapter: 10, title: "Memory Is a Physical Consequence of the Past", evidenceClass: "model", takeaway: "The past matters later only if something physical persists and can re-enter causal processing.", brake: "A passive record is not automatically functional memory or recollection.", treatment: "Event to trace to persistence to later reuse." },
  { id: "fig-11", chapter: 11, title: "Living Ahead of Now", evidenceClass: "model", takeaway: "If it cannot be wrong before the outcome, it is not a strong prediction claim.", brake: "Prediction is not prophecy, consciousness, or backward information flow.", treatment: "Reactive loop versus anticipatory preparation." },
  { id: "fig-12", chapter: 12, title: "No Neuron Knows Your Name", evidenceClass: "model", takeaway: "The whole can solve a problem that no single component solves alone.", brake: "Signal is not information, integration, intelligence, agency, or consciousness.", treatment: "Distributed capability without a homunculus." },
  { id: "fig-13", chapter: 13, title: "The Nervous System We Built Outside Ourselves", evidenceClass: "model", takeaway: "Functions can scale. The individual has not been shown.", brake: "Infrastructure is not automatically a nervous system. Nervous system here is analogy, not identity.", treatment: "Message path and time collapse, no brain silhouette around Earth." },
  { id: "fig-14", chapter: 14, title: "Civilization Under the Organism Test", evidenceClass: "model", takeaway: "Current evidence strongly supports macroscopic organization. It does not yet require higher-order individuality.", brake: "Property present is not evidence for individuality. Do not add cells into an organism score.", treatment: "Deterministic matrix. Model C is the current result." },
  { id: "fig-15", chapter: 15, title: "The Beautiful-Idea Trap", evidenceClass: "model", takeaway: "Real organization does not require a new organism.", brake: "Resemblance is not evidence. A theory that cannot lose is not a scientific theory.", treatment: "Pattern trap broken; alternative explanations kept in frame." },
  { id: "fig-16", chapter: 16, title: "The Macroscopic Life Test Matrix", evidenceClass: "model", takeaway: "The Eleven Tests are a proposed synthesis for this project, not a consensus definition of life.", brake: "Do not add test results into an organism score. Negative outcomes are informative.", treatment: "Eleven named tests with strengthen / weaken columns." },
  { id: "fig-17", chapter: 16, title: "Evidence That Would Move the Needle", evidenceClass: "model", takeaway: "Model D must outperform Model C, not merely remain compatible with ignorance.", brake: "Future-looking language is not destiny. Evidence can strengthen or weaken D.", treatment: "For / against / alternative / what would change our mind." },
  { id: "fig-18", chapter: 16, title: "Nested Without Diminishment", evidenceClass: "hypothesis", takeaway: "We have not discovered the organism above us. We have established why human scale is not privileged.", brake: "We are the microbe is a methodological reminder, not a taxonomic claim.", treatment: "Restrained nested fields. No cosmic revelation." },
];

export const TESTS: TestRecord[] = [
  { number: 1, name: "Boundary Perturbation", question: "Does a proposed boundary behave like a maintained edge under perturbation?", perturbation: "Alter or probe the candidate boundary and measure whether system identity holds or dissolves.", strengthens: "The candidate maintains a reproducible inside/outside distinction under defined disruption.", weakens: "The boundary is arbitrary, only rhetorical, or vanishes under mild redescription.", caveat: "Permeable is not the same as nonexistent." },
  { number: 2, name: "Integration Ablation", question: "Does removing or isolating a coupling collapse a higher-level function?", perturbation: "Ablate a proposed integrative link and compare system-level performance.", strengthens: "A higher-level function depends on specific coupling, not just many busy parts.", weakens: "Parts continue independently with no loss of the claimed whole-level function.", caveat: "Hubs and bottlenecks are allowed; a homunculus is not required." },
  { number: 3, name: "Conflict Suppression", question: "Are component-level wins reliably prevented from destroying the whole?", perturbation: "Compare systems with and without conflict-control mechanisms.", strengthens: "Component success is constrained in ways that stabilize a higher-level individual.", weakens: "Stabilization is only multi-agent policing, treaty, or market order.", caveat: "Stabilization alone does not score for higher-order individuality." },
  { number: 4, name: "Energetic Organization", question: "Is matter and energy coordinated at the proposed scale in a way that explains persistence?", perturbation: "Track flows and ask whether a higher-level description is required.", strengthens: "System-level energetic organization predicts outcomes better than independent-agent accounts.", weakens: "Flows are explained by local agents plus shared environment.", caveat: "Nonequilibrium organization does not define life." },
  { number: 5, name: "Memory Turnover", question: "Does a past state remain causally available after original carriers are replaced?", perturbation: "Replace components and test whether a prior state still changes later behavior.", strengthens: "A physical trace persists and re-enters processing after turnover.", weakens: "Only archives, inscriptions, or new agents remember.", caveat: "Trace is not recollection." },
  { number: 6, name: "Prediction Advantage", question: "Does a higher-level model forecast better, and can it be wrong before the outcome?", perturbation: "Compare prospective predictions from Model C and Model D.", strengthens: "The higher-level model makes risky, better forecasts.", weakens: "Component/environment models outperform or match it.", caveat: "If it cannot be wrong first, it is not a strong prediction claim." },
  { number: 7, name: "Repair Autonomy", question: "Does the system restore organization as a system-level function, not only as local healing?", perturbation: "Damage a pattern and measure what returns, and under whose control.", strengthens: "Pattern restoration depends on remaining system organization, not only local wound closure.", weakens: "Repair is ordinary local healing, replacement, or independent agents rebuilding.", caveat: "Restored outcome is not a conscious target." },
  { number: 8, name: "Whole-Only Information", question: "Is there a relational or system property that no component possesses alone?", perturbation: "Compare local measurements with integrated variables.", strengthens: "A measured whole-only variable improves explanation or control.", weakens: "Apparent synergy is just aggregated local data.", caveat: "No single information formalism is assumed to be settled." },
  { number: 9, name: "Higher-Level Intervention", question: "Can an intervention aimed at the proposed whole change outcomes in a way parts-level intervention cannot?", perturbation: "Act on a candidate higher-level variable and compare with part-level controls.", strengthens: "The higher-level intervention has distinct, predicted effects.", weakens: "All effects reduce to acting on parts or the environment.", caveat: "Success is model comparison, not proof that a macro-entity exists." },
  { number: 10, name: "Reproduction / Heredity", question: "Does the candidate have a hereditary bottleneck that aligns component futures?", perturbation: "Ask whether a new whole is produced with heritable organization.", strengthens: "There is a defensible reproductive/hereditary architecture at the proposed level.", weakens: "There is only growth, copy, influence, or cultural resemblance.", caveat: "This test is especially demanding for evolutionary individuality." },
  { number: 11, name: "Model Competition", question: "Does the higher-order individual model outperform organized multi-agent alternatives?", perturbation: "Score the same observations under Model C and Model D with pre-specified outcomes.", strengthens: "Model D uniquely predicts and explains after serious alternatives are tried.", weakens: "Model C or a thinner alternative is sufficient.", caveat: "Compatibility with hidden organization does not earn Model D." },
];

export const MODELS = [
  { id: "A", name: "No special higher-scale organization", body: "Impressive patterns dissolve into ordinary physics, independent agents, and shared environment." },
  { id: "B", name: "Pattern / metaphor only", body: "The resemblance is real as metaphor and weak as ontology. Do not treat it as a candidate individual." },
  { id: "C", name: "Macroscopic organization, not one individual", body: "Higher-scale organization is real and useful. Organismhood and unified agency are not established. Current result." },
  { id: "D", name: "Higher-order individuality", body: "A new individual exists at the proposed scale. This claim still has to beat Model C on the Eleven Tests." },
] as const;

export function chapterBySlug(slug: string): ChapterRecord | undefined {
  return CHAPTERS.find((chapter) => chapter.slug === slug);
}

export function figureById(id: string): FigureRecord | undefined {
  return FIGURES.find((figure) => figure.id === id);
}

export function adjacentChapters(slug: string): { prev?: ChapterRecord; next?: ChapterRecord } {
  const index = CHAPTERS.findIndex((chapter) => chapter.slug === slug);
  return {
    prev: index > 0 ? CHAPTERS[index - 1] : undefined,
    next: index >= 0 && index < CHAPTERS.length - 1 ? CHAPTERS[index + 1] : undefined,
  };
}
