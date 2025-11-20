# API Documentation

Cloudflare D1 기반 E-Commerce API 엔드포인트 문서

## 목차
- [Products (상품)](#products-상품)
- [Categories (카테고리)](#categories-카테고리)
- [Cart (장바구니)](#cart-장바구니)
- [Orders (주문)](#orders-주문)
- [Reviews (리뷰)](#reviews-리뷰)

---

## Products (상품)

### GET /api/products
상품 목록 조회

**Query Parameters:**
- `page` (number): 페이지 번호 (기본값: 1)
- `limit` (number): 페이지당 항목 수 (기본값: 20)
- `category` (string): 카테고리 slug
- `search` (string): 검색 키워드
- `minPrice` (number): 최소 가격
- `maxPrice` (number): 최대 가격
- `inStock` (boolean): 재고 있는 상품만
- `featured` (boolean): 추천 상품만
- `sortBy` (string): 정렬 기준 (price, rating, created_at, sales_count, name)
- `sortOrder` (string): 정렬 순서 (ASC, DESC)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "무선 블루투스 헤드폰",
      "price": 89000,
      "original_price": 129000,
      "discount": 31,
      "rating": 4.7,
      "category_name": "전자제품"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### GET /api/products/:id
상품 상세 조회

**Response:**
```json
{
  "id": 1,
  "name": "무선 블루투스 헤드폰",
  "description": "프리미엄 무선 헤드폰",
  "price": 89000,
  "features": ["노이즈 캔슬링", "30시간 배터리"],
  "specs": { "무게": "250g", "배터리": "30시간" },
  "product_images": [
    {
      "image_url": "https://...",
      "image_type": "main",
      "display_order": 1
    }
  ],
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "content": "좋아요",
      "author": "김**"
    }
  ]
}
```

### POST /api/products
상품 생성 (관리자)

**Request Body:**
```json
{
  "name": "상품명",
  "description": "설명",
  "category_id": 1,
  "price": 10000,
  "stock": 100
}
```

### PUT /api/products/:id
상품 수정 (관리자)

### DELETE /api/products/:id
상품 삭제 (소프트 삭제)

---

## Categories (카테고리)

### GET /api/categories
카테고리 목록 조회 (계층 구조)

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "전자제품",
      "slug": "electronics",
      "children": [
        {
          "id": 5,
          "name": "스마트폰",
          "slug": "smartphones",
          "children": []
        }
      ]
    }
  ],
  "flat": [
    { "id": 1, "name": "전자제품", "slug": "electronics" }
  ]
}
```

### GET /api/categories/:slug
카테고리별 상품 조회

**Query Parameters:**
- `page` (number): 페이지 번호
- `limit` (number): 페이지당 항목 수

**Response:**
```json
{
  "category": {
    "id": 1,
    "name": "전자제품",
    "slug": "electronics"
  },
  "products": {
    "data": [...],
    "pagination": {...}
  }
}
```

### POST /api/categories
카테고리 생성 (관리자)

---

## Cart (장바구니)

### GET /api/cart
장바구니 조회

**Query Parameters:**
- `userId` (number): 회원 ID
- `sessionId` (string): 비회원 세션 ID

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "name": "무선 블루투스 헤드폰",
      "quantity": 2,
      "current_price": 89000,
      "image": "https://...",
      "in_stock": true,
      "stock": 45
    }
  ],
  "subtotal": 178000,
  "itemCount": 2
}
```

### POST /api/cart
장바구니에 상품 추가

**Request Body:**
```json
{
  "userId": 1001,
  "sessionId": "abc123",
  "productId": 1,
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product added to cart",
  "cartId": 1
}
```

### PUT /api/cart/:id
장바구니 수량 변경

**Request Body:**
```json
{
  "quantity": 3
}
```

### DELETE /api/cart/:id
장바구니 아이템 삭제

---

## Orders (주문)

### GET /api/orders
주문 목록 조회

**Query Parameters:**
- `userId` (number, required): 사용자 ID
- `status` (string): 주문 상태 필터
- `page` (number): 페이지 번호
- `limit` (number): 페이지당 항목 수

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "order_number": "ORD-2024-001",
      "total_amount": 178000,
      "status": "delivered",
      "ordered_at": "2024-01-15T10:30:00Z",
      "item_count": 2
    }
  ],
  "pagination": {...}
}
```

### POST /api/orders
주문 생성

**Request Body:**
```json
{
  "userId": 1001,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "shippingInfo": {
    "name": "홍길동",
    "phone": "010-1234-5678",
    "email": "hong@example.com",
    "address": "서울시 강남구...",
    "zipCode": "12345",
    "message": "문 앞에 놓아주세요"
  },
  "paymentMethod": "card",
  "couponCode": "SALE2024",
  "pointsUsed": 5000
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "orderNumber": "ORD-1234567890-ABC",
    "totalAmount": 178000,
    "status": "pending"
  },
  "message": "Order created successfully"
}
```

### GET /api/orders/:id
주문 상세 조회

**Query Parameters:**
- `userId` (number): 사용자 ID (본인 확인용)

**Response:**
```json
{
  "id": 1,
  "order_number": "ORD-2024-001",
  "total_amount": 178000,
  "status": "delivered",
  "recipient_name": "홍길동",
  "shipping_address": "서울시 강남구...",
  "items": [
    {
      "product_name": "무선 블루투스 헤드폰",
      "quantity": 2,
      "unit_price": 89000,
      "subtotal": 178000,
      "tracking_number": "1234567890"
    }
  ],
  "payment": {
    "payment_method": "card",
    "payment_amount": 178000,
    "status": "completed",
    "approval_number": "12345678"
  }
}
```

### PUT /api/orders/:id
주문 상태 업데이트 (관리자)

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "1234567890"
}
```

---

## Reviews (리뷰)

### GET /api/reviews
리뷰 목록 조회

**Query Parameters:**
- `productId` (number): 상품 ID
- `userId` (number): 사용자 ID
- `page` (number): 페이지 번호
- `limit` (number): 페이지당 항목 수

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "무선 블루투스 헤드폰",
      "rating": 5,
      "title": "정말 좋아요",
      "content": "음질이 훌륭합니다",
      "author": "김**",
      "is_verified_purchase": true,
      "helpful_count": 10,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {...}
}
```

### POST /api/reviews
리뷰 작성

**Request Body:**
```json
{
  "userId": 1001,
  "productId": 1,
  "rating": 5,
  "title": "정말 좋아요",
  "content": "음질이 훌륭합니다",
  "images": ["https://...", "https://..."]
}
```

**Response:**
```json
{
  "success": true,
  "id": 1,
  "message": "Review submitted successfully. It will be visible after approval."
}
```

### PUT /api/reviews/:id
리뷰 수정

**Request Body:**
```json
{
  "userId": 1001,
  "rating": 4,
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

### DELETE /api/reviews/:id
리뷰 삭제

**Query Parameters:**
- `userId` (number, required): 사용자 ID

### PATCH /api/reviews/:id/helpful
리뷰 도움 카운트 증가

---

## 에러 응답

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "error": "에러 메시지"
}
```

**HTTP 상태 코드:**
- 200: 성공
- 201: 생성 성공
- 400: 잘못된 요청
- 403: 권한 없음
- 404: 찾을 수 없음
- 409: 중복
- 500: 서버 오류

---

## D1 데이터베이스 설정

### 1. D1 데이터베이스 생성

```bash
# D1 데이터베이스 생성
npx wrangler d1 create ecommerce-db

# 출력된 database_id를 wrangler.toml에 복사
```

### 2. 스키마 초기화

```bash
# schema.sql 실행
npx wrangler d1 execute ecommerce-db --file=./schema.sql --remote
```

### 3. 로컬 개발

```bash
# 로컬에서 스키마 초기화
npx wrangler d1 execute ecommerce-db --file=./schema.sql --local

# 로컬 개발 서버 실행
npx wrangler pages dev . --d1 DB=ecommerce-db
```

### 4. 배포

```bash
# Cloudflare Pages에 배포
npx wrangler pages deploy
```

---

## CORS 설정

모든 API 엔드포인트는 CORS가 활성화되어 있습니다:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`
