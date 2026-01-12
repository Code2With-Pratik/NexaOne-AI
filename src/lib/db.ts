import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prisma: PrismaClient | undefined;
}

// 1. Configure the adapter (matching your server.js setup)
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Create the singleton instance
export const db = globalThis.prisma || new PrismaClient({ adapter });

// 3. Save to global object in development to prevent hot-reload crashes
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;