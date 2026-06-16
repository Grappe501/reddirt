import { getOpenAIClient, isOpenAIConfigured } from "@/lib/openai/client";
import type { ElectionPlanSearchHit } from "@/lib/election-plan/load-election-plan-search";

export async function buildElectionPlanSearchAiAnswer(
  query: string,
  hits: ElectionPlanSearchHit[],
): Promise<{ answer: string; enabled: boolean } | null> {
  if (!isOpenAIConfigured() || hits.length === 0) return null;

  const context = hits
    .slice(0, 8)
    .map((h, i) => {
      const publicUrl =
        "sourcePublicUrl" in h && typeof (h as { sourcePublicUrl?: string }).sourcePublicUrl === "string"
          ? (h as { sourcePublicUrl?: string }).sourcePublicUrl
          : null;
      return `[${i + 1}] title=${h.title}\nhref=${h.href}\ntype=${h.type}\nsourcePath=${h.sourcePath}${publicUrl ? `\npublicSourceUrl=${publicUrl}` : ""}\nexcerpt=${h.excerpt}\nconfidence=${h.confidence}`;
    })
    .join("\n\n");

  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You answer Election Plan search queries using ONLY the provided local sources. Cite href, sourcePath, and publicSourceUrl when present. County party meeting dates from ArkDems are CANDIDATES until a human confirms by phone — say 'Needs human verification' when dates or chairs are uncertain. Never invent data. Never reference admin, donor, or voter files.",
      },
      {
        role: "user",
        content: `Query: ${query}\n\nSources:\n${context}`,
      },
    ],
  });

  const answer = completion.choices[0]?.message?.content?.trim();
  if (!answer) return null;
  return { answer, enabled: true };
}
