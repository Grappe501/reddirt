export type CheckSosFieldKey =
  | "contributionType"
  | "contributorFullName"
  | "contributorFirstName"
  | "contributorLastName"
  | "address1"
  | "address2"
  | "city"
  | "state"
  | "zip"
  | "employer"
  | "occupation"
  | "amount"
  | "checkNumber"
  | "checkDate"
  | "receivedDate"
  | "depositedDate"
  | "memo";

export type CheckSosFieldDef = {
  key: CheckSosFieldKey;
  label: string;
  sosHint: string;
  required: boolean;
};

/** Field order aligned with Arkansas SOS individual contribution entry (check). */
export const CHECK_SOS_FIELDS: CheckSosFieldDef[] = [
  { key: "contributionType", label: "Contribution type", sosHint: "Usually: Check", required: true },
  { key: "checkDate", label: "Date of contribution / check date", sosHint: "MM/DD/YYYY on SOS form", required: true },
  { key: "amount", label: "Amount", sosHint: "Dollar amount (numbers only)", required: true },
  { key: "contributorFullName", label: "Contributor full name", sosHint: "As printed on check", required: true },
  { key: "contributorFirstName", label: "First name", sosHint: "If SOS splits name", required: false },
  { key: "contributorLastName", label: "Last name", sosHint: "If SOS splits name", required: false },
  { key: "address1", label: "Street address", sosHint: "Mailing address on check", required: true },
  { key: "address2", label: "Address line 2", sosHint: "Apt/suite if present", required: false },
  { key: "city", label: "City", sosHint: "", required: true },
  { key: "state", label: "State", sosHint: "2-letter state", required: true },
  { key: "zip", label: "ZIP", sosHint: "", required: true },
  { key: "employer", label: "Employer", sosHint: "Required for individuals over limit", required: true },
  { key: "occupation", label: "Occupation", sosHint: "Required for individuals over limit", required: true },
  { key: "checkNumber", label: "Check number", sosHint: "From check MICR line", required: false },
  { key: "receivedDate", label: "Date received", sosHint: "If SOS asks separately from check date", required: false },
  { key: "depositedDate", label: "Date deposited", sosHint: "Bank deposit date if known", required: false },
  { key: "memo", label: "Memo / notes", sosHint: "Optional SOS notes field", required: false },
];

export function formatSosDate(iso?: string | null): string {
  if (!iso?.trim()) return "";
  const trimmed = iso.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-");
    return `${m}/${d}/${y}`;
  }
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return trimmed;
  const dt = new Date(parsed);
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${m}/${d}/${dt.getFullYear()}`;
}

export function formatSosAmount(amount?: number | null): string {
  if (amount == null || !Number.isFinite(amount)) return "";
  return amount.toFixed(2);
}
