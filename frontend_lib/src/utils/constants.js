// src/utils/constants.js
export const DEMO_USERS = {
  ADMIN: { 
    email: 'admin@smartlib.gov.rw', 
    password: 'password',
    role: 'admin'
  },
  LIBRARIAN: { 
    email: 'librarian@smartlib.gov.rw', 
    password: 'password',
    role: 'librarian'
  },
  STUDENT: { 
    email: 'student@smartlib.gov.rw', 
    password: 'password',
    role: 'student'
  }
};

export const ROUTES = {
  ADMIN: '/admin/dashboard',
  LIBRARIAN: '/librarian/dashboard', 
  STUDENT: '/student/dashboard',
  LOGIN: '/login',
  HOME: '/'
};