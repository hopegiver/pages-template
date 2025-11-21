// API 호출 로직

// 환경에 따라 API URL 설정
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment ? 'http://localhost:8788' : '';

/**
 * Fetch wrapper for API calls
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options
 * @returns {Promise<any>} API response data
 */
export async function fetchAPI(endpoint, options = {}) {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Get products list
 * @param {object} params - Query parameters
 * @param {string} params.category - Filter by category slug
 * @param {string} params.search - Search keyword
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.sortBy - Sort field
 * @param {string} params.sortOrder - Sort order (ASC/DESC)
 */
export async function getProducts(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.category) queryParams.append('category', params.category);
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.inStock) queryParams.append('inStock', params.inStock);
  if (params.featured) queryParams.append('featured', params.featured);

  const queryString = queryParams.toString();
  const endpoint = `/api/products${queryString ? '?' + queryString : ''}`;

  return fetchAPI(endpoint);
}

/**
 * Get product detail
 * @param {number} productId - Product ID
 */
export async function getProductDetail(productId) {
  return fetchAPI(`/api/products/${productId}`);
}

/**
 * Get categories list
 */
export async function getCategories() {
  return fetchAPI('/api/categories');
}

/**
 * Get category products
 * @param {string} slug - Category slug
 * @param {object} params - Query parameters
 */
export async function getCategoryProducts(slug, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const queryString = queryParams.toString();
  const endpoint = `/api/categories/${slug}${queryString ? '?' + queryString : ''}`;

  return fetchAPI(endpoint);
}

/**
 * Get cart data
 * @param {object} params - Query parameters
 * @param {number} params.userId - User ID
 * @param {string} params.sessionId - Session ID for guest users
 */
export async function getCart(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.userId) queryParams.append('userId', params.userId);
  if (params.sessionId) queryParams.append('sessionId', params.sessionId);

  const queryString = queryParams.toString();
  return fetchAPI(`/api/cart${queryString ? '?' + queryString : ''}`);
}

/**
 * Add to cart
 * @param {object} data - Cart item data
 */
export async function addToCart(data) {
  return fetchAPI('/api/cart', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update cart item
 * @param {number} cartId - Cart item ID
 * @param {object} data - Update data
 */
export async function updateCartItem(cartId, data) {
  return fetchAPI(`/api/cart/${cartId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Remove from cart
 * @param {number} cartId - Cart item ID
 */
export async function removeFromCart(cartId) {
  return fetchAPI(`/api/cart/${cartId}`, {
    method: 'DELETE',
  });
}

/**
 * Get product reviews
 * @param {object} params - Query parameters
 */
export async function getReviews(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.productId) queryParams.append('productId', params.productId);
  if (params.userId) queryParams.append('userId', params.userId);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const queryString = queryParams.toString();
  return fetchAPI(`/api/reviews${queryString ? '?' + queryString : ''}`);
}

/**
 * Create review
 * @param {object} data - Review data
 */
export async function createReview(data) {
  return fetchAPI('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get orders
 * @param {object} params - Query parameters
 */
export async function getOrders(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.userId) queryParams.append('userId', params.userId);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const queryString = queryParams.toString();
  return fetchAPI(`/api/orders${queryString ? '?' + queryString : ''}`);
}

/**
 * Create order
 * @param {object} data - Order data
 */
export async function createOrder(data) {
  return fetchAPI('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get order detail
 * @param {string} orderId - Order ID or order number
 * @param {number} userId - User ID for authorization
 */
export async function getOrderDetail(orderId, userId) {
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append('userId', userId);

  const queryString = queryParams.toString();
  return fetchAPI(`/api/orders/${orderId}${queryString ? '?' + queryString : ''}`);
}
