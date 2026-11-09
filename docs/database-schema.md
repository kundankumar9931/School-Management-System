# Database Schema & Entity Relationship Model

The database is built on **MongoDB** with **Mongoose ODM**, utilizing strict schema validation, referential integrity via `ObjectId` references, unique constraints, and compound indexes to prevent duplicates.

---

## 1. Mermaid Entity-Relationship Diagram

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

## 2. Model Specifications & Schema Reference

### 1. `User`
*Authentication and role credentials.*
- `_id`: ObjectId (PK)
- `email`: String (Required, Unique, Lowercase, Trim)
- `passwordHash`: String (Required)
- `role`: Enum `['admin', 'teacher', 'guardian']` (Required, Default: `'guardian'`)
- `status`: Enum `['active', 'inactive']` (Default: `'active'`)
- `lastLogin`: Date (Default: `null`)
- `createdAt` / `updatedAt`: Timestamps

### 2. `Student`
*Core student biodata and school enrollment.*
- `_id`: ObjectId (PK)
- `admissionNumber`: String (Required, Unique, Uppercase)
- `firstName`, `lastName`: String (Required, Trim)
- `dateOfBirth`: Date (Required)
- `gender`: Enum `['male', 'female', 'other']` (Required)
- `email`: String (Optional, Sparse Index)
- `phone`: String
- `address`: Object (`street`, `city`, `state`, `postalCode`)
- `profileImageUrl`: String
- `classId`: ObjectId -> `Class` (Required, Index)
- `sectionId`: ObjectId -> `Section` (Required, Index)
- `guardianId`: ObjectId -> `Guardian` (Index)
- `status`: Enum `['active', 'inactive', 'graduated']` (Default: `'active'`)
- `createdAt` / `updatedAt`: Timestamps

### 3. `Guardian`
*Parent/Guardian contact info and linked children relationships.*
- `_id`: ObjectId (PK)
- `userId`: ObjectId -> `User` (Unique, Sparse)
- `fullName`: String (Required)
- `email`: String (Required, Lowercase, Index)
- `phone`: String (Required)
- `relationship`: Enum `['Father', 'Mother', 'Legal Guardian', 'Relative', 'Other']`
- `address`: String
- `occupation`: String
- `linkedStudentIds`: Array of ObjectIds -> `Student` (Index)
- `createdAt` / `updatedAt`: Timestamps

### 4. `Teacher`
*Faculty biodata, employment details, and department.*
- `_id`: ObjectId (PK)
- `userId`: ObjectId -> `User` (Unique, Sparse)
- `employeeId`: String (Required, Unique, Uppercase)
- `fullName`: String (Required)
- `email`: String (Required, Unique, Lowercase)
- `phone`: String (Required)
- `qualification`: String (Required)
- `experienceYears`: Number (Default: 0)
- `joiningDate`: Date (Default: `Date.now`)
- `department`: String (Default: `'General Education'`)
- `status`: Enum `['active', 'inactive']`
- `createdAt` / `updatedAt`: Timestamps

### 5. `Class`
*Academic standard.*
- `_id`: ObjectId (PK)
- `name`: String (Required)
- `academicYear`: String (Required, Default: `'2025-2026'`)
- `classTeacherId`: ObjectId -> `Teacher` (Optional)
- `description`: String
- **Compound Unique Index**: `{ name: 1, academicYear: 1 }`

### 6. `Section`
*Division cohort within an academic class.*
- `_id`: ObjectId (PK)
- `name`: String (Required, Uppercase, e.g. `'A'`, `'B'`)
- `classId`: ObjectId -> `Class` (Required)
- `capacity`: Number (Default: 40)
- `roomNumber`: String
- **Compound Unique Index**: `{ classId: 1, name: 1 }`

### 7. `Subject`
*Curriculum subjects and mark parameters.*
- `_id`: ObjectId (PK)
- `name`: String (Required)
- `code`: String (Required, Unique, Uppercase, e.g. `'MATH101'`)
- `description`: String
- `maxMarks`: Number (Default: 100)
- `passingMarks`: Number (Default: 40)

### 8. `TeacherAssignment`
*Mapping between faculty, class, section, subject, and academic year.*
- `_id`: ObjectId (PK)
- `teacherId`: ObjectId -> `Teacher` (Required)
- `classId`: ObjectId -> `Class` (Required)
- `sectionId`: ObjectId -> `Section` (Required)
- `subjectId`: ObjectId -> `Subject` (Required)
- `academicYear`: String (Default: `'2025-2026'`)
- `status`: Enum `['active', 'inactive']`
- **Compound Unique Index**: `{ teacherId: 1, classId: 1, sectionId: 1, subjectId: 1, academicYear: 1 }`

### 9. `Attendance`
*Session-based student attendance records.*
- `_id`: ObjectId (PK)
- `studentId`: ObjectId -> `Student` (Required)
- `classId`: ObjectId -> `Class` (Required)
- `sectionId`: ObjectId -> `Section` (Required)
- `teacherId`: ObjectId -> `Teacher` (Required)
- `date`: Date (Normalized to 00:00:00 UTC)
- `session`: Enum `['Morning', 'Afternoon']` (Required, Default: `'Morning'`)
- `status`: Enum `['Present', 'Absent', 'Late', 'Excused']` (Required)
- `remarks`: String
- **Compound Unique Index**: `{ studentId: 1, date: 1, session: 1 }`

### 10. `Examination`
*School-wide or term assessments.*
- `_id`: ObjectId (PK)
- `name`: String (Required)
- `examType`: Enum `['Midterm', 'Final', 'Quarterly', 'Unit Test', 'Practical']`
- `academicYear`: String (Required)
- `classId`: ObjectId -> `Class` (Required)
- `startDate`: Date
- `endDate`: Date
- `status`: Enum `['Draft', 'Scheduled', 'Ongoing', 'Completed', 'Published']`

### 11. `ExamSubject`
*Subject scheduling within an exam.*
- `_id`: ObjectId (PK)
- `examId`: ObjectId -> `Examination` (Required)
- `subjectId`: ObjectId -> `Subject` (Required)
- `examDate`: Date
- `maxMarks`: Number (Default: 100)
- `passingMarks`: Number (Default: 40)
- **Compound Unique Index**: `{ examId: 1, subjectId: 1 }`

### 12. `Result`
*Student examination score and computed grade.*
- `_id`: ObjectId (PK)
- `studentId`: ObjectId -> `Student` (Required)
- `examId`: ObjectId -> `Examination` (Required)
- `subjectId`: ObjectId -> `Subject` (Required)
- `marksObtained`: Number (Required, `0 <= marksObtained <= maxMarks`)
- `maxMarks`: Number (Default: 100)
- `percentage`: Number (Computed)
- `grade`: String (Computed dynamically from `GradingRule`)
- `isPassed`: Boolean
- `remarks`: String
- `evaluatedByTeacherId`: ObjectId -> `Teacher`
- **Compound Unique Index**: `{ studentId: 1, examId: 1, subjectId: 1 }`

### 13. `GradingRule`
*Configurable grade boundaries.*
- `_id`: ObjectId (PK)
- `grade`: String (Required, Unique, e.g. `'A+'`, `'A'`, `'B'`)
- `minPercentage`: Number (0 - 100)
- `maxPercentage`: Number (0 - 100)
- `gradePoint`: Number (e.g. 4.0, 3.5)
- `isPassing`: Boolean (Default: true)
- `description`: String

### 14. `FeeStructure`
*Billing template.*
- `_id`: ObjectId (PK)
- `name`: String (Required)
- `classId`: ObjectId -> `Class` (Required)
- `academicYear`: String (Default: `'2025-2026'`)
- `amount`: Number (Required)
- `dueDate`: Date (Required)
- `feeType`: Enum `['Tuition', 'Admission', 'Examination', 'Laboratory', 'Library', 'Sports', 'Other']`

### 15. `FeeInvoice`
*Student bill and ledger tracker.*
- `_id`: ObjectId (PK)
- `invoiceNumber`: String (Required, Unique, e.g. `'INV-2025-00001'`)
- `studentId`: ObjectId -> `Student` (Required)
- `feeStructureId`: ObjectId -> `FeeStructure` (Required)
- `totalAmount`: Number (Required)
- `paidAmount`: Number (Default: 0)
- `outstandingAmount`: Number (Auto-computed)
- `dueDate`: Date (Required)
- `status`: Enum `['Unpaid', 'Partially Paid', 'Paid', 'Overdue']`
- `remarks`: String

### 16. `Payment`
*Simulated digital and counter receipts.*
- `_id`: ObjectId (PK)
- `paymentId`: String (Required, Unique, e.g. `'PAY-2025-00001'`)
- `invoiceId`: ObjectId -> `FeeInvoice` (Required)
- `studentId`: ObjectId -> `Student` (Required)
- `amount`: Number (Required, `> 0`)
- `paymentDate`: Date (Default: `Date.now`)
- `paymentMethod`: Enum `['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque']`
- `transactionReference`: String (Unique prevention check)
- `status`: Enum `['Success', 'Pending', 'Failed', 'Refunded']`
- `receiptNumber`: String
- `recordedByUserId`: ObjectId -> `User`

### 17. `AuditLog`
*Security trail and business action logs.*
- `_id`: ObjectId (PK)
- `userId`: ObjectId -> `User`
- `userRole`: String
- `userEmail`: String
- `action`: String (Required)
- `entityType`: String (Required)
- `entityId`: String
- `changeSummary`: Mixed (Sanitized payload, passwords redacted)
- `requestId`: String
- `ipAddress`: String
- `userAgent`: String
- `createdAt`: Date (Indexed descending)
