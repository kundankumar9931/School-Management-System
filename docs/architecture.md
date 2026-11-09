# Architecture & Engineering Design

## 1. System Architecture Overview

The **School Management System** is built using a **modular monolithic architecture** designed for high security, data integrity, auditability, and clear separation of concerns.

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React + Vite)"]
        Browser[Client Browser]
        State[AuthContext & Axios Client]
        Portals[Role Portals: Admin / Teacher / Guardian]
    end

    subgraph Security ["Security & Gateway Layer"]
        Helmet[Helmet Security Headers]
        CORS[Configured CORS with Credentials]
        RateLimit[Express Rate Limiter]
        AuthMW[JWT Verification Middleware]
        RoleMW[RBAC Authorization Middleware]
        OwnershipMW[Entity Ownership & Assignment Checker]
        ValidateMW[Zod Request Schema Validator]
    end

    subgraph Application ["Business Logic Layer (Services)"]
        AuthSvc[Auth Service]
        StudentSvc[Student Service]
        TeacherSvc[Teacher & Assignment Service]
        GuardianSvc[Guardian Service]
        ClassSvc[Class, Section & Subject Service]
        AttendanceSvc[Attendance Service (Bulk Upsert)]
        ExamSvc[Exam & Dynamic Grading Engine]
        FeeSvc[Fee Ledger & Payment Reconciliation Service]
        ReportSvc[MongoDB Aggregation Reporting Service]
        AuditSvc[Sanitized Non-blocking Audit Logger]
    end

    subgraph Persistence ["Persistence Layer (MongoDB)"]
        Models[17 Mongoose Models with Strict Indexes]
        Mongo[(MongoDB 127.0.0.1:27017)]
    end

    Browser --> State --> Portals
    Portals -->|HTTP Requests / Bearer / Cookies| Helmet
    Helmet --> CORS --> RateLimit --> AuthMW --> RoleMW --> OwnershipMW --> ValidateMW
    ValidateMW --> AuthSvc & StudentSvc & TeacherSvc & GuardianSvc & ClassSvc & AttendanceSvc & ExamSvc & FeeSvc & ReportSvc
    AuthSvc & StudentSvc & TeacherSvc & GuardianSvc & ClassSvc & AttendanceSvc & ExamSvc & FeeSvc --> AuditSvc
    AuthSvc & StudentSvc & TeacherSvc & GuardianSvc & ClassSvc & AttendanceSvc & ExamSvc & FeeSvc & ReportSvc & AuditSvc --> Models
    Models --> Mongo
```

---

## 2. Security & Access Control Model

### Authentication Pipeline
1. **Credentials Ingestion**: Passwords hashed with `bcryptjs` (salt rounds: 10).
2. **Dual Transport Support**: JWT tokens issued upon successful authentication. Supported via:
   - **HTTP-Only Cookies** (`token` cookie, SameSite=lax) for browser security against XSS.
   - **Bearer Authorization Header** (`Authorization: Bearer <token>`) for automated tests, Postman, and API tools.
3. **Session Verification**: `authMiddleware.js` verifies the JWT signature, loads the user record from MongoDB, checks account status, and populates `req.teacher` or `req.guardian` profiles.

### Multi-Role Authorization Matrix

| Operations / Resources | Administrator | Faculty / Teacher | Guardian / Student |
|---|---|---|---|
| Student Directory Management (CRUD) | Full Access | View Assigned Cohort Only | View Linked Children Only |
| Teaching Assignments Matrix | Full Access | View Self Assignments | No Access |
| Daily Attendance Recording | Full Access | Assigned Classes/Sections Only | No Access (Read Only) |
| Examination Creation & Scheduling | Full Access | Read Only | View Assigned Schedule Only |
| Marks Entry & Grading | Full Access | Assigned Subjects Only | No Access (Read Only) |
| Report Card Generation | Full Access | Assigned Classes | Linked Children Only |
| Fee Structures & Invoicing | Full Access | No Access | No Access (Read Only) |
| Simulated Payment Ledger | Full Access | No Access | View Child Invoices Only |
| Analytical Dashboard & Reports | Full Access | Scoped Cohort Reports | No Access |
| Immutable Audit Logs | Read Only | No Access | No Access |

### Ownership Enforcement Mechanics
- **Teachers**: Validated against `TeacherAssignment` records matching `{ teacherId, classId, sectionId, subjectId, status: 'active' }`. If a teacher attempts to modify URL params or call APIs for unassigned classes, the backend halts execution with `403 Forbidden`.
- **Guardians**: Validated against `Guardian.linkedStudentIds`. Any request to retrieve student profiles, report cards, or fee invoices for a student not in `linkedStudentIds` is immediately rejected with `403 Forbidden`.

---

## 3. High-Integrity Business Engines

### Compound Unique Index Attendance Tracking
To prevent duplicate attendance entries, MongoDB compound unique indexes are enforced at the database level:
```javascript
attendanceSchema.index({ studentId: 1, date: 1, session: 1 }, { unique: true });
```
Submissions use MongoDB `bulkWrite` with `updateOne` and `{ upsert: true }`, ensuring that updating an already recorded session is atomic and safe without creating duplicate entries.

### Dynamic Grading Rules Engine
Grades are not hardcoded in the frontend. When faculty submits marks:
1. Backend validates that `marksObtained <= maxMarks`.
2. Percentage is computed: `(marksObtained / maxMarks) * 100`.
3. Active `GradingRule` collection is queried for dynamic boundary matching:
   - `90% - 100%`: Grade **A+** (GPA: 4.0, Passed: true)
   - `80% - 89.99%`: Grade **A** (GPA: 3.5, Passed: true)
   - `70% - 79.99%`: Grade **B** (GPA: 3.0, Passed: true)
   - `60% - 69.99%`: Grade **C** (GPA: 2.5, Passed: true)
   - `50% - 59.99%`: Grade **D** (GPA: 2.0, Passed: true)
   - `< 50%`: Grade **F** (GPA: 0.0, Passed: false)

### Financial Ledger Reconciliation Engine
1. **Invoice Balance Calculation**: When an invoice is created, `outstandingAmount = totalAmount - paidAmount`.
2. **Transaction Bounds**: Payments are rejected if `amount <= 0` or if `amount > invoice.outstandingAmount`.
3. **Atomic Balance Updates**: Recording a payment atomically increments `invoice.paidAmount` and updates `invoice.outstandingAmount = totalAmount - paidAmount`.
4. **Status Transitions**:
   - `paidAmount == 0`: **Unpaid** (or **Overdue** if current date > dueDate)
   - `0 < paidAmount < totalAmount`: **Partially Paid**
   - `paidAmount >= totalAmount`: **Paid**
5. **Double Payment Guard**: Duplicate transaction references are blocked with `400 Bad Request`.
