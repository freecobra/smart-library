# Frontend-Backend Integration Guide

## ✅ What's Been Done

### 1. Backend API (Complete)
- ✅ Full REST API with authentication, users, books, borrowing, analytics
- ✅ JWT token-based security
- ✅ Role-based access control (Admin, Librarian, Student)
- ✅ Database with test data (3 users, 15 books)

### 2. Frontend API Integration (Complete)
- ✅ Created `.env` file with API URL
- ✅ Built API service layer (`src/utils/api.js`)
- ✅ Updated AuthContext to use real backend authentication

## 🚀 How to Test the Integration

### Step 1: Start Backend Server

```cmd
cd c:\Users\Chiva-Pro\Desktop\Smartlibraly\Backend
npm run dev
```

**Expected Output**:
```
🚀 Smart Library API server running on port 5000
📚 Environment: development
🔗 Health check: http://localhost:5000/health
```

### Step 2: Start Frontend

Open a NEW command prompt:
```cmd
cd c:\Users\Chiva-Pro\Desktop\Smartlibraly\frontend_lib
npm run dev
```

Frontend will run on `http://localhost:5173`

### Step 3: Test Login

1. Open browser to `http://localhost:5173`
2. You'll see the login page
3. Try logging in with:
   - Email: `admin@smartlib.gov.rw`
   - Password: `admin123`

**What Happens**:
- Frontend sends credentials to `/api/auth/login`
- Backend validates, returns JWT token + user data
- Token is saved in localStorage
- You're redirected to admin dashboard

## 📊 Current Integration Status

### ✅ Working Now
- **Login/Logout**: Real authentication with JWT tokens
- **Token persistence**: Stays logged in on page refresh
- **Role-based routing**: Automatic redirect to correct dashboard

###  To Be Implemented
The dashboards still show **mock data**. Next steps are to connect each dashboard section to the backend API.

## 🔧 How the Integration Works

### Authentication Flow

```javascript
// User clicks login
↓
Frontend: AuthContext.login(email, password)
↓
API Service: authAPI.login() → POST /api/auth/login
↓
Backend: Validates credentials, generates JWT
↓
Response: { token: "eyJhbG...", user: {...} }
↓
Frontend: Saves token to localStorage
↓
User is logged in!
```

### Making Authenticated Requests

The API service automatically includes the token:

```javascript
// Example: Get all books
import { bookAPI } from '../utils/api';

const books = await bookAPI.getAll({ category: 'Computer Science' });

// Behind the scenes:
// GET /api/books?category=Computer+Science
// Headers: { Authorization: "Bearer eyJhbG..." }
```

## 📝 Next Steps: Dashboard Integration

To make the dashboards work with real data, you need to:

### For Admin Dashboard:

```javascript
// In Dashboard.jsx, add at the top:
import { analyticsAPI, userAPI, bookAPI } from '../../utils/api';

// In useEffect, fetch real data:
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const data = await analyticsAPI.getDashboard();
      setSystemStats(data.systemStats);
      setRecentActivities(data.recentActivities);
      // etc...
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };
  
  fetchDashboardData();
}, []);
```

### For Student Dashboard:

```javascript
// Fetch user's borrowed books:
import { borrowingAPI, bookAPI } from '../../utils/api';

useEffect(() => {
  const loadData = async () => {
    const borrowed = await borrowingAPI.getMyBooks('BORROWED');
    setCurrentBooks(borrowed.borrowRecords);
    
    const available = await bookAPI.getAll({ available: true, limit: 10 });
    setRecommendedBooks(available.books);
  };
  
  loadData();
}, []);
```

### For Librarian Dashboard:

```javascript
// Fetch books and manage inventory:
import { bookAPI, borrowingAPI } from '../../utils/api';

// Get all books
const booksData = await bookAPI.getAll();
setBooks(booksData.books);

// Get pending borrow requests  
const requests = await borrowingAPI.getAll({ status: 'Pending' });
setBorrowRequests(requests.borrowRecords);
```

## 🎯 API Service Reference

All available API functions in `src/utils/api.js`:

**Authentication**:
- `authAPI.login(email, password)`
- `authAPI.logout()`
- `authAPI.getCurrentUser()`

**Books**:
- `bookAPI.getAll({ search, category, page, limit })`
- `bookAPI.getById(id)`
- `bookAPI.create(bookData)`
- `bookAPI.update(id, bookData)`
- `bookAPI.delete(id)`
- `bookAPI.getStats()`

**Borrowing**:
- `borrowingAPI.borrow(bookId, dueDate)`
- `borrowingAPI.returnBook(recordId)`
- `borrowingAPI.getMyBooks(status)`
- `borrowingAPI.getAll({ status, page })`

**Users** (Admin only):
- `userAPI.getAll({ role, search, page })`
- `userAPI.create(userData)`
- `userAPI.update(id, userData)`
- `userAPI.delete(id)`

**Analytics** (Admin only):
- `analyticsAPI.getDashboard()`
- `analyticsAPI.getActivities(limit)`
- `analyticsAPI.getPerformance()`

## 🐛 Troubleshooting

### "Network Error" or "Failed to fetch"
- ✅ Make sure backend is running on port 5000
- ✅ Check `.env` file has correct API URL
- ✅ Check browser console for CORS errors

### "401 Unauthorized"
- ✅ Token might be expired (24 hour expiry)
- ✅ Log out and log in again
- ✅ Check localStorage has 'smartlib_token'

### Dashboard shows "Loading..." forever
- ✅ Open browser DevTools → Network tab
- ✅ Check if API requests are being made
- ✅ Look for error responses

### "CORS error"
- ✅ Backend should allow frontend URL in CORS config
- ✅ Check `server.js` has correct FRONTEND_URL in .env

## ✨ Testing Integration

### Test 1: Login with Different Roles

```javascript
// Admin
Email: admin@smartlib.gov.rw
Password: admin123
→ Should see Admin Dashboard

// Librarian  
Email: librarian@smartlib.gov.rw
Password: librarian123
→ Should see Librarian Dashboard

// Student
Email: student@smartlib.gov.rw
Password: student123
→ Should see Student Dashboard
```

### Test 2: Check Token in DevTools

1. Login successfully
2. Open DevTools → Application → LocalStorage
3. You should see:
   - `smartlib_token`: "eyJhbGc..."
   - `smartlib_user`: JSON with user data

### Test 3: Make an API Call

Open browser console and try:

```javascript
// Check if fetch works
fetch('http://localhost:5000/api/books', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('smartlib_token')}`
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

Should see books array in console!

## 📦 Files Modified/Created

### Created:
- `frontend_lib/.env` - API URL configuration
- `frontend_lib/src/utils/api.js` - API service layer

### Modified:
- `frontend_lib/src/context/AuthContext.jsx` - Real auth instead of mocks

### Still Using Mock Data:
- `frontend_lib/src/pages/Admin/Dashboard.jsx` - Needs API integration
- `frontend_lib/src/pages/Librarian/Dashboard.jsx` - Needs API integration
- `frontend_lib/src/pages/Student/Dashboard.jsx` - Needs API integration

---

**Summary**: The connection between frontend and backend is READY. Login works with real authentication. Now each dashboard needs to be updated to fetch real data instead of using hardcoded mock data. The API service (`api.js`) has all the functions you need! 🎉
