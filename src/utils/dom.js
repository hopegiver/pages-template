// DOM 조작 헬퍼 함수

/**
 * Create DOM element with attributes
 * @param {string} tag - HTML tag name
 * @param {object} attributes - Element attributes (className, id, innerHTML, etc.)
 * @returns {HTMLElement}
 */
export function createElement(tag, attributes = {}) {
  const element = document.createElement(tag);

  Object.keys(attributes).forEach(key => {
    if (key === 'className') {
      element.className = attributes[key];
    } else if (key === 'innerHTML') {
      element.innerHTML = attributes[key];
    } else if (key === 'style' && typeof attributes[key] === 'object') {
      Object.assign(element.style, attributes[key]);
    } else if (key === 'dataset') {
      Object.keys(attributes[key]).forEach(dataKey => {
        element.dataset[dataKey] = attributes[key][dataKey];
      });
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });

  return element;
}

/**
 * Query selector wrapper
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (default: document)
 * @returns {HTMLElement|null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Query selector all wrapper
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (default: document)
 * @returns {NodeList}
 */
export function $$(selector, parent = document) {
  return parent.querySelectorAll(selector);
}

/**
 * Add event listener with delegation
 * @param {HTMLElement} parent - Parent element
 * @param {string} eventType - Event type
 * @param {string} selector - Child selector
 * @param {Function} handler - Event handler
 */
export function delegate(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, e);
    }
  });
}

/**
 * Remove all children from element
 * @param {HTMLElement} element - Element to clear
 */
export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Toggle class on element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name to toggle
 */
export function toggleClass(element, className) {
  element.classList.toggle(className);
}

/**
 * Add multiple classes to element
 * @param {HTMLElement} element - Target element
 * @param {string[]} classes - Array of class names
 */
export function addClasses(element, classes) {
  element.classList.add(...classes);
}

/**
 * Remove multiple classes from element
 * @param {HTMLElement} element - Target element
 * @param {string[]} classes - Array of class names
 */
export function removeClasses(element, classes) {
  element.classList.remove(...classes);
}
