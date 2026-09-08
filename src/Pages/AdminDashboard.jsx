import React, { useState, useEffect, useTransition } from 'react';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { usePagination } from '../hooks/usePagination';
import AnnouncementBar from '../Components/AnnoucementBar/AnnoucementBar';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'categories' | 'product' | 'Admin Approval' | 'settings'
  const [usersList, setUsersList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    Description: '',
    categoryType: '',
  });

  const [formProductData, setFormProductData] = useState({
    productCategoryType: '',
    productName: '',
    ProductDescription: '',
    ProductQty: '',
    ImageUrl: '',
    price: 0,
  });

  const [loading, setLoading] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // System Settings state
  const [settings, setSettings] = useState({
    siteName: 'My Application',
    maintenanceMode: false,
    userRegistration: true,
    userLogin: true,
  });

  // Determine active dataset based on active tab
  const getActiveList = () => {
    switch (activeTab) {
      case 'users':
        return usersList.filter((user) => user.role !== 'Admin');
      case 'categories':
        return categoriesList;
      case 'product':
        return productsList;
      case 'Admin Approval':
        return orders;
      default:
        return [];
    }
  };

  const {
    currentItems: displayedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    limit,
    setLimit,
    searchTerm,
    setSearchTerm,
    handleSearchChange,
    clearSearch,
  } = usePagination(getActiveList(), {
    searchFields: [
      'productName',
      'productCategoryType',
      'categoryType',
      'categoryDescription',
      'ProductDescription',
      'name',
      'email',
      'user',
      'shippingAddress.fullName',
      'paymentStatus',
    ],
    initialLimit: 10,
  });

  const handleTabChange = (tabName) => {
    startTransition(() => {
      setActiveTab(tabName);
      clearSearch();
    });
  };

  // 1. Fetch Users
  useEffect(() => {
    if (activeTab !== 'users') return;
    const token = localStorage.getItem('token');
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/all?page=${currentPage}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token?.replace(/"/g, '')}`,
          },
        });
        setUsersList(response.data);
      } catch (error) {
        toast.error('Failed to fetch users list');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab, BASE_URL]);

  // 2. Fetch System Settings
  useEffect(() => {
    if (activeTab !== 'settings') return;

    const fetchSystemSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/settings`, {
          headers: {
            Authorization: `Bearer ${token?.replace(/"/g, '')}`,
          },
        });
        if (response.data) {
          setSettings({
            siteName: response.data.siteName ?? 'My Application',
            maintenanceMode: response.data.maintenanceMode ?? false,
            userRegistration: response.data.userRegistration ?? true,
            userLogin: response.data.userLogin ?? true,
          });
        }
      } catch (error) {
        console.error('Failed to load system settings:', error);
        toast.info('Using default system settings.');
      }
    };

    fetchSystemSettings();
  }, [activeTab, BASE_URL]);

  // 3. Fetch Categories
  useEffect(() => {
    if (activeTab !== 'categories' && activeTab !== 'product') return;

    const fetchCategories = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${BASE_URL}/categories?page=${currentPage}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token?.replace(/"/g, '')}`,
          },
        });
        const rawData = response.data;
      if (Array.isArray(rawData)) {
        setCategoriesList(rawData);
      } else if (rawData && Array.isArray(rawData.categories)) {
        setCategoriesList(rawData.categories);
      } else if (rawData && Array.isArray(rawData.data)) {
        setCategoriesList(rawData.data);
      } else {
        setCategoriesList([]); // Fallback to empty array if response is unexpected
      }
    
      } catch (error) {
        toast.error('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [activeTab, BASE_URL]);

  // 4. Fetch Products
  useEffect(() => {
    if (activeTab !== 'product') return;

   const fetchProducts = async () => {
  const token = localStorage.getItem('token');
  setLoading(true);
  try {
    const response = await axios.get(`${BASE_URL}/Products?page=${currentPage}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token?.replace(/"/g, '')}`,
      },
    });
    
    const rawData = response.data;

    if (Array.isArray(rawData)) {
      setProductsList(rawData);
    } else if (rawData && Array.isArray(rawData.products)) {
      setProductsList(rawData.products);
    } else if (rawData && Array.isArray(rawData.data)) {
      setProductsList(rawData.data);
    } else {
      setProductsList([]); // Fallback if API structure is unexpected
    }
  } catch (error) {
    toast.error('Failed to fetch products');
    setProductsList([]);
  } finally {
    setLoading(false);
  }
};

fetchProducts();
}, [activeTab, BASE_URL]);

  // 5. Fetch Orders
  useEffect(() => {
    if (activeTab !== 'Admin Approval') return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const res = await axios.get(`${BASE_URL}/orders?page=${currentPage}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token?.replace(/"/g, '')}`,
          },
        });
        if (res != null) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, BASE_URL]);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.patch(`${BASE_URL}/${id}/toggle-active`);
      setUsersList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: !currentStatus } : u))
      );
      toast.success('User status updated!');
    } catch (error) {
      toast.error('Failed to update user status.');
    }
  };

  const handleSettingToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_URL}/settings`,
        settings,
        {
          headers: {
            Authorization: `Bearer ${token?.replace(/"/g, '')}`,
          },
        }
      );
      if (response.data.settings) {
        setSettings({
          siteName: response.data.settings.siteName,
          maintenanceMode: response.data.settings.maintenanceMode,
          userRegistration: response.data.settings.userRegistration,
          userLogin: response.data.settings.userLogin,
        });
      }
      toast.success(response.data.message || 'System settings saved successfully!');
    } catch (error) {
      console.error('SAVE SETTINGS ERROR:', error);
      toast.error(error.response?.data?.message || 'Failed to save system settings.');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/order/approval`,
        {
          orderId,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token?.replace(/"/g, '')}`,
          },
        }
      );

      toast.success(`Order marked as ${newStatus}`);
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          const currentId = order._id?.$oid || order._id;
          return currentId === orderId ? { ...order, paymentStatus: newStatus } : order;
        })
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update order');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProductChange = (e) => {
    setFormProductData({ ...formProductData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isDuplicate = categoriesList.some(
      (cat) => cat.categoryType.toLowerCase() === formData.categoryType.toLowerCase()
    );

    if (isDuplicate) {
      toast.error('A category with this name already exists!');
      return;
    }

    try {
      const response = await axios.post(BASE_URL + '/addCategory', {
        categoryType: formData.categoryType,
        categoryDescription: formData.Description,
      });

      const savedCategory = response.data.category || response.data;
      if (savedCategory && savedCategory.categoryType) {
        setCategoriesList((prev) => [...prev, savedCategory]);
      } else {
        const refreshResponse = await axios.get(`${BASE_URL}/categories`);
        setCategoriesList(refreshResponse.data);
      }

      setFormData({ Description: '', categoryType: '' });
      toast.success(response.data.message || 'Category added successfully!');
    } catch (error) {
      console.error('ADD CATEGORY ERROR:', error);
      toast.error(error.response?.data?.message || 'Failed to add category.');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(BASE_URL + '/addProduct', {
        productName: formProductData.productName,
        ProductDescription: formProductData.ProductDescription,
        productCategoryType: formProductData.productCategoryType,
        ProductQty: formProductData.ProductQty,
        ImageUrl: formProductData.ImageUrl,
        price: formProductData.price,
      });

      const savedProduct = response.data;
      if (savedProduct && savedProduct.productName) {
        setProductsList((prev) => [...prev, savedProduct]);
      } else {
        const refreshResponse = await axios.get(`${BASE_URL}/products`);
        setProductsList(refreshResponse.data);
      }

      setFormProductData({
        productName: '',
        ProductDescription: '',
        productCategoryType: '',
        ProductQty: '',
        ImageUrl: '',
        price: 0,
      });
      toast.success(response.data.message || 'Product added successfully!');
    } catch (error) {
      console.error('ADD PRODUCT ERROR:', error);
      toast.error(error.response?.data?.message || 'Failed to add product.');
    }
  };

  const getStatusBadgeStyle = (status) => {
    const base = {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      display: 'inline-block',
    };
    if (status === 'Paid') return { ...base, backgroundColor: '#15803d', color: '#fff' };
    if (status === 'Failed') return { ...base, backgroundColor: '#b91c1c', color: '#fff' };
    return { ...base, backgroundColor: '#b45309', color: '#fff' };
  };

  // Reusable Pagination Component
  const renderPaginationBar = () => (
  <div
    className="pagination-wrapper"
    style={{
      marginTop: '20px',
      display: 'flex',
      flexDirection: 'column', // Stacks items vertically on small mobile screens
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      width: '100%',
      boxSizing: 'border-box',
    }}
  >
    {/* Buttons and Indicator */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
        style={{
          padding: '6px 12px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <FaChevronLeft className="btn-icon" /> Previous
      </button>

      <div
        className="page-indicator"
        style={{
          padding: '6px 10px',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        <span>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
      </div>

      <button
        className="pagination-btn"
        disabled={currentPage >= totalPages}
        onClick={() => setCurrentPage((prev) => prev + 1)}
        style={{
          padding: '6px 12px',
          cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Next <FaChevronRight className="btn-icon" />
      </button>
    </div>

    {/* Items Per Page Dropdown */}
    <div
      className="items-per-page-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      <label htmlFor="limit-select" style={{ marginRight: '6px' }}>
        Show:
      </label>
      <select
        id="limit-select"
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        className="items-per-page-select"
        style={{ padding: '4px 8px', borderRadius: '4px' }}
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </div>
  </div>
);

  // Search Input Component
  const renderSearchBar = () => (
    <div style={{ marginBottom: '15px', position: 'relative', maxWidth: '350px' }}>
      <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
      <input
        type="text"
        placeholder={`Search ${activeTab}...`}
        value={searchTerm}
        onChange={handleSearchChange}
        style={{
          width: '100%',
          padding: '8px 32px 8px 32px',
          borderRadius: '6px',
          border: '1px solid #475569',
          backgroundColor: '#1e293b',
          color: '#f8fafc',
        }}
      />
      {searchTerm && (
        <FaTimes
          onClick={clearSearch}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }}
        />
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <span style={styles.badge}>Admin Panel</span>
          {isPending && (
            <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontStyle: 'italic' }}>
              Loading view...
            </span>
          )}
          {activeTab !== 'overview' && (
            <button style={styles.backBtn} onClick={() => handleTabChange('overview')}>
              &larr; Back to Dashboard
            </button>
          )}
        </div>

        <h2 style={styles.heading}>
          {activeTab === 'overview'
            ? 'Admin Dashboard'
            : activeTab === 'users'
            ? 'User Management'
            : activeTab === 'categories'
            ? 'Category Management'
            : activeTab === 'product'
            ? 'Product Management'
            : activeTab === 'Admin Approval'
            ? 'Order Approval Management'
            : 'System Settings'}
        </h2>
        <p style={styles.subtext}>
          {activeTab === 'overview'
            ? 'Welcome back, Admin! You have full access to management tools and system settings.'
            : activeTab === 'users'
            ? 'View and manage registered accounts across the system.'
            : activeTab === 'categories'
            ? 'Creating new categories for the Products'
            : activeTab === 'product'
            ? 'Creating new Products'
            : activeTab === 'Admin Approval'
            ? 'Order Approval from Admin'
            : 'Configure application parameters, access controls, and maintenance modes.'}
        </p>

        {/* --- VIEW 1: OVERVIEW DASHBOARD --- */}
        {activeTab === 'overview' && (
          <div style={styles.grid}>
            <div style={{ ...styles.infoBox, cursor: 'pointer' }} onClick={() => handleTabChange('users')}>
              <h4 style={styles.boxTitle}>User Management &rarr;</h4>
              <p style={styles.boxDesc}>View, activate, or deactivate registered users.</p>
            </div>
            <div style={{ ...styles.infoBox, cursor: 'pointer' }} onClick={() => handleTabChange('categories')}>
              <h4 style={styles.boxTitle}>Category Management &rarr;</h4>
              <p style={styles.boxDesc}>Add and organize application categories.</p>
            </div>
            <div style={{ ...styles.infoBox, cursor: 'pointer' }} onClick={() => handleTabChange('product')}>
              <h4 style={styles.boxTitle}>Product Management &rarr;</h4>
              <p style={styles.boxDesc}>Add and organize application products.</p>
            </div>
            <div style={{ ...styles.infoBox, cursor: 'pointer' }} onClick={() => handleTabChange('Admin Approval')}>
              <h4 style={styles.boxTitle}>Admin Order Approval &rarr;</h4>
              <p style={styles.boxDesc}>Order Final Approval from Admin</p>
            </div>
            <div style={{ ...styles.infoBox, cursor: 'pointer' }} onClick={() => handleTabChange('settings')}>
              <h4 style={styles.boxTitle}>System Settings &rarr;</h4>
              <p style={styles.boxDesc}>Configure application parameters and controls.</p>
            </div>
          </div>
        )}

        {/* --- VIEW 2: ORDER APPROVAL --- */}
        {activeTab === 'Admin Approval' && (
          <div style={{ padding: '20px', backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: '8px' }}>
            <AnnouncementBar orders={orders} />
            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: '600' }}>Order Approval Management</h3>
            {renderSearchBar()}
            {loading ? (
              <p style={{ color: '#cbd5e1' }}>Loading orders...</p>
            ) : displayedItems.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No orders available for review.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #475569' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e293b', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 10px', width: '16%', border: '1px solid #475569' }}>Order ID</th>
                      <th style={{ padding: '12px 10px', width: '8%', border: '1px solid #475569' }}>User ID</th>
                      <th style={{ padding: '12px 10px', width: '22%', border: '1px solid #475569' }}>Customer & Address</th>
                      <th style={{ padding: '12px 10px', width: '24%', border: '1px solid #475569' }}>Cart Items</th>
                      <th style={{ padding: '12px 10px', width: '10%', border: '1px solid #475569' }}>Total</th>
                      <th style={{ padding: '12px 10px', width: '10%', border: '1px solid #475569' }}>Status</th>
                      <th style={{ padding: '12px 10px', width: '10%', border: '1px solid #475569' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.map((order) => {
                      const orderId = order._id?.$oid || order._id;
                      return (
                        <tr key={orderId}>
                          <td style={{ padding: '12px 10px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#cbd5e1', border: '1px solid #334155' }}>{orderId}</td>
                          <td style={{ padding: '12px 10px', fontWeight: '600', border: '1px solid #334155' }}>{order.user ?? 'N/A'}</td>
                          <td style={{ padding: '12px 10px', border: '1px solid #334155' }}>
                            <div style={{ fontWeight: '600', color: '#f1f5f9' }}>{order.shippingAddress?.fullName || 'Guest'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{order.shippingAddress?.phone}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.shippingAddress?.address}, {order.shippingAddress?.city}</div>
                          </td>
                          <td style={{ padding: '12px 10px', border: '1px solid #334155' }}>
                            {order.cart?.map((item, idx) => (
                              <div key={item._id?.$oid || item._id || idx} style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                <span style={{ color: '#38bdf8', marginRight: '6px' }}>•</span>
                                <strong style={{ color: '#e2e8f0' }}>{item.productName || item.title || item.name || 'Product'}</strong>
                                <span style={{ color: '#94a3b8', marginLeft: '6px' }}>(Rs. {item.price})</span>
                              </div>
                            ))}
                          </td>
                          <td style={{ padding: '12px 10px', fontWeight: '700', color: '#4ade80', border: '1px solid #334155' }}>Rs. {order.totalAmount}</td>
                          <td style={{ padding: '12px 10px', border: '1px solid #334155' }}>
                            <span style={getStatusBadgeStyle(order.paymentStatus)}>{order.paymentStatus || 'Pending'}</span>
                          </td>
                          <td style={{ padding: '12px 10px', border: '1px solid #334155' }}>
                            <select
                              value={order.paymentStatus || 'Pending'}
                              onChange={(e) => handleStatusChange(orderId, e.target.value)}
                              style={{ padding: '6px 8px', borderRadius: '4px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #475569', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid (Approve)</option>
                              <option value="Failed">Failed (Reject)</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {renderPaginationBar()}
          </div>
        )}

        {/* --- VIEW 3: USERS TABLE --- */}
        {activeTab === 'users' && (
          <div style={styles.tableContainer}>
            {renderSearchBar()}
            {loading ? (
              <p style={{ color: '#cbd5e1' }}>Loading users...</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedItems.length > 0 ? (
                    displayedItems.map((user) => (
                      <tr key={user.id || user._id} style={styles.tr}>
                        <td style={styles.td}>{user.id}</td>
                        <td style={styles.td}>{user.name}</td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}><span style={styles.roleBadge}>{user.role}</span></td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statusBadge, backgroundColor: user.isActive ? '#15803d' : '#b91c1c' }}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            style={{ ...styles.actionBtn, backgroundColor: user.isActive ? '#dc2626' : '#16a34a' }}
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ ...styles.td, textAlign: 'center' }}>No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {renderPaginationBar()}
          </div>
        )}

        {/* --- VIEW 4: CATEGORIES --- */}
        {activeTab === 'categories' && (
          <div>
            <form onSubmit={handleSubmit} style={styleCategory.form}>
              <fieldset style={styleCategory.fieldset}>
                <legend style={styleCategory.legend}>Categories Form</legend>
                <div style={styleCategory.inputGroup}>
                  <label style={styleCategory.label}>Category Type</label>
                  <input
                    type="text"
                    name="categoryType"
                    placeholder="Enter category name"
                    value={formData.categoryType}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styleCategory.inputGroup}>
                  <label style={styleCategory.label}>Category Description</label>
                  <input type="text" name="Description" placeholder="Description" value={formData.Description} onChange={handleChange} required style={styles.input} />
                </div>
                <button type="submit" style={{ ...styles.button, cursor: 'pointer' }}>Add Category</button>
              </fieldset>
            </form>

            {renderSearchBar()}

            {loading ? (
              <p style={{ color: '#cbd5e1' }}>Loading categories...</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Category Name</th>
                      <th style={styles.th}>Category Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.length > 0 ? (
                      displayedItems.map((cat, index) => (
                        <tr key={cat._id || index} style={styles.tr}>
                          <td style={styles.td}>{(currentPage - 1) * limit + index + 1}</td>
                          <td style={styles.td}>{cat.categoryType}</td>
                          <td style={styles.td}>{cat.categoryDescription}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ ...styles.td, textAlign: 'center' }}>No categories found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {renderPaginationBar()}
          </div>
        )}

        {/* --- VIEW 5: PRODUCT MANAGEMENT --- */}
        {activeTab === 'product' && (
          <div>
            <form onSubmit={handleProductSubmit} style={styleProduct.form}>
              <fieldset style={styleProduct.fieldset}>
                <legend style={styleProduct.legend}>Product Form</legend>
                <div style={styleProduct.inputGroup}>
                  <label style={styleProduct.label}>Product Name</label>
                  <input type="text" name="productName" placeholder="Product Name" value={formProductData.productName} onChange={handleProductChange} required style={styles.input} />
                </div>
                <div style={styleProduct.inputGroup}>
                  <label style={styleProduct.label}>Product Description</label>
                  <input type="text" name="ProductDescription" placeholder="Product Description" value={formProductData.ProductDescription} onChange={handleProductChange} required style={styles.input} />
                </div>
                <div style={styleProduct.inputGroup}>
                  <label style={styleProduct.label}>Product Category</label>
                  <select name="productCategoryType" value={formProductData.productCategoryType || ''} onChange={handleProductChange} required style={styleCategory.input}>
                    <option value="">Select a Category Type</option>
                    {Array.isArray(categoriesList) && categoriesList.map((cat, index) => (
      <option key={cat._id || index} value={cat.categoryType}>
        {cat.categoryType}
      </option>
    ))}
                  </select>
                </div>
                <div style={styleProduct.inputGroup}>
                  <label style={styleProduct.label}>Product Qty</label>
                  <input type="number" name="ProductQty" placeholder="Quantity" value={formProductData.ProductQty} onChange={handleProductChange} required style={styles.input} />
                </div>
                <div style={styleProduct.inputGroup}>
                  <label style={styleProduct.label}>Image Url</label>
                  <input type="text" name="ImageUrl" placeholder="Image Url" value={formProductData.ImageUrl} onChange={handleProductChange} required style={styles.input} />
                </div>
                <div style={styleProduct.inputGroup}>
                  <label style={styleProduct.label}>Price</label>
                  <input type="number" name="price" placeholder="Price" value={formProductData.price} onChange={handleProductChange} required style={styles.input} />
                </div>
                <button type="submit" style={{ ...styles.button, cursor: 'pointer' }}>Add Product</button>
              </fieldset>
            </form>

            {renderSearchBar()}

            {loading ? (
              <p style={{ color: '#cbd5e1' }}>Loading products...</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Product Name</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Price</th>
                      <th style={styles.th}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.length > 0 ? (
                      displayedItems.map((prod, index) => (
                        <tr key={prod._id || index} style={styles.tr}>
                          <td style={styles.td}>{(currentPage - 1) * limit + index + 1}</td>
                          <td style={styles.td}>{prod.productName}</td>
                          <td style={styles.td}>{prod.productCategoryType}</td>
                          <td style={styles.td}>Rs. {prod.price}</td>
                          <td style={styles.td}>{prod.ProductQty}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>No products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                 {renderPaginationBar()}
              </div>
            )}
           
          </div>
        )}

        {/* --- VIEW 6: SYSTEM SETTINGS --- */}
    
       {/* --- VIEW 6: SYSTEM SETTINGS --- */}
{activeTab === 'settings' && (
  <div style={{ maxWidth: '700px', margin: '0 auto', padding: '10px' }}>
    <form onSubmit={handleSaveSettings} style={settingsStyles.card}>
      
      {/* Maintenance Mode */}
      <div style={settingsStyles.row}>
        <div style={settingsStyles.textGroup}>
          <strong style={settingsStyles.title}>Maintenance Mode</strong>
          <p style={settingsStyles.subtitle}>
            Prevent non-admin users from accessing the application.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleSettingToggle('maintenanceMode')}
          style={{
            ...settingsStyles.toggleBtn,
            backgroundColor: settings.maintenanceMode ? '#22c55e' : '#334155',
            color: '#ffffff',
          }}
        >
          {settings.maintenanceMode ? 'ENABLED' : 'DISABLED'}
        </button>
      </div>

      {/* Allow User Registration */}
      <div style={settingsStyles.row}>
        <div style={settingsStyles.textGroup}>
          <strong style={settingsStyles.title}>Allow User Registration</strong>
          <p style={settingsStyles.subtitle}>
            Allow new users to register accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleSettingToggle('userRegistration')}
          style={{
            ...settingsStyles.toggleBtn,
            backgroundColor: settings.userRegistration ? '#22c55e' : '#334155',
            color: '#ffffff',
          }}
        >
          {settings.userRegistration ? 'ENABLED' : 'DISABLED'}
        </button>
      </div>

      {/* Allow User Login */}
      <div style={settingsStyles.row}>
        <div style={settingsStyles.textGroup}>
          <strong style={settingsStyles.title}>Allow User Login</strong>
          <p style={settingsStyles.subtitle}>
            Allow existing users to log into their accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleSettingToggle('userLogin')}
          style={{
            ...settingsStyles.toggleBtn,
            backgroundColor: settings.userLogin ? '#22c55e' : '#334155',
            color: '#ffffff',
          }}
        >
          {settings.userLogin ? 'ENABLED' : 'DISABLED'}
        </button>
      </div>

      {/* Submit Button */}
      <button type="submit" style={settingsStyles.saveBtn}>
        Save Settings
      </button>
    </form>
  </div>
)}
      </div>
    </div>
  );
};

// Internal inline styles for quick preview / demo
const styles = {
  container: { padding: '24px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' },
  card: { backgroundColor: '#0f172a', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  badge: { backgroundColor: '#0284c7', color: '#fff', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 'bold' },
  backBtn: { backgroundColor: 'transparent', color: '#38bdf8', border: 'none', cursor: 'pointer', fontSize: '0.9rem' },
  heading: { fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '8px' },
  subtext: { color: '#94a3b8', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' },
  infoBox: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #334155' },
  boxTitle: { fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px', color: '#38bdf8' },
  boxDesc: { color: '#94a3b8', fontSize: '0.875rem' },
  tableContainer: { overflowX: 'auto', margin: '20px 0' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #334155' },
  th: { backgroundColor: '#1e293b', padding: '12px', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #334155' },
  td: { padding: '12px', fontSize: '0.9rem' },
  roleBadge: { backgroundColor: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' },
  statusBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#fff' },
  actionBtn: { padding: '6px 12px', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff' },
  button: { backgroundColor: '#0284c7', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};

const styleCategory = {
  form: { marginBottom: '24px' },
  fieldset: { border: '1px solid #334155', borderRadius: '8px', padding: '16px' },
  legend: { color: '#38bdf8', padding: '0 8px', fontWeight: 'bold' },
  inputGroup: { marginBottom: '12px' },
  label: { display: 'block', marginBottom: '4px', color: '#cbd5e1' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff' },
};

const styleProduct = { ...styleCategory };

const settingsStyles = {
  card: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #1e293b',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid #1e293b',
    gap: '16px',
    flexWrap: 'wrap', // Responsive wrapping for mobile devices
  },
  textGroup: {
    textAlign: 'left',
    flex: '1 1 250px',
  },
  title: {
    color: '#f8fafc',
    fontSize: '1rem',
    display: 'block',
    marginBottom: '4px',
  },
  subtitle: {
    color: '#94a3b8',
    margin: 0,
    fontSize: '0.85rem',
  },
  toggleBtn: {
    border: 'none',
    outline: 'none',
    padding: '8px 18px',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    appearance: 'none',
    WebkitAppearance: 'none',
    minWidth: '95px',
    textAlign: 'center',
  },
  saveBtn: {
    border: 'none',
    outline: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s ease',
    width: '100%',
  },
};

export default AdminDashboard;