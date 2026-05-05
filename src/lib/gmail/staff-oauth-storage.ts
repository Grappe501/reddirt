import type { Credentials } from "google-auth-library";
import { sealGmailTokenPayload, openGmailTokenPayload } from "./token-crypto";
import { getRequestedGmailScopes } from "@/lib/gmail/config";

export const STAFF_GMAIL_OAUTH_FORMAT_V2 = 2 as const;

export type StaffGmailSealedOAuthV2 = {
  formatVersion: typeof STAFF_GMAIL_OAUTH_FORMAT_V2;
  sealed: {
    ciphertextB64: string;
    ivB64: string;
    authTagB64: string;
  };
  meta: {
    scopes: readonly string[];
    connectedAtIso: string;
    accessTokenExpiresAtIso: string | null;
    hasRefreshToken: boolean;
  };
};

export function isStaffGmailSealedV2(json: unknown): json is StaffGmailSealedOAuthV2 {
  if (!json || typeof json !== "object") return false;
  const o = json as Record<string, unknown>;
  return o.formatVersion === STAFF_GMAIL_OAUTH_FORMAT_V2 && "sealed" in o && "meta" in o;
}

/** Legacy: raw Google `Credentials` JSON at root of `oauthJson`. */
export function isLegacyPlainOauthJson(json: unknown): json is Credentials {
  if (!json || typeof json !== "object") return false;
  const o = json as Record<string, unknown>;
  return "formatVersion" in o ? false : "refresh_token" in o || "access_token" in o;
}

export function buildStaffGmailSealedRecord(tokens: Credentials): StaffGmailSealedOAuthV2 {
  const scopes = getRequestedGmailScopes();
  const accessTokenExpiresAtIso =
    typeof tokens.expiry_date === "number" ? new Date(tokens.expiry_date).toISOString() : null;
  const plain = JSON.stringify(tokens);
  const sealed = sealGmailTokenPayload(plain);
  return {
    formatVersion: STAFF_GMAIL_OAUTH_FORMAT_V2,
    sealed,
    meta: {
      scopes: [...scopes],
      connectedAtIso: new Date().toISOString(),
      accessTokenExpiresAtIso,
      hasRefreshToken: Boolean(tokens.refresh_token),
    },
  };
}

export function extractCredentialsFromStaffOauthJson(oauthJson: unknown): Credentials | null {
  if (isStaffGmailSealedV2(oauthJson)) {
    try {
      const json = openGmailTokenPayload(oauthJson.sealed);
      return JSON.parse(json) as Credentials;
    } catch {
      return null;
    }
  }
  if (isLegacyPlainOauthJson(oauthJson)) {
    return oauthJson;
  }
  return null;
}
