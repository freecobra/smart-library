import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  // Don't show footer on dashboard and profile pages
  if (location.pathname.includes('/dashboard') || location.pathname.includes('/profile')) {
    return null;
  }

  return (
    <footer style={{
      background: '#1e293b',
      color: 'white',
      padding: '2rem 0 1rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        textAlign: 'center'
      }}>
        <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>
          &copy; 2025 SmartLib Government Edition. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;