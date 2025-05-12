import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import AdminLayout from '../../layouts/AdminLayout';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiUpload, FiCheck } from 'react-icons/fi';
import {  toast } from 'react-toastify';

import './Profile.css';
import { useNavigate } from "react-router-dom";
// No other toast-related imports needed
const Profile = () => {
    const navigate = useNavigate();

    const user = useSelector(selectCurrentUser);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                ...formData,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
            setPreviewImage(user.avatar || '');
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword({
            ...showPassword,
            [field]: !showPassword[field]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success('Profile updated successfully!', {
                position: "top-right",
                autoClose: 2000,
                onClose: () => {
                    // After toast closes, clear form and redirect
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        file :'',
                        // add any other fields you have
                    });
                    navigate('/admin/foot-exam');
                },
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            toast.error('Failed to update profile. Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success('Password changed successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            // Clear password fields
            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error('Failed to change password. Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="profile-settings-container">
                <div className="profile-header">
                    <h1>Account Settings</h1>
                    <p>Manage your profile information and security settings</p>
                </div>

                <div className="settings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Information
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('security');
                            navigate('/admin/change-password');
                        }}
                    >
                        Security
                    </button>

                </div>

                <div className="settings-content">
                  
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="avatar-upload">
                                <div className="avatar-preview">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {formData.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="upload-controls">
                                <label className="action-btn sample-excel-download">
                                    <FiUpload className="btn-icon" />
                                        Upload Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            hidden
                                        />
                                    </label>
                                    <button
                                        type="button"
                                    className="remove-btn action-btn"
                                        onClick={() => setPreviewImage('')}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                        <div className="form-group form-group2">
                                <label className='pb-2 '>Full Name</label>
                                <div className="input-with-icon">
                                    <FiUser className="input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                        <div className="form-group form-group2">
                            <label className='pb-2 pt-2'>Email Address</label>
                                <div className="input-with-icon">
                                    <FiMail className="input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        required
                                        disabled
                                    />
                                </div>
                            </div>

                        <div className="form-group form-group2">
                            <label className='pb-2 pt-2'>Phone Number</label>
                                <div className="input-with-icon">
                                    <FiPhone className="input-icon" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                    />
                                </div>
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
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </form>
                   
                </div>
            </div>
            {/* <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            /> */}
        </AdminLayout>
    );
};

export default Profile;