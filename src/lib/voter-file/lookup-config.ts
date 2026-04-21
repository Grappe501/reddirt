/**
 * **Official VoterView embedding:** Response headers on the state tool include
 * `X-Frame-Options: SAMEORIGIN`, so the lookup **cannot** be embedded in an iframe
 * on this campaign domain. Browsers will block it.
 *
 * **Pattern:** native Kelly “voter registration center” shell + clear handoff (new tab) to
 * the official URL, optional redirect interstitial, or postMessage is N/A.
 *
 * `NEXT_PUBLIC_VOTER_LOOKUP_UI_MODE` (optional):
 * - `handoff` (default) — our UI + “Continue to official registration lookup on Arkansas VoterView”
 * - `campaign_assist_only` — emphasize campaign file assistance; still link to official for legal confirmation
 */
export type VoterLookupUiMode = "handoff" | "campaign_assist_only";

export function getVoterLookupUiMode(): VoterLookupUiMode {
  const m = process.env.NEXT_PUBLIC_VOTER_LOOKUP_UI_MODE?.trim().toLowerCase();
  if (m === "campaign_assist_only") return "campaign_assist_only";
  return "handoff";
}

export function canEmbedOfficialArkansasVoterLookup(): false {
  return false;
}
