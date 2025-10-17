// 위젯 초기화 및 라이프사이클 관리

import { createElement } from '../utils/dom.js';
import { IndexPage } from '../pages/index.js';
import { ProductPage } from '../pages/product.js';
import { Router } from './router.js';
import { getState } from './state.js';

export class Widget {
  constructor(containerId, config = {}) {
    this.container = containerId || '#widget-root';
    this.config = config;
    this.currentView = null;

    // State 인스턴스
    this.state = getState();

    // Router 설정
    this.router = new Router();
    this.setupRoutes();

    // 자동 초기화
    this.init();
  }

  /**
   * 라우트 설정 (하이브리드 방식: 경로 + 쿼리)
   */
  setupRoutes() {
    this.router.addRoutes({
      '/': () => this.showProductList(),
      '/product': (query) => this.showProductDetail(query),
      '/cart': () => this.showCart(),
      '/checkout': () => this.showCheckout(),
      '/profile': () => this.showProfile(),
      '*': () => this.showProductList() // 404 처리
    });
  }

  /**
   * 위젯 초기화
   */
  init() {
    console.log('Widget initialized with config:', this.config);

    const containerElement = this.getContainer();
    if (!containerElement) {
      console.error('Container not found:', this.container);
      return;
    }

    // LocalStorage에서 상태 복원 (선택적)
    if (this.config.persistState) {
      this.state.loadFromStorage();
    }

    // 장바구니 변경 시 자동 저장
    if (this.config.persistState) {
      this.state.subscribe('cart', () => {
        this.state.saveToStorage();
      });
    }

    // 라우터 초기화 (현재 URL에 맞는 뷰 렌더링)
    this.router.init();
  }

  /**
   * 컨테이너 엘리먼트 가져오기
   */
  getContainer() {
    if (typeof this.container === 'string') {
      return document.querySelector(this.container);
    }
    return this.container;
  }

  /**
   * 상품 목록 보기
   */
  showProductList() {
    const containerElement = this.getContainer();
    if (!containerElement) return;

    // 상태 업데이트
    this.state.setCurrentView('list');

    containerElement.innerHTML = '';

    const productList = new IndexPage({
      state: this.state,
      onProductClick: (product) => {
        // Router를 통한 네비게이션 (쿼리 파라미터 사용)
        this.router.navigate('/product', { id: product.id });
      }
    });

    const listElement = productList.render();
    containerElement.appendChild(listElement);
  }

  /**
   * 상품 상세 보기
   * @param {object} query - 쿼리 파라미터 { id: "1" }
   */
  showProductDetail(query) {
    const containerElement = this.getContainer();
    if (!containerElement) return;

    const productId = parseInt(query.id);
    if (!productId) {
      console.error('Product ID is required');
      this.router.navigate('/');
      return;
    }

    // 상태 업데이트
    this.state.setCurrentView('detail');

    containerElement.innerHTML = '';

    const productDetail = new ProductPage({
      productId: productId,
      state: this.state,
      onAddToCart: (product) => {
        // State를 통한 장바구니 추가
        this.state.addToCart(product, product.quantity || 1);

        const count = this.state.getCartItemCount();
        alert(`${product.name} 장바구니에 추가되었습니다! (총 ${count}개)`);
      },
      onBack: () => {
        this.router.back();
      }
    });

    const detailElement = productDetail.render();
    containerElement.appendChild(detailElement);
  }

  /**
   * 장바구니 보기 (예시)
   */
  showCart() {
    const containerElement = this.getContainer();
    if (!containerElement) return;

    this.state.setCurrentView('cart');
    containerElement.innerHTML = '<div class="widget-content">장바구니 (준비 중)</div>';
  }

  /**
   * 결제 보기 (예시)
   */
  showCheckout() {
    const containerElement = this.getContainer();
    if (!containerElement) return;

    this.state.setCurrentView('checkout');
    containerElement.innerHTML = '<div class="widget-content">결제 (준비 중)</div>';
  }

  /**
   * 프로필 보기 (예시)
   */
  showProfile() {
    const containerElement = this.getContainer();
    if (!containerElement) return;

    this.state.setCurrentView('profile');
    containerElement.innerHTML = '<div class="widget-content">프로필 (준비 중)</div>';
  }

  /**
   * 현재 라우트 정보
   */
  getCurrentRoute() {
    return this.router.getCurrentRoute();
  }

  /**
   * 네비게이션 헬퍼
   * @param {string} path - 경로
   * @param {object} query - 쿼리 파라미터
   */
  navigate(path, query = {}) {
    this.router.navigate(path, query);
  }

  /**
   * 상태 가져오기
   */
  getState(key) {
    return this.state.getState(key);
  }

  /**
   * 위젯 제거
   */
  destroy() {
    // Router 정리
    this.router.destroy();

    // State 초기화 (선택적)
    if (this.config.resetOnDestroy) {
      this.state.reset();
    }

    const containerElement = this.getContainer();
    if (containerElement) {
      containerElement.innerHTML = '';
    }
    this.currentView = null;
  }
}
