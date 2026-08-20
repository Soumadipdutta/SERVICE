import express from "express";
import { listSchemes, matchSchemes } from "../controllers/schemeController.js";

const router = express.Router();

router.get("/", listSchemes);
router.post("/match", matchSchemes);

export default router;
