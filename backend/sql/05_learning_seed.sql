-- EduHub Phase 2 Learning Wing Seed Data
-- This file adds sample categories, modules, lessons, and resources.

-- 1. Insert module categories
INSERT INTO module_categories (name, description)
VALUES
('Web Development', 'Frontend and backend web development topics.'),
('Database Systems', 'Database design, SQL, ER diagrams, and normalization.'),
('Software Engineering', 'Software planning, UML, design patterns, and testing.'),
('Programming', 'General programming concepts and problem solving.')
ON CONFLICT (name) DO NOTHING;


-- 2. Insert modules
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
VALUES
(
    'Web Development Fundamentals',
    'WEB101',
    'Learn the foundations of building websites using HTML, CSS, JavaScript, backend APIs, and databases.',
    (SELECT id FROM module_categories WHERE name = 'Web Development'),
    'Dr. Sarah Ahmed',
    'beginner',
    20,
    NULL,
    TRUE
),
(
    'Database Systems',
    'DBS201',
    'Learn database concepts including tables, relationships, SQL queries, ER diagrams, normalization, and PostgreSQL.',
    (SELECT id FROM module_categories WHERE name = 'Database Systems'),
    'Dr. Ahmed Khan',
    'intermediate',
    24,
    NULL,
    TRUE
),
(
    'Software Engineering Principles',
    'SWE301',
    'Understand software requirements, UML diagrams, design principles, testing, and software project management.',
    (SELECT id FROM module_categories WHERE name = 'Software Engineering'),
    'Dr. Maryam Ali',
    'intermediate',
    22,
    NULL,
    TRUE
)
ON CONFLICT (module_code) DO NOTHING;


-- 3. Insert lessons for Web Development
INSERT INTO lessons (
    module_id,
    title,
    description,
    lesson_order,
    duration_minutes
)
VALUES
(
    (SELECT id FROM modules WHERE module_code = 'WEB101'),
    'Introduction to Web Development',
    'Understand how websites work, including frontend, backend, servers, and databases.',
    1,
    35
),
(
    (SELECT id FROM modules WHERE module_code = 'WEB101'),
    'HTML Structure',
    'Learn how to structure web pages using semantic HTML elements.',
    2,
    45
),
(
    (SELECT id FROM modules WHERE module_code = 'WEB101'),
    'CSS Styling Basics',
    'Learn colors, spacing, layout, typography, and responsive design basics.',
    3,
    50
),
(
    (SELECT id FROM modules WHERE module_code = 'WEB101'),
    'JavaScript and API Requests',
    'Learn how JavaScript sends requests to a backend API using fetch.',
    4,
    55
)
ON CONFLICT (module_id, lesson_order) DO NOTHING;


-- 4. Insert lessons for Database Systems
INSERT INTO lessons (
    module_id,
    title,
    description,
    lesson_order,
    duration_minutes
)
VALUES
(
    (SELECT id FROM modules WHERE module_code = 'DBS201'),
    'Introduction to Databases',
    'Learn what databases are and why structured data storage is important.',
    1,
    40
),
(
    (SELECT id FROM modules WHERE module_code = 'DBS201'),
    'Tables and Relationships',
    'Understand primary keys, foreign keys, and relationships between tables.',
    2,
    50
),
(
    (SELECT id FROM modules WHERE module_code = 'DBS201'),
    'SQL Basics',
    'Learn SELECT, INSERT, UPDATE, DELETE, WHERE, ORDER BY, and basic filtering.',
    3,
    60
),
(
    (SELECT id FROM modules WHERE module_code = 'DBS201'),
    'ER Diagrams and Normalization',
    'Learn how to design database structures using ER diagrams and normalization rules.',
    4,
    65
)
ON CONFLICT (module_id, lesson_order) DO NOTHING;


-- 5. Insert lessons for Software Engineering
INSERT INTO lessons (
    module_id,
    title,
    description,
    lesson_order,
    duration_minutes
)
VALUES
(
    (SELECT id FROM modules WHERE module_code = 'SWE301'),
    'Introduction to Software Engineering',
    'Learn what software engineering is and why planning matters.',
    1,
    35
),
(
    (SELECT id FROM modules WHERE module_code = 'SWE301'),
    'Requirements and Stakeholders',
    'Understand functional requirements, non-functional requirements, and stakeholders.',
    2,
    45
),
(
    (SELECT id FROM modules WHERE module_code = 'SWE301'),
    'UML Class Diagrams',
    'Learn how to represent classes, attributes, methods, and relationships.',
    3,
    60
),
(
    (SELECT id FROM modules WHERE module_code = 'SWE301'),
    'Testing and Maintenance',
    'Understand unit testing, integration testing, system testing, and maintenance.',
    4,
    50
)
ON CONFLICT (module_id, lesson_order) DO NOTHING;


-- 6. Insert resources for Web Development
INSERT INTO resources (
    module_id,
    lesson_id,
    title,
    description,
    resource_type,
    file_url,
    external_url
)
VALUES
(
    (SELECT id FROM modules WHERE module_code = 'WEB101'),
    (SELECT id FROM lessons WHERE module_id = (SELECT id FROM modules WHERE module_code = 'WEB101') AND lesson_order = 1),
    'Web Development Overview Notes',
    'Introductory notes explaining frontend, backend, and databases.',
    'link',
    NULL,
    'https://developer.mozilla.org/en-US/docs/Learn'
),
(
    (SELECT id FROM modules WHERE module_code = 'WEB101'),
    (SELECT id FROM lessons WHERE module_id = (SELECT id FROM modules WHERE module_code = 'WEB101') AND lesson_order = 2),
    'HTML Beginner Guide',
    'A helpful HTML learning guide.',
    'link',
    NULL,
    'https://developer.mozilla.org/en-US/docs/Learn/HTML'
),
(
    (SELECT id FROM modules WHERE module_code = 'WEB101'),
    (SELECT id FROM lessons WHERE module_id = (SELECT id FROM modules WHERE module_code = 'WEB101') AND lesson_order = 3),
    'CSS Beginner Guide',
    'A helpful CSS learning guide.',
    'link',
    NULL,
    'https://developer.mozilla.org/en-US/docs/Learn/CSS'
)
ON CONFLICT DO NOTHING;


-- 7. Insert resources for Database Systems
INSERT INTO resources (
    module_id,
    lesson_id,
    title,
    description,
    resource_type,
    file_url,
    external_url
)
VALUES
(
    (SELECT id FROM modules WHERE module_code = 'DBS201'),
    (SELECT id FROM lessons WHERE module_id = (SELECT id FROM modules WHERE module_code = 'DBS201') AND lesson_order = 1),
    'PostgreSQL Introduction',
    'Official PostgreSQL introduction and documentation.',
    'link',
    NULL,
    'https://www.postgresql.org/docs/'
),
(
    (SELECT id FROM modules WHERE module_code = 'DBS201'),
    (SELECT id FROM lessons WHERE module_id = (SELECT id FROM modules WHERE module_code = 'DBS201') AND lesson_order = 2),
    'Database Relationships Notes',
    'Text resource explaining one-to-one, one-to-many, and many-to-many relationships.',
    'text',
    NULL,
    NULL
),
(
    (SELECT id FROM modules WHERE module_code = 'DBS201'),
    (SELECT id FROM lessons WHERE module_id = (SELECT id FROM modules WHERE module_code = 'DBS201') AND lesson_order = 3),
    'SQL Tutorial',
    'Practice SQL basics using examples.',
    'link',
    NULL,
    'https://www.postgresql.org/docs/current/tutorial-sql.html'
)
ON CONFLICT DO NOTHING;


-- 8. Insert resources for Software Engineering
INSERT INTO resources (
    module_id,
    lesson_id,
    title,
    description,
    resource_type,
    file_url,
    external_url
)
VALUES
(
    (SELECT id FROM modules WHERE module_code = 'SWE301'),
    (SELECT id FROM lessons WHERE module_id = (SELECT id FROM modules WHERE module_code = 'SWE301') AND lesson_order = 1),
    'Software Engineering Overview',
    'Introductory reading about software engineering principles.',
    'link',
    NULL,
    'https://en.wikipedia.org/wiki/Software_engineering'
),
(
    (SELECT id FROM modules WHERE module_code = 'SWE301'),
    (SELECT id FROM lessons WHERE module_id = (SELECT id FROM modules WHERE module_code = 'SWE301') AND lesson_order = 2),
    'Requirements Notes',
    'Text notes about requirements and stakeholders.',
    'text',
    NULL,
    NULL
),
(
    (SELECT id FROM modules WHERE module_code = 'SWE301'),
    (SELECT id FROM lessons WHERE module_id = (SELECT id FROM modules WHERE module_code = 'SWE301') AND lesson_order = 3),
    'UML Class Diagram Reference',
    'Reference material for UML class diagram notation.',
    'link',
    NULL,
    'https://www.uml-diagrams.org/class-diagrams-overview.html'
)
ON CONFLICT DO NOTHING;