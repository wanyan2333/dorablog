-- DROP TABLE IF EXISTS users;

-- CREATE TABLE IF NOT EXISTS users (
--   id            INTEGER PRIMARY KEY AUTOINCREMENT,
--   username      TEXT UNIQUE NOT NULL,
--   passwordHash  TEXT NOT NULL,
--   realname      TEXT DEFAULT '',
--   birthdate     TEXT DEFAULT '',
--   admin         INTEGER DEFAULT 0,
--   description   TEXT DEFAULT '',
--   avatarUrl     TEXT DEFAULT '',
--   createdAt     TEXT DEFAULT (datetime('now'))
-- );

-- CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 示例用户（username: Zachary, 密码: password123）
-- 下方为 bcrypt 10 轮哈希：`password123`

DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Articles;
DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS Images;
DROP TABLE IF EXISTS ArticleImg;
DROP TABLE IF EXISTS ArticleLike;
DROP TABLE IF EXISTS ArticleTag;

-- Create messages table
CREATE TABLE Messages (
    id INTEGER NOT NULL PRIMARY KEY,
    message TEXT
);

-- Create users information table
CREATE TABLE Users (
    id INTEGER NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    realname VARCHAR(100),
    birthdate TEXT DEFAULT '',
    admin BOOLEAN DEFAULT FALSE,
    description TEXT,
    avatarUrl TEXT,
    UNIQUE(username)
);

-- Create articles table
CREATE TABLE Articles (
    id INTEGER NOT NULL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    date DATETIME NOT NULL,
    content TEXT,
    userId INTEGER,
    headerUrl TEXT,
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Create comments table
CREATE TABLE Comments (
    id INTEGER NOT NULL PRIMARY KEY,
    date DATETIME NOT NULL,
    content TEXT,
    userId INTEGER,
    articleId INTEGER,
    parentCommentId INTEGER,
    FOREIGN KEY (userId) REFERENCES Users(id),
    FOREIGN KEY (articleId) REFERENCES Articles(id),
    FOREIGN KEY (parentCommentId) REFERENCES Comments(id)
);

-- Create images table
CREATE TABLE Images (
    id INTEGER NOT NULL PRIMARY KEY,
    url TEXT
);

-- Create article and image relation table
CREATE TABLE ArticleImg (
    articleId INTEGER NOT NULL,
    imgUrl TEXT NOT NULL,
    PRIMARY KEY (articleId, imgUrl),
    FOREIGN KEY (articleId) REFERENCES Articles(id)
);

-- Create article and like relation table
CREATE TABLE ArticleLike (
    articleId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    PRIMARY KEY (articleId, userId),
    FOREIGN KEY (articleId) REFERENCES Articles(id),
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Create article and tag relation table
CREATE TABLE ArticleTag (
    articleId INTEGER NOT NULL,
    tag VARCHAR(50) NOT NULL,
    color VARCHAR(20),
    PRIMARY KEY (articleId, tag),
    FOREIGN KEY (articleId) REFERENCES Articles(id)
);

-- Dummy messages data
INSERT INTO Messages (message) VALUES
    ('Hello, world!'),
    ('Gotta catch ''em all!');

-- Dummy user data (with bcrypt hashed passwords)
-- Note: These are example hashed passwords for testing
INSERT INTO Users (username, passwordHash, realname, admin, description, avatarUrl) VALUES
    ('admin', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Admin User', TRUE, 'Administrator of the system.', 'http://example.com/avatar1.jpg'),
    ('johndoe', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'John Doe', FALSE, 'Just a regular user.', 'http://example.com/avatar2.jpg'),
    ('janedoe', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Jane Doe', FALSE, 'Loves to read articles.', 'http://example.com/avatar3.jpg'),
    ('alice', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Alice Smith', FALSE, 'Enjoys writing comments.', 'http://example.com/avatar4.jpg'),
    ('bob', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Bob Johnson', FALSE, 'Avid article liker.', 'http://example.com/avatar5.jpg'),
    ('charlie', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Charlie Brown', FALSE, 'Tech enthusiast.', 'http://example.com/avatar6.jpg'),
    ('david', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'David Wilson', FALSE, 'Travel lover.', 'http://example.com/avatar7.jpg'),
    ('eve', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Eve Davis', FALSE, 'Food blogger.', 'http://example.com/avatar8.jpg'),
    ('frank', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Frank Miller', FALSE, 'Sports fan.', 'http://example.com/avatar9.jpg'),
    ('grace', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Grace Lee', FALSE, 'Health and wellness advocate.', 'http://example.com/avatar10.jpg');

-- Dummy articles data
INSERT INTO Articles (title, date, content, userId, headerUrl) VALUES
    ('First Article', '2024-01-01 10:00:00', 'This is the content of the first article.', 2, 'http://example.com/header1.jpg'),
    ('Second Article', '2024-01-02 11:00:00', 'This is the content of the second article.', 3, 'http://example.com/header2.jpg'),
    ('Third Article', '2024-01-03 12:00:00', 'This is the content of the third article.', 4, 'http://example.com/header3.jpg'),
    ('Fourth Article', '2024-01-04 13:00:00', 'This is the content of the fourth article.', 5, 'http://example.com/header4.jpg'),
    ('Fifth Article', '2024-01-05 14:00:00', 'This is the content of the fifth article.', 6, 'http://example.com/header5.jpg'),
    ('Sixth Article', '2024-01-06 15:00:00', 'This is the content of the sixth article.', 7, 'http://example.com/header6.jpg'),
    ('Seventh Article', '2024-01-07 16:00:00', 'This is the content of the seventh article.', 8, 'http://example.com/header7.jpg'),
    ('Eighth Article', '2024-01-08 17:00:00', 'This is the content of the eighth article.', 9, 'http://example.com/header8.jpg');

-- Dummy comments data
INSERT INTO Comments (date, content, userId, articleId, parentCommentId) VALUES
    ('2024-01-01 12:00:00', 'Great article!', 3, 1, NULL),
    ('2024-01-01 12:30:00', 'Thanks for sharing.', 4, 1, NULL),
    ('2024-01-02 13:00:00', 'Interesting read.', 5, 2, NULL),
    ('2024-01-02 13:15:00', 'I learned a lot.', 6, 2, 2),
    ('2024-01-03 15:00:00', 'Well written!', 7, 3, NULL),
    ('2024-01-03 15:20:00', 'Looking forward to more.', 8, 3, 3),
    ('2024-01-04 10:30:00', 'Nice insights.', 9, 4, NULL),
    ('2024-01-04 10:45:00', 'Appreciate the info.', 10, 4, 4),
    ('2024-01-05 17:00:00', 'Very helpful.', 2, 5, NULL),
    ('2024-01-05 17:15:00', 'Good job!', 3, 5, NULL),
    ('2024-01-06 14:30:00', 'Excellent article.', 4, 6, NULL),
    ('2024-01-06 14:45:00', 'Keep it up!', 5, 6, NULL),
    ('2024-01-07 16:00:00', 'Loved it!', 6, 7, 10),
    ('2024-01-07 16:20:00', 'Very informative.', 7, 7, NULL),
    ('2024-01-08 13:30:00', 'Great insights.', 8, 8, NULL);

-- Dummy images data
INSERT INTO Images (url) VALUES
    ('http://example.com/image1.jpg'),
    ('http://example.com/image2.jpg'),
    ('http://example.com/image3.jpg'),
    ('http://example.com/image4.jpg'),
    ('http://example.com/image5.jpg');

-- Dummy article-image relations
INSERT INTO ArticleImg (articleId, imgUrl) VALUES
    (1, 'http://example.com/image1.jpg'),
    (1, 'http://example.com/image2.jpg'),
    (2, 'http://example.com/image3.jpg'),
    (3, 'http://example.com/image4.jpg'),
    (4, 'http://example.com/image5.jpg'),
    (5, 'http://example.com/image1.jpg'),
    (6, 'http://example.com/image2.jpg'),
    (7, 'http://example.com/image3.jpg'),
    (8, 'http://example.com/image4.jpg');

-- Dummy article-like relations
INSERT INTO ArticleLike (articleId, userId) VALUES
    (1, 3),
    (1, 4),
    (2, 5),
    (2, 6),
    (3, 7),
    (4, 8),
    (5, 9),
    (6, 10),
    (7, 2),
    (8, 3);

-- Dummy article-tag relations
INSERT INTO ArticleTag (articleId, tag, color) VALUES
    (1, 'Tech', 'blue'),
    (1, 'News', 'red'),
    (2, 'Health', 'green'),
    (3, 'Lifestyle', 'purple'),
    (4, 'Travel', 'orange'),
    (5, 'Food', 'yellow'),
    (6, 'Education', 'pink'),
    (7, 'Entertainment', 'cyan'),
    (8, 'Sports', 'magenta');