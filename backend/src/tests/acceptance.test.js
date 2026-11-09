import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../app.js';
import {
  User,
  Teacher,
  Guardian,
  Student,
  Class,
  Section,
  Subject,
  TeacherAssignment,
  Attendance,
  Examination,
  ExamSubject,
  Result,
  GradingRule,
  FeeStructure,
  FeeInvoice,
  Payment,
} from '../models/index.js';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/school_management_test';

describe('School Management System - Automated Acceptance & Security Tests', () => {
  let adminToken, teacher1Token, teacher2Token, guardian1Token, guardian2Token;
  let adminUser, teacherUser1, teacherUser2, guardianUser1, guardianUser2;
  let teacher1Profile, teacher2Profile, guardian1Profile, guardian2Profile;
  let class1, class2, sec1A, sec1B, sec2A;
  let mathSubject, scienceSubject;
  let student1, student2, student3;
  let feeStructure1;

  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
    await mongoose.connection.dropDatabase();

    // 1. Setup Grading Rules
    await GradingRule.insertMany([
      { grade: 'A+', minPercentage: 90, maxPercentage: 100, gradePoint: 4.0, isPassing: true },
      { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gradePoint: 3.5, isPassing: true },
      { grade: 'B', minPercentage: 70, maxPercentage: 79.99, gradePoint: 3.0, isPassing: true },
      { grade: 'C', minPercentage: 60, maxPercentage: 69.99, gradePoint: 2.5, isPassing: true },
      { grade: 'D', minPercentage: 50, maxPercentage: 59.99, gradePoint: 2.0, isPassing: true },
      { grade: 'F', minPercentage: 0, maxPercentage: 49.99, gradePoint: 0.0, isPassing: false },
    ]);

    // 2. Setup Users
    const pwd = await bcrypt.hash('Test@123', 8);
    adminUser = await User.create({ email: 'admin.test@school.com', passwordHash: pwd, role: 'admin' });
    teacherUser1 = await User.create({ email: 't1.test@school.com', passwordHash: pwd, role: 'teacher' });
    teacherUser2 = await User.create({ email: 't2.test@school.com', passwordHash: pwd, role: 'teacher' });
    guardianUser1 = await User.create({ email: 'g1.test@school.com', passwordHash: pwd, role: 'guardian' });
    guardianUser2 = await User.create({ email: 'g2.test@school.com', passwordHash: pwd, role: 'guardian' });

    // 3. Setup Profiles
    teacher1Profile = await Teacher.create({
      userId: teacherUser1._id,
      employeeId: 'TCH-TEST-1',
      fullName: 'Teacher One',
      email: teacherUser1.email,
      phone: '1234567890',
      qualification: 'M.Ed',
    });

    teacher2Profile = await Teacher.create({
      userId: teacherUser2._id,
      employeeId: 'TCH-TEST-2',
      fullName: 'Teacher Two',
      email: teacherUser2.email,
      phone: '1234567891',
      qualification: 'B.Ed',
    });

    guardian1Profile = await Guardian.create({
      userId: guardianUser1._id,
      fullName: 'Guardian One',
      email: guardianUser1.email,
      phone: '9876543210',
      relationship: 'Father',
    });

    guardian2Profile = await Guardian.create({
      userId: guardianUser2._id,
      fullName: 'Guardian Two',
      email: guardianUser2.email,
      phone: '9876543211',
      relationship: 'Mother',
    });

    // 4. Setup Academic Structure
    class1 = await Class.create({ name: 'Grade 10', academicYear: '2025-2026' });
    class2 = await Class.create({ name: 'Grade 11', academicYear: '2025-2026' });
    sec1A = await Section.create({ name: 'A', classId: class1._id, capacity: 30 });
    sec1B = await Section.create({ name: 'B', classId: class1._id, capacity: 30 });
    sec2A = await Section.create({ name: 'A', classId: class2._id, capacity: 30 });

    mathSubject = await Subject.create({ name: 'Mathematics', code: 'MTH100', maxMarks: 100, passingMarks: 40 });
    scienceSubject = await Subject.create({ name: 'Physics', code: 'PHY100', maxMarks: 100, passingMarks: 40 });

    // Teacher 1 assigned ONLY to Class 1 Section A (Mathematics)
    await TeacherAssignment.create({
      teacherId: teacher1Profile._id,
      classId: class1._id,
      sectionId: sec1A._id,
      subjectId: mathSubject._id,
      academicYear: '2025-2026',
    });

    // 5. Setup Students
    student1 = await Student.create({
      admissionNumber: 'ADM-TEST-001',
      firstName: 'Student',
      lastName: 'One',
      dateOfBirth: new Date('2009-01-01'),
      gender: 'male',
      classId: class1._id,
      sectionId: sec1A._id,
      guardianId: guardian1Profile._id,
    });

    student2 = await Student.create({
      admissionNumber: 'ADM-TEST-002',
      firstName: 'Student',
      lastName: 'Two',
      dateOfBirth: new Date('2009-02-02'),
      gender: 'female',
      classId: class1._id,
      sectionId: sec1B._id, // Section B (Teacher 1 is NOT assigned)
      guardianId: guardian2Profile._id,
    });

    student3 = await Student.create({
      admissionNumber: 'ADM-TEST-003',
      firstName: 'Student',
      lastName: 'Three',
      dateOfBirth: new Date('2008-03-03'),
      gender: 'male',
      classId: class2._id,
      sectionId: sec2A._id,
      guardianId: guardian2Profile._id,
    });

    // Link student 1 to guardian 1, and students 2 & 3 to guardian 2
    guardian1Profile.linkedStudentIds = [student1._id];
    await guardian1Profile.save();

    guardian2Profile.linkedStudentIds = [student2._id, student3._id];
    await guardian2Profile.save();

    // 6. Setup Fee Structure
    feeStructure1 = await FeeStructure.create({
      name: 'Term 1 Tuition Fee',
      classId: class1._id,
      academicYear: '2025-2026',
      amount: 1000,
      dueDate: new Date('2026-12-31'),
    });

    // Obtain JWT tokens for each user via login API
    const resAdmin = await request(app).post('/api/auth/login').send({ email: 'admin.test@school.com', password: 'Test@123' });
    adminToken = resAdmin.body.data.token;

    const resT1 = await request(app).post('/api/auth/login').send({ email: 't1.test@school.com', password: 'Test@123' });
    teacher1Token = resT1.body.data.token;

    const resT2 = await request(app).post('/api/auth/login').send({ email: 't2.test@school.com', password: 'Test@123' });
    teacher2Token = resT2.body.data.token;

    const resG1 = await request(app).post('/api/auth/login').send({ email: 'g1.test@school.com', password: 'Test@123' });
    guardian1Token = resG1.body.data.token;

    const resG2 = await request(app).post('/api/auth/login').send({ email: 'g2.test@school.com', password: 'Test@123' });
    guardian2Token = resG2.body.data.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // ==========================================
  // MANDATORY ACCEPTANCE TEST 1:
  // Teacher can access ONLY assigned classes and record attendance
  // ==========================================
  describe('ACCEPTANCE TEST 1: Teacher Class & Attendance Assignment Isolation', () => {
    it('should allow teacher to record attendance for an ASSIGNED class/section', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${teacher1Token}`)
        .send({
          classId: class1._id.toString(),
          sectionId: sec1A._id.toString(),
          date: '2026-03-01',
          session: 'Morning',
          records: [{ studentId: student1._id.toString(), status: 'Present' }],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('recorded successfully');
    });

    it('should REJECT teacher attempting to record attendance for an UNASSIGNED class/section with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${teacher1Token}`)
        .send({
          classId: class1._id.toString(),
          sectionId: sec1B._id.toString(), // Section B is NOT assigned to teacher 1
          date: '2026-03-01',
          session: 'Morning',
          records: [{ studentId: student2._id.toString(), status: 'Present' }],
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });
  });

  // ==========================================
  // MANDATORY ACCEPTANCE TEST 2:
  // Duplicate attendance for same student, date and session is safely handled
  // ==========================================
  describe('ACCEPTANCE TEST 2: Duplicate Attendance Prevention & Safe Update', () => {
    it('should update existing attendance without creating duplicate records for student + date + session', async () => {
      const targetDate = '2026-03-02';

      // First submission: Present
      const res1 = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classId: class1._id.toString(),
          sectionId: sec1A._id.toString(),
          date: targetDate,
          session: 'Morning',
          records: [{ studentId: student1._id.toString(), status: 'Present' }],
        });
      expect(res1.status).toBe(201);

      // Second submission for the SAME student, date, and session: Update to Late
      const res2 = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classId: class1._id.toString(),
          sectionId: sec1A._id.toString(),
          date: targetDate,
          session: 'Morning',
          records: [{ studentId: student1._id.toString(), status: 'Late', remarks: 'Arrived 15 mins late' }],
        });
      expect(res2.status).toBe(201);

      // Verify in database that exactly ONE record exists with the updated status
      const d = new Date(targetDate);
      d.setUTCHours(0, 0, 0, 0);

      const records = await Attendance.find({
        studentId: student1._id,
        date: d,
        session: 'Morning',
      });

      expect(records.length).toBe(1);
      expect(records[0].status).toBe('Late');
      expect(records[0].remarks).toBe('Arrived 15 mins late');
    });
  });

  // ==========================================
  // MANDATORY ACCEPTANCE TEST 3:
  // Examination result is correctly calculated using configured grading rules
  // ==========================================
  describe('ACCEPTANCE TEST 3: Examination Grade Calculation & Validation', () => {
    let exam;

    beforeAll(async () => {
      exam = await Examination.create({
        name: 'Midterm 2026',
        examType: 'Midterm',
        academicYear: '2025-2026',
        classId: class1._id,
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-10'),
      });

      await ExamSubject.create({
        examId: exam._id,
        subjectId: mathSubject._id,
        examDate: new Date('2026-04-02'),
        maxMarks: 100,
        passingMarks: 40,
      });
    });

    it('should correctly calculate percentage, A+ grade and pass status for 95/100', async () => {
      const res = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examId: exam._id.toString(),
          subjectId: mathSubject._id.toString(),
          entries: [{ studentId: student1._id.toString(), marksObtained: 95, remarks: 'Superb' }],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const savedResult = await Result.findOne({
        studentId: student1._id,
        examId: exam._id,
        subjectId: mathSubject._id,
      });

      expect(savedResult.percentage).toBe(95);
      expect(savedResult.grade).toBe('A+');
      expect(savedResult.isPassed).toBe(true);
    });

    it('should reject marks exceeding maximum marks with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/results')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          examId: exam._id.toString(),
          subjectId: mathSubject._id.toString(),
          entries: [{ studentId: student1._id.toString(), marksObtained: 105 }], // Exceeds 100
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('cannot exceed maximum marks');
    });
  });

  // ==========================================
  // MANDATORY ACCEPTANCE TEST 4:
  // Guardian can access ONLY linked student information
  // ==========================================
  describe('ACCEPTANCE TEST 4: Guardian Child Access Isolation', () => {
    it('should allow guardian to access their linked child profile', async () => {
      const res = await request(app)
        .get(`/api/students/${student1._id}`)
        .set('Authorization', `Bearer ${guardian1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(student1._id.toString());
      expect(res.body.data.firstName).toBe('Student');
    });

    it('should REJECT guardian trying to access another student profile with 403 Forbidden', async () => {
      // Guardian 1 attempts to access student 2 (who belongs to Guardian 2)
      const res = await request(app)
        .get(`/api/students/${student2._id}`)
        .set('Authorization', `Bearer ${guardian1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('should only return linked students when querying /api/guardians/my-children', async () => {
      const res = await request(app)
        .get('/api/guardians/my-children')
        .set('Authorization', `Bearer ${guardian1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id.toString()).toBe(student1._id.toString());
    });
  });

  // ==========================================
  // MANDATORY ACCEPTANCE TEST 5:
  // Fee due and paid totals reconcile correctly with payment ledger
  // ==========================================
  describe('ACCEPTANCE TEST 5: Financial Ledger Reconciliation', () => {
    let invoice;

    beforeAll(async () => {
      const invRes = await request(app)
        .post('/api/fees/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: student1._id.toString(),
          feeStructureId: feeStructure1._id.toString(),
          totalAmount: 1000,
          dueDate: '2026-12-31',
        });
      invoice = invRes.body.data;
    });

    it('should record partial payment and reconcile paid and outstanding amounts', async () => {
      const payRes = await request(app)
        .post('/api/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoiceId: invoice._id,
          amount: 400,
          paymentMethod: 'UPI',
          transactionReference: 'TEST-TXN-001',
        });

      expect(payRes.status).toBe(201);
      expect(payRes.body.data.invoiceSummary.paidAmount).toBe(400);
      expect(payRes.body.data.invoiceSummary.outstandingAmount).toBe(600);
      expect(payRes.body.data.invoiceSummary.status).toBe('Partially Paid');

      // Verify in DB
      const dbInvoice = await FeeInvoice.findById(invoice._id);
      expect(dbInvoice.paidAmount).toBe(400);
      expect(dbInvoice.outstandingAmount).toBe(600);
      expect(dbInvoice.status).toBe('Partially Paid');
    });

    it('should reject payment exceeding outstanding balance with 400 Bad Request', async () => {
      // Remaining is 600, attempting to pay 700
      const payRes = await request(app)
        .post('/api/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoiceId: invoice._id,
          amount: 700,
          paymentMethod: 'Cash',
        });

      expect(payRes.status).toBe(400);
      expect(payRes.body.success).toBe(false);
      expect(payRes.body.message).toContain('exceeds outstanding balance');
    });

    it('should complete payment and mark invoice as Paid when full amount is paid', async () => {
      const payRes = await request(app)
        .post('/api/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoiceId: invoice._id,
          amount: 600,
          paymentMethod: 'Card',
          transactionReference: 'TEST-TXN-002',
        });

      expect(payRes.status).toBe(201);
      expect(payRes.body.data.invoiceSummary.paidAmount).toBe(1000);
      expect(payRes.body.data.invoiceSummary.outstandingAmount).toBe(0);
      expect(payRes.body.data.invoiceSummary.status).toBe('Paid');
    });
  });

  // ==========================================
  // ADDITIONAL NEGATIVE & SECURITY TESTS
  // ==========================================
  describe('Additional Security & Boundary Negative Tests', () => {
    it('should reject unauthenticated request with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/students');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthorized role access with 403 Forbidden', async () => {
      // Teacher attempting admin-only endpoint: POST /api/students
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${teacher1Token}`)
        .send({
          admissionNumber: 'ADM-HACK',
          firstName: 'Bad',
          lastName: 'Actor',
          dateOfBirth: '2010-01-01',
          gender: 'male',
          classId: class1._id.toString(),
          sectionId: sec1A._id.toString(),
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should prevent duplicate transaction reference with 400 Bad Request', async () => {
      // Create new invoice
      const invRes = await request(app)
        .post('/api/fees/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: student2._id.toString(),
          feeStructureId: feeStructure1._id.toString(),
          totalAmount: 500,
          dueDate: '2026-12-31',
        });

      // Payment with already used txn ref 'TEST-TXN-001'
      const payRes = await request(app)
        .post('/api/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoiceId: invRes.body.data._id,
          amount: 100,
          paymentMethod: 'Cash',
          transactionReference: 'TEST-TXN-001', // Duplicate
        });

      expect(payRes.status).toBe(400);
      expect(payRes.body.message).toContain('already exists');
    });

    it('should reject invalid or non-existent student reference with 404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/students/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Student not found');
    });
  });
});
