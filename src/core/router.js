// 라우팅 관리 (하이브리드 방식: 경로 + 쿼리 파라미터)

/**
 * 쿼리 스트링 생성
 */
export function buildQueryString(params) {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }

  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

/**
 * 경로 생성 헬퍼
 * @param {string} path - 경로
 * @param {object} query - 쿼리 파라미터
 * @returns {string} - 완성된 경로 (예: "/product?id=1")
 */
export function createPath(path, query = {}) {
  const queryString = buildQueryString(query);
  return queryString ? `${path}?${queryString}` : path;
}

export class Router {
  constructor(routes = {}) {
    this.routes = routes;
    this.currentRoute = null;
    this.currentPath = null;
    this.queryParams = {};

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
   * 경로와 쿼리 분리
   * 예: "/product?id=1&sort=price" → { path: "/product", query: "id=1&sort=price" }
   */
  parseHash(hash) {
    const [path, queryString] = hash.split('?');
    return {
      path: path || '/',
      queryString: queryString || ''
    };
  }

  /**
   * 쿼리 스트링 파싱
   */
  parseQueryString(queryString) {
    if (!queryString) {
      return {};
    }

    return queryString.split('&').reduce((params, param) => {
      const [key, value] = param.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      return params;
    }, {});
  }

  /**
   * 라우트 매칭
   */
  matchRoute(path) {
    // 정확히 일치하는 라우트 찾기
    if (this.routes[path]) {
      return this.routes[path];
    }

    // 404 처리
    return this.routes['*'] || null;
  }

  /**
   * 라우트 처리
   */
  handleRoute() {
    const hash = this.getHash();
    const { path, queryString } = this.parseHash(hash);
    const queryParams = this.parseQueryString(queryString);

    this.currentRoute = hash;
    this.currentPath = path;
    this.queryParams = queryParams;

    const handler = this.matchRoute(path);

    if (handler) {
      handler(queryParams);
    } else {
      console.warn('No route handler found for:', path);
    }
  }

  /**
   * popstate 이벤트 핸들러 (뒤로가기/앞으로가기)
   */
  handlePopState(event) {
    this.handleRoute();
  }

  /**
   * 네비게이션 (히스토리에 추가)
   * @param {string} path - 경로 (예: "/product")
   * @param {object} query - 쿼리 파라미터 (예: { id: 1, sort: 'price' })
   * @param {object} state - 히스토리 상태
   */
  navigate(path, query = {}, state = {}) {
    const queryString = buildQueryString(query);
    const fullPath = queryString ? `${path}?${queryString}` : path;

    window.history.pushState(state, '', `#${fullPath}`);
    this.handleRoute();
  }

  /**
   * 리다이렉트 (히스토리 대체)
   */
  redirect(path, query = {}, state = {}) {
    const queryString = buildQueryString(query);
    const fullPath = queryString ? `${path}?${queryString}` : path;

    window.history.replaceState(state, '', `#${fullPath}`);
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
      query: this.queryParams,
      hash: this.getHash()
    };
  }

  /**
   * 쿼리 파라미터 가져오기
   */
  getQuery(key) {
    if (key) {
      return this.queryParams[key];
    }
    return { ...this.queryParams };
  }

  /**
   * 특정 라우트인지 확인
   */
  isRoute(path) {
    return this.currentPath === path;
  }

  /**
   * 쿼리 스트링 생성 (헬퍼 함수 재활용)
   */
  buildQueryString(params) {
    return buildQueryString(params);
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
