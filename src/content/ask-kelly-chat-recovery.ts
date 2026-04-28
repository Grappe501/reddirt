/**
 * Ask Kelly dock — recovery copy when retrieval can’t produce a confident answer (no internals).
 */

export const ASK_KELLY_NO_MATCH_REPLY = [
  "I don’t have a clean answer for that yet.",
  "",
  "Try asking where something lives, how updates work, or what happens before something goes live.",
].join("\n");

export const ASK_KELLY_MISSED_FEEDBACK_PROMPT =
  "Send this question as feedback so Kelly’s guide can improve.";

export const ASK_KELLY_RECOVERY_PROMPT_BUTTONS: readonly string[] = [
  "Where do I edit page copy?",
  "What can I do here?",
  "Who has final say?",
  "What happens if the save fails?",
];
