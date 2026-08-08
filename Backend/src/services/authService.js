import prisma from "../config/prisma.js";
import {
    hashPassword,
    comparePassword,
} from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async ({
    name,
    email,
    password,
    role = "CITIZEN",
}) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (existingUser) {
        const error = new Error("Email is already registered");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
        },
    });

    const token = generateToken(user.id);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        },
        token,
    };
};

export const loginUser = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatches = await comparePassword(
        password,
        user.password
    );

    if (!passwordMatches) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user.id);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        },
        token,
    };
};

export const getCurrentUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            profile: true,
        },
    });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile,
    };
};