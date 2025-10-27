import express from "express";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import { getAllArticles, getArticleById, getArticlesByUserId, getLikedUsers, searchArticles, toggleArticleLike, createArticle, getRecommendedArticles } from "../../data/articles-dao.js";
const router = express.Router();

/**
 * Sending a GET request to /api/articles/ will return an array of all articles in the system.
 */
router.get("/", async (req, res) => {
  try {
    const articles = await getAllArticles();
    return res.status(200).json(articles);
  } catch (error) {
    console.error("Error getting articles:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/** * Sending a GET request to /api/articles/user/:id will return all articles created by the user with the given id.
 */
router.get("/user/:id", (req, res) => {
  getArticlesByUserId(req.params.id).then((articles) => {
    return res.status(200).json(articles);
  });
});

/** * Sending a GET request to /api/articles/search?keyword= will return all articles that match the given keyword.
 */
router.get("/search", (req, res) => {
  const keyword = req.query.keyword || req.body.keyword;
  searchArticles(keyword).then((articles) => {
    return res.status(200).json(articles);
  });
});

/** 
 * Sending a POST request to /api/articles/like/:id will like or unlike the article with the given id.
 * Temporarily using hardcoded userId for testing without authentication.
 */
router.post("/like/:id", async (req, res) => {
    const articleId = req.params.id;

    // TODO: Replace with req.user.id when authentication is enabled
    const userId = 2; // Hardcoded for testing
    
    try {
      const result = await toggleArticleLike(articleId, userId);
      
      // Get updated like count
      const article = await getArticleById(articleId);
      
      return res.status(200).json({ 
        liked: result.liked,
        likeCount: article.likeCount || 0
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Sending a GET request to /api/articles/:id/liked will check if the current user has liked the article.
 * Temporarily using hardcoded userId for testing without authentication.
 */
router.get("/:id/liked", async (req, res) => {
  const articleId = req.params.id;
  // TODO: Replace with req.user.id when authentication is enabled
  const userId = 2; // Hardcoded for testing
  
  try {
    const db = await import("../../data/database.js").then(m => m.getDatabase());
    const result = await db.get(
      "SELECT 1 FROM ArticleLike WHERE articleId = ? AND userId = ?",
      articleId,
      userId
    );
    
    return res.status(200).json({ liked: !!result });
  } catch (error) {
    console.error("Error checking like status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Sending a GET request to /api/articles/:id will return the article with the given id.
 */
router.get("/:id", (req, res) => {
  console.log("Fetching article with ID:", req.params);
  getArticleById(req.params.id).then((article) => {
    if (article) {
      return res.status(200).json(article);
    } else {
      return res.status(404).json({ message: "Article not found" });
    }
  });
});

/**
 * Sending a POST request to /api/articles/ will create a new article.
 * Authentication temporarily disabled for testing.
 */
router.post("/", async (req, res) => {
  try {
    const { title, content, tag, headerImage, contentImages } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }
    
    // Validate content length
    if (title.length > 200) {
      return res.status(400).json({ message: "Title must be less than 200 characters" });
    }
    
    if (content.length > 10000) {
      return res.status(400).json({ message: "Content must be less than 10,000 characters" });
    }
    
    // Create article data (使用默认用户ID进行测试)
    const articleData = {
      title: title.trim(),
      content: content.trim(),
      userId: 2, // 使用默认用户ID (johndoe)
      headerUrl: headerImage || null,
      tag: tag || null
    };
    
    // Create the article
    const createdArticle = await createArticle(articleData);
    
    return res.status(201).json({
      message: "Article created successfully",
      article: createdArticle
    });
    
  } catch (error) {
    console.error("Error creating article:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Sending a GET request to /api/articles/:id/recommendations will return recommended articles for the given article.
 */
router.get("/:id/recommendations", async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 5;
    
    if (isNaN(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }
    
    const recommendations = await getRecommendedArticles(articleId, limit);
    return res.status(200).json(recommendations);
    
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;