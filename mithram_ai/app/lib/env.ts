const requiredEnv = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "MY_VERIFIED_NUMBER",
  "NGROK_PUBLIC_URL",
] as const;

export function getTwilioEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    fromNumber: process.env.TWILIO_PHONE_NUMBER!,
    verifiedNumber: process.env.MY_VERIFIED_NUMBER!,
    publicUrl: process.env.NGROK_PUBLIC_URL!,
  };
}
