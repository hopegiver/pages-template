# Contributing Guide

이 문서는 Pages Template 프로젝트의 구조, 규칙, 개발 가이드를 설명합니다. AI 에이전트와 개발자 모두 이 가이드를 따라 일관된 코드를 작성해야 합니다.

## 📊 프로젝트 개요

**목적**: Cloudflare Pages 배포를 위한 embeddable 위젯 템플릿
**언어**: Vanilla JavaScript (ES6 Modules)
**번들러**: esbuild
**스타일**: CSS-in-JS
**라우팅**: Path Parameters (예: #/product/1)
**API**: Static JSON (Mock API)

## 📁 프로젝트 구조

```
pages-template/
├── src/
│   ├── core/                 # 핵심 로직 (건드리지 말 것)
│   │   ├── state.js         # 전역 상태 관리
│   │   ├── router.js        # Path Parameters 라우팅
│   │   ├── widget.js        # 메인 위젯 컨트롤러
│   │   └── api.js           # API 호출 래퍼
│   ├── pages/               # 라우트별 페이지 (파일명 = 라우트명)
│   │   ├── index.js         # / 라우트 (IndexPage)
│   │   ├── product.js       # /product 라우트 (ProductPage)
│   │   ├── cart.js          # /cart 라우트 (CartPage)
│   │   ├── checkout.js      # /checkout 라우트 (CheckoutPage)
│   │   └── profile.js       # /profile 라우트 (ProfilePage)
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   └── Modal.js
│   ├── utils/               # 헬퍼 함수
│   │   ├── dom.js
│   │   └── helpers.js
│   ├── styles/              # CSS-in-JS
│   │   └── main.css.js
│   └── index.js             # 엔트리 포인트
├── mock-api/                # Static JSON 파일들
│   ├── products.json
│   └── product-detail.json
├── dist/                    # 빌드 결과물
├── index.html               # 데모 페이지
├── build.js                 # esbuild 설정
└── package.json
```

## 🎯 핵심 규칙 (MUST FOLLOW)

### 1. 파일 및 클래스 네이밍 규칙

#### Pages (src/pages/)
- **파일명**: kebab-case, 라우트명과 동일
- **클래스명**: PascalCase + `Page` 접미사
- **예시**:
  ```javascript
  // 파일: src/pages/product.js
  // 라우트: /product?id=1
  export class ProductPage { ... }

  // 파일: src/pages/index.js
  // 라우트: /
  export class IndexPage { ... }

  // 파일: src/pages/user-settings.js  (예시)
  // 라우트: /user-settings
  export class UserSettingsPage { ... }
  ```

#### Components (src/components/)
- **파일명**: PascalCase.js
- **클래스명**: PascalCase (접미사 없음)
- **예시**:
  ```javascript
  // 파일: src/components/Modal.js
  export class Modal { ... }

  // 파일: src/components/ProductCard.js
  export class ProductCard { ... }
  ```

#### Core, Utils
- **파일명**: kebab-case.js
- **함수/클래스명**: camelCase 또는 PascalCase (표준 규칙 따름)

### 2. 라우팅 규칙

#### Path Parameters 방식
```javascript
// ✅ 올바른 예시
router.navigate('/product/1');
// 결과: #/product/1

router.navigate('/product/123');
// 결과: #/product/123

// ❌ 잘못된 예시 (Query Parameters 사용 금지)
router.navigate('/product', { id: 1 });  // NO!
router.navigate('/product?id=1');        // NO!
```

#### 새로운 라우트 추가 방법
1. `src/pages/` 에 라우트명과 동일한 파일 생성
2. `widget.js`의 `setupRoutes()`에 라우트 추가
3. `widget.js`에 해당 메서드 구현
4. `src/index.js`에 import/export 추가

```javascript
// 1. src/pages/category.js 생성
export class CategoryPage {
  constructor(props = {}) {
    this.categoryId = props.categoryId;
  }
  render() { ... }
}

// 2. widget.js - setupRoutes()
setupRoutes() {
  this.router.addRoutes({
    '/': () => this.showProductList(),
    '/product/:id': (params) => this.showProductDetail(params),
    '/category/:id': (params) => this.showCategory(params),  // 추가
    '*': () => this.showProductList()
  });
}

// 3. widget.js - 메서드 구현
showCategory(params) {
  const categoryId = parseInt(params.id);
  const categoryPage = new CategoryPage({ categoryId });
  const element = categoryPage.render();
  this.getContainer().innerHTML = '';
  this.getContainer().appendChild(element);
}

// 4. src/index.js - import/export 추가
import { CategoryPage } from './pages/category.js';
export { ..., CategoryPage };
```

### 3. State 관리 규칙

#### State 사용법
```javascript
import { getState } from './core/state.js';

// 싱글톤 인스턴스 가져오기
const state = getState();

// 상태 읽기
const cart = state.getState().cart;
const count = state.getCartItemCount();

// 상태 변경
state.addToCart(product, quantity);
state.updateCartQuantity(productId, quantity);
state.removeFromCart(productId);

// 이벤트 구독
const unsubscribe = state.subscribe('cart:add', (product) => {
  console.log('Product added:', product);
});

// 구독 해제
unsubscribe();
```

#### 새로운 State 기능 추가
```javascript
// src/core/state.js 에 메서드 추가
class State {
  // 위시리스트 기능 추가 예시
  addToWishlist(product) {
    const wishlist = this.state.wishlist || [];
    wishlist.push(product);
    this.setState({ wishlist });
    this.notify('wishlist:add', product);
  }

  removeFromWishlist(productId) {
    const wishlist = this.state.wishlist.filter(p => p.id !== productId);
    this.setState({ wishlist });
    this.notify('wishlist:remove', productId);
  }
}
```

### 4. 컴포넌트 구조 규칙

#### 모든 페이지/컴포넌트는 다음 구조를 따릅니다:

```javascript
import { createElement } from '../utils/dom.js';

export class ExamplePage {
  constructor(props = {}) {
    // props에서 필요한 값 추출
    this.state = props.state;
    this.onSomeAction = props.onSomeAction || (() => {});
  }

  // 비동기 데이터 로딩 (필요시)
  async loadData() {
    try {
      const data = await fetchData();
      this.data = data;
      return data;
    } catch (error) {
      console.error('Failed to load data:', error);
      throw error;
    }
  }

  // 메인 렌더링 메서드 (필수)
  render() {
    const container = createElement('div', { className: 'example-container' });

    // 비동기 데이터가 필요한 경우
    if (this.needsAsyncData) {
      this.loadData().then(() => {
        container.innerHTML = '';
        container.appendChild(this.renderContent());
      });
      return container;
    }

    // 동기 렌더링
    container.appendChild(this.renderContent());
    return container;
  }

  // 서브 렌더링 메서드들
  renderContent() { ... }
  renderItem(item) { ... }
}
```

### 5. 스타일 규칙

#### CSS-in-JS 방식 사용
```javascript
// src/styles/main.css.js
export const styles = `
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
`;

// 컴포넌트 내 인라인 스타일 (최소화)
element.style.padding = '20px';
```

#### 새로운 스타일 추가
- 전역 스타일: `src/styles/main.css.js`에 추가
- 컴포넌트 전용 스타일: 해당 컴포넌트 파일에 정의 가능

### 6. API 호출 규칙

```javascript
// src/core/api.js 사용
import { getProducts, getProductDetail } from '../core/api.js';

// ✅ 올바른 방법
async loadData() {
  try {
    const products = await getProducts();
    this.products = products;
  } catch (error) {
    console.error('Failed to load:', error);
  }
}

// ❌ 직접 fetch 호출 금지
fetch('/mock-api/products.json');  // NO!
```

## 🚀 개발 워크플로우

### 개발 모드
```bash
# Live Server로 index.html 실행
# ES6 모듈이 직접 로드됨 (빌드 불필요)
```

### 프로덕션 빌드
```bash
npm run build
# dist/pages-template.esm.js (ES Module)
# dist/pages-template.min.js (Minified IIFE)
```

### 배포
```bash
# Cloudflare Pages에 배포
# dist/ 폴더만 배포하면 됨
```

## 📝 코딩 스타일 가이드

### Import 순서
```javascript
// 1. Core modules
import { State } from '../core/state.js';
import { Router } from '../core/router.js';

// 2. Pages
import { IndexPage } from '../pages/index.js';

// 3. Components
import { Modal } from '../components/Modal.js';

// 4. Utils
import { createElement } from '../utils/dom.js';
import { formatCurrency } from '../utils/helpers.js';
```

### 주석 규칙
```javascript
// 한국어 주석 사용
// 함수/클래스 상단에 간단한 설명

// ✅ 좋은 예시
// 상품 상세 페이지 - 이미지, 정보, 리뷰 탭 표시
export class ProductPage { ... }

// ❌ 나쁜 예시
// This is product detail page
export class ProductPage { ... }
```

### 에러 처리
```javascript
// 모든 비동기 함수는 try-catch 사용
async loadData() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    console.error('Failed to load:', error);
    throw error;  // 또는 기본값 반환
  }
}
```

## ⚠️ 금지사항 (DO NOT)

1. **Query Parameters 사용 금지**
   ```javascript
   // ❌ 금지
   router.navigate('/product', { id: 123 });
   router.navigate('/product?id=123');

   // ✅ 사용
   router.navigate('/product/123');
   ```

2. **Core 파일 함부로 수정 금지**
   - `src/core/state.js`
   - `src/core/router.js`
   - `src/core/widget.js`
   - 기능 추가는 가능하지만, 기존 구조 변경 금지

3. **직접 DOM 조작 최소화**
   ```javascript
   // ❌ 지양
   document.getElementById('foo');

   // ✅ 권장
   import { $, createElement } from '../utils/dom.js';
   ```

4. **외부 라이브러리 추가 지양**
   - Vanilla JS 원칙 유지
   - 꼭 필요한 경우만 추가 (예: esbuild)

## 🧪 테스트 체크리스트

새로운 기능 추가 후 확인사항:

- [ ] Live Server에서 정상 작동하는가?
- [ ] 빌드 후 (`npm run build`) dist 파일들이 정상 생성되는가?
- [ ] 브라우저 뒤로가기/앞으로가기가 작동하는가?
- [ ] State 변경이 올바르게 동기화되는가?
- [ ] 새로운 페이지가 `src/index.js`에 export 되었는가?
- [ ] 한국어와 KRW 포맷이 유지되는가?

## 📚 참고 자료

### 주요 파일 설명
- **src/index.js**: 전역 API 노출, 스타일 주입
- **src/core/widget.js**: 라우트 설정, 페이지 전환 로직
- **src/core/router.js**: Path Parameters 라우팅
- **src/core/state.js**: 전역 상태 관리, 이벤트 시스템
- **build.js**: esbuild 설정 (ESM + Minified 출력)

### 새로운 기능 추가 시 읽어야 할 파일
1. 이 파일 (CONTRIBUTING.md)
2. [src/core/widget.js](src/core/widget.js) - 라우팅 구조 이해
3. [src/core/state.js](src/core/state.js) - 상태 관리 이해
4. 기존 페이지 예시 ([src/pages/product.js](src/pages/product.js))

## 🎓 학습 예시

### 완전한 기능 추가 예시: 위시리스트

<details>
<summary>1단계: State에 위시리스트 기능 추가</summary>

```javascript
// src/core/state.js
class State {
  constructor() {
    this.state = {
      cart: [],
      wishlist: [],  // 추가
      user: null,
      currentView: null,
      currentProduct: null
    };
    this.listeners = new Map();
  }

  // 위시리스트 메서드들
  addToWishlist(product) {
    const exists = this.state.wishlist.find(p => p.id === product.id);
    if (!exists) {
      this.state.wishlist.push(product);
      this.notify('wishlist:add', product);
      this.save();
    }
  }

  removeFromWishlist(productId) {
    this.state.wishlist = this.state.wishlist.filter(p => p.id !== productId);
    this.notify('wishlist:remove', productId);
    this.save();
  }

  isInWishlist(productId) {
    return this.state.wishlist.some(p => p.id === productId);
  }

  getWishlist() {
    return this.state.wishlist;
  }
}
```
</details>

<details>
<summary>2단계: 위시리스트 페이지 생성</summary>

```javascript
// src/pages/wishlist.js
import { createElement } from '../utils/dom.js';

export class WishlistPage {
  constructor(props = {}) {
    this.state = props.state;
    this.onProductClick = props.onProductClick || (() => {});
    this.onRemove = props.onRemove || (() => {});
  }

  render() {
    const container = createElement('div', { className: 'wishlist-container' });
    const wishlist = this.state.getWishlist();

    if (wishlist.length === 0) {
      container.innerHTML = '<div class="empty-state">위시리스트가 비어있습니다</div>';
      return container;
    }

    const title = createElement('h2', { innerHTML: '위시리스트' });
    container.appendChild(title);

    const grid = createElement('div', { className: 'product-grid' });
    wishlist.forEach(product => {
      const card = this.renderProductCard(product);
      grid.appendChild(card);
    });

    container.appendChild(grid);
    return container;
  }

  renderProductCard(product) {
    const card = createElement('div', { className: 'product-card' });
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="product-price">${product.price.toLocaleString('ko-KR')}원</p>
      <button class="btn-remove" data-id="${product.id}">삭제</button>
    `;

    card.querySelector('.btn-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      this.onRemove(product.id);
    });

    card.addEventListener('click', () => {
      this.onProductClick(product);
    });

    return card;
  }
}
```
</details>

<details>
<summary>3단계: Widget에 라우트 추가</summary>

```javascript
// src/core/widget.js

// Import 추가
import { WishlistPage } from '../pages/wishlist.js';

class Widget {
  setupRoutes() {
    this.router.addRoutes({
      '/': () => this.showProductList(),
      '/product': (query) => this.showProductDetail(query),
      '/cart': () => this.showCart(),
      '/wishlist': () => this.showWishlist(),  // 추가
      '/checkout': () => this.showCheckout(),
      '/profile': () => this.showProfile(),
      '*': () => this.showProductList()
    });
  }

  // 메서드 추가
  showWishlist() {
    const containerElement = this.getContainer();
    this.state.setCurrentView('wishlist');
    containerElement.innerHTML = '';

    const wishlistPage = new WishlistPage({
      state: this.state,
      onProductClick: (product) => {
        this.router.navigate('/product', { id: product.id });
      },
      onRemove: (productId) => {
        this.state.removeFromWishlist(productId);
        this.showWishlist();  // 다시 렌더링
      }
    });

    const element = wishlistPage.render();
    containerElement.appendChild(element);
  }
}
```
</details>

<details>
<summary>4단계: index.js에 Export 추가</summary>

```javascript
// src/index.js

import { WishlistPage } from './pages/wishlist.js';

export {
  Widget,
  Router,
  State,
  getState,
  IndexPage,
  ProductPage,
  CartPage,
  CheckoutPage,
  ProfilePage,
  WishlistPage,  // 추가
  Modal
};

window.PagesTemplate = {
  Widget,
  Router,
  State,
  getState,
  components: {
    IndexPage,
    ProductPage,
    CartPage,
    CheckoutPage,
    ProfilePage,
    WishlistPage,  // 추가
    Modal
  }
};
```
</details>

<details>
<summary>5단계: 다른 페이지에서 사용</summary>

```javascript
// src/pages/product.js - 위시리스트 버튼 추가

renderProductInfo() {
  const isInWishlist = this.state.isInWishlist(this.product.id);

  return `
    <div class="product-info">
      <h1>${this.product.name}</h1>
      <p class="product-price">${this.product.price.toLocaleString('ko-KR')}원</p>

      <button class="btn-wishlist ${isInWishlist ? 'active' : ''}"
              onclick="toggleWishlist(${this.product.id})">
        ${isInWishlist ? '♥ 위시리스트에서 제거' : '♡ 위시리스트에 추가'}
      </button>

      <button class="btn-add-to-cart">장바구니 담기</button>
    </div>
  `;
}
```
</details>

---

**이 문서를 반드시 따라주세요. 일관된 코드 구조는 프로젝트의 생명입니다.**

마지막 업데이트: 2025-10-18
