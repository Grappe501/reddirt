export function getTwilioEnv() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID?.trim() ?? "",
    authToken: process.env.TWILIO_AUTH_TOKEN?.trim() ?? "",
    smsFrom: process.env.TWILIO_SMS_FROM?.trim() ?? "",
  };
}

export function isTwilioConfigured(): boolean {
  const e = getTwilioEnv();
  return Boolean(e.accountSid && e.authToken && e.smsFrom);
}
