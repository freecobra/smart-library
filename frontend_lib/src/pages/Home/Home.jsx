// src/pages/Home/Home.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [showRegistration, setShowRegistration] = useState(false);

  const features = [
    {
      icon: 'bi-robot',
      title: 'AI-Powered Recommendations',
      description: 'Intelligent book suggestions based on your reading patterns and interests using advanced machine learning algorithms.'
    },
    {
      icon: 'bi-search-heart',
      title: 'Smart Semantic Search',
      description: 'Natural language search that understands context and meaning, not just keywords.'
    },
    {
      icon: 'bi-globe-africa',
      title: 'African Knowledge Base',
      description: 'Digitized local content and indigenous knowledge from across Africa and Rwanda.'
    },
    {
      icon: 'bi-phone',
      title: 'Multi-Platform Access',
      description: 'Access your library resources anywhere, anytime on any device with offline capabilities.'
    },
    {
      icon: 'bi-shield-lock',
      title: 'Secure Government Platform',
      description: 'Enterprise-grade security with role-based access control and comprehensive audit trails.'
    },
    {
      icon: 'bi-graph-up',
      title: 'Advanced Analytics',
      description: 'Comprehensive reporting and usage analytics for informed decision making.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Digital Resources' },
    { number: '50+', label: 'Government Institutions' },
    { number: '99.9%', label: 'System Uptime' },
    { number: '24/7', label: 'Secure Access' }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="grid-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="government-badge">
                <span><i className="bi bi-badge-ar"></i> Official Government System</span>
              </div>
              <h1 className="hero-title">
                SmartLib
                <span className="subtitle">Digital Library & Knowledge Network</span>
              </h1>
              <p className="hero-description">
                A sophisticated AI-powered library management system designed for 
                government institutions across Africa. Secure, scalable, and intelligent 
                digital resource management with advanced analytics and machine learning capabilities.
              </p>
              <div className="hero-actions">
                {!showRegistration ? (
                  <>
                    <Link to="/login" className="btn btn-primary">
                      <i className="bi bi-box-arrow-in-right"></i> Secure Sign In
                    </Link>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowRegistration(true)}
                    >
                      <i className="bi bi-key"></i> Request Access
                    </button>
                  </>
                ) : (
                  <div className="registration-prompt">
                    <p><i className="bi bi-info-circle"></i> For system access, please contact your institutional administrator or submit an access request through official channels.</p>
                    <button 
                      className="btn btn-outline"
                      onClick={() => setShowRegistration(false)}
                    >
                      <i className="bi bi-arrow-left"></i> Back to Home
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="hero-visual">
              <div className="system-preview">
                <div className="preview-window">
                  <div className="window-header">
                    <div className="window-controls">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className="window-title"><i className="bi bi-columns-gap"></i> SmartLib Dashboard</div>
                  </div>
                  <div className="window-content">
                    <div className="search-interface">
                      <div className="search-bar">
                        <div className="search-icon"><i className="bi bi-search"></i></div>
                        <div className="search-text">Search books, authors, or research topics...</div>
                      </div>
                    </div>
                    <div className="content-grid-preview">
                      <div className="grid-row">
                        <div className="grid-item"></div>
                        <div className="grid-item"></div>
                        <div className="grid-item"></div>
                      </div>
                      <div className="grid-row">
                        <div className="grid-item large"></div>
                        <div className="grid-item"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2><i className="bi bi-stars"></i> Enterprise-Grade Features</h2>
            <p>Comprehensive library management solutions for government institutions</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <i className={`bi ${feature.icon}`}></i>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="security-section">
        <div className="container">
          <div className="security-content">
            <div className="security-text">
              <h2><i className="bi bi-shield-check"></i> Government-Grade Security</h2>
              <p>
                Built with enterprise security standards including role-based access control, 
                comprehensive audit trails, data encryption, and compliance with government 
                security protocols.
              </p>
              <div className="security-features">
                <div className="security-item">
                  <span className="check"><i className="bi bi-check-circle-fill"></i></span>
                  <span>Role-Based Access Control</span>
                </div>
                <div className="security-item">
                  <span className="check"><i className="bi bi-check-circle-fill"></i></span>
                  <span>End-to-End Encryption</span>
                </div>
                <div className="security-item">
                  <span className="check"><i className="bi bi-check-circle-fill"></i></span>
                  <span>Comprehensive Audit Logs</span>
                </div>
                <div className="security-item">
                  <span className="check"><i className="bi bi-check-circle-fill"></i></span>
                  <span>GDPR & Data Protection Compliant</span>
                </div>
              </div>
            </div>
            <div className="security-visual">
              <div className="security-shield">
                <div className="shield-icon"><i className="bi bi-shield-fill-check"></i></div>
                <div className="shield-text">Secure Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2><i className="bi bi-rocket-takeoff"></i> Ready to Transform Your Library System?</h2>
            <p>Contact our government solutions team for a comprehensive demonstration and deployment consultation.</p>
            <div className="cta-actions">
              <Link to="/login" className="btn btn-primary large">
                <i className="bi bi-door-open-fill"></i> Access Existing Account
              </Link>
              <div className="contact-info">
                <p><i className="bi bi-envelope-at"></i> For new deployments: <strong>ict@government.gov.rw</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;