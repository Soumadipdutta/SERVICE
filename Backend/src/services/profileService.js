import prisma from "../config/prisma.js";

export const createProfile = async (userId, data) => {
    const existingProfile = await prisma.citizenProfile.findUnique({
        where: {
            userId,
        },
    });

    if (existingProfile) {
        const error = new Error("Citizen profile already exists");
        error.statusCode = 409;
        throw error;
    }

    return prisma.citizenProfile.create({
        data: {
            userId,
            age: data.age ?? null,
            gender: data.gender ?? null,
            state: data.state ?? null,
            district: data.district ?? null,
            occupation: data.occupation ?? null,
            annualIncome: data.annualIncome ?? null,
            educationLevel: data.educationLevel ?? null,
            studentStatus: data.studentStatus ?? null,
            category: data.category ?? null,
            disabilityStatus: data.disabilityStatus ?? null,
            familySize: data.familySize ?? null,
        },
    });
};

export const getProfile = async (userId) => {
    const profile = await prisma.citizenProfile.findUnique({
        where: {
            userId,
        },
    });

    if (!profile) {
        const error = new Error("Citizen profile not found");
        error.statusCode = 404;
        throw error;
    }

    return profile;
};

export const updateProfile = async (userId, data) => {
    const existingProfile = await prisma.citizenProfile.findUnique({
        where: {
            userId,
        },
    });

    if (!existingProfile) {
        const error = new Error("Citizen profile not found");
        error.statusCode = 404;
        throw error;
    }

    return prisma.citizenProfile.update({
        where: {
            userId,
        },
        data: {
            age: data.age ?? existingProfile.age,
            gender: data.gender ?? existingProfile.gender,
            state: data.state ?? existingProfile.state,
            district: data.district ?? existingProfile.district,
            occupation: data.occupation ?? existingProfile.occupation,
            annualIncome:
                data.annualIncome ?? existingProfile.annualIncome,
            educationLevel:
                data.educationLevel ?? existingProfile.educationLevel,
            studentStatus:
                data.studentStatus ?? existingProfile.studentStatus,
            category: data.category ?? existingProfile.category,
            disabilityStatus:
                data.disabilityStatus ?? existingProfile.disabilityStatus,
            familySize:
                data.familySize ?? existingProfile.familySize,
        },
    });
};