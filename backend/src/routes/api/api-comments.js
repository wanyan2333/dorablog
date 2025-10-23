import express from "express";
import { requiresAdmin, requiresAuthentication } from "../../middleware/auth-middleware.js";
import { getCommentsByArticleId } from "../../data/comments-dao.js";
import { buildCommentsTree } from "../../utils/comments-utils.js";

const router = express.Router();

/**
 * Get all comments for a specific article
 * @param {number} articleId - The ID of the article to get comments for
 * @returns {Promise<Comment[]>} A promise that resolves to an array of comments
 */
router.get("/articles/:id", (req, res) => {
  const articleId = req.params.id;
  getCommentsByArticleId(articleId).then((comments) => {
    // Build the comments tree with proper depth calculation and sorting
    const sortedComments = buildCommentsTree(comments);
    return res.status(200).json(sortedComments);
  }).catch((error) => {
    return res.status(500).json({ message: "Internal server error" });
  });
});

export default router;