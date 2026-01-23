// src/pages/Librarian/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { librarianAPI } from '../../utils/librarianAPI';
import { borrowingAPI } from '../../utils/api';
import UserProfileDropdown from '../../components/UserProfileDropdown';
import './LibrarianDashboard.css';

const LibrarianDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, books, students, staff
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
    totalMembers: 0,
    activeMembers: 0,
    pendingRequests: 0,
    revenue: 0
  });

  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsData = await librarianAPI.getStats();
      const booksData = await librarianAPI.getBooks({ limit: 50 });
      const membersData = await librarianAPI.getMembers({ limit: 50 });
      const requestsData = await borrowingAPI.getAll({ status: 'PENDING' });
      const activityData = await librarianAPI.getRecentActivity();

      setStats({
        ...statsData,
        pendingRequests: requestsData.pagination?.total || requestsData.borrowRecords?.length || 0,
        revenue: 0
      });

      setBooks(booksData.books || []);
      setMembers(membersData.users || []);
      setBorrowRequests(requestsData.borrowRecords || []);
      setRecentActivity(activityData.activities || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(`Failed to load dashboard data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveRequest = async (requestId) => {
    try {
      if (!window.confirm('Are you sure you want to approve this request?')) return;
      await librarianAPI.processRequest(requestId, 'BORROWED');
      await fetchDashboardData();
      alert('Request approved successfully!');
    } catch (err) {
      console.error('Error approving request:', err);
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      if (!window.confirm('Are you sure you want to reject this request?')) return;
      await librarianAPI.processRequest(requestId, 'REJECTED');
      await fetchDashboardData();
      alert('Request rejected successfully!');
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert(err.message || 'Failed to reject request');
    }
  };

  // Render different views based on activeView
  const renderContent = () => {
    switch (activeView) {
      case 'books':
        return renderBooksView();
      case 'students':
        return renderStudentsView();
      case 'staff':
        return renderStaffView();
      default:
        return renderDashboardView();
    }
  };

  const renderDashboardView = () => (
    <>
      {/* Stats Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="bi bi-plus-square"></i>
          </div>
          <div className="stat-details">
            <h3>New Books Added</h3>
            <div className="stat-value">{stats.totalBooks}</div>
            <div className="stat-subtext">{stats.totalBooks} new books added in library</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="bi bi-exclamation-triangle"></i>
          </div>
          <div className="stat-details">
            <h3>Lost Books</h3>
            <div className="stat-value">{stats.overdueBooks}</div>
            <div className="stat-subtext">{stats.overdueBooks} books are not in library</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="bi bi-arrow-up-circle"></i>
          </div>
          <div className="stat-details">
            <h3>Borrowed Books</h3>
            <div className="stat-value">{stats.borrowedBooks}</div>
            <div className="stat-subtext">{stats.borrowedBooks} books borrowed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="stat-details">
            <h3>Available Books</h3>
            <div className="stat-value">{stats.availableBooks}</div>
            <div className="stat-subtext">{stats.availableBooks} books are available to borrow</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dashboard-content">
        {/* Notifications */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><i className="bi bi-bell"></i> Notifications</h2>
            <div className="card-tabs">
              <button
                className={`card-tab ${activeTab === 'today' ? 'active' : ''}`}
                onClick={() => setActiveTab('today')}
              >
                Today
              </button>
              <button
                className={`card-tab ${activeTab === 'week' ? 'active' : ''}`}
                onClick={() => setActiveTab('week')}
              >
                This Week
              </button>
              <button
                className={`card-tab ${activeTab === 'month' ? 'active' : ''}`}
                onClick={() => setActiveTab('month')}
              >
                This Month
              </button>
            </div>
          </div>
          <div className="card-body">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="notification-item">
                  <div className="notification-content">
                    <p className="notification-text">{activity.details || activity.action}</p>
                    <div className="notification-time">
                      <i className="bi bi-clock"></i> {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center' }}>
                <i className="bi bi-inbox"></i> No recent notifications
              </p>
            )}
          </div>
        </div>

        {/* Total Books Report */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><i className="bi bi-bar-chart"></i> Total Books Report</h2>
            <select className="date-selector">
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <div className="chart-visual">
                <div className="chart-center">
                  <div className="chart-center-value">{stats.totalBooks}</div>
                  <div className="chart-center-label">Weekly Books</div>
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-value">44.4%</div>
                  <div className="legend-label">
                    <span className="legend-dot green"></span>
                    New
                  </div>
                </div>
                <div className="legend-item">
                  <div className="legend-value">33.3%</div>
                  <div className="legend-label">
                    <span className="legend-dot blue"></span>
                    Issued
                  </div>
                </div>
                <div className="legend-item">
                  <div className="legend-value">11.1%</div>
                  <div className="legend-label">
                    <span className="legend-dot purple"></span>
                    Lost
                  </div>
                </div>
                <div className="legend-item">
                  <div className="legend-value">11.1%</div>
                  <div className="legend-label">
                    <span className="legend-dot orange"></span>
                    Returned
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-content">
        {/* Activity */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><i className="bi bi-activity"></i> Recent Activity</h2>
          </div>
          <div className="card-body">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="notification-item">
                  <div className="notification-content">
                    <p className="notification-text">
                      <i className="bi bi-person-circle"></i> <strong>{activity.user?.name || 'User'}</strong> {activity.action}
                    </p>
                    <div className="notification-time">
                      <i className="bi bi-clock"></i> {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center' }}>
                <i className="bi bi-activity"></i> No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Orders / Requests */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><i className="bi bi-journal-text"></i> Pending Requests</h2>
          </div>
          <div className="card-body">
            {borrowRequests.length > 0 ? (
              borrowRequests.slice(0, 3).map((request) => (
                <div key={request.id} className={`order-item ${request.status === 'PENDING' ? 'warning' : 'success'}`}>
                  <div className="order-header">
                    <span className="order-id">
                      <i className="bi bi-hash"></i> #{request.id.substring(0, 8)}
                    </span>
                    <span className="order-time">
                      <i className="bi bi-calendar"></i> {new Date(request.borrowDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="order-description">
                    <i className="bi bi-person"></i> {request.user?.name} requested "{request.book?.title}"
                  </p>
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      className="btn btn-success btn-sm"
                    >
                      <i className="bi bi-check-lg"></i> Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="btn btn-danger btn-sm"
                    >
                      <i className="bi bi-x-lg"></i> Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center' }}>
                <i className="bi bi-check-circle"></i> No pending requests
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderBooksView = () => (
    <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
      <div className="card-header">
        <h2><i className="bi bi-bookshelf"></i> Books Management</h2>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {books.map((book) => (
            <div key={book.id} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                <i className="bi bi-book"></i> {book.title}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                <i className="bi bi-person"></i> {book.author}
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '0' }}>
                <i className="bi bi-box"></i> Available: {book.availableQuantity}/{book.quantity}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudentsView = () => (
    <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
      <div className="card-header">
        <h2><i className="bi bi-people"></i> Students Management</h2>
      </div>
      <div className="card-body">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                <i className="bi bi-person"></i> Name
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                <i className="bi bi-envelope"></i> Email
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                <i className="bi bi-card-text"></i> Student ID
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                <i className="bi bi-building"></i> Department
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                <i className="bi bi-circle-fill"></i> Status
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{member.name}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>{member.email}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>{member.studentId || 'N/A'}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>{member.department || 'N/A'}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: member.isActive ? '#d1fae5' : '#fee2e2',
                    color: member.isActive ? '#065f46' : '#991b1b'
                  }}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStaffView = () => (
    <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
      <div className="card-header">
        <h2><i className="bi bi-person-badge"></i> Staff Management</h2>
      </div>
      <div className="card-body">
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
          <i className="bi bi-clock-history" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
          Staff management features coming soon...
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="librarian-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p><i className="bi bi-hourglass-split"></i> Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="librarian-dashboard">
        <div className="error-state">
          <p className="error-message">
            <i className="bi bi-exclamation-triangle-fill"></i> {error}
          </p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            <i className="bi bi-arrow-clockwise"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="librarian-dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <i className="bi bi-book"></i> <span>Libro</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <i className="bi bi-speedometer2"></i> Dashboard
          </button>
          <button
            className={`sidebar-nav-item ${activeView === 'books' ? 'active' : ''}`}
            onClick={() => setActiveView('books')}
          >
            <i className="bi bi-book"></i> Books
          </button>
          <button
            className={`sidebar-nav-item ${activeView === 'students' ? 'active' : ''}`}
            onClick={() => setActiveView('students')}
          >
            <i className="bi bi-people"></i> Students
          </button>
          <button
            className={`sidebar-nav-item ${activeView === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveView('staff')}
          >
            <i className="bi bi-person-badge"></i> Staff
          </button>
        </nav>


      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>
              {activeView === 'dashboard' && <i className="bi bi-speedometer2"></i>}
              {activeView === 'books' && <i className="bi bi-book"></i>}
              {activeView === 'students' && <i className="bi bi-people"></i>}
              {activeView === 'staff' && <i className="bi bi-person-badge"></i>}
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </h1>
            <div className="breadcrumb">
              <i className="bi bi-house"></i> Home / {activeView}
            </div>
          </div>
          <div className="header-actions">
            <select className="date-selector">
              <option><i className="bi bi-calendar-day"></i> Today</option>
              <option><i className="bi bi-calendar-week"></i> This Week</option>
              <option><i className="bi bi-calendar-month"></i> This Month</option>
            </select>
            <UserProfileDropdown />
          </div>
        </div>

        {/* Render active view */}
        {renderContent()}
      </main>
    </div>
  );
};

export default LibrarianDashboard;