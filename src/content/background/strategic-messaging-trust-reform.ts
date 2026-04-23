import type { DocChunk } from "../../lib/content/parse";

const MAX = 12_000;

function cap(text: string): string {
  const t = text.trim();
  if (t.length <= MAX) return t;
  return `${t.slice(0, MAX)}…`;
}

/**
 * Internal campaign briefing: research-backed framing on distrust, economic inequality, contrast with Trump/MAGA,
 * and a people-first reform agenda. Ingested for assistant + site search (`npm run ingest`).
 * Search `path` uses `brief:` prefix — UI resolves to /resources (no standalone page).
 */
export function loadStrategicMessagingTrustReformChunks(): DocChunk[] {
  const content = [
    "# Background: distrust, dignity, and reform",
    "",
    "## Research context",
    "New research aligns with decades of political science: deep and growing distrust in the political system, especially among working-class Americans. Many voters believe the system is rigged for a wealthy elite, leaving them disrespected, unheard, and behind.",
    "",
    "Donald Trump has exploited this distrust by casting himself as a champion of the forgotten; his record is framed here as enriching himself and billionaire allies while delivering little for the people he claims to represent.",
    "",
    "Strategic implication: Democrats should reclaim dignity, respect, and real reform.",
    "",
    "## Strategic messaging formula",
    "",
    "### 1. Acknowledge the system has failed",
    "Publicly recognize the system has let too many people down, including valid frustration and anger.",
    "",
    "### 2. Speak the hard truth about economic inequality",
    "Make clear the system has overwhelmingly benefited a small wealthy cadre at the expense of average Americans (issue competition and salience theory).",
    "",
    "### 3. Center the message on respect",
    "Commit to restoring respect and dignity through concrete policy and systemic reform—not empty slogans.",
    "",
    "### 4. Contrast with Trump without shaming his voters",
    "Call out Trump for lying to working-class Americans—promising to fight for them, then betraying them for his own enrichment.",
    "",
    "Suggested line: “There’s no shame in believing someone who promised to fight for you. But we’ve seen his true agenda — and it’s not about you.”",
    "",
    "### 5. Offer an off-ramp from MAGA",
    "Give voters permission to walk away without shame.",
    "",
    "Suggested line: “Millions believed in him because they wanted to be heard. That trust was misused. It’s not your fault — but now you have a choice.”",
    "",
    "### 6. Go on the offensive against Trump and MAGA",
    "Frame MAGA as false respect while centralizing power and enriching the few.",
    "",
    "Suggested line: “Trump isn't fighting for your pride — he’s using your pain to build his empire.”",
    "",
    "### 7. Lay out a real plan for change",
    "More than rhetoric—a bold reform agenda: electoral reform to empower voters; tax fairness; public education and job creation; policies that help Americans leave a legacy, not just a paycheck.",
    "",
    "### 8. Defend popular programs",
    "Protect and expand Social Security, Medicare, public schools—as pillars of shared prosperity.",
    "",
    "## Conclusion",
    "A politics rooted in truth, humility, and bold reform. Acknowledge real pain, offer genuine respect, deliver a clear people-first agenda—a pathway to rebuild trust and align democracy around dignity and justice for all.",
  ].join("\n");

  return [
    {
      path: "brief:/strategic-messaging-trust-reform",
      title: "Campaign briefing — trust, dignity, and reform (messaging)",
      chunkIndex: 0,
      content: cap(content),
    },
  ];
}
