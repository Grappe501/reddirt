/**
 * Mini-novel biography: chapter order, slugs, and paths to markdown sources.
 * Wired for `/biography` and `/about/deep-dive/[slug]` entry points.
 */

export type BiographyChapterStatus = "draft" | "review" | "published";

export type BiographyChapter = {
  slug: string;
  /** Stable ordering key */
  order: number;
  /** Display title (chapter heading / hero) */
  title: string;
  /** Short label for compact lists (optional) */
  shortTitle?: string;
  /** Hub card / SEO summary (optional) */
  summary?: string;
  themes?: readonly string[];
  status?: BiographyChapterStatus;
  /** Relative to `src/content/biography/chapters/` */
  filename: string;
};

export const BIOGRAPHY_CHAPTERS: readonly BiographyChapter[] = [
  {
    order: 1,
    slug: "the-road-that-brought-her-here",
    title: "The Road That Brought Her Here",
    shortTitle: "The Road",
    summary:
      "Kelly’s Selmer childhood framed by extended family and lived faith led by her grandparents; parents prepared her voice early—including hearth speeches and 4-H—with her father’s Modern Woodmen role opening exposure to motivational speakers like Zig Ziglar. A family trip across Arkansas (Hot Springs, Dogpatch, Mountain View, parks, Highway 7) preceded a move; Kelly’s mother and brother Ben got carsick on that winding drive while the family fell in love with the state. Mid-semester tenth grade at Sylvan Hills, clarinet beside a baritone sax player who later became her husband; by junior prom—Statehouse Convention Center, fairy-tale scale—they served on student leadership together and attended only as friends.",
    themes: ["faith", "family", "Tennessee roots", "Arkansas", "school", "early leadership"],
    status: "draft",
    filename: "chapter-01-the-road-that-brought-her-here.md",
  },
  {
    order: 2,
    slug: "chapter-02-finding-her-voice",
    title: "Finding Her Voice",
    shortTitle: "Her Voice",
    summary:
      "Voice built at the hearth and in 4-H; Zig Ziglar through Modern Woodmen laid the dream of the stage. Later she and Steve shared the same tapes in the car—two earnest “nerds” on the road. Journalism and yearbook editor work under mentor Dixie Martin (recently passed) trained her eye; friends leaned on her without always naming it. A quiet pull toward children plants a seed for a later story. Lyon College and psychology came next—purpose still forming beneath what looked like a straight line toward the microphone.",
    themes: [
      "voice",
      "hearth",
      "4-H",
      "Zig Ziglar",
      "Steve",
      "journalism",
      "Dixie Martin",
      "yearbook",
      "children (seed)",
      "Lyon College",
      "psychology",
    ],
    status: "draft",
    filename: "chapter-02-finding-her-voice.md",
  },
  {
    order: 3,
    slug: "chapter-03-the-turning-point",
    title: "The Child Who Changed the Path",
    shortTitle: "The Child",
    summary:
      "At Lyon College Kelly pursued psychology into real daycare responsibility—four foster siblings (ages one through four); she was assigned the two-year-old who slipped to the playground and ate dirt until the therapist explained malnourishment’s stubborn instincts. Attachment formed; the child was returned to his prior situation outside Kelly’s control. She understood she could not sustain repeated loss inside that system and turned toward industrial psychology. What she saw did not disappear; it rests beneath later choices still ahead.",
    themes: [
      "Lyon College",
      "psychology",
      "daycare",
      "foster care",
      "malnourishment",
      "attachment",
      "boundaries",
      "industrial psychology",
      "seed toward later family",
    ],
    status: "draft",
    filename: "chapter-03-the-turning-point.md",
  },
  {
    order: 4,
    slug: "chapter-04-learning-to-lead",
    title: "Learning to Lead at Scale",
    shortTitle: "Lead at Scale",
    summary:
      "After industrial psychology, Kelly scales leadership at Alltel and Verizon—teams, operations, training rooms—voice shifting from inspiration to sustained teaching. Parallel tracks drift she and Steve apart until his Jonesboro work leads him through Alltel bag-phone certification to a Little Rock classroom where Kelly is the trainer: reunion without rehearsal. Quieter beats foreshadow what follows—a Modern Woodmen holiday gathering with a brief encounter with a little girl, later a breakfast invite to meet Steve’s daughter—while competence and reopened ties prepare ground Chapter 5 will name.",
    themes: [
      "Alltel",
      "Verizon",
      "training",
      "operational leadership",
      "Steve",
      "Jonesboro",
      "Little Rock",
      "bag phones",
      "reunion",
      "Modern Woodmen",
      "seed toward family",
    ],
    status: "draft",
    filename: "chapter-04-learning-to-lead.md",
  },
  {
    order: 5,
    slug: "chapter-05-leaving-stability",
    title: "The Long Road Back",
    shortTitle: "Long Road Back",
    summary:
      "Steve woven through high school; Kelly brings him to Selmer and her grandparents; family travels to Fort Leonard Wood for his Army graduation. He carves Steve and Kelly — BFF in a tree behind her grandfather’s house—years later found ~20 feet up. After drift, reunion stacks classroom fluorescence then a father-tied Christmas room where Kelly meets a four-year-old blonde girl and commits aloud to adopt her; Grace emerges as her chosen name. Legal persistence follows; Steve later meets her daughter over breakfast; eight years later the girl stands as his daughter too. They return to Tennessee—the carving still visible—closing the loop.",
    themes: [
      "Steve",
      "Selmer",
      "grandparents",
      "Fort Leonard Wood",
      "tree carving",
      "drift",
      "reunion",
      "Christmas",
      "adoption",
      "Grace",
      "family",
    ],
    status: "draft",
    filename: "chapter-05-leaving-stability.md",
  },
  {
    order: 6,
    slug: "chapter-06-forevermost",
    title: "Between Romance and Joy",
    shortTitle: "Romance & Joy",
    summary:
      "Kelly, Steve, and Grace build intentional family life in Rose Bud—between Romance and Joy—with village-rooted rhythm at table and yard. At Verizon Kelly leads the Little Rock call center (800+ people) from a high-rise on the Arkansas River—scale beside stewardship. Home teaches reliability small; the tower teaches it large; both rehearse steadiness before wider public rooms ahead.",
    themes: [
      "Grace",
      "Steve",
      "Rose Bud",
      "Romance and Joy",
      "community",
      "Verizon",
      "Little Rock",
      "call center",
      "Arkansas River",
      "leadership scale",
      "home",
      "bridge to public life",
    ],
    status: "draft",
    filename: "chapter-06-forevermost.md",
  },
  {
    order: 7,
    slug: "chapter-07-the-people-showed-up",
    title: "The People Showed Up",
    shortTitle: "The People",
    summary:
      "Concern moves Kelly from private steadiness into public organizing: Steve leads referendum work on the LEARNS Act; Kelly builds training, clarity, and flow. A rented Sherwood duplex becomes HQ—petitions, notaries, steady answers—while six concurrent initiative petitions demand precision. Volunteers multiply; corporate-honed habits hold grassroots work without org-chart theater. The chapter closes on Sherwood summer as proof people rise when process respects them—bridge toward why statewide office later fits.",
    themes: [
      "LEARNS",
      "referendum",
      "organizing",
      "Sherwood",
      "duplex HQ",
      "initiative petitions",
      "training",
      "volunteers",
      "Verizon parallel",
      "public leadership",
    ],
    status: "draft",
    filename: "chapter-07-the-people-showed-up.md",
  },
  {
    order: 8,
    slug: "chapter-08-the-office",
    title: "The Office",
    shortTitle: "The Office",
    summary:
      "Nothing about statewide responsibility arrives as shock—only familiar weight. Verizon river-tower systems, intentional family beside Grace, Sherwood duplex logistics converge: Secretary of State tends elections, business filings, public records, and the operational trust beneath them. Leadership here means reliability and plain accountability—same clarity tested from kitchen tables through Capitol corridors—without pretending the story ends at a title.",
    themes: [
      "Secretary of State",
      "elections",
      "business filings",
      "public records",
      "trust",
      "systems",
      "accountability",
      "Capitol",
      "Verizon parallel",
      "Sherwood parallel",
      "continuity",
    ],
    filename: "chapter-08-the-office.md",
    status: "draft",
  },
  {
    order: 9,
    slug: "epilogue",
    title: "Still Driving That Road",
    shortTitle: "Epilogue",
    summary:
      "The narrative settles—not stops—into continuation without fanfare: Arkansas as chosen home; Grace grown with family of her own (grandson Weston; baby expected summer 2026); grandparent pace where moments sharpen and lineage extends beyond one life; threads from voice through systems through Sherwood volunteers reading as one road. Closing returns Highway 7—beauty, difficulty, sufficiency of a pull felt right. Signed reflection by Steve Grappe.",
    themes: [
      "Arkansas",
      "Grace",
      "grandchildren",
      "Weston",
      "family",
      "Highway 7",
      "continuity",
      "grandparents",
      "Steve Grappe",
      "reflection",
      "home",
    ],
    filename: "epilogue.md",
    status: "draft",
  },
];

export function getBiographyChapter(slug: string): BiographyChapter | undefined {
  return BIOGRAPHY_CHAPTERS.find((c) => c.slug === slug);
}

export function isBiographyChapterSlug(raw: string): raw is string {
  return BIOGRAPHY_CHAPTERS.some((c) => c.slug === raw);
}
