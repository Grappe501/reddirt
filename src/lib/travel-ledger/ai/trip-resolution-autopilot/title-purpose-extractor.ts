import type { PurposeExtraction } from "./autopilot-types";
import type { TitleCityMatch } from "./autopilot-types";

export function extractTitlePurpose(title: string, cityMatch?: TitleCityMatch): PurposeExtraction {
  const lower = title.toLowerCase();
  const cityPhrase = cityMatch?.city ? ` to ${cityMatch.city}, ${cityMatch.state ?? "AR"}` : "";

  if (/\b(rotary|kiwanis|lions club)\b/i.test(title)) {
    return {
      businessPurpose: `Campaign travel${cityPhrase} for Rotary lunch.`,
      classification: "rotary",
      confidence: "high",
      needsHumanEdit: false,
    };
  }

  if (/\bhouse part(y|ies)\b/i.test(title)) {
    return {
      businessPurpose: `Campaign travel${cityPhrase} for campaign house ${lower.includes("parties") ? "parties" : "party"}.`,
      classification: "house_party",
      confidence: "high",
      needsHumanEdit: false,
    };
  }

  if (/\bdems?\b|\bdemocrats?\b|\bcounty party\b/i.test(title)) {
    return {
      businessPurpose: `Campaign travel${cityPhrase} to attend Democratic party meeting.`,
      classification: "county_party",
      confidence: cityMatch?.city ? "medium" : "low",
      needsHumanEdit: !cityMatch?.city,
    };
  }

  if (/\bfest(ival)?\b|\bfair\b/i.test(title)) {
    return {
      businessPurpose: `Campaign travel${cityPhrase} for community festival outreach.`,
      classification: "festival",
      confidence: cityMatch?.city ? "medium" : "low",
      needsHumanEdit: true,
    };
  }

  if (/\bfundraiser|reception|donor\b/i.test(title)) {
    return {
      businessPurpose: `Campaign travel${cityPhrase} for campaign fundraising event.`,
      classification: "fundraiser",
      confidence: cityMatch?.city ? "medium" : "low",
      needsHumanEdit: true,
    };
  }

  if (/\bzoom|virtual|webinar|call\b/i.test(title)) {
    return {
      businessPurpose: "Virtual campaign event; no reimbursable travel unless human override says otherwise.",
      classification: "virtual",
      confidence: "high",
      needsHumanEdit: false,
    };
  }

  if (/\bhospital|personal|doctor|medical\b/i.test(title)) {
    return {
      businessPurpose: "Personal or administrative calendar item; confirm before reimbursement.",
      classification: "personal",
      confidence: "medium",
      needsHumanEdit: true,
    };
  }

  return {
    businessPurpose: cityMatch?.city ? `Campaign travel${cityPhrase} for campaign event.` : "Campaign event pending purpose review.",
    classification: cityMatch?.city ? "campaign_meeting" : "unknown",
    confidence: cityMatch?.city ? "medium" : "low",
    needsHumanEdit: true,
  };
}

