// 라우팅 관리 (Path Parameters 방식)

/**
 * 경로 생성 헬퍼
 * @param {string} path - 경로 (예: "/product/:id")
 * @param {object} params - 경로 파라미터 (예: { id: 1 })
 * @returns {string} - 완성된 경로 (예: "/product/1")
 */
export function createPath(path, params = {}) {
  let finalPath = path;

  // :param 형태의 파라미터를 실제 값으로 치환
  Object.keys(params).forEach(key => {
    finalPath = finalPath.replace(`:${key}`, params[key]);
  });

  return finalPath;
}

export class Router {
  constructor(routes = {}) {
    this.routes = routes;
    this.currentRoute = null;
    this.currentPath = null;
    this.pathParams = {};
    this.isNavigating = false;
    this.loadingTimeout = null;
    this.beforeNavigate = null; // 네비게이션 전 훅 (페이지 프리로드용)

    // popstate 이벤트 리스너 바인딩
    this.handlePopState = this.handlePopState.bind(this);
    window.addEventListener('popstate', this.handlePopState);

    // hashchange 이벤트 리스너 바인딩
    this.handleHashChange = this.handleHashChange.bind(this);
    window.addEventListener('hashchange', this.handleHashChange);
  }

  /**
   * 라우트 등록
   */
  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  /**
   * 여러 라우트 한번에 등록
   */
  addRoutes(routes) {
    this.routes = { ...this.routes, ...routes };
  }

  /**
   * 현재 URL 해시 가져오기
   */
  getHash() {
    return window.location.hash.slice(1) || '/';
  }

  /**
   * Path Parameters 파싱
   * 예: 패턴 "/product/:id", 경로 "/product/123" → { id: "123" }
   */
  extractParams(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return params;
  }

  /**
   * 라우트 매칭 (Path Parameters 지원)
   */
  matchRoute(path) {
    // 정확히 일치하는 라우트 찾기
    if (this.routes[path]) {
      return { handler: this.routes[path], params: {} };
    }

    // Path Parameters 패턴 매칭
    for (const pattern in this.routes) {
      if (pattern === '*') continue;

      const params = this.extractParams(pattern, path);
      if (params !== null) {
        return { handler: this.routes[pattern], params };
      }
    }

    // 404 처리
    if (this.routes['*']) {
      return { handler: this.routes['*'], params: {} };
    }

    return null;
  }

  /**
   * 라우트 처리
   */
  async handleRoute() {
    if (this.isNavigating) return;

    const path = this.getHash();
    const match = this.matchRoute(path);

    if (!match) {
      console.warn('No route handler found for:', path);
      return;
    }

    this.isNavigating = true;

    try {
      // 1초 이상 걸릴 경우 로딩 표시
      this.loadingTimeout = setTimeout(() => {
        this.showLoadingIndicator();
      }, 1000);

      // beforeNavigate 훅 실행 (페이지 프리로드)
      if (this.beforeNavigate) {
        await this.beforeNavigate(path, match.params);
      }

      // 로딩 타임아웃 취소
      clearTimeout(this.loadingTimeout);
      this.hideLoadingIndicator();

      // 라우트 정보 업데이트
      this.currentRoute = path;
      this.currentPath = path;
      this.pathParams = match.params;

      // 페이지 핸들러 실행
      match.handler(match.params);
    } catch (error) {
      console.error('Route handling error:', error);
      clearTimeout(this.loadingTimeout);
      this.hideLoadingIndicator();
    } finally {
      this.isNavigating = false;
    }
  }

  /**
   * popstate 이벤트 핸들러 (뒤로가기/앞으로가기)
   */
  handlePopState() {
    this.handleRoute();
  }

  /**
   * hashchange 이벤트 핸들러 (해시 변경 시)
   */
  handleHashChange() {
    this.handleRoute();
  }

  /**
   * 로딩 표시
   */
  showLoadingIndicator() {
    const existingIndicator = document.querySelector('.router-loading-indicator');
    if (existingIndicator) return;

    const indicator = document.createElement('div');
    indicator.className = 'router-loading-indicator';
    indicator.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(indicator);
  }

  /**
   * 로딩 숨김
   */
  hideLoadingIndicator() {
    const indicator = document.querySelector('.router-loading-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * 네비게이션 전 훅 설정
   * @param {Function} hook - async function(path, params) { ... }
   */
  setBeforeNavigate(hook) {
    this.beforeNavigate = hook;
  }

  /**
   * 네비게이션 (히스토리에 추가)
   * @param {string} path - 경로 (예: "/product/1")
   * @param {object} state - 히스토리 상태
   */
  navigate(path, state = {}) {
    // URL 먼저 변경
    window.history.pushState(state, '', `#${path}`);
    // 라우트 처리 (프리로딩 포함)
    this.handleRoute();
  }

  /**
   * 리다이렉트 (히스토리 대체)
   */
  redirect(path, state = {}) {
    window.history.replaceState(state, '', `#${path}`);
    this.handleRoute();
  }

  /**
   * 뒤로가기
   */
  back() {
    window.history.back();
  }

  /**
   * 앞으로가기
   */
  forward() {
    window.history.forward();
  }

  /**
   * 현재 라우트 정보
   */
  getCurrentRoute() {
    return {
      fullPath: this.currentRoute,
      path: this.currentPath,
      params: this.pathParams,
      hash: this.getHash()
    };
  }

  /**
   * Path 파라미터 가져오기
   */
  getParam(key) {
    if (key) {
      return this.pathParams[key];
    }
    return { ...this.pathParams };
  }

  /**
   * 특정 라우트인지 확인
   */
  isRoute(path) {
    return this.currentPath === path;
  }

  /**
   * 라우터 정리
   */
  destroy() {
    window.removeEventListener('popstate', this.handlePopState);
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  /**
   * 초기화 (첫 로드 시 라우팅 처리)
   */
  init() {
    this.handleRoute();
  }
}
