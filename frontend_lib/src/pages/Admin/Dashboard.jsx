import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { librarianAPI } from '../../utils/librarianAPI';
import { borrowingAPI, sessionAPI } from '../../utils/api';
import UserProfileDropdown from '../../components/UserProfileDropdown';
import BookUploadModal from '../../components/BookUploadModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected, notifications: realtimeNotifications } = useSocket();
  const [activeTab, setActiveTab] = useState('today');
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, books, students, staff, system
  const [showUploadModal, setShowUploadModal] = useState(false);
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

  const [activeUsers, setActiveUsers] = useState([]);
  const [systemSettings, setSystemSettings] = useState({
    libraryName: 'SmartLibrary',
    maxBorrowDuration: 14,
    maxBooksPerUser: 5,
    fineAmountPerDay: 0.50
  });

  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Helper function to resolve file URLs
  const getBookCoverUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.split('/api')[0];

    // Clean path: handle backslashes from Windows paths and ensure leading slash
    let cleanPath = path.replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

    // Remove duplicate slashes if any
    cleanPath = cleanPath.replace(/\/+/g, '/');

    return `${baseUrl}${cleanPath}`;
  };

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

      // Fetch active users
      try {
        const activeSessions = await sessionAPI.getActiveSessions();
        setActiveUsers(activeSessions || []);
      } catch (e) {
        console.warn('Failed to fetch active sessions', e);
      }

      try {
        const settingsData = await librarianAPI.getSystemSettings();
        if (settingsData) setSystemSettings(settingsData);
      } catch (e) {
        console.warn('Failed to load system settings', e);
      }

      setStats({
        ...statsData,
        pendingRequests: requestsData.pagination?.total || requestsData.borrowRecords?.length || 0,
        revenue: 0,
        activeMembers: activeUsers.length // Update with real-time count
      });

      setBooks(booksData.books || []);
      setMembers(membersData.users || []);
      setBorrowRequests(requestsData.borrowRecords || []);
      setRecentActivity(activityData.activities || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(`Failed to load dashboard data: ${err.message || 'Unknown error'} `);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Add theme class to body for scrollbar styling
    document.body.classList.add('admin-theme');

    return () => {
      document.body.classList.remove('admin-theme');
    };
  }, []);

  // Real-time active users updates
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const sessions = await sessionAPI.getActiveSessions();
        setActiveUsers(sessions || []);
        // Also update stats
        setStats(prev => ({ ...prev, activeMembers: sessions ? sessions.length : 0 }));
      } catch (err) {
        console.error('Error fetching active users:', err);
      }
    };

    // Initial fetch
    fetchActiveUsers();

    // Poll every 30 seconds as fallback/update
    const interval = setInterval(fetchActiveUsers, 30000);

    // Listen for socket events
    if (socket) {
      socket.on('activeUsers:updated', (users) => {
        console.log('Active users updated via socket:', users);
        setActiveUsers(users);
        setStats(prev => ({ ...prev, activeMembers: users.length }));
      });

      socket.on('book:added', () => fetchDashboardData());
      socket.on('book:deleted', () => fetchDashboardData());
      socket.on('borrow:request', () => fetchDashboardData());
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('activeUsers:updated');
        socket.off('book:added');
        socket.off('book:deleted');
        socket.off('borrow:request');
      }
    };
  }, [socket]);

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

  const handleUpdateSettings = async () => {
    try {
      await librarianAPI.updateSystemSettings(systemSettings);
      alert('System settings updated successfully!');
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Failed to update settings');
    }
  };

  const handleMaintenance = async (action) => {
    if (!window.confirm(`Are you sure you want to perform: ${action}?`)) return;
    try {
      await librarianAPI.performMaintenance(action);
      alert(`${action} completed successfully!`);
    } catch (err) {
      console.error('Error performing maintenance:', err);
      alert(`Failed to perform ${action} `);
    }
  };

  // Render different views based on activeView
  const renderDashboardView = () => (
    <>
      {/* Stats Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-details">
            <h3>Active Users</h3>
            <div className="stat-value">{activeUsers.length}</div>
            <div className="stat-subtext">
              <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
                {isConnected ? '●' : '○'}
              </span> {' '}
              {activeUsers.length} users online
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="bi bi-exclamation-triangle"></i>
          </div>
          <div className="stat-details">
            <h3>Pending Requests</h3>
            <div className="stat-value">{stats.pendingRequests}</div>
            <div className="stat-subtext">{stats.pendingRequests} requests waiting</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="bi bi-book"></i>
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
            <h3>Total Books</h3>
            <div className="stat-value">{stats.totalBooks}</div>
            <div className="stat-subtext">{stats.availableBooks} books available</div>
          </div>
        </div>
      </div>

      {/* Live Active Users Section */}
      <div className="dashboard-content" style={{ marginTop: '2rem' }}>
        <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h2><i className="bi bi-broadcast"></i> Live Active Users</h2>
            <div className={`status-badge ${isConnected ? 'success' : 'danger'}`}>
              {isConnected ? '🟢 System Online' : '🔴 Disconnected'}
            </div>
          </div>
          <div className="card-body">
            {activeUsers.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {activeUsers.map((session, index) => (
                  <div key={index} className="user-online-card" style={{
                    padding: '1rem',
                    background: session.userRole === 'ADMIN' ? '#eff6ff' : session.userRole === 'LIBRARIAN' ? '#f0fdf4' : '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280'
                      }}>
                        <i className={`bi bi-${session.userRole === 'STUDENT' ? 'person' : session.userRole === 'ADMIN' ? 'shield-lock' : 'person-badge'}`}></i>
                      </div>
                      <span style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '10px',
                        height: '10px',
                        background: '#22c55e',
                        borderRadius: '50%',
                        border: '2px solid white'
                      }}></span>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{session.userName || 'Unknown User'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {session.userRole} • <i className="bi bi-clock"></i> {new Date(session.lastActivity || Date.now()).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                <i className="bi bi-people" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                No active users right now
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dashboard-content">
        {/* Notifications */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><i className="bi bi-bell"></i> Real-time Notifications</h2>
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

        {/* Total Books Report - Dynamic Chart Placeholder */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2><i className="bi bi-pie-chart"></i> Library Stats</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            {/* Simple CSS-based Pie Chart representation */}
            <div style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `conic-gradient(
                #3b82f6 0% ${stats.totalMembers ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%, 
                #e5e7eb ${stats.totalMembers ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}% 100%
              )`
            }}></div>
            <div style={{ marginLeft: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#3b82f6', marginRight: '0.5rem' }}></span>
                Active Members: {stats.activeMembers}
              </div>
              <div>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#e5e7eb', marginRight: '0.5rem' }}></span>
                Total Members: {stats.totalMembers}
              </div>
              <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                {stats.totalMembers ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}% Online
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
                <div key={request.id} className={`order-item ${request.status === 'PENDING' ? 'warning' : 'success'} `}>
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

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;
    try {
      await librarianAPI.deleteBook(bookId);
      await fetchDashboardData();
      alert('Book deleted successfully');
    } catch (err) {
      console.error('Error deleting book:', err);
      alert('Failed to delete book');
    }
  };

  const renderBooksView = () => (
    <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
      <div className="card-header">
        <h2><i className="bi bi-bookshelf"></i> Books Management</h2>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          <i className="bi bi-plus-lg"></i> Add Book
        </button>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {books.map((book) => (
            <div key={book.id} style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                height: '160px',
                background: book.coverImage ? `url(${getBookCoverUrl(book.coverImage)}) center/cover no-repeat` : '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {!book.coverImage && <i className="bi bi-book" style={{ fontSize: '3rem', color: '#d1d5db' }}></i>}
                {book.digitalUrl && (
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(37, 99, 235, 0.9)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    <i className="bi bi-file-earmark-pdf"></i> PDF
                  </span>
                )}
              </div>

              <div style={{ padding: '1rem', flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#111827' }}>
                  {book.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
                  by {book.author}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '100px',
                    background: book.availableQuantity > 0 ? '#dbeafe' : '#fee2e2',
                    color: book.availableQuantity > 0 ? '#1e40af' : '#991b1b',
                    fontWeight: '500'
                  }}>
                    {book.availableQuantity} / {book.quantity} Available
                  </span>
                  <span style={{ color: '#9ca3af' }}>{book.category}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  {book.digitalUrl ? (
                    <button
                      className="btn btn-sm"
                      style={{ flex: 1, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
                      onClick={() => window.open(book.digitalUrl, '_blank')}
                    >
                      <i className="bi bi-download"></i> Download
                    </button>
                  ) : (
                    <button className="btn btn-sm" disabled style={{ flex: 1, opacity: 0.5, background: '#f3f4f6' }}>
                      <i className="bi bi-book"></i> Physical Only
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-danger"
                    style={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => handleDeleteBook(book.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showUploadModal && (
        <BookUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={() => {
            fetchDashboardData();
            setShowUploadModal(false);
          }}
        />
      )}
    </div>
  );

  const handleToggleUserStatus = async (userId, currentStatus, role) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this ${role.toLowerCase()}?`)) return;

    try {
      await librarianAPI.updateMember(userId, { isActive: !currentStatus });
      await fetchDashboardData();
      alert(`User ${action}d successfully`);
    } catch (err) {
      console.error('Error updating user status:', err);
      alert(`Failed to ${action} user`);
    }
  };

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
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                <i className="bi bi-gear"></i> Actions
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
                <td style={{ padding: '1rem' }}>
                  <button
                    className={`btn btn-sm ${member.isActive ? 'btn-danger' : 'btn-success'} `}
                    onClick={() => handleToggleUserStatus(member.id, member.isActive, 'STUDENT')}
                  >
                    {member.isActive ? 'Deactivate' : 'Activate'}
                  </button>
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
        <button className="btn btn-primary" onClick={() => alert('Add Staff feature coming soon!')}>
          <i className="bi bi-person-plus"></i> Add Staff
        </button>
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
                <i className="bi bi-award"></i> Role
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                <i className="bi bi-circle-fill"></i> Status
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                <i className="bi bi-gear"></i> Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {members.filter(m => m.role === 'LIBRARIAN' || m.role === 'ADMIN').map((staff) => (
              <tr key={staff.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{staff.name}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>{staff.email}</td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  <span className="role-badge">{staff.role}</span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: staff.isActive ? '#d1fae5' : '#fee2e2',
                    color: staff.isActive ? '#065f46' : '#991b1b'
                  }}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button
                    className={`btn btn-sm ${staff.isActive ? 'btn-danger' : 'btn-success'} `}
                    onClick={() => handleToggleUserStatus(staff.id, staff.isActive, staff.role)}
                    disabled={staff.id === user.id} // Prevent deactivating self
                    title={staff.id === user.id ? "Cannot deactivate yourself" : ""}
                    style={{ opacity: staff.id === user.id ? 0.5 : 1 }}
                  >
                    {staff.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSystemView = () => (
    <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
      <div className="card-header">
        <h2><i className="bi bi-gear"></i> System Configuration</h2>
      </div>
      <div className="card-body">
        <div className="system-settings">
          <div className="setting-group">
            <h3><i className="bi bi-sliders"></i> General Settings</h3>
            <div className="setting-item">
              <label><i className="bi bi-building"></i> Library Name</label>
              <input
                type="text"
                value={systemSettings.libraryName}
                onChange={(e) => setSystemSettings({ ...systemSettings, libraryName: e.target.value })}
                className="setting-input"
              />
            </div>
            <div className="setting-item">
              <label><i className="bi bi-calendar-range"></i> Max Borrow Duration (days)</label>
              <input
                type="number"
                value={systemSettings.maxBorrowDuration}
                onChange={(e) => setSystemSettings({ ...systemSettings, maxBorrowDuration: e.target.value })}
                className="setting-input"
              />
            </div>
            <div className="setting-item">
              <label><i className="bi bi-book"></i> Max Books Per User</label>
              <input
                type="number"
                value={systemSettings.maxBooksPerUser}
                onChange={(e) => setSystemSettings({ ...systemSettings, maxBooksPerUser: e.target.value })}
                className="setting-input"
              />
            </div>
            <div className="setting-item">
              <label><i className="bi bi-cash-coin"></i> Fine Amount Per Day ($)</label>
              <input
                type="number"
                value={systemSettings.fineAmountPerDay}
                onChange={(e) => setSystemSettings({ ...systemSettings, fineAmountPerDay: e.target.value })}
                className="setting-input"
              />
            </div>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleUpdateSettings}>
              <i className="bi bi-save"></i> Save Changes
            </button>
          </div>

          <div className="setting-group">
            <h3><i className="bi bi-tools"></i> System Maintenance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                  <i className="bi bi-database"></i> Data Management
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-success" onClick={() => handleMaintenance('backup')}>
                    <i className="bi bi-save-fill"></i> Backup Database
                  </button>
                  <button className="btn btn-warning" onClick={() => handleMaintenance('clear-cache')}>
                    <i className="bi bi-trash"></i> Clear System Cache
                  </button>
                </div>
              </div>

              <div style={{ padding: '1rem', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#991b1b' }}>
                  <i className="bi bi-exclamation-triangle"></i> Danger Zone
                </h4>
                <button className="btn btn-danger" onClick={() => handleMaintenance('maintenance-mode')}>
                  <i className="bi bi-wrench"></i> Enable Maintenance Mode
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3><i className="bi bi-heart-pulse"></i> System Health</h3>
          <div className="health-metric">
            <div className="health-label">
              <i className="bi bi-database"></i> Database Status
            </div>
            <div className="health-bar">
              <div className="health-fill green" style={{ width: '98%' }}></div>
            </div>
            <div className="health-value">98% Operational</div>
          </div>
          <div className="health-metric">
            <div className="health-label">
              <i className="bi bi-lightning"></i> API Response Time
            </div>
            <div className="health-bar">
              <div className="health-fill blue" style={{ width: '95%' }}></div>
            </div>
            <div className="health-value">45ms (Excellent)</div>
          </div>
          <div className="health-metric">
            <div className="health-label">
              <i className="bi bi-hdd"></i> Storage Usage
            </div>
            <div className="health-bar">
              <div className="health-fill orange" style={{ width: '67%' }}></div>
            </div>
            <div className="health-value">67% Used</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'books':
        return renderBooksView();
      case 'students':
        return renderStudentsView();
      case 'staff':
        return renderStaffView();
      case 'system':
        return renderSystemView();
      default:
        return renderDashboardView();
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="spinner"></div>
          <p><i className="bi bi-hourglass-split"></i> Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
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
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <i className="bi bi-shield-lock"></i> <span>Admin</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeView === 'dashboard' ? 'active' : ''} `}
            onClick={() => setActiveView('dashboard')}
          >
            <i className="bi bi-speedometer2"></i> Dashboard
          </button>
          <button
            className={`sidebar-nav-item ${activeView === 'books' ? 'active' : ''} `}
            onClick={() => setActiveView('books')}
          >
            <i className="bi bi-book"></i> Books
          </button>
          <button
            className={`sidebar-nav-item ${activeView === 'students' ? 'active' : ''} `}
            onClick={() => setActiveView('students')}
          >
            <i className="bi bi-people"></i> Students
          </button>
          <button
            className={`sidebar-nav-item ${activeView === 'staff' ? 'active' : ''} `}
            onClick={() => setActiveView('staff')}
          >
            <i className="bi bi-person-badge"></i> Staff
          </button>
          <button
            className={`sidebar-nav-item ${activeView === 'system' ? 'active' : ''} `}
            onClick={() => setActiveView('system')}
          >
            <i className="bi bi-gear"></i> System
          </button>
        </nav>

        {/* Add Logout Button */}
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-button">
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>

      </aside>

      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>
              {activeView === 'dashboard' && <i className="bi bi-speedometer2"></i>}
              {activeView === 'books' && <i className="bi bi-book"></i>}
              {activeView === 'students' && <i className="bi bi-people"></i>}
              {activeView === 'staff' && <i className="bi bi-person-badge"></i>}
              {activeView === 'system' && <i className="bi bi-gear"></i>}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <BookUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={(book) => {
            console.log('Book uploaded:', book);
            setShowUploadModal(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;