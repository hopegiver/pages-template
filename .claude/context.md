# Pages Template Project Context

이 파일은 Claude Code와 다른 AI 에이전트들이 새로운 세션을 시작할 때 프로젝트 컨텍스트를 빠르게 이해하도록 돕습니다.

## 프로젝트 개요

**Pages Template**은 Cloudflare Pages 배포를 위한 embeddable 위젯 템플릿입니다.

- **목적**: 고객 웹사이트에 임베드 가능한 쇼핑 위젯 제공
- **언어**: Vanilla JavaScript (ES6 Modules)
- **번들러**: esbuild
- **배포**: Cloudflare Pages
- **로케일**: 한국어 (ko-KR), 통화: KRW

## 핵심 아키텍처

### 1. 개발 방식
- **개발 모드**: Live Server + ES6 모듈 직접 로딩 (빌드 불필요)
- **프로덕션**: esbuild로 ESM + Minified 번들 생성

### 2. 핵심 패턴
- **State Management**: 싱글톤 State 클래스 + 이벤트 구독 시스템
- **Routing**: 하이브리드 라우팅 (Hash + Query Parameters)
  - 예: `#/product?id=1&color=red`
  - Path Parameters 사용 금지!
- **Styling**: CSS-in-JS (styles/main.css.js)
- **API**: Static JSON files (mock-api/)

### 3. 폴더 구조 규칙

```
src/
├── core/           # 핵심 로직 (state, router, widget, api)
├── pages/          # 라우트별 페이지 (파일명 = 라우트명)
├── components/     # 재사용 컴포넌트
├── utils/          # 헬퍼 함수
└── styles/         # CSS-in-JS
```

**중요**: Pages 파일명은 라우트명과 정확히 일치해야 합니다!

| 라우트 | 파일 | 클래스 |
|--------|------|--------|
| `/` | `pages/index.js` | `IndexPage` |
| `/product` | `pages/product.js` | `ProductPage` |
| `/cart` | `pages/cart.js` | `CartPage` |
| `/checkout` | `pages/checkout.js` | `CheckoutPage` |
| `/profile` | `pages/profile.js` | `ProfilePage` |

## 네이밍 규칙

### Pages (src/pages/)
- **파일명**: kebab-case (예: `user-settings.js`)
- **클래스명**: PascalCase + `Page` 접미사 (예: `UserSettingsPage`)

### Components (src/components/)
- **파일명**: PascalCase.js (예: `Modal.js`)
- **클래스명**: PascalCase (예: `Modal`)

### 기타
- **파일명**: kebab-case.js
- **함수/클래스명**: camelCase 또는 PascalCase

## 개발 워크플로우

### 새로운 페이지 추가

1. **페이지 파일 생성** (`src/pages/search.js`)
```javascript
import { createElement } from '../utils/dom.js';

export class SearchPage {
  constructor(props = {}) {
    this.query = props.query || '';
    this.state = props.state;
  }

  render() {
    const container = createElement('div', { className: 'search-container' });
    // 구현...
    return container;
  }
}
```

2. **라우트 추가** (`src/core/widget.js`)
```javascript
import { SearchPage } from '../pages/search.js';

setupRoutes() {
  this.router.addRoutes({
    '/search': (query) => this.showSearch(query),  // 추가
    // ...
  });
}

showSearch(query = {}) {
  const searchPage = new SearchPage({
    query: query.q || '',
    state: this.state
  });
  // 렌더링...
}
```

3. **Export 추가** (`src/index.js`)
```javascript
import { SearchPage } from './pages/search.js';
export { ..., SearchPage };

window.PagesTemplate = {
  components: {
    ...,
    SearchPage
  }
};
```

### State 기능 추가

```javascript
// src/core/state.js
class State {
  addToWishlist(product) {
    this.state.wishlist = this.state.wishlist || [];
    this.state.wishlist.push(product);
    this.notify('wishlist:add', product);
    this.save();
  }
}
```

### 컴포넌트 추가

```javascript
// src/components/Toast.js
export class Toast {
  constructor(message, type = 'info') {
    this.message = message;
    this.type = type;
  }

  render() { ... }
}
```

## 중요 파일들

### 반드시 읽어야 할 파일
1. **[CONTRIBUTING.md](../CONTRIBUTING.md)** - 전체 개발 가이드 (가장 중요!)
2. **[src/core/widget.js](../src/core/widget.js)** - 라우팅과 페이지 전환 로직
3. **[src/core/state.js](../src/core/state.js)** - 상태 관리
4. **[src/core/router.js](../src/core/router.js)** - 하이브리드 라우팅

### 수정 시 주의가 필요한 파일
- `src/core/*` - 핵심 로직, 기능 추가는 OK, 구조 변경은 신중히
- `build.js` - esbuild 설정
- `src/index.js` - 전역 API 노출

## 금지사항 (DO NOT)

❌ **Path Parameters 사용**
```javascript
// 금지
router.navigate('/product/:id');
router.navigate('/product/123');

// 사용
router.navigate('/product', { id: 123 });
```

❌ **Core 구조 함부로 변경**
- State, Router, Widget 구조 변경 금지
- 기능 추가는 가능

❌ **외부 라이브러리 무분별한 추가**
- Vanilla JS 원칙 유지

❌ **직접 DOM 조작**
```javascript
// 지양
document.getElementById('foo');

// 권장
import { $ } from '../utils/dom.js';
$('foo');
```

## 빠른 명령어

```bash
# 개발 (Live Server로 index.html 실행)
# 빌드 필요 없음

# 프로덕션 빌드
npm run build

# Watch 모드
npm run dev
```

## 체크리스트

새로운 기능 추가 후:
- [ ] Live Server에서 테스트
- [ ] `npm run build` 성공 확인
- [ ] 브라우저 뒤로가기/앞으로가기 동작 확인
- [ ] State 변경이 올바르게 동작하는지 확인
- [ ] 한국어/KRW 포맷 유지 확인
- [ ] `src/index.js`에 export 추가 확인

## 학습 리소스

- **전체 가이드**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **위시리스트 구현 예시**: CONTRIBUTING.md의 "학습 예시" 섹션 참고
- **기존 페이지 참고**: [src/pages/product.js](../src/pages/product.js) - 복잡한 페이지 예시
- **기존 페이지 참고**: [src/pages/index.js](../src/pages/index.js) - 간단한 페이지 예시

## 프로젝트 히스토리

이 프로젝트는 다음 진화 과정을 거쳤습니다:
1. 기본 위젯 구조 (점수: 6.5/10)
2. State + Router 추가 (점수: 8.5/10)
3. 하이브리드 라우팅 + 파일 구조 표준화 (점수: 9/10)

**현재 구조를 유지하는 것이 중요합니다!**

---

**새로운 세션을 시작할 때는 반드시 [CONTRIBUTING.md](../CONTRIBUTING.md)를 전체 읽어주세요.**

마지막 업데이트: 2025-10-17
