# Frontend Integration - Quick Start Guide

## ⚠️ Current Status

The backend API is **100% complete and working**. Frontend integration was started:
- ✅ `.env` created with API URL  
- ✅ `src/utils/api.js` created with all API functions
- ✅ `AuthContext` updated to use real authentication

## 🎯 What Still Needs To Be Done

The dashboards currently show mock data. Follow these steps to connect them to the backend:

---

## Test Accounts

After running the backend seed:
- **Admin**: `admin@smartlib.gov.rw` / `admin123`
- **Librarian**: `librarian@smartlib.gov.rw` / `librarian123`  
- **Student**: `student@smartlib.gov.rw` / `student123`

---

## Integration Pattern

For each dashboard, follow this 3-step pattern:

### 1. Import API functions
```javascript
import { bookAPI, borrowingAPI } from '../../utils/api';
```

### 2. Add useEffect to fetch data
```javascript
useEffect(() => {
  const fetchData = async () => {
    const response = await bookAPI.getAll();
    setBooks(response.books);
  };
  fetchData();
}, []);
```

### 3. Connect button actions
```javascript
<button onClick={() => handleAction(id)}>Click Me</button>
```

---

## Student Dashboard Example

```javascript
// Add imports at top
import { bookAPI, borrowingAPI } from '../../utils/api';

// Inside component, add useEffect:
useEffect(() => {
  const loadData = async () => {
    try {
      const borrowed = await borrowingAPI.getMyBooks('BORROWED');
      setCurrentBooks(borrowed.borrowRecords || []);
      
      const available = await bookAPI.getAll({ limit: 10 });
      setRecommendedBooks(available.books || []);
    } catch (error) {
      console.error(error);
    }
  };
  loadData();
}, []);

// Add borrow handler:
const handleBorrow = async (bookId) => {
  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    await borrowingAPI.borrow(bookId, dueDate.toISOString());
    alert('Borrowed successfully!');
    window.location.reload();
  } catch (error) {
    alert('Error: ' + error.message);
  }
};
```

---

## Full Integration Details

See `INTEGRATION_GUIDE.md` for complete documentation including:
- Setup instructions
- All API endpoints  
- Testing guide
- Troubleshooting

---

## Quick Test

1. Start backend: `cd Backend && npm run dev`
2. Start frontend: `cd frontend_lib && npm run dev`
3. Login and check browser console for API calls
