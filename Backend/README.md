# Smart Library Backend API

Backend API for the Smart Library Management System built with Express.js, Prisma ORM, and MySQL.

## Features

- 🔐 JWT-based authentication with role-based access control
- 👥 User management (Admin, Librarian, Student roles)
- 📚 Book inventory management
- 📖 Book borrowing and return system
- 📊 Analytics and reporting dashboard
- 🔍 System activity logging and audit trail
- 🛡️ Security features (Helmet, CORS, Rate limiting)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, express-rate-limit

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend**:
```bash
cd Backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
DATABASE_URL="mysql://username:password@localhost:3306/smartlibrary"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
NODE_ENV=development
```

4. **Install Prisma Client**:
```bash
npm run prisma:generate
```

5. **Run database migrations**:
```bash
npm run prisma:migrate
```

6. **Seed the database with sample data**:
```bash
npm run prisma:seed
```

## Running the Server

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Test Accounts

After seeding the database, you can use these accounts:

- **Admin**: `admin@smartlib.gov.rw` / `admin123`
- **Librarian**: `librarian@smartlib.gov.rw` / `librarian123`
- **Student**: `student@smartlib.gov.rw` / `student123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/stats` - User statistics
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Books
- `GET /api/books` - List all books (with search & filters)
- `GET /api/books/stats` - Book statistics
- `GET /api/books/categories` - Get all categories
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add new book (Admin/Librarian)
- `PUT /api/books/:id` - Update book (Admin/Librarian)
- `DELETE /api/books/:id` - Delete book (Admin)

### Borrowing
- `POST /api/borrowing/borrow` - Borrow a book
- `POST /api/borrowing/return/:recordId` - Return a book
- `GET /api/borrowing/my-books` - Get user's borrowing history
- `GET /api/borrowing/all` - Get all records (Admin/Librarian)
- `GET /api/borrowing/overdue` - Get overdue books (Admin/Librarian)
- `PUT /api/borrowing/fine/:recordId` - Update fine (Admin/Librarian)

### Analytics (Admin only)
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/activities` - Recent activities
- `GET /api/analytics/performance` - Performance metrics
- `POST /api/analytics/report` - Generate custom report

### System Logs (Admin only)
- `GET /api/logs` - Retrieve system logs
- `POST /api/logs` - Create log entry

## API Usage Example

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartlib.gov.rw","password":"admin123"}'
```

### Get Books (with authentication)
```bash
curl http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Management

**Open Prisma Studio** (visual database editor):
```bash
npm run prisma:studio
```

**Create a new migration**:
```bash
npx prisma migrate dev --name migration_name
```

**Reset database** (WARNING: deletes all data):
```bash
npx prisma migrate reset
```

## Project Structure

```
Backend/
├── middleware/
│   └── auth.js              # Authentication & authorization
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.js              # Database seeding
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management
│   ├── books.js             # Book management
│   ├── borrowing.js         # Borrowing system
│   ├── analytics.js         # Analytics & reports
│   └── logs.js              # System logs
├── utils/
│   ├── logger.js            # Logging utilities
│   └── validators.js        # Input validation
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── server.js                # Main server file
└── README.md
```

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Rate limiting to prevent abuse  
- Helmet for security headers
- CORS configuration
- Input validation and sanitization

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Development

**View logs in development**:
Logs are printed to console with timestamps and context.

**Debug Prisma queries**:
Set in `.env`:
```env
DEBUG=prisma:query
```

## Troubleshooting

**Database connection error**:
- Verify MySQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

**Prisma Client error**:
```bash
npm run prisma:generate
```

**Port already in use**:
- Change PORT in `.env`
- Kill the process using port 5000

## License

ISC
