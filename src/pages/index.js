// 홈 페이지 (상품 목록)

import { getProducts } from '../core/api.js';
import { createElement } from '../utils/dom.js';

export class IndexPage {
  constructor(props = {}) {
    this.props = props;
    this.products = [];
    this.onProductClick = props.onProductClick || (() => {});
    this.state = props.state; // State 인스턴스 (선택적)
  }

  async loadProducts() {
    try {
      this.products = await getProducts();
      return this.products;
    } catch (error) {
      console.error('Failed to load products:', error);
      throw error;
    }
  }

  render() {
    const container = createElement('div', { className: 'product-list-container' });

    // Loading state
    const loading = createElement('div', {
      className: 'widget-loading',
      innerHTML: 'Loading products...'
    });
    container.appendChild(loading);

    // Load and render products
    this.loadProducts()
      .then(() => {
        container.innerHTML = '';
        const productList = this.renderProductList();
        container.appendChild(productList);
      })
      .catch(error => {
        container.innerHTML = '';
        const errorEl = createElement('div', {
          className: 'widget-error',
          innerHTML: `Failed to load products: ${error.message}`
        });
        container.appendChild(errorEl);
      });

    return container;
  }

  renderProductList() {
    const list = createElement('div', { className: 'product-list' });

    this.products.forEach(product => {
      const card = this.renderProductCard(product);
      list.appendChild(card);
    });

    return list;
  }

  renderProductCard(product) {
    const card = createElement('div', { className: 'product-card' });

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3 class="product-title">${product.name}</h3>
      <p class="product-price">${product.price.toLocaleString()}원</p>
    `;

    card.addEventListener('click', () => {
      this.onProductClick(product);
    });

    return card;
  }
}
