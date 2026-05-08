/** Operator confirmation phrases for high-risk ingest actions. */
export const COMMUNICATION_INGEST_CONFIRM_PHRASE = {
  gmailHistory: "IMPORT GMAIL HISTORY",
  gmailFullBody: "IMPORT FULL EMAIL BODY",
  googleContacts: "IMPORT GOOGLE CONTACTS",
  calendarHistory: "IMPORT CALENDAR HISTORY",
} as const;

export const GMAIL_IMPORT_MESSAGE_CAP_DEFAULT = 500;
/** Above this cap (requested max messages), operator must type {@link COMMUNICATION_INGEST_CONFIRM_PHRASE.gmailHistory}. */
export const GMAIL_HISTORY_PHRASE_THRESHOLD = 500;
export const CONTACTS_IMPORT_CAP_DEFAULT = 1000;
export const CONTACTS_HISTORY_PHRASE_THRESHOLD = 1000;
export const CALENDAR_IMPORT_EVENT_CAP_DEFAULT = 500;
export const CALENDAR_HISTORY_PHRASE_THRESHOLD = 500;
