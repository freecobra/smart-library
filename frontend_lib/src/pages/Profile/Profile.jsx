import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../utils/api';
import UserProfileDropdown from '../../components/UserProfileDropdown';
import './Profile.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('account');
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        department: ''
    });
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        borrowingReminders: true,
        newBooksAlerts: false,
        weeklyDigest: true
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                department: user.department || ''
            });
        }
    }, [user]);

    const getProfileImageUrl = (profilePicture) => {
        if (!profilePicture) return null;
        if (profilePicture.startsWith('http')) return profilePicture;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const baseUrl = apiUrl.split('/api')[0];

        // Ensure accurate path (no double slashes, starts with /)
        const cleanPath = profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`;
        return `${baseUrl}${cleanPath}?t=${new Date().getTime()}`;
    };

    // Robust debug info collection in useEffect to avoid render loops
    useEffect(() => {
        if (user?.profilePicture) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const baseUrl = apiUrl.split('/api')[0];
            const cleanPath = user.profilePicture.startsWith('/') ? user.profilePicture : `/${user.profilePicture}`;
            const finalUrl = `${baseUrl}${cleanPath}`;

            setDebugInfo({
                rawPath: user.profilePicture,
                baseUrl: baseUrl,
                finalUrl: finalUrl,
                timestamp: new Date().toISOString()
            });

            console.log('🖼️ Profile Image Debug:', { rawPath: user.profilePicture, finalUrl });
        } else {
            setDebugInfo(null);
        }
    }, [user?.profilePicture]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await profileAPI.updateProfile(formData);
            updateUser(response.user);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            setTimeout(() => setError(''), 5000);
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            setTimeout(() => setError(''), 5000);
            return;
        }

        setError('');
        setSuccess('');
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const response = await profileAPI.uploadProfilePicture(formData);
            console.log('Upload response:', response);

            // Reset image error state
            setImageError(false);
            setImageLoading(true);

            updateUser(response.user);
            setSuccess('Profile picture updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.error || 'Failed to upload image');
            setTimeout(() => setError(''), 5000);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!window.confirm('Are you sure you want to delete your profile picture?')) {
            return;
        }

        setError('');
        setSuccess('');
        setUploading(true);

        try {
            const response = await profileAPI.deleteProfilePicture();
            updateUser(response.user);
            setSuccess('Profile picture deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete image');
            setTimeout(() => setError(''), 5000);
        } finally {
            setUploading(false);
        }
    };

    const handlePreferenceToggle = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        // In a real app, you would save this to the backend
        setSuccess('Preferences updated!');
        setTimeout(() => setSuccess(''), 2000);
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

    const renderAccountSettings = () => (
        <div className="profile-card">
            <h2>Account Information</h2>
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="disabled-input"
                    />
                    <p className="help-text">Email cannot be changed</p>
                </div>

                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <input
                        type="text"
                        id="role"
                        value={user?.role || ''}
                        disabled
                        className="disabled-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                    />
                </div>

                {user?.studentId && (
                    <div className="form-group">
                        <label htmlFor="studentId">Student ID</label>
                        <input
                            type="text"
                            id="studentId"
                            value={user.studentId}
                            disabled
                            className="disabled-input"
                        />
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderProfilePicture = () => (
        <div className="profile-card">
            <h2>Profile Photo</h2>

            {/* Minimal Debug Info - only show if error exists */}
            {imageError && debugInfo && (
                <div className="debug-box">
                    <p><strong>System Diagnosis:</strong> The server at <code>{debugInfo.baseUrl}</code> exists, but the image file could not be rendered.</p>
                    <p><strong>Possible causes:</strong></p>
                    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                        <li>Backend server is not running (check your terminal)</li>
                        <li>Browser security is blocking the cross-origin image (try a Hard Reload: Ctrl+Shift+R)</li>
                        <li>The file was deleted from the server</li>
                    </ul>
                    <p style={{ marginTop: '0.5rem' }}>Direct path: <a href={debugInfo.finalUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{debugInfo.finalUrl}</a></p>
                </div>
            )}

            <div className="profile-picture-section">
                <div className="profile-picture-preview">
                    {user?.profilePicture && !imageError ? (
                        <>
                            {imageLoading && (
                                <div className="profile-picture-placeholder">
                                    <span>Loading...</span>
                                </div>
                            )}
                            <img
                                src={getProfileImageUrl(user.profilePicture)}
                                alt="Profile"
                                onLoad={() => {
                                    setImageLoading(false);
                                    setImageError(false);
                                }}
                                onError={(e) => {
                                    console.error('Failed to load profile image:', e.target.src);
                                    setImageError(true);
                                    setImageLoading(false);
                                }}
                                style={{ display: imageLoading ? 'none' : 'block' }}
                            />
                        </>
                    ) : (
                        <div className="profile-picture-placeholder">
                            {getInitials(user?.name)}
                        </div>
                    )}
                </div>

                <div className="profile-picture-actions">
                    {imageError && user?.profilePicture && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid link#fecaca',
                            borderRadius: '6px',
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                            color: '#dc2626'
                        }}>
                            ⚠️ Image failed to load. Check the debug info above and click the URL to test directly.
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleUploadImage}
                        style={{ display: 'none' }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload New Photo'}
                    </button>
                    {user?.profilePicture && (
                        <button
                            className="btn btn-danger-outline"
                            onClick={handleDeleteImage}
                            disabled={uploading}
                        >
                            Delete Photo
                        </button>
                    )}
                    <p className="help-text">
                        JPG, PNG or GIF. Max size 5MB. Image will be uploaded immediately upon selection.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderPreferences = () => (
        <div className="profile-card">
            <h2>Notification Preferences</h2>
            <div className="profile-form" style={{ gap: '1rem' }}>
                <div className="preference-item">
                    <div className="preference-info">
                        <h4>Email Notifications</h4>
                        <p>Receive email updates about your account activity</p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={() => handlePreferenceToggle('emailNotifications')}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="preference-item">
                    <div className="preference-info">
                        <h4>Borrowing Reminders</h4>
                        <p>Get reminded about due dates for borrowed books</p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={preferences.borrowingReminders}
                            onChange={() => handlePreferenceToggle('borrowingReminders')}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="preference-item">
                    <div className="preference-info">
                        <h4>New Books Alerts</h4>
                        <p>Be notified when new books are added to the library</p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={preferences.newBooksAlerts}
                            onChange={() => handlePreferenceToggle('newBooksAlerts')}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="preference-item">
                    <div className="preference-info">
                        <h4>Weekly Digest</h4>
                        <p>Receive a weekly summary of library activities</p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={preferences.weeklyDigest}
                            onChange={() => handlePreferenceToggle('weeklyDigest')}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="header-title-row">
                        <div className="title-section">
                            <h1>My Profile</h1>
                            <p>Manage your account settings and preferences</p>
                        </div>
                        <div className="header-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    const role = user?.role?.toLowerCase();
                                    navigate(`/${role}/dashboard`);
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '8px' }}>
                                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Back to Dashboard
                            </button>
                            <UserProfileDropdown />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                        </svg>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                        {success}
                    </div>
                )}

                <div className="settings-tabs">
                    <button
                        className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
                        onClick={() => setActiveTab('account')}
                    >
                        Account
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'picture' ? 'active' : ''}`}
                        onClick={() => setActiveTab('picture')}
                    >
                        Picture
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
                        onClick={() => setActiveTab('preferences')}
                    >
                        Preferences
                    </button>
                </div>

                <div className="profile-content">
                    {activeTab === 'account' && renderAccountSettings()}
                    {activeTab === 'picture' && renderProfilePicture()}
                    {activeTab === 'preferences' && renderPreferences()}
                </div>
            </div>
        </div>
    );
};

export default Profile;
