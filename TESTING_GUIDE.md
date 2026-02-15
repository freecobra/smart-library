# SmartLibrary Dashboard Testing Guide

## Quick Start Testing

### Prerequisites
1. Backend server running on `http://localhost:5000`
2. Frontend running on `http://localhost:5173` (or your configured port)
3. Test users created for each role:
   - Student account
   - Librarian account
   - Admin account

---

## 🎓 Student Dashboard Testing

### Test 1: Dashboard Layout
- [ ] Login as a student
- [ ] Verify dashboard fits within viewport (no horizontal scroll)
- [ ] Check that sidebar is fixed and visible
- [ ] Verify main content scrolls properly

### Test 2: Demo Books
- [ ] Navigate to Dashboard (Overview section)
- [ ] Scroll to "Demo Books - View & Download" section
- [ ] Verify 4 demo books are displayed:
  - Introduction to Computer Science
  - Advanced Mathematics
  - Modern Physics
  - Digital Marketing Essentials
- [ ] Hover over each book card (should lift up with shadow)
- [ ] Click "View" button on any book (should show alert)
- [ ] Click "Download" button on any book (should show alert)

### Test 3: Real-Time Features
- [ ] Check connection status in hero section (should show 🟢 Connected)
- [ ] Verify "Borrowed" and "Pending" counts are displayed
- [ ] Check notification bell icon in top bar
- [ ] Click notification bell to open dropdown
- [ ] Verify connection status at bottom of dropdown
- [ ] Check "Recent Notifications" panel on right side of dashboard

### Test 4: Search Functionality
- [ ] Click "Search" in sidebar
- [ ] Verify demo books appear in search results with "DEMO" badge
- [ ] Type in search box to filter books
- [ ] Verify pagination works if more than 6 results
- [ ] Click "View" or download icon on any book

### Test 5: My Books Section
- [ ] Click "Enrolled" in sidebar
- [ ] Verify borrowed books are listed
- [ ] Check download button appears for books with digital content
- [ ] Verify due dates are displayed correctly

---

## 📚 Librarian Dashboard Testing

### Test 1: Dashboard Overview
- [ ] Login as a librarian
- [ ] Verify statistics cards show correct data:
  - New Books Added
  - Lost Books
  - Borrowed Books
  - Available Books
- [ ] Check connection status indicator (🟢 Live / 🔴 Offline)

### Test 2: Real-Time Notifications
- [ ] Check "Real-time Notifications" card
- [ ] Verify connection status shows "🟢 Live"
- [ ] Check if "Latest Updates" section appears (if notifications exist)
- [ ] Verify timestamps are displayed correctly
- [ ] Test tab switching (Today, This Week, This Month)

### Test 3: Live Library Stats
- [ ] Check "Live Library Stats" card
- [ ] Verify chart shows total books count
- [ ] Check legend shows:
  - Available books count
  - Borrowed books count
  - Overdue books count
  - Pending requests count
- [ ] Verify "Active Students" counter at bottom
- [ ] Wait 30 seconds and verify data refreshes

### Test 4: Active Students View
- [ ] Click "Students" in sidebar
- [ ] Check "Currently Active Students" section at top
- [ ] Verify live indicator (🟢 Live / 🔴 Offline)
- [ ] Check student cards show:
  - Student name
  - Last activity time
  - Green online indicator
- [ ] Verify count updates in real-time
- [ ] Check "All Students" table below

### Test 5: Books Management
- [ ] Click "Books" in sidebar
- [ ] Click "Upload Book" button
- [ ] Verify upload modal opens
- [ ] Test uploading a book (if backend supports it)
- [ ] Verify book appears in grid after upload
- [ ] Click "Delete" button on any book
- [ ] Confirm deletion dialog appears
- [ ] Verify book is removed after confirmation

### Test 6: Request Management
- [ ] Go back to Dashboard view
- [ ] Check "Pending Requests" card
- [ ] Verify pending borrow requests are listed
- [ ] Click "Approve" button on a request
- [ ] Confirm approval dialog
- [ ] Verify request is processed
- [ ] Test "Reject" button similarly

---

## 👨‍💼 Admin Dashboard Testing

### Test 1: Dashboard Overview
- [ ] Login as admin
- [ ] Verify statistics cards show:
  - Active Users (with live count)
  - Pending Requests
  - Borrowed Books
  - Total Books
- [ ] Check connection indicator on Active Users card

### Test 2: Live Active Users
- [ ] Check "Live Active Users" section
- [ ] Verify connection status badge (🟢 System Online)
- [ ] Check user cards display:
  - User name
  - User role (STUDENT, LIBRARIAN, ADMIN)
  - Last activity timestamp
  - Green online indicator
  - Role-specific icons
- [ ] Verify different background colors for different roles:
  - Admin: Blue background
  - Librarian: Green background
  - Student: White background
- [ ] Wait 30 seconds and verify list updates

### Test 3: Live Library Stats Chart
- [ ] Check pie chart in dashboard
- [ ] Verify it shows active vs total members percentage
- [ ] Check legend displays:
  - Active Members count
  - Total Members count
  - Percentage online
- [ ] Verify data updates in real-time

### Test 4: Real-Time Notifications
- [ ] Check "Real-time Notifications" card
- [ ] Verify recent activities are listed
- [ ] Check timestamps are correct
- [ ] Verify notifications update automatically

### Test 5: Books Management
- [ ] Click "Books" in sidebar
- [ ] Click "Add Book" button
- [ ] Verify upload modal opens
- [ ] Check book cards display:
  - Cover image or placeholder
  - PDF indicator for digital books
  - Title and author
  - Category and ISBN
  - Available quantity
- [ ] Click "Delete" button on a book
- [ ] Confirm deletion
- [ ] Verify book is removed

### Test 6: Students Management
- [ ] Click "Students" in sidebar
- [ ] Verify table shows all students with:
  - Name
  - Email
  - Student ID
  - Department
  - Status (Active/Inactive)
  - Actions button
- [ ] Click "Deactivate" on an active student
- [ ] Confirm action
- [ ] Verify status changes to "Inactive"
- [ ] Click "Activate" to reactivate
- [ ] Verify status changes back to "Active"

### Test 7: Staff Management
- [ ] Click "Staff" in sidebar
- [ ] Verify table shows librarians and admins
- [ ] Check role badges are displayed
- [ ] Try to deactivate your own account (should be disabled)
- [ ] Test activate/deactivate on other staff members

### Test 8: System Configuration
- [ ] Click "System" in sidebar
- [ ] Check "General Settings" section
- [ ] Modify any setting (e.g., Library Name)
- [ ] Click "Save Changes"
- [ ] Verify success message
- [ ] Check "System Maintenance" section
- [ ] Verify buttons are present:
  - Backup Database
  - Clear System Cache
  - Enable Maintenance Mode
- [ ] Check "System Health" section
- [ ] Verify health metrics are displayed:
  - Database Status
  - API Response Time
  - Storage Usage

---

## 🔄 Real-Time Testing (All Dashboards)

### Multi-User Testing
1. Open multiple browser windows/tabs
2. Login with different users in each:
   - Window 1: Student
   - Window 2: Librarian
   - Window 3: Admin

### Test Scenarios

#### Scenario 1: Book Upload
- [ ] In Librarian window, upload a new book
- [ ] Verify Admin dashboard updates automatically
- [ ] Check if book appears in Student search

#### Scenario 2: Borrow Request
- [ ] In Student window, request to borrow a book
- [ ] Verify Librarian sees pending request immediately
- [ ] Verify Admin sees updated pending count
- [ ] Librarian approves request
- [ ] Verify Student receives notification

#### Scenario 3: Active Users
- [ ] Login as a student in new window
- [ ] Check Admin dashboard "Live Active Users"
- [ ] Verify new student appears in list
- [ ] Check Librarian "Active Students" section
- [ ] Verify student appears there too
- [ ] Logout student
- [ ] Verify student disappears from active lists

#### Scenario 4: Connection Status
- [ ] Stop backend server
- [ ] Verify all dashboards show disconnected status
- [ ] Restart backend server
- [ ] Verify dashboards reconnect automatically
- [ ] Check connection indicators turn green

---

## 📊 Performance Testing

### Load Testing
- [ ] Open dashboard with 50+ books
- [ ] Verify smooth scrolling
- [ ] Check pagination works correctly
- [ ] Verify search is responsive

### Real-Time Updates
- [ ] Monitor network tab for WebSocket connection
- [ ] Verify socket stays connected
- [ ] Check for memory leaks (leave dashboard open for 10 minutes)
- [ ] Verify auto-refresh happens every 30 seconds

---

## 🐛 Common Issues to Check

### Student Dashboard
- [ ] Demo books display correctly
- [ ] Download buttons work
- [ ] View buttons work
- [ ] Search includes demo books
- [ ] Pagination works
- [ ] Notifications update in real-time

### Librarian Dashboard
- [ ] Upload modal opens
- [ ] Delete confirmation works
- [ ] Active students update
- [ ] Statistics refresh automatically
- [ ] Notifications show live updates

### Admin Dashboard
- [ ] Active users list updates
- [ ] Socket connection is stable
- [ ] Charts display correctly
- [ ] User management works
- [ ] System settings save properly

---

## ✅ Success Criteria

All dashboards should:
- ✅ Fit properly within viewport
- ✅ Show real-time connection status
- ✅ Update data automatically
- ✅ Display notifications in real-time
- ✅ Handle errors gracefully
- ✅ Provide user feedback for actions
- ✅ Work smoothly without lag
- ✅ Maintain WebSocket connection

---

## 📝 Bug Reporting Template

If you find any issues, report them using this format:

```
**Dashboard**: Student/Librarian/Admin
**Feature**: [Feature name]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**: 
**Actual Behavior**: 
**Screenshots**: [If applicable]
**Browser**: [Chrome/Firefox/Safari/Edge]
**Console Errors**: [If any]
```

---

## 🎉 Testing Complete!

Once all tests pass, the system is ready for production use. All real-time features should be working correctly across all three dashboards.

**Happy Testing! 🚀**
