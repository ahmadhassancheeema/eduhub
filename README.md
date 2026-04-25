# EduHub

EduHub is a full-stack academic platform for students. It combines student authentication, learning modules, progress tracking, favorites, academic discussion, an academic bookstore, and an admin management system into one organized web application.

This project was built as a realistic student full-stack web technology project using HTML, CSS, JavaScript, Node.js, Express.js, and Supabase PostgreSQL.

---

## Current Project Status

Completed phases:

```text
Phase 1: Foundation and Authentication completed
Phase 2: Learning Wing and Progress Tracking completed
Phase 3: Favorites completed
Phase 4: Bookstore, Cart, Checkout, and Orders completed
Phase 5: Discussion Forum completed
Phase 6: Admin Panel completed
Phase 7: Frontend Polish and Final Testing Prep completed
```

Deployment status:

```text
Deployment is postponed and will be done later.
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

Bookstore
Book browsing
Book search
Book category filtering
Book details page
Cart
Update cart quantity
Remove cart items
Clear cart
Simulated checkout
Order creation
Order history page
Real dashboard books purchased count

Discussion forum
Forum categories
Forum tags
Question listing
Question search
Question category filtering
Question tag filtering
Ask question page
Question details page
Post answers
Upvote questions
Downvote questions
Upvote answers
Downvote answers
Report questions
Report answers
Real dashboard forum question count

Admin dashboard
Admin analytics cards
Manage users
Change user roles
Activate and deactivate users
Manage orders
Update order status
Review forum reports
Mark reports as reviewed or rejected
Hide, lock, and reopen reported questions
Hide and show reported answers
Manage bookstore books
Add books
Edit books
Activate and deactivate books
Update book price and stock
Manage learning categories
Manage modules
Publish and unpublish modules
Manage lessons
Manage learning resources

Frontend polish
Improved global color system
Improved page header readability
Modernized forms and inputs
Improved dashboard layout
Improved navigation connectivity
Role-aware Admin Panel link for admin users
Professional demo seed data
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
Role-based access control
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

## Database Tables

The Supabase PostgreSQL database includes:

```text
users
module_categories
modules
lessons
resources
module_enrollments
student_progress
favorites
books
cart_items
orders
order_items
forum_categories
forum_questions
forum_answers
forum_votes
forum_reports
forum_tags
question_tags
```

---

## SQL Files

The backend SQL folder includes:

```text
01_schema.sql
02_seed.sql
03_indexes.sql
04_learning_schema.sql
05_learning_seed.sql
06_favorites_schema.sql
07_bookstore_schema.sql
08_bookstore_seed.sql
09_forum_schema.sql
10_forum_seed.sql
11_demo_data.sql
```

Important:

```text
SQL files are stored in the repository for setup/reference.
They must be manually run in Supabase SQL Editor when setting up a fresh database.
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

### Bookstore

```text
GET /api/books/categories
GET /api/books
GET /api/books/:id
```

### Cart

```text
GET    /api/cart
POST   /api/cart
PUT    /api/cart/:id
DELETE /api/cart/:id
DELETE /api/cart
```

### Checkout and Orders

```text
POST /api/checkout
GET  /api/orders
GET  /api/orders/:id
```

### Discussion Forum

```text
GET  /api/forum/categories
GET  /api/forum/tags
GET  /api/forum/my-count

GET  /api/forum/questions
POST /api/forum/questions
GET  /api/forum/questions/:id

POST /api/forum/questions/:id/answers

POST /api/forum/vote
POST /api/forum/report
```

### Admin

```text
GET /api/admin/dashboard

GET /api/admin/users
PUT /api/admin/users/:id/role
PUT /api/admin/users/:id/status

GET /api/admin/orders
PUT /api/admin/orders/:id/status

GET /api/admin/reports
PUT /api/admin/reports/:id

PUT /api/admin/forum/questions/:id/status
PUT /api/admin/forum/answers/:id/status
```

### Admin Books

```text
GET  /api/admin/books
POST /api/admin/books
PUT  /api/admin/books/:id
PUT  /api/admin/books/:id/status
```

### Admin Learning

```text
GET  /api/admin/learning/categories
POST /api/admin/learning/categories

GET  /api/admin/learning/modules
POST /api/admin/learning/modules
PUT  /api/admin/learning/modules/:id
PUT  /api/admin/learning/modules/:id/status

GET /api/admin/learning/modules/:moduleId/lessons
GET /api/admin/learning/modules/:moduleId/resources

POST   /api/admin/learning/lessons
PUT    /api/admin/learning/lessons/:id
DELETE /api/admin/learning/lessons/:id

POST   /api/admin/learning/resources
PUT    /api/admin/learning/resources/:id
DELETE /api/admin/learning/resources/:id
```

---

## Frontend Pages

```text
index.html
register.html
login.html
dashboard.html

learning.html
module-details.html
favorites.html

bookstore.html
book-details.html
cart.html
orders.html

forum.html
ask-question.html
question.html

admin.html
admin-users.html
admin-orders.html
admin-reports.html
admin-books.html
admin-learning.html
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

### 4. Run Database SQL Files

In Supabase SQL Editor, run the SQL files in order:

```text
01_schema.sql
02_seed.sql
03_indexes.sql
04_learning_schema.sql
05_learning_seed.sql
06_favorites_schema.sql
07_bookstore_schema.sql
08_bookstore_seed.sql
09_forum_schema.sql
10_forum_seed.sql
11_demo_data.sql
```

### 5. Run the Backend

From the `backend` folder:

```powershell
npm run dev
```

The backend should run at:

```text
http://localhost:5000
```

### 6. Run the Frontend

Open the project in VS Code.

Then open:

```text
frontend/index.html
```

using Live Server.

The frontend usually runs at:

```text
http://127.0.0.1:5500
```

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

## Demo Data

Professional demo data is provided in:

```text
backend/sql/11_demo_data.sql
```

It adds:

```text
Extra module categories
Extra learning modules
Extra lessons
Extra resources
Extra books
Demo forum questions
Demo forum answers
Forum tags
```

Example demo modules:

```text
AI101 - Introduction to Artificial Intelligence
CYB201 - Cybersecurity Essentials
SKL101 - Academic Study Skills
```

Example demo bookstore books:

```text
Artificial Intelligence for Beginners
Cybersecurity Essentials for Students
Study Skills for University Success
```

---

## Security Features Implemented

The project currently includes:

```text
Password hashing using bcrypt
JWT authentication
Protected backend routes
Admin-only backend routes
Role-based access control
Environment variables
CORS setup
Basic input validation
User account active/inactive check
No real payment details stored
Simulated checkout only
Forum report system prepared for moderation
```

Important security reminder:

```text
The real database connection string is stored in backend/.env.
This file must never be pushed to GitHub.

If any password was shared during testing, change it before deployment or final submission.
```

---

## Manual Testing Checklist

Before final presentation, test:

```text
Register new student
Login as student
Logout
Dashboard stats load
Learning modules load
Open module details
Enroll in a module
Complete lesson
Uncomplete lesson
Add favorite
Remove favorite

Open bookstore
Search books
Filter books
View book details
Add book to cart
Update cart quantity
Checkout
View orders

Open forum
Ask question
Open question details
Post answer
Upvote/downvote question
Upvote/downvote answer
Report question
Report answer

Login as admin
Open admin dashboard
Manage users
Change user role
Activate/deactivate user
Manage orders
Change order status
Review forum reports
Hide/lock/reopen question
Hide/show answer
Manage books
Add/edit/activate/deactivate book
Manage learning content
Add/edit/publish/unpublish module
Add/edit/delete lesson
Add/edit/delete resource

Admin switches to Student View
Admin Panel link appears for admin user
Admin can return to admin panel
```

---

## Development Phases

### Phase 1: Foundation and Authentication

Status:

```text
Completed
```

### Phase 2: Learning Wing and Progress Tracking

Status:

```text
Completed
```

### Phase 3: Favorites

Status:

```text
Completed
```

### Phase 4: Bookstore, Cart, Checkout, and Orders

Status:

```text
Completed
```

### Phase 5: Discussion Forum

Status:

```text
Completed
```

### Phase 6: Admin Panel

Status:

```text
Completed
```

### Phase 7: Frontend Polish and Final Testing Prep

Status:

```text
Completed without deployment
```

Includes:

```text
Global styling improvements
Better color contrast
Modern input styling
Dashboard layout update
Homepage navigation improvement
Admin-to-student navigation fix
Role-aware admin link
Demo data added
Manual testing checklist prepared
```

---

## Deployment

Deployment is not completed yet.

Planned future deployment setup:

```text
Frontend: Netlify or Vercel
Backend: Render
Database: Supabase PostgreSQL
Repository: GitHub
```

Before deployment:

```text
Rotate/change any exposed testing password.
Create production environment variables.
Update frontend API base URL.
Configure CORS for deployed frontend URL.
Test backend live API routes.
Test full deployed user flow.
```

---

## GitHub Repository

Repository:

```text
https://github.com/ahmadhassancheeema/eduhub
```
