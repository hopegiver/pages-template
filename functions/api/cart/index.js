// GET /api/cart - 장바구니 조회
import { jsonResponse, errorResponse, handleOptions } from '../../utils/helpers.js';

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const sessionId = url.searchParams.get('sessionId');

    if (!userId && !sessionId) {
      return errorResponse('userId or sessionId is required');
    }

    // 장바구니 아이템 조회
    let query = `
      SELECT
        c.id,
        c.product_id,
        c.quantity,
        c.price as cart_price,
        p.name,
        p.price as current_price,
        p.image,
        p.in_stock,
        p.stock
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE
    `;

    let params = [];
    if (userId) {
      query += ' c.user_id = ?';
      params.push(parseInt(userId));
    } else {
      query += ' c.session_id = ?';
      params.push(sessionId);
    }

    query += ' ORDER BY c.created_at DESC';

    const { results: items } = await env.DB.prepare(query).bind(...params).all();

    // 총합 계산
    const subtotal = items.reduce((sum, item) => sum + (item.current_price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return jsonResponse({
      items,
      subtotal,
      itemCount,
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return errorResponse('Failed to fetch cart', 500);
  }
}

// POST /api/cart - 장바구니에 상품 추가
export async function onRequestPost({ request, env }) {
  try {
    const { userId, sessionId, productId, quantity = 1 } = await request.json();

    if (!productId || (!userId && !sessionId)) {
      return errorResponse('Missing required fields');
    }

    // 상품 존재 및 재고 확인
    const product = await env.DB.prepare('SELECT price, stock, in_stock FROM products WHERE id = ?')
      .bind(productId)
      .first();

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    if (!product.in_stock || product.stock < quantity) {
      return errorResponse('Product out of stock', 400);
    }

    // 이미 장바구니에 있는지 확인
    let existingQuery = 'SELECT id, quantity FROM cart WHERE product_id = ?';
    let existingParams = [productId];

    if (userId) {
      existingQuery += ' AND user_id = ?';
      existingParams.push(parseInt(userId));
    } else {
      existingQuery += ' AND session_id = ?';
      existingParams.push(sessionId);
    }

    const existing = await env.DB.prepare(existingQuery).bind(...existingParams).first();

    if (existing) {
      // 수량 업데이트
      const newQuantity = existing.quantity + quantity;
      await env.DB.prepare('UPDATE cart SET quantity = ? WHERE id = ?')
        .bind(newQuantity, existing.id)
        .run();

      return jsonResponse({
        success: true,
        message: 'Cart updated',
        cartId: existing.id,
      });
    } else {
      // 새로운 아이템 추가
      const insertQuery = `
        INSERT INTO cart (user_id, session_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `;

      const result = await env.DB.prepare(insertQuery)
        .bind(
          userId ? parseInt(userId) : null,
          sessionId || null,
          productId,
          quantity,
          product.price
        )
        .run();

      return jsonResponse({
        success: true,
        message: 'Product added to cart',
        cartId: result.meta.last_row_id,
      }, 201);
    }

  } catch (error) {
    console.error('Error adding to cart:', error);
    return errorResponse('Failed to add to cart', 500);
  }
}

// OPTIONS 요청 처리
export async function onRequestOptions() {
  return handleOptions();
}
