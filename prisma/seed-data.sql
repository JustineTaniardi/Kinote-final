-- Categories
INSERT INTO Category (name) VALUES ('Study') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO Category (name) VALUES ('Workout') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO Category (name) VALUES ('Reading') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO Category (name) VALUES ('Coding') ON DUPLICATE KEY UPDATE name=name;

-- Difficulties
INSERT INTO Difficulty (name) VALUES ('Easy') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO Difficulty (name) VALUES ('Medium') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO Difficulty (name) VALUES ('Hard') ON DUPLICATE KEY UPDATE name=name;

-- Status
INSERT INTO Status (name) VALUES ('pending') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO Status (name) VALUES ('in_progress') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO Status (name) VALUES ('completed') ON DUPLICATE KEY UPDATE name=name;

-- SubCategories for Study (categoryId = 1)
INSERT INTO SubCategory (name, categoryId) VALUES ('Math', 1) ON DUPLICATE KEY UPDATE name=name;
INSERT INTO SubCategory (name, categoryId) VALUES ('Science', 1) ON DUPLICATE KEY UPDATE name=name;
INSERT INTO SubCategory (name, categoryId) VALUES ('Programming Basics', 1) ON DUPLICATE KEY UPDATE name=name;

-- SubCategories for Workout (categoryId = 2)
INSERT INTO SubCategory (name, categoryId) VALUES ('Cardio', 2) ON DUPLICATE KEY UPDATE name=name;
INSERT INTO SubCategory (name, categoryId) VALUES ('Strength Training', 2) ON DUPLICATE KEY UPDATE name=name;
INSERT INTO SubCategory (name, categoryId) VALUES ('Yoga', 2) ON DUPLICATE KEY UPDATE name=name;

-- SubCategories for Reading (categoryId = 3)
INSERT INTO SubCategory (name, categoryId) VALUES ('Novel', 3) ON DUPLICATE KEY UPDATE name=name;
INSERT INTO SubCategory (name, categoryId) VALUES ('Self-Improvement', 3) ON DUPLICATE KEY UPDATE name=name;
INSERT INTO SubCategory (name, categoryId) VALUES ('Textbook', 3) ON DUPLICATE KEY UPDATE name=name;

-- SubCategories for Coding (categoryId = 4)
INSERT INTO SubCategory (name, categoryId) VALUES ('Frontend', 4) ON DUPLICATE KEY UPDATE name=name;
INSERT INTO SubCategory (name, categoryId) VALUES ('Backend', 4) ON DUPLICATE KEY UPDATE name=name;
INSERT INTO SubCategory (name, categoryId) VALUES ('Algorithms', 4) ON DUPLICATE KEY UPDATE name=name;
