// PUT /api/reviews/:id - 리뷰 수정
import { jsonResponse, errorResponse, handleOptions } from '../../utils/helpers.js';

export async function onRequestPut({ params, request, env }) {
  try {
    const { id } = params;
    const { userId, rating, title, content, images } = await request.json();

    if (!userId) {
      return errorResponse('userId is required');
    }

    // 본인 리뷰인지 확인
    const review = await env.DB.prepare('SELECT user_id FROM product_reviews WHERE id = ?')
      .bind(id)
      .first();

    if (!review) {
      return errorResponse('Review not found', 404);
    }

    if (review.user_id !== parseInt(userId)) {
      return errorResponse('Unauthorized', 403);
    }

    // 업데이트할 필드 구성
    const updates = [];
    const params_arr = [];

    if (rating) {
      if (rating < 1 || rating > 5) {
        return errorResponse('Rating must be between 1 and 5');
      }
      updates.push('rating = ?');
      params_arr.push(rating);
    }

    if (title !== undefined) {
      updates.push('title = ?');
      params_arr.push(title || null);
    }

    if (content) {
      updates.push('content = ?');
      params_arr.push(content);
    }

    if (images !== undefined) {
      updates.push('images = ?');
      params_arr.push(images.length > 0 ? JSON.stringify(images) : null);
    }

    if (updates.length === 0) {
      return errorResponse('No fields to update');
    }

    // 승인 대기 상태로 변경 (재검토 필요)
    updates.push('is_approved = 0');

    params_arr.push(id);

    const query = `UPDATE product_reviews SET ${updates.join(', ')} WHERE id = ?`;
    await env.DB.prepare(query).bind(...params_arr).run();

    return jsonResponse({
      success: true,
      message: 'Review updated successfully. It will be visible after re-approval.',
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return errorResponse('Failed to update review', 500);
  }
}

// DELETE /api/reviews/:id - 리뷰 삭제
export async function onRequestDelete({ params, request, env }) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return errorResponse('userId is required');
    }

    // 본인 리뷰인지 확인
    const review = await env.DB.prepare('SELECT user_id, product_id FROM product_reviews WHERE id = ?')
      .bind(id)
      .first();

    if (!review) {
      return errorResponse('Review not found', 404);
    }

    if (review.user_id !== parseInt(userId)) {
      return errorResponse('Unauthorized', 403);
    }

    // 소프트 삭제 (is_visible = 0)
    await env.DB.prepare('UPDATE product_reviews SET is_visible = 0 WHERE id = ?')
      .bind(id)
      .run();

    return jsonResponse({
      success: true,
      message: 'Review deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return errorResponse('Failed to delete review', 500);
  }
}

// PATCH /api/reviews/:id/helpful - 리뷰 도움 카운트 증가
export async function onRequestPatch({ params, env }) {
  try {
    const { id } = params;

    const result = await env.DB.prepare('UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = ?')
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return errorResponse('Review not found', 404);
    }

    return jsonResponse({
      success: true,
      message: 'Helpful count increased',
    });

  } catch (error) {
    console.error('Error updating helpful count:', error);
    return errorResponse('Failed to update helpful count', 500);
  }
}

// OPTIONS 요청 처리
export async function onRequestOptions() {
  return handleOptions();
}
