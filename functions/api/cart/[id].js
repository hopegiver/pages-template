// PUT /api/cart/:id - 장바구니 아이템 수량 변경
import { jsonResponse, errorResponse, handleOptions } from '../../utils/helpers.js';

export async function onRequestPut({ params, request, env }) {
  try {
    const { id } = params;
    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return errorResponse('Invalid quantity');
    }

    // 장바구니 아이템 조회
    const cartItem = await env.DB.prepare('SELECT product_id FROM cart WHERE id = ?')
      .bind(id)
      .first();

    if (!cartItem) {
      return errorResponse('Cart item not found', 404);
    }

    // 상품 재고 확인
    const product = await env.DB.prepare('SELECT stock, in_stock FROM products WHERE id = ?')
      .bind(cartItem.product_id)
      .first();

    if (!product.in_stock || product.stock < quantity) {
      return errorResponse('Insufficient stock', 400);
    }

    // 수량 업데이트
    await env.DB.prepare('UPDATE cart SET quantity = ? WHERE id = ?')
      .bind(quantity, id)
      .run();

    return jsonResponse({
      success: true,
      message: 'Cart updated',
    });

  } catch (error) {
    console.error('Error updating cart:', error);
    return errorResponse('Failed to update cart', 500);
  }
}

// DELETE /api/cart/:id - 장바구니 아이템 삭제
export async function onRequestDelete({ params, env }) {
  try {
    const { id } = params;

    const result = await env.DB.prepare('DELETE FROM cart WHERE id = ?')
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return errorResponse('Cart item not found', 404);
    }

    return jsonResponse({
      success: true,
      message: 'Item removed from cart',
    });

  } catch (error) {
    console.error('Error removing from cart:', error);
    return errorResponse('Failed to remove from cart', 500);
  }
}

// OPTIONS 요청 처리
export async function onRequestOptions() {
  return handleOptions();
}
