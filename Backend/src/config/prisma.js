import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client.ts";

const globalForPrisma = globalThis;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
}

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