# Technical Engineering Report

## Executive Summary
This document provides a senior-level technical assessment of the **School Management System** developed for **Algions AI Labs Private Limited**. The system delivers an end-to-end MERN architecture featuring MongoDB database persistence, modular business logic services, server-side RBAC and ownership authorization, compound unique index duplicate prevention, automated dynamic grade calculations, financial ledger reconciliation, and automated integration test coverage.

---

## 1. Architectural Decisions & Rationale

### Modular Monolith vs. Microservices
Given the requirement for tight transactional relationships between Students, Attendance, Examinations, and Fees, a **modular monolithic architecture** was chosen:
- Avoids distributed transaction overhead (two-phase commits / saga patterns).
- Allows atomic MongoDB bulk operations and atomic ledger reconciliations.
- Services in `backend/src/services/` maintain clean domain boundaries, facilitating potential future microservice extraction if needed.

### Separation of Controllers & Services
Controllers (`src/controllers/`) are strictly responsible for:
1. Extracting request parameters from `req.body`, `req.params`, and `req.query`.
2. Invoking the respective business logic service in `src/services/`.
3. Formatting uniform responses (`sendSuccess` / `sendError`).
All business rules, database queries, and auditing hooks reside exclusively inside services.

---

## 2. Concurrency & Data Integrity Strategies

### Preventing Duplicate Attendance Records
In high-concurrency environments, multiple teachers or network retries might attempt to record attendance for the same student on the same date and session simultaneously.
- **Solution**: A MongoDB compound unique index `{ studentId: 1, date: 1, session: 1 }` was implemented at the database engine level.
- In `attendanceService.js`, records are written using MongoDB `bulkWrite` with `updateOne` and `{ upsert: true }`. If a record already exists, it updates status and remarks in place rather than generating duplicate entries.

### Financial Ledger Reconciliation & Overpayment Prevention
Financial calculations must never rely on frontend values.
- **Solution**: The backend strictly computes `outstandingAmount = totalAmount - paidAmount`.
- When a payment request is received:
  1. Payment amount is verified: `amount > 0`.
  2. Overpayment check: `amount <= invoice.outstandingAmount`. If violated, a `400 Bad Request` is returned.
  3. Duplicate transaction reference check: If a transaction reference was already recorded, request is rejected.
  4. Invoice is updated atomically: `invoice.paidAmount += amount`, and status transitions to `'Paid'` or `'Partially Paid'`.

### Dynamic Grading Rules Engine
Hardcoding grade boundaries creates brittle systems.
- **Solution**: A dynamic `GradingRule` schema allows institution administrators to configure score thresholds (e.g. `A+`, `A`, `B`, `C`, `D`, `F`). When marks are submitted, `examService.calculateGrade` queries active database rules to assign letter grades and pass/fail standing.

---

## 3. Security Audits & Defensive Engineering

1. **Helmet & Secure Headers**: Express uses `helmet` to mitigate clickjacking, MIME-sniffing, and cross-site scripting.
2. **CORS with Credentials**: Whitelisted client origin with cookie transport credentials.
3. **Dual Token Delivery**: JWTs are transported in secure HTTP-only cookies while also accepting `Authorization: Bearer <token>` for developer tools and automated tests.
4. **Rate Limiting**: `express-rate-limit` prevents brute-force credential stuffing on `/api/auth/login`.
5. **Role & Ownership Authorization**: In addition to role middleware (`authorize(['admin', 'teacher'])`), custom service logic validates entity ownership:
   - Teachers cannot view or modify unassigned classes.
   - Guardians cannot query or view unlinked student records.
6. **Sanitized Audit Trails**: `auditService.js` intercepts sensitive fields (e.g. `password`, `token`, `secret`) and redacts them with `[REDACTED]` prior to saving to `AuditLog`.

---

## 4. Verification & Automated Test Outcomes

Automated testing was conducted using **Jest** and **Supertest** running against an isolated test database `mongodb://127.0.0.1:27017/school_management_test`.

### Mandatory Acceptance Test Results:
1. `TEST 1`: Teacher can access only assigned classes and record attendance (unassigned class returned `403 Forbidden`). **[PASSED]**
2. `TEST 2`: Duplicate attendance for the same student, date, and session safely updated without duplicate entries. **[PASSED]**
3. `TEST 3`: Examination result correctly calculated using configured grading rules (percentages, letter grades, pass/fail status). **[PASSED]**
4. `TEST 4`: Guardian can access only linked student information (unlinked student returned `403 Forbidden`). **[PASSED]**
5. `TEST 5`: Fee due and paid totals reconcile correctly with the payment ledger (partial and full payments reconciled). **[PASSED]**
6. `Negative Tests`: Unauthenticated (401), unauthorized role access (403), marks exceeding maxMarks (400), overpayment (400), duplicate transaction (400), invalid ObjectId references (404). **[PASSED]**

**Result**: 15 / 15 tests passed with 100% success rate.
