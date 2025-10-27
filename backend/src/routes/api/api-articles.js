import express from "express";
import { requiresAuthentication } from "../../middleware/auth-middleware.js";
import { getAllArticles, getArticleById, getArticlesByUserId, getLikedUsers, searchArticles, toggleArticleLike, createArticle, getRecommendedArticles } from "../../data/articles-dao.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const router = express.Router();

// 配置multer用于文章图片上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'articles');
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳 + 随机数 + 原扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'article-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

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
    
    if (content.length > 100000) {
      return res.status(400).json({ message: "Content must be less than 100,000 characters" });
    }
    
    // Create article data (使用默认用户ID进行测试)
    const articleData = {
      title: title.trim(),
      content: content.trim(),
      userId: 2, // 使用默认用户ID (johndoe)
      headerUrl: headerImage || null,
      tag: tag || null,
      contentImages: contentImages || [] // 传递图片URL数组
    };
    
    console.log('Creating article with images:', contentImages);
    
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
 * Sending a PUT request to /api/articles/:id will update an existing article.
 */
router.put("/:id", async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const { content, contentImages } = req.body;
    
    if (isNaN(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }
    
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }
    
    // 获取数据库连接
    const { getDatabase } = await import("../../data/database.js");
    const db = await getDatabase();
    
    // 更新文章内容
    await db.run(
      "UPDATE Articles SET content = ? WHERE id = ?",
      [content.trim(), articleId]
    );
    
    // 删除旧的内容图片
    await db.run("DELETE FROM ArticleImg WHERE articleId = ?", articleId);
    
    // 添加新的内容图片
    if (contentImages && contentImages.length > 0) {
      console.log('Updating content images:', contentImages);
      for (const imageUrl of contentImages) {
        await db.run(
          "INSERT INTO ArticleImg (articleId, imgUrl) VALUES (?, ?)",
          [articleId, imageUrl]
        );
      }
    }
    
    return res.status(200).json({
      message: "Article updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating article:", error);
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

// 文章图片上传端点（支持TinyMCE格式）
router.post("/upload-image", upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 返回图片URL
    const imageUrl = `/uploads/articles/${req.file.filename}`;
    
    console.log('Article image uploaded:', req.file.filename);
    
    // 同时支持TinyMCE格式（location）和自定义格式（success + imageUrl）
    res.json({ 
      location: imageUrl,  // TinyMCE官方格式
      success: true,       // 自定义格式
      imageUrl: imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Article image upload error:', error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;