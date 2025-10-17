// 장바구니 화면

import { getCart } from '../core/api.js';
import { createElement } from '../utils/dom.js';

export class CartPage {
  constructor(props = {}) {
    this.props = props;
    this.cartItems = [];
    this.onCheckout = props.onCheckout || (() => {});
  }

  async loadCart() {
    try {
      const cartData = await getCart();
      this.cartItems = cartData.items || [];
      return this.cartItems;
    } catch (error) {
      console.error('Failed to load cart:', error);
      throw error;
    }
  }

  render() {
    const container = createElement('div', { className: 'cart-container' });

    // Loading state
    const loading = createElement('div', {
      className: 'widget-loading',
      innerHTML: 'Loading cart...'
    });
    container.appendChild(loading);

    // Load and render cart
    this.loadCart()
      .then(() => {
        container.innerHTML = '';
        const cart = this.renderCart();
        container.appendChild(cart);
      })
      .catch(error => {
        container.innerHTML = '';
        const errorEl = createElement('div', {
          className: 'widget-error',
          innerHTML: `Failed to load cart: ${error.message}`
        });
        container.appendChild(errorEl);
      });

    return container;
  }

  renderCart() {
    const cart = createElement('div', { className: 'cart' });

    if (this.cartItems.length === 0) {
      cart.innerHTML = '<div class="widget-loading">Your cart is empty</div>';
      return cart;
    }

    // Cart items
    const itemsList = createElement('div', { className: 'cart-items' });
    this.cartItems.forEach(item => {
      const itemEl = this.renderCartItem(item);
      itemsList.appendChild(itemEl);
    });

    // Total
    const total = this.calculateTotal();
    const totalEl = createElement('div', {
      className: 'cart-total',
      innerHTML: `Total: $${total.toFixed(2)}`
    });

    // Checkout button
    const checkoutBtn = createElement('button', {
      className: 'widget-button',
      innerHTML: 'Proceed to Checkout'
    });
    checkoutBtn.style.width = '100%';
    checkoutBtn.style.padding = '12px';
    checkoutBtn.style.fontSize = '16px';
    checkoutBtn.style.marginTop = '20px';
    checkoutBtn.addEventListener('click', () => {
      this.onCheckout(this.cartItems, total);
    });

    cart.appendChild(itemsList);
    cart.appendChild(totalEl);
    cart.appendChild(checkoutBtn);

    return cart;
  }

  renderCartItem(item) {
    const cartItem = createElement('div', { className: 'cart-item' });

    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>Quantity: ${item.quantity}</p>
        <p class="product-price">$${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    `;

    return cartItem;
  }

  calculateTotal() {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}
