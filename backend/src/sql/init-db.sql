DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  userName      TEXT UNIQUE NOT NULL,
  passwordHash  TEXT NOT NULL,
  realName      TEXT DEFAULT '',
  birthDate     TEXT DEFAULT '',
  admin         INTEGER DEFAULT 0,
  description   TEXT DEFAULT '',
  avatarUrl     TEXT DEFAULT '',
  createdAt     TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_userName ON users(userName);

-- 示例用户（userName: Zachary, 密码: password123）
-- 下方为 bcrypt 10 轮哈希：`password123`
INSERT INTO users (userName, passwordHash) VALUES
('Zachary', '$2b$10$C1wRj7h3wN9uAx1O1l0S3O4m4mA6m9QxP1iG5nH7w3W3e7s3nqC7e');
