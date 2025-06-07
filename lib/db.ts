import { PrismaClient } from "@prisma/client";

declare global {
  interface Global {
    prisma?: PrismaClient;
  }
}

declare const globalThis: {
  prisma: PrismaClient | undefined;
} & typeof global;

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}