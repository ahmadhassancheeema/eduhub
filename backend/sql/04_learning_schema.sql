-- EduHub Phase 2 Learning Wing Schema
-- This file creates tables for modules, lessons, resources,
-- module enrollment, and student progress.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reusable updated_at trigger function.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Module categories
CREATE TABLE IF NOT EXISTS module_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(120) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Modules
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(180) NOT NULL,

    module_code VARCHAR(50) NOT NULL UNIQUE,

    description TEXT NOT NULL,

    category_id UUID REFERENCES module_categories(id)
        ON DELETE SET NULL,

    instructor_name VARCHAR(120) NOT NULL,

    difficulty_level VARCHAR(30) NOT NULL DEFAULT 'beginner'
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),

    estimated_hours INTEGER DEFAULT 0
        CHECK (estimated_hours >= 0),

    thumbnail_url TEXT,

    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_modules_updated_at ON modules;

CREATE TRIGGER trg_modules_updated_at
BEFORE UPDATE ON modules
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 3. Lessons
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    module_id UUID NOT NULL REFERENCES modules(id)
        ON DELETE CASCADE,

    title VARCHAR(180) NOT NULL,

    description TEXT,

    lesson_order INTEGER NOT NULL
        CHECK (lesson_order > 0),

    duration_minutes INTEGER DEFAULT 0
        CHECK (duration_minutes >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_lesson_order_per_module UNIQUE (module_id, lesson_order)
);

DROP TRIGGER IF EXISTS trg_lessons_updated_at ON lessons;

CREATE TRIGGER trg_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 4. Resources
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    module_id UUID NOT NULL REFERENCES modules(id)
        ON DELETE CASCADE,

    lesson_id UUID REFERENCES lessons(id)
        ON DELETE CASCADE,

    title VARCHAR(180) NOT NULL,

    description TEXT,

    resource_type VARCHAR(30) NOT NULL
        CHECK (resource_type IN ('pdf', 'video', 'slide', 'link', 'text')),

    file_url TEXT,

    external_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT resource_must_have_url CHECK (
        file_url IS NOT NULL OR external_url IS NOT NULL OR resource_type = 'text'
    )
);

DROP TRIGGER IF EXISTS trg_resources_updated_at ON resources;

CREATE TRIGGER trg_resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 5. Module enrollments
-- This table tracks which modules a student has started.
CREATE TABLE IF NOT EXISTS module_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    module_id UUID NOT NULL REFERENCES modules(id)
        ON DELETE CASCADE,

    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_student_module_enrollment UNIQUE (student_id, module_id)
);

-- 6. Student progress
-- This table tracks lesson completion.
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    module_id UUID NOT NULL REFERENCES modules(id)
        ON DELETE CASCADE,

    lesson_id UUID NOT NULL REFERENCES lessons(id)
        ON DELETE CASCADE,

    is_completed BOOLEAN NOT NULL DEFAULT FALSE,

    completed_at TIMESTAMPTZ,

    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_student_lesson_progress UNIQUE (student_id, lesson_id)
);

-- Helpful indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_modules_category_id
ON modules(category_id);

CREATE INDEX IF NOT EXISTS idx_modules_is_published
ON modules(is_published);

CREATE INDEX IF NOT EXISTS idx_lessons_module_id
ON lessons(module_id);

CREATE INDEX IF NOT EXISTS idx_resources_module_id
ON resources(module_id);

CREATE INDEX IF NOT EXISTS idx_resources_lesson_id
ON resources(lesson_id);

CREATE INDEX IF NOT EXISTS idx_module_enrollments_student_id
ON module_enrollments(student_id);

CREATE INDEX IF NOT EXISTS idx_module_enrollments_module_id
ON module_enrollments(module_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_id
ON student_progress(student_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_module_id
ON student_progress(module_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_lesson_id
ON student_progress(lesson_id);