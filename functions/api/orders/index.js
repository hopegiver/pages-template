// GET /api/orders - 주문 목록 조회
import { jsonResponse, errorResponse, handleOptions, getPaginationParams, paginatedResponse } from '../../utils/helpers.js';

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const status = url.searchParams.get('status');
    const { page, limit, offset } = getPaginationParams(request.url);

    if (!userId) {
      return errorResponse('userId is required');
    }

    // WHERE 조건
    let conditions = ['user_id = ?'];
    let params = [parseInt(userId)];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // 전체 개수
    const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
    const { total } = await env.DB.prepare(countQuery).bind(...params).first();

    // 주문 목록
    const query = `
      SELECT
        id,
        order_number,
        total_amount,
        status,
        ordered_at,
        delivered_at
      FROM orders
      ${whereClause}
      ORDER BY ordered_at DESC
      LIMIT ? OFFSET ?
    `;

    const { results } = await env.DB.prepare(query)
      .bind(...params, limit, offset)
      .all();

    // 각 주문의 상품 개수 조회
    for (const order of results) {
      const { item_count } = await env.DB.prepare(
        'SELECT COUNT(*) as item_count FROM order_items WHERE order_id = ?'
      ).bind(order.id).first();
      order.item_count = item_count;
    }

    return paginatedResponse(results, total, page, limit);

  } catch (error) {
    console.error('Error fetching orders:', error);
    return errorResponse('Failed to fetch orders', 500);
  }
}

// POST /api/orders - 주문 생성
export async function onRequestPost({ request, env }) {
  try {
    const {
      userId,
      items, // [{ productId, quantity, price }]
      shippingInfo, // { name, phone, email, address, zipCode, message }
      paymentMethod,
      couponCode,
      pointsUsed = 0,
    } = await request.json();

    if (!userId || !items || !items.length || !shippingInfo) {
      return errorResponse('Missing required fields');
    }

    // 주문번호 생성
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // 금액 계산
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await env.DB.prepare(
        'SELECT id, name, price, stock, in_stock, image, sku FROM products WHERE id = ?'
      ).bind(item.productId).first();

      if (!product) {
        return errorResponse(`Product ${item.productId} not found`, 404);
      }

      if (!product.in_stock || product.stock < item.quantity) {
        return errorResponse(`Product ${product.name} is out of stock`, 400);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal,
      });
    }

    const shippingCost = subtotal >= 50000 ? 0 : 3000; // 5만원 이상 무료배송
    const discountAmount = 0; // TODO: 쿠폰 할인 로직
    const taxAmount = 0;
    const totalAmount = subtotal + shippingCost - discountAmount - pointsUsed + taxAmount;

    // 트랜잭션 시작 (D1은 batch 사용)
    const statements = [];

    // 1. 주문 생성
    statements.push(
      env.DB.prepare(`
        INSERT INTO orders (
          order_number, user_id,
          subtotal, shipping_cost, discount_amount, tax_amount, total_amount,
          recipient_name, recipient_phone, recipient_email,
          shipping_address, shipping_zip_code, shipping_message,
          status, coupon_code, points_used
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        orderNumber, userId,
        subtotal, shippingCost, discountAmount, taxAmount, totalAmount,
        shippingInfo.name, shippingInfo.phone, shippingInfo.email || null,
        shippingInfo.address, shippingInfo.zipCode || null, shippingInfo.message || null,
        'pending', couponCode || null, pointsUsed
      )
    );

    // 2. 주문 상세 생성 및 재고 감소
    for (const item of validatedItems) {
      // 주문 상세 추가 (order_id는 서브쿼리로 최신 주문 ID 가져오기)
      statements.push(
        env.DB.prepare(`
          INSERT INTO order_items (
            order_id, product_id, product_name, product_image, product_sku,
            unit_price, quantity, subtotal
          )
          SELECT id, ?, ?, ?, ?, ?, ?, ?
          FROM orders WHERE order_number = ?
        `).bind(
          item.productId, item.productName, item.productImage, item.productSku,
          item.unitPrice, item.quantity, item.subtotal,
          orderNumber
        )
      );

      // 재고 감소
      statements.push(
        env.DB.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
          .bind(item.quantity, item.productId)
      );
    }

    // 3. 장바구니 비우기
    statements.push(
      env.DB.prepare('DELETE FROM cart WHERE user_id = ?').bind(userId)
    );

    // 배치 실행
    await env.DB.batch(statements);

    // 생성된 주문 조회
    const order = await env.DB.prepare('SELECT * FROM orders WHERE order_number = ?')
      .bind(orderNumber)
      .first();

    return jsonResponse({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        status: order.status,
      },
      message: 'Order created successfully',
    }, 201);

  } catch (error) {
    console.error('Error creating order:', error);
    return errorResponse('Failed to create order', 500);
  }
}

// OPTIONS 요청 처리
export async function onRequestOptions() {
  return handleOptions();
}
