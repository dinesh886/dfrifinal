import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaUserCog, FaLock, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import { useSelector } from "react-redux";  // Import useSelector to access Redux state
import "./Header.css";

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Accessing user data from Redux state
    const user = useSelector(state => state.auth.user);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Close dropdown when clicking outside 
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="admin-header">
            <div className="header-content">
                <div className="header-title">
                    {/* You can keep your header title or any other content here */}
                </div>

                <div className="header-actions">
                    <div className="profile-dropdown" ref={dropdownRef}>
                        <button
                            className={`profile-button ${isDropdownOpen ? 'active' : ''}`}
                            onClick={toggleDropdown}
                            aria-expanded={isDropdownOpen}
                            aria-label="User profile menu"
                        >
                            <div className="profile-info">
                                <FaUserCircle className="profile-icon" />
                                {/* Display user's name or email from Redux */}
                                <span className="profile-name">{user?.name || user?.email || "User"}</span>
                                <FaChevronDown className={`dropdown-arrow ${isDropdownOpen ? 'rotate' : ''}`} />
                            </div>
                        </button>

                        <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                            <div
                                className={`profile-button  ${isDropdownOpen ? 'active' : ''}`}
                                onClick={toggleDropdown}
                                aria-expanded={isDropdownOpen}
                                aria-label="User profile menu"
                            >
                                <div className="profile-info">
                                    <FaUserCircle className="profile-icon" />
                                    {/* Display user's name or email from Redux */}
                                    <span className="profile-name">{user?.name || user?.email || "User"}</span>
                                  
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <Link to="/admin/profile" className="dropdown-item">
                                <FaUserCog className="dropdown-icon" />
                                <span>My Profile</span>
                            </Link>
                            <Link to="/admin/change-password" className="dropdown-item">
                                <FaLock className="dropdown-icon" />
                                <span>Change Password</span>
                            </Link>
                            <div className="dropdown-divider"></div>
                            <Link to="/admin" className="dropdown-item logout">
                                <FaSignOutAlt className="dropdown-icon" />
                                <span>Logout</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
