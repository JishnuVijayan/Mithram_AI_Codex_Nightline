import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  consentAccepted: z.literal(true, {
    error: "Consent is required to create an account",
  }),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const parentSchema = z.object({
  userId: z.string().min(1, "User is required"),
  name: z.string().trim().min(1, "Parent name is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  relation: z.string().trim().min(1, "Relation is required"),
  preferredLanguage: z.enum(["English", "Malayalam"]),
  callFrequency: z.enum(["1x_day", "3x_day"]),
  callTimes: z.string().trim().min(1, "Call time is required"),
  retryCount: z.coerce.number().int().min(0).max(5).default(0),
  retryGapMinutes: z.coerce.number().int().min(5).max(120).default(15),
  notifySms: z.boolean().default(true),
  notifyEmail: z.boolean().default(false),
  notifyPush: z.boolean().default(false),
  callEmergency: z.boolean().default(false),
  emergencyName: z.string().trim().optional(),
  emergencyRelation: z.string().trim().optional(),
  emergencyPhone: z.string().trim().optional(),
});

export const medicineSchema = z.object({
  parentId: z.string().min(1, "Parent is required"),
  name: z.string().trim().min(1, "Medicine name is required"),
  dosage: z.string().trim().min(1, "Dosage is required"),
  timeOfDay: z.string().trim().min(1, "Medicine time is required"),
});

export const startCallSchema = z.object({
  parentId: z.string().min(1, "Parent is required"),
});

export const classifySchema = z.object({
  logId: z.string().min(1, "Call log is required"),
});
