# DoraBlog Backend API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [Authentication Endpoints](#authentication-endpoints)
- [User Endpoints](#user-endpoints)
- [Article Endpoints](#article-endpoints)
- [Comment Endpoints](#comment-endpoints)
- [Image/Upload Endpoints](#imageupload-endpoints)
- [Error Responses](#error-responses)

---

## Overview

This API uses RESTful principles and returns JSON responses. Authentication is handled via JWT tokens stored in HTTP-only cookies.

**Base URL:** `http://localhost:3000/api`

**Authentication:** JWT tokens are automatically included in requests via cookies after login.

**Content-Type:** All POST/PUT/PATCH requests should use `application/json` unless uploading files (then use `multipart/form-data`).

---

## Authentication

Most endpoints require authentication. The API uses JWT tokens stored in HTTP-only cookies.

- **Protected Routes:** Endpoints marked with `🔒` require authentication
- **Admin Only:** Endpoints marked with `🔐` require admin privileges
- **Public Routes:** Endpoints without symbols are publicly accessible

The `requireAuth` middleware validates the JWT token and adds user info to `req.user`:

```javascript
req.user = {
  id: number,
  username: string,
  admin: boolean
};
```

---

## Data Models

### User

```javascript
{
  id: number,
  username: string,          // 3-20 characters, alphanumeric + underscore
  passwordHash: string,       // bcrypt hashed (not returned in responses)
  realname: string,
  birthdate: string,          // ISO date string or empty
  admin: boolean,
  description: string,
  avatarUrl: string
}
```

### Article

```javascript
{
  id: number,
  title: string,              // max 200 characters
  date: string,               // ISO datetime
  content: string,            // max 100,000 characters
  userId: number,
  username: string,           // author's username (joined)
  headerUrl: string,          // header image URL
  likeCount: number,          // number of likes
  tags: Array<{tag: string, color: string}>,
  images: Array<string>       // content image URLs
}
```

### Comment

```javascript
{
  id: number,
  date: string,               // ISO datetime
  content: string,
  userId: number,
  articleId: number,
  parentCommentId: number | null,
  username: string,           // author's username
  isAdmin: boolean,
  avatarUrl: string,
  childrenComments: Array<Comment>  // nested replies
}
```

### ArticleLike

```javascript
{
  articleId: number,
  userId: number
}
```

### Tag

```javascript
{
  tag: string,
  color: string,
  count: number               // usage count
}
```

---

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**

```json
{
  "username": "john_doe", // Required: 3-20 chars, alphanumeric + underscore
  "password": "SecurePass123!", // Required: min 8 chars, must meet strength requirements
  "confirm": "SecurePass123!", // Required: must match password
  "realname": "John Doe", // Optional
  "birthdate": "1990-01-01", // Optional: ISO date
  "description": "Bio text", // Optional
  "avatar": "/avatars/img.png" // Optional: avatar URL
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Success Response (201):**

```json
{
  "message": "Registration successful",
  "passwordStrength": "strong"
}
```

**Error Responses:**

- `400` Missing required fields
- `400` Passwords do not match
- `400` Password does not meet security requirements
- `400` Username validation failed
- `409` Username already taken
- `500` Server error

---

### Check Username Availability

**GET** `/api/auth/registered?username={username}`

Check if a username is already registered.

**Query Parameters:**

- `username` (required): Username to check

**Success Response (200):**

```json
{
  "registered": true // or false
}
```

**Error Responses:**

- `400` Missing username parameter
- `500` Server error

---

### Login

**POST** `/api/auth/login`

Authenticate a user and receive a JWT token (set as HTTP-only cookie).

**Request Body:**

```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Success Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "admin": false
  }
}
```

**Sets Cookie:** `token` (JWT, HTTP-only, 7 days expiry)

**Error Responses:**

- `400` Missing username or password
- `401` Invalid credentials
- `500` Server error

---

### Logout

**POST** `/api/auth/logout`

Clear the authentication cookie (logout current user).

**Success Response (200):**

```json
{
  "message": "Logout successful"
}
```

---

### Get Current User Info

**GET** `/api/auth/userInfo` 🔒

Get detailed information about the currently authenticated user.

**Success Response (200):**

```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "realname": "John Doe",
    "birthdate": "1990-01-01",
    "admin": false,
    "description": "Bio text",
    "avatarUrl": "/avatars/john.png"
  }
}
```

**Error Responses:**

- `401` Not authenticated
- `404` User not found
- `500` Server error

---

### Upload Avatar

**POST** `/api/auth/upload-avatar`

Upload an avatar image file.

**Request:** `multipart/form-data`

- `avatar` (file): Image file (max 2MB, image formats only)

**Success Response (200):**

```json
{
  "success": true,
  "avatarUrl": "/uploads/avatars/avatar-1234567890.jpg",
  "filename": "avatar-1234567890.jpg"
}
```

**Error Responses:**

- `400` No file uploaded
- `400` Only image files are allowed
- `500` Failed to upload avatar

---

## User Endpoints

### Get All Users

**GET** `/api/users` 🔐

Get a list of all users (admin only).

**Success Response (200):**

```json
[
  {
    "id": 1,
    "username": "john_doe",
    "realname": "John Doe",
    "admin": false,
    "description": "Bio",
    "avatarUrl": "/avatars/john.png"
  },
  ...
]
```

**Error Responses:**

- `401` Not authenticated
- `403` Not admin
- `500` Server error

---

### Get Current User

**GET** `/api/users/me` 🔒

Get information about the currently authenticated user.

**Success Response (200):**

```json
{
  "id": 1,
  "username": "john_doe",
  "realname": "John Doe",
  "admin": false,
  "description": "Bio",
  "avatarUrl": "/avatars/john.png"
}
```

**Error Responses:**

- `401` Not authenticated

---

### Update Current User

**PATCH** `/api/users/me` 🔒

Update the currently authenticated user's information.

**Request Body (all fields optional):**

```json
{
  "username": "new_username",
  "password": "NewSecurePass123!",
  "realname": "New Name",
  "birthdate": "1990-01-01",
  "description": "Updated bio",
  "avatarUrl": "/avatars/new.png"
}
```

**Success Response (200):**

```json
{
  "id": 1,
  "username": "new_username",
  "realname": "New Name",
  "admin": false,
  "description": "Updated bio",
  "avatarUrl": "/avatars/new.png"
}
```

**Note:** Password will be automatically hashed if provided.

**Error Responses:**

- `401` Not authenticated
- `422` Invalid update data
- `500` Server error

---

### Delete Current User Account

**DELETE** `/api/users/me` 🔒

Delete the currently authenticated user's account and all associated data (articles, comments).

**Success Response (204):** No content

**Note:** This action cascades and deletes all user's articles and comments.

**Error Responses:**

- `401` Not authenticated
- `500` Failed to delete user

---

### Delete User (Admin)

**DELETE** `/api/users/:id` 🔐

Delete a user account by ID (admin only).

**Path Parameters:**

- `id` (number): User ID to delete

**Success Response (204):** No content

**Error Responses:**

- `401` Not authenticated
- `403` Not admin
- `404` User not found
- `500` Failed to delete user

---

### Create User (Legacy)

**POST** `/api/users/Info`

Legacy endpoint for creating users. Use `/api/auth/register` instead.

**Request Body:**

```json
{
  "username": "john_doe",
  "password": "password",
  "realname": "John Doe",
  "birthdate": "1990-01-01",
  "description": "Bio",
  "avatarUrl": "/avatars/john.png"
}
```

**Success Response (200):**

```json
{
  "id": 1,
  "username": "john_doe",
  "realname": "John Doe"
}
```

**Error Responses:**

- `400` Invalid data
- `500` Internal server error

---

## Article Endpoints

### Get All Articles

**GET** `/api/articles`

Get all articles, optionally filtered by tag.

**Query Parameters:**

- `tag` (optional): Filter by tag name (e.g., "Technology", "Health")

**Success Response (200):**

```json
[
  {
    "id": 1,
    "title": "Getting Started with Web Development",
    "date": "2025-10-27T14:23:00",
    "content": "Article content...",
    "userId": 2,
    "username": "johndoe",
    "headerUrl": "https://example.com/header.jpg",
    "likeCount": 8,
    "tags": [
      {"tag": "Technology", "color": "blue"}
    ],
    "images": [
      "https://example.com/img1.jpg",
      "https://example.com/img2.jpg"
    ]
  },
  ...
]
```

**Error Responses:**

- `500` Internal server error

---

### Get All Tags

**GET** `/api/articles/tags`

Get all article tags with usage counts.

**Success Response (200):**

```json
[
  {
    "tag": "Technology",
    "color": "blue",
    "count": 15
  },
  {
    "tag": "Health",
    "color": "red",
    "count": 12
  },
  ...
]
```

**Error Responses:**

- `500` Internal server error

---

### Get Liked Articles

**GET** `/api/articles/liked` 🔒

Get all articles liked by the currently authenticated user.

**Success Response (200):**

```json
[
  {
    "id": 1,
    "title": "Article Title",
    "date": "2025-10-27T14:23:00",
    "content": "Content...",
    "userId": 2,
    "username": "johndoe",
    "headerUrl": "https://example.com/header.jpg",
    "likeCount": 8,
    "tags": [...],
    "images": [...]
  },
  ...
]
```

**Error Responses:**

- `401` Not authenticated
- `500` Internal server error

---

### Get Articles by User

**GET** `/api/articles/user/:id`

Get all articles created by a specific user.

**Path Parameters:**

- `id` (number): User ID

**Success Response (200):**

```json
[
  {
    "id": 1,
    "title": "Article Title",
    "date": "2025-10-27T14:23:00",
    "content": "Content...",
    "userId": 2,
    "username": "johndoe",
    "headerUrl": "https://example.com/header.jpg",
    "likeCount": 8,
    "tags": [...],
    "images": [...]
  },
  ...
]
```

**Error Responses:**

- `500` Internal server error

---

### Search Articles

**GET** `/api/articles/search?keyword={keyword}`

Search articles by keyword in title, content, author username, or by article/user ID.

**Query Parameters:**

- `keyword` (required): Search term (string or number)

**Search Behavior:**

- If keyword is numeric: searches article ID, user ID
- Always searches: title (LIKE), content (LIKE), author username (LIKE)

**Success Response (200):**

```json
[
  {
    "id": 1,
    "title": "Matching Article",
    "date": "2025-10-27T14:23:00",
    "content": "Content with keyword...",
    "userId": 2,
    "username": "johndoe",
    "headerUrl": "https://example.com/header.jpg",
    "likeCount": 8,
    "tags": [...],
    "images": [...]
  },
  ...
]
```

**Error Responses:**

- `500` Internal server error

---

### Get Article by ID

**GET** `/api/articles/:id`

Get a specific article by ID.

**Path Parameters:**

- `id` (number): Article ID

**Success Response (200):**

```json
{
  "id": 1,
  "title": "Article Title",
  "date": "2025-10-27T14:23:00",
  "content": "Full article content...",
  "userId": 2,
  "username": "johndoe",
  "headerUrl": "https://example.com/header.jpg",
  "likeCount": 8,
  "tags": [{ "tag": "Technology", "color": "blue" }],
  "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
}
```

**Error Responses:**

- `404` Article not found
- `500` Internal server error

---

### Check if Article is Liked

**GET** `/api/articles/:id/liked` 🔒

Check if the current user has liked a specific article.

**Path Parameters:**

- `id` (number): Article ID

**Success Response (200):**

```json
{
  "liked": true // or false
}
```

**Error Responses:**

- `401` Not authenticated
- `500` Internal server error

---

### Get Article Recommendations

**GET** `/api/articles/:id/recommendations?limit={limit}`

Get recommended articles based on the given article (same tag, sorted by like count).

**Path Parameters:**

- `id` (number): Article ID

**Query Parameters:**

- `limit` (optional, default: 5): Maximum number of recommendations

**Success Response (200):**

```json
[
  {
    "id": 5,
    "title": "Related Article",
    "date": "2025-10-28T10:00:00",
    "userId": 3,
    "username": "janedoe",
    "headerUrl": "https://example.com/header.jpg",
    "likeCount": 15,
    "tags": [{"tag": "Technology", "color": "blue"}]
  },
  ...
]
```

**Error Responses:**

- `400` Invalid article ID
- `500` Internal server error

---

### Create Article

**POST** `/api/articles` 🔒

Create a new article.

**Request Body:**

```json
{
  "title": "Article Title", // Required, max 200 chars
  "content": "Article content...", // Required, max 100,000 chars
  "tag": "Technology", // Optional
  "headerImage": "https://...", // Optional, header image URL
  "contentImages": [
    // Optional, array of content image URLs
    "https://...",
    "https://..."
  ]
}
```

**Success Response (201):**

```json
{
  "message": "Article created successfully",
  "article": {
    "id": 15,
    "title": "Article Title",
    "date": "2025-11-04T10:30:00",
    "content": "Article content...",
    "userId": 1,
    "username": "john_doe",
    "headerUrl": "https://...",
    "likeCount": 0,
    "tags": [{ "tag": "Technology", "color": "blue" }],
    "images": ["https://...", "https://..."]
  }
}
```

**Error Responses:**

- `401` Not authenticated
- `400` Title and content are required
- `400` Title must be less than 200 characters
- `400` Content must be less than 100,000 characters
- `500` Internal server error

---

### Update Article

**PUT** `/api/articles/:id` 🔒

Update an existing article (author or admin only).

**Path Parameters:**

- `id` (number): Article ID

**Request Body:**

```json
{
  "content": "Updated content...", // Required
  "contentImages": [
    // Optional
    "https://...",
    "https://..."
  ]
}
```

**Success Response (200):**

```json
{
  "message": "Article updated successfully"
}
```

**Error Responses:**

- `401` Not authenticated
- `403` You don't have permission to edit this article
- `404` Article not found
- `400` Invalid article ID
- `400` Content is required
- `500` Internal server error

---

### Delete Article

**DELETE** `/api/articles/:id` 🔒

Delete an article and all related data (comments, likes, tags, images). Author or admin only.

**Path Parameters:**

- `id` (number): Article ID

**Success Response (200):**

```json
{
  "message": "Article deleted successfully",
  "articleId": 15
}
```

**Note:** Cascades deletion of:

- All comments on the article
- All likes on the article
- All article tags
- All article images

**Error Responses:**

- `401` Not authenticated
- `403` You don't have permission to delete this article
- `404` Article not found
- `400` Invalid article ID
- `500` Internal server error

---

### Toggle Article Like

**POST** `/api/articles/like/:id` 🔒

Like or unlike an article.

**Path Parameters:**

- `id` (number): Article ID

**Success Response (200):**

```json
{
  "liked": true, // true if now liked, false if unliked
  "likeCount": 9 // updated like count
}
```

**Behavior:**

- If user hasn't liked the article: creates a like
- If user has already liked the article: removes the like

**Error Responses:**

- `401` Not authenticated
- `500` Internal server error

---

### Upload Article Image

**POST** `/api/articles/upload-image`

Upload an image for article content (used by TinyMCE editor).

**Request:** `multipart/form-data`

- `image` (file): Image file (max 10MB, image formats only)

**Success Response (200):**

```json
{
  "location": "/uploads/articles/article-1234567890.jpg", // TinyMCE format
  "success": true,
  "imageUrl": "/uploads/articles/article-1234567890.jpg",
  "filename": "article-1234567890.jpg"
}
```

**Error Responses:**

- `400` No file uploaded
- `400` Only image files are allowed
- `500` Failed to upload image

---

## Comment Endpoints

### Get Article Comments

**GET** `/api/comments/articles/:id`

Get all comments for a specific article with nested replies.

**Path Parameters:**

- `id` (number): Article ID

**Success Response (200):**

```json
[
  {
    "id": 1,
    "date": "2024-01-01 12:00:00",
    "content": "Great article!",
    "userId": 3,
    "articleId": 1,
    "parentCommentId": null,
    "username": "alice",
    "isAdmin": false,
    "childrenComments": [
      {
        "id": 3,
        "date": "2024-01-02 13:00:00",
        "content": "I agree!",
        "userId": 5,
        "articleId": 1,
        "parentCommentId": 1,
        "username": "bob",
        "isAdmin": false,
        "childrenComments": []
      }
    ]
  },
  ...
]
```

**Note:** Comments are returned in nested tree structure with `childrenComments` array for replies.

**Error Responses:**

- `500` Internal server error

---

### Create Comment

**POST** `/api/comments` 🔒

Create a new comment or reply to an existing comment.

**Request Body:**

```json
{
  "content": "This is a comment", // Required
  "articleId": 1, // Required
  "parentCommentId": 5 // Optional, for replies
}
```

**Success Response (201):**

```json
{
  "id": 42,
  "date": "2025-11-04T10:30:00",
  "content": "This is a comment",
  "userId": 1,
  "articleId": 1,
  "parentCommentId": 5,
  "username": "john_doe",
  "isAdmin": false,
  "avatarUrl": "/avatars/john.png"
}
```

**Error Responses:**

- `401` Not authenticated
- `400` Content and articleId are required
- `500` Internal server error

---

### Delete Comment

**DELETE** `/api/comments/:id` 🔒

Delete a comment. Can be deleted by:

- Comment author
- Article author
- Admin

**Path Parameters:**

- `id` (number): Comment ID

**Success Response (200):**

```json
{
  "message": "Comment deleted"
}
```

**Note:** Deletion cascades to all child comments (replies).

**Error Responses:**

- `401` Not authenticated
- `403` Not authorized to delete this comment
- `404` Comment not found
- `500` Internal server error

---

## Image/Upload Endpoints

### Serve Static Images

**GET** `/images/:filename`

Serve static image files from `backend/public/images`.

**Path Parameters:**

- `filename` (string): Image filename

**Example:**

```
GET /images/Dragonite.png
```

**Success Response (200):** Image file (binary)

**Error Responses:**

- `404` Image not found

---

### Serve Uploaded Files

**GET** `/uploads/avatars/:filename`

Serve uploaded avatar images from `backend/public/uploads/avatars`.

**GET** `/uploads/articles/:filename`

Serve uploaded article images from `backend/public/uploads/articles`.

**Path Parameters:**

- `filename` (string): Uploaded file name

**Success Response (200):** Image file (binary)

**Error Responses:**

- `404` File not found

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "error": "Error message description",
  "details": ["Optional array of detailed errors"],
  "suggestions": ["Optional array of suggestions"]
}
```

### Common HTTP Status Codes

- **200 OK:** Request succeeded
- **201 Created:** Resource created successfully
- **204 No Content:** Request succeeded, no response body
- **400 Bad Request:** Invalid request data/parameters
- **401 Unauthorized:** Authentication required or failed
- **403 Forbidden:** Authenticated but not authorized
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource conflict (e.g., username taken)
- **422 Unprocessable Entity:** Validation error
- **500 Internal Server Error:** Server error

---

## Database Schema

### ER Diagram Summary

**Users:** <ins>id</ins>, username, passwordHash, realname, birthdate, admin, description, avatarUrl

**Articles:** <ins>id</ins>, title, date, content, _userId_, headerUrl

**Comments:** <ins>id</ins>, date, content, _userId_, _articleId_, _parentCommentId_

**Images:** <ins>id</ins>, url

**ArticleImg:** _<ins>articleId</ins>_, <ins>imgUrl</ins>

**ArticleLike:** _<ins>articleId</ins>_, _<ins>userId</ins>_

**ArticleTag:** _<ins>articleId</ins>_, <ins>tag</ins>, color

**Messages:** <ins>id</ins>, message (legacy/testing table)

---

## Implementation Notes

### Password Hashing

- Uses bcrypt with 10 rounds
- Passwords are validated for strength before registration
- Password verification uses constant-time comparison

### JWT Tokens

- Stored in HTTP-only cookies for security
- 7-day expiration
- Contains: `{ id, username, admin }`
- Uses `JWT_SECRET` environment variable (defaults to "dev" in development)

### File Uploads

- Avatars: Max 2MB, stored in `public/uploads/avatars/`
- Article images: Max 10MB, stored in `public/uploads/articles/`
- Filenames: `{type}-{timestamp}-{random}.{ext}`

### Article Like Toggle

```javascript
// Check if like exists
SELECT 1 FROM ArticleLike WHERE articleId = ? AND userId = ?

// If exists, remove like
DELETE FROM ArticleLike WHERE articleId = ? AND userId = ?

// If not exists, add like
INSERT INTO ArticleLike (articleId, userId) VALUES (?, ?)
```

### Comment Nesting

- Comments support unlimited nesting depth
- `parentCommentId` = `null` for top-level comments
- `buildNestedComments()` utility builds tree structure
- Deletion cascades to all child comments

### Search Implementation

```sql
SELECT Articles.* FROM Articles
LEFT JOIN Users ON Articles.userId = Users.id
WHERE
  Articles.id = ? OR
  Articles.userId = ? OR
  Articles.title LIKE ? OR
  Articles.content LIKE ? OR
  Users.username LIKE ?
```

---

## Testing & Development

### Example cURL Commands

**Register:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!",
    "confirm": "TestPass123!",
    "realname": "Test User"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

**Get All Articles:**

```bash
curl http://localhost:3000/api/articles
```

**Create Article (Authenticated):**

```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "My New Article",
    "content": "This is the content...",
    "tag": "Technology"
  }'
```

**Like Article (Authenticated):**

```bash
curl -X POST http://localhost:3000/api/articles/like/1 \
  -b cookies.txt
```

**Create Comment (Authenticated):**

```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "content": "Great article!",
    "articleId": 1
  }'
```

---

## Version History

**Current Version:** 1.0  
**Last Updated:** November 4, 2025  
**Maintained By:** Blue Cat Four Team
