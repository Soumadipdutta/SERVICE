import prisma from "../config/prisma.js";
import { checkSchemeEligibility } from "./eligibilityService.js";

export const createApplication = async (userId, schemeId) => {
    // 1. Check eligibility
    const eligibility = await checkSchemeEligibility(
        userId,
        schemeId
    );

    if (!eligibility.eligible) {
    const error = new Error(
        "You are not eligible for this scheme."
    );

    error.statusCode = 400;
    error.details = {
        scheme: eligibility.scheme,
        failedRules: eligibility.failedRules,
        missingInformation: eligibility.missingInformation,
    };

    throw error;
}

    // 2. Check if application already exists
    const existingApplication =
        await prisma.schemeApplication.findFirst({
            where: {
                userId,
                schemeId,
            },
        });

    if (existingApplication) {
        const error = new Error(
            "You have already applied for this scheme."
        );

        error.statusCode = 409;
        throw error;
    }

    // 3. Create application
    const application =
        await prisma.schemeApplication.create({
            data: {
                userId,
                schemeId,
                status: "DRAFT",
            },

            include: {
                scheme: true,
                documents: {
                    include: {
                        requiredDocument: true,
                    },
                },
            },
        });

    return application;
};

export const submitApplication = async (userId, applicationId) => {
    // 1. Find application
    const application = await prisma.schemeApplication.findUnique({
        where: {
            id: applicationId,
        },
        include: {
            scheme: {
                include: {
                    documents: true,
                },
            },
            documents: {
                include: {
                    requiredDocument: true,
                },
            },
        },
    });

    if (!application) {
        const error = new Error("Application not found.");
        error.statusCode = 404;
        throw error;
    }

    // 2. Make sure application belongs to user
    if (application.userId !== userId) {
        const error = new Error(
            "You are not allowed to submit this application."
        );
        error.statusCode = 403;
        throw error;
    }

    // 3. Application must be in DRAFT
    if (application.status !== "DRAFT") {
        const error = new Error(
            `Application cannot be submitted because its current status is ${application.status}.`
        );
        error.statusCode = 400;
        throw error;
    }

    // 4. Get mandatory documents
    const mandatoryDocuments = application.scheme.documents.filter(
        (document) => document.mandatory
    );

    // 5. Find missing documents
    const uploadedDocumentIds = application.documents.map(
        (document) => document.requiredDocumentId
    );

    const missingDocuments = mandatoryDocuments.filter(
        (document) => !uploadedDocumentIds.includes(document.id)
    );

    // 6. Stop submission if documents are missing
    if (missingDocuments.length > 0) {
        const error = new Error(
            "Please upload all mandatory documents before submitting."
        );

        error.statusCode = 400;

        error.missingDocuments = missingDocuments.map((document) => ({
            id: document.id,
            name: document.name,
        }));

        throw error;
    }

    // 7. Submit application
    const submittedApplication =
        await prisma.schemeApplication.update({
            where: {
                id: applicationId,
            },
            data: {
                status: "SUBMITTED",
                submittedAt: new Date(),
            },
            include: {
                scheme: true,
                documents: {
                    include: {
                        requiredDocument: true,
                    },
                },
            },
        });

    return submittedApplication;
};