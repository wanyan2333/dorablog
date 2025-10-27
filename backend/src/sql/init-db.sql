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
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create comments table
CREATE TABLE Comments (
    id INTEGER NOT NULL PRIMARY KEY,
    date DATETIME NOT NULL,
    content TEXT,
    userId INTEGER,
    articleId INTEGER,
    parentCommentId INTEGER,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (articleId) REFERENCES Articles(id) ON DELETE CASCADE,
    FOREIGN KEY (parentCommentId) REFERENCES Comments(id) ON DELETE CASCADE
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
    FOREIGN KEY (articleId) REFERENCES Articles(id) ON DELETE CASCADE
);

-- Create article and like relation table
CREATE TABLE ArticleLike (
    articleId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    PRIMARY KEY (articleId, userId),
    FOREIGN KEY (articleId) REFERENCES Articles(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create article and tag relation table
CREATE TABLE ArticleTag (
    articleId INTEGER NOT NULL,
    tag VARCHAR(50) NOT NULL,
    color VARCHAR(20),
    PRIMARY KEY (articleId, tag),
    FOREIGN KEY (articleId) REFERENCES Articles(id) ON DELETE CASCADE
);

-- Dummy messages data
INSERT INTO Messages (message) VALUES
    ('Hello, world!'),
    ('Gotta catch ''em all!');

-- Dummy user data (with bcrypt hashed passwords and real avatars)
-- Note: These are example hashed passwords for testing
INSERT INTO Users (username, passwordHash, realname, admin, description, avatarUrl) VALUES
    ('admin', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Admin User', TRUE, 'Administrator of the system.', 'https://i.pravatar.cc/150?img=1'),
    ('johndoe', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'John Doe', FALSE, 'Just a regular user.', 'https://i.pravatar.cc/150?img=2'),
    ('janedoe', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Jane Doe', FALSE, 'Loves to read articles.', 'https://i.pravatar.cc/150?img=3'),
    ('alice', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Alice Smith', FALSE, 'Enjoys writing comments.', 'https://i.pravatar.cc/150?img=4'),
    ('bob', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Bob Johnson', FALSE, 'Avid article liker.', 'https://i.pravatar.cc/150?img=5'),
    ('charlie', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Charlie Brown', FALSE, 'Tech enthusiast.', 'https://i.pravatar.cc/150?img=6'),
    ('david', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'David Wilson', FALSE, 'Travel lover.', 'https://i.pravatar.cc/150?img=7'),
    ('eve', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Eve Davis', FALSE, 'Food blogger.', 'https://i.pravatar.cc/150?img=8'),
    ('frank', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Frank Miller', FALSE, 'Sports fan.', 'https://i.pravatar.cc/150?img=9'),
    ('grace', '$2b$10$rQZ8K9vL2nM3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Grace Lee', FALSE, 'Health and wellness advocate.', 'https://i.pravatar.cc/150?img=10');

-- Dummy articles data with real content and images
INSERT INTO Articles (title, date, content, userId, headerUrl) VALUES
    ('Getting Started with Web Development', '2024-01-01 10:00:00', 'Web development is an exciting field that combines creativity with technical skills. In this article, we will explore the fundamentals of building modern web applications. From HTML and CSS basics to JavaScript frameworks, you will learn the essential tools and concepts needed to start your journey as a web developer. Whether you are a complete beginner or looking to refresh your knowledge, this guide will provide you with a solid foundation.', 2, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop'),
    ('The Art of Photography', '2024-01-02 11:00:00', 'Photography is more than just pressing a button. It is about capturing moments, telling stories, and expressing emotions through images. In this comprehensive guide, we will explore composition techniques, lighting principles, and post-processing tips that will help you take your photography skills to the next level. Learn how to see the world through a photographer''s lens and create stunning visual narratives.', 3, 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&h=600&fit=crop'),
    ('Healthy Living: A Complete Guide', '2024-01-03 12:00:00', 'Living a healthy lifestyle is not just about diet and exercise. It encompasses mental well-being, quality sleep, stress management, and building positive relationships. This article provides practical tips and evidence-based advice on how to improve your overall health and wellness. Discover simple changes you can make today that will have a lasting impact on your quality of life.', 4, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=600&fit=crop'),
    ('Travel Adventures in Asia', '2024-01-04 13:00:00', 'Asia is a continent of incredible diversity, from bustling cities to serene temples, from tropical beaches to snow-capped mountains. Join me on a journey through some of the most fascinating destinations in Asia. We will explore hidden gems, taste exotic cuisines, and immerse ourselves in rich cultures. Whether you are planning your next trip or simply dreaming of far-off places, this travel guide will inspire your wanderlust.', 5, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop'),
    ('Mastering JavaScript in 2024', '2024-01-05 14:00:00', 'JavaScript continues to evolve and remains one of the most important programming languages for web development. In this in-depth tutorial, we will cover modern JavaScript features including ES6+ syntax, async/await patterns, and functional programming concepts. You will also learn about popular frameworks and libraries that make JavaScript development more efficient and enjoyable. Perfect for developers looking to stay current with the latest trends.', 6, 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=1200&h=600&fit=crop'),
    ('The Future of Artificial Intelligence', '2024-01-06 15:00:00', 'Artificial Intelligence is transforming every aspect of our lives, from healthcare to entertainment, from transportation to education. This article explores the latest developments in AI technology, including machine learning, neural networks, and natural language processing. We will discuss both the exciting possibilities and the ethical challenges that come with this powerful technology. Understanding AI is no longer optional - it is essential for navigating the future.', 7, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop'),
    ('Cooking Basics: From Kitchen to Table', '2024-01-07 16:00:00', 'Cooking is a life skill that everyone should master. This beginner-friendly guide covers essential cooking techniques, must-have kitchen tools, and simple recipes that will boost your confidence in the kitchen. Learn how to prepare delicious meals from scratch, understand flavor combinations, and develop your own culinary style. Whether you are cooking for yourself or entertaining guests, these fundamentals will serve you well.', 8, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=600&fit=crop'),
    ('Sustainable Living: Small Changes, Big Impact', '2024-01-08 17:00:00', 'Climate change is one of the greatest challenges of our time, but individual actions can make a real difference. This article presents practical ways to reduce your environmental footprint through sustainable living practices. From reducing waste and conserving energy to supporting eco-friendly businesses and making conscious consumer choices, you will discover how small changes in your daily routine can contribute to a healthier planet.', 9, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=600&fit=crop'),
    ('Fitness Journey: Building Strength and Endurance', '2024-01-09 18:00:00', 'Starting a fitness journey can be overwhelming, but it does not have to be. This comprehensive guide breaks down the essentials of building strength, improving cardiovascular health, and developing sustainable exercise habits. You will learn about different training methods, proper form and technique, nutrition for athletes, and how to stay motivated through challenges. Remember, fitness is not a destination but a lifelong journey.', 2, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=600&fit=crop'),
    ('Digital Marketing Strategies for 2024', '2024-01-10 19:00:00', 'The digital marketing landscape is constantly evolving, and staying ahead requires understanding the latest trends and strategies. This article covers everything from SEO and content marketing to social media advertising and email campaigns. Learn how to create compelling content, engage your audience, measure your results, and optimize your marketing efforts for maximum ROI. Whether you are a business owner or marketing professional, these insights will help you succeed in the digital age.', 3, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop');

-- Dummy comments data
INSERT INTO Comments (date, content, userId, articleId, parentCommentId) VALUES
    ('2024-01-01 12:00:00', 'Great article!', 3, 1, NULL),
    ('2024-01-01 12:30:00', 'Thanks for sharing.', 4, 1, NULL),
    ('2024-01-02 13:00:00', 'Interesting read.', 5, 1, 1),
    ('2024-01-02 13:15:00', 'I learned a lot.', 6, 1, 2),
    ('2024-01-03 15:00:00', 'Well written!', 7, 1, 3),
    ('2024-01-03 15:20:00', 'Looking forward to more.', 8, 1, 3),
    ('2024-01-04 10:30:00', 'Nice insights.', 9, 1, 5),
    ('2024-01-04 10:45:00', 'Appreciate the info.', 10, 1, 4),
    ('2024-01-05 17:00:00', 'Very helpful.', 2, 1, NULL),
    ('2024-01-05 17:15:00', 'Good job!', 3, 1, 2),
    ('2024-01-06 14:30:00', 'Excellent article.', 4, 1, 10),
    ('2024-01-06 14:45:00', 'Keep it up!', 5, 1, 11),
    ('2024-01-07 16:00:00', 'Loved it!', 6, 1, 10),
    ('2024-01-07 16:20:00', 'Very informative.', 7, 1, 12),
    ('2024-01-08 13:30:00', 'Great insights.', 8, 1, 11);

-- Dummy images data
INSERT INTO Images (url) VALUES
    ('http://example.com/image1.jpg'),
    ('http://example.com/image2.jpg'),
    ('http://example.com/image3.jpg'),
    ('http://example.com/image4.jpg'),
    ('http://example.com/image5.jpg');

-- Dummy article-image relations
-- Article content images (6 images per article for first 10 articles)
INSERT INTO ArticleImg (articleId, imgUrl) VALUES
    -- Article 1: Web Development
    (1, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop'),
    (1, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop'),
    (1, 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop'),
    (1, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop'),
    (1, 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop'),
    (1, 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop'),
    -- Article 2: Photography
    (2, 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&h=600&fit=crop'),
    (2, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop'),
    (2, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop'),
    (2, 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=600&fit=crop'),
    (2, 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=800&h=600&fit=crop'),
    (2, 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800&h=600&fit=crop'),
    -- Article 3: Healthy Living
    (3, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop'),
    (3, 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&h=600&fit=crop'),
    (3, 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop'),
    (3, 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop'),
    (3, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop'),
    (3, 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&h=600&fit=crop'),
    -- Article 4: Travel
    (4, 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop'),
    (4, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'),
    (4, 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&h=600&fit=crop'),
    (4, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop'),
    (4, 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&h=600&fit=crop'),
    (4, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'),
    -- Article 5: JavaScript
    (5, 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=600&fit=crop'),
    (5, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop'),
    (5, 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&h=600&fit=crop'),
    (5, 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&h=600&fit=crop'),
    (5, 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&h=600&fit=crop'),
    (5, 'https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=800&h=600&fit=crop'),
    -- Article 6: AI
    (6, 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop'),
    (6, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
    (6, 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=800&h=600&fit=crop'),
    (6, 'https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=800&h=600&fit=crop'),
    (6, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop'),
    (6, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop'),
    -- Article 7: Cooking
    (7, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'),
    (7, 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=600&fit=crop'),
    (7, 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop'),
    (7, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop'),
    (7, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop'),
    (7, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop'),
    -- Article 8: Sustainable Living
    (8, 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop'),
    (8, 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop'),
    (8, 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop'),
    (8, 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop'),
    (8, 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=800&h=600&fit=crop'),
    (8, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop'),
    -- Article 9: Fitness
    (9, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'),
    (9, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop'),
    (9, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop'),
    (9, 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop'),
    (9, 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=600&fit=crop'),
    (9, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&h=600&fit=crop'),
    -- Article 10: Digital Marketing
    (10, 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=600&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop');

-- Dummy article-like relations (multiple likes per article)
INSERT INTO ArticleLike (articleId, userId) VALUES
    -- Article 1: Web Development (8 likes)
    (1, 3),
    (1, 4),
    (1, 5),
    (1, 6),
    (1, 7),
    (1, 8),
    (1, 9),
    (1, 10),
    -- Article 2: Photography (7 likes)
    (2, 2),
    (2, 4),
    (2, 5),
    (2, 6),
    (2, 8),
    (2, 9),
    (2, 10),
    -- Article 3: Healthy Living (9 likes)
    (3, 2),
    (3, 3),
    (3, 4),
    (3, 5),
    (3, 6),
    (3, 7),
    (3, 8),
    (3, 9),
    (3, 10),
    -- Article 4: Travel (6 likes)
    (4, 2),
    (4, 3),
    (4, 5),
    (4, 7),
    (4, 9),
    (4, 10),
    -- Article 5: JavaScript (10 likes - most popular!)
    (5, 2),
    (5, 3),
    (5, 4),
    (5, 5),
    (5, 6),
    (5, 7),
    (5, 8),
    (5, 9),
    (5, 10),
    (5, 1),
    -- Article 6: AI (8 likes)
    (6, 2),
    (6, 3),
    (6, 4),
    (6, 5),
    (6, 7),
    (6, 8),
    (6, 9),
    (6, 10),
    -- Article 7: Cooking (5 likes)
    (7, 3),
    (7, 4),
    (7, 6),
    (7, 8),
    (7, 10),
    -- Article 8: Sustainable Living (7 likes)
    (8, 2),
    (8, 3),
    (8, 5),
    (8, 6),
    (8, 7),
    (8, 9),
    (8, 10),
    -- Article 9: Fitness (6 likes)
    (9, 3),
    (9, 4),
    (9, 5),
    (9, 7),
    (9, 8),
    (9, 10),
    -- Article 10: Digital Marketing (9 likes)
    (10, 2),
    (10, 3),
    (10, 4),
    (10, 5),
    (10, 6),
    (10, 7),
    (10, 8),
    (10, 9),
    (10, 10);

-- Dummy article-tag relations (简化标签系统，5-6个主要标签)
INSERT INTO ArticleTag (articleId, tag, color) VALUES
    (1, 'Technology', 'blue'),
    (2, 'Lifestyle', 'green'),
    (3, 'Health', 'red'),
    (4, 'Travel', 'orange'),
    (5, 'Technology', 'blue'),
    (6, 'Technology', 'blue'),
    (7, 'Lifestyle', 'green'),
    (8, 'Health', 'red'),
    (9, 'Health', 'red'),
    (10, 'Technology', 'blue');