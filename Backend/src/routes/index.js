import express from "express";

import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import eligibilityRoutes from "./eligibilityRoutes.js";
import applicationRoutes from "./applicationRoutes.js";
import documentRoutes from "./documentRoutes.js";

const router = express.Router();

router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is healthy",
    });
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/eligibility", eligibilityRoutes);
router.use("/applications", applicationRoutes);
router.use("/applications", documentRoutes);

export default router;