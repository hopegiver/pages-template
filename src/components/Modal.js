// 모달 컴포넌트

import { createElement } from '../utils/dom.js';

export class Modal {
  constructor(props = {}) {
    this.props = props;
    this.title = props.title || '';
    this.content = props.content || '';
    this.onClose = props.onClose || (() => {});
    this.overlay = null;
  }

  render() {
    // Create overlay
    this.overlay = createElement('div', { className: 'widget-modal-overlay' });

    // Create modal
    const modal = createElement('div', { className: 'widget-modal' });

    // Close button
    const closeBtn = createElement('button', {
      className: 'widget-modal-close',
      innerHTML: '×'
    });
    closeBtn.addEventListener('click', () => this.close());

    // Title
    const title = createElement('h2', {
      innerHTML: this.title,
      style: 'margin-top: 0;'
    });

    // Content
    const contentEl = createElement('div', {
      className: 'widget-modal-content'
    });

    if (typeof this.content === 'string') {
      contentEl.innerHTML = this.content;
    } else {
      contentEl.appendChild(this.content);
    }

    modal.appendChild(closeBtn);
    if (this.title) {
      modal.appendChild(title);
    }
    modal.appendChild(contentEl);

    this.overlay.appendChild(modal);

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close on ESC key
    this.handleEscKey = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleEscKey);

    return this.overlay;
  }

  open() {
    const modalEl = this.render();
    document.body.appendChild(modalEl);
  }

  close() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    document.removeEventListener('keydown', this.handleEscKey);
    this.onClose();
  }

  static show(options) {
    const modal = new Modal(options);
    modal.open();
    return modal;
  }
}
