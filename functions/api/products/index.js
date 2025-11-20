// GET /api/products - 상품 목록 조회
import { jsonResponse, errorResponse, handleOptions, getPaginationParams, paginatedResponse } from '../../utils/helpers.js';

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const { page, limit, offset } = getPaginationParams(request.url);

    // 쿼리 파라미터
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const inStock = url.searchParams.get('inStock');
    const featured = url.searchParams.get('featured');
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const sortOrder = url.searchParams.get('sortOrder') || 'DESC';

    // WHERE 조건 구성
    let conditions = ['p.is_active = 1'];
    let params = [];

    if (category) {
      conditions.push('c.slug = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      conditions.push('p.price >= ?');
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      conditions.push('p.price <= ?');
      params.push(parseFloat(maxPrice));
    }

    if (inStock === 'true') {
      conditions.push('p.in_stock = 1 AND p.stock > 0');
    }

    if (featured === 'true') {
      conditions.push('p.is_featured = 1');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 정렬 검증
    const allowedSortFields = ['price', 'rating', 'created_at', 'sales_count', 'name'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // 전체 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const { total } = await env.DB.prepare(countQuery).bind(...params).first();

    // 상품 목록 조회
    const query = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.discount,
        p.image,
        p.rating,
        p.review_count,
        p.in_stock,
        p.stock,
        p.is_featured,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.${orderField} ${orderDirection}
      LIMIT ? OFFSET ?
    `;

    const { results } = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();

    return paginatedResponse(results, total, page, limit);

  } catch (error) {
    console.error('Error fetching products:', error);
    return errorResponse('Failed to fetch products', 500);
  }
}

// POST /api/products - 상품 생성 (관리자용)
export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    const {
      name,
      description,
      category_id,
      brand,
      sku,
      price,
      original_price,
      discount = 0,
      cost_price,
      stock = 0,
      shipping = '무료배송',
      delivery_info,
      features,
      specs,
    } = data;

    // 필수 필드 검증
    if (!name || !category_id || !price) {
      return errorResponse('Missing required fields: name, category_id, price');
    }

    const query = `
      INSERT INTO products (
        name, description, category_id, brand, sku,
        price, original_price, discount, cost_price,
        stock, in_stock, shipping, delivery_info,
        features, specs
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await env.DB.prepare(query)
      .bind(
        name,
        description || null,
        category_id,
        brand || null,
        sku || null,
        price,
        original_price || null,
        discount,
        cost_price || null,
        stock,
        stock > 0 ? 1 : 0,
        shipping,
        delivery_info || null,
        features ? JSON.stringify(features) : null,
        specs ? JSON.stringify(specs) : null
      )
      .run();

    return jsonResponse({
      success: true,
      id: result.meta.last_row_id,
      message: 'Product created successfully',
    }, 201);

  } catch (error) {
    console.error('Error creating product:', error);
    return errorResponse('Failed to create product', 500);
  }
}

// OPTIONS 요청 처리
export async function onRequestOptions() {
  return handleOptions();
}
