
import express from "express";

import * as blogController from "../controllers/blogController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// ========================================
// PUBLIC ROUTES
// ========================================

// Get all published blogs
router.get("/", (req, res, next) => {
    blogController.getPublishedBlogs(req, res, next);
});

// Like a blog
router.patch("/:id/like", (req, res, next) => {
    blogController.likeBlog(req, res, next);
});

// Get a published blog by slug
// Keep this after /admin/all
router.get("/:slug", (req, res, next) => {
    blogController.getPublishedBlogBySlug(req, res, next);
});

// ========================================
// ADMIN-ONLY ROUTES
// ========================================

// Get all blogs, including unpublished blogs
router.get("/admin/all", adminAuth, (req, res, next) => {
    blogController.getAllBlogs(req, res, next);
});

// Create a blog
router.post("/", adminAuth, (req, res, next) => {
    blogController.createBlog(req, res, next);
});

// Update a blog
router.patch("/:id", adminAuth, (req, res, next) => {
    blogController.updateBlog(req, res, next);
});

// Delete a blog
router.delete("/:id", adminAuth, (req, res, next) => {
    blogController.deleteBlog(req, res, next);
});

export default router;
