-- EduHub Phase 5 Discussion Forum Schema
-- This file creates the forum database tables:
-- categories, questions, answers, votes, reports, tags, and question_tags.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reusable updated_at trigger function.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 1. Forum categories
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(120) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 2. Forum questions
CREATE TABLE IF NOT EXISTS forum_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    category_id UUID REFERENCES forum_categories(id)
        ON DELETE SET NULL,

    title VARCHAR(220) NOT NULL,

    body TEXT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'closed', 'hidden', 'locked')),

    view_count INTEGER NOT NULL DEFAULT 0
        CHECK (view_count >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_forum_questions_updated_at ON forum_questions;

CREATE TRIGGER trg_forum_questions_updated_at
BEFORE UPDATE ON forum_questions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- 3. Forum answers
CREATE TABLE IF NOT EXISTS forum_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    question_id UUID NOT NULL REFERENCES forum_questions(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    body TEXT NOT NULL,

    is_accepted BOOLEAN NOT NULL DEFAULT FALSE,

    status VARCHAR(30) NOT NULL DEFAULT 'visible'
        CHECK (status IN ('visible', 'hidden')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_forum_answers_updated_at ON forum_answers;

CREATE TRIGGER trg_forum_answers_updated_at
BEFORE UPDATE ON forum_answers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- 4. Forum votes
-- One user can vote once on each question or answer.
CREATE TABLE IF NOT EXISTS forum_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    target_type VARCHAR(30) NOT NULL
        CHECK (target_type IN ('question', 'answer')),

    target_id UUID NOT NULL,

    vote_type VARCHAR(30) NOT NULL
        CHECK (vote_type IN ('upvote', 'downvote')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_forum_vote UNIQUE (user_id, target_type, target_id)
);


-- 5. Forum reports
-- target_id can refer to either a question or answer, based on target_type.
CREATE TABLE IF NOT EXISTS forum_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reporter_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    target_type VARCHAR(30) NOT NULL
        CHECK (target_type IN ('question', 'answer')),

    target_id UUID NOT NULL,

    reason TEXT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'reviewed', 'rejected')),

    reviewed_by UUID REFERENCES users(id)
        ON DELETE SET NULL,

    admin_note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    reviewed_at TIMESTAMPTZ,

    CONSTRAINT unique_user_forum_report UNIQUE (reporter_id, target_type, target_id)
);


-- 6. Forum tags
CREATE TABLE IF NOT EXISTS forum_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(80) NOT NULL UNIQUE
);


-- 7. Question tags
-- Many-to-many relationship between questions and tags.
CREATE TABLE IF NOT EXISTS question_tags (
    question_id UUID NOT NULL REFERENCES forum_questions(id)
        ON DELETE CASCADE,

    tag_id UUID NOT NULL REFERENCES forum_tags(id)
        ON DELETE CASCADE,

    PRIMARY KEY (question_id, tag_id)
);


-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_forum_questions_student_id
ON forum_questions(student_id);

CREATE INDEX IF NOT EXISTS idx_forum_questions_category_id
ON forum_questions(category_id);

CREATE INDEX IF NOT EXISTS idx_forum_questions_status
ON forum_questions(status);

CREATE INDEX IF NOT EXISTS idx_forum_questions_created_at
ON forum_questions(created_at);

CREATE INDEX IF NOT EXISTS idx_forum_answers_question_id
ON forum_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_forum_answers_student_id
ON forum_answers(student_id);

CREATE INDEX IF NOT EXISTS idx_forum_answers_status
ON forum_answers(status);

CREATE INDEX IF NOT EXISTS idx_forum_votes_target
ON forum_votes(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_forum_votes_user_id
ON forum_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_forum_reports_target
ON forum_reports(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_forum_reports_status
ON forum_reports(status);

CREATE INDEX IF NOT EXISTS idx_question_tags_question_id
ON question_tags(question_id);

CREATE INDEX IF NOT EXISTS idx_question_tags_tag_id
ON question_tags(tag_id);