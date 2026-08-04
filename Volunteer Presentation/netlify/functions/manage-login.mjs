import { getManagePassword, json, signToken } from "./lib/shared.mjs";

export default async (request) => {
  if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });

  const password = getManagePassword();
  if (!password) {
    return json(503, {
      ok: false,
      error: "not_configured",
      message: "Set KICKOFF_MANAGE_PASSWORD in Netlify site env vars.",
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  if (String(body?.password || "") !== password) {
    return json(401, { ok: false, error: "invalid_password" });
  }

  const token = signToken();
  if (!token) return json(503, { ok: false, error: "not_configured" });
  return json(200, { ok: true, token });
};
