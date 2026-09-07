import React, { useState } from 'react';
import "./ProductCard.css";

const ProductCard = (props) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal((prev) => !prev);
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

          {/*<p className="product-description">{props.ProductDescription}</p>*/}

          {props.ProductQty !== undefined && (
            <p className="product-qty">Stock: {props.ProductQty}</p>
          )}

          <div className="button-group">
            <button 
              className="prodButton detailsBtn" 
              onClick={toggleModal}
            >
              Details
            </button>
            <button 
              className="prodButton cartBtn" 
              onClick={props.onAddToCart}
            >
              Add To Cart
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
              {props.ProductDescription || "No detailed description provided for this product."}
            </p>

            <div className="modal-meta">
              {props.ProductQty !== undefined && (
                <p><strong>Stock Available:</strong> {props.ProductQty}</p>
              )}
              {props.price && (
                <h3>Price: Rs. {props.price}</h3>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="prodButton cartBtn" 
                onClick={() => {
                  if (props.onAddToCart) props.onAddToCart();
                  toggleModal();
                }}
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;