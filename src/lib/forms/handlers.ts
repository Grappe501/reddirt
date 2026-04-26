import { prisma } from "@/lib/db";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { classifyIntake } from "@/lib/openai/classify";
import { isOpenAIConfigured } from "@/lib/openai/client";
import type { FormSubmissionInput } from "./schemas";

function buildSummary(data: FormSubmissionInput): string {
  switch (data.formType) {
    case "join_movement":
      return [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : "",
        `ZIP: ${data.zip}`,
        data.county ? `County: ${data.county}` : "",
        data.interests?.length ? `Interests: ${data.interests.join(", ")}` : "",
        data.message ? `Message: ${data.message}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "volunteer":
      return [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : "",
        `ZIP: ${data.zip}`,
        data.county ? `County: ${data.county}` : "",
        data.availability ? `Availability: ${data.availability}` : "",
        data.skills ? `Skills: ${data.skills}` : "",
        `Leadership interest: ${data.leadershipInterest ? "yes" : "no"}`,
        data.interests?.length ? `Interests: ${data.interests.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "local_team":
      return [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : "",
        `ZIP: ${data.zip}`,
        data.county ? `County: ${data.county}` : "",
        `Community: ${data.community}`,
        data.teamGoal ? `Goal: ${data.teamGoal}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "direct_democracy_commitment":
      return [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : "",
        `ZIP: ${data.zip}`,
        `County: ${data.county}`,
        `Referendum opt-in: ${data.referendumOptIn ? "yes" : "no"}`,
        `SMS opt-in: ${data.smsOptIn ? "yes" : "no"}`,
      ].join("\n");
    case "story_submission":
      return [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : "",
        data.county ? `County: ${data.county}` : "",
        `Title: ${data.title}`,
        `Story: ${data.story}`,
      ].join("\n");
    case "host_gathering":
      return [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : "",
        `ZIP: ${data.zip}`,
        data.county ? `County: ${data.county}` : "",
        `Community: ${data.community}`,
        `Gathering type: ${data.gatheringType}${data.gatheringType === "other" && data.gatheringTypeOther ? ` (${data.gatheringTypeOther})` : ""}`,
        data.preferredTiming ? `Preferred timing: ${data.preferredTiming}` : "",
        data.expectedGuests ? `Expected guests: ${data.expectedGuests}` : "",
        data.needs ? `Support needed: ${data.needs}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    default:
      return "";
  }
}

export type PersistResult = { submissionId: string; userId: string | null; workflowIntakeId: string };

function formTypeLabel(formType: FormSubmissionInput["formType"]): string {
  switch (formType) {
    case "join_movement":
      return "Join movement";
    case "volunteer":
      return "Volunteer";
    case "local_team":
      return "Local team";
    case "direct_democracy_commitment":
      return "Direct democracy commitment";
    case "story_submission":
      return "Story submission";
    case "host_gathering":
      return "Host gathering";
  }
}

function publicFormIntakeTitle(data: FormSubmissionInput): string {
  const label = formTypeLabel(data.formType);
  const countyHint = "county" in data && data.county ? sanitizePlainText(data.county, 80) : null;
  if (countyHint) return `${label} public form - ${countyHint} County`;
  if ("zip" in data && data.zip) return `${label} public form - ZIP ${sanitizePlainText(data.zip, 12)}`;
  return `${label} public form`;
}

function publicFormIntakeMetadata(
  data: FormSubmissionInput,
  classification: Awaited<ReturnType<typeof classifyIntake>> | null,
) {
  return {
    source: "public_form",
    formType: data.formType,
    county: "county" in data && data.county ? sanitizePlainText(data.county, 80) : null,
    zip: "zip" in data ? sanitizePlainText(data.zip, 12) : null,
    interests:
      (data.formType === "join_movement" || data.formType === "volunteer") && data.interests?.length
        ? data.interests.map((interest) => sanitizePlainText(interest, 80)).slice(0, 20)
        : [],
    leadershipInterest: data.formType === "volunteer" ? data.leadershipInterest : null,
    hostGatheringType: data.formType === "host_gathering" ? data.gatheringType : null,
    listeningSessionHostInterest: data.formType === "host_gathering" ? data.gatheringType === "listening_session" : null,
    storyConsentPublic: data.formType === "story_submission" ? data.consentPublic : null,
    ai: classification
      ? {
          intent: classification.intent,
          interestArea: classification.interestArea,
          urgency: classification.urgency,
          leadershipPotential: classification.leadershipPotential,
          tags: classification.tags,
        }
      : null,
  };
}

async function createWorkflowIntakeForSubmission(input: {
  submissionId: string;
  data: FormSubmissionInput;
  classification: Awaited<ReturnType<typeof classifyIntake>> | null;
}) {
  return prisma.workflowIntake.create({
    data: {
      submissionId: input.submissionId,
      status: "PENDING",
      title: publicFormIntakeTitle(input.data),
      source: input.data.formType,
      metadata: publicFormIntakeMetadata(input.data, input.classification),
    },
    select: { id: true },
  });
}

export async function persistFormSubmission(data: FormSubmissionInput): Promise<PersistResult> {
  const summary = buildSummary(data);
  let classification = null as Awaited<ReturnType<typeof classifyIntake>> | null;
  if (isOpenAIConfigured()) {
    try {
      classification = await classifyIntake({ formType: data.formType, summaryText: summary });
    } catch {
      classification = null;
    }
  }

  const structuredBase = classification
    ? { ai: classification, formType: data.formType }
    : { formType: data.formType };

  if (data.formType === "story_submission") {
    const storyBody = sanitizePlainText(data.story, 12000);
    const title = sanitizePlainText(data.title, 200);
    const email = data.email.toLowerCase().trim();
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: sanitizePlainText(data.name, 120),
        phone: data.phone?.trim() || null,
        county: data.county ? sanitizePlainText(data.county, 80) : null,
        interests: ["story_submission"],
      },
      update: {
        name: sanitizePlainText(data.name, 120),
        phone: data.phone?.trim() || undefined,
        county: data.county ? sanitizePlainText(data.county, 80) : undefined,
      },
    });

    const sub = await prisma.submission.create({
      data: {
        userId: user.id,
        type: "story",
        content: `${title}\n\n${storyBody}`,
        structuredData: {
          ...structuredBase,
          title,
          consentPublic: data.consentPublic,
        } as object,
      },
    });
    const intake = await createWorkflowIntakeForSubmission({ submissionId: sub.id, data, classification });
    return { submissionId: sub.id, userId: user.id, workflowIntakeId: intake.id };
  }

  const email = data.email.toLowerCase().trim();
  const interests =
    data.formType === "join_movement" || data.formType === "volunteer"
      ? data.interests ?? []
      : [];

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: sanitizePlainText(data.name, 120),
      phone: data.phone?.trim() || null,
      zip: "zip" in data ? sanitizePlainText(data.zip, 12) : null,
      county:
        "county" in data && data.county
          ? sanitizePlainText(data.county, 80)
          : data.formType === "direct_democracy_commitment"
            ? sanitizePlainText(data.county, 80)
            : null,
      interests,
    },
    update: {
      name: sanitizePlainText(data.name, 120),
      phone: data.phone?.trim() || undefined,
      zip: "zip" in data ? sanitizePlainText(data.zip, 12) : undefined,
      county:
        "county" in data && data.county
          ? sanitizePlainText(data.county, 80)
          : data.formType === "direct_democracy_commitment"
            ? sanitizePlainText(data.county, 80)
            : undefined,
      interests: interests.length ? interests : undefined,
    },
  });

  if (data.formType === "volunteer") {
    await prisma.volunteerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        availability: data.availability ? sanitizePlainText(data.availability, 500) : null,
        skills: data.skills ? sanitizePlainText(data.skills, 2000) : null,
        leadershipInterest: data.leadershipInterest,
      },
      update: {
        availability: data.availability ? sanitizePlainText(data.availability, 500) : null,
        skills: data.skills ? sanitizePlainText(data.skills, 2000) : null,
        leadershipInterest: data.leadershipInterest,
      },
    });
    await prisma.commitment.create({
      data: {
        userId: user.id,
        type: "volunteer",
        metadata: { source: "volunteer_form" } as object,
      },
    });
  }

  if (data.formType === "direct_democracy_commitment") {
    await prisma.commitment.create({
      data: {
        userId: user.id,
        type: "referendum",
        metadata: {
          referendumOptIn: data.referendumOptIn,
          smsOptIn: data.smsOptIn,
        } as object,
      },
    });
  }

  const submissionType =
    data.formType === "join_movement"
      ? "join_movement"
      : data.formType === "volunteer"
        ? "volunteer"
        : data.formType === "local_team"
          ? "local_team"
          : data.formType === "direct_democracy_commitment"
            ? "direct_democracy_commitment"
            : data.formType === "host_gathering"
              ? "host_gathering"
              : "contact";

  const content = sanitizePlainText(summary, 8000);

  // When `listeningSessionHostInterest` is true, workbench can filter for tour planning; future WorkflowTemplate
  // `listening_session_town_plan` (see `src/lib/campaign-ops/listening-session-host-workflow.ts`) can attach task packs.
  const submissionStructured =
    data.formType === "host_gathering"
      ? {
          ...structuredBase,
          gatheringType: data.gatheringType,
          listeningSessionHostInterest: data.gatheringType === "listening_session",
          raw: redactPII(summary),
        }
      : { ...structuredBase, raw: redactPII(summary) };

  const sub = await prisma.submission.create({
    data: {
      userId: user.id,
      type: submissionType,
      content,
      structuredData: submissionStructured as object,
    },
  });

  const intake = await createWorkflowIntakeForSubmission({ submissionId: sub.id, data, classification });

  return { submissionId: sub.id, userId: user.id, workflowIntakeId: intake.id };
}

function redactPII(text: string): string {
  return text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]");
}
