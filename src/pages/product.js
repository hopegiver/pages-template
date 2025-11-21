// 상품 상세 페이지

import { getProductDetail } from '../core/api.js';
import { createElement } from '../utils/dom.js';

export class ProductPage {
  constructor(props = {}) {
    this.props = props;
    this.productId = props.productId;
    this.product = null;
    this.onAddToCart = props.onAddToCart || (() => {});
    this.onBack = props.onBack || (() => {});
    this.currentTab = 'detail';
    this.quantity = 1;
    this.state = props.state; // State 인스턴스 (선택적)
  }

  async loadProduct() {
    try {
      this.product = await getProductDetail(this.productId);
      return this.product;
    } catch (error) {
      console.error('Failed to load product detail:', error);
      throw error;
    }
  }

  render() {
    const container = createElement('div', { className: 'product-detail-container' });

    // Load and render product
    this.loadProduct()
      .then(() => {
        container.innerHTML = '';
        const detail = this.renderProductDetail();
        container.appendChild(detail);
      })
      .catch(error => {
        container.innerHTML = '';
        const errorEl = createElement('div', {
          className: 'widget-error',
          innerHTML: `상품 정보를 불러올 수 없습니다: ${error.message}`
        });
        container.appendChild(errorEl);
      });

    return container;
  }

  renderProductDetail() {
    const detail = createElement('div', { className: 'product-detail' });

    // API 필드명 변환 (snake_case to camelCase)
    const product = {
      ...this.product,
      category: this.product.category_name || this.product.category,
      reviewCount: this.product.review_count || this.product.reviewCount || 0,
      originalPrice: this.product.original_price || this.product.originalPrice,
      inStock: this.product.in_stock !== undefined ? this.product.in_stock : this.product.inStock,
      deliveryInfo: this.product.delivery_info || this.product.deliveryInfo,
    };

    // product_images 배열을 images 배열로 변환
    const images = product.product_images?.map(img => img.image_url) || product.images || [];

    detail.innerHTML = `
      <!-- 뒤로가기 -->
      <button class="back-button" id="back-btn">← 목록으로</button>

      <!-- 상단: 이미지 + 상품 정보 -->
      <div class="product-top">
        <!-- 왼쪽: 상품 이미지 -->
        <div class="product-images">
          <div class="main-image">
            <img src="${product.image}" alt="${product.name}" id="main-image">
          </div>
          <div class="thumbnail-images">
            ${images.length > 0 ? images.map((img, idx) => `
              <img src="${img}" alt="상품 이미지 ${idx + 1}" class="thumbnail ${idx === 0 ? 'active' : ''}" data-index="${idx}">
            `).join('') : ''}
          </div>
        </div>

        <!-- 오른쪽: 상품 기본 정보 -->
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <h1 class="product-name">${product.name}</h1>

          <div class="product-rating">
            <span class="stars">${this.renderStars(product.rating)}</span>
            <span class="rating-text">${product.rating} (${product.reviewCount}개 후기)</span>
          </div>

          <div class="product-price-section">
            ${product.discount ? `
              <div class="original-price">${product.originalPrice?.toLocaleString()}원</div>
              <div class="discount-badge">${product.discount}%</div>
            ` : ''}
            <div class="current-price">${product.price.toLocaleString()}원</div>
          </div>

          <div class="product-delivery">
            <div class="delivery-item">
              <span class="label">배송</span>
              <span class="value">${product.shipping || '무료배송'}</span>
            </div>
            <div class="delivery-item">
              <span class="label">출고</span>
              <span class="value">${product.deliveryInfo || '2-3일 소요'}</span>
            </div>
            <div class="delivery-item">
              <span class="label">재고</span>
              <span class="value ${product.inStock ? 'in-stock' : 'out-stock'}">
                ${product.inStock ? `${product.stock || 0}개 남음` : '품절'}
              </span>
            </div>
          </div>

          <div class="product-quantity">
            <label>수량</label>
            <div class="quantity-control">
              <button class="qty-btn minus" id="qty-minus">-</button>
              <input type="number" class="qty-input" id="qty-input" value="1" min="1" max="${this.product.stock || 99}">
              <button class="qty-btn plus" id="qty-plus">+</button>
            </div>
          </div>

          <div class="product-total">
            <span class="label">총 상품금액</span>
            <span class="total-price" id="total-price">${this.product.price.toLocaleString()}원</span>
          </div>

          <div class="product-actions">
            <button class="btn-cart" id="add-to-cart-btn">장바구니</button>
            <button class="btn-buy" id="buy-now-btn">바로구매</button>
          </div>
        </div>
      </div>

      <!-- 하단: 탭 메뉴 -->
      <div class="product-tabs">
        <div class="tab-buttons">
          <button class="tab-button active" data-tab="detail">상품상세</button>
          <button class="tab-button" data-tab="reviews">상품후기 (${this.product.reviewCount || 0})</button>
        </div>

        <div class="tab-content">
          <div class="tab-panel active" id="tab-detail">
            ${this.renderDetailTab()}
          </div>
          <div class="tab-panel" id="tab-reviews">
            ${this.renderReviewsTab()}
          </div>
        </div>
      </div>
    `;

    // 이벤트 리스너 등록
    this.attachEventListeners(detail);

    return detail;
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars += '★';
      } else if (i === fullStars && hasHalfStar) {
        stars += '★';
      } else {
        stars += '☆';
      }
    }

    return stars;
  }

  renderDetailTab() {
    return `
      <div class="detail-content">
        ${this.product.detailDescription || `
          <h3>상품 상세 정보</h3>
          <p>${this.product.description}</p>

          ${this.product.features ? `
            <h4>주요 특징</h4>
            <ul>
              ${this.product.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          ` : ''}

          ${this.product.specs ? `
            <h4>상품 사양</h4>
            <table class="specs-table">
              ${Object.entries(this.product.specs).map(([key, value]) => `
                <tr>
                  <th>${key}</th>
                  <td>${value}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}
        `}
      </div>
    `;
  }

  renderReviewsTab() {
    if (!this.product.reviews || this.product.reviews.length === 0) {
      return '<div class="no-reviews">등록된 후기가 없습니다.</div>';
    }

    return `
      <div class="reviews-content">
        <div class="reviews-summary">
          <div class="summary-rating">
            <div class="big-rating">${this.product.rating}</div>
            <div class="stars">${this.renderStars(this.product.rating)}</div>
            <div class="review-count">${this.product.reviewCount}개 후기</div>
          </div>
        </div>

        <div class="reviews-list">
          ${this.product.reviews.map(review => `
            <div class="review-item">
              <div class="review-header">
                <span class="review-author">${review.author}</span>
                <span class="review-rating">${this.renderStars(review.rating)}</span>
                <span class="review-date">${review.date}</span>
              </div>
              <div class="review-content">${review.content}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  attachEventListeners(detail) {
    // 뒤로가기
    detail.querySelector('#back-btn').addEventListener('click', () => {
      this.onBack();
    });

    // 썸네일 클릭
    const thumbnails = detail.querySelectorAll('.thumbnail');
    const mainImage = detail.querySelector('#main-image');
    const images = this.product.product_images?.map(img => img.image_url) || this.product.images || [];
    thumbnails.forEach((thumb, idx) => {
      thumb.addEventListener('click', () => {
        thumbnails.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        if (images[idx]) {
          mainImage.src = images[idx];
        }
      });
    });

    // 수량 조절
    const qtyInput = detail.querySelector('#qty-input');
    const qtyMinus = detail.querySelector('#qty-minus');
    const qtyPlus = detail.querySelector('#qty-plus');
    const totalPrice = detail.querySelector('#total-price');

    const updateTotal = () => {
      const qty = parseInt(qtyInput.value) || 1;
      const total = this.product.price * qty;
      totalPrice.textContent = `${total.toLocaleString()}원`;
    };

    qtyMinus.addEventListener('click', () => {
      const current = parseInt(qtyInput.value) || 1;
      if (current > 1) {
        qtyInput.value = current - 1;
        updateTotal();
      }
    });

    qtyPlus.addEventListener('click', () => {
      const current = parseInt(qtyInput.value) || 1;
      const max = this.product.stock || 99;
      if (current < max) {
        qtyInput.value = current + 1;
        updateTotal();
      }
    });

    qtyInput.addEventListener('change', updateTotal);

    // 장바구니 추가
    detail.querySelector('#add-to-cart-btn').addEventListener('click', () => {
      this.quantity = parseInt(qtyInput.value) || 1;
      this.onAddToCart({ ...this.product, quantity: this.quantity });
    });

    // 바로구매
    detail.querySelector('#buy-now-btn').addEventListener('click', () => {
      this.quantity = parseInt(qtyInput.value) || 1;
      alert(`${this.product.name} ${this.quantity}개 바로구매 (데모)`);
    });

    // 탭 전환
    const tabButtons = detail.querySelectorAll('.tab-button');
    const tabPanels = detail.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));

        button.classList.add('active');
        detail.querySelector(`#tab-${tabName}`).classList.add('active');
      });
    });
  }
}
