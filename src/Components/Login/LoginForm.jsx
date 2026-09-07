import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginForm({ users = [], setUsers, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const firstInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- ACTION: SIGN IN ---
        const response = await axios.post(BASE_URL + '/login', {
          email: formData.email,
          password: formData.password,
        });
        const { token, ...user } = response.data.user;

        if (!user) {
          toast.error("Invalid email or password");
          return;
        }

        if (!user.isActive) {
          toast.error("Your account is currently inactive.");
          return;
        }
        localStorage.setItem('token', token);
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
      } else {
        // --- ACTION: SIGN UP ---
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords don't match!");
          return;
        }

        const newUser = {
          id: Date.now(),
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: 'User',
          isActive: false,
        };

        if (setUsers) {
          setUsers([...users, newUser]);
        }
        const response = await axios.post(`${BASE_URL}/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: 'User',
          isActive: false,
        });

        toast.success(response.data.message || 'Account created successfully!');
        setIsLogin(true);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403) {
          toast.info(error.response.data.message);
        } else {
          toast.error(error.response.data.message || 'Registration failed.');
        }
      } else {
        toast.error('Network error. Server unreachable.');
      }
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.card}>
          {/* Header Section */}
          <div style={styles.headerGroup}>
            <h2 style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p style={styles.subtitle}>
              {isLogin
                ? 'Please enter your credentials to access your account'
                : 'Fill in your details below to get started'}
            </p>
          </div>

          {/* Full Name (Sign Up only) */}
          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                ref={firstInputRef}
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          )}

          {/* Email Address */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              ref={isLogin ? firstInputRef : null}
              type="email"
              name="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* Password Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ ...styles.input, paddingRight: '42px' }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </span>
            </div>
          </div>

          {/* Confirm Password Field */}
          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ ...styles.input, paddingRight: '42px' }}
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>

          {/* Form Toggle Link */}
          <p style={styles.toggleText}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span style={styles.toggleLink} onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#0a0d18',
    backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(124, 58, 237, 0.15), transparent 60%)',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  form: {
    width: '100%',
    maxWidth: '430px',
  },
  card: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '2.25rem 2rem',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(124, 58, 237, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  headerGroup: {
    textAlign: 'center',
    marginBottom: '6px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 6px 0',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.4',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    color: '#cbd5e1',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    fontSize: '0.925rem',
    borderRadius: '10px',
    border: '1px solid #334155',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  eyeIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  button: {
    padding: '12px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.975rem',
    fontWeight: '600',
    marginTop: '6px',
    boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  toggleText: {
    marginTop: '10px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.875rem',
    margin: 0,
  },
  toggleLink: {
    color: '#38bdf8',
    cursor: 'pointer',
    fontWeight: '600',
    marginLeft: '4px',
  },
};