/**
 * AES-256-GCM seal for OAuth token payloads stored server-side only.
 * Key material must live in `GMAIL_TOKEN_ENCRYPTION_KEY` (environment only — never commit values).
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const KEY_LEN = 32;

function deriveKey(secretMaterial: string): Buffer {
  return createHash("sha256").update(secretMaterial, "utf8").digest();
}

export function getGmailTokenEncryptionKey(): string | undefined {
  const k = process.env.GMAIL_TOKEN_ENCRYPTION_KEY?.trim();
  return k || undefined;
}

/**
 * Returns true when new Gmail OAuth connections may persist tokens encrypted at rest.
 */
export function isGmailTokenEncryptionConfigured(): boolean {
  return Boolean(getGmailTokenEncryptionKey());
}

export function sealGmailTokenPayload(tokensJson: string): {
  ciphertextB64: string;
  ivB64: string;
  authTagB64: string;
} {
  const secret = getGmailTokenEncryptionKey();
  if (!secret) {
    throw new Error("GMAIL_TOKEN_ENCRYPTION_KEY is required to store Gmail tokens (set in environment only).");
  }
  const key = deriveKey(secret);
  if (key.length !== KEY_LEN) {
    throw new Error("Derived key length invalid.");
  }
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(tokensJson, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertextB64: enc.toString("base64"),
    ivB64: iv.toString("base64"),
    authTagB64: authTag.toString("base64"),
  };
}

export function openGmailTokenPayload(sealed: {
  ciphertextB64: string;
  ivB64: string;
  authTagB64: string;
}): string {
  const secret = getGmailTokenEncryptionKey();
  if (!secret) {
    throw new Error("GMAIL_TOKEN_ENCRYPTION_KEY is required to read stored Gmail tokens.");
  }
  const key = deriveKey(secret);
  const iv = Buffer.from(sealed.ivB64, "base64");
  const authTag = Buffer.from(sealed.authTagB64, "base64");
  const ciphertext = Buffer.from(sealed.ciphertextB64, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
