PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    email TEXT COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'buyer')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    weight_kg REAL NOT NULL CHECK (weight_kg > 0),
    pdf_url TEXT NOT NULL,
    image_url TEXT,
    features TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pending',
    total_weight_kg REAL NOT NULL,
    split_strategy TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS orders_user_id_created_at_idx ON orders(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS containers (
    id TEXT PRIMARY KEY NOT NULL,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    total_weight_kg REAL NOT NULL,
    max_weight_kg REAL NOT NULL,
    UNIQUE(order_id, number)
);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY NOT NULL,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    container_id TEXT REFERENCES containers(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_container_id_idx ON order_items(container_id);

INSERT OR IGNORE INTO products (id, name, category, description, weight_kg, pdf_url, image_url, features)
VALUES
    ('standard-low-pro-62', 'Standard Low Pro Bucket - 62" STD', 'Skid Steer Buckets', 'Standard low profile bucket with bolt-on cutting edge.', 242.7, '/api/catalog/sample', '/catalog/standard-low-pro-bucket-preview.webp', '["Reinforced 54-inch dimple plate", "3/4-inch x 6-inch weld-on cutting edge", "Weight shown with bolt-on cutting edge"]'),
    ('standard-low-pro-68', 'Standard Low Pro Bucket - 68" STD', 'Skid Steer Buckets', 'Standard low profile bucket with bolt-on cutting edge.', 260.4, '/api/catalog/sample', '/catalog/standard-low-pro-bucket-preview.webp', '["Reinforced 54-inch dimple plate", "3/4-inch x 6-inch weld-on cutting edge", "Weight shown with bolt-on cutting edge"]'),
    ('standard-low-pro-74', 'Standard Low Pro Bucket - 74" STD', 'Skid Steer Buckets', 'Standard low profile bucket with bolt-on cutting edge.', 284.0, '/api/catalog/sample', '/catalog/standard-low-pro-bucket-preview.webp', '["Reinforced 54-inch dimple plate", "3/4-inch x 6-inch weld-on cutting edge", "Weight shown with bolt-on cutting edge"]'),
    ('standard-low-pro-80', 'Standard Low Pro Bucket - 80" STD', 'Skid Steer Buckets', 'Standard low profile bucket with bolt-on cutting edge.', 302.1, '/api/catalog/sample', '/catalog/standard-low-pro-bucket-preview.webp', '["Reinforced 54-inch dimple plate", "3/4-inch x 6-inch weld-on cutting edge", "Weight shown with bolt-on cutting edge"]'),
    ('standard-low-pro-84', 'Standard Low Pro Bucket - 84" STD', 'Skid Steer Buckets', 'Standard low profile bucket with bolt-on cutting edge.', 326.1, '/api/catalog/sample', '/catalog/standard-low-pro-bucket-preview.webp', '["Reinforced 54-inch dimple plate", "3/4-inch x 6-inch weld-on cutting edge", "Weight shown with bolt-on cutting edge"]');
