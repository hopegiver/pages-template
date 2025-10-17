// Pages Template Entry Point

import { styles } from './styles/main.css.js';
import { Widget } from './core/widget.js';
import { Router } from './core/router.js';
import { State, getState } from './core/state.js';
import { IndexPage } from './pages/index.js';
import { ProductPage } from './pages/product.js';
import { CartPage } from './pages/cart.js';
import { Modal } from './components/Modal.js';

// Inject styles
function injectStyles() {
  const styleId = 'pages-template-styles';

  // Check if styles already injected
  if (document.getElementById(styleId)) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

// Auto-initialize when loaded as module
if (typeof window !== 'undefined') {
  injectStyles();

  // Expose global API
  window.PagesTemplate = {
    Widget,
    Router,
    State,
    getState,
    components: {
      IndexPage,
      ProductPage,
      CartPage,
      Modal
    }
  };

  console.log('Pages Template loaded.');
}

// ES6 exports
export {
  Widget,
  Router,
  State,
  getState,
  IndexPage,
  ProductPage,
  CartPage,
  Modal
};
