import { getDatabase } from "./database.js";

/**
 * Gets the comments belong to certain article in the database.
 *
 * @param {number} articleId the article id
 * 
 * @returns array of comment objects
 */
export async function getCommentsByArticleId(articleId) {
  const db = await getDatabase();
  const comments = await db.all(
    "SELECT * FROM Comments WHERE articleId = ? ORDER BY date ASC",
    articleId
  );
  return comments;
}
