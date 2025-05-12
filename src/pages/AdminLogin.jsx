import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setCredentials } from '../features/auth/authSlice';
import { FiLogIn, FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiDownload, FiSettings, FiCheckCircle } from 'react-icons/fi';
import './AdminLogin.css';
const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();


    // Add this to your existing AdminLogin component's handleSubmit:
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const validEmail = 'admin@admin.com';
            const validPassword = 'admin123';

            if (email === validEmail && password === validPassword) {
                const authData = {
                    user: {
                        email: validEmail,
                        // name: 'Admin User'
                    },
                    token: 'admin-jwt-token',
                    role: 'admin'
                };

                dispatch(setCredentials(authData));
                const from = location.state?.from?.pathname || '/admin/foot-exam';
                navigate(from, { replace: true });
            } else {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="login-container">
            {/* Left Side - Information Panel */}
            <div className="info-panel">
                <div className="info-content">
                    <div className="logo">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L20 9v6l-8 4-8-4V9l8-4.2zM12 15a3 3 0 110-6 3 3 0 010 6z" />
                        </svg>
                        <h1>RSSDI Save the Feet 2.0 </h1>
                        <p className="admin-subtitle"> [ Admin Login ]</p>
                    </div>

                    <div className="features">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiUser />
                            </div>
                            <div>
                                <h3>Doctor Management</h3>
                                <p>Onboard, update, and manage doctor profiles seamlessly</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiDownload />
                            </div>
                            <div>
                                <h3>Download Reports</h3>
                                <p>Export doctor data and reports with one click</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiSettings />
                            </div>
                            <div>
                                <h3>Profile Management</h3>
                                <p>Control admin settings and manage your own profile securely</p>
                            </div>
                        </div>
                    </div>

                    



                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-panel">
                <div className="login-card">
                    <h2>Admin Portal Login</h2>
                    <p>Sign in to access the management dashboard</p>

                    {error && (
                        <div className="error-message">
                            <div className="error-icon">!</div>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@admin.com"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {/* <div className="form-options">
                            <a href="/forgot-password" className="forgot-password">
                                Forgot password?
                            </a>
                        </div> */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading}

                        >
                            {isLoading ? (
                                <span className="spinner"></span>
                            ) : (
                                <>
                                    <FiLogIn className="button-icon" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Need help? <a href="/support">Contact our support team</a></p>
                        <p className="version">v2.4.1</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
