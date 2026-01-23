import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserProfileDropdown from '../../components/UserProfileDropdown';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Mock Notifications
  const [notifications] = useState([
    { id: 1, text: "New book 'System Design' available", time: "2h ago", unread: true },
    { id: 2, text: "Return 'Advanced Math' by tomorrow", time: "5h ago", unread: true },
    { id: 3, text: "Welcome to EduLearn!", time: "1d ago", unread: false }
  ]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-theme');
  };

  // Student data
  const [studentData, setStudentData] = useState({
    borrowedCount: 3,
    readCount: 12,
    pendingRequests: 2,
    readingPoints: 245,
    studentId: 'CS2024001',
    department: 'Computer Science'
  });

  const [currentBooks, setCurrentBooks] = useState([
    {
      id: 1,
      title: 'Advanced Mathematics',
      author: 'Dr. Smith',
      dueDate: '2024-02-15',
      progress: 65,
      canRenew: true,
      cover: 'MATH'
    },
    {
      id: 2,
      title: 'Computer Science Basics',
      author: 'Prof. Johnson',
      dueDate: '2024-02-10',
      progress: 30,
      canRenew: false,
      cover: 'CS'
    }
  ]);

  const [recommendedBooks, setRecommendedBooks] = useState([
    {
      id: 1,
      title: 'Data Structures & Algorithms',
      author: 'Dr. Wilson',
      category: 'Computer Science',
      rating: 4.8,
      cover: 'DSA'
    },
    {
      id: 2,
      title: 'Modern Physics',
      author: 'Dr. Brown',
      category: 'Science',
      rating: 4.6,
      cover: 'PHYS'
    },
    {
      id: 3,
      title: 'History of Technology',
      author: 'Prof. Davis',
      category: 'History',
      rating: 4.7,
      cover: 'HIST'
    }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      action: 'Book borrowed',
      book: 'Advanced Mathematics',
      date: '2024-01-20',
      time: '14:30'
    },
    {
      id: 2,
      action: 'Book returned',
      book: 'Introduction to AI',
      date: '2024-01-18',
      time: '10:15'
    },
    {
      id: 3,
      action: 'Reading completed',
      book: 'Computer Networks',
      date: '2024-01-15',
      time: '16:45'
    }
  ]);

  const [studyResources, setStudyResources] = useState([
    {
      id: 1,
      title: 'Mathematics Study Group',
      type: 'Study Group',
      members: 15,
      nextSession: 'Tomorrow, 2 PM',
      icon: 'G'
    },
    {
      id: 2,
      title: 'Programming Workshop',
      type: 'Workshop',
      members: 25,
      nextSession: 'Friday, 3 PM',
      icon: 'W'
    },
    {
      id: 3,
      title: 'Research Methods Guide',
      type: 'Resource',
      category: 'Study Material',
      icon: 'R'
    }
  ]);

  const [eduCourses, setEduCourses] = useState([
    { id: 1, title: 'UI/UX Design', author: '30+ Courses', cover: 'U', color: '#FBBF24' },
    { id: 2, title: 'Marketing', author: '20+ Courses', cover: 'M', color: '#F472B6' },
    { id: 3, title: 'Web Dev', author: '35+ Courses', cover: 'W', color: '#2DD4BF' },
    { id: 4, title: 'Mathematics', author: '50+ Courses', cover: 'M', color: '#3B82F6' }
  ]);

  // --- Sub-sections ---

  // EduLearn Overview Section
  const StudentOverview = () => (
    <div className="ed-content">
      {/* Hero Belt */}
      <div className="hero-belt">
        <div className="ed-hero-card">
          <div className="ed-hero-text">
            <h1>Learn Effectively With Us!</h1>
            <p>Get 30% off every course this January.</p>
            <div className="hero-stats">
              <div className="h-stat">
                <div className="h-stat-icon"><i className="bi bi-people"></i></div>
                <div className="h-stat-info">
                  <span className="label">Students</span>
                  <span className="val">15,000+</span>
                </div>
              </div>
              <div className="h-stat">
                <div className="h-stat-icon"><i className="bi bi-mortarboard"></i></div>
                <div className="h-stat-info">
                  <span className="label">Expert Members</span>
                  <span className="val">200+</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-visual" style={{ fontSize: '80px', display: 'flex', alignItems: 'center', opacity: 0.2 }}>
            <i className="bi bi-mortarboard-fill"></i>
          </div>
        </div>

        <div className="ed-hero-side-card">
          <div className="promo-title">Have knowledge to share?</div>
          <button className="ed-btn-primary" style={{ padding: '0.6rem' }}><i className="bi bi-plus-lg"></i> Create Course</button>
          <div className="mini-split-stats">
            <div className="ms-pill">
              <span className="label">Active</span>
              <span className="val">5</span>
            </div>
            <div className="ms-pill">
              <span className="label">Forum</span>
              <span className="val">25</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-row-grid">
        {/* Main Grid Left: Popular Courses */}
        <div className="ed-dash-col">
          <div className="ed-section">
            <div className="ed-section-head">
              <h2>Popular Courses</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--ed-primary)', fontWeight: 600 }}>All Courses</span>
            </div>
            <div className="ed-list">
              {eduCourses.map(book => (
                <div key={book.id} className="ed-list-item">
                  <div className="item-badge" style={{ backgroundColor: book.color, width: '38px', height: '38px', fontSize: '1rem' }}>{book.cover}</div>
                  <div className="item-info">
                    <span className="name">{book.title}</span>
                    <span className="sub">{book.author}</span>
                  </div>
                  <div className="item-action-pill"><i className="bi bi-chevron-right"></i></div>
                </div>
              ))}
            </div>
          </div>

          <div className="ed-section">
            <h2>Top 5 School Performance</h2>
            <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', fontSize: '0.875rem' }}>Performance Data Visualization</div>
          </div>
        </div>

        {/* Main Grid Middle: Activity & Huge Stats */}
        <div className="ed-dash-col">
          <div className="ed-section activity-card">
            <div className="ed-section-head">
              <h2>Current Activity</h2>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--ed-text-dark)', fontWeight: 700 }}>Monthly Progress</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ed-text-sub)' }}>This is the latest improvement</div>
            <div className="chart-area" style={{ height: '120px', position: 'relative', marginTop: '1rem' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0 }}>
                <path d="M0 40 L0 35 Q 10 30, 20 38 Q 30 20, 40 32 Q 50 10, 60 25 Q 70 5, 80 18 Q 90 12, 100 20 L 100 40 Z" fill="rgba(59, 130, 246, 0.1)" />
                <path d="M0 35 Q 10 30, 20 38 Q 30 20, 40 32 Q 50 10, 60 25 Q 70 5, 80 18 Q 90 12, 100 20" stroke="var(--ed-primary)" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
          </div>

          <div className="big-stats-belt">
            <div className="giant-stat-card yellow" style={{ flex: 1 }}>
              <span className="val" style={{ fontSize: '1.75rem' }}>450K</span>
              <span className="lbl" style={{ fontSize: '0.8rem' }}>Learners</span>
              <div style={{ position: 'absolute', right: '1rem', bottom: '1rem', background: 'rgba(255,255,255,0.2)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              </div>
            </div>
            <div className="giant-stat-card pink" style={{ flex: 1 }}>
              <span className="val" style={{ fontSize: '1.75rem' }}>200K</span>
              <span className="lbl" style={{ fontSize: '0.8rem' }}>Videos</span>
              <div style={{ position: 'absolute', right: '1rem', bottom: '1rem', background: 'rgba(255,255,255,0.2)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Right: Best Instructors */}
        <div className="ed-dash-col">
          <div className="ed-section">
            <div className="ed-section-head">
              <h2>Best Instructors</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--ed-text-sub)' }}>See All</span>
            </div>
            <div className="instructor-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="instructor-item">
                  <div className="user-avatar" style={{ background: '#E2E8F0', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                    <i className="bi bi-person"></i>
                  </div>
                  <div className="inst-info">
                    <span className="name" style={{ fontSize: '0.8rem' }}>Instructor {i}</span>
                    <span className="count" style={{ fontSize: '0.7rem' }}>5 Courses</span>
                  </div>
                  <div className="item-action-pill" style={{ background: 'transparent', border: '1px solid #E2E8F0', padding: '0.2rem 0.5rem' }}>Profile</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MyBooksSection = () => (
    <div className="ed-content">
      <div className="ed-section">
        <div className="ed-section-head">
          <h2>Enrolled Books</h2>
          <span className="item-action-pill">{currentBooks.length} active</span>
        </div>
        <div className="ed-list">
          {currentBooks.map(book => (
            <div key={book.id} className="ed-list-item">
              <div className="item-badge" style={{ background: 'var(--ed-primary-soft)', color: 'var(--ed-primary)', width: '36px', height: '36px' }}>{book.cover[0]}</div>
              <div className="item-info">
                <span className="name" style={{ fontSize: '0.875rem', fontWeight: 700 }}>{book.title}</span>
                <span className="sub">by {book.author} • Due: {book.dueDate}</span>
              </div>
              <div className="item-action-pill">Read</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const BookSearchSection = () => {
    const filteredResults = recommendedBooks.filter(book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredResults.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="ed-content">
        <div className="ed-section">
          <div className="ed-section-head">
            <h2>Library Search</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--ed-text-sub)' }}>{filteredResults.length} Results</span>
          </div>
          <div className="ed-search-container" style={{ maxWidth: 'none', marginBottom: '1rem', background: '#F8FAFC', padding: '0.25rem 0.75rem' }}>
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="ed-search-input"
              placeholder="Search books, authors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            <button className="ed-btn-primary" style={{ width: 'auto', padding: '0 1rem', height: '32px' }}>Search</button>
          </div>
          <div className="instructor-list">
            {paginatedItems.map(book => (
              <div key={book.id} className="instructor-item">
                <div className="item-badge" style={{ background: 'var(--ed-primary-soft)', color: 'var(--ed-primary)', width: '36px', height: '36px' }}>{book.cover[0]}</div>
                <div className="inst-info">
                  <span className="name" style={{ fontSize: '0.85rem' }}>{book.title}</span>
                  <span className="count">{book.author} • {book.category}</span>
                </div>
                <div className="item-action-pill">Borrow</div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="ed-pagination">
              <button
                className="pag-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`pag-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="pag-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const StudyResourcesSection = () => (
    <div className="ed-content">
      <div className="ed-section">
        <div className="ed-section-head">
          <h2>Study Resources</h2>
        </div>
        <div className="ed-list">
          {studyResources.map(res => (
            <div key={res.id} className="ed-list-item">
              <div className="item-badge" style={{ background: 'var(--ed-primary-soft)', color: 'var(--ed-primary)', width: '36px', height: '36px' }}>
                <i className={`bi bi-${res.icon === 'G' ? 'people' : res.icon === 'W' ? 'code-slash' : 'journal-text'}`}></i>
              </div>
              <div className="item-info">
                <span className="name" style={{ fontSize: '0.875rem', fontWeight: 700 }}>{res.title}</span>
                <span className="sub">{res.type} {res.members ? `• ${res.members} Members` : ''}</span>
              </div>
              <div className="item-action-pill">Open</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="dashboard-lms-shell">
      {/* Sidebar */}
      <aside className="ed-sidebar">
        <div className="ed-brand" onClick={() => setActiveSection('overview')} style={{ cursor: 'pointer' }}>
          <div className="ed-brand-icon"><i className="bi bi-book-half"></i></div>
          <span className="ed-brand-text" style={{ fontSize: '1.1rem' }}>SmartLib</span>
        </div>

        <nav className="ed-nav-menu">
          <div className="sidebar-cat">Menu</div>
          <button className={`ed-nav-item ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>
            <i className="bi bi-grid-1x2"></i> Dashboard
          </button>
          <button className={`ed-nav-item ${activeSection === 'mailbox' ? 'active' : ''}`} onClick={() => setActiveSection('mailbox')}><i className="bi bi-envelope"></i> Mailbox</button>
          <button className={`ed-nav-item ${activeSection === 'calendar' ? 'active' : ''}`} onClick={() => setActiveSection('calendar')}><i className="bi bi-calendar3"></i> Calendar</button>

          <div className="sidebar-cat">Library</div>
          <button className={`ed-nav-item ${activeSection === 'search' ? 'active' : ''}`} onClick={() => setActiveSection('search')}><i className="bi bi-search"></i> Search</button>
          <button className={`ed-nav-item ${activeSection === 'mybooks' ? 'active' : ''}`} onClick={() => setActiveSection('mybooks')}><i className="bi bi-journal-check"></i> Enrolled</button>
          <button className={`ed-nav-item ${activeSection === 'resources' ? 'active' : ''}`} onClick={() => setActiveSection('resources')}><i className="bi bi-journal-bookmark"></i> Resources</button>

          <div className="sidebar-cat">Account</div>
          <button className="ed-nav-item" onClick={() => navigate('/profile')}><i className="bi bi-person-circle"></i> Profile</button>
          <button className="ed-nav-item" onClick={() => { logout(); navigate('/login'); }}><i className="bi bi-box-arrow-right"></i> Logout</button>
        </nav>

        <div className="sidebar-promo">
          <div style={{ background: 'var(--ed-primary-soft)', borderRadius: '10px', padding: '0.6rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', color: 'var(--ed-primary)' }}><i className="bi bi-award"></i></div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--ed-text-dark)' }}>Premium Member</div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="ed-main">
        <header className="ed-top-bar">
          <div className="ed-search-container" style={{ height: '36px' }}>
            <i className="bi bi-search" style={{ color: 'var(--ed-text-sub)', fontSize: '0.9rem' }}></i>
            <input type="text" className="ed-search-input" placeholder="Search..." style={{ fontSize: '0.8rem' }} />
          </div>

          <div className="top-bar-actions">
            <button className="icon-btn" onClick={toggleTheme}>
              <i className={`bi bi-${isDarkMode ? 'brightness-high' : 'moon-stars'}`} style={{ fontSize: '1.1rem' }}></i>
            </button>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <i className="bi bi-bell" style={{ fontSize: '1.1rem' }}></i>
                {notifications.some(n => n.unread) && <span className="notification-dot"></span>}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notif-header">
                    <span>Notifications</span>
                    <span className="mark-read">Mark all as read</span>
                  </div>
                  <div className="notif-list">
                    {notifications.map(n => (
                      <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                        <div className="notif-icon"><i className="bi bi-info-circle"></i></div>
                        <div className="notif-content">
                          <p>{n.text}</p>
                          <span>{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="notif-footer">View all notifications</div>
                </div>
              )}
            </div>
            <button className="icon-btn"><i className="bi bi-globe" style={{ fontSize: '1.1rem' }}></i></button>

            <div className="user-hi" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
              <div className="user-hi-text">
                <span className="name" style={{ fontSize: '0.8rem' }}>{user?.name?.split(' ')[0]}</span>
                <span className="role" style={{ fontSize: '0.65rem' }}>Student</span>
              </div>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`}
                  className="user-avatar"
                  alt="Profile"
                  style={{ width: '32px', height: '32px' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/32'; }}
                />
              ) : (
                <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, width: '32px', height: '32px' }}>
                  {user?.name?.[0]}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ed-dash-body">
          {activeSection === 'overview' && <StudentOverview />}
          {activeSection === 'mybooks' && <MyBooksSection />}
          {activeSection === 'search' && <BookSearchSection />}
          {activeSection === 'resources' && <StudyResourcesSection />}

          {!['overview', 'mybooks', 'search', 'resources'].includes(activeSection) && (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2 style={{ color: 'var(--ed-text-dark)' }}>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h2>
              <p style={{ color: 'var(--ed-text-sub)' }}>This section is coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;