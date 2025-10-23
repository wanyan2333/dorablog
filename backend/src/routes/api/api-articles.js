import express from "express";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import { getAllArticles, getArticleById, getArticlesByUserId, getLikedUsers, searchArticles, toggleArticleLike } from "../../data/articles-dao.js";
const router = express.Router();

/**
 * Sending a GET request to /api/articles/ will return an array of all articles in the system.
 */
router.get("/", (req, res) => {
  try {
    getAllArticles().then(async (articles) => {
      for (let article of articles) {
        const likedUsers = await getLikedUsers(article.id);
        article.likeCount = likedUsers.length;
      }
      return res.status(200).json(articles);
    });
  }catch (error) {
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

/** * Sending a POST request to /api/articles/like/:id will like or unlike the article with the given id for the currently authenticated user.
 */
router.post("/like/:id", requiresAuthentication, (req, res) => {
    const articleId = req.params.id;
    const userId = req.user.id;
    try {
      toggleArticleLike(articleId, userId).then((result) => {
        const liked = result.like ? "liked" : "unliked";
        return res.status(200).json({ message: liked });
      });
    } catch (error) {
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

export default router;