import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
    })
);

// Logging
app.use(
    morgan(
        process.env.NODE_ENV === "development"
            ? "dev"
            : "combined"
    )
);

// Body parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Uploaded complaint evidence
const uploadDir =
    process.env.UPLOAD_DIR || "uploads/complaints";

app.use(
    `/${uploadDir}`,
    express.static(path.join(process.cwd(), uploadDir))
);

// Root
app.get("/", (req, res) => {
    res.json({
        success: true,
        name: "Welfare-Scheme Access & Grievance Redressal API",
        track: "IEMHACKS 4.0 — Track 05 / Social Issues",
        health: "/api/health",
    });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;