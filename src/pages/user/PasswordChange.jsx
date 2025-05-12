import React, { useState, useEffect } from 'react';
import UserLayout from '../../layouts/UserLayout';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import at top
import { selectCurrentUser } from '../../features/auth/authSlice';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiUpload, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer, toast as showToast } from 'react-toastify'; // Renamed toast to showToast
import 'react-toastify/dist/ReactToastify.css';
const PasswordChange = () => {
    const navigate = useNavigate(); // Inside your component
    const user = useSelector(selectCurrentUser);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user types
        if (name === 'confirmPassword' && passwordError) {
            setPasswordError('');
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validatePassword = () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return false;
        }

        if (formData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return false;
        }

        if (!/[A-Z]/.test(formData.newPassword) || !/[0-9]/.test(formData.newPassword)) {
            setPasswordError('Password must contain at least one uppercase letter and one number');
            return false;
        }

        setPasswordError('');
        return true;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validatePassword()) {
            setIsLoading(false);
            return;
        }

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success case
            toast.success('Password changed successfully!', {
                position: "top-right",
                autoClose: 2000,
                onClose: () => {
                    navigate('/user/dashboard'); // Redirect after toast closes
                }
            });

            // Reset form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

        } catch (error) {
            toast.error('Failed to change password. Please try again.', {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <UserLayout>
            <div className="profile-settings-container  user-pwd">
                <div className="profile-header">
                    <h1>Change Password</h1>
                    <p>Update your account password</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="security-form">
                    {/* <div className="form-group form-group2">
                        <label>Current Password</label>
                        <div className="input-with-icon">
                            <FiLock className="input-icon" />
                            <input
                                type={showPassword.current ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => togglePasswordVisibility('current')}
                                aria-label={showPassword.current ? "Hide password" : "Show password"}
                            >
                                {showPassword.current ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div> */}

                    <div className="form-group form-group2">
                        <label>New Password</label>
                        <div className="input-with-icon">
                            <FiLock className="input-icon" />
                            <input
                                type={showPassword.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => togglePasswordVisibility('new')}
                                aria-label={showPassword.new ? "Hide password" : "Show password"}
                            >
                                {showPassword.new ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        <div className="password-strength">
                            <div className={`strength-bar ${formData.newPassword.length > 0 ? 'active' : ''}`}></div>
                            <div className={`strength-bar ${formData.newPassword.length >= 4 ? 'active' : ''}`}></div>
                            <div className={`strength-bar ${formData.newPassword.length >= 8 &&
                                /[A-Z]/.test(formData.newPassword) &&
                                /[0-9]/.test(formData.newPassword) ? 'active' : ''
                                }`}></div>
                        </div>
                        <p className="password-hint">
                            Password must be at least 8 characters with uppercase and number
                        </p>
                    </div>

                    <div className="form-group form-group2">
                        <label>Confirm New Password</label>
                        <div className="input-with-icon">
                            <FiLock className="input-icon" />
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                required
                                className={passwordError ? 'input-error' : ''}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => togglePasswordVisibility('confirm')}
                                aria-label={showPassword.confirm ? "Hide password" : "Show password"}
                            >
                                {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="error-message">{passwordError}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="save-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <FiCheck className="btn-icon" />
                               Set New Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </UserLayout>
    );
}

export default PasswordChange
