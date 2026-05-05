/**
 * Gmail `users.watch` / Pub/Sub scaffolding — env **names** only for UI; never log values.
 */

import {
  getGmailPubSubTopicEnv,
  isGmailPubSubTopicConfigured,
} from "@/lib/gmail/config";

const TOPIC_ENV = "GOOGLE_PUBSUB_TOPIC";
const TOKEN_ENVS = ["GMAIL_PUBSUB_VERIFICATION_TOKEN", "GOOGLE_PUBSUB_VERIFICATION_TOKEN"] as const;
const LABEL_IDS_ENV = "GMAIL_WATCH_LABEL_IDS";
const RENEWAL_DAYS_ENV = "GMAIL_WATCH_RENEWAL_DAYS";

export function getGmailPubSubVerificationTokenFromEnv(): string {
  return (
    process.env.GMAIL_PUBSUB_VERIFICATION_TOKEN?.trim() ||
    process.env.GOOGLE_PUBSUB_VERIFICATION_TOKEN?.trim() ||
    ""
  );
}

export function isGmailPubSubVerificationConfigured(): boolean {
  return Boolean(getGmailPubSubVerificationTokenFromEnv());
}

/** Minimum for calling `users.watch` server-side: full Pub/Sub topic resource name in env. */
export function isGmailWatchConfigured(): boolean {
  return isGmailPubSubTopicConfigured();
}

export type GmailWatchConfigStatus = {
  topicEnvVarName: typeof TOPIC_ENV;
  topicConfigured: boolean;
  /** Env names only — which token var is considered “primary” when parsing (first non-empty wins). */
  verificationTokenEnvVarName: (typeof TOKEN_ENVS)[number] | null;
  verificationTokenConfigured: boolean;
  labelIdsEnvVarName: typeof LABEL_IDS_ENV;
  labelIdsEnvPresent: boolean;
  renewalEnvVarName: typeof RENEWAL_DAYS_ENV;
  /** Recommended renewal interval in days (Google allows ~7d max per watch; daily renewal is recommended). */
  renewalPolicyDays: number;
};

/**
 * Full topic name for Gmail API `topicName` (e.g. `projects/x/topics/y`). Server-only; do not send to client.
 */
export function getGmailPubSubTopicName(): string {
  return getGmailPubSubTopicEnv();
}

export function getGmailWatchRenewalPolicy(): { recommendedIntervalDays: number; maxWatchLifetimeDays: number } {
  const raw = process.env.GMAIL_WATCH_RENEWAL_DAYS?.trim();
  const n = raw ? Number(raw) : 1;
  const recommendedIntervalDays = Number.isFinite(n) && n >= 1 && n <= 7 ? Math.floor(n) : 1;
  return { recommendedIntervalDays, maxWatchLifetimeDays: 7 };
}

export function getGmailWatchLabelIds(): string[] {
  const raw = process.env.GMAIL_WATCH_LABEL_IDS?.trim();
  if (!raw) return ["INBOX"];
  const parts = raw
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : ["INBOX"];
}

export function getGmailWatchConfigStatus(): GmailWatchConfigStatus {
  const token = getGmailPubSubVerificationTokenFromEnv();
  const tokenFrom =
    process.env.GMAIL_PUBSUB_VERIFICATION_TOKEN?.trim()
      ? TOKEN_ENVS[0]
      : process.env.GOOGLE_PUBSUB_VERIFICATION_TOKEN?.trim()
        ? TOKEN_ENVS[1]
        : null;
  const policy = getGmailWatchRenewalPolicy();
  const labelsRaw = process.env.GMAIL_WATCH_LABEL_IDS?.trim();
  return {
    topicEnvVarName: TOPIC_ENV,
    topicConfigured: isGmailPubSubTopicConfigured(),
    verificationTokenEnvVarName: token ? tokenFrom : null,
    verificationTokenConfigured: Boolean(token),
    labelIdsEnvVarName: LABEL_IDS_ENV,
    labelIdsEnvPresent: Boolean(labelsRaw),
    renewalEnvVarName: RENEWAL_DAYS_ENV,
    renewalPolicyDays: policy.recommendedIntervalDays,
  };
}
