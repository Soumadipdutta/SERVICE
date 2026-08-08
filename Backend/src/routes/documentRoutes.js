import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadDocument } from "../controllers/documentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
    "/:applicationId/documents",
    authMiddleware,
    upload.single("document"),
    uploadDocument
);

export default router;