import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client.ts";

const globalForPrisma = globalThis;

const connectionString = process.env.DATABASE_URL || `file:${process.cwd().replace(/\\/g, '/')}/Backend/dev.db`;

// Ensure the directory exists when using the default path
// (Prisma/better-sqlite3 will create the file when needed).
const adapter = new PrismaBetterSqlite3({
    url: connectionString,
});

const prisma =
    globalForPrisma.__prisma ||
    new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === "development"
                ? ["warn", "error"]
                : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prisma = prisma;
}

export default prisma;