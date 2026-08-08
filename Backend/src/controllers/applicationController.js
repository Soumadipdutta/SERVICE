import { createApplication, submitApplication } from "../services/applicationService.js";

export const applyForScheme = async (req, res, next) => {
    try {
        // User comes from authentication middleware
        const userId = req.user.id;

        // Get scheme ID from URL
        const schemeId = Number(req.params.schemeId);

        // Validate scheme ID
        if (!Number.isInteger(schemeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid scheme ID",
            });
        }

        // Create application
        const application = await createApplication(
            userId,
            schemeId
        );

        return res.status(201).json({
            success: true,
            message: "Application created successfully",
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

export const submitApplicationController = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;
        const applicationId = Number(req.params.applicationId);

        if (!Number.isInteger(applicationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID",
            });
        }

        const application = await submitApplication(
            userId,
            applicationId
        );

        return res.status(200).json({
            success: true,
            message: "Application submitted successfully",
            data: application,
        });
    } catch (error) {
        next(error);
    }
};