import React, { useContext, useState } from 'react';
import axios from 'axios';
import MyContext from '../MyContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaTrashAlt, 
  FaShoppingBag, 
  FaTruck, 
  FaArrowLeft, 
  FaSpinner, 
  FaCheckCircle 
} from 'react-icons/fa';

export default function Cart() {
  const { cart, handleRemoveFromCart, clearCart } = useContext(MyContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    postalCode: '',
  });

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.price || 10) * (item.quantity || 1),
    0
  );

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
      const userString = localStorage.getItem('currentUser');
      const currentUser = userString ? JSON.parse(userString) : null;
      const rawToken = localStorage.getItem('token') || '';
      const token = rawToken.replace(/"/g, '');

      const payload = {
        cart,
        user: currentUser ? Number(currentUser.id) : null,
        shippingAddress: {
          fullName: address.fullName,
          email: address.email,
          phone: address.phone,
          address: address.streetAddress,
          city: address.city,
          postalCode: address.postalCode,
          country: 'Pakistan',
        },
        totalAmount,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${BASE_URL}/orders/place-order`, payload, config);

      if (response.status === 200 || response.status === 201) {
        toast.success('Order placed successfully!');
        if (clearCart) clearCart();

        setTimeout(() => {
          navigate('/user');
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to place order:', err);
      toast.error(
        err.response?.data?.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 text-white">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary pb-3">
        <h2 className="fw-bold m-0 d-flex align-items-center gap-2">
          <FaShoppingBag className="text-primary" /> Shopping Cart
        </h2>
        <button 
          onClick={() => navigate('/User')} 
          className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
        >
          <FaArrowLeft /> Continue Shopping
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="card bg-dark text-white border-secondary p-5 text-center shadow-lg">
          <div className="card-body">
            <FaShoppingBag className="display-1 text-secondary mb-3" />
            <h4 className="fw-bold">Your cart is empty</h4>
            <p className="text-muted">Looks like you haven't added anything to your cart yet.</p>
            <button 
              onClick={() => navigate('/User')} 
              className="btn btn-primary px-4 py-2 mt-2 fw-semibold"
            >
              Browse Products
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          
          {/* Left Column: Cart Items List */}
          <div className="col-lg-7">
            <div className="card bg-dark text-white border-secondary shadow-lg">
              <div className="card-header bg-dark border-secondary py-3">
                <h5 className="mb-0 fw-bold">Order Summary ({cart.length} items)</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0">
                    <thead className="table-secondary text-uppercase small">
                      <tr>
                        <th className="ps-3 py-3">Product</th>
                        <th className="text-center py-3">Qty</th>
                        <th className="text-center py-3">Price</th>
                        <th className="text-end pe-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item._id || item.id}>
                          <td className="ps-3 py-3">
                            <span className="fw-semibold text-light">{item.productName}</span>
                          </td>
                          <td className="text-center py-3">
                            <span className="badge bg-secondary px-3 py-2 fs-6">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="text-center py-3 fw-bold text-success">
                            Rs. {(item.price || 10) * item.quantity}
                          </td>
                          <td className="text-end pe-3 py-3">
                            <button
                              onClick={() => handleRemoveFromCart(item._id || item.id, item.quantity)}
                              className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                              title="Remove item"
                            >
                              <FaTrashAlt />
                              <span className="d-none d-md-inline">Remove</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card-footer bg-dark border-secondary p-3 d-flex justify-content-between align-items-center">
                <span className="text-muted">Subtotal</span>
                <span className="fs-4 fw-bold text-success">Rs. {totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form */}
          <div className="col-lg-5">
            <div className="card bg-dark text-white border-secondary shadow-lg">
              <div className="card-header bg-dark border-secondary py-3 d-flex align-items-center gap-2">
                <FaTruck className="text-warning" />
                <h5 className="mb-0 fw-bold">Shipping Details</h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmitOrder} className="d-flex flex-column gap-3">
                  
                  <div>
                    <label className="form-label small text-muted">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="John Doe"
                      value={address.fullName}
                      onChange={handleChange}
                      required
                      className="form-control bg-secondary bg-opacity-25 text-white border-secondary"
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        value={address.email}
                        onChange={handleChange}
                        required
                        className="form-control bg-secondary bg-opacity-25 text-white border-secondary"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="03001234567"
                        value={address.phone}
                        onChange={handleChange}
                        required
                        className="form-control bg-secondary bg-opacity-25 text-white border-secondary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label small text-muted">Street Address</label>
                    <input
                      type="text"
                      name="streetAddress"
                      placeholder="House / Apartment / Street"
                      value={address.streetAddress}
                      onChange={handleChange}
                      required
                      className="form-control bg-secondary bg-opacity-25 text-white border-secondary"
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small text-muted">City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="Islamabad"
                        value={address.city}
                        onChange={handleChange}
                        required
                        className="form-control bg-secondary bg-opacity-25 text-white border-secondary"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        placeholder="44000"
                        value={address.postalCode}
                        onChange={handleChange}
                        required
                        className="form-control bg-secondary bg-opacity-25 text-white border-secondary"
                      />
                    </div>
                  </div>

                  <hr className="border-secondary my-2" />

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Total Payable:</span>
                    <span className="fs-4 fw-bold text-success">Rs. {totalAmount}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="spinner-border spinner-border-sm" />
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>

                </form>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}