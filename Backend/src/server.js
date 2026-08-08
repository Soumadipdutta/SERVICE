import "dotenv/config";
import app from "./app.js";

import applicationRoutes from "./routes/applicationRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

app.use("/api/applications", applicationRoutes);
app.use("/api", documentRoutes);

const PORT = parseInt(process.env.PORT || "5000", 10);

const server = app.listen(PORT, () => {
    console.log(
        `🚀 API running on http://localhost:${PORT} [${process.env.NODE_ENV || "development"}]`
    );
});

process.on("SIGTERM", () => {
    server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
    server.close(() => process.exit(0));
});