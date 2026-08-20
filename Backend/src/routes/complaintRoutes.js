import express from "express";
import {
    createReport,
    getReport,
    listReports,
    updateReportStatus,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/", listReports);
router.get("/:id", getReport);
router.post("/", createReport);
router.patch("/:id/status", updateReportStatus);

export default router;
