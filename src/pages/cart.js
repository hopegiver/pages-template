// 장바구니 화면

import { createElement } from '../utils/dom.js';

export class CartPage {
  constructor(props = {}) {
    this.state = props.state;
    this.onBack = props.onBack || (() => {});
  }

  render() {
    const container = createElement('div', { className: 'cart-container' });

    const cart = this.state.getState('cart') || [];

    // 뒤로가기 버튼
    const backBtn = createElement('button', {
      className: 'back-button',
      innerHTML: '← 쇼핑 계속하기'
    });
    backBtn.addEventListener('click', () => this.onBack());
    container.appendChild(backBtn);

    // 제목
    const title = createElement('h2', {
      innerHTML: '장바구니',
      style: { marginTop: '20px', marginBottom: '20px' }
    });
    container.appendChild(title);

    // 빈 장바구니
    if (cart.length === 0) {
      const empty = createElement('div', {
        className: 'cart-empty',
        innerHTML: '<p style="text-align: center; color: #666; padding: 40px;">장바구니가 비어있습니다</p>'
      });
      container.appendChild(empty);
      return container;
    }

    // 장바구니 아이템 목록
    const itemsList = createElement('div', { className: 'cart-items' });
    cart.forEach(item => {
      const itemEl = this.renderCartItem(item);
      itemsList.appendChild(itemEl);
    });
    container.appendChild(itemsList);

    // 총액
    const total = this.state.getCartTotal();
    const totalSection = createElement('div', {
      className: 'cart-total-section',
      style: {
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '2px solid #333'
      }
    });
    totalSection.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 20px; font-weight: bold;">
        <span>총 결제금액</span>
        <span style="color: #e74c3c;">${total.toLocaleString('ko-KR')}원</span>
      </div>
    `;
    container.appendChild(totalSection);

    // 액션 버튼들
    const actions = createElement('div', {
      style: {
        marginTop: '20px',
        display: 'flex',
        gap: '10px'
      }
    });

    const clearBtn = createElement('button', {
      className: 'widget-button',
      innerHTML: '장바구니 비우기',
      style: {
        flex: '1',
        backgroundColor: '#95a5a6',
        padding: '12px'
      }
    });
    clearBtn.addEventListener('click', () => {
      if (confirm('장바구니를 비우시겠습니까?')) {
        this.state.clearCart();
        // 다시 렌더링
        container.innerHTML = '';
        const newContent = this.render();
        container.replaceWith(newContent);
      }
    });

    actions.appendChild(clearBtn);
    container.appendChild(actions);

    return container;
  }

  renderCartItem(item) {
    const itemEl = createElement('div', {
      className: 'cart-item',
      style: {
        display: 'flex',
        gap: '15px',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '10px',
        backgroundColor: 'white'
      }
    });

    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
      <div style="flex: 1;">
        <h4 style="margin: 0 0 8px 0;">${item.name}</h4>
        <p style="color: #666; margin: 0 0 8px 0;">수량: ${item.quantity}개</p>
        <p style="font-weight: bold; margin: 0;">${(item.price * item.quantity).toLocaleString('ko-KR')}원</p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <button class="btn-increase" data-id="${item.id}" style="padding: 5px 10px; cursor: pointer; border: 1px solid #ddd; background: white; border-radius: 4px;">+</button>
        <button class="btn-decrease" data-id="${item.id}" style="padding: 5px 10px; cursor: pointer; border: 1px solid #ddd; background: white; border-radius: 4px;">-</button>
        <button class="btn-remove" data-id="${item.id}" style="padding: 5px 10px; cursor: pointer; border: 1px solid #e74c3c; background: #e74c3c; color: white; border-radius: 4px;">삭제</button>
      </div>
    `;

    // 수량 증가
    itemEl.querySelector('.btn-increase').addEventListener('click', (e) => {
      const productId = parseInt(e.target.dataset.id);
      const currentItem = this.state.getState('cart').find(i => i.id === productId);
      if (currentItem) {
        this.state.updateCartQuantity(productId, currentItem.quantity + 1);
        this.refreshView(itemEl);
      }
    });

    // 수량 감소
    itemEl.querySelector('.btn-decrease').addEventListener('click', (e) => {
      const productId = parseInt(e.target.dataset.id);
      const currentItem = this.state.getState('cart').find(i => i.id === productId);
      if (currentItem && currentItem.quantity > 1) {
        this.state.updateCartQuantity(productId, currentItem.quantity - 1);
        this.refreshView(itemEl);
      }
    });

    // 삭제
    itemEl.querySelector('.btn-remove').addEventListener('click', (e) => {
      const productId = parseInt(e.target.dataset.id);
      if (confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) {
        this.state.removeFromCart(productId);
        this.refreshView(itemEl.parentElement);
      }
    });

    return itemEl;
  }

  refreshView(element) {
    // 부모 컨테이너를 찾아서 다시 렌더링
    const container = element.closest('.cart-container');
    if (container) {
      const newContent = this.render();
      container.replaceWith(newContent);
    }
  }
}
