/**
 * Future: person-facing **campaign assistance** lookup (search by name + DOB + county, etc.)
 * against `VoterRecord` + latest `VoterFileSnapshot`.
 *
 * - Must be labeled as **not** official confirmation; always offer VoterView link.
 * - OpenAI may power **UX copy and next steps only** — never the source row match.
 * - Implement as a server action or API route with rate limits and audit logs.
 */
export type CampaignAssistLookupInput = {
  countyFips: string;
  lastName: string;
  firstName: string;
  dateOfBirth: string;
};

export async function campaignAssistLookupStub(_input: CampaignAssistLookupInput): Promise<never> {
  throw new Error("Campaign assistance lookup is not enabled in this build.");
}
