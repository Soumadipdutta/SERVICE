import {
    uploadApplicationDocument,
} from "../services/documentService.js";

export const uploadDocument = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const applicationId = Number(
            req.params.applicationId
        );

        const requiredDocumentId = Number(
            req.body.requiredDocumentId
        );

        if (!Number.isInteger(applicationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID",
            });
        }

        if (!Number.isInteger(requiredDocumentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid required document ID",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a document",
            });
        }

        const document =
            await uploadApplicationDocument(
                userId,
                applicationId,
                requiredDocumentId,
                req.file
            );

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            data: document,
        });
    } catch (error) {
        next(error);
    }
};