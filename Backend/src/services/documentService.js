import prisma from "../config/prisma.js";

export const uploadApplicationDocument = async (
    userId,
    applicationId,
    requiredDocumentId,
    file
) => {
    // 1. Check file
    if (!file) {
        const error = new Error(
            "Document file is required."
        );

        error.statusCode = 400;
        throw error;
    }

    // 2. Find application
    const application =
        await prisma.schemeApplication.findUnique({
            where: {
                id: applicationId,
            },

            include: {
                scheme: true,
            },
        });

    if (!application) {
        const error = new Error(
            "Application not found."
        );

        error.statusCode = 404;
        throw error;
    }

    // 3. Check ownership
    if (application.userId !== userId) {
        const error = new Error(
            "You are not allowed to modify this application."
        );

        error.statusCode = 403;
        throw error;
    }

    // 4. Check application status
    if (application.status !== "DRAFT") {
        const error = new Error(
            "Documents can only be uploaded for a draft application."
        );

        error.statusCode = 400;
        throw error;
    }

    // 5. Find required document
    const requiredDocument =
        await prisma.requiredDocument.findUnique({
            where: {
                id: requiredDocumentId,
            },
        });

    if (!requiredDocument) {
        const error = new Error(
            "Required document not found."
        );

        error.statusCode = 404;
        throw error;
    }

    // 6. Make sure document belongs to this scheme
    if (
        requiredDocument.schemeId !==
        application.schemeId
    ) {
        const error = new Error(
            "This document is not required for this scheme."
        );

        error.statusCode = 400;
        throw error;
    }

    // 7. Check duplicate upload
    const existingDocument =
        await prisma.applicationDocument.findFirst({
            where: {
                applicationId,
                requiredDocumentId,
            },
        });

    if (existingDocument) {
        const error = new Error(
            "This document has already been uploaded."
        );

        error.statusCode = 409;
        throw error;
    }

    // 8. Save document
    const applicationDocument =
        await prisma.applicationDocument.create({
            data: {
                applicationId,
                requiredDocumentId,
                fileUrl: file.path,
                status: "PENDING",
            },

            include: {
                requiredDocument: true,
            },
        });

    return applicationDocument;
};