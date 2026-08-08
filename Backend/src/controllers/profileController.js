import {
    createProfile,
    getProfile,
    updateProfile,
} from "../services/profileService.js";

export const create = async (req, res, next) => {
    try {
        const profile = await createProfile(
            req.user.id,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Citizen profile created successfully",
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        const profile = await getProfile(req.user.id);

        res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const profile = await updateProfile(
            req.user.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Citizen profile updated successfully",
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};