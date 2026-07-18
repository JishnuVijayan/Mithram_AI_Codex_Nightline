export const QUESTIONS = {
  English: [
    "Did you take your morning BP medicine?",
    "Did you sleep well last night?",
    "Do you need anything today, or have any appointments coming up?",
  ],
  Malayalam: [
    "Innu ravile BP marunnu kazhicho?",
    "Innale rathri nannayi urangiyo?",
    "Innu enthenkilum avashyam undo, allenkil appointment undo?",
  ],
} as const;

export const GREETINGS = {
  English: "Hello, this is Mithram calling to check in on you today.",
  Malayalam: "Hello, ithu Mithram aanu. Innu ningale check cheyyan vilikkunnathaanu.",
} as const;

export const GOODBYES = {
  English: "Thank you, take care, talk to you soon.",
  Malayalam: "Valare nanni. Sookshikkane. Pinne samsarikkam.",
} as const;

export type SupportedLanguage = keyof typeof QUESTIONS;

export function normalizeLanguage(language?: string | null): SupportedLanguage {
  return language === "Malayalam" ? "Malayalam" : "English";
}

export function twilioSpeechLanguage() {
  return "en-IN";
}
