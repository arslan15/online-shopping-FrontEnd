import React, { useState, useEffect, useTransition, useCallback } from 'react';
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
  const [apiPagination, setApiPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

  const [settings, setSettings] = useState({
    siteName: 'My Application',
    maintenanceMode: false,
    userRegistration: true,
    userLogin: true,
  });

  // Determine active dataset based on active tab
  const getActiveList = useCallback(() => {
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
  }, [activeTab, usersList, categoriesList, productsList, orders]);

  // Fixed tab check matching state value ('product')
  const isServerPaginated = activeTab === 'product';

  const {
    currentItems: displayedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    limit,
    setLimit,
    searchTerm,
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
    ],
    initialLimit: 10,
    serverPagination: isServerPaginated ? apiPagination : null,
  });

  const handleTabChange = (tabName) => {
    startTransition(() => {
      setActiveTab(tabName);
      setCurrentPage(1);
      clearSearch();
    });
  };

  // Helper for Authorization Headers
  const getAuthHeader = () => {
    const rawToken = localStorage.getItem('token');
    const token = rawToken ? rawToken.replace(/^["']|["']$/g, '').trim() : '';
    return { Authorization: `Bearer ${token}` };
  };

  // 1. Fetch Users
  useEffect(() => {
    if (activeTab !== 'users') return;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/all?page=${currentPage}&limit=${limit}`, {
          headers: getAuthHeader(),
        });
        setUsersList(Array.isArray(response.data) ? response.data : response.data.users || []);
      } catch (error) {
        toast.error('Failed to fetch users list');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab, currentPage, limit, BASE_URL]);

  // 2. Fetch System Settings
  useEffect(() => {
    if (activeTab !== 'settings') return;

    const fetchSystemSettings = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/settings`, {
          headers: getAuthHeader(),
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
      try {
        const response = await axios.get(`${BASE_URL}/categories?page=${currentPage}&limit=${limit}`, {
          headers: getAuthHeader(),
        });
        const rawData = response.data;
        if (Array.isArray(rawData)) {
          setCategoriesList(rawData);
        } else if (rawData && Array.isArray(rawData.categories)) {
          setCategoriesList(rawData.categories);
        } else if (rawData && Array.isArray(rawData.data)) {
          setCategoriesList(rawData.data);
        } else {
          setCategoriesList([]);
        }
      } catch (error) {
        toast.error('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [activeTab, currentPage, limit, BASE_URL]);

  // 4. Fetch Products (Standalone Callback & Effect)
  const fetchProducts = useCallback(async (pageToFetch, fetchLimit) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/Products?page=${pageToFetch}&limit=${fetchLimit}&search=${encodeURIComponent(searchTerm || '')}`,
        { headers: getAuthHeader() }
      );
      
      const rawData = response.data;
      if (Array.isArray(rawData)) {
        setProductsList(rawData);
      } else if (rawData && Array.isArray(rawData.products)) {
        setProductsList(rawData.products);
      } else if (rawData && Array.isArray(rawData.data)) {
        setProductsList(rawData.data);
      } else {
        setProductsList([]);
      }

      if (rawData?.pagination) {
        setApiPagination(rawData.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
      setProductsList([]);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL,searchTerm]);

  useEffect(() => {
    if (activeTab === 'product') {
      fetchProducts(currentPage, limit);
    }
  }, [activeTab, currentPage, limit, fetchProducts]);

  // 5. Fetch Orders
  useEffect(() => {
    if (activeTab !== 'Admin Approval') return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/orders?page=${currentPage}&limit=${limit}`, {
          headers: getAuthHeader(),
        });
        if (res?.data) {
          setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, currentPage, limit, BASE_URL]);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.patch(`${BASE_URL}/${id}/toggle-active`, {}, { headers: getAuthHeader() });
      setUsersList((prev) =>
        prev.map((u) => (u.id === id || u._id === id ? { ...u, isActive: !currentStatus } : u))
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
      const response = await axios.put(`${BASE_URL}/settings`, settings, {
        headers: getAuthHeader(),
      });
      if (response.data?.settings) {
        setSettings(response.data.settings);
      }
      toast.success(response.data.message || 'System settings saved successfully!');
    } catch (error) {
      console.error('SAVE SETTINGS ERROR:', error);
      toast.error(error.response?.data?.message || 'Failed to save system settings.');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `${BASE_URL}/order/approval`,
        { orderId, status: newStatus },
        { headers: getAuthHeader() }
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
      const response = await axios.post(
        `${BASE_URL}/addCategory`,
        {
          categoryType: formData.categoryType,
          categoryDescription: formData.Description,
        },
        { headers: getAuthHeader() }
      );

      const savedCategory = response.data.category || response.data;
      if (savedCategory && savedCategory.categoryType) {
        setCategoriesList((prev) => [...prev, savedCategory]);
      } else {
        const refreshResponse = await axios.get(`${BASE_URL}/categories`, { headers: getAuthHeader() });
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
      const payload = {
        productName: formProductData.productName,
        ProductDescription: formProductData.ProductDescription,
        productCategoryType: formProductData.productCategoryType,
        ProductQty: Number(formProductData.ProductQty),
        ImageUrl: formProductData.ImageUrl,
        price: Number(formProductData.price),
      };

      const response = await axios.post(`${BASE_URL}/addProduct`, payload, {
        headers: getAuthHeader(),
      });

      const savedProduct = response.data.product || response.data;
      if (savedProduct && savedProduct.productName) {
        setProductsList((prev) => [...prev, savedProduct]);
      } else {
        fetchProducts(currentPage, limit);
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
      console.error('ADD PRODUCT ERROR:', error.response?.data || error.message);
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

  const renderPaginationBar = () => (
    <div
      className="pagination-wrapper"
      style={{
       marginTop: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  width: '100%',
  boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          gap: '8px',
          flexWrap: 'nowrap',
          width: '100%',
          justifyContent: 'center',
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
            Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
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

      <div
        className="items-per-page-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        <label htmlFor="limit-select" style={{ marginRight: '6px' }}>
          Show:
        </label>
        <select
          id="limit-select"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setCurrentPage(1);
          }}
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

  const renderSearchBar = () => (
    <div style={{ marginBottom: '15px', position: 'relative', maxWidth: '350px' }}>
      <FaSearch
        style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8',
        }}
      />
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
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
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
                    displayedItems.map((user) => {
                      const uId = user.id || user._id;
                      return (
                        <tr key={uId} style={styles.tr}>
                          <td style={styles.td}>{uId}</td>
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
                              onClick={() => handleToggleActive(uId, user.isActive)}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
                  <input
                    type="text"
                    name="Description"
                    placeholder="Description"
                    value={formData.Description}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
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
                  <input
                    type="text"
                    name="productName"
                    placeholder="Product Name"
                    value={formProductData.productName}
                    onChange={handleProductChange}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styleProduct.inputGroup}>
                  <label style={styleProduct.label}>Product Description</label>
                  <input
                    type="text"
                    name="ProductDescription"
                    placeholder="Product Description"
                    value={formProductData.ProductDescription}
                    onChange={handleProductChange}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styleProduct.inputGroup}>
                  <label style={styleProduct.label}>Product Category</label>
                  <select
                    name="productCategoryType"
                    value={formProductData.productCategoryType || ''}
                    onChange={handleProductChange}
                    required
                    style={styles.input}
                  >
                    <option value="">Select a Category Type</option>
                    {Array.isArray(categoriesList) &&
                      categoriesList.map((cat, index) => (
                        <option key={cat._id || index} value={cat.categoryType}>
                          {cat.categoryType}
                        </option>
                      ))}
                  </select>
                </div>
                <div style={styleProduct.inputGroup}>
                  <label style={styleProduct.label}>Product Qty</label>
                  <input
                    type="number"
                    name="ProductQty"
                    placeholder="Quantity"
                    value={formProductData.ProductQty}
                    onChange={handleProductChange}
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styleProduct.inputGroup}>
                  <label style={styleProduct.label}>Image URL</label>
                  <input
                    type="text"
                    name="ImageUrl"
                    placeholder="Image URL"
                    value={formProductData.ImageUrl}
                    onChange={handleProductChange}
                    style={styles.input}
                  />
                </div>
                <div style={styleProduct.inputGroup}>
                  <label style={styleProduct.label}>Price</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formProductData.price}
                    onChange={handleProductChange}
                    required
                    style={styles.input}
                  />
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
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Qty</th>
                      <th style={styles.th}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.length > 0 ? (
                      displayedItems.map((prod, index) => (
                        <tr key={prod._id || index} style={styles.tr}>
                          <td style={styles.td}>{(currentPage - 1) * limit + index + 1}</td>
                          <td style={styles.td}>{prod.productName}</td>
                          <td style={styles.td}>{prod.productCategoryType}</td>
                          <td style={styles.td}>{prod.ProductQty}</td>
                          <td style={styles.td}>Rs. {prod.price}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>No products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {renderPaginationBar()}
          </div>
        )}

        {/* --- VIEW 6: SETTINGS --- */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={styleCategory.label}>Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={() => handleSettingToggle('maintenanceMode')}
              />
              <label htmlFor="maintenanceMode" style={{ color: '#f8fafc' }}>Maintenance Mode</label>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="userRegistration"
                checked={settings.userRegistration}
                onChange={() => handleSettingToggle('userRegistration')}
              />
              <label htmlFor="userRegistration" style={{ color: '#f8fafc' }}>Allow User Registration</label>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="userLogin"
                checked={settings.userLogin}
                onChange={() => handleSettingToggle('userLogin')}
              />
              <label htmlFor="userLogin" style={{ color: '#f8fafc' }}>Allow User Login</label>
            </div>
            <button type="submit" style={{ ...styles.button, width: 'fit-content', cursor: 'pointer' }}>
              Save Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' },
  card: { backgroundColor: '#0f172a', borderRadius: '8px', padding: '24px', border: '1px solid #1e293b' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  badge: { backgroundColor: '#1e293b', color: '#38bdf8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' },
  backBtn: { backgroundColor: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.9rem' },
  heading: { fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 8px 0' },
  subtext: { color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  infoBox: { backgroundColor: '#1e293b', padding: '16px', borderRadius: '6px', border: '1px solid #334155' },
  boxTitle: { margin: '0 0 8px 0', color: '#f8fafc' },
  boxDesc: { margin: 0, fontSize: '0.85rem', color: '#94a3b8' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '10px', backgroundColor: '#1e293b', color: '#cbd5e1', fontSize: '0.85rem', borderBottom: '1px solid #334155' },
  td: { padding: '10px', borderBottom: '1px solid #334155', fontSize: '0.9rem' },
  tr: { hover: { backgroundColor: '#1e293b' } },
  roleBadge: { backgroundColor: '#334155', color: '#f8fafc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' },
  statusBadge: { padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#fff' },
  actionBtn: { border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  input: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#f8fafc', boxSizing: 'border-box' },
  button: { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold' },
};

const styleCategory = {
  form: { marginBottom: '20px' },
  fieldset: { border: '1px solid #334155', padding: '16px', borderRadius: '6px' },
  legend: { color: '#38bdf8', padding: '0 8px', fontWeight: 'bold' },
  inputGroup: { marginBottom: '12px' },
  label: { display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#cbd5e1' },
};

const styleProduct = {
  form: { marginBottom: '20px' },
  fieldset: { border: '1px solid #334155', padding: '16px', borderRadius: '6px' },
  legend: { color: '#38bdf8', padding: '0 8px', fontWeight: 'bold' },
  inputGroup: { marginBottom: '12px' },
  label: { display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#cbd5e1' },
};

export default AdminDashboard;