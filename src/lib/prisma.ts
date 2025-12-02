import { PrismaClient } from "@prisma/client";

// Create a single PrismaClient for the application
// This is to maintain connection pool consistency
let prismaClient: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prismaClient = new PrismaClient();
} else {
  // In development, use a global to store Prisma singleton
  // This prevents creating multiple instances during hot reload
  let globalPrisma: PrismaClient | undefined;
  
  try {
    globalPrisma = (global as any).prisma;
  } catch (e) {
    // ignore
  }

  if (!globalPrisma) {
    globalPrisma = new PrismaClient();
    try {
      (global as any).prisma = globalPrisma;
    } catch (e) {
      // ignore
    }
  }

  prismaClient = globalPrisma;
}

export const prisma = prismaClient;
