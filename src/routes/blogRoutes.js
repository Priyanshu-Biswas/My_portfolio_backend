const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blogController");
const adminAuth = require("../middleware/adminAuth");

// Public routes
router.get("/", blogController.getPublishedBlogs);

router.patch("/:id/like", blogController.likeBlog);

// Admin-only routes
// Keep this before router.get("/:slug")
router.get("/admin/all", adminAuth, blogController.getAllBlogs);

router.post("/", adminAuth, blogController.createBlog);

router.patch("/:id", adminAuth, blogController.updateBlog);

router.delete("/:id", adminAuth, blogController.deleteBlog);

// Public route: Get a published blog by slug
router.get("/:slug", blogController.getPublishedBlogBySlug);

module.exports = router;