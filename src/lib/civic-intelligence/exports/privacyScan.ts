const PROHIBITED_KEY_PATTERNS = [
  /email/i,
  /phone/i,
  /address/i,
  /voter/i,
  /donor/i,
  /volunteer/i,
  /contact/i,
  /relationship/i,
  /message/i,
  /gmail/i,
  /calendar/i,
  /authentication/i,
  /token/i,
  /secret/i,
  /private.?note/i,
  /api_?key/i,
  /password/i,
  /campaign/i,
];

const ALLOWED_TOP_LEVEL_FILES = new Set([
  "manifest.json",
  "national-baseline.json",
  "arkansas-baseline.json",
  "county-baselines.json",
  "series-metadata.json",
  "series-arrays.json",
  "source-registry.json",
  "source-citations.json",
  "cross-check-results.json",
  "limitations.json",
  "validation-report.json",
]);

export type PrivacyScanResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

function scanNode(value: unknown, trail: string, errors: string[]): void {
  if (value == null) return;
  if (typeof value === "string") {
    if (/bearer\s+[a-z0-9._\-]+/i.test(value)) errors.push(`Possible secret at ${trail}`);
    if (/sk_live_/i.test(value)) errors.push(`Possible secret at ${trail}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => scanNode(v, `${trail}[${i}]`, errors));
    return;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (PROHIBITED_KEY_PATTERNS.some((re) => re.test(k))) {
        // allowlisted provenance fields that mention "private" only as attestation false flags
        if (
          k === "contains_private_data" ||
          k === "privateImpactStatus" ||
          k === "publicImpactStatus"
        ) {
          scanNode(v, `${trail}.${k}`, errors);
          continue;
        }
        errors.push(`Prohibited field name at ${trail}.${k}`);
        continue;
      }
      scanNode(v, `${trail}.${k}`, errors);
    }
  }
}

export function scanExportPayload(files: Record<string, unknown>): PrivacyScanResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const name of Object.keys(files)) {
    if (!ALLOWED_TOP_LEVEL_FILES.has(name)) {
      errors.push(`Unexpected export file: ${name}`);
    }
  }
  for (const [name, payload] of Object.entries(files)) {
    scanNode(payload, name, errors);
  }
  const manifest = files["manifest.json"] as { contains_private_data?: boolean } | undefined;
  if (manifest?.contains_private_data === true) {
    errors.push("manifest.contains_private_data must be false");
  }
  return { ok: errors.length === 0, errors, warnings };
}
