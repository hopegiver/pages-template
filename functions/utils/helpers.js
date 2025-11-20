// D1 Database Helper Utilities
// Cloudflare Pages Functions용 D1 헬퍼

/**
 * JSON 응답 생성
 */
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * 에러 응답 생성
 */
export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

/**
 * CORS preflight 처리
 */
export function handleOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * 페이지네이션 파라미터 추출
 */
export function getPaginationParams(url) {
  const params = new URL(url).searchParams;
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '20');
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * 쿼리 파라미터 추출
 */
export function getQueryParams(url) {
  return Object.fromEntries(new URL(url).searchParams);
}

/**
 * 페이지네이션 응답 생성
 */
export function paginatedResponse(data, total, page, limit) {
  return jsonResponse({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
