"use client";

import { WhatToSayPanel } from "@/components/message-engine";

/**
 * Client island: registry-backed starters, follow-ups, and place-aware local story prompt.
 * Keeps the member hub page mostly static while the “conversation lab” stays interactive.
 */
export function NarrativeMemberHubConversationLab() {
  return <WhatToSayPanel />;
}
