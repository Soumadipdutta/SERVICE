import { verifyToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check Authorization header
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header is required",
            });
        }

        // Expected:
        // Authorization: Bearer <token>
        const parts = authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format",
            });
        }

        const token = parts[1];

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach user information to request
        req.user = {
            id: decoded.id,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default authMiddleware;