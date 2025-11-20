// GET /api/categories/:slug - 카테고리 상세 및 상품 조회
import { jsonResponse, errorResponse, handleOptions, getPaginationParams, paginatedResponse } from '../../utils/helpers.js';

export async function onRequestGet({ params, request, env }) {
  try {
    const { slug } = params;
    const { page, limit, offset } = getPaginationParams(request.url);

    // 카테고리 정보 조회
    const categoryQuery = `
      SELECT
        id, name, slug, description, parent_id, image
      FROM categories
      WHERE slug = ? AND is_active = 1
    `;

    const category = await env.DB.prepare(categoryQuery).bind(slug).first();

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    // 해당 카테고리의 상품 개수
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products
      WHERE category_id = ? AND is_active = 1
    `;
    const { total } = await env.DB.prepare(countQuery).bind(category.id).first();

    // 해당 카테고리의 상품 목록
    const productsQuery = `
      SELECT
        id, name, description, price, original_price,
        discount, image, rating, review_count,
        in_stock, stock
      FROM products
      WHERE category_id = ? AND is_active = 1
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const { results: products } = await env.DB.prepare(productsQuery)
      .bind(category.id, limit, offset)
      .all();

    return jsonResponse({
      category,
      products: {
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    return errorResponse('Failed to fetch category', 500);
  }
}

// OPTIONS 요청 처리
export async function onRequestOptions() {
  return handleOptions();
}
