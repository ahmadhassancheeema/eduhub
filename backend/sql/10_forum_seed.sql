-- EduHub Phase 5 Forum Seed Data
-- Adds forum categories and common academic tags.

-- 1. Forum categories
INSERT INTO forum_categories (name, description)
VALUES
('General Academic Help', 'General study questions, academic help, and student support.'),
('Programming', 'Questions about coding, debugging, JavaScript, Node.js, and programming logic.'),
('Web Development', 'Questions about HTML, CSS, JavaScript, frontend, backend, and APIs.'),
('Database Systems', 'Questions about SQL, PostgreSQL, ER diagrams, normalization, and database design.'),
('Software Engineering', 'Questions about UML, requirements, testing, design patterns, and project planning.'),
('Assignments', 'Help with assignment planning, understanding requirements, and improving solutions.'),
('Exam Preparation', 'Revision questions, past paper practice, and exam preparation strategies.'),
('Book Recommendations', 'Questions about useful books and academic resources.')
ON CONFLICT (name) DO NOTHING;


-- 2. Forum tags
INSERT INTO forum_tags (name)
VALUES
('html'),
('css'),
('javascript'),
('nodejs'),
('express'),
('postgresql'),
('supabase'),
('sql'),
('er-diagram'),
('normalization'),
('uml'),
('testing'),
('requirements'),
('design-patterns'),
('assignment'),
('exam'),
('debugging'),
('api'),
('frontend'),
('backend')
ON CONFLICT (name) DO NOTHING;