/**
 * AES-256-GCM seal for YouTube OAuth token payloads (server-side only).
 * Key: YOUTUBE_TOKEN_ENCRYPTION_KEY, or GMAIL_TOKEN_ENCRYPTION_KEY as fallback for local ops.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const KEY_LEN = 32;

function deriveKey(secretMaterial: string): Buffer {
  return createHash("sha256").update(secretMaterial, "utf8").digest();
}

export function getYouTubeTokenEncryptionKey(): string | undefined {
  const k =
    process.env.YOUTUBE_TOKEN_ENCRYPTION_KEY?.trim() ||
    process.env.GMAIL_TOKEN_ENCRYPTION_KEY?.trim();
  return k || undefined;
}

export function isYouTubeTokenEncryptionConfigured(): boolean {
  return Boolean(getYouTubeTokenEncryptionKey());
}

export function sealYouTubeTokenPayload(tokensJson: string): {
  ciphertextB64: string;
  ivB64: string;
  authTagB64: string;
} {
  const secret = getYouTubeTokenEncryptionKey();
  if (!secret) {
    throw new Error(
      "YOUTUBE_TOKEN_ENCRYPTION_KEY (or GMAIL_TOKEN_ENCRYPTION_KEY) is required to store YouTube tokens.",
    );
  }
  const key = deriveKey(secret);
  if (key.length !== KEY_LEN) throw new Error("Derived key length invalid.");
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(tokensJson, "utf8"), cipher.final()]);
  return {
    ciphertextB64: enc.toString("base64"),
    ivB64: iv.toString("base64"),
    authTagB64: cipher.getAuthTag().toString("base64"),
  };
}

export function openYouTubeTokenPayload(sealed: {
  ciphertextB64: string;
  ivB64: string;
  authTagB64: string;
}): string {
  const secret = getYouTubeTokenEncryptionKey();
  if (!secret) {
    throw new Error("YOUTUBE_TOKEN_ENCRYPTION_KEY (or GMAIL_TOKEN_ENCRYPTION_KEY) is required to read YouTube tokens.");
  }
  const key = deriveKey(secret);
  const iv = Buffer.from(sealed.ivB64, "base64");
  const authTag = Buffer.from(sealed.authTagB64, "base64");
  const ciphertext = Buffer.from(sealed.ciphertextB64, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
