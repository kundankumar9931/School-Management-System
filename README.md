# School Management System (MERN Stack)
### Full-Stack Web Development Assessment – Algions AI Labs Private Limited

A production-grade, enterprise School Management System built on the MERN stack (MongoDB, Express.js, React.js with Vite, Node.js). The application provides end-to-end functionality for educational institutions, featuring multi-role authentication (Admin, Faculty, Guardian), strict server-side access control, session-based attendance with duplicate prevention, dynamic grading rules, financial ledger reconciliation, audit logging, and automated integration test coverage.

---

## 1. Key Features

- **Multi-Role Authentication & Access Control (RBAC)**:
  - **Administrator**: Full administrative control over students, faculty, academic structure, billing, reports, and system audit trails.
  - **Faculty / Teacher**: Scoped strictly to assigned classes and subjects for daily attendance recording and marks submission. Unassigned classes return `403 Forbidden`.
  - **Guardian / Student**: Access restricted exclusively to linked children's biodata, attendance history, examination results, printable report cards, and fee invoices.
- **Session Attendance Tracking**:
  - Morning and Afternoon sessions with compound unique indexing `{ studentId: 1, date: 1, session: 1 }` preventing duplicate entries.
  - Atomic bulk-write updates with status indicators (Present, Absent, Late, Excused).
- **Examinations & Dynamic Grading Engine**:
  - Configurable grading boundaries (`GradingRule`: A+, A, B, C, D, F).
  - Automated calculation of subject marks, percentages, GPA points, and pass/fail status.
  - High-resolution, print-friendly and PDF-ready official Student Report Cards.
- **Financial Ledger & Billing**:
  - Fee structures (Tuition, Laboratory, Library, etc.) and automated student invoice generation.
  - Transaction-safe payment recording with overpayment validation (`amount <= outstandingAmount`).
  - Strict ledger balance reconciliation (`totalAmount = paidAmount + outstandingAmount`).
- **Live Reporting & Analytics**:
  - Dashboard KPIs calculated dynamically from real MongoDB records (no hardcoded statistics).
  - Recharts visual graphs: Monthly Fee Collections, Attendance Trends (7 days), and Grade Distribution.
  - Exportable CSV reports for attendance audits, examination performance, and billing ledgers.
- **Enterprise Security & Audit Trail**:
  - Password hashing with `bcryptjs`.
  - Dual token transport: Secure HTTP-only cookies + Bearer Authorization header.
  - Non-blocking audit logger recording user, action, target entity, IP, and sanitized payload.
  - Rate limiting, CORS credentials whitelisting, and Helmet security headers.

---

## 2. Technology Stack

- **Frontend**:
  - React.js 18 with Vite
  - Tailwind CSS (Navy & Indigo SaaS palette)
  - React Router DOM v6
  - Axios with interceptors
  - Recharts for data visualizations
  - Lucide React for consistent UI icons
  - React Hot Toast for notification toasts
- **Backend**:
  - Node.js (ES Modules)
  - Express.js
  - MongoDB with Mongoose ODM (17 Models)
  - JSON Web Tokens (`jsonwebtoken`)
  - `bcryptjs` for password hashing
  - `cookie-parser`
  - `helmet` & `cors`
  - `express-rate-limit`
  - `zod` for server-side schema validation
  - `swagger-ui-express` & `swagger-jsdoc` for interactive OpenAPI documentation
- **Automated Testing**:
  - Jest & Supertest

---

## 3. Architecture & Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o| Teacher : "has profile"
    User ||--o| Guardian : "has profile"
    Class ||--o{ Section : "contains"
    Class ||--o{ Student : "enrolls"
    Section ||--o{ Student : "places"
    Guardian ||--o{ Student : "links children"
    Teacher ||--o{ TeacherAssignment : "assigned to"
    Class ||--o{ TeacherAssignment : "mapped to"
    Section ||--o{ TeacherAssignment : "mapped to"
    Subject ||--o{ TeacherAssignment : "taught in"
    Student ||--o{ Attendance : "records"
    Teacher ||--o{ Attendance : "takes"
    Class ||--o{ Examination : "scheduled for"
    Examination ||--o{ ExamSubject : "schedules"
    Subject ||--o{ ExamSubject : "evaluated in"
    Student ||--o{ Result : "earns"
    Examination ||--o{ Result : "belongs to"
    Subject ||--o{ Result : "for subject"
    Class ||--o{ FeeStructure : "defined for"
    Student ||--o{ FeeInvoice : "billed to"
    FeeStructure ||--o{ FeeInvoice : "based on"
    FeeInvoice ||--o{ Payment : "settled by"
    User ||--o{ AuditLog : "performed by"
```

---

## 4. Demo Login Credentials

The database seeder configures the following demo accounts with realistic synthetic records:

| Role | Email Address | Password | Permissions Scope |
|---|---|---|---|
| **Administrator** | `admin@school.com` | `Admin@123` | Full access across all modules, settings, and audit logs |
| **Faculty (Teacher)** | `john.doe@school.com` | `Teacher@123` | Assigned to Grade 10 Math & Grade 9 Math |
| **Faculty (Teacher)** | `sarah.connor@school.com` | `Teacher@123` | Assigned to Grade 10 Science & Grade 11 Science |
| **Guardian** | `robert.smith@mail.com` | `Guardian@123` | Linked to Lucas Smith (Grade 10) & Emma Smith (Grade 9) |
| **Guardian** | `emily.davis@mail.com` | `Guardian@123` | Linked to Oliver Davis (Grade 10) & Sophia Davis (Grade 11) |

*Note: The login page includes one-click demo profile buttons to quickly test each role.*

---

## 5. Folder Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # db.js, env.js, swagger.js
│   │   ├── models/          # 17 Mongoose Models with compound indexes
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic services & financial ledger
│   │   ├── middleware/      # auth, role, validate, error handlers
│   │   ├── validators/      # Zod input schemas
│   │   ├── utils/           # token, response helpers
│   │   ├── tests/           # Jest + Supertest acceptance tests
│   │   ├── seeds/           # Comprehensive synthetic seeder (seed.js)
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server listener
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client & request interceptors
│   │   ├── context/         # AuthContext
│   │   ├── components/
│   │   │   ├── common/      # DataTable, Modal, StatusBadge, Cards
│   │   │   └── layout/      # Sidebar, Navbar, DashboardLayout
│   │   ├── pages/
│   │   │   ├── public/      # LoginPage, NotFoundPage, UnauthorizedPage
│   │   │   ├── admin/       # Overview, Students, Fees, Attendance, Exams, etc.
│   │   │   ├── teacher/     # TeacherOverview, Classes, Attendance, Marks
│   │   │   └── guardian/    # GuardianOverview, Attendance, Results, Fees
│   │   ├── App.jsx          # Route definitions
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── docs/
│   ├── architecture.md      # Detailed architectural & security documentation
│   ├── database-schema.md   # Schema reference for all 17 models + ER diagram
│   ├── api-documentation.md # OpenAPI endpoint reference
│   └── technical-report.md  # Engineering report, concurrency & reconciliation
└── README.md
```

---

## 6. Installation & Quick Start

### Prerequisites
- Node.js (v18.x or v20.x+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### Step 1: Backend Setup
```bash
cd backend
npm install

# Configure environment variables (a pre-configured .env is included)
# MONGODB_URI=mongodb://127.0.0.1:27017/school_management

# Seed the database with synthetic demo data
npm run seed

# Start development server
npm run dev
# Server will listen on http://localhost:5000
# Swagger API docs available at http://localhost:5000/api/docs
```

### Step 2: Frontend Setup
```bash
cd ../frontend
npm install

# Start Vite dev server
npm run dev
# Application will launch on http://localhost:5173
```

---

## 7. Running Automated Tests

To execute the automated acceptance and security integration test suite:

```bash
cd backend
npm test
```

### Acceptance Test Verifications Included:
- **TEST 1**: Teacher can access only assigned classes and record attendance (unassigned class rejected with 403 Forbidden).
- **TEST 2**: Duplicate attendance for same student, date, and session safely updated without creating duplicate records.
- **TEST 3**: Examination result correctly calculated using configured grading rules (percentages, letter grades, pass/fail status).
- **TEST 4**: Guardian can access only linked student information (unlinked student rejected with 403 Forbidden).
- **TEST 5**: Fee due and paid totals reconcile correctly with the payment ledger (partial and full payments reconciled).
- **Negative Tests**: Unauthenticated access (401), unauthorized role access (403), marks exceeding max marks (400), overpayment (400), duplicate transaction references (400), non-existent resources (404).

---

## 8. Interactive API Documentation

Interactive Swagger/OpenAPI documentation is hosted at:
- **`http://localhost:5000/api/docs`**

You can inspect schemas, test authentication with JWT Bearer tokens or cookies, and execute requests directly from the UI.

---

## 9. Deployment Guidelines

### Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. Link the repository to Vercel and set the Root Directory to `frontend`.
3. Set Environment Variable:
   - `VITE_API_URL=https://your-backend-service.onrender.com/api`
4. Deploy.

### Backend Deployment (Render)
1. In Render, create a new **Web Service** pointing to the repository.
2. Set Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `node src/server.js`
5. Set Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET=<A secure random secret>`
   - `CLIENT_URL=https://your-frontend.vercel.app`
6. Post-deployment, execute `node src/seeds/seed.js` using Render shell if initial database seeding is desired.

---

## 10. Known Limitations & Architectural Notes

- **Simulated Payment Gateway**: In strict accordance with the assessment specifications, payment recording simulates payment gateways without processing real credit cards or live UPI rails.
- **Email Service**: User invitation notifications log credentials to the audit trail and console; an external SMTP provider (such as SendGrid or AWS SES) can be plugged in for live outbound email delivery.
