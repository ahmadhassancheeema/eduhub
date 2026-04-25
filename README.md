# EduHub

EduHub is a full-stack academic platform for students. It combines student authentication, learning modules, progress tracking, favorites, academic discussion, an academic bookstore, and an admin management system into one organized web application.

This project is being developed as a realistic student full-stack web technology project using HTML, CSS, JavaScript, Node.js, Express.js, and Supabase PostgreSQL.

---

## Current Project Status

Current completed phases:

```text
Phase 1: Foundation and Authentication completed
Phase 2: Learning Wing and Progress Tracking completed
Phase 3: Favorites completed
Phase 4: Bookstore, Cart, Checkout, and Orders completed
Phase 5: Discussion Forum completed
Phase 6: Admin Panel completed
```

Next phase:

```text
Phase 7: Final Polish, Testing, and Deployment
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
```

---

## Planned Features

Still planned:

```text
Final UI polish
Responsive design improvements
Better loading states
Better error messages
Manual testing
Deployment
Final README documentation
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

## Current Frontend Pages

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

### Phase 4: Bookstore, Cart, Checkout, and Orders

Status:

```text
Completed
```

Includes:

```text
Books table
Cart items table
Orders table
Order items table
Bookstore API
Book details API
Cart API
Checkout API
Orders API
Bookstore page
Book details page
Cart page
Orders page
Add to cart
Update cart quantity
Remove cart item
Clear cart
Simulated checkout
Purchase history
Dashboard books purchased count
```

---

### Phase 5: Discussion Forum

Status:

```text
Completed
```

Includes:

```text
Forum categories
Forum tags
Questions table
Answers table
Votes table
Reports table
Question tags table
Forum API
Question listing
Question search
Category filter
Tag filter
Ask question page
Question details page
Post answer feature
Question voting
Answer voting
Question reporting
Answer reporting
Dashboard forum question count
```

---

### Phase 6: Admin Panel

Status:

```text
Completed
```

Includes:

```text
Admin dashboard
Admin analytics
Admin-only route protection
Manage users
Change user roles
Activate/deactivate users
Manage orders
Update order status
Manage forum reports
Moderate reported questions
Moderate reported answers
Manage books
Add/edit books
Activate/deactivate books
Manage learning categories
Manage modules
Publish/unpublish modules
Manage lessons
Manage resources
```

---

### Phase 7: Final Polish, Testing, and Deployment

Status:

```text
Not started
```

Will include:

```text
Responsive design review
UI consistency improvements
Error message improvements
Manual testing checklist
Deployment preparation
Frontend deployment
Backend deployment
Supabase production checks
Final README update
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
Phase 7: Final Polish, Testing, and Deployment
```

Phase 7 will prepare EduHub for final presentation, testing, and deployment.
