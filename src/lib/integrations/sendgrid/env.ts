export function getSendgridEnv() {
  return {
    apiKey: process.env.SENDGRID_API_KEY?.trim() ?? "",
    fromEmail: process.env.SENDGRID_FROM_EMAIL?.trim() ?? "",
    fromName: process.env.SENDGRID_FROM_NAME?.trim() || "Campaign",
  };
}

export function isSendgridConfigured(): boolean {
  const e = getSendgridEnv();
  return Boolean(e.apiKey && e.fromEmail);
}
