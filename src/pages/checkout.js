// 결제 화면

import { createElement } from '../utils/dom.js';

export class CheckoutPage {
  constructor(props = {}) {
    this.props = props;
    this.cartItems = props.cartItems || [];
    this.total = props.total || 0;
    this.onComplete = props.onComplete || (() => {});
  }

  render() {
    const container = createElement('div', { className: 'checkout-container' });
    container.style.padding = '20px';

    container.innerHTML = `
      <h2 style="margin-bottom: 20px;">Checkout</h2>

      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin-bottom: 20px;">
        <h3 style="margin-bottom: 16px;">Order Summary</h3>
        ${this.renderOrderSummary()}
        <div class="cart-total">Total: $${this.total.toFixed(2)}</div>
      </div>

      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
        <h3 style="margin-bottom: 16px;">Payment Information</h3>
        <form id="checkout-form">
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Name</label>
            <input type="text" id="name" required style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 4px;">
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Email</label>
            <input type="email" id="email" required style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 4px;">
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 4px; font-weight: 500;">Card Number</label>
            <input type="text" id="card" required placeholder="1234 5678 9012 3456" style="width: 100%; padding: 8px; border: 1px solid #dee2e6; border-radius: 4px;">
          </div>

          <button type="submit" class="widget-button" style="width: 100%; padding: 12px; font-size: 16px;">
            Complete Order
          </button>
        </form>
      </div>
    `;

    const form = container.querySelector('#checkout-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCheckout();
    });

    return container;
  }

  renderOrderSummary() {
    return this.cartItems.map(item => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
        <span>${item.name} x ${item.quantity}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');
  }

  handleCheckout() {
    // 간단한 시뮬레이션
    alert('Order completed successfully! (This is a demo)');
    this.onComplete();
  }
}
