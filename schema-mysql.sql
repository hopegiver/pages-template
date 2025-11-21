-- ============================================
-- E-Commerce Database Schema
-- ============================================
-- 전자상거래 데이터베이스 스키마
-- 작성일: 2025-11-20
-- ============================================

-- 1. 회원 테이블 (Users)
-- ============================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- 해시된 비밀번호
  phone VARCHAR(20),
  avatar VARCHAR(500), -- 프로필 이미지 URL

  -- 주소 정보
  address TEXT,

  -- 회원 정보
  member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,

  -- 환경설정 (JSON)
  preferences JSON, -- {newsletter: true, notifications: true, theme: 'light'}

  -- 계정 상태
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_is_active (is_active)
);


-- 2. 카테고리 테이블 (Categories)
-- ============================================
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE, -- URL 친화적 이름
  description TEXT,
  parent_id INT, -- 상위 카테고리 (계층 구조)
  image VARCHAR(500), -- 카테고리 이미지

  -- 정렬 및 표시
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_parent_id (parent_id),
  INDEX idx_is_active (is_active)
);


-- 3. 상품 테이블 (Products)
-- ============================================
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,

  -- 기본 정보
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT NOT NULL,
  brand VARCHAR(100),
  sku VARCHAR(100) UNIQUE, -- 상품 고유 코드

  -- 가격 정보
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2), -- 정가
  discount INT DEFAULT 0, -- 할인율 (%)
  cost_price DECIMAL(10, 2), -- 원가

  -- 이미지
  image VARCHAR(500), -- 메인 이미지 URL
  images JSON, -- 추가 이미지들 (배열)

  -- 재고 정보
  in_stock BOOLEAN DEFAULT TRUE,
  stock INT DEFAULT 0,
  min_stock INT DEFAULT 0, -- 최소 재고 경고

  -- 평점 및 리뷰
  rating DECIMAL(2, 1) DEFAULT 0.0,
  review_count INT DEFAULT 0,

  -- 배송 정보
  shipping VARCHAR(100) DEFAULT '무료배송',
  delivery_info VARCHAR(255),
  weight DECIMAL(8, 2), -- 무게 (kg)

  -- 상세 정보
  features JSON, -- 주요 특징 (배열)
  specs JSON, -- 상품 사양 (객체)
  detail_description TEXT, -- HTML 형식의 상세 설명

  -- 판매 통계
  view_count INT DEFAULT 0,
  sales_count INT DEFAULT 0,

  -- 상품 상태
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE, -- 추천 상품

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_category_id (category_id),
  INDEX idx_price (price),
  INDEX idx_rating (rating),
  INDEX idx_in_stock (in_stock),
  INDEX idx_is_active (is_active),
  INDEX idx_is_featured (is_featured),
  INDEX idx_sku (sku)
);


-- 4. 상품 이미지 테이블 (Product Images)
-- ============================================
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,

  -- 이미지 정보
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255), -- 대체 텍스트 (접근성)

  -- 이미지 타입
  image_type ENUM('main', 'thumbnail', 'detail', 'gallery') DEFAULT 'gallery',

  -- 정렬 순서
  display_order INT DEFAULT 0,

  -- 이미지 메타데이터
  file_size INT, -- 파일 크기 (bytes)
  width INT, -- 이미지 너비 (px)
  height INT, -- 이미지 높이 (px)
  format VARCHAR(10), -- 파일 형식 (jpg, png, webp)

  -- 상태
  is_active BOOLEAN DEFAULT TRUE,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_image_type (image_type),
  INDEX idx_display_order (display_order),
  INDEX idx_is_active (is_active)
);


-- 5. 상품 후기 테이블 (Product Reviews)
-- ============================================
CREATE TABLE product_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,

  -- 후기 내용
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT NOT NULL,

  -- 이미지
  images JSON, -- 후기 이미지들 (배열)

  -- 추천/도움
  helpful_count INT DEFAULT 0, -- 도움이 됐어요 수

  -- 구매 확인
  is_verified_purchase BOOLEAN DEFAULT FALSE,

  -- 상태
  is_approved BOOLEAN DEFAULT FALSE, -- 관리자 승인
  is_visible BOOLEAN DEFAULT TRUE,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_rating (rating),
  INDEX idx_is_approved (is_approved),
  INDEX idx_created_at (created_at)
);


-- 6. 장바구니 테이블 (Cart)
-- ============================================
CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT, -- NULL이면 비회원 장바구니
  session_id VARCHAR(255), -- 비회원용 세션 ID
  product_id INT NOT NULL,

  -- 수량 및 가격
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL, -- 담을 당시 가격 (기록용)

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_product_id (product_id),
  UNIQUE KEY unique_cart_item (user_id, product_id, session_id)
);


-- 7. 주문 테이블 (Orders)
-- ============================================
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) NOT NULL UNIQUE, -- 주문번호 (예: ORD-2024-001)
  user_id INT NOT NULL,

  -- 주문 금액
  subtotal DECIMAL(10, 2) NOT NULL, -- 상품 금액
  shipping_cost DECIMAL(10, 2) DEFAULT 0, -- 배송비
  discount_amount DECIMAL(10, 2) DEFAULT 0, -- 할인 금액
  tax_amount DECIMAL(10, 2) DEFAULT 0, -- 세금
  total_amount DECIMAL(10, 2) NOT NULL, -- 최종 결제 금액

  -- 배송 정보
  recipient_name VARCHAR(100) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_email VARCHAR(255),
  shipping_address TEXT NOT NULL,
  shipping_zip_code VARCHAR(20),
  shipping_message TEXT, -- 배송 메시지

  -- 주문 상태
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',

  -- 쿠폰/포인트
  coupon_code VARCHAR(50),
  points_used DECIMAL(10, 2) DEFAULT 0,

  -- 메모
  order_memo TEXT, -- 주문 메모
  admin_memo TEXT, -- 관리자 메모

  -- 타임스탬프
  ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP NULL,
  shipped_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_order_number (order_number),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_ordered_at (ordered_at)
);


-- 8. 주문 상세 테이블 (Order Items)
-- ============================================
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,

  -- 상품 정보 (주문 당시 스냅샷)
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  product_sku VARCHAR(100),

  -- 가격 정보
  unit_price DECIMAL(10, 2) NOT NULL, -- 단가
  quantity INT NOT NULL, -- 수량
  subtotal DECIMAL(10, 2) NOT NULL, -- 소계 (단가 × 수량)
  discount_amount DECIMAL(10, 2) DEFAULT 0, -- 할인액

  -- 배송 정보
  shipping_status ENUM('pending', 'preparing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  tracking_number VARCHAR(100), -- 송장번호

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id),
  INDEX idx_shipping_status (shipping_status)
);


-- 9. 결제 테이블 (Payments)
-- ============================================
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,

  -- 결제 정보
  payment_method ENUM('card', 'bank_transfer', 'virtual_account', 'mobile', 'point', 'kakaopay', 'naverpay', 'paypal') NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL,

  -- PG사 정보
  pg_provider VARCHAR(50), -- 결제 대행사 (예: 'inicis', 'toss', 'kakao')
  pg_transaction_id VARCHAR(255), -- PG사 거래 ID

  -- 카드 결제 정보 (카드인 경우)
  card_company VARCHAR(50),
  card_number_masked VARCHAR(20), -- 마스킹된 카드번호 (예: ****-****-****-1234)
  installment_months INT DEFAULT 0, -- 할부 개월 (0이면 일시불)

  -- 계좌 이체 정보 (가상계좌인 경우)
  bank_name VARCHAR(50),
  account_number VARCHAR(50),
  account_holder VARCHAR(100),

  -- 결제 상태
  status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',

  -- 승인 정보
  approval_number VARCHAR(50), -- 승인번호
  approved_at TIMESTAMP NULL,

  -- 취소/환불 정보
  cancelled_at TIMESTAMP NULL,
  cancelled_amount DECIMAL(10, 2) DEFAULT 0,
  cancel_reason TEXT,

  -- 실패 정보
  failure_reason TEXT,

  -- 영수증
  receipt_url VARCHAR(500), -- 영수증 URL

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_pg_transaction_id (pg_transaction_id),
  INDEX idx_approved_at (approved_at)
);


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
 JSON_OBJECT('newsletter', true, 'notifications', true, 'theme', 'light'));

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
 JSON_ARRAY(
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
   'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
   'https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&h=600&fit=crop'
 ),
 TRUE, 45, 4.7, 128,
 '무료배송', '오늘 출발 (17시 이전 주문 시)',
 JSON_ARRAY('액티브 노이즈 캔슬링', '최대 30시간 배터리', '블루투스 5.0', '접이식 디자인', '프리미엄 사운드 품질'),
 JSON_OBJECT('무게', '250g', '배터리', '30시간', '연결', '블루투스 5.0', '색상', '블랙, 실버, 네이비', '보증', '1년')
),
(2, '스마트 워치', '건강 관리와 스마트 기능을 한번에',
 1, 'TechWatch', 'TW-SW-002',
 249000, 249000, 0,
 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
 JSON_ARRAY('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'),
 TRUE, 30, 4.5, 89,
 '무료배송', '2-3일 소요',
 JSON_ARRAY('심박수 모니터링', '수면 추적', '방수 기능'),
 JSON_OBJECT('디스플레이', '1.4인치 AMOLED', '배터리', '7일', '방수', 'IP68')
);

-- 상품 이미지 샘플 데이터
INSERT INTO product_images (product_id, image_url, alt_text, image_type, display_order, format) VALUES
-- 상품 1 (무선 블루투스 헤드폰) 이미지
(1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', '무선 블루투스 헤드폰 메인', 'main', 1, 'jpg'),
(1, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop', '무선 블루투스 헤드폰 측면', 'gallery', 2, 'jpg'),
(1, 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&h=600&fit=crop', '무선 블루투스 헤드폰 착용', 'gallery', 3, 'jpg'),
-- 상품 2 (스마트 워치) 이미지
(2, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', '스마트 워치 메인', 'main', 1, 'jpg');

-- 상품 후기 샘플 데이터
INSERT INTO product_reviews (product_id, user_id, rating, title, content, is_verified_purchase, is_approved, created_at) VALUES
(1, 1001, 5, '음질이 정말 좋아요!', '노이즈 캔슬링 기능도 훌륭합니다.', TRUE, TRUE, '2024-01-15 10:30:00'),
(1, 1001, 5, '배터리가 오래가요', '배터리가 오래가서 좋고, 착용감도 편안합니다. 강력 추천!', TRUE, TRUE, '2024-01-10 14:20:00'),
(1, 1001, 4, '가성비 좋아요', '가격 대비 성능이 우수합니다. 다만 조금 무거운 편입니다.', TRUE, TRUE, '2024-01-05 09:15:00');


-- ============================================
-- 유용한 VIEW 생성
-- ============================================

-- 상품 전체 정보 VIEW (카테고리 포함)
CREATE VIEW v_products_full AS
SELECT
  p.*,
  c.name AS category_name,
  c.slug AS category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- 주문 요약 VIEW
CREATE VIEW v_orders_summary AS
SELECT
  o.id,
  o.order_number,
  o.user_id,
  u.name AS user_name,
  u.email AS user_email,
  o.total_amount,
  o.status,
  o.ordered_at,
  o.delivered_at,
  COUNT(oi.id) AS item_count,
  GROUP_CONCAT(oi.product_name SEPARATOR ', ') AS products
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- 상품 평균 평점 VIEW
CREATE VIEW v_product_ratings AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  COUNT(pr.id) AS review_count,
  AVG(pr.rating) AS avg_rating
FROM products p
LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = TRUE
GROUP BY p.id;


-- ============================================
-- 트리거 예시
-- ============================================

-- 상품 후기 추가 시 상품의 평점 자동 업데이트
DELIMITER //
CREATE TRIGGER update_product_rating_after_review
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
  UPDATE products p
  SET
    rating = (
      SELECT AVG(rating)
      FROM product_reviews
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    ),
    review_count = (
      SELECT COUNT(*)
      FROM product_reviews
      WHERE product_id = NEW.product_id AND is_approved = TRUE
    )
  WHERE p.id = NEW.product_id;
END//
DELIMITER ;

-- ============================================
-- 인덱스 최적화 (추가 인덱스)
-- ============================================

-- 복합 인덱스
CREATE INDEX idx_products_category_price ON products(category_id, price);
CREATE INDEX idx_products_category_rating ON products(category_id, rating DESC);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_reviews_product_approved ON product_reviews(product_id, is_approved, created_at DESC);

-- 전문 검색 인덱스 (MySQL 5.7+)
-- CREATE FULLTEXT INDEX idx_products_search ON products(name, description);
