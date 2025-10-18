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

    // popstate 이벤트 리스너 바인딩
    this.handlePopState = this.handlePopState.bind(this);
    window.addEventListener('popstate', this.handlePopState);
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
  handleRoute() {
    const path = this.getHash();

    this.currentRoute = path;
    this.currentPath = path;

    const match = this.matchRoute(path);

    if (match) {
      this.pathParams = match.params;
      match.handler(match.params);
    } else {
      console.warn('No route handler found for:', path);
    }
  }

  /**
   * popstate 이벤트 핸들러 (뒤로가기/앞으로가기)
   */
  handlePopState() {
    this.handleRoute();
  }

  /**
   * 네비게이션 (히스토리에 추가)
   * @param {string} path - 경로 (예: "/product/1")
   * @param {object} state - 히스토리 상태
   */
  navigate(path, state = {}) {
    window.history.pushState(state, '', `#${path}`);
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
  }

  /**
   * 초기화 (첫 로드 시 라우팅 처리)
   */
  init() {
    this.handleRoute();
  }
}
