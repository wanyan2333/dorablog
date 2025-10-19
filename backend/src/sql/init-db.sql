-- TODO Replace this SQL initialization script with an init script for your own database schema.

DROP TABLE IF EXISTS Messages;

-- Create messages table
CREATE TABLE Messages (
    id INTEGER NOT NULL PRIMARY KEY,
    message TEXT
);

-- Dummy messages data
INSERT INTO Messages (message) VALUES
    ('Hello, world!'),
    ('Gotta catch ''em all!');