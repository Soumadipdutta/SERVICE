
import express from "express";

import {
    checkEligibility,
    getEligibleSchemes,
} from "../controllers/eligibilityController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All eligibility routes require authentication
router.use(authMiddleware);

// GET /api/eligibility
router.get("/", getEligibleSchemes);

// GET /api/eligibility/:schemeId
router.get("/:schemeId", checkEligibility);

export default router;

