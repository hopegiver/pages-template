// GET /api/categories - 카테고리 목록 조회
import { jsonResponse, errorResponse, handleOptions } from '../../utils/helpers.js';

export async function onRequestGet({ env }) {
  try {
    const query = `
      SELECT
        id,
        name,
        slug,
        description,
        parent_id,
        image,
        display_order
      FROM categories
      WHERE is_active = 1
      ORDER BY display_order ASC, name ASC
    `;

    const { results } = await env.DB.prepare(query).all();

    // 계층 구조로 변환
    const categoriesMap = new Map();
    const rootCategories = [];

    // 먼저 모든 카테고리를 맵에 추가
    results.forEach(cat => {
      categoriesMap.set(cat.id, { ...cat, children: [] });
    });

    // 부모-자식 관계 설정
    results.forEach(cat => {
      const category = categoriesMap.get(cat.id);
      if (cat.parent_id) {
        const parent = categoriesMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return jsonResponse({
      categories: rootCategories,
      flat: results, // 플랫한 목록도 함께 제공
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}

// POST /api/categories - 카테고리 생성 (관리자용)
export async function onRequestPost({ request, env }) {
  try {
    const { name, slug, description, parent_id, image, display_order = 0 } = await request.json();

    if (!name || !slug) {
      return errorResponse('Missing required fields: name, slug');
    }

    // slug 중복 체크
    const existing = await env.DB.prepare('SELECT id FROM categories WHERE slug = ?')
      .bind(slug)
      .first();

    if (existing) {
      return errorResponse('Category slug already exists', 409);
    }

    const query = `
      INSERT INTO categories (name, slug, description, parent_id, image, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await env.DB.prepare(query)
      .bind(name, slug, description || null, parent_id || null, image || null, display_order)
      .run();

    return jsonResponse({
      success: true,
      id: result.meta.last_row_id,
      message: 'Category created successfully',
    }, 201);

  } catch (error) {
    console.error('Error creating category:', error);
    return errorResponse('Failed to create category', 500);
  }
}

// OPTIONS 요청 처리
export async function onRequestOptions() {
  return handleOptions();
}
