-- EduHub Professional Demo Data
-- Run this in Supabase SQL Editor after Phase 6 is complete.

BEGIN;

-- =====================================================
-- 1. Extra Module Categories
-- =====================================================

INSERT INTO module_categories (name, description)
VALUES
('Artificial Intelligence', 'Machine learning, intelligent systems, and AI fundamentals.'),
('Cybersecurity', 'Security concepts, threats, protection methods, and safe computing.'),
('Study Skills', 'Academic skills, revision planning, research, and productivity.')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;


-- =====================================================
-- 2. Extra Modules
-- =====================================================

INSERT INTO modules (
  title,
  module_code,
  description,
  category_id,
  instructor_name,
  difficulty_level,
  estimated_hours,
  thumbnail_url,
  is_published
)
SELECT
  'Introduction to Artificial Intelligence',
  'AI101',
  'Learn the basic ideas behind artificial intelligence, intelligent agents, machine learning, and real-world AI applications.',
  c.id,
  'Dr. Sarah Malik',
  'beginner',
  8,
  NULL,
  TRUE
FROM module_categories c
WHERE c.name = 'Artificial Intelligence'
ON CONFLICT (module_code) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  instructor_name = EXCLUDED.instructor_name,
  difficulty_level = EXCLUDED.difficulty_level,
  estimated_hours = EXCLUDED.estimated_hours,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();


INSERT INTO modules (
  title,
  module_code,
  description,
  category_id,
  instructor_name,
  difficulty_level,
  estimated_hours,
  thumbnail_url,
  is_published
)
SELECT
  'Cybersecurity Essentials',
  'CYB201',
  'Understand common security threats, password safety, network security basics, encryption, and secure system habits.',
  c.id,
  'Mr. Daniel Wong',
  'intermediate',
  10,
  NULL,
  TRUE
FROM module_categories c
WHERE c.name = 'Cybersecurity'
ON CONFLICT (module_code) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  instructor_name = EXCLUDED.instructor_name,
  difficulty_level = EXCLUDED.difficulty_level,
  estimated_hours = EXCLUDED.estimated_hours,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();


INSERT INTO modules (
  title,
  module_code,
  description,
  category_id,
  instructor_name,
  difficulty_level,
  estimated_hours,
  thumbnail_url,
  is_published
)
SELECT
  'Academic Study Skills',
  'SKL101',
  'Improve note-taking, time management, revision planning, research habits, and academic writing confidence.',
  c.id,
  'Ms. Nadia Karim',
  'beginner',
  6,
  NULL,
  TRUE
FROM module_categories c
WHERE c.name = 'Study Skills'
ON CONFLICT (module_code) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category_id = EXCLUDED.category_id,
  instructor_name = EXCLUDED.instructor_name,
  difficulty_level = EXCLUDED.difficulty_level,
  estimated_hours = EXCLUDED.estimated_hours,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();


-- =====================================================
-- 3. Lessons for AI101
-- =====================================================

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'What is Artificial Intelligence?', 'Introduction to AI, intelligent behavior, and everyday examples of AI systems.', 1, 35
FROM modules m
WHERE m.module_code = 'AI101'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 1
);

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'Intelligent Agents', 'Learn how agents sense, decide, and act in an environment.', 2, 40
FROM modules m
WHERE m.module_code = 'AI101'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 2
);

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'Machine Learning Basics', 'Understand training data, models, predictions, and basic machine learning workflow.', 3, 50
FROM modules m
WHERE m.module_code = 'AI101'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 3
);

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'Ethics in AI', 'Discuss fairness, bias, privacy, and responsible AI development.', 4, 45
FROM modules m
WHERE m.module_code = 'AI101'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 4
);


-- =====================================================
-- 4. Lessons for CYB201
-- =====================================================

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'Introduction to Cybersecurity', 'Learn what cybersecurity means and why it matters for students and organizations.', 1, 35
FROM modules m
WHERE m.module_code = 'CYB201'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 1
);

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'Password and Account Security', 'Understand password hashing, strong passwords, and account protection methods.', 2, 45
FROM modules m
WHERE m.module_code = 'CYB201'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 2
);

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'Common Web Attacks', 'Learn about SQL injection, XSS, CSRF, and basic protection strategies.', 3, 55
FROM modules m
WHERE m.module_code = 'CYB201'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 3
);

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'Secure Deployment Basics', 'Learn environment variables, HTTPS, secrets, and safe deployment habits.', 4, 45
FROM modules m
WHERE m.module_code = 'CYB201'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 4
);


-- =====================================================
-- 5. Lessons for SKL101
-- =====================================================

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'Time Management for Students', 'Plan your week, manage deadlines, and avoid last-minute work.', 1, 30
FROM modules m
WHERE m.module_code = 'SKL101'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 1
);

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'Effective Note-Taking', 'Learn structured note-taking methods for lectures and revision.', 2, 35
FROM modules m
WHERE m.module_code = 'SKL101'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 2
);

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'Revision Planning', 'Create revision plans, use active recall, and prepare for exams effectively.', 3, 40
FROM modules m
WHERE m.module_code = 'SKL101'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 3
);

INSERT INTO lessons (module_id, title, description, lesson_order, duration_minutes)
SELECT m.id, 'Academic Writing Basics', 'Improve paragraph structure, referencing habits, and assignment clarity.', 4, 45
FROM modules m
WHERE m.module_code = 'SKL101'
AND NOT EXISTS (
  SELECT 1 FROM lessons l WHERE l.module_id = m.id AND l.lesson_order = 4
);


-- =====================================================
-- 6. Resources
-- =====================================================

INSERT INTO resources (module_id, lesson_id, title, description, resource_type, file_url, external_url)
SELECT m.id, l.id, 'AI Introduction Notes', 'Short notes explaining artificial intelligence with examples.', 'text', NULL, NULL
FROM modules m
JOIN lessons l ON l.module_id = m.id AND l.lesson_order = 1
WHERE m.module_code = 'AI101'
AND NOT EXISTS (
  SELECT 1 FROM resources r WHERE r.module_id = m.id AND r.title = 'AI Introduction Notes'
);

INSERT INTO resources (module_id, lesson_id, title, description, resource_type, file_url, external_url)
SELECT m.id, l.id, 'Machine Learning Overview Video', 'A beginner-friendly video resource for understanding machine learning basics.', 'video', NULL, 'https://www.youtube.com/'
FROM modules m
JOIN lessons l ON l.module_id = m.id AND l.lesson_order = 3
WHERE m.module_code = 'AI101'
AND NOT EXISTS (
  SELECT 1 FROM resources r WHERE r.module_id = m.id AND r.title = 'Machine Learning Overview Video'
);

INSERT INTO resources (module_id, lesson_id, title, description, resource_type, file_url, external_url)
SELECT m.id, l.id, 'Web Security Checklist', 'Checklist for secure web development and deployment habits.', 'text', NULL, NULL
FROM modules m
JOIN lessons l ON l.module_id = m.id AND l.lesson_order = 3
WHERE m.module_code = 'CYB201'
AND NOT EXISTS (
  SELECT 1 FROM resources r WHERE r.module_id = m.id AND r.title = 'Web Security Checklist'
);

INSERT INTO resources (module_id, lesson_id, title, description, resource_type, file_url, external_url)
SELECT m.id, l.id, 'Password Security Guide', 'Guide for password safety, hashing, and account protection.', 'link', NULL, 'https://owasp.org/'
FROM modules m
JOIN lessons l ON l.module_id = m.id AND l.lesson_order = 2
WHERE m.module_code = 'CYB201'
AND NOT EXISTS (
  SELECT 1 FROM resources r WHERE r.module_id = m.id AND r.title = 'Password Security Guide'
);

INSERT INTO resources (module_id, lesson_id, title, description, resource_type, file_url, external_url)
SELECT m.id, l.id, 'Weekly Study Planner', 'A simple study planning template for students.', 'text', NULL, NULL
FROM modules m
JOIN lessons l ON l.module_id = m.id AND l.lesson_order = 1
WHERE m.module_code = 'SKL101'
AND NOT EXISTS (
  SELECT 1 FROM resources r WHERE r.module_id = m.id AND r.title = 'Weekly Study Planner'
);

INSERT INTO resources (module_id, lesson_id, title, description, resource_type, file_url, external_url)
SELECT m.id, l.id, 'Academic Writing Checklist', 'Checklist for improving assignment structure and clarity.', 'text', NULL, NULL
FROM modules m
JOIN lessons l ON l.module_id = m.id AND l.lesson_order = 4
WHERE m.module_code = 'SKL101'
AND NOT EXISTS (
  SELECT 1 FROM resources r WHERE r.module_id = m.id AND r.title = 'Academic Writing Checklist'
);


-- =====================================================
-- 7. More Bookstore Books
-- =====================================================

INSERT INTO books (
  title,
  author,
  isbn,
  description,
  category,
  price,
  stock_quantity,
  cover_image_url,
  publisher,
  edition,
  recommended_module_id,
  is_active
)
SELECT
  'Artificial Intelligence for Beginners',
  'Dr. Sarah Malik',
  '978-1000000001',
  'A beginner-friendly guide to AI concepts, intelligent agents, machine learning, and AI ethics.',
  'Artificial Intelligence',
  64.00,
  16,
  NULL,
  'EduHub Academic Press',
  '1st Edition',
  m.id,
  TRUE
FROM modules m
WHERE m.module_code = 'AI101'
ON CONFLICT (isbn) DO UPDATE
SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  publisher = EXCLUDED.publisher,
  edition = EXCLUDED.edition,
  recommended_module_id = EXCLUDED.recommended_module_id,
  is_active = TRUE,
  updated_at = NOW();


INSERT INTO books (
  title,
  author,
  isbn,
  description,
  category,
  price,
  stock_quantity,
  cover_image_url,
  publisher,
  edition,
  recommended_module_id,
  is_active
)
SELECT
  'Cybersecurity Essentials for Students',
  'Daniel Wong',
  '978-1000000002',
  'Covers password safety, web threats, secure coding, and practical cybersecurity habits.',
  'Cybersecurity',
  59.00,
  20,
  NULL,
  'Secure Learning Press',
  '2nd Edition',
  m.id,
  TRUE
FROM modules m
WHERE m.module_code = 'CYB201'
ON CONFLICT (isbn) DO UPDATE
SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  publisher = EXCLUDED.publisher,
  edition = EXCLUDED.edition,
  recommended_module_id = EXCLUDED.recommended_module_id,
  is_active = TRUE,
  updated_at = NOW();


INSERT INTO books (
  title,
  author,
  isbn,
  description,
  category,
  price,
  stock_quantity,
  cover_image_url,
  publisher,
  edition,
  recommended_module_id,
  is_active
)
SELECT
  'Study Skills for University Success',
  'Nadia Karim',
  '978-1000000003',
  'A practical guide to time management, notes, revision, research, and academic writing.',
  'Study Skills',
  35.00,
  28,
  NULL,
  'Student Success Press',
  '1st Edition',
  m.id,
  TRUE
FROM modules m
WHERE m.module_code = 'SKL101'
ON CONFLICT (isbn) DO UPDATE
SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  publisher = EXCLUDED.publisher,
  edition = EXCLUDED.edition,
  recommended_module_id = EXCLUDED.recommended_module_id,
  is_active = TRUE,
  updated_at = NOW();


-- =====================================================
-- 8. Forum Demo Questions
-- Requires at least one registered user.
-- Uses the first active student if available.
-- =====================================================

WITH demo_user AS (
  SELECT id
  FROM users
  WHERE is_active = TRUE
  ORDER BY created_at ASC
  LIMIT 1
),
forum_cat AS (
  SELECT id
  FROM forum_categories
  WHERE name = 'Web Development'
  LIMIT 1
)
INSERT INTO forum_questions (student_id, category_id, title, body, status)
SELECT
  demo_user.id,
  forum_cat.id,
  'How do I connect frontend JavaScript to an Express API?',
  'I understand that the frontend uses fetch(), but I am confused about how the request reaches the backend route and how JSON is returned.',
  'open'
FROM demo_user, forum_cat
WHERE NOT EXISTS (
  SELECT 1
  FROM forum_questions
  WHERE title = 'How do I connect frontend JavaScript to an Express API?'
);


WITH demo_user AS (
  SELECT id
  FROM users
  WHERE is_active = TRUE
  ORDER BY created_at ASC
  LIMIT 1
),
forum_cat AS (
  SELECT id
  FROM forum_categories
  WHERE name = 'Database Systems'
  LIMIT 1
)
INSERT INTO forum_questions (student_id, category_id, title, body, status)
SELECT
  demo_user.id,
  forum_cat.id,
  'What is the difference between primary key and foreign key?',
  'I know both are used in database tables, but I want to understand how they work in relationships between tables.',
  'open'
FROM demo_user, forum_cat
WHERE NOT EXISTS (
  SELECT 1
  FROM forum_questions
  WHERE title = 'What is the difference between primary key and foreign key?'
);


WITH demo_user AS (
  SELECT id
  FROM users
  WHERE is_active = TRUE
  ORDER BY created_at ASC
  LIMIT 1
),
forum_cat AS (
  SELECT id
  FROM forum_categories
  WHERE name = 'Exam Preparation'
  LIMIT 1
)
INSERT INTO forum_questions (student_id, category_id, title, body, status)
SELECT
  demo_user.id,
  forum_cat.id,
  'How should I plan revision for multiple modules?',
  'I have several modules to revise and I want a practical way to divide my time and track my progress.',
  'open'
FROM demo_user, forum_cat
WHERE NOT EXISTS (
  SELECT 1
  FROM forum_questions
  WHERE title = 'How should I plan revision for multiple modules?'
);


-- =====================================================
-- 9. Forum Tags for Demo Questions
-- =====================================================

INSERT INTO forum_tags (name)
VALUES
('fetch'),
('express'),
('database'),
('revision'),
('study-planning')
ON CONFLICT (name) DO NOTHING;


INSERT INTO question_tags (question_id, tag_id)
SELECT q.id, t.id
FROM forum_questions q, forum_tags t
WHERE q.title = 'How do I connect frontend JavaScript to an Express API?'
AND t.name IN ('fetch', 'express', 'api')
ON CONFLICT DO NOTHING;

INSERT INTO question_tags (question_id, tag_id)
SELECT q.id, t.id
FROM forum_questions q, forum_tags t
WHERE q.title = 'What is the difference between primary key and foreign key?'
AND t.name IN ('database', 'sql')
ON CONFLICT DO NOTHING;

INSERT INTO question_tags (question_id, tag_id)
SELECT q.id, t.id
FROM forum_questions q, forum_tags t
WHERE q.title = 'How should I plan revision for multiple modules?'
AND t.name IN ('revision', 'study-planning')
ON CONFLICT DO NOTHING;


-- =====================================================
-- 10. Demo Answers
-- =====================================================

WITH demo_user AS (
  SELECT id
  FROM users
  WHERE is_active = TRUE
  ORDER BY created_at DESC
  LIMIT 1
),
target_question AS (
  SELECT id
  FROM forum_questions
  WHERE title = 'How do I connect frontend JavaScript to an Express API?'
  LIMIT 1
)
INSERT INTO forum_answers (question_id, student_id, body)
SELECT
  target_question.id,
  demo_user.id,
  'The frontend sends a request using fetch() to an API URL such as /api/modules. Express receives the request through a matching route, calls the controller, gets data from PostgreSQL, and sends JSON back to the frontend.'
FROM demo_user, target_question
WHERE NOT EXISTS (
  SELECT 1
  FROM forum_answers
  WHERE question_id = target_question.id
  AND body ILIKE 'The frontend sends a request using fetch()%'
);


WITH demo_user AS (
  SELECT id
  FROM users
  WHERE is_active = TRUE
  ORDER BY created_at DESC
  LIMIT 1
),
target_question AS (
  SELECT id
  FROM forum_questions
  WHERE title = 'What is the difference between primary key and foreign key?'
  LIMIT 1
)
INSERT INTO forum_answers (question_id, student_id, body)
SELECT
  target_question.id,
  demo_user.id,
  'A primary key uniquely identifies a row in its own table. A foreign key points to a primary key in another table, which creates a relationship between the two tables.'
FROM demo_user, target_question
WHERE NOT EXISTS (
  SELECT 1
  FROM forum_answers
  WHERE question_id = target_question.id
  AND body ILIKE 'A primary key uniquely identifies%'
);

COMMIT;