-- ============================================
-- E-Commerce Database Schema (SQLite/D1)
-- ============================================
-- 전자상거래 데이터베이스 스키마 - Cloudflare D1용
-- 작성일: 2025-11-21
-- ============================================

-- 1. 회원 테이블 (Users)
-- ============================================
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  address TEXT,
  member_since DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  preferences TEXT, -- JSON string
  is_active INTEGER DEFAULT 1,
  is_verified INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- 2. 카테고리 테이블 (Categories)
-- ============================================
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER,
  image TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- 3. 상품 테이블 (Products)
-- ============================================
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category_id INTEGER NOT NULL,
  brand TEXT,
  sku TEXT UNIQUE,
  price REAL NOT NULL,
  original_price REAL,
  discount INTEGER DEFAULT 0,
  cost_price REAL,
  image TEXT,
  images TEXT, -- JSON string
  in_stock INTEGER DEFAULT 1,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  rating REAL DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  shipping TEXT DEFAULT '무료배송',
  delivery_info TEXT,
  weight REAL,
  features TEXT, -- JSON string
  specs TEXT, -- JSON string
  detail_description TEXT,
  view_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_sku ON products(sku);

-- 4. 상품 이미지 테이블 (Product Images)
-- ============================================
CREATE TABLE product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  image_type TEXT DEFAULT 'gallery' CHECK(image_type IN ('main', 'thumbnail', 'detail', 'gallery')),
  display_order INTEGER DEFAULT 0,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  format TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_image_type ON product_images(image_type);
CREATE INDEX idx_product_images_display_order ON product_images(display_order);
CREATE INDEX idx_product_images_is_active ON product_images(is_active);

-- 5. 상품 후기 테이블 (Product Reviews)
-- ============================================
CREATE TABLE product_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  images TEXT, -- JSON string
  helpful_count INTEGER DEFAULT 0,
  is_verified_purchase INTEGER DEFAULT 0,
  is_approved INTEGER DEFAULT 0,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_product_reviews_is_approved ON product_reviews(is_approved);
CREATE INDEX idx_product_reviews_created_at ON product_reviews(created_at);

-- 6. 장바구니 테이블 (Cart)
-- ============================================
CREATE TABLE cart (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  session_id TEXT,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_session_id ON cart(session_id);
CREATE INDEX idx_cart_product_id ON cart(product_id);
CREATE UNIQUE INDEX idx_cart_unique ON cart(user_id, product_id, session_id);

-- 7. 주문 테이블 (Orders)
-- ============================================
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  shipping_cost REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_email TEXT,
  shipping_address TEXT NOT NULL,
  shipping_zip_code TEXT,
  shipping_message TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  coupon_code TEXT,
  points_used REAL DEFAULT 0,
  order_memo TEXT,
  admin_memo TEXT,
  ordered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  confirmed_at DATETIME,
  shipped_at DATETIME,
  delivered_at DATETIME,
  cancelled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_ordered_at ON orders(ordered_at);

-- 8. 주문 상세 테이블 (Order Items)
-- ============================================
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_sku TEXT,
  unit_price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  shipping_status TEXT DEFAULT 'pending' CHECK(shipping_status IN ('pending', 'preparing', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_shipping_status ON order_items(shipping_status);

-- 9. 결제 테이블 (Payments)
-- ============================================
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('card', 'bank_transfer', 'virtual_account', 'mobile', 'point', 'kakaopay', 'naverpay', 'paypal')),
  payment_amount REAL NOT NULL,
  pg_provider TEXT,
  pg_transaction_id TEXT,
  card_company TEXT,
  card_number_masked TEXT,
  installment_months INTEGER DEFAULT 0,
  bank_name TEXT,
  account_number TEXT,
  account_holder TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  approval_number TEXT,
  approved_at DATETIME,
  cancelled_at DATETIME,
  cancelled_amount REAL DEFAULT 0,
  cancel_reason TEXT,
  failure_reason TEXT,
  receipt_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_pg_transaction_id ON payments(pg_transaction_id);
CREATE INDEX idx_payments_approved_at ON payments(approved_at);

-- ============================================
-- 샘플 데이터 삽입
-- ============================================

-- 카테고리 샘플 데이터
INSERT INTO categories (name, slug, description) VALUES
('전자제품', 'electronics', '스마트폰, 노트북, 태블릿 등'),
('패션', 'fashion', '의류, 신발, 액세서리'),
('가전', 'appliances', '생활가전, 주방가전'),
('스포츠', 'sports', '운동용품, 아웃도어'),
('도서', 'books', '책, 전자책');

-- 회원 샘플 데이터
INSERT INTO users (id, name, email, password, phone, avatar, address, member_since, preferences) VALUES
(1001, 'John Doe', 'john.doe@example.com', '$2a$10$...', '+1 (555) 123-4567',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
 '123 Main Street, Apt 4B, New York, NY 10001',
 '2022-03-15 00:00:00',
 '{"newsletter": true, "notifications": true, "theme": "light"}');

-- 상품 샘플 데이터
INSERT INTO products (
  id, name, description, category_id, brand, sku,
  price, original_price, discount,
  image, images,
  in_stock, stock, rating, review_count,
  shipping, delivery_info,
  features, specs
) VALUES
(1, '무선 블루투스 헤드폰', '프리미엄 무선 헤드폰으로 탁월한 음질과 편안한 착용감을 제공합니다.',
 1, 'AudioPro', 'AP-BT-HP-001',
 89000, 129000, 31,
 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
 '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&h=600&fit=crop"]',
 1, 45, 4.7, 128,
 '무료배송', '오늘 출발 (17시 이전 주문 시)',
 '["액티브 노이즈 캔슬링", "최대 30시간 배터리", "블루투스 5.0", "접이식 디자인", "프리미엄 사운드 품질"]',
 '{"무게": "250g", "배터리": "30시간", "연결": "블루투스 5.0", "색상": "블랙, 실버, 네이비", "보증": "1년"}'),
(2, '스마트 워치', '건강 관리와 스마트 기능을 한번에',
 1, 'TechWatch', 'TW-SW-002',
 249000, 249000, 0,
 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
 '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"]',
 1, 30, 4.5, 89,
 '무료배송', '2-3일 소요',
 '["심박수 모니터링", "수면 추적", "방수 기능"]',
 '{"디스플레이": "1.4인치 AMOLED", "배터리": "7일", "방수": "IP68"}');

-- 상품 이미지 샘플 데이터
INSERT INTO product_images (product_id, image_url, alt_text, image_type, display_order, format) VALUES
(1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', '무선 블루투스 헤드폰 메인', 'main', 1, 'jpg'),
(1, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop', '무선 블루투스 헤드폰 측면', 'gallery', 2, 'jpg'),
(1, 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&h=600&fit=crop', '무선 블루투스 헤드폰 착용', 'gallery', 3, 'jpg'),
(2, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', '스마트 워치 메인', 'main', 1, 'jpg');

-- 상품 후기 샘플 데이터
INSERT INTO product_reviews (product_id, user_id, rating, title, content, is_verified_purchase, is_approved, created_at) VALUES
(1, 1001, 5, '음질이 정말 좋아요!', '노이즈 캔슬링 기능도 훌륭합니다.', 1, 1, '2024-01-15 10:30:00'),
(1, 1001, 5, '배터리가 오래가요', '배터리가 오래가서 좋고, 착용감도 편안합니다. 강력 추천!', 1, 1, '2024-01-10 14:20:00'),
(1, 1001, 4, '가성비 좋아요', '가격 대비 성능이 우수합니다. 다만 조금 무거운 편입니다.', 1, 1, '2024-01-05 09:15:00');

-- ============================================
-- 트리거 (updated_at 자동 업데이트)
-- ============================================

CREATE TRIGGER update_users_timestamp AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_categories_timestamp AFTER UPDATE ON categories
BEGIN
  UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_products_timestamp AFTER UPDATE ON products
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_product_images_timestamp AFTER UPDATE ON product_images
BEGIN
  UPDATE product_images SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_product_reviews_timestamp AFTER UPDATE ON product_reviews
BEGIN
  UPDATE product_reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_cart_timestamp AFTER UPDATE ON cart
BEGIN
  UPDATE cart SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_orders_timestamp AFTER UPDATE ON orders
BEGIN
  UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_order_items_timestamp AFTER UPDATE ON order_items
BEGIN
  UPDATE order_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_payments_timestamp AFTER UPDATE ON payments
BEGIN
  UPDATE payments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
