import type { DocChunk } from "../../lib/content/parse";

const MAX = 12_000;

function cap(text: string): string {
  const t = text.trim();
  if (t.length <= MAX) return t;
  return `${t.slice(0, MAX)}…`;
}

/**
 * Internal campaign briefing: youth engagement strategy (ages 14–25). Ingested for assistant + search.
 * Path uses `brief:` — UI links to /resources.
 */
export function loadYouthEngagementStrategyChunks(): DocChunk[] {
  const content = [
    "# Campaign briefing: youth engagement strategy",
    "",
    "## Strategic goals",
    "- Empower students (ages 14–25) to lead and shape campaign organizing.",
    "- Build a pipeline from volunteerism to full-time leadership.",
    "- Create visible, cultural youth presence in campaign identity.",
    "- Provide real civic training, organizing skill development, and political mentorship.",
    "",
    "## Core youth engagement programs",
    "",
    "### Youth field offices",
    "Embedded student-led organizing units in every region.",
    "",
    "### Youth-led podcast & media",
    "Weekly show directed, produced, and hosted by high school and college youth.",
    "",
    "### Civic service & internship program",
    "Track students by region; align community service hours with campaign volunteerism.",
    "",
    "### Leadership council",
    "High school and college representatives with equal voice to campaign staff.",
    "",
    "### Youth town halls",
    "Student-moderated forums on school and community issues.",
    "",
    "### Classroom-to-community outreach",
    "Partner with teachers, coaches, and school clubs to channel interested students into action.",
    "",
    "## Integration across campaign",
    "- Every field office has a designated youth point-of-contact or embedded organizer.",
    "- Youth serve on every committee: policy, media, events, data.",
    "- Encourage youth to run for office, speak publicly, and co-lead initiatives.",
    "- No separation by age in influence—youth have equal status to adults in leadership roles.",
    "",
    "## Culture & branding",
    "- Youth-facing campaign visuals, hashtags, and cultural messaging.",
    "- Promote youth through official accounts to elevate peer influence.",
    "- Weekly blog or social content produced by youth highlighting their efforts.",
    "- Dedicated youth newsletter and engagement portal.",
    "",
    "## Tools & partnerships",
    "- ACT for training and skills-based programs.",
    "- Collaborate with Arkansas Civic Action Network and school-based civic clubs.",
    "- Get Loud for school-based voter registration programs.",
    "- Mentorship tracks for youth entering organizing, politics, education, or community development.",
  ].join("\n");

  return [
    {
      path: "brief:/youth-engagement-strategy",
      title: "Campaign briefing — youth engagement strategy (14–25)",
      chunkIndex: 0,
      content: cap(content),
    },
  ];
}
