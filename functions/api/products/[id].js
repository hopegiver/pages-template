// GET /api/products/:id - 상품 상세 조회
import { jsonResponse, errorResponse, handleOptions } from '../../utils/helpers.js';

export async function onRequestGet({ params, env }) {
  try {
    const { id } = params;

    // 상품 기본 정보 조회
    const productQuery = `
      SELECT
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = 1
    `;

    const product = await env.DB.prepare(productQuery).bind(id).first();

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // JSON 필드 파싱
    if (product.features) {
      product.features = JSON.parse(product.features);
    }
    if (product.specs) {
      product.specs = JSON.parse(product.specs);
    }
    if (product.images) {
      product.images = JSON.parse(product.images);
    }

    // 상품 이미지 조회
    const imagesQuery = `
      SELECT
        id, image_url, alt_text, image_type, display_order
      FROM product_images
      WHERE product_id = ? AND is_active = 1
      ORDER BY display_order ASC
    `;

    const { results: images } = await env.DB.prepare(imagesQuery).bind(id).all();
    product.product_images = images;

    // 상품 리뷰 조회 (최신 5개)
    const reviewsQuery = `
      SELECT
        pr.id,
        pr.rating,
        pr.title,
        pr.content,
        pr.created_at,
        u.name as author,
        pr.is_verified_purchase,
        pr.helpful_count
      FROM product_reviews pr
      LEFT JOIN users u ON pr.user_id = u.id
      WHERE pr.product_id = ? AND pr.is_approved = 1 AND pr.is_visible = 1
      ORDER BY pr.created_at DESC
      LIMIT 5
    `;

    const { results: reviews } = await env.DB.prepare(reviewsQuery).bind(id).all();
    product.reviews = reviews.map(review => ({
      ...review,
      date: review.created_at,
      author: review.author || '익명',
    }));

    // 조회수 증가
    await env.DB.prepare('UPDATE products SET view_count = view_count + 1 WHERE id = ?')
      .bind(id)
      .run();

    return jsonResponse(product);

  } catch (error) {
    console.error('Error fetching product:', error);
    return errorResponse('Failed to fetch product', 500);
  }
}

// PUT /api/products/:id - 상품 수정 (관리자용)
export async function onRequestPut({ params, request, env }) {
  try {
    const { id } = params;
    const data = await request.json();

    // 상품 존재 여부 확인
    const existing = await env.DB.prepare('SELECT id FROM products WHERE id = ?').bind(id).first();
    if (!existing) {
      return errorResponse('Product not found', 404);
    }

    // 업데이트할 필드 동적 구성
    const updates = [];
    const values = [];

    const allowedFields = [
      'name', 'description', 'category_id', 'brand', 'sku',
      'price', 'original_price', 'discount', 'cost_price',
      'stock', 'in_stock', 'shipping', 'delivery_info',
      'is_active', 'is_featured'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    // JSON 필드 처리
    if (data.features) {
      updates.push('features = ?');
      values.push(JSON.stringify(data.features));
    }
    if (data.specs) {
      updates.push('specs = ?');
      values.push(JSON.stringify(data.specs));
    }

    if (updates.length === 0) {
      return errorResponse('No fields to update');
    }

    values.push(id);

    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
    await env.DB.prepare(query).bind(...values).run();

    return jsonResponse({
      success: true,
      message: 'Product updated successfully',
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return errorResponse('Failed to update product', 500);
  }
}

// DELETE /api/products/:id - 상품 삭제 (소프트 삭제)
export async function onRequestDelete({ params, env }) {
  try {
    const { id } = params;

    // 소프트 삭제 (is_active = 0)
    const result = await env.DB.prepare('UPDATE products SET is_active = 0 WHERE id = ?')
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return errorResponse('Product not found', 404);
    }

    return jsonResponse({
      success: true,
      message: 'Product deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return errorResponse('Failed to delete product', 500);
  }
}

// OPTIONS 요청 처리
export async function onRequestOptions() {
  return handleOptions();
}
