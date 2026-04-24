# EduHub

EduHub is a full-stack academic platform for students. It combines student authentication, learning modules, progress tracking, favorites, academic discussion, and a bookstore into one organized web application.

This project is being developed as a realistic student full-stack web technology project using HTML, CSS, JavaScript, Node.js, Express.js, and Supabase PostgreSQL.

---

## Current Project Status

Current completed phases:

```text
Phase 1: Foundation and Authentication completed
Phase 2: Learning Wing and Progress Tracking completed
Phase 3: Favorites completed
```

Next phase:

```text
Phase 4: Bookstore
```

---

## Completed Features

EduHub currently supports:

```text
Student registration
Student login
JWT authentication
Password hashing
Protected dashboard
Real user profile loading
Supabase PostgreSQL connection
Learning modules
Module categories
Module lessons
Learning resources
Module enrollment
Lesson completion tracking
Lesson uncomplete feature
Progress percentage calculation
Real dashboard progress statistics
Favorites system
Favorites page
Save module to favorites
Remove module from favorites
Save learning resources to favorites
Remove favorites
```

---

## Planned Features

Still planned:

```text
Bookstore
Cart
Simulated checkout
Orders
Purchase history
Discussion forum
Questions and answers
Votes
Reports
Moderation
Admin panel
Deployment
Testing
Final polish
```

---

## Technology Stack

### Frontend

```text
HTML
CSS
Vanilla JavaScript
```

### Backend

```text
Node.js
Express.js
```

### Database

```text
Supabase PostgreSQL
```

### Authentication

```text
bcrypt password hashing
JWT tokens
```

### Development Tools

```text
VS Code
PowerShell
Git
GitHub
Live Server
Nodemon
```

---

## Current Folder Structure

```text
eduhub/
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── favoriteController.js
│   │   ├── lessonController.js
│   │   ├── moduleController.js
│   │   ├── progressController.js
│   │   └── resourceController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── notFoundMiddleware.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── favoriteRoutes.js
│   │   ├── lessonRoutes.js
│   │   ├── moduleRoutes.js
│   │   ├── progressRoutes.js
│   │   └── resourceRoutes.js
│   │
│   ├── sql/
│   │   ├── 01_schema.sql
│   │   ├── 02_seed.sql
│   │   ├── 03_indexes.sql
│   │   ├── 04_learning_schema.sql
│   │   ├── 05_learning_seed.sql
│   │   └── 06_favorites_schema.sql
│   │
│   ├── uploads/
│   │   └── .gitkeep
│   │
│   ├── utils/
│   │   ├── passwordUtils.js
│   │   ├── tokenUtils.js
│   │   └── validationUtils.js
│   │
│   ├── db.js
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── assets/
│   │   ├── icons/
│   │   ├── images/
│   │   └── placeholders/
│   │
│   ├── css/
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   ├── learning.css
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── config.js
│   │   ├── dashboard.js
│   │   ├── favorites.js
│   │   ├── learning.js
│   │   ├── main.js
│   │   └── module-details.js
│   │
│   ├── dashboard.html
│   ├── favorites.html
│   ├── index.html
│   ├── learning.html
│   ├── login.html
│   ├── module-details.html
│   └── register.html
│
├── .vscode/
├── .gitignore
└── README.md
```

---

## Database Tables Created

The current Supabase PostgreSQL database includes:

```text
users
module_categories
modules
lessons
resources
module_enrollments
student_progress
favorites
```

---

## Main Backend API Routes

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Learning Wing

```text
GET    /api/modules/categories
GET    /api/modules
GET    /api/modules/:id
POST   /api/modules/:id/enroll
DELETE /api/modules/:id/unenroll
GET    /api/modules/:moduleId/lessons
GET    /api/modules/:moduleId/resources
```

### Lessons

```text
GET /api/lessons/:id
GET /api/lessons/:lessonId/resources
```

### Resources

```text
GET /api/resources/:id
```

### Progress

```text
GET  /api/progress
GET  /api/progress/:moduleId
POST /api/progress/complete-lesson
POST /api/progress/uncomplete-lesson
```

### Favorites

```text
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:id
DELETE /api/favorites
```

---

## Current Frontend Pages

```text
index.html
register.html
login.html
dashboard.html
learning.html
module-details.html
favorites.html
```

---

## How to Run the Project Locally

### 1. Clone the Repository

```powershell
git clone https://github.com/ahmadhassancheeema/eduhub.git
cd eduhub
```

### 2. Install Backend Dependencies

```powershell
cd backend
npm install
```

### 3. Create Environment File

Create a `.env` file inside the `backend` folder.

Use `.env.example` as a guide.

Example:

```env
PORT=5000
DATABASE_URL=your_supabase_session_pooler_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Important:

```text
Never push the real .env file to GitHub.
```

### 4. Run the Backend

```powershell
npm run dev
```

The backend should run at:

```text
http://localhost:5000
```

### 5. Run the Frontend

Open the project in VS Code.

Then open:

```text
frontend/index.html
```

using Live Server.

---

## Test Routes

### Backend Test

```text
GET http://localhost:5000/
```

Expected result:

```json
{
  "message": "EduHub backend is running",
  "status": "success"
}
```

### Database Test

```text
GET http://localhost:5000/api/db-test
```

Expected result:

```json
{
  "message": "Database connection successful",
  "current_time": "..."
}
```

---

## Security Features Implemented

The project currently includes:

```text
Password hashing using bcrypt
JWT authentication
Protected backend routes
Environment variables
CORS setup
Basic input validation
User account active/inactive check
Role field prepared for admin/moderator system
```

Important security reminder:

```text
The real database connection string is stored in backend/.env.
This file must never be pushed to GitHub.
```

---

## Development Phases

### Phase 1: Foundation and Authentication

Status:

```text
Completed
```

Includes:

```text
Backend setup
Database connection
Users table
Register API
Login API
JWT authentication
Protected dashboard
Homepage
Register page
Login page
Dashboard page
Logout
```

---

### Phase 2: Learning Wing and Progress Tracking

Status:

```text
Completed
```

Includes:

```text
Module categories
Modules
Lessons
Resources
Module enrollment
Lesson completion
Lesson uncomplete feature
Progress calculation
Learning page
Module details page
Real dashboard progress
```

---

### Phase 3: Favorites

Status:

```text
Completed
```

Includes:

```text
Favorites table
Favorites API
Save module to favorites
Remove module from favorites
Save resources to favorites
Favorites page
Remove favorites from favorites page
```

---

### Phase 4: Bookstore

Status:

```text
Not started
```

Will include:

```text
Books table
Cart table
Orders table
Order items table
Bookstore page
Book details page
Cart page
Simulated checkout
Purchase history
```

---

### Phase 5: Discussion Forum

Status:

```text
Not started
```

Will include:

```text
Forum categories
Questions
Answers
Votes
Reports
Tags
Moderation
```

---

### Phase 6: Admin Panel

Status:

```text
Not started
```

Will include:

```text
Manage users
Manage modules
Manage lessons
Manage resources
Manage books
Manage orders
Manage forum reports
Analytics dashboard
```

---

### Phase 7: Polish and Deployment

Status:

```text
Not started
```

Will include:

```text
Responsive design improvements
Better UI states
Better error handling
Testing
Deployment
Final documentation
```

---

## GitHub Repository

Repository:

```text
https://github.com/ahmadhassancheeema/eduhub
```

---

## Current Recommended Next Step

The next development task is:

```text
Phase 4: Bookstore
```

Phase 4 will add academic books, cart management, simulated checkout, orders, and purchase history.
