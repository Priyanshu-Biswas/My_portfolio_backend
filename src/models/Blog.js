
// const mongoose = require("mongoose");
import mongoose from "mongoose";
const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Blog title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },

        slug: {
            type: String,
            required: [true, "Blog slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        summary: {
            type: String,
            required: [true, "Blog summary is required"],
            trim: true,
            maxlength: [500, "Summary cannot exceed 500 characters"],
        },

        content: {
            type: String,
            required: [true, "Blog content is required"],
        },

        coverImage: {
            type: String,
            default: "",
            trim: true,
        },

        category: {
            type: String,
            default: "General",
            trim: true,
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
            index: true,
        },

        publishedAt: {
            type: Date,
            default: null,
        },

        likes: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Useful for fetching published blogs in date order
blogSchema.index({ status: 1, publishedAt: -1 });

const blogmodel= mongoose.model("Blog", blogSchema);
export {blogmodel};