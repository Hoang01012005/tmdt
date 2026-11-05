DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT NOT NULL DEFAULT '',
  tag TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  price INTEGER NOT NULL,
  original_price INTEGER DEFAULT 0,
  image TEXT NOT NULL,
  in_stock INTEGER NOT NULL DEFAULT 1,
  specs TEXT NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sub_category ON products(sub_category);

-- Bảng tìm kiếm toàn văn FTS5 cho Sản phẩm (Full-Text Search RAG)
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  id UNINDEXED,
  brand,
  name,
  category,
  sub_category,
  specs,
  description,
  content='products',
  content_rowid='rowid'
);

-- Triggers đồng bộ tự động giữa bảng products và products_fts
CREATE TRIGGER IF NOT EXISTS products_ai AFTER INSERT ON products BEGIN
  INSERT INTO products_fts(rowid, id, brand, name, category, sub_category, specs, description)
  VALUES (new.rowid, new.id, new.brand, new.name, new.category, new.sub_category, new.specs, new.description);
END;

CREATE TRIGGER IF NOT EXISTS products_ad AFTER DELETE ON products BEGIN
  INSERT INTO products_fts(products_fts, rowid, id, brand, name, category, sub_category, specs, description)
  VALUES ('delete', old.rowid, old.id, old.brand, old.name, old.category, old.sub_category, old.specs, old.description);
END;

CREATE TRIGGER IF NOT EXISTS products_au AFTER UPDATE ON products BEGIN
  INSERT INTO products_fts(products_fts, rowid, id, brand, name, category, sub_category, specs, description)
  VALUES ('delete', old.rowid, old.id, old.brand, old.name, old.category, old.sub_category, old.specs, old.description);
  INSERT INTO products_fts(rowid, id, brand, name, category, sub_category, specs, description)
  VALUES (new.rowid, new.id, new.brand, new.name, new.category, new.sub_category, new.specs, new.description);
END;

-- Bảng người dùng (Hỗ trợ Local & Google OAuth)
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  avatar TEXT,
  provider TEXT NOT NULL DEFAULT 'local',
  google_id TEXT,
  role TEXT NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Bảng đơn hàng
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled'
  items TEXT NOT NULL DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_status ON orders(status);
