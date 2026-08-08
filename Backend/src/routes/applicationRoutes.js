import express from "express";

import {
    applyForScheme,
} from "../controllers/applicationController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply for a scheme
router.post(
    "/:schemeId/apply",
    authMiddleware,
    applyForScheme
);

export default router;
