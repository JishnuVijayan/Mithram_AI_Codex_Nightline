import { prisma } from "@/app/lib/prisma";

type SignupInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

type ParentInput = {
  userId: string;
  name: string;
  phoneNumber: string;
  relation: string;
  preferredLanguage: string;
  callFrequency: string;
  callTimes: string;
};

type MedicineInput = {
  parentId: string;
  name: string;
  dosage: string;
  timeOfDay: string;
};

export function createUser(data: SignupInput) {
  return prisma.user.create({
    data,
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
