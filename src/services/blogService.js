
const mongoose = require("mongoose");
const Blog = require("../models/Blog");

const createSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const buildSlug = async (title, excludeId = null) => {
    const baseSlug = createSlug(title);

    if (!baseSlug) {
        const error = new Error("A valid title is required");
        error.statusCode = 400;
        throw error;
    }

    let slug = baseSlug;
    let count = 1;

    while (true) {
        const filter = { slug };

        if (excludeId) {
            filter._id = { $ne: excludeId };
        }

        const existingBlog = await Blog.exists(filter);

        if (!existingBlog) {
            return slug;
        }

        count += 1;
        slug = `${baseSlug}-${count}`;
    }
};

// Get published blogs with pagination and optional search
const getPublishedBlogs = async ({
    page = 1,
    limit = 10,
    search = "",
    category = "",
} = {}) => {
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

    const filter = { status: "published" };

    if (category.trim()) {
        filter.category = category.trim();
    }

    if (search.trim()) {
        const escapedSearch = search
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        filter.$or = [
            { title: { $regex: escapedSearch, $options: "i" } },
            { summary: { $regex: escapedSearch, $options: "i" } },
        ];
    }

    const [blogs, total] = await Promise.all([
        Blog.find(filter)
            .select("-content")
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
            .lean(),

        Blog.countDocuments(filter),
    ]);

    return {
        blogs,
        pagination: {
            page: currentPage,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        },
    };
};

// Get one published blog
const getPublishedBlogBySlug = async (slug) => {
    return Blog.findOne({
        slug: slug.toLowerCase(),
        status: "published",
    }).lean();
};

// Admin: get all blogs, including drafts
const getAllBlogs = async () => {
    return Blog.find()
        .sort({ updatedAt: -1 })
        .lean();
};

// Admin: create a blog
const createBlog = async (data) => {
    const slug = await buildSlug(data.slug || data.title);

    const blogData = {
        title: data.title,
        slug,
        summary: data.summary,
        content: data.content,
        coverImage: data.coverImage || "",
        category: data.category || "General",
        status: data.status || "draft",
        publishedAt:
            data.status === "published" ? new Date() : null,
    };

    return Blog.create(blogData);
};

// Admin: update a blog
const updateBlog = async (id, data) => {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    const blog = await Blog.findById(id);

    if (!blog) {
        return null;
    }

    const allowedFields = [
        "title",
        "summary",
        "content",
        "coverImage",
        "category",
        "status",
    ];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            blog[field] = data[field];
        }
    }

    if (data.slug !== undefined || data.title !== undefined) {
        blog.slug = await buildSlug(
            data.slug || data.title || blog.title,
            id
        );
    }

    if (blog.status === "published" && !blog.publishedAt) {
        blog.publishedAt = new Date();
    }

    if (blog.status === "draft") {
        blog.publishedAt = null;
    }

    await blog.save();

    return blog;
};

// Admin: delete a blog
const deleteBlog = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return Blog.findByIdAndDelete(id);
};

// Public: increment likes atomically
const likeBlog = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return Blog.findOneAndUpdate(
        {
            _id: id,
            status: "published",
        },
        {
            $inc: { likes: 1 },
        },
        {
            new: true,
            projection: { likes: 1 },
        }
    ).lean();
};

module.exports = {
    getPublishedBlogs,
    getPublishedBlogBySlug,
    getAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    likeBlog,
};
