import express from "express";

import {
    create,
    get,
    update,
} from "../controllers/profileController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", create);
router.get("/", get);
router.put("/", update);

export default router;