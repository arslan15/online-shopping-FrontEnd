import React, { useState } from 'react';
import "./ProductCard.css";

const ProductCard = (props) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };

  // Stock Validation Check
  const stockCount = Number(props.ProductQty) || 0;
  const isOutOfStock = stockCount <= 0;

  const handleAddToCartClick = (e) => {
    if (e) e.stopPropagation();
    if (isOutOfStock) return;
    if (props.onAddToCart) props.onAddToCart();
  };

  return (
    <>
      {/* Main Product Card */}
      <div className="product-card">
        {/* Product Image Section at the Top */}
        {props.ImageUrl && (
          <div className="product-image-container">
            <img 
              src={props.ImageUrl} 
              alt={props.productName || "Product"} 
              className="product-image" 
            />
          </div>
        )}

        {/* Product Details Section */}
        <div className="product-content">
          {props.productCategoryType && (
            <span className="product-category">
              {props.productCategoryType}
            </span>
          )}

          <h3 className="product-title">{props.productName}</h3>
          
          {props.price && (
            <p className="product-price">Price: Rs. {props.price}</p>
          )}

          {/* Stock Display Badge */}
          <p className="product-qty">
            {isOutOfStock ? (
              <span className="out-of-stock-label" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                Out of Stock
              </span>
            ) : (
              <span>Stock: {stockCount}</span>
            )}
          </p>

          <div className="button-group">
            <button 
              className="prodButton detailsBtn" 
              onClick={toggleModal}
            >
              Details
            </button>
            <button 
              className={`prodButton cartBtn ${isOutOfStock ? 'disabled-btn' : ''}`} 
              onClick={handleAddToCartClick}
              disabled={isOutOfStock}
              style={{
                opacity: isOutOfStock ? 0.5 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                backgroundColor: isOutOfStock ? '#64748b' : undefined
              }}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add To Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Modal Overlay */}
      {showModal && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={toggleModal}>
              &times;
            </button>

            {props.ImageUrl && (
              <img 
                src={props.ImageUrl} 
                alt={props.productName || "Product"} 
                className="modal-product-image" 
              />
            )}

            {props.productCategoryType && (
              <span className="product-category">{props.productCategoryType}</span>
            )}
            
            <h2 className="modal-title">{props.productName}</h2>
            
            <p className="modal-description">
              {/*props.ProductDescription || "No detailed description provided for this product."*/}
            </p>

            <div className="modal-meta">
              <p>
                <strong>Stock Available:</strong>{' '}
                {isOutOfStock ? (
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Out of Stock</span>
                ) : (
                  stockCount
                )}
              </p>
              {props.price && (
                <h3>Price: Rs. {props.price}</h3>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className={`prodButton cartBtn ${isOutOfStock ? 'disabled-btn' : ''}`}
                disabled={isOutOfStock}
                onClick={() => {
                  handleAddToCartClick();
                  if (!isOutOfStock) toggleModal();
                }}
                style={{
                  opacity: isOutOfStock ? 0.5 : 1,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  backgroundColor: isOutOfStock ? '#64748b' : undefined
                }}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add To Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;