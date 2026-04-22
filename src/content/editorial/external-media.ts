/**
 * Bylined or first-person coverage in state/local media — not on-site sample essays.
 * Curated from public search; add rows as new pieces go to print or digital editions.
 */
export type ExternalMediaItem = {
  id: string;
  title: string;
  /** ISO date (YYYY-MM-DD) */
  publishedAt: string;
  /** One or two short sentences; not full reprint. */
  summary: string;
  /** Primary publication name (syndication noted in `links` when relevant). */
  outlet: string;
  kind: "op-ed" | "interview" | "note";
  links: { label: string; href: string }[];
};

/** Nov 1, 2025 onward — as requested. */
export const publishedMediaSince2025_11: ExternalMediaItem[] = [
  {
    id: "adg-steady-leadership-2026-03-30",
    title: "Arkansas needs steady leadership—not more election drama",
    publishedAt: "2026-03-30",
    kind: "op-ed",
    outlet: "The Democrat-Gazette (statewide and Northwest Arkansas editions)",
    summary:
      "Argues the Secretary of State’s office should be a service role built on trust—supporting county election officials, protecting voter and petition access, and upholding the legal framework for elections, not political theater in the public SOS contest.",
    links: [
      {
        label: "The Arkansas Democrat-Gazette (arkansasonline.com)",
        href: "https://www.arkansasonline.com/news/2026/mar/30/arkansas-needs-steady-leadershipnot-more-election/",
      },
      {
        label: "Northwest Arkansas Democrat-Gazette (nwaonline.com)",
        href: "https://www.nwaonline.com/news/2026/mar/30/arkansas-needs-steady-leadershipnot-more-election/",
      },
    ],
  },
];

/**
 * Bylined opinion pieces in the same state papers, before the Nov 2025 cutoff.
 * Shown in a separate, nested block so the date window stays honest.
 */
export const publishedMediaEarlier: ExternalMediaItem[] = [
  {
    id: "arktimes-sos-announce-2025-10-31",
    title: "Kelly Grappe becomes first Democrat to announce 2026 run for secretary of state",
    publishedAt: "2025-10-31",
    kind: "note",
    outlet: "Arkansas Times (Arkansas Blog)",
    summary:
      "News coverage of Kelly Grappe (D–Rose Bud) entering the 2026 Secretary of State race—including background in direct democracy and the developing field of announced candidates.",
    links: [
      {
        label: "Read on arktimes.com",
        href: "https://arktimes.com/arkansas-blog/2025/10/31/kelly-grappe-becomes-first-democrat-to-announce-2026-run-for-secretary-of-state",
      },
    ],
  },
  {
    id: "adg-sos-announce-2025-10-31",
    title: "Democrat Kelly Grappe announces for secretary of state",
    publishedAt: "2025-10-31",
    kind: "note",
    outlet: "The Arkansas Democrat-Gazette",
    summary:
      "Statewide news coverage of the campaign launch—first Democrat in the 2026 Secretary of State field at the time of filing, with context from an interview in the same news cycle (Neal Earley, ADG).",
    links: [
      {
        label: "Read on arkansasonline.com",
        href: "https://www.arkansasonline.com/news/2025/oct/31/democrat-kelly-grappe-announces-for-secretary-of/",
      },
      {
        label: "Arkansas Democrat-Gazette on PressReader (Oct 31, 2025 e-edition layout)",
        href: "https://www.pressreader.com/usa/arkansas-democrat-gazette/20251031/282020448538009",
      },
    ],
  },
  {
    id: "nwa-mothers-of-storm-2025-05-08",
    title: "Mothers of storm",
    publishedAt: "2025-05-08",
    kind: "op-ed",
    outlet: "Northwest Arkansas Democrat-Gazette",
    summary:
      "Reflection tied to place and public memory (Mount Holly Cemetery, roses, history)—a quieter civic essay from the same opinion column run.",
    links: [
      {
        label: "Read on nwaonline.com",
        href: "https://www.nwaonline.com/news/2025/may/08/mothers-of-storm/",
      },
    ],
  },
  {
    id: "adg-moving-forward-2024-12-19",
    title: "Moving forward",
    publishedAt: "2024-12-19",
    kind: "op-ed",
    outlet: "The Arkansas Democrat-Gazette",
    summary: "On rebuilding trust and shared work after a divisive election season.",
    links: [
      {
        label: "Read on arkansasonline.com",
        href: "https://www.arkansasonline.com/news/2024/dec/19/moving-forward/",
      },
    ],
  },
  {
    id: "adg-shape-our-future-2024-08-29",
    title: "Shape our future",
    publishedAt: "2024-08-29",
    kind: "op-ed",
    outlet: "The Arkansas Democrat-Gazette",
    summary: "On women’s voices, voting, and the ballot initiative process in Arkansas.",
    links: [
      {
        label: "Read on arkansasonline.com",
        href: "https://www.arkansasonline.com/news/2024/aug/29/shape-our-future/",
      },
    ],
  },
];

export function formatEditorialDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
