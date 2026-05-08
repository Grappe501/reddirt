import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolveApiRouteHandlerPresent } from "@/lib/communication-command-center/readiness";

const TWILIO_WEBHOOK_SEGMENTS = ["webhooks", "twilio"] as const;
const PREFERENCES_REL = ["src", "lib", "comms", "preferences.ts"] as const;

/**
 * Read-only texting foundation signals. No Twilio API calls, no SMS send.
 */
export function getTwilioWebhookRouteReady(): boolean {
  return resolveApiRouteHandlerPresent([...TWILIO_WEBHOOK_SEGMENTS]);
}

/** Best-effort: repo file scan for STOP/HELP style handling (no runtime Twilio). */
export function detectStopHelpHandlingInRepo(): boolean {
  try {
    const p = path.join(process.cwd(), ...PREFERENCES_REL);
    if (!existsSync(p)) return false;
    const src = readFileSync(p, "utf8");
    return (
      src.includes("handleTwilioOptOutKeywords") ||
      (src.includes("STOP") && src.includes("twilioOptOutState"))
    );
  } catch {
    return false;
  }
}

export type TextCommandCenterReadinessSnapshot = {
  twilioWebhookRouteReady: boolean;
  stopHelpHandlingDetected: boolean;
};

export function getTextCommandCenterReadinessSnapshot(): TextCommandCenterReadinessSnapshot {
  return {
    twilioWebhookRouteReady: getTwilioWebhookRouteReady(),
    stopHelpHandlingDetected: detectStopHelpHandlingInRepo(),
  };
}
