
const blogService = require("../services/blogService");

// Handles asynchronous errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Public: get published blogs
const getPublishedBlogs = asyncHandler(async (req, res) => {
    const result = await blogService.getPublishedBlogs({
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search || "",
        category: req.query.category || "",
    });

    res.status(200).json({
        success: true,
        ...result,
    });
});

// Public: get one blog by slug
const getPublishedBlogBySlug = asyncHandler(async (req, res) => {
    const blog = await blogService.getPublishedBlogBySlug(
        req.params.slug
    );

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: "Blog not found",
        });
    }

    res.status(200).json({
        success: true,
        blog,
    });
});

// Admin: get all blogs
const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await blogService.getAllBlogs();

    res.status(200).json({
        success: true,
        count: blogs.length,
        blogs,
    });
});

// Admin: create a blog
const createBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.createBlog(req.body);

    res.status(201).json({
        success: true,
        message: "Blog created successfully",
        blog,
    });
});

// Admin: update a blog
const updateBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.updateBlog(
        req.params.id,
        req.body
    );

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: "Blog not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        blog,
    });
});

// Admin: delete a blog
const deleteBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.deleteBlog(req.params.id);

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: "Blog not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
    });
});

// Public: like a published blog
const likeBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.likeBlog(req.params.id);

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: "Published blog not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Blog liked successfully",
        likes: blog.likes,
    });
});

module.exports = {
    getPublishedBlogs,
    getPublishedBlogBySlug,
    getAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
};
