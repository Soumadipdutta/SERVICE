import prisma from "./config/prisma.js";

try {
    await prisma.$connect();

    console.log("Prisma SQLite connection OK");

    await prisma.$disconnect();
} catch (error) {
    console.error("Prisma connection failed:");
    console.error(error);
    process.exit(1);
}