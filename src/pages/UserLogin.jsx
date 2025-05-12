import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { setCredentials } from '../features/auth/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { FiMail, FiLock, FiArrowRight, FiLogIn, FiUser, FiCalendar, FiClipboard, FiEye, FiDownload, FiUpload, FiFileText } from 'react-icons/fi';
import './UserLogin.css'; // You'll need to create this CSS file
import doctor from '../assets/images/undraw_doctors_djoj.svg'
const UserLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();


    // Add this useEffect to check if user is already logged in
    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem('userLoggedIn');
        if (isLoggedIn) {
            // If already logged in, redirect to main page immediately
            navigate('/user/rssdi-save-the-feet-2.0', { replace: true });
        }
    }, [navigate]);


    const handleSubmit = (e) => {
        e.preventDefault();

        const validEmail = 'user@user.com';
        const validPassword = 'user123';

        if (email === validEmail && password === validPassword) {
            const userInfo = {
                email: validEmail,
                name: "Doctor User",
                role: "doctor"
            };

            // Store complete user info in sessionStorage
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            sessionStorage.setItem('userLoggedIn', 'true');

            dispatch(setCredentials({
                user: userInfo,
                token: 'fake-jwt-token',
                role: 'user',
            }));

            navigate('/user/rssdi-save-the-feet-2.0');
        } else {
            setError('Invalid email or password');
        }
    };
    const handleGoogleSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const userInfo = {
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                role: "doctor"
            };

            // Store user info in sessionStorage
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            sessionStorage.setItem('userLoggedIn', 'true');

            dispatch(setCredentials({
                user: userInfo,
                token: credentialResponse.credential,
                role: 'user',
            }));

            const isNewUser = !localStorage.getItem(`user_${decoded.email}_registered`);
            const redirectPath = isNewUser
                ? '/user/signup'
                : '/user/rssdi-save-the-feet-2.0';

            navigate(redirectPath, { replace: true });
        } catch (err) {
            console.error("Google login decode error:", err);
            toast.error('Google login failed. Please try again.');
        }
    };



    const handleGoogleError = () => {
        toast.error('Google login failed. Please try again.');
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
                        <h1>RSSDI Save the Feet 2.0</h1>
                        <p className="doctor-subtitle">[ Doctor Login ]</p>
                    </div>

                    <div className="features">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiUser />
                            </div>
                            <div>
                                <h3>Patient Management</h3>
                                <p>Easily add, edit, and track patient details in one place.</p>
                            </div>
                        </div>

                    

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiDownload />
                            </div>
                            <div>
                                <h3>Export to Excel</h3>
                                <p>Download your patient data for reports and analysis.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiUpload />
                            </div>
                            <div>
                                <h3>Bulk Import</h3>
                                <p>Import multiple patient records at once using Excel files.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FiFileText />
                            </div>
                            <div>
                                <h3>Sample Excel Template</h3>
                                <p>Download a ready-to-use Excel format to simplify bulk uploads.</p>
                            </div>
                        </div>
                    </div>

                   
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-panel">
                <div className="login-card">
                    <div className='doctor-login'>
                        <div className="login-text">
                            <h2>Doctor Login</h2>
                            <p>Sign in to access your patient dashboard</p>
                        </div>
                        <img src={doctor} alt="Doctor" />
                    </div>

                    

                    {error && (
                        <div className="error-message">
                            <div className="error-icon">!</div>
                            <span>{error}</span>
                        </div>
                    )}
                    <div className="google-login-container">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_blue"
                            size="large"
                            width="300"
                            shape="rectangular"
                            text="continue_with"
                        />
                    </div>

                    <div className="divider">
                        <span>or</span>
                    </div>
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
                                    placeholder="doctor@clinic.com"
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

export default UserLogin;