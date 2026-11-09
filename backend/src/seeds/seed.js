import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import {
  User,
  Student,
  Guardian,
  Teacher,
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
  AuditLog,
} from '../models/index.js';

export const seedDatabase = async () => {
  console.log('[Seeder] Connecting to MongoDB...');
  await mongoose.connect(env.MONGODB_URI);

  console.log('[Seeder] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Guardian.deleteMany({}),
    Teacher.deleteMany({}),
    Class.deleteMany({}),
    Section.deleteMany({}),
    Subject.deleteMany({}),
    TeacherAssignment.deleteMany({}),
    Attendance.deleteMany({}),
    Examination.deleteMany({}),
    ExamSubject.deleteMany({}),
    Result.deleteMany({}),
    GradingRule.deleteMany({}),
    FeeStructure.deleteMany({}),
    FeeInvoice.deleteMany({}),
    Payment.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log('[Seeder] Creating Grading Rules...');
  await GradingRule.insertMany([
    { grade: 'A+', minPercentage: 90, maxPercentage: 100, gradePoint: 4.0, isPassing: true, description: 'Outstanding' },
    { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gradePoint: 3.5, isPassing: true, description: 'Excellent' },
    { grade: 'B', minPercentage: 70, maxPercentage: 79.99, gradePoint: 3.0, isPassing: true, description: 'Very Good' },
    { grade: 'C', minPercentage: 60, maxPercentage: 69.99, gradePoint: 2.5, isPassing: true, description: 'Good / Average' },
    { grade: 'D', minPercentage: 50, maxPercentage: 59.99, gradePoint: 2.0, isPassing: true, description: 'Pass / Satisfactory' },
    { grade: 'F', minPercentage: 0, maxPercentage: 49.99, gradePoint: 0.0, isPassing: false, description: 'Fail / Needs Remediation' },
  ]);

  console.log('[Seeder] Creating User Accounts...');
  const passwordHashAdmin = await bcrypt.hash('Admin@123', 10);
  const passwordHashTeacher = await bcrypt.hash('Teacher@123', 10);
  const passwordHashGuardian = await bcrypt.hash('Guardian@123', 10);

  // 1 Admin
  const adminUser = await User.create({
    email: 'admin@school.com',
    passwordHash: passwordHashAdmin,
    role: 'admin',
    status: 'active',
  });

  // 3 Teachers
  const teacherUser1 = await User.create({
    email: 'john.doe@school.com',
    passwordHash: passwordHashTeacher,
    role: 'teacher',
    status: 'active',
  });
  const teacherUser2 = await User.create({
    email: 'sarah.connor@school.com',
    passwordHash: passwordHashTeacher,
    role: 'teacher',
    status: 'active',
  });
  const teacherUser3 = await User.create({
    email: 'michael.scott@school.com',
    passwordHash: passwordHashTeacher,
    role: 'teacher',
    status: 'active',
  });

  // 5 Guardians
  const guardianUser1 = await User.create({
    email: 'robert.smith@mail.com',
    passwordHash: passwordHashGuardian,
    role: 'guardian',
    status: 'active',
  });
  const guardianUser2 = await User.create({
    email: 'emily.davis@mail.com',
    passwordHash: passwordHashGuardian,
    role: 'guardian',
    status: 'active',
  });
  const guardianUser3 = await User.create({
    email: 'james.wilson@mail.com',
    passwordHash: passwordHashGuardian,
    role: 'guardian',
    status: 'active',
  });
  const guardianUser4 = await User.create({
    email: 'patricia.brown@mail.com',
    passwordHash: passwordHashGuardian,
    role: 'guardian',
    status: 'active',
  });
  const guardianUser5 = await User.create({
    email: 'david.taylor@mail.com',
    passwordHash: passwordHashGuardian,
    role: 'guardian',
    status: 'active',
  });

  console.log('[Seeder] Creating Teacher Profiles...');
  const teacher1 = await Teacher.create({
    userId: teacherUser1._id,
    employeeId: 'TCH-001',
    fullName: 'John Doe',
    email: 'john.doe@school.com',
    phone: '+1 555-0101',
    qualification: 'M.Sc. Mathematics, B.Ed.',
    experienceYears: 8,
    department: 'Mathematics',
  });
  const teacher2 = await Teacher.create({
    userId: teacherUser2._id,
    employeeId: 'TCH-002',
    fullName: 'Sarah Connor',
    email: 'sarah.connor@school.com',
    phone: '+1 555-0102',
    qualification: 'M.Sc. Physics, Ph.D. Candidate',
    experienceYears: 6,
    department: 'Sciences',
  });
  const teacher3 = await Teacher.create({
    userId: teacherUser3._id,
    employeeId: 'TCH-003',
    fullName: 'Michael Scott',
    email: 'michael.scott@school.com',
    phone: '+1 555-0103',
    qualification: 'M.A. English Literature',
    experienceYears: 10,
    department: 'Languages',
  });

  console.log('[Seeder] Creating Classes & Sections...');
  const class9 = await Class.create({
    name: 'Grade 9',
    academicYear: '2025-2026',
    classTeacherId: teacher1._id,
    description: 'Freshman High School',
  });
  const class10 = await Class.create({
    name: 'Grade 10',
    academicYear: '2025-2026',
    classTeacherId: teacher2._id,
    description: 'Sophomore High School',
  });
  const class11 = await Class.create({
    name: 'Grade 11',
    academicYear: '2025-2026',
    classTeacherId: teacher3._id,
    description: 'Junior High School',
  });

  const sec9A = await Section.create({ name: 'A', classId: class9._id, capacity: 35, roomNumber: '101' });
  const sec9B = await Section.create({ name: 'B', classId: class9._id, capacity: 35, roomNumber: '102' });
  const sec10A = await Section.create({ name: 'A', classId: class10._id, capacity: 40, roomNumber: '201' });
  const sec10B = await Section.create({ name: 'B', classId: class10._id, capacity: 40, roomNumber: '202' });
  const sec11A = await Section.create({ name: 'A', classId: class11._id, capacity: 30, roomNumber: '301' });

  console.log('[Seeder] Creating Subjects...');
  const subMath = await Subject.create({
    name: 'Mathematics',
    code: 'MATH101',
    description: 'Algebra, Geometry, and Advanced Calculus',
    maxMarks: 100,
    passingMarks: 40,
  });
  const subSci = await Subject.create({
    name: 'Science',
    code: 'SCI102',
    description: 'Integrated Physics, Chemistry, and Biology',
    maxMarks: 100,
    passingMarks: 40,
  });
  const subEng = await Subject.create({
    name: 'English',
    code: 'ENG103',
    description: 'Literature, Reading Comprehension, and Grammar',
    maxMarks: 100,
    passingMarks: 40,
  });
  const subSoc = await Subject.create({
    name: 'Social Studies',
    code: 'SOC104',
    description: 'World History, Geography, and Civics',
    maxMarks: 100,
    passingMarks: 40,
  });
  const subCS = await Subject.create({
    name: 'Computer Science',
    code: 'CS105',
    description: 'Programming fundamentals and algorithms',
    maxMarks: 100,
    passingMarks: 40,
  });

  console.log('[Seeder] Creating Teacher Assignments...');
  await TeacherAssignment.insertMany([
    // John Doe assigned to Grade 10 Section A & B Math, and Grade 9 Section A Math
    { teacherId: teacher1._id, classId: class10._id, sectionId: sec10A._id, subjectId: subMath._id, academicYear: '2025-2026' },
    { teacherId: teacher1._id, classId: class10._id, sectionId: sec10B._id, subjectId: subMath._id, academicYear: '2025-2026' },
    { teacherId: teacher1._id, classId: class9._id, sectionId: sec9A._id, subjectId: subMath._id, academicYear: '2025-2026' },
    // Sarah Connor assigned to Science
    { teacherId: teacher2._id, classId: class10._id, sectionId: sec10A._id, subjectId: subSci._id, academicYear: '2025-2026' },
    { teacherId: teacher2._id, classId: class9._id, sectionId: sec9A._id, subjectId: subSci._id, academicYear: '2025-2026' },
    { teacherId: teacher2._id, classId: class11._id, sectionId: sec11A._id, subjectId: subSci._id, academicYear: '2025-2026' },
    // Michael Scott assigned to English
    { teacherId: teacher3._id, classId: class10._id, sectionId: sec10A._id, subjectId: subEng._id, academicYear: '2025-2026' },
    { teacherId: teacher3._id, classId: class10._id, sectionId: sec10B._id, subjectId: subEng._id, academicYear: '2025-2026' },
    { teacherId: teacher3._id, classId: class9._id, sectionId: sec9B._id, subjectId: subEng._id, academicYear: '2025-2026' },
  ]);

  console.log('[Seeder] Creating Guardians...');
  const guardian1 = await Guardian.create({
    userId: guardianUser1._id,
    fullName: 'Robert Smith',
    email: 'robert.smith@mail.com',
    phone: '+1 555-0201',
    relationship: 'Father',
    address: '742 Evergreen Terrace, Springfield',
    occupation: 'Civil Engineer',
  });
  const guardian2 = await Guardian.create({
    userId: guardianUser2._id,
    fullName: 'Emily Davis',
    email: 'emily.davis@mail.com',
    phone: '+1 555-0202',
    relationship: 'Mother',
    address: '100 Main St, Apt 4B, Springfield',
    occupation: 'Financial Analyst',
  });
  const guardian3 = await Guardian.create({
    userId: guardianUser3._id,
    fullName: 'James Wilson',
    email: 'james.wilson@mail.com',
    phone: '+1 555-0203',
    relationship: 'Father',
    address: '55 Pine Creek Rd, Springfield',
    occupation: 'Architect',
  });
  const guardian4 = await Guardian.create({
    userId: guardianUser4._id,
    fullName: 'Patricia Brown',
    email: 'patricia.brown@mail.com',
    phone: '+1 555-0204',
    relationship: 'Mother',
    address: '88 Elm Court, Springfield',
    occupation: 'Dentist',
  });
  const guardian5 = await Guardian.create({
    userId: guardianUser5._id,
    fullName: 'David Taylor',
    email: 'david.taylor@mail.com',
    phone: '+1 555-0205',
    relationship: 'Legal Guardian',
    address: '12 Oak Boulevard, Springfield',
    occupation: 'Attorney',
  });

  console.log('[Seeder] Creating 12 Students...');
  const rawStudents = [
    { adm: 'ADM-2025-001', first: 'Lucas', last: 'Smith', dob: '2009-04-12', gen: 'male', cls: class10._id, sec: sec10A._id, g: guardian1._id },
    { adm: 'ADM-2025-002', first: 'Emma', last: 'Smith', dob: '2010-09-20', gen: 'female', cls: class9._id, sec: sec9A._id, g: guardian1._id },
    { adm: 'ADM-2025-003', first: 'Oliver', last: 'Davis', dob: '2009-02-14', gen: 'male', cls: class10._id, sec: sec10A._id, g: guardian2._id },
    { adm: 'ADM-2025-004', first: 'Sophia', last: 'Davis', dob: '2008-11-05', gen: 'female', cls: class11._id, sec: sec11A._id, g: guardian2._id },
    { adm: 'ADM-2025-005', first: 'Ethan', last: 'Wilson', dob: '2009-06-25', gen: 'male', cls: class10._id, sec: sec10A._id, g: guardian3._id },
    { adm: 'ADM-2025-006', first: 'Mia', last: 'Wilson', dob: '2010-01-30', gen: 'female', cls: class9._id, sec: sec9B._id, g: guardian3._id },
    { adm: 'ADM-2025-007', first: 'Noah', last: 'Brown', dob: '2009-08-18', gen: 'male', cls: class10._id, sec: sec10B._id, g: guardian4._id },
    { adm: 'ADM-2025-008', first: 'Ava', last: 'Brown', dob: '2010-03-11', gen: 'female', cls: class9._id, sec: sec9A._id, g: guardian4._id },
    { adm: 'ADM-2025-009', first: 'Liam', last: 'Taylor', dob: '2009-12-02', gen: 'male', cls: class10._id, sec: sec10A._id, g: guardian5._id },
    { adm: 'ADM-2025-010', first: 'Isabella', last: 'Taylor', dob: '2008-07-19', gen: 'female', cls: class11._id, sec: sec11A._id, g: guardian5._id },
    { adm: 'ADM-2025-011', first: 'Alexander', last: 'Miller', dob: '2009-05-15', gen: 'male', cls: class10._id, sec: sec10B._id, g: guardian1._id },
    { adm: 'ADM-2025-012', first: 'Charlotte', last: 'Garcia', dob: '2010-10-10', gen: 'female', cls: class9._id, sec: sec9B._id, g: guardian2._id },
  ];

  const createdStudents = [];
  for (const s of rawStudents) {
    const student = await Student.create({
      admissionNumber: s.adm,
      firstName: s.first,
      lastName: s.last,
      dateOfBirth: new Date(s.dob),
      gender: s.gen,
      email: `${s.first.toLowerCase()}.${s.last.toLowerCase()}@student.school.com`,
      phone: '+1 555-0300',
      address: { street: '123 Academic Way', city: 'Springfield', state: 'IL', postalCode: '62701' },
      classId: s.cls,
      sectionId: s.sec,
      guardianId: s.g,
      status: 'active',
    });
    createdStudents.push(student);

    // Link student in guardian's array
    await Guardian.findByIdAndUpdate(s.g, {
      $addToSet: { linkedStudentIds: student._id },
    });
  }

  console.log('[Seeder] Creating Attendance Records...');
  // Generate attendance for past 5 weekdays for Grade 10 Section A
  const dates = [];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setUTCHours(0, 0, 0, 0);
    dates.push(d);
  }

  const attendanceRecords = [];
  const g10Students = createdStudents.filter((s) => s.classId.toString() === class10._id.toString() && s.sectionId.toString() === sec10A._id.toString());

  dates.forEach((targetDate, dateIndex) => {
    g10Students.forEach((student, studentIndex) => {
      // Create slight variation in status
      let status = 'Present';
      if ((studentIndex + dateIndex) % 7 === 0) status = 'Late';
      else if ((studentIndex + dateIndex) % 11 === 0) status = 'Absent';

      attendanceRecords.push({
        studentId: student._id,
        classId: class10._id,
        sectionId: sec10A._id,
        teacherId: teacher1._id,
        date: targetDate,
        session: 'Morning',
        status,
        remarks: status === 'Late' ? 'Late bus arrival' : '',
      });
    });
  });
  await Attendance.insertMany(attendanceRecords);

  console.log('[Seeder] Creating Examinations & Marks...');
  const exam = await Examination.create({
    name: 'Midterm Examination 2025',
    examType: 'Midterm',
    academicYear: '2025-2026',
    classId: class10._id,
    startDate: new Date('2025-10-10'),
    endDate: new Date('2025-10-20'),
    status: 'Published',
    description: 'First Semester Midterm Comprehensive Assessments',
  });

  await ExamSubject.insertMany([
    { examId: exam._id, subjectId: subMath._id, examDate: new Date('2025-10-12'), maxMarks: 100, passingMarks: 40 },
    { examId: exam._id, subjectId: subSci._id, examDate: new Date('2025-10-15'), maxMarks: 100, passingMarks: 40 },
    { examId: exam._id, subjectId: subEng._id, examDate: new Date('2025-10-18'), maxMarks: 100, passingMarks: 40 },
  ]);

  // Insert Results for Grade 10 Section A students
  const resultsData = [
    // Lucas Smith
    { student: g10Students[0], marks: [95, 88, 92] },
    // Oliver Davis
    { student: g10Students[1], marks: [82, 85, 78] },
    // Ethan Wilson
    { student: g10Students[2], marks: [74, 69, 75] },
    // Liam Taylor
    { student: g10Students[3], marks: [91, 94, 89] },
  ];

  const examSubjectsList = [subMath, subSci, subEng];
  for (const entry of resultsData) {
    if (!entry.student) continue;
    for (let idx = 0; idx < examSubjectsList.length; idx++) {
      const sub = examSubjectsList[idx];
      const marksObtained = entry.marks[idx];
      const percentage = marksObtained;
      let grade = 'A';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else grade = 'D';

      await Result.create({
        studentId: entry.student._id,
        examId: exam._id,
        subjectId: sub._id,
        marksObtained,
        maxMarks: 100,
        percentage,
        grade,
        isPassed: true,
        remarks: 'Consistent academic performance',
        evaluatedByTeacherId: teacher1._id,
      });
    }
  }

  console.log('[Seeder] Creating Fee Structures & Invoices...');
  const tuitionStructure = await FeeStructure.create({
    name: 'Annual Tuition Fee - Grade 10',
    classId: class10._id,
    academicYear: '2025-2026',
    amount: 1500,
    dueDate: new Date('2025-11-30'),
    feeType: 'Tuition',
    description: 'Annual academic tuition and classroom instruction fee',
  });

  const labStructure = await FeeStructure.create({
    name: 'Science Laboratory Fee - Grade 10',
    classId: class10._id,
    academicYear: '2025-2026',
    amount: 300,
    dueDate: new Date('2025-10-15'),
    feeType: 'Laboratory',
    description: 'Chemistry & Physics equipment and consumable materials',
  });

  // Generate Invoices and Simulated Payments
  let invCount = 1;
  for (let idx = 0; idx < g10Students.length; idx++) {
    const student = g10Students[idx];
    const invoiceNumber = `INV-2025-${String(invCount++).padStart(5, '0')}`;

    // Lucas Smith has fully paid
    if (idx === 0) {
      const inv = await FeeInvoice.create({
        invoiceNumber,
        studentId: student._id,
        feeStructureId: tuitionStructure._id,
        totalAmount: 1500,
        paidAmount: 1500,
        outstandingAmount: 0,
        dueDate: tuitionStructure.dueDate,
        status: 'Paid',
      });
      await Payment.create({
        paymentId: `PAY-2025-${String(idx + 1).padStart(5, '0')}`,
        invoiceId: inv._id,
        studentId: student._id,
        amount: 1500,
        paymentDate: new Date(),
        paymentMethod: 'UPI',
        transactionReference: 'SIM-UPI-99281726',
        status: 'Success',
        recordedByUserId: adminUser._id,
        receiptNumber: 'REC-100201',
      });
    }
    // Oliver Davis has partially paid
    else if (idx === 1) {
      const inv = await FeeInvoice.create({
        invoiceNumber,
        studentId: student._id,
        feeStructureId: tuitionStructure._id,
        totalAmount: 1500,
        paidAmount: 800,
        outstandingAmount: 700,
        dueDate: tuitionStructure.dueDate,
        status: 'Partially Paid',
      });
      await Payment.create({
        paymentId: `PAY-2025-${String(idx + 1).padStart(5, '0')}`,
        invoiceId: inv._id,
        studentId: student._id,
        amount: 800,
        paymentDate: new Date(),
        paymentMethod: 'Card',
        transactionReference: 'SIM-CARD-88123491',
        status: 'Success',
        recordedByUserId: adminUser._id,
        receiptNumber: 'REC-100202',
      });
    }
    // Others have unpaid or overdue invoices
    else {
      await FeeInvoice.create({
        invoiceNumber,
        studentId: student._id,
        feeStructureId: tuitionStructure._id,
        totalAmount: 1500,
        paidAmount: 0,
        outstandingAmount: 1500,
        dueDate: tuitionStructure.dueDate,
        status: 'Unpaid',
      });
    }
  }

  console.log('[Seeder] Creating Initial Audit Logs...');
  await AuditLog.insertMany([
    {
      userId: adminUser._id,
      userRole: 'admin',
      userEmail: 'admin@school.com',
      action: 'INITIALIZE_SYSTEM',
      entityType: 'System',
      entityId: 'SYSTEM-ROOT',
      changeSummary: { message: 'Database populated with production-grade seed data' },
      ipAddress: '127.0.0.1',
    },
    {
      userId: teacherUser1._id,
      userRole: 'teacher',
      userEmail: 'john.doe@school.com',
      action: 'RECORD_ATTENDANCE',
      entityType: 'Attendance',
      entityId: `${class10._id}_${sec10A._id}`,
      changeSummary: { session: 'Morning', count: g10Students.length },
      ipAddress: '127.0.0.1',
    },
  ]);

  console.log('===========================================================');
  console.log(' DEMO CREDENTIALS:');
  console.log(' Admin:    admin@school.com         / Admin@123');
  console.log(' Teacher:  john.doe@school.com      / Teacher@123');
  console.log(' Teacher:  sarah.connor@school.com  / Teacher@123');
  console.log(' Guardian: robert.smith@mail.com    / Guardian@123');
  console.log(' Guardian: emily.davis@mail.com     / Guardian@123');
  console.log('===========================================================');
  console.log('[Seeder] Database seeding completed successfully!');
};

// Allow executing directly via CLI `node src/seeds/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seeder] Fatal error seeding database:', err);
      process.exit(1);
    });
}
