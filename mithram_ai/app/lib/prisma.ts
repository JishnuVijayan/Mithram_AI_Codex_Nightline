import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
};

function getDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  return process.env.DATABASE_URL;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl: getDatabaseUrl(),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
