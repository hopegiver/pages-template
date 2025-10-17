// API 호출 로직

const API_BASE_URL = './mock-api';

/**
 * Fetch wrapper for API calls
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<any>} API response data
 */
export async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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
 */
export async function getProducts() {
  return fetchAPI('products.json');
}

/**
 * Get product detail
 */
export async function getProductDetail(productId) {
  return fetchAPI('product-detail.json');
}

/**
 * Get cart data
 */
export async function getCart() {
  return fetchAPI('cart.json');
}

/**
 * Get user data
 */
export async function getUser() {
  return fetchAPI('user.json');
}
