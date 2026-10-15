
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import blogRoutes from "./routes/blogRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy when deployed behind a reverse proxy, if required.
// app.set("trust proxy", 1);

// 1. Security headers
app.use(helmet());

// 2. CORS configuration
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

// 3. HTTP request logging
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// 4. Request body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// 5. Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Blog API is running",
    });
});

// 6. API routes
app.use("/api/blogs", blogRoutes);
app.use("/api/auth", authRoutes);

// 7. 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
    });
});

// 8. Central error handler (must be last)
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    res.status(err.statusCode || 500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : err.message || "Internal server error",
    });
});

// 9. Start server after connecting to MongoDB
const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Blog API running on port ${PORT}`);
            console.log(
                `Environment: ${process.env.NODE_ENV || "development"}`
            );
        });

        server.on("error", (err) => {
            console.error("Server error:", err.message);
            process.exitCode = 1;
        });

        // 10. Graceful shutdown
        const shutdown = (signal) => {
            console.log(`${signal} received. Closing server...`);

            server.close(async () => {
                try {
                    await mongoose.connection.close();
                    console.log("MongoDB connection closed.");
                    process.exitCode = 0;
                } catch (err) {
                    console.error("Shutdown error:", err.message);
                    process.exitCode = 1;
                }
            });
        };

        process.once("SIGTERM", () => shutdown("SIGTERM"));
        process.once("SIGINT", () => shutdown("SIGINT"));
    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exitCode = 1;
    }
};

startServer();
