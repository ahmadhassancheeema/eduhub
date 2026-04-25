-- EduHub Phase 4 Bookstore Schema
-- This file creates the database tables for books, cart, orders, and order items.
-- Checkout is simulated in this project, so no real payment information is stored.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reusable updated_at trigger function.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 1. Books table
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(180) NOT NULL,

    author VARCHAR(160) NOT NULL,

    isbn VARCHAR(40) UNIQUE,

    description TEXT,

    category VARCHAR(100) NOT NULL,

    price NUMERIC(10, 2) NOT NULL
        CHECK (price >= 0),

    stock_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (stock_quantity >= 0),

    cover_image_url TEXT,

    publisher VARCHAR(160),

    edition VARCHAR(80),

    recommended_module_id UUID REFERENCES modules(id)
        ON DELETE SET NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_books_updated_at ON books;

CREATE TRIGGER trg_books_updated_at
BEFORE UPDATE ON books
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- 2. Cart items table
-- Each logged-in student has their own cart.
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    book_id UUID NOT NULL REFERENCES books(id)
        ON DELETE CASCADE,

    quantity INTEGER NOT NULL DEFAULT 1
        CHECK (quantity > 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_student_book_cart_item UNIQUE (student_id, book_id)
);

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON cart_items;

CREATE TRIGGER trg_cart_items_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- 3. Orders table
-- Stores simulated checkout orders.
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    total_amount NUMERIC(10, 2) NOT NULL
        CHECK (total_amount >= 0),

    status VARCHAR(30) NOT NULL DEFAULT 'completed'
        CHECK (status IN ('pending', 'completed', 'cancelled')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- 4. Order items table
-- Stores books inside each order.
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL REFERENCES orders(id)
        ON DELETE CASCADE,

    book_id UUID REFERENCES books(id)
        ON DELETE SET NULL,

    quantity INTEGER NOT NULL
        CHECK (quantity > 0),

    price_at_purchase NUMERIC(10, 2) NOT NULL
        CHECK (price_at_purchase >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_books_category
ON books(category);

CREATE INDEX IF NOT EXISTS idx_books_is_active
ON books(is_active);

CREATE INDEX IF NOT EXISTS idx_books_recommended_module_id
ON books(recommended_module_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_student_id
ON cart_items(student_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_book_id
ON cart_items(book_id);

CREATE INDEX IF NOT EXISTS idx_orders_student_id
ON orders(student_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
ON orders(status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_book_id
ON order_items(book_id);