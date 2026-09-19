export type AeacFormResult = {
  ok: boolean;
  error?: string;
  fields?: Record<string, string>;
  submissionId?: string;
};

export async function submitAeacForm(data: unknown): Promise<AeacFormResult> {
  const res = await fetch("/api/forms", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = (await res.json()) as AeacFormResult;
  if (!res.ok) {
    return {
      ok: false,
      error: json.error ?? "Something went wrong.",
      fields: json.fields,
    };
  }
  return { ok: true, submissionId: json.submissionId };
}
