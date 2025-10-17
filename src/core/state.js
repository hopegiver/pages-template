// 전역 상태 관리

export class State {
  constructor() {
    this.state = {
      cart: [],           // 장바구니 아이템
      user: null,         // 사용자 정보
      currentView: null,  // 현재 뷰
      currentProduct: null // 현재 보고 있는 상품
    };
    this.listeners = new Map(); // key: eventName, value: [callbacks]
  }

  /**
   * 상태 가져오기
   */
  getState(key) {
    if (key) {
      return this.state[key];
    }
    return { ...this.state };
  }

  /**
   * 상태 업데이트
   */
  setState(updates) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // 변경된 키에 대한 리스너들 호출
    Object.keys(updates).forEach(key => {
      this.notify(key, this.state[key], oldState[key]);
    });

    // 전체 상태 변경 리스너 호출
    this.notify('*', this.state, oldState);
  }

  /**
   * 이벤트 구독
   */
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // 구독 해제 함수 반환
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * 리스너들에게 알림
   */
  notify(event, newValue, oldValue) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      callback(newValue, oldValue);
    });
  }

  /**
   * 장바구니에 상품 추가
   */
  addToCart(product, quantity = 1) {
    const cart = [...this.state.cart];
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      // 이미 있는 상품이면 수량 증가
      cart[existingIndex].quantity += quantity;
    } else {
      // 새 상품 추가
      cart.push({
        ...product,
        quantity: quantity,
        addedAt: new Date().toISOString()
      });
    }

    this.setState({ cart });
    return cart;
  }

  /**
   * 장바구니에서 상품 제거
   */
  removeFromCart(productId) {
    const cart = this.state.cart.filter(item => item.id !== productId);
    this.setState({ cart });
    return cart;
  }

  /**
   * 장바구니 수량 변경
   */
  updateCartQuantity(productId, quantity) {
    const cart = this.state.cart.map(item => {
      if (item.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    this.setState({ cart });
    return cart;
  }

  /**
   * 장바구니 비우기
   */
  clearCart() {
    this.setState({ cart: [] });
  }

  /**
   * 장바구니 총액 계산
   */
  getCartTotal() {
    return this.state.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  /**
   * 장바구니 아이템 개수
   */
  getCartItemCount() {
    return this.state.cart.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  }

  /**
   * 사용자 설정
   */
  setUser(user) {
    this.setState({ user });
  }

  /**
   * 로그아웃
   */
  logout() {
    this.setState({ user: null });
  }

  /**
   * 현재 뷰 설정
   */
  setCurrentView(view) {
    this.setState({ currentView: view });
  }

  /**
   * 현재 상품 설정
   */
  setCurrentProduct(product) {
    this.setState({ currentProduct: product });
  }

  /**
   * 상태 초기화
   */
  reset() {
    this.state = {
      cart: [],
      user: null,
      currentView: null,
      currentProduct: null
    };
    this.notify('*', this.state, {});
  }

  /**
   * LocalStorage에 저장 (선택적)
   */
  saveToStorage() {
    try {
      localStorage.setItem('widget-state', JSON.stringify({
        cart: this.state.cart,
        user: this.state.user
      }));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }

  /**
   * LocalStorage에서 복원 (선택적)
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('widget-state');
      if (saved) {
        const data = JSON.parse(saved);
        this.setState({
          cart: data.cart || [],
          user: data.user || null
        });
      }
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
    }
  }
}

// 싱글톤 인스턴스
let stateInstance = null;

export function getState() {
  if (!stateInstance) {
    stateInstance = new State();
  }
  return stateInstance;
}
