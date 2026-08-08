
import {
    checkSchemeEligibility,
    findEligibleSchemes,
} from "../services/eligibilityService.js";

export const checkEligibility = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const schemeId = Number(req.params.schemeId);

        if (!Number.isInteger(schemeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid scheme ID",
            });
        }

        const result = await checkSchemeEligibility(
            userId,
            schemeId
        );

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getEligibleSchemes = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await findEligibleSchemes(userId);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

