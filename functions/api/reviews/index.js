// GET /api/reviews - 리뷰 목록 조회
import { jsonResponse, errorResponse, handleOptions, getPaginationParams, paginatedResponse } from '../../utils/helpers.js';

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const userId = url.searchParams.get('userId');
    const { page, limit, offset } = getPaginationParams(request.url);

    // WHERE 조건
    let conditions = ['pr.is_approved = 1', 'pr.is_visible = 1'];
    let params = [];

    if (productId) {
      conditions.push('pr.product_id = ?');
      params.push(parseInt(productId));
    }

    if (userId) {
      conditions.push('pr.user_id = ?');
      params.push(parseInt(userId));
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // 전체 개수
    const countQuery = `SELECT COUNT(*) as total FROM product_reviews pr ${whereClause}`;
    const { total } = await env.DB.prepare(countQuery).bind(...params).first();

    // 리뷰 목록
    const query = `
      SELECT
        pr.id,
        pr.product_id,
        pr.rating,
        pr.title,
        pr.content,
        pr.images,
        pr.helpful_count,
        pr.is_verified_purchase,
        pr.created_at,
        u.name as author_name,
        p.name as product_name
      FROM product_reviews pr
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN products p ON pr.product_id = p.id
      ${whereClause}
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const { results } = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();

    // JSON 파싱
    results.forEach(review => {
      if (review.images) {
        review.images = JSON.parse(review.images);
      }
      review.author = review.author_name || '익명';
      review.date = review.created_at;
    });

    return paginatedResponse(results, total, page, limit);

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return errorResponse('Failed to fetch reviews', 500);
  }
}

// POST /api/reviews - 리뷰 작성
export async function onRequestPost({ request, env }) {
  try {
    const {
      userId,
      productId,
      rating,
      title,
      content,
      images = [],
    } = await request.json();

    if (!userId || !productId || !rating || !content) {
      return errorResponse('Missing required fields');
    }

    if (rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5');
    }

    // 상품 존재 확인
    const product = await env.DB.prepare('SELECT id FROM products WHERE id = ?')
      .bind(productId)
      .first();

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // 구매 확인 (주문 이력이 있는지)
    const orderCheck = await env.DB.prepare(`
      SELECT 1 FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
      LIMIT 1
    `).bind(userId, productId).first();

    const isVerifiedPurchase = !!orderCheck;

    // 리뷰 작성
    const query = `
      INSERT INTO product_reviews (
        product_id, user_id, rating, title, content, images, is_verified_purchase
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await env.DB.prepare(query)
      .bind(
        productId,
        userId,
        rating,
        title || null,
        content,
        images.length > 0 ? JSON.stringify(images) : null,
        isVerifiedPurchase ? 1 : 0
      )
      .run();

    return jsonResponse({
      success: true,
      id: result.meta.last_row_id,
      message: 'Review submitted successfully. It will be visible after approval.',
    }, 201);

  } catch (error) {
    console.error('Error creating review:', error);
    return errorResponse('Failed to create review', 500);
  }
}

// OPTIONS 요청 처리
export async function onRequestOptions() {
  return handleOptions();
}
