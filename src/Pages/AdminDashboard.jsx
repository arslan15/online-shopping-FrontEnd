import React, { useState, useEffect, useTransition } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
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

  const handleTabChange = (tabName) => {
    startTransition(() => {
      setActiveTab(tabName);
    });
  };

  // 1. Fetch Users
  useEffect(() => {
    if (activeTab !== 'users') return;
    const token = localStorage.getItem('token');
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/all`, {
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
        const response = await axios.get(`${BASE_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token?.replace(/"/g, '')}`,
          },
        });
        setCategoriesList(response.data);
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
        const response = await axios.get(`${BASE_URL}/Products`, {
          headers: {
            Authorization: `Bearer ${token?.replace(/"/g, '')}`,
          },
        });
        setProductsList(response.data);
      } catch (error) {
        toast.error('Failed to fetch products');
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

        const res = await axios.get(`${BASE_URL}/orders`, {
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

  const regularUsers = usersList.filter((user) => user.role !== 'Admin');

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
            <AnnouncementBar  orders={orders}/>
            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem', fontWeight: '600' }}>Order Approval Management</h3>
            {orders.length === 0 ? (
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
                    {orders.map((order) => {
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
          </div>
        )}

        {/* --- VIEW 3: USERS TABLE --- */}
        {activeTab === 'users' && (
          <div style={styles.tableContainer}>
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
                  {regularUsers.length > 0 ? (
                    regularUsers.map((user) => (
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
                  <select name="categoryType" value={formData.categoryType || ''} onChange={handleChange} required style={styleCategory.input}>
                    <option value="">Select a Category Type</option>
                   {categoriesList.map((cat, index) => (
                      <option key={cat._id || index} value={cat.categoryType}>
                        {cat.categoryType}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styleCategory.inputGroup}>
                  <label style={styleCategory.label}>Category Description</label>
                  <input type="text" name="Description" placeholder="Description" value={formData.Description} onChange={handleChange} required style={styles.input} />
                </div>
                <button type="submit" style={{ ...styles.button, cursor: 'pointer' }}>Add Category</button>
              </fieldset>
            </form>

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
                    {categoriesList.length > 0 ? (
                      categoriesList.map((cat, index) => (
                        <tr key={cat._id || index} style={styles.tr}>
                          <td style={styles.td}>{index + 1}</td>
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
                    {categoriesList.map((cat, index) => (
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

            {loading ? (
              <p style={{ color: '#cbd5e1' }}>Loading products...</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Product Name</th>
                      <th style={styles.th}>Product Description</th>
                      <th style={styles.th}>Category Type</th>
                      <th style={styles.th}>Quantity</th>
                      <th style={styles.th}>Image Url</th>
                      <th style={styles.th}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.length > 0 ? (
                      productsList.map((prod, index) => (
                        <tr key={prod._id || index} style={styles.tr}>
                          <td style={styles.td}>{index + 1}</td>
                          <td style={styles.td}>{prod.productName}</td>
                          <td style={styles.td}>{prod.ProductDescription}</td>
                          <td style={styles.td}>{prod.productCategoryType}</td>
                          <td style={styles.td}>{prod.ProductQty}</td>
                          <td style={styles.td}>{prod.ImageUrl}</td>
                          <td style={styles.td}>{prod.price}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ ...styles.td, textAlign: 'center' }}>No Products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 6: SYSTEM SETTINGS --- */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} style={styles.settingsForm}>
            <div style={styles.toggleRow}>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ color: '#ffffff' }}>Maintenance Mode</strong>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
                  Prevent non-admin users from accessing the application.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSettingToggle('maintenanceMode')}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: settings.maintenanceMode ? '#16a34a' : '#475569',
                }}
              >
                {settings.maintenanceMode ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div style={styles.toggleRow}>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ color: '#ffffff' }}>Allow User Registration</strong>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
                  Allow new users to register accounts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSettingToggle('userRegistration')}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: settings.userRegistration ? '#16a34a' : '#475569',
                }}
              >
                {settings.userRegistration ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div style={styles.toggleRow}>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ color: '#ffffff' }}>Allow User Login</strong>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
                  Allow Existing users to Login account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSettingToggle('userLogin')}
                style={{
                  ...styles.toggleBtn,
                  backgroundColor: settings.userLogin ? '#16a34a' : '#475569',
                }}
              >
                {settings.userLogin ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <button type="submit" style={{ ...styles.button, width: '100%', marginTop: '20px', cursor: 'pointer' }}>
              Save Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// Inline Styles Object
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    padding: '30px',
    color: '#f8fafc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  badge: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    padding: '4px 12px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.75rem',
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#38bdf8',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  heading: { margin: '0 0 8px 0', fontSize: '1.75rem' },
  subtext: { color: '#94a3b8', marginBottom: '24px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
    textAlign: 'left',
  },
  infoBox: {
    backgroundColor: '#334155',
    padding: '16px',
    borderRadius: '8px',
  },
  boxTitle: { margin: '0 0 8px 0', color: '#38bdf8' },
  boxDesc: { margin: 0, fontSize: '0.85rem', color: '#cbd5e1' },
  tableContainer: { overflowX: 'auto', marginTop: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { backgroundColor: '#334155', padding: '12px', color: '#f8fafc', fontSize: '0.85rem' },
  tr: { borderBottom: '1px solid #334155' },
  td: { padding: '12px', fontSize: '0.85rem' },
  roleBadge: { backgroundColor: '#475569', padding: '2px 8px', borderRadius: '4px' },
  statusBadge: { padding: '2px 8px', borderRadius: '4px', color: '#fff', fontSize: '0.75rem' },
  actionBtn: { border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#fff',
    boxSizing: 'border-box',
  },
  button: {
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    fontWeight: '600',
  },
  settingsForm: {
    maxWidth: '650px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#334155',
    padding: '16px',
    borderRadius: '8px',
  },
  toggleBtn: {
    border: 'none',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    minWidth: '100px',
  },
};

const styleCategory = {
  form: { marginBottom: '20px', textAlign: 'left' },
  fieldset: { border: '1px solid #475569', padding: '16px', borderRadius: '8px' },
  legend: { color: '#38bdf8', fontWeight: 'bold' },
  inputGroup: { marginBottom: '12px' },
  label: { display: 'block', marginBottom: '4px', color: '#cbd5e1', fontSize: '0.85rem' },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#fff',
    boxSizing: 'border-box',
  },
};

const styleProduct = { ...styleCategory };

export default AdminDashboard;