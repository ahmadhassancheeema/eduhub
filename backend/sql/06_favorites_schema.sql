-- EduHub Phase 3 Favorites Schema
-- This table stores saved/favorited items for each student.
-- It supports modules and resources now.
-- Later it can also support books, forum questions, and forum answers.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    item_type VARCHAR(30) NOT NULL
        CHECK (item_type IN ('module', 'resource', 'book', 'question', 'answer')),

    item_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_student_favorite_item UNIQUE (student_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_student_id
ON favorites(student_id);

CREATE INDEX IF NOT EXISTS idx_favorites_item_type
ON favorites(item_type);

CREATE INDEX IF NOT EXISTS idx_favorites_item_id
ON favorites(item_id);