export const QUESTIONS = {
  English: [
    "Did you take your morning BP medicine? Say yes or no. You can also press 1 for yes, or 2 for no.",
    "Did you sleep well last night? Say yes or no. You can also press 1 for yes, or 2 for no.",
    "Today you have a doctor's appointment. Please be careful. Say yes if you understood. You can also press 1 for yes, or 2 for no.",
  ],
  Malayalam: [
    "Innu ravile BP marunnu kazhicho? Kazhichu allenkil kazhichilla ennu parayuka. Kazhichu aanenkil 1 press cheyyam. Kazhichilla aanenkil 2 press cheyyam.",
    "Innale rathri nannayi urangiyo? Urangi allenkil urangiyilla ennu parayuka. Urangi aanenkil 1 press cheyyam. Urangiyilla aanenkil 2 press cheyyam.",
    "Innu doctors appointment undu. Sookshichu pone. Manassilayi enkil yes parayuka. Allenkil 1 press cheyyam.",
  ],
} as const;

export const SPEECH_HINTS = [
  "yes",
  "no",
  "taken",
  "not taken",
  "slept",
  "did not sleep",
  "need",
  "no need",
  "appointment",
  "no appointment",
  "kazhichu",
  "kazhichilla",
  "marunnu kazhichu",
  "marunnu kazhichilla",
  "urangi",
  "urangiyilla",
  "nannayi urangi",
  "nannayi urangiyilla",
  "undu",
  "illa",
  "vendam",
];

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

export function normalizeDigitAnswer(step: number, digit?: string | null) {
  if (digit === "1") {
    return step === 3 ? "yes / undu" : "yes";
  }

  if (digit === "2") {
    return step === 3 ? "no / illa" : "no";
  }

  return null;
}
