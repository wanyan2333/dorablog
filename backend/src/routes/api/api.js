import express from "express";
import { getCommentsByArticleId } from "../../data/comments-dao.js";

// import child routes
import authRoutes from "./api-auth.js";
import userRoutes from "./api-users.js";
import articleRoutes from "./api-articles.js";
import commentRoutes from "./api-comments.js";

const router = express.Router();

// 挂载子路由
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/articles", articleRoutes);
router.use("/comments", commentRoutes);

// 不需要在这里添加评论数路由

export default router;