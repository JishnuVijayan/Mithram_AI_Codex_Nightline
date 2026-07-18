import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  phone: z.string().trim().min(1, "Phone is required"),
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
