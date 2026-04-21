import { media } from "@/content/media/registry";
import type { StoryCategory, StoryEntry } from "./types";

export type { StoryCategory, StoryEntry, StoryNarrativeSource } from "./types";

export const storyCategoryFilters: { id: StoryCategory | "all"; label: string }[] = [
  { id: "all", label: "All voices" },
  { id: "work", label: "Work" },
  { id: "family", label: "Family" },
  { id: "community", label: "Community" },
  { id: "youth", label: "Youth" },
  { id: "rural", label: "Rural" },
  { id: "organizing", label: "Organizing" },
];

const stories: StoryEntry[] = [
  {
    title: "We weren’t asking for special treatment—just fairness on the floor",
    slug: "warehouse-fairness",
    summary:
      "A shift lead in central Arkansas on overtime, safety shortcuts, and what it felt like when the people with titles stopped answering.",
    dek: "Prairie County · third shift",
    category: "work",
    categoryLabel: "Warehouse shift lead",
    featured: false,
    publishedAt: "2026-01-14",
    image: media.storyWarehouse,
    tags: ["work", "safety", "dignity", "rural", "accountability"],
    quotePullouts: [
      { quote: "They wanted speed. We wanted to go home with the same knees we came in with.", attribution: "Shift lead" },
    ],
    relatedSlugs: ["porch-list-organizer", "bakery-opens-closes"],
    body: [
      {
        type: "paragraph",
        text: "I’ve been on the floor long enough to know the difference between a hard job and a careless one. Hard is steady. Careless is when corners get cut because somebody three states away decided the number on a screen mattered more than the number of people in the building.",
      },
      {
        type: "paragraph",
        text: "When we started asking basic questions—about breaks, about training, about who was responsible when a line got unsafe—the answers turned into silence. Not anger. Silence. Like we were supposed to be grateful for a paycheck and quiet about everything else.",
      },
      {
        type: "heading",
        text: "What changed me wasn’t a speech. It was a neighbor.",
      },
      {
        type: "paragraph",
        text: "A woman from church asked if I’d sit in a living room with five other people and tell the story without making myself a hero. I didn’t want to. But I did. And I heard versions of the same story from a custodian, a forklift driver, a mom working doubles.",
      },
      {
        type: "quote",
        text: "Politics didn’t fail us first—neglect did. Politics just made the neglect official.",
      },
      {
        type: "paragraph",
        text: "I’m not asking for a savior. I’m asking for a fair process: clear rules, real enforcement, and a path where working people don’t have to risk everything to be heard.",
      },
    ],
  },
  {
    title: "Our school board meetings weren’t built for parents like us",
    slug: "school-board-notes",
    summary:
      "Three parents translated agendas, shared notes, and made participation possible—without turning meetings into performance art.",
    dek: "Central Arkansas",
    category: "community",
    categoryLabel: "Parents & educators",
    featured: false,
    publishedAt: "2026-02-02",
    image: media.storySchool,
    tags: ["schools", "translation", "community", "transparency", "youth"],
    relatedSlugs: ["first-time-voter-line", "porch-list-organizer"],
    body: [
      {
        type: "paragraph",
        text: "The agenda packet was forty pages. The microphone rules assumed you had time to rehearse. The parking lot assumed you had a car that wouldn’t embarrass you. None of that is evil on purpose—it’s just built for a narrow kind of citizen.",
      },
      {
        type: "paragraph",
        text: "We started small: one shared doc with bullet points in plain language. Then a group chat for questions people were scared to ask out loud. Then a rotating buddy system so nobody had to walk into that room alone.",
      },
      {
        type: "heading",
        text: "The goal wasn’t to win every vote. It was to end the shame.",
      },
      {
        type: "paragraph",
        text: "When a neighbor understands what’s being decided, they stop assuming they’re stupid. That’s not naive—that’s democracy with dignity.",
      },
    ],
  },
  {
    title: "The bakery opens before the sun—and closes on my nerves",
    slug: "bakery-opens-closes",
    summary:
      "A small business owner on razor-thin margins, second-shift parenting, and why “pull yourself up” sounds like a joke when the rules keep changing.",
    dek: "River Valley",
    category: "family",
    categoryLabel: "Small business owner",
    featured: false,
    publishedAt: "2026-02-18",
    image: media.storyBakery,
    tags: ["small business", "family", "economy", "work", "community"],
    quotePullouts: [
      { quote: "I can bake bread. I can’t bake my way out of a healthcare premium.", attribution: "Owner" },
    ],
    relatedSlugs: ["warehouse-fairness", "mail-route-broadband"],
    body: [
      {
        type: "paragraph",
        text: "People think owning a little shop means freedom. Sometimes it does. Mostly it means you’re the one who absorbs the shock—supplier prices, slow weeks, the employee who needs hours you can’t honestly promise.",
      },
      {
        type: "paragraph",
        text: "My kids know how to sweep flour. They also know when I’m lying about being “fine.” I’m tired of performing strength for strangers who’ve never tried to make payroll on Tuesday with Monday’s receipts still uncertain.",
      },
      {
        type: "heading",
        text: "What I want is predictable ground",
      },
      {
        type: "paragraph",
        text: "Not a handout—a floor. Rules that don’t change because a lobbyist had lunch. Healthcare that doesn’t punish you for hiring. A politics that treats small towns like they’re real economies, not props.",
      },
    ],
  },
  {
    title: "I voted for the first time and didn’t feel alone in the line",
    slug: "first-time-voter-line",
    summary:
      "A young Arkansan on paperwork, intimidation myths, and why having somebody explain the process without mocking you matters.",
    dek: "Northwest Arkansas",
    category: "youth",
    categoryLabel: "Young voter",
    featured: true,
    publishedAt: "2026-03-05",
    image: media.storyYouth,
    tags: ["youth", "voting", "democracy", "community"],
    relatedSlugs: ["school-board-notes", "mail-route-broadband"],
    body: [
      {
        type: "paragraph",
        text: "Growing up, politics felt like a club with a secret handshake. Everybody talked like you were supposed to already know the rules—IDs, deadlines, what counts, what doesn’t.",
      },
      {
        type: "paragraph",
        text: "The first time I went early vote, I expected side-eye. Instead I got normal people holding folders, joking about parking, helping each other read the ballot language without making it weird.",
      },
      {
        type: "quote",
        text: "Nobody should have to feel brave to cast a ballot. But if the process makes you feel brave, that’s a design problem.",
      },
      {
        type: "paragraph",
        text: "I’m sharing this because I want the next person to hear: you’re allowed to ask questions. That’s not ignorance—that’s citizenship.",
      },
    ],
  },
  {
    title: "Zero bars isn’t a lifestyle—it’s a closing door",
    slug: "mail-route-broadband",
    summary:
      "A rural resident on distance, connectivity, and the quiet way isolation becomes policy when institutions only hear cities.",
    dek: "South Arkansas",
    category: "rural",
    categoryLabel: "Rural resident",
    featured: false,
    publishedAt: "2026-03-20",
    image: media.storyRural,
    tags: ["rural", "broadband", "isolation", "community", "equity"],
    relatedSlugs: ["flood-fema-loop", "bakery-opens-closes"],
    body: [
      {
        type: "paragraph",
        text: "Out here, “just go online” is a slap. Kids homework, doctor forms, job applications—modern life assumes a wire that doesn’t reach your kitchen.",
      },
      {
        type: "paragraph",
        text: "It’s not romantic poverty. It’s a tax on your time. You learn to batch errands, to beg a cousin’s Wi‑Fi, to make phone calls that bounce you between departments like a pinball.",
      },
      {
        type: "heading",
        text: "Rural isn’t a museum. It’s a workforce.",
      },
      {
        type: "paragraph",
        text: "We’re not asking for pity. We’re asking for infrastructure that matches reality—so communities can stay, learn, heal, and build without leaving their place behind.",
      },
    ],
  },
  {
    title: "NICU nights teach you what “essential” actually costs",
    slug: "nicu-charge-nurse",
    summary:
      "A healthcare worker on short staffing, moral injury, and the gap between gratitude in slogans and respect in staffing ratios.",
    dek: "Central Arkansas",
    category: "healthcare",
    categoryLabel: "Charge nurse",
    featured: false,
    publishedAt: "2026-04-01",
    image: media.storyNurse,
    tags: ["healthcare", "labor", "community", "family", "dignity"],
    relatedSlugs: ["warehouse-fairness", "flood-fema-loop"],
    body: [
      {
        type: "paragraph",
        text: "People thank you in the elevator. They should—they’re carrying fear you can see. But gratitude doesn’t schedule breaks. It doesn’t hire another pair of hands when three nurses are covering what five used to cover.",
      },
      {
        type: "paragraph",
        text: "What breaks you isn’t the blood or the beeping. It’s knowing exactly what a patient needs and not being able to split yourself into the number of people required to give it.",
      },
      {
        type: "heading",
        text: "If you want a healthy state, fund the humans who stabilize it",
      },
      {
        type: "paragraph",
        text: "This movement piece matters to me because it treats workers as infrastructure—not as martyrs who are supposed to run on moral fuel forever.",
      },
    ],
  },
  {
    title: "I started with a porch list and ended with a team",
    slug: "porch-list-organizer",
    summary:
      "A volunteer organizer on awkward first knocks, listening harder than talking, and building a county rhythm that didn’t depend on one charismatic leader.",
    dek: "Saline County",
    category: "organizing",
    categoryLabel: "Volunteer organizer",
    featured: true,
    publishedAt: "2026-04-12",
    image: media.storyOrganizer,
    tags: ["organizing", "listening", "local power", "community"],
    relatedSlugs: ["school-board-notes", "warehouse-fairness"],
    body: [
      {
        type: "paragraph",
        text: "I didn’t wake up wanting to be an organizer. I woke up tired of meetings where the same ten loud voices pretended they represented everybody.",
      },
      {
        type: "paragraph",
        text: "My first month was clumsy. Wrong shoes. Wrong timing. A dog that hated strangers. But I kept a simple rule: ask a question and actually wait for the answer.",
      },
      {
        type: "quote",
        text: "Leadership isn’t a spotlight. Sometimes it’s showing up twice.",
        attribution: "Field note",
      },
      {
        type: "paragraph",
        text: "Now we’ve got a weekly text thread, a rotating host for coffee, and a rule that new people get paired with a buddy. It’s not fancy. It’s durable.",
      },
    ],
  },
  {
    title: "The water went down. The paperwork didn’t.",
    slug: "flood-fema-loop",
    summary:
      "After the river retreated, a family learned the second disaster is often a maze—forms, deadlines, and disappearing help lines.",
    dek: "River Valley",
    category: "community",
    categoryLabel: "Homeowner",
    featured: true,
    publishedAt: "2026-04-18",
    image: media.storyFlood,
    tags: ["disaster", "community", "accountability", "family", "rural"],
    relatedSlugs: ["mail-route-broadband", "bakery-opens-closes"],
    body: [
      {
        type: "paragraph",
        text: "The flood was loud. Mud smells like memory. Kids cry over ruined toys and you tell them it’s okay while you’re not sure it is.",
      },
      {
        type: "paragraph",
        text: "Then the quiet part starts: documenting mold, chasing inspectors, uploading photos on a signal that drops if you stand in the wrong room.",
      },
      {
        type: "heading",
        text: "Relief shouldn’t require a law degree",
      },
      {
        type: "paragraph",
        text: "We’re sharing this so the next town gets neighbors who know the maze—and so policymakers hear that dignity includes clear processes, not heroic patience.",
      },
    ],
  },
];

export const allStories: StoryEntry[] = stories;

export function getStoryBySlug(slug: string): StoryEntry | undefined {
  return allStories.find((s) => s.slug === slug);
}

export function listStorySlugs(): string[] {
  return allStories.map((s) => s.slug);
}

export function featuredStories(limit = 2): StoryEntry[] {
  const featured = allStories.filter((s) => s.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  return [...featured, ...allStories.filter((s) => !s.featured)].slice(0, limit);
}
