# REST API Documentation & OpenAPI Specification

Interactive Swagger UI documentation is available locally at:
👉 **`http://localhost:5000/api/docs`**

---

## 1. Standard Response Formats

### Success Response (HTTP 200, 201)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response (HTTP 400, 401, 403, 404, 409, 500)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

---

## 2. Authentication Headers & Cookies

All protected routes accept authentication via:
1. **HTTP-only Cookie**: `token=<jwt>`
2. **Bearer Authorization Header**: `Authorization: Bearer <jwt>`

---

## 3. Core API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/login`
  - Body: `{ "email": "admin@school.com", "password": "Admin@123" }`
  - Sets HTTP-only `token` cookie and returns `{ token, user }`.
- `POST /api/auth/logout`
  - Clears authentication cookie.
- `GET /api/auth/me`
  - Returns authenticated user profile and persona profile (`teacher` or `guardian`).

### Student Management (`/api/students`)
- `GET /api/students`: List students (Admin sees all; Teacher sees assigned cohort; Guardian sees linked children). Query params: `page`, `limit`, `search`, `classId`, `sectionId`, `status`.
- `GET /api/students/:id`: Get student dossier (enforces ownership for teachers and guardians).
- `POST /api/students`: Create student (Admin only).
- `PUT /api/students/:id`: Update student details (Admin only).
- `DELETE /api/students/:id`: Remove student record (Admin only).
- `GET /api/students/:id/academics`: Student examination score history.
- `GET /api/students/:id/attendance`: Student attendance history and percentage.
- `GET /api/students/:id/fees`: Student invoice history and ledger balances.

### Guardians (`/api/guardians`)
- `GET /api/guardians`: List guardians with linked children (Admin only).
- `GET /api/guardians/:id`: Get guardian profile (Admin only).
- `POST /api/guardians`: Create guardian and optional portal user account (Admin only).
- `PUT /api/guardians/:id`: Update guardian and link student IDs (Admin only).
- `GET /api/guardians/my-children`: Retrieve children linked to authenticated guardian.

### Teachers (`/api/teachers`)
- `GET /api/teachers`: List faculty with assignments (Admin and Teachers).
- `GET /api/teachers/:id`: Get teacher details.
- `POST /api/teachers`: Create teacher and optional portal credentials (Admin only).
- `PUT /api/teachers/:id`: Update teacher qualifications and status (Admin only).
- `DELETE /api/teachers/:id`: Remove teacher and clear assignments (Admin only).
- `GET /api/teachers/my-classes`: Return classes, sections, and subjects assigned to authenticated teacher.

### Academic Structure (`/api/classes`, `/api/sections`, `/api/subjects`, `/api/assignments`)
- `GET /api/classes` / `POST /api/classes` / `PUT /api/classes/:id` / `DELETE /api/classes/:id`
- `GET /api/sections` / `POST /api/sections` / `PUT /api/sections/:id` / `DELETE /api/sections/:id`
- `GET /api/subjects` / `POST /api/subjects` / `PUT /api/subjects/:id` / `DELETE /api/subjects/:id`
- `GET /api/assignments`: List teaching assignments.
- `POST /api/assignments`: Create assignment with duplicate prevention compound key `{ teacherId, classId, sectionId, subjectId, academicYear }`.
- `DELETE /api/assignments/:id`: Remove assignment.

### Attendance (`/api/attendance`)
- `POST /api/attendance`: Bulk upsert attendance records. Validates teacher assignment if caller is a teacher. Compound unique index `{ studentId, date, session }` prevents duplicate records.
- `GET /api/attendance/daily`: Retrieve daily attendance sheet for a class and section.
- `GET /api/attendance/student/:studentId`: Summary and stats for individual student.

### Examinations & Results (`/api/examinations`, `/api/results`)
- `GET /api/examinations` / `POST /api/examinations` / `PUT /api/examinations/:id` / `DELETE /api/examinations/:id`
- `POST /api/results`: Enter student marks. Validates `marksObtained <= maxMarks`, calculates percentage and letter grade from active `GradingRule` boundaries.
- `GET /api/results`: Query exam marks.
- `GET /api/results/report-card/:studentId/:examId`: Generates official printable report card transcript.
- `GET /api/grading-rules` / `POST /api/grading-rules`: Manage grading scale rules.

### Fees & Ledger (`/api/fees`)
- `GET /api/fees/structures` / `POST /api/fees/structures`: Create and list fee structures.
- `POST /api/fees/invoices`: Create student invoice.
- `POST /api/fees/invoices/bulk`: Generate bulk invoices for all students enrolled in a class.
- `GET /api/fees/invoices`: List invoices (filtered to linked children for guardians).
- `GET /api/fees/invoices/:id`: Get invoice and payment ledger history.
- `POST /api/fees/payments`: Record simulated payment. Validates `amount > 0` and `amount <= invoice.outstandingAmount`. Reconciles ledger balances.
- `GET /api/fees/payments`: List payments.
- `GET /api/fees/summary`: Aggregate metrics (total billed, collected, outstanding, status counts).

### Reports & Analytics (`/api/reports`)
- `GET /api/reports/dashboard`: Live MongoDB aggregations for dashboard KPIs, monthly collections, attendance trends, and grade breakdown.
- `GET /api/reports/attendance`: Attendance audit summary.
- `GET /api/reports/academic`: Academic performance summary.
- `GET /api/reports/fees`: Financial ledger summary.

### Audit Logs (`/api/audit-logs`)
- `GET /api/audit-logs`: System audit trail with filters by `entityType`, `userRole`, search, and pagination (Admin only).
