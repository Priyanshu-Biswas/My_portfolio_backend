
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB before accepting requests
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Blog API running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
        });

        // Handle unexpected server errors
        server.on("error", (err) => {
            console.error("Server error:", err.message);
            process.exitCode = 1;
        });

        // Graceful shutdown
        const shutdown = (signal) => {
            console.log(`${signal} received. Closing server...`);

            server.close(async () => {
                try {
                    const mongoose = require("mongoose");
                    await mongoose.connection.close();
                    console.log("MongoDB connection closed.");
                    process.exit(0);
                } catch (err) {
                    console.error("Shutdown error:", err.message);
                    process.exit(1);
                }
            });
        };

        process.once("SIGTERM", () => shutdown("SIGTERM"));
        process.once("SIGINT", () => shutdown("SIGINT"));
    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
};

startServer();
