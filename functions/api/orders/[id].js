// GET /api/orders/:id - 주문 상세 조회
import { jsonResponse, errorResponse, handleOptions } from '../../utils/helpers.js';

export async function onRequestGet({ params, request, env }) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    // 주문 정보 조회
    let query = 'SELECT * FROM orders WHERE ';
    let queryParams = [];

    // ID가 숫자면 order.id로, 아니면 order_number로 조회
    if (/^\d+$/.test(id)) {
      query += 'id = ?';
      queryParams.push(parseInt(id));
    } else {
      query += 'order_number = ?';
      queryParams.push(id);
    }

    // 본인 주문만 조회 (보안)
    if (userId) {
      query += ' AND user_id = ?';
      queryParams.push(parseInt(userId));
    }

    const order = await env.DB.prepare(query).bind(...queryParams).first();

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // 주문 상품 목록
    const itemsQuery = `
      SELECT
        id,
        product_id,
        product_name,
        product_image,
        product_sku,
        unit_price,
        quantity,
        subtotal,
        shipping_status,
        tracking_number
      FROM order_items
      WHERE order_id = ?
    `;

    const { results: items } = await env.DB.prepare(itemsQuery).bind(order.id).all();
    order.items = items;

    // 결제 정보
    const paymentQuery = `
      SELECT
        id,
        payment_method,
        payment_amount,
        status,
        approval_number,
        approved_at,
        card_company,
        card_number_masked
      FROM payments
      WHERE order_id = ?
    `;

    const payment = await env.DB.prepare(paymentQuery).bind(order.id).first();
    order.payment = payment;

    return jsonResponse(order);

  } catch (error) {
    console.error('Error fetching order:', error);
    return errorResponse('Failed to fetch order', 500);
  }
}

// PUT /api/orders/:id - 주문 상태 업데이트 (관리자용)
export async function onRequestPut({ params, request, env }) {
  try {
    const { id } = params;
    const { status, trackingNumber } = await request.json();

    if (!status) {
      return errorResponse('Status is required');
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return errorResponse('Invalid status');
    }

    // 상태 업데이트
    const updates = ['status = ?'];
    const params_arr = [status];

    // 상태별 타임스탬프 업데이트
    const now = new Date().toISOString();
    if (status === 'confirmed') {
      updates.push('confirmed_at = ?');
      params_arr.push(now);
    } else if (status === 'shipped') {
      updates.push('shipped_at = ?');
      params_arr.push(now);
    } else if (status === 'delivered') {
      updates.push('delivered_at = ?');
      params_arr.push(now);
    } else if (status === 'cancelled') {
      updates.push('cancelled_at = ?');
      params_arr.push(now);
    }

    params_arr.push(id);

    const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`;
    await env.DB.prepare(query).bind(...params_arr).run();

    // 송장번호 업데이트 (배송 중인 경우)
    if (status === 'shipped' && trackingNumber) {
      await env.DB.prepare('UPDATE order_items SET tracking_number = ?, shipping_status = ? WHERE order_id = ?')
        .bind(trackingNumber, 'shipped', id)
        .run();
    }

    return jsonResponse({
      success: true,
      message: 'Order status updated',
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return errorResponse('Failed to update order', 500);
  }
}

// OPTIONS 요청 처리
export async function onRequestOptions() {
  return handleOptions();
}
