import mongoose from "mongoose";
import 'dotenv/config';

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        console.log(uri);

        if (!uri) {
            throw new Error("MONGODB_URI is missing from the .env file");
        }

        await mongoose.connect(uri);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

export default connectDB;