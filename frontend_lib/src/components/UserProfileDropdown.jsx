import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './UserProfileDropdown.css';

const UserProfileDropdown = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileClick = () => {
        setIsOpen(false);
        navigate('/profile');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getProfileImageUrl = (profilePicture) => {
        if (!profilePicture) return null;
        if (profilePicture.startsWith('http')) return profilePicture;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.split('/api')[0];

        // Ensure consistent path format
        const cleanPath = profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`;
        return `${baseUrl}${cleanPath}?t=${new Date().getTime()}`;
    };

    return (
        <div className="user-profile-dropdown" ref={dropdownRef}>
            <div
                className="profile-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="profile-avatar">
                    {user?.profilePicture ? (
                        <img
                            src={getProfileImageUrl(user.profilePicture)}
                            alt={user.name}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div
                        className="avatar-initials"
                        style={{ display: user?.profilePicture ? 'none' : 'flex' }}
                    >
                        {getInitials(user?.name)}
                    </div>
                </div>
                <div className="profile-info">
                    <div className="profile-name">{user?.name || 'User'}</div>
                    <div className="profile-role">{user?.role || 'STUDENT'}</div>
                </div>
                <svg
                    className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <div className="dropdown-user-info">
                            <div className="dropdown-name">{user?.name}</div>
                            <div className="dropdown-email">{user?.email}</div>
                        </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <button className="dropdown-item" onClick={handleProfileClick}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM8 9.5a5.5 5.5 0 00-5.5 5.5h11A5.5 5.5 0 008 9.5z" fill="currentColor" />
                        </svg>
                        <span>My Profile</span>
                    </button>

                    <div className="dropdown-divider"></div>

                    <button className="dropdown-item logout" onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfileDropdown;
