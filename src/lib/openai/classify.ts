import { z } from "zod";
import { getOpenAIClient, getOpenAIConfigFromEnv } from "./client";
import { INTAKE_CLASSIFIER_PROMPT } from "./prompts";

const intakeSchema = z.object({
  intent: z.string(),
  interestArea: z.string(),
  urgency: z.enum(["low", "medium", "high"]),
  leadershipPotential: z.string(),
  tags: z.array(z.string()).max(24),
});

export type IntakeClassification = z.infer<typeof intakeSchema>;

export async function classifyIntake(args: {
  formType: string;
  summaryText: string;
}): Promise<IntakeClassification | null> {
  if (!args.summaryText?.trim()) return null;

  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();

  const user = `Form type: ${args.formType}\n\nSubmission (redacted length ok):\n${args.summaryText.slice(0, 6000)}`;

  const res = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `${INTAKE_CLASSIFIER_PROMPT}\nReturn JSON with keys: intent, interestArea, urgency, leadershipPotential, tags.`,
      },
      { role: "user", content: user },
    ],
  });

  const raw = res.choices[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const r = intakeSchema.safeParse(parsed);
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}
