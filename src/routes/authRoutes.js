import express from "express";
import login from "../controllers/authController.js";

const router = express.Router();

// Public login route
router.post("/login", login);

export default router;