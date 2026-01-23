// src/components/Header/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserProfileDropdown from '../UserProfileDropdown';
import './Header.css';

// Import your logo image - make sure to create this file path
import logo from '../../assets/images/smartliblogo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Function to get the correct dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/login';

    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'librarian': return '/librarian/dashboard';
      case 'student': return '/student/dashboard';
      default: return '/';
    }
  };

  // Function to get dashboard label based on user role
  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';

    switch (user.role) {
      case 'admin': return 'Admin Dashboard';
      case 'librarian': return 'Library Dashboard';
      case 'student': return 'My Dashboard';
      default: return 'Dashboard';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleDashboardClick = () => {
    navigate(getDashboardLink());
    setIsMenuOpen(false);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    // If user is logged in, go to their dashboard, otherwise go home
    if (user) {
      navigate(getDashboardLink());
    } else {
      navigate('/');
    }
  };

  // Don't show header on dashboard and profile pages
  if (location.pathname.includes('/dashboard') || location.pathname.includes('/profile')) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-container container">
        <a href="#" className="logo" onClick={handleLogoClick}>
          {/* Custom Logo Image */}
          <img
            src={logo}
            alt="SmartLib Digital Library System"
            className="logo-image"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'logo-fallback';
              fallback.textContent = '📚';
              e.target.parentNode.insertBefore(fallback, e.target);
            }}
          />
          <span className="logo-text">SmartLib</span>
          <span className="logo-subtitle">Government Edition</span>
        </a>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-house-door-fill" viewBox="0 0 16 16">
              <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5" />
            </svg>
          </Link>

          {user ? (
            <>
              {/* Dashboard Link - Dynamic based on role */}
              <button
                className={`nav-link ${location.pathname.includes('dashboard') ? 'active' : ''}`}
                onClick={handleDashboardClick}
              >
                {getDashboardLabel()}
              </button>

              <UserProfileDropdown />
            </>
          ) : (
            <Link
              to="/login"
              className="nav-link login-btn"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-door-open-fill" viewBox="0 0 16 16">
                <path d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15zM11 2h.5a.5.5 0 0 1 .5.5V15h-1zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1" />
              </svg>
            </Link>
          )}
        </nav>

        {/* Mobile menu button - only show user info if logged in */}
        <div className="mobile-header-right">
          {user && (
            <div className="mobile-user-info">
              <span className="user-role-badge">{user.role.charAt(0).toUpperCase()}</span>
              <span className="user-name-mobile">{user.name.split(' ')[0]}</span>
            </div>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;