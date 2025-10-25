import { getDatabase } from "./database.js";

/**
 * Gets all articles in the database.
 * 
 * @returns array of article objects
 */
export async function getAllArticles() {
  const db = await getDatabase();
  const articles = await db.all("SELECT * FROM Articles");
  return articles;
}

/**
 * Gets the article with the given articleId, if it exists.
 * @param {number} articleId the article id
 * @returns article object if found, null otherwise
 */
export async function getArticleById(articleId) {
  const db = await getDatabase();
  const article = await db.get("SELECT * FROM Articles WHERE id = ?", articleId);
  return article;
}

/**
 * Gets all articles written by the user with the given userId.
 * @param {number} userId the user id
 * @returns array of article objects
 */
export async function getArticlesByUserId(userId) {
  const db = await getDatabase();
  const articles = await db.all("SELECT * FROM Articles WHERE userId = ?", userId);
  return articles;
}


/** * Searches articles based on the given keyword.
 * The search looks for matches in articleId, userId, title, content, and author's username.
 * @param {string|number} keyword the search keyword
 * @returns array of matching article objects
 */
export async function searchArticles(keyword) {
  const db = await getDatabase();
  const clauses = [];
  const values = [];

  const has = (v) => v !== undefined && v !== null && v !== "";

  // empty keyword -> return all articles
  if (!has(keyword)) {
    return await db.all("SELECT * FROM Articles");
  }

  // treat pure-digit keywords as potential articleId / userId matches
  const isNumeric = /^\d+$/.test(String(keyword));
  const likePattern = `%${keyword}%`;

  if (isNumeric) {
    clauses.push("Articles.id = ?");
    values.push(Number(keyword));
    clauses.push("Articles.userId = ?");
    values.push(Number(keyword));
  }

  // search title/content and author's username
  clauses.push("Articles.title LIKE ?");
  values.push(likePattern);
  clauses.push("Articles.content LIKE ?");
  values.push(likePattern);
  clauses.push("Users.username LIKE ?");
  values.push(likePattern);

  const sql = `SELECT Articles.* FROM Articles LEFT JOIN Users ON Articles.userId = Users.id WHERE ${clauses.join(" OR ")}`;

  const articles = await db.all(sql, ...values);
  return articles;
}


/**
 * Gets all users who liked the article with the given articleId.
 * @param {number} articleId the article id
 * @returns array of user objects who liked the article
 */
export async function getLikedUsers(articleId) {
  const db = await getDatabase();
  const likedUsers = await db.all("SELECT * FROM ArticleLike WHERE articleId = ?", articleId);
  return likedUsers;
}

/**
 * Toggle like for an article by a user.
 * If the user already liked the article the row is deleted (unlike).
 * If the user hasn't liked the article the row is inserted (like).
 *
 * @param {number} articleId
 * @param {number} userId
 * @returns {Object} { liked: boolean, changes: number | null }
 */
export async function toggleArticleLike(articleId, userId) {
  const db = await getDatabase();

  if (articleId === undefined || userId === undefined) {
    throw new Error("articleId and userId are required");
  }

  const aid = Number(articleId);
  const uid = Number(userId);
  if (Number.isNaN(aid) || Number.isNaN(uid)) {
    throw new Error("articleId and userId must be numbers");
  }

  // check existing like
  const existing = await db.get(
    "SELECT 1 FROM ArticleLike WHERE articleId = ? AND userId = ?",
    aid,
    uid
  );

  console.log("Existing like:", existing);
  
  if (existing) {
    // unlike -> remove row
    const res = await db.run(
      "DELETE FROM ArticleLike WHERE articleId = ? AND userId = ?",
      aid,
      uid
    );
    return { liked: false, changes: res.changes ?? null };
  } else {
    // like -> insert row
    const res = await db.run(
      "INSERT INTO ArticleLike (articleId, userId) VALUES (?, ?)",
      aid,
      uid
    );
    return { liked: true, changes: res.changes ?? null };
  }
}

/**
 * Creates a new article in the database.
 * @param {Object} articleData - The article data
 * @param {string} articleData.title - The article title
 * @param {string} articleData.content - The article content
 * @param {number} articleData.userId - The user ID who created the article
 * @param {string} articleData.headerUrl - The header image URL (optional)
 * @param {string} articleData.tag - The article tag
 * @returns {Object} The created article object
 */
export async function createArticle(articleData) {
  const db = await getDatabase();
  const { title, content, userId, headerUrl, tag } = articleData;
  
  if (!title || !content || !userId) {
    throw new Error("Title, content, and userId are required");
  }
  
  // Insert the article
  const result = await db.run(
    `INSERT INTO Articles (title, content, userId, headerUrl, date) 
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [title, content, userId, headerUrl || null]
  );
  
  const articleId = result.lastID;
  
  // Add tag if provided
  if (tag) {
    await db.run(
      "INSERT INTO ArticleTag (articleId, tag, color) VALUES (?, ?, ?)",
      [articleId, tag, getTagColor(tag)]
    );
  }
  
  // Return the created article
  const createdArticle = await getArticleById(articleId);
  return createdArticle;
}

/**
 * Gets the color for a tag (simple color assignment)
 * @param {string} tag - The tag name
 * @returns {string} The color for the tag
 */
function getTagColor(tag) {
  const colors = {
    'Technology': 'blue',
    'Lifestyle': 'green', 
    'Travel': 'orange',
    'Game': 'purple',
    'Health': 'red',
    'Food': 'yellow',
    'Education': 'cyan',
    'Entertainment': 'pink',
    'Sports': 'magenta',
    'News': 'gray'
  };
  return colors[tag] || 'gray';
}


