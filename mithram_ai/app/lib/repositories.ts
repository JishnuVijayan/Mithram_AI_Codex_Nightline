import { prisma } from "@/app/lib/prisma";

type SignupInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
  consentAccepted: true;
};

type ParentInput = {
  userId: string;
  name: string;
  phoneNumber: string;
  relation: string;
  preferredLanguage: string;
  voicePreference?: string;
  callFrequency: string;
  callTimes: string;
  retryCount: number;
  retryGapMinutes: number;
  notifySms: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  callEmergency: boolean;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  customQuestions?: string;
  securityCode?: string;
  securityCodeExpiresAt?: Date | null;
};

type MedicineInput = {
  parentId: string;
  name: string;
  dosage: string;
  timeOfDay: string;
};

export function createUser(data: SignupInput) {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  return prisma.user.create({
    data: {
      ...data,
      consentAcceptedAt: new Date(),
      trialEndsAt,
    },
    select: { id: true },
  });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  });
}

export function createParent(data: ParentInput) {
  return prisma.parent.create({
    data,
    select: { id: true },
  });
}

export function createMedicine(data: MedicineInput) {
  return prisma.medicine.create({
    data,
    select: { id: true },
  });
}

export function getParentsWithLatestCall(userId: string) {
  return prisma.parent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      medicines: {
        orderBy: { createdAt: "desc" },
      },
      callLogs: {
        orderBy: { callDatetime: "desc" },
        take: 1,
      },
    },
  });
}

export function getCallLogs(parentId: string) {
  return prisma.callLog.findMany({
    where: { parentId },
    orderBy: { callDatetime: "desc" },
  });
}

export function getParentById(parentId: string) {
  return prisma.parent.findUnique({
    where: { id: parentId },
  });
}

export function createInProgressCallLog(parentId: string) {
  return prisma.callLog.create({
    data: {
      parentId,
      status: "in_progress",
    },
    select: { id: true },
  });
}

export function saveCallSid(logId: string, callSid: string) {
  return prisma.callLog.update({
    where: { id: logId },
    data: { callSid },
  });
}

export function getCallLogWithParent(logId: string) {
  return prisma.callLog.findUnique({
    where: { id: logId },
    include: { parent: true },
  });
}

export function saveCallAnswer(logId: string, step: number, answer: string) {
  const answerField = `q${step}Answer`;

  if (!["q1Answer", "q2Answer", "q3Answer"].includes(answerField)) {
    throw new Error("Invalid call question step");
  }

  return prisma.callLog.update({
    where: { id: logId },
    data: {
      [answerField]: answer,
    },
  });
}

export function markCallAnswered(logId: string) {
  return prisma.callLog.update({
    where: { id: logId },
    data: { status: "answered" },
  });
}

export function updateCallStatusIfInProgress(logId: string, status: string) {
  return prisma.callLog.updateMany({
    where: {
      id: logId,
      status: "in_progress",
    },
    data: { status },
  });
}

export async function getDashboardStats(userId: string) {
  const callWhere = {
    parent: {
      userId,
    },
  };

  const [totalParents, totalCalls, attendedCalls, unattendedCalls, activeCalls] =
    await Promise.all([
      prisma.parent.count({ where: { userId } }),
      prisma.callLog.count({ where: callWhere }),
      prisma.callLog.count({ where: { ...callWhere, status: "answered" } }),
      prisma.callLog.count({ where: { ...callWhere, status: "no_answer" } }),
      prisma.callLog.count({ where: { ...callWhere, status: "in_progress" } }),
    ]);

  return {
    totalParents,
    totalCalls,
    attendedCalls,
    unattendedCalls,
    activeCalls,
  };
}
