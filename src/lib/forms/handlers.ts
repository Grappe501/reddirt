import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { classifyIntake } from "@/lib/openai/classify";
import { isOpenAIConfigured } from "@/lib/openai/client";
import { isDatabaseConfigured } from "@/lib/env";
import { provisionVolunteerOpsSoloTeam } from "@/lib/volunteer-ops/provision-solo-team";
import { ASK_KELLY_CATEGORY_LABELS } from "@/content/ask-kelly-beta-public-copy";
import { sendVolunteerSignupOpsNotification } from "@/lib/campaign-ops/ops-notifications";
import { applyPublicFormConsent } from "@/lib/forms/public-form-consent";
import { recordPublicFormWorkflowAction } from "@/lib/forms/public-form-audit";
import { normalizeVolunteerInterests } from "@/lib/forms/volunteer-interest-taxonomy";
import type { AskKellyBetaFeedbackInput, FormSubmissionInput, VolunteerInput } from "./schemas";
import { TALENT_FOUNDRY_SOURCE } from "./schemas";

function buildSummary(data: FormSubmissionInput): string {
  switch (data.formType) {
    case "join_movement":
      return [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : "",
        data.zip ? `ZIP: ${data.zip}` : "",
        data.county ? `County: ${data.county}` : "",
        data.interests?.length ? `Interests: ${data.interests.join(", ")}` : "",
        data.message ? `Message: ${data.message}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "volunteer":
      return [
        `Name: ${data.firstName} ${data.lastName}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : "",
        data.zip ? `ZIP: ${data.zip}` : "",
        data.county ? `County: ${data.county}` : "",
        data.city ? `City: ${data.city}` : "",
        `Preferred role: ${data.preferredRole}`,
        `Preferred language: ${data.preferredLanguage}`,
        `Student: ${data.student ? "yes" : "no"}`,
        data.schoolCampus ? `School / campus: ${data.schoolCampus}` : "",
        `Discord invite interest: ${data.discordInterest ? "yes" : "no"}`,
        `Hosting interest: ${data.hostingInterest ? "yes" : "no"}`,
        `Fundraising interest: ${data.fundraisingInterest ? "yes" : "no"}`,
        `Leadership training interest: ${data.leadershipInterest ? "yes" : "no"}`,
        data.availability ? `Availability: ${data.availability}` : "",
        data.skills ? `Skills: ${data.skills}` : "",
        data.notes ? `Notes:\n${data.notes}` : "",
        data.interests?.length ? `Interest tokens: ${data.interests.join(", ")}` : "",
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
    case "ask_kelly_beta_feedback":
      return [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : "",
        `Category: ${ASK_KELLY_CATEGORY_LABELS[data.category]}`,
        data.pagePath ? `Page: ${data.pagePath}` : "",
        `Feedback:\n${data.feedback}`,
      ]
        .filter(Boolean)
        .join("\n");
    case "volunteer_kickoff":
      return [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone}`,
        `County: ${data.county}`,
        data.city ? `City: ${data.city}` : "",
        `Pathway: ${data.pathway}`,
        `Preferred contact: ${data.preferredContact}`,
        data.roles.length ? `Roles: ${data.roles.join(", ")}` : "",
        data.primaryTeam ? `Primary team: ${data.primaryTeam}` : "",
        data.secondaryTeam ? `Secondary team: ${data.secondaryTeam}` : "",
        data.availability ? `Availability: ${data.availability}` : "",
        data.skills ? `Skills: ${data.skills}` : "",
        `Can host: ${data.canHost ? "yes" : "no"}`,
        `Can recruit: ${data.canRecruit ? "yes" : "no"}`,
        `Willing to travel: ${data.willingToTravel ? "yes" : "no"}`,
        `Leadership interest: ${data.leadershipInterest ? "yes" : "no"}`,
        data.organizationName ? `Organization: ${data.organizationName}` : "",
        data.preferScope ? `Prefer scope: ${data.preferScope}` : "",
        data.enjoyDoing ? `Enjoys: ${data.enjoyDoing}` : "",
        data.youthIntent ? `Youth intent: ${data.youthIntent}` : "",
        data.eventId ? `Event interest: ${data.eventId}` : "",
        data.regions.length ? `Regions: ${data.regions.join(", ")}` : "",
        data.notes ? `Notes:\n${data.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    default: {
      const _n: never = data;
      return _n;
    }
  }
}

export type PersistResult = {
  submissionId: string;
  userId: string | null;
  workflowIntakeId: string;
  /** Present after solo volunteer team provisioning (`VolunteerOpsTeam`). */
  volunteerTeamSlug?: string | null;
};

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
    case "ask_kelly_beta_feedback":
      return "Ask Kelly beta";
    case "volunteer_kickoff":
      return "Volunteer kickoff";
  }
}

function publicFormIntakeTitle(data: FormSubmissionInput): string {
  if (data.formType === "ask_kelly_beta_feedback") {
    return `Ask Kelly (invite-only beta) — ${ASK_KELLY_CATEGORY_LABELS[data.category]}`;
  }
  if (data.formType === "volunteer_kickoff") {
    const team =
      data.primaryTeam ||
      data.roles[0] ||
      (data.pathway === "youth" ? "youth" : data.pathway === "match" ? "match" : data.pathway);
    const countyHint = sanitizePlainText(data.county, 80);
    return `Kickoff ${data.pathway} — ${team} — ${countyHint} County`;
  }
  const label = formTypeLabel(data.formType);
  const countyHint = "county" in data && data.county ? sanitizePlainText(data.county, 80) : null;
  if (countyHint) return `${label} public form - ${countyHint} County`;
  if ("zip" in data && data.zip) return `${label} public form - ZIP ${sanitizePlainText(data.zip, 12)}`;
  return `${label} public form`;
}

function buildAskKellyBetaMetadata(data: AskKellyBetaFeedbackInput): Prisma.InputJsonValue {
  return {
    askKelly: true,
    beta: true,
    owner: "Kelly",
    finalAuthority: "Kelly",
    category: data.category,
    pagePath: data.pagePath ?? null,
    source: "ask_kelly_beta",
    launchMode: "invite_only_beta",
    formType: "ask_kelly_beta_feedback",
    staffNote: "Surface and organize for Kelly. Final call rests with the candidate, not a staff approval step.",
  };
}

function publicFormIntakeMetadata(
  data: FormSubmissionInput,
  classification: Awaited<ReturnType<typeof classifyIntake>> | null,
) {
  if (data.formType === "ask_kelly_beta_feedback") {
    return buildAskKellyBetaMetadata(data) as object;
  }
  const baseMeta = {
    source: "public_form",
    formType: data.formType,
    county: "county" in data && data.county ? sanitizePlainText(data.county, 80) : null,
    zip: "zip" in data && data.zip ? sanitizePlainText(data.zip, 12) : null,
    interests:
      (data.formType === "join_movement" || data.formType === "volunteer") && data.interests?.length
        ? data.interests.map((interest) => sanitizePlainText(interest, 80)).slice(0, 20)
        : data.formType === "volunteer_kickoff"
          ? [
              `kickoff:${data.pathway}`,
              ...data.roles.map((r) => sanitizePlainText(r, 80)),
              ...(data.primaryTeam ? [sanitizePlainText(data.primaryTeam, 80)] : []),
            ].slice(0, 20)
          : [],
    sourcePage: "sourcePage" in data && data.sourcePage ? sanitizePlainText(data.sourcePage, 500) : null,
    sourceComponent: "sourceComponent" in data && data.sourceComponent ? sanitizePlainText(data.sourceComponent, 120) : null,
    sourceCampaign: "sourceCampaign" in data && data.sourceCampaign ? sanitizePlainText(data.sourceCampaign, 120) : null,
    referrerCode: "referrerCode" in data && data.referrerCode ? sanitizePlainText(data.referrerCode, 120) : null,
    leadershipInterest:
      data.formType === "volunteer" || data.formType === "volunteer_kickoff"
        ? data.leadershipInterest
        : null,
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

  if (data.formType === "volunteer") {
    return {
      ...baseMeta,
      preferredRole: data.preferredRole,
      preferredLanguage: data.preferredLanguage,
      city: data.city ? sanitizePlainText(data.city, 120) : null,
      student: data.student,
      schoolCampus: data.schoolCampus ? sanitizePlainText(data.schoolCampus, 200) : null,
      discordInterest: data.discordInterest,
      hostingInterest: data.hostingInterest,
      fundraisingInterest: data.fundraisingInterest,
      ...(data.talentFoundry
        ? { talentFoundry: capTalentFoundry(data.talentFoundry), sourceCampaign: TALENT_FOUNDRY_SOURCE }
        : {}),
    };
  }

  if (data.formType === "volunteer_kickoff") {
    const teamCategory =
      data.pathway === "youth"
        ? "youth_coalition"
        : data.pathway === "match"
          ? "needs_match"
          : data.primaryTeam || data.roles[0] || data.pathway;
    return {
      ...baseMeta,
      kickoff: true,
      pathway: data.pathway,
      teamCategory,
      roles: data.roles.map((r) => sanitizePlainText(r, 80)).slice(0, 20),
      primaryTeam: data.primaryTeam ? sanitizePlainText(data.primaryTeam, 80) : null,
      secondaryTeam: data.secondaryTeam ? sanitizePlainText(data.secondaryTeam, 80) : null,
      preferredContact: data.preferredContact,
      city: data.city ? sanitizePlainText(data.city, 120) : null,
      canHost: data.canHost,
      canRecruit: data.canRecruit,
      willingToTravel: data.willingToTravel,
      leadershipInterest: data.leadershipInterest,
      organizationName: data.organizationName ? sanitizePlainText(data.organizationName, 200) : null,
      preferScope: data.preferScope ?? null,
      youthIntent: data.youthIntent ?? null,
      eventId: data.eventId ? sanitizePlainText(data.eventId, 120) : null,
      regions: data.regions.map((r) => sanitizePlainText(r, 40)).slice(0, 8),
      queue: "volunteer_kickoff",
    };
  }

  return baseMeta;
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
      metadata: publicFormIntakeMetadata(input.data, input.classification) as Prisma.InputJsonValue,
    },
    select: { id: true },
  });
}

async function persistAskKellyBeta(data: AskKellyBetaFeedbackInput): Promise<PersistResult> {
  const email = data.email.toLowerCase().trim();
  const summary = buildSummary(data);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: sanitizePlainText(data.name, 120),
      phone: data.phone?.trim() || null,
      interests: [],
    },
    update: {
      name: sanitizePlainText(data.name, 120),
      phone: data.phone?.trim() || undefined,
    },
  });

  const sub = await prisma.submission.create({
    data: {
      userId: user.id,
      type: "ask_kelly_beta_feedback",
      content: sanitizePlainText(summary, 8000),
      structuredData: {
        formType: "ask_kelly_beta_feedback",
        askKelly: true,
        beta: true,
        owner: "Kelly",
        finalAuthority: "Kelly",
        category: data.category,
        pagePath: data.pagePath ?? null,
        source: "ask_kelly_beta",
        launchMode: "invite_only_beta",
      } as object,
    },
  });

  const intake = await prisma.workflowIntake.create({
    data: {
      submissionId: sub.id,
      status: "PENDING",
      title: `Ask Kelly (invite-only beta) — ${ASK_KELLY_CATEGORY_LABELS[data.category]}`,
      source: "ask_kelly_beta",
      metadata: buildAskKellyBetaMetadata(data),
    },
    select: { id: true },
  });

  return { submissionId: sub.id, userId: user.id, workflowIntakeId: intake.id, volunteerTeamSlug: null };
}

export async function persistFormSubmission(data: FormSubmissionInput): Promise<PersistResult> {
  let volunteerTeamSlugOut: string | null | undefined;

  if (data.formType === "ask_kelly_beta_feedback") {
    return persistAskKellyBeta(data);
  }
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
    return { submissionId: sub.id, userId: user.id, workflowIntakeId: intake.id, volunteerTeamSlug: null };
  }

  const email = data.email.toLowerCase().trim();

  const volunteerInterestTokens =
    data.formType === "volunteer"
      ? Array.from(
          new Set([
            ...normalizeVolunteerInterests([...(data.interests ?? []), data.preferredRole]).keys,
            `pref_role:${data.preferredRole}`,
            ...(data.talentFoundry ? [TALENT_FOUNDRY_SOURCE] : []),
          ]),
        )
      : [];

  const joinInterestTokens =
    data.formType === "join_movement" ? normalizeVolunteerInterests(data.interests).keys : [];

  const kickoffInterestTokens =
    data.formType === "volunteer_kickoff"
      ? Array.from(
          new Set([
            "volunteer_kickoff",
            `kickoff:${data.pathway}`,
            ...data.roles.map((r) => `kickoff_role:${r}`),
            ...(data.primaryTeam ? [`kickoff_team:${data.primaryTeam}`] : []),
            ...(data.pathway === "youth" ? ["youth_coalition"] : []),
          ]),
        )
      : [];

  const interests =
    data.formType === "join_movement"
      ? joinInterestTokens
      : data.formType === "volunteer"
        ? volunteerInterestTokens
        : data.formType === "volunteer_kickoff"
          ? kickoffInterestTokens
          : [];

  const displayName =
    data.formType === "volunteer"
      ? sanitizePlainText(`${data.firstName} ${data.lastName}`, 120)
      : sanitizePlainText(data.name, 120);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: displayName,
      phone: data.phone?.trim() || null,
      zip: "zip" in data && data.zip ? sanitizePlainText(data.zip, 12) : null,
      county:
        "county" in data && data.county
          ? sanitizePlainText(data.county, 80)
          : data.formType === "direct_democracy_commitment"
            ? sanitizePlainText(data.county, 80)
            : null,
      interests,
    },
    update: {
      name: displayName,
      phone: data.phone?.trim() || undefined,
      zip: "zip" in data && data.zip ? sanitizePlainText(data.zip, 12) : undefined,
      county:
        "county" in data && data.county
          ? sanitizePlainText(data.county, 80)
          : data.formType === "direct_democracy_commitment"
            ? sanitizePlainText(data.county, 80)
            : undefined,
      interests: interests.length ? interests : undefined,
    },
  });

  if (data.formType === "volunteer" && data.talentFoundry?.phase === "continue") {
    return persistTalentFoundryContinue(user.id, data);
  }

  if (data.formType === "volunteer") {
    const availabilityParts = [data.availability?.trim(), data.notes?.trim()].filter(Boolean) as string[];
    const availabilityJoined = availabilityParts.length
      ? sanitizePlainText(availabilityParts.join("\n\n"), 8000)
      : null;

    await prisma.volunteerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        availability: availabilityJoined,
        skills: data.skills ? sanitizePlainText(data.skills, 2000) : null,
        leadershipInterest: data.leadershipInterest,
      },
      update: {
        availability: availabilityJoined,
        skills: data.skills ? sanitizePlainText(data.skills, 2000) : null,
        leadershipInterest: data.leadershipInterest,
      },
    });
    await prisma.commitment.create({
      data: {
        userId: user.id,
        type: "volunteer",
        metadata: {
          source: "volunteer_form",
          preferredRole: data.preferredRole,
          preferredLanguage: data.preferredLanguage,
          city: data.city ?? null,
          student: data.student,
          schoolCampus: data.schoolCampus ?? null,
          discordInterest: data.discordInterest,
          hostingInterest: data.hostingInterest,
          fundraisingInterest: data.fundraisingInterest,
        } as object,
      },
    });

    volunteerTeamSlugOut = null;
    if (isDatabaseConfigured()) {
      try {
        const { teamSlug } = await provisionVolunteerOpsSoloTeam({
          userId: user.id,
          name: `${data.firstName} ${data.lastName}`.trim(),
          county: data.county,
          zip: data.zip,
          interests: volunteerInterestTokens,
        });
        volunteerTeamSlugOut = teamSlug;
      } catch (e) {
        console.error("provisionVolunteerOpsSoloTeam failed", e);
      }
    }
  }

  if (data.formType === "volunteer_kickoff") {
    const availabilityParts = [data.availability?.trim(), data.notes?.trim(), data.enjoyDoing?.trim()].filter(
      Boolean,
    ) as string[];
    const availabilityJoined = availabilityParts.length
      ? sanitizePlainText(availabilityParts.join("\n\n"), 8000)
      : null;

    await prisma.volunteerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        availability: availabilityJoined,
        skills: data.skills ? sanitizePlainText(data.skills, 2000) : null,
        leadershipInterest: data.leadershipInterest,
      },
      update: {
        availability: availabilityJoined,
        skills: data.skills ? sanitizePlainText(data.skills, 2000) : null,
        leadershipInterest: data.leadershipInterest,
      },
    });
    await prisma.commitment.create({
      data: {
        userId: user.id,
        type: "volunteer",
        metadata: {
          source: "volunteer_kickoff",
          pathway: data.pathway,
          roles: data.roles,
          primaryTeam: data.primaryTeam ?? null,
          secondaryTeam: data.secondaryTeam ?? null,
          canHost: data.canHost,
          canRecruit: data.canRecruit,
          willingToTravel: data.willingToTravel,
          youthIntent: data.youthIntent ?? null,
          eventId: data.eventId ?? null,
          regions: data.regions,
        } as object,
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
        : data.formType === "volunteer_kickoff"
          ? "volunteer_kickoff"
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
      : data.formType === "volunteer"
        ? {
            ...structuredBase,
            preferredRole: data.preferredRole,
            preferredLanguage: data.preferredLanguage,
            city: data.city ?? null,
            student: data.student,
            schoolCampus: data.schoolCampus ?? null,
            discordInterest: data.discordInterest,
            hostingInterest: data.hostingInterest,
            fundraisingInterest: data.fundraisingInterest,
            notes: data.notes ? sanitizePlainText(data.notes, 3000) : null,
            raw: redactPII(summary),
            ...(data.talentFoundry ? { talentFoundry: capTalentFoundry(data.talentFoundry) } : {}),
          }
        : data.formType === "volunteer_kickoff"
          ? {
              ...structuredBase,
              pathway: data.pathway,
              teamCategory:
                data.pathway === "youth"
                  ? "youth_coalition"
                  : data.pathway === "match"
                    ? "needs_match"
                    : data.primaryTeam || data.roles[0] || data.pathway,
              roles: data.roles,
              primaryTeam: data.primaryTeam ?? null,
              secondaryTeam: data.secondaryTeam ?? null,
              city: data.city ?? null,
              canHost: data.canHost,
              canRecruit: data.canRecruit,
              willingToTravel: data.willingToTravel,
              leadershipInterest: data.leadershipInterest,
              youthIntent: data.youthIntent ?? null,
              eventId: data.eventId ?? null,
              regions: data.regions,
              notes: data.notes ? sanitizePlainText(data.notes, 3000) : null,
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

  if (data.formType === "join_movement" || data.formType === "volunteer" || data.formType === "volunteer_kickoff") {
    const interestKeys =
      data.formType === "volunteer"
        ? normalizeVolunteerInterests([...(data.interests ?? []), data.preferredRole]).keys
        : data.formType === "volunteer_kickoff"
          ? kickoffInterestTokens
          : normalizeVolunteerInterests(data.interests).keys;

    let consentSummary = null as Awaited<ReturnType<typeof applyPublicFormConsent>> | null;
    try {
      consentSummary = await applyPublicFormConsent({
        userId: user.id,
        consent: {
          formType: data.formType,
          consentEmail: data.consentEmail,
          consentSms: data.consentSms,
          consentPhone: data.consentPhone,
          phone: data.phone,
          sourcePage: data.sourcePage,
        },
      });
    } catch (e) {
      console.error("[handlers] public form consent write failed", e);
    }

    try {
      await recordPublicFormWorkflowAction({
        workflowIntakeId: intake.id,
        formType: data.formType,
        sourcePage: data.sourcePage,
        sourceComponent: data.sourceComponent,
        sourceCampaign: data.sourceCampaign,
        interestKeys,
        consentSummary,
        result: "created",
      });
    } catch (e) {
      console.error("[handlers] public form workflow action failed", e);
    }
  }

  if (data.formType === "volunteer") {
    void sendVolunteerSignupOpsNotification({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? "",
      zip: data.zip ?? "",
      county: data.county,
      city: data.city,
      preferredRole: data.preferredRole,
      preferredLanguage: data.preferredLanguage,
      student: data.student,
      schoolCampus: data.schoolCampus,
      discordInterest: data.discordInterest,
      hostingInterest: data.hostingInterest,
      fundraisingInterest: data.fundraisingInterest,
      leadershipInterest: data.leadershipInterest,
      interests: data.interests ?? [],
      notes: data.notes,
      availability: data.availability,
      skills: data.skills,
      submissionId: sub.id,
      workflowIntakeId: intake.id,
      volunteerTeamSlug: volunteerTeamSlugOut ?? null,
    }).catch((err) => console.error("[handlers] volunteer ops notification failed", err));
  }

  return { submissionId: sub.id, userId: user.id, workflowIntakeId: intake.id, volunteerTeamSlug: volunteerTeamSlugOut ?? null };
}

function redactPII(text: string): string {
  return text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]");
}

function capTalentFoundry(value: unknown): Prisma.InputJsonValue {
  const raw = JSON.stringify(value ?? {});
  if (raw.length <= 24_000) return JSON.parse(raw) as Prisma.InputJsonValue;
  return {
    v: 1,
    source: TALENT_FOUNDRY_SOURCE,
    truncated: true,
  };
}

async function persistTalentFoundryContinue(userId: string, data: VolunteerInput): Promise<PersistResult> {
  const submissionId = data.talentFoundry?.submissionId?.trim();
  if (!submissionId) {
    throw new Error("talent_foundry_continue_missing_submission");
  }

  const existing = await prisma.submission.findFirst({
    where: { id: submissionId, userId },
    include: { workflowIntake: { select: { id: true, metadata: true } } },
  });
  if (!existing) {
    throw new Error("talent_foundry_continue_not_found");
  }

  const prior =
    existing.structuredData && typeof existing.structuredData === "object" && !Array.isArray(existing.structuredData)
      ? (existing.structuredData as Record<string, unknown>)
      : {};
  const priorTf =
    prior.talentFoundry && typeof prior.talentFoundry === "object" && !Array.isArray(prior.talentFoundry)
      ? (prior.talentFoundry as Record<string, unknown>)
      : {};

  const availabilityParts = [data.availability?.trim(), data.notes?.trim()].filter(Boolean) as string[];
  const availabilityJoined = availabilityParts.length
    ? sanitizePlainText(availabilityParts.join("\n\n"), 8000)
    : null;

  await prisma.volunteerProfile.upsert({
    where: { userId },
    create: {
      userId,
      availability: availabilityJoined,
      skills: data.skills ? sanitizePlainText(data.skills, 2000) : null,
      leadershipInterest: data.leadershipInterest,
    },
    update: {
      availability: availabilityJoined ?? undefined,
      skills: data.skills ? sanitizePlainText(data.skills, 2000) : undefined,
      leadershipInterest: data.leadershipInterest,
    },
  });

  const mergedTf = capTalentFoundry({
    ...priorTf,
    ...data.talentFoundry,
    source: TALENT_FOUNDRY_SOURCE,
    phase: "continue",
  });

  await prisma.submission.update({
    where: { id: existing.id },
    data: {
      structuredData: {
        ...prior,
        talentFoundry: mergedTf,
        preferredRole: data.preferredRole,
        notes: data.notes ? sanitizePlainText(data.notes, 3000) : prior.notes ?? null,
      } as object,
    },
  });

  if (existing.workflowIntake) {
    const meta =
      existing.workflowIntake.metadata &&
      typeof existing.workflowIntake.metadata === "object" &&
      !Array.isArray(existing.workflowIntake.metadata)
        ? (existing.workflowIntake.metadata as Record<string, unknown>)
        : {};
    await prisma.workflowIntake.update({
      where: { id: existing.workflowIntake.id },
      data: {
        metadata: {
          ...meta,
          talentFoundry: mergedTf,
          sourceCampaign: TALENT_FOUNDRY_SOURCE,
        } as Prisma.InputJsonValue,
      },
    });
  }

  return {
    submissionId: existing.id,
    userId,
    workflowIntakeId: existing.workflowIntake?.id ?? "",
    volunteerTeamSlug: null,
  };
}
