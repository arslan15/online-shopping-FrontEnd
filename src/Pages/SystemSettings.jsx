import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

 const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SystemSettings = () => {
    
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    userRegistration: true,
    sessionTimeout: 60,
    userLogin:true
    
  });

  // 2. Added missing loading state
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const fetchSettings = async () => {
      try {
       
        const response = await axios.get(`${BASE_URL}/settings`);

        if (response.data) {
          setSettings({
            maintenanceMode: response.data.maintenanceMode ?? false,
            userRegistration: response.data.userRegistration ?? true,
            sessionTimeout: response.data.sessionTimeout ?? 60,
            userLogin :response.data.userLogin ?? true
          });
        }
      } catch (error) {
        console.error('FETCH SETTINGS ERROR:', error);
        toast.info('Using default system settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);
    

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 3. Updated input handler to preserve numbers for sessionTimeout
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${BASE_URL}/settings`, settings);
      toast.success(response.data.message || 'System settings saved successfully!');
    } catch (error) {
      console.error('SAVE SETTINGS ERROR:', error);
      toast.error(error.response?.data?.message || 'Failed to save system settings.');
    }
  };

  if (loading) {
    return <div style={{ color: '#ffffff', textAlign: 'center' }}>Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSave} style={styles.settingsForm}>
     

      {/* Session Duration */}
      <div style={styles.settingGroup}>
        <label style={styles.label}>Session Timeout (Minutes)</label>
        <input
          type="number"
          name="sessionTimeout"
          value={settings.sessionTimeout}
          onChange={handleChange}
          style={styles.input}
          min="1"
          required
        />
      </div>

      {/* Toggles */}
      <div style={styles.toggleRow}>
        <div>
          <strong style={{ color: '#ffffff' }}>Maintenance Mode</strong>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
            Disable access for non-admin users.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleToggle('maintenanceMode')}
          style={{
            ...styles.toggleBtn,
            backgroundColor: settings.maintenanceMode ? '#16a34a' : '#475569',
          }}
        >
          {settings.maintenanceMode ? 'ENABLED' : 'DISABLED'}
        </button>
      </div>

      <div style={styles.toggleRow}>
        <div>
          <strong style={{ color: '#ffffff' }}>User Registration</strong>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
            Allow new users to create accounts via /register.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleToggle('userRegistration')}
          style={{
            ...styles.toggleBtn,
            backgroundColor: settings.userRegistration ? '#16a34a' : '#475569',
          }}
        >
          {settings.userRegistration ? 'ENABLED' : 'DISABLED'}
        </button>
      </div>
      <div style={styles.toggleRow}>
        <div>
          <strong style={{ color: '#ffffff' }}>User Login</strong>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
            Allow new users to create accounts via /register.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleToggle('userLogin')}
          style={{
            ...styles.toggleBtn,
            backgroundColor: settings.userLogin ? '#16a34a' : '#475569',
          }}
        >
          {settings.userLogin ? 'ENABLED' : 'DISABLED'}
        </button>
      </div>

      <button type="submit" style={styles.saveBtn}>
        Save Settings
      </button>
    </form>
  );
};

const styles = {
  settingsForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left',
  },
  settingGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: '#38bdf8',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontSize: '0.95rem',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  toggleBtn: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: '6px',
    color: '#ffffff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  saveBtn: {
    padding: '12px',
    backgroundColor: '#6b21a8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default SystemSettings;