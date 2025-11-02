# Markdown syntax guide

## APIs

/api/auth(post) // authenticate a user (log that user in) and return the JWT auth token
username, password Finished

/api/auth(delete) // invalidate the authToken cookie, essentially causing that user to be logged out Finished

/api/users(get) 需要管理员权限 need to be admin, return all users' info Finished

/api/users/me(get) // return the user info for the currently authenticated user Finished

/api/users/me(patch) // allow requesters to update the currently authenticated user's info Finished

/api/users/:id(delete) // delete a user

/api/users/Info(get) // get info of user

/api/users/Info(post) // creat new user, register
username, password, realname, birthdate, description, avatarUrl
Finished

/api/articles(post) // post new article

/api/articles/:id(get) // get a certain article Finished

/api/articles(get) // get all articles Finished

/api/articles/search(get) // search articles Finished

/api/articles/user/:id(get) // get all the articles posted by user Finished

/api/articles/like/:id(put) // like an article Finished

/api/comments/articles/:id(get) // get all comments of an article

/api/comments(post) // post new comment Finished

/api/comments/:id(put) // update present comment

/api/comments/:id(delete) // delete certain comment

/images/:id(get) ?? // how to get remote images

| Parameters |   Type    | Optional/Must |  Meaning  |
| ---------- | :-------: | :-----------: | :-------: |
| left foo   | right foo |   right foo   | right foo |
| left bar   | right bar |   right foo   | right foo |
| left baz   | right baz |   right foo   | right foo |

## ER diagram

UserInfo: <ins>id</ins>, username, password, realname, admin, description, \* _avatarId_

Articles: <ins>id</ins>, title, date, content, _*userId*, \_\_headerUrl_

Comments: <ins>id</ins>, date, content, _*userId*, \_\_articleId_, \*_parentCommentId_

Images: <ins>id</ins>, url ??

ArticleImg: _*<ins>articleId</ins>*, \_\_<ins>imgId</ins>_

ArticleLike: _*<ins>articleId</ins>*, \_\_<ins>userId</ins>_

ArticleTag: \*_<ins>articleId</ins>_, <ins>tag</ins>

# Backend API Reference (implemented endpoints)

Notes

- Authenticated endpoints require a valid JWT in the auth cookie (middleware: requiresAuth).
- db helpers:
  - db.get -> single row object or undefined
  - db.all -> array of rows
  - db.run -> { lastID, changes } for write ops
- Route ordering: specific routes (e.g. /search, /user/:id) must appear before catch-all param routes like /:id.

Data models (commonly returned)

- User: { id(number), username, password, realname, birthdate(date), admin(bool), description, avatarUrl }
- Article: { id, title, date, content, userId, headerUrl, likeCount? }
- Comment: { id, date, content, userId, articleId, parentCommentId }
- ArticleLike: { articleId, userId }

---

## Authentication

POST /api/auth

- Purpose: authenticate user and set auth cookie
- Body (JSON): { "username": "admin", "password": "secret" }
- Response 200 (success):
  {
  "id": 1,
  "username": "admin",
  "realname": "Admin User",
  "admin": true
  }
- Response 401: { "message": "Invalid credentials" }

DELETE /api/auth

- Purpose: logout (clear auth cookie)
- Response 200: { "message": "Logged out" }

---

## Users

GET /api/users

- Auth: admin required
- Response 200: [ { "id":1, "username":"admin", ... }, ... ]

GET /api/users/me

- Auth: required
- Response 200:
  {
  "id": 2,
  "username": "grace",
  "realname": "Grace Lee",
  "description": "...",
  "avatarUrl": "http://..."
  }

PATCH /api/users/me

- Auth: required
- Body (any subset): { "username":"new", "password":"newpass", "realname":"New Name", "description":"...", "avatarUrl":"..." }
- Response 200: updated user object

DELETE /api/users/:id

- Auth: typically admin
- Response 200: { "message": "User deleted" } or 404 if not found

GET /api/users/Info

- Purpose: get user info (implementation-specific query)
- Response 200: user info object

POST /api/users/Info

- Purpose: register new user
- Body: { "username":"joe", "password":"pass", "realname":"Joe", "birthdate":"1990-01-01", "description":"", "avatarUrl":"" }
- Response 201: created user object
- Response 400: validation error

Example register request:
Request:
{
"username":"joe",
"password":"pass",
"realname":"Joe Bloggs"
}
Response 201:
{
"id": 10,
"username": "joe",
"realname": "Joe Bloggs"
}

---

## Articles

GET /api/articles

- Purpose: return all articles (each article may include likeCount)
- Response 200:
  [
  { "id": 1, "title":"First", "content":"...", "userId":1, "likeCount":3 },
  ...
  ]

GET /api/articles/:id

- Purpose: get a single article
- Response 200: article object
- Response 404: { "message":"Article not found" }

POST /api/articles

- Auth: required
- Body: { "title":"New", "content":"...", "headerUrl":"http://..." }
- Response 201: created article (db.lastID may be returned by implementation)

GET /api/articles/search?keyword=...

- Purpose: search articles by id, userId, title, content, or author's username
- Query param: keyword (string or number)
- Response 200: array of matching articles

Example search:
GET /api/articles/search?keyword=First
Response 200:
[
{ "id":1, "title":"First Post", "content":"...", "userId":1 }
]

GET /api/articles/user/:id

- Purpose: articles by user
- Response 200: [ { article }, ... ]

POST /api/articles/like/:id

- Auth: required
- Path param: :id = articleId
- Purpose: toggle like for authenticated user
- Response 200 on success:
  { "message": "liked" } or { "message": "unliked" }

Example like request (auth cookie required):
POST /api/articles/like/5
Response 200:
{ "message": "liked" }

---

## Comments

GET /api/comments/articles/:id

- Purpose: get all comments for article id
- Response 200:
  [
  { "id": 1, "content":"Nice post", "userId":2, "articleId":5, "username":"Leo", "isAdmin":flase, "avatarUrl":Null,
  "childrenComments":["id": 2, "content":"I see", "userId":3, "articleId":5, "username":"Mai", "isAdmin":flase, "avatarUrl":Null,
  "childrenComments":["id": 3, "content":"Oh no", "userId":4, "articleId":5, "username":"Henry", "isAdmin":flase, "avatarUrl":Null]
  "id": 4, "content":"Yep", "userId":4, "articleId":5, "username":"Henry", "isAdmin":flase, "avatarUrl":Null] },
  ...
  ]

POST /api/comments

- Auth: required
- Purpose: create a comment.
- Body: { "content": "Nice!", "parentCommentId": null, "articleId": 1 }
- Response 201: created comment

PUT /api/comments/:id

- Auth: required (author/admin)
- Body: { "content": "Updated" }
- Response 200: updated comment

DELETE /api/comments/:id

- Auth: required (author/admin)
- Response 200: { "message": "Comment deleted" } or 404

---

## Images / Static

GET /images/:filename

- Purpose: serve static image files from backend/public/images
- Example: GET /images/Dragonite.png
- Response: 200 image bytes or 404

---

## Implementation notes and examples

- Toggle like implementation (articles-dao.toggleArticleLike):
  - checks existence with: SELECT 1 FROM ArticleLike WHERE articleId = ? AND userId = ?
  - if exists -> DELETE FROM ArticleLike ...
  - else -> INSERT INTO ArticleLike (articleId, userId) VALUES (?, ?)

- searchArticles behaviour:
  - If keyword is numeric, also attempts Articles.id = <n> and Articles.userId = <n>
  - Searches title/content with LIKE '%keyword%' and author's username via LEFT JOIN Users ON Articles.userId = Users.id
  - Example SQL fragment:
    SELECT Articles.\* FROM Articles
    LEFT JOIN Users ON Articles.userId = Users.id
    WHERE Articles.id = ? OR Articles.userId = ? OR Articles.title LIKE ? OR Articles.content LIKE ? OR Users.username LIKE ?

---

If you want, I can generate full example cURL commands for each endpoint or update this file in-place
