// 위젯 스타일 정의

export const styles = `
  /* Widget Container */
  .widget-wrapper {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    box-sizing: border-box;
  }

  .widget-wrapper *,
  .widget-wrapper *::before,
  .widget-wrapper *::after {
    box-sizing: border-box;
  }

  .widget-content {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
  }

  /* Product List */
  .product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
  }

  .product-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    transition: box-shadow 0.2s;
    cursor: pointer;
  }

  .product-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .product-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
  }

  .product-title {
    font-size: 16px;
    font-weight: 600;
    margin: 12px 0 8px;
    color: #212529;
  }

  .product-price {
    font-size: 18px;
    font-weight: 700;
    color: #007bff;
  }

  /* Button */
  .widget-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .widget-button:hover {
    background: #0056b3;
  }

  .widget-button:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  /* Modal */
  .widget-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }

  .widget-modal {
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  }

  .widget-modal-close {
    position: absolute;
    top: 12px;
    right: 12px;
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6c757d;
  }

  .widget-modal-close:hover {
    color: #212529;
  }

  /* Cart */
  .cart-container {
    padding: 20px;
  }

  .cart-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
  }

  .cart-item img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
  }

  .cart-item-info {
    flex: 1;
  }

  .cart-total {
    font-size: 20px;
    font-weight: 700;
    text-align: right;
    padding: 20px;
    border-top: 2px solid #212529;
  }

  /* Loading */
  .widget-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: #6c757d;
  }

  /* Error */
  .widget-error {
    padding: 20px;
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    margin: 20px;
  }

  /* Product Detail */
  .product-detail {
    padding: 20px;
  }

  .back-button {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #495057;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .back-button:hover {
    background: #e9ecef;
  }

  .product-top {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }

  /* 상품 이미지 */
  .product-images {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .main-image img {
    width: 100%;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .thumbnail-images {
    display: flex;
    gap: 8px;
  }

  .thumbnail {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .thumbnail:hover {
    border-color: #007bff;
  }

  .thumbnail.active {
    border-color: #007bff;
  }

  /* 상품 정보 */
  .product-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .product-category {
    color: #6c757d;
    font-size: 13px;
  }

  .product-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: #212529;
  }

  .product-rating {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .product-rating .stars {
    color: #ffc107;
    font-size: 16px;
  }

  .product-rating .rating-text {
    color: #6c757d;
    font-size: 14px;
  }

  .product-price-section {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 0;
    border-top: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
  }

  .original-price {
    color: #6c757d;
    text-decoration: line-through;
    font-size: 16px;
  }

  .discount-badge {
    background: #dc3545;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 700;
  }

  .current-price {
    font-size: 28px;
    font-weight: 700;
    color: #212529;
  }

  .product-delivery {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 4px;
  }

  .delivery-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }

  .delivery-item .label {
    color: #6c757d;
    font-weight: 500;
  }

  .delivery-item .value {
    color: #212529;
  }

  .delivery-item .in-stock {
    color: #28a745;
    font-weight: 600;
  }

  .delivery-item .out-stock {
    color: #dc3545;
    font-weight: 600;
  }

  .product-quantity {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .product-quantity label {
    font-weight: 500;
    color: #495057;
  }

  .quantity-control {
    display: flex;
    align-items: center;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    overflow: hidden;
  }

  .qty-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: #f8f9fa;
    cursor: pointer;
    font-size: 18px;
    color: #495057;
  }

  .qty-btn:hover {
    background: #e9ecef;
  }

  .qty-input {
    width: 60px;
    height: 36px;
    border: none;
    text-align: center;
    font-size: 14px;
    border-left: 1px solid #dee2e6;
    border-right: 1px solid #dee2e6;
  }

  .qty-input:focus {
    outline: none;
  }

  .product-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 4px;
  }

  .product-total .label {
    font-size: 16px;
    font-weight: 500;
    color: #495057;
  }

  .product-total .total-price {
    font-size: 24px;
    font-weight: 700;
    color: #dc3545;
  }

  .product-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .btn-cart,
  .btn-buy {
    padding: 14px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cart {
    background: white;
    color: #007bff;
    border: 2px solid #007bff;
  }

  .btn-cart:hover {
    background: #007bff;
    color: white;
  }

  .btn-buy {
    background: #007bff;
    color: white;
  }

  .btn-buy:hover {
    background: #0056b3;
  }

  /* 탭 메뉴 */
  .product-tabs {
    border-top: 1px solid #e0e0e0;
    padding-top: 20px;
  }

  .tab-buttons {
    display: flex;
    gap: 8px;
    border-bottom: 2px solid #e0e0e0;
    margin-bottom: 20px;
  }

  .tab-button {
    padding: 12px 24px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    color: #6c757d;
    transition: all 0.2s;
  }

  .tab-button:hover {
    color: #007bff;
  }

  .tab-button.active {
    color: #007bff;
    border-bottom-color: #007bff;
  }

  .tab-panel {
    display: none;
  }

  .tab-panel.active {
    display: block;
  }

  /* 상세 정보 탭 */
  .detail-content {
    padding: 20px;
    line-height: 1.8;
  }

  .detail-content h3 {
    font-size: 20px;
    margin: 24px 0 12px;
    color: #212529;
  }

  .detail-content h4 {
    font-size: 16px;
    margin: 20px 0 12px;
    color: #495057;
  }

  .detail-content p {
    color: #6c757d;
    margin-bottom: 16px;
  }

  .detail-content ul {
    margin-left: 20px;
    color: #495057;
  }

  .detail-content li {
    margin-bottom: 8px;
  }

  .specs-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
  }

  .specs-table th,
  .specs-table td {
    padding: 12px;
    border: 1px solid #e0e0e0;
    text-align: left;
  }

  .specs-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #495057;
    width: 30%;
  }

  .specs-table td {
    color: #6c757d;
  }

  /* 후기 탭 */
  .reviews-content {
    padding: 20px;
  }

  .reviews-summary {
    background: #f8f9fa;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
  }

  .summary-rating {
    text-align: center;
  }

  .summary-rating .big-rating {
    font-size: 48px;
    font-weight: 700;
    color: #212529;
    margin-bottom: 8px;
  }

  .summary-rating .stars {
    color: #ffc107;
    font-size: 24px;
    margin-bottom: 8px;
  }

  .summary-rating .review-count {
    color: #6c757d;
    font-size: 14px;
  }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .review-item {
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }

  .review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .review-author {
    font-weight: 600;
    color: #495057;
  }

  .review-rating {
    color: #ffc107;
    font-size: 14px;
  }

  .review-date {
    color: #6c757d;
    font-size: 13px;
    margin-left: auto;
  }

  .review-content {
    color: #495057;
    line-height: 1.6;
  }

  .no-reviews {
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
    font-size: 16px;
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .product-top {
      grid-template-columns: 1fr;
    }

    .product-actions {
      grid-template-columns: 1fr;
    }
  }
`;
