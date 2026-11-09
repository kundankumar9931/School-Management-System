import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const studentCreateSchema = z.object({
  admissionNumber: z.string().min(1, 'Admission number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().or(z.date()),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
  profileImageUrl: z.string().optional(),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  admissionDate: z.string().or(z.date()).optional(),
  guardianId: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'graduated']).default('active'),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export const guardianCreateSchema = z.object({
  fullName: z.string().min(1, 'Guardian full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  relationship: z.enum(['Father', 'Mother', 'Legal Guardian', 'Relative', 'Other']).default('Father'),
  address: z.string().optional(),
  occupation: z.string().optional(),
  linkedStudentIds: z.array(z.string()).optional(),
  createAccount: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export const guardianUpdateSchema = guardianCreateSchema.partial();

export const teacherCreateSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  experienceYears: z.number().min(0).default(0),
  joiningDate: z.string().or(z.date()).optional(),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  createAccount: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export const teacherUpdateSchema = teacherCreateSchema.partial();

export const classCreateSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  academicYear: z.string().default('2025-2026'),
  classTeacherId: z.string().optional().nullable(),
  description: z.string().optional(),
});

export const sectionCreateSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  classId: z.string().min(1, 'Class reference is required'),
  capacity: z.number().min(1).default(40),
  roomNumber: z.string().optional(),
});

export const subjectCreateSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  description: z.string().optional(),
  maxMarks: z.number().min(1).default(100),
  passingMarks: z.number().min(0).default(40),
});

export const assignmentCreateSchema = z.object({
  teacherId: z.string().min(1, 'Teacher reference is required'),
  classId: z.string().min(1, 'Class reference is required'),
  sectionId: z.string().min(1, 'Section reference is required'),
  subjectId: z.string().min(1, 'Subject reference is required'),
  academicYear: z.string().default('2025-2026'),
});

export const attendanceItemSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  status: z.enum(['Present', 'Absent', 'Late', 'Excused']),
  remarks: z.string().optional(),
});

export const attendanceSubmitSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  date: z.string().min(1, 'Date is required'),
  session: z.enum(['Morning', 'Afternoon']).default('Morning'),
  records: z.array(attendanceItemSchema).min(1, 'At least one student record is required'),
});

export const examCreateSchema = z.object({
  name: z.string().min(1, 'Exam name is required'),
  examType: z.enum(['Midterm', 'Final', 'Quarterly', 'Unit Test', 'Practical']).default('Midterm'),
  academicYear: z.string().default('2025-2026'),
  classId: z.string().min(1, 'Class is required'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z.enum(['Draft', 'Scheduled', 'Ongoing', 'Completed', 'Published']).default('Scheduled'),
  description: z.string().optional(),
  subjects: z
    .array(
      z.object({
        subjectId: z.string().min(1),
        examDate: z.string().or(z.date()),
        maxMarks: z.number().min(1).default(100),
        passingMarks: z.number().min(0).default(40),
      })
    )
    .optional(),
});

export const marksEntryItemSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  marksObtained: z.number().min(0, 'Marks must be greater than or equal to 0'),
  maxMarks: z.number().min(1).default(100),
  remarks: z.string().optional(),
});

export const marksSubmitSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  entries: z.array(marksEntryItemSchema).min(1, 'At least one entry required'),
});

export const feeStructureCreateSchema = z.object({
  name: z.string().min(1, 'Fee structure name is required'),
  classId: z.string().min(1, 'Class is required'),
  academicYear: z.string().default('2025-2026'),
  amount: z.number().min(0, 'Fee amount must be non-negative'),
  dueDate: z.string().or(z.date()),
  feeType: z.enum(['Tuition', 'Admission', 'Examination', 'Laboratory', 'Library', 'Sports', 'Other']).default('Tuition'),
  description: z.string().optional(),
});

export const feeInvoiceCreateSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  feeStructureId: z.string().min(1, 'Fee structure ID is required'),
  totalAmount: z.number().min(0, 'Total amount must be non-negative').optional(),
  dueDate: z.string().or(z.date()).optional(),
  remarks: z.string().optional(),
});

export const paymentCreateSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque']).default('Cash'),
  transactionReference: z.string().optional(),
  notes: z.string().optional(),
});

export const gradingRuleCreateSchema = z.object({
  grade: z.string().min(1, 'Grade label is required'),
  minPercentage: z.number().min(0).max(100),
  maxPercentage: z.number().min(0).max(100),
  gradePoint: z.number().min(0),
  isPassing: z.boolean().default(true),
  description: z.string().optional(),
});
