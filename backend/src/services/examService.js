import { Examination, ExamSubject, Result, GradingRule, Student, Subject, TeacherAssignment } from '../models/index.js';
import { logAudit } from './auditService.js';

export const examService = {
  async getAllExams(query = {}) {
    const filter = {};
    if (query.classId) filter.classId = query.classId;
    if (query.academicYear) filter.academicYear = query.academicYear;
    if (query.status) filter.status = query.status;

    const exams = await Examination.find(filter)
      .populate('classId', 'name academicYear')
      .sort({ startDate: -1 });

    const examIds = exams.map((e) => e._id);
    const subjects = await ExamSubject.find({ examId: { $in: examIds } }).populate('subjectId', 'name code');

    return exams.map((exam) => {
      const examObj = exam.toObject();
      examObj.subjects = subjects.filter((s) => s.examId.toString() === exam._id.toString());
      return examObj;
    });
  },

  async getExamById(id) {
    const exam = await Examination.findById(id).populate('classId', 'name academicYear');
    if (!exam) {
      const err = new Error('Examination not found');
      err.statusCode = 404;
      throw err;
    }

    const subjects = await ExamSubject.find({ examId: id }).populate('subjectId', 'name code maxMarks passingMarks');
    const examObj = exam.toObject();
    examObj.subjects = subjects;
    return examObj;
  },

  async createExam(data, req) {
    const exam = await Examination.create({
      name: data.name,
      examType: data.examType,
      academicYear: data.academicYear,
      classId: data.classId,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || 'Scheduled',
      description: data.description,
    });

    if (data.subjects && data.subjects.length > 0) {
      const examSubjects = data.subjects.map((sub) => ({
        examId: exam._id,
        subjectId: sub.subjectId,
        examDate: sub.examDate,
        maxMarks: sub.maxMarks || 100,
        passingMarks: sub.passingMarks || 40,
      }));
      await ExamSubject.insertMany(examSubjects);
    }

    await logAudit({
      req,
      action: 'CREATE_EXAMINATION',
      entityType: 'Examination',
      entityId: exam._id,
      changeSummary: data,
    });

    return this.getExamById(exam._id);
  },

  async updateExam(id, data, req) {
    const exam = await Examination.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!exam) {
      const err = new Error('Examination not found');
      err.statusCode = 404;
      throw err;
    }

    await logAudit({
      req,
      action: 'UPDATE_EXAMINATION',
      entityType: 'Examination',
      entityId: exam._id,
      changeSummary: data,
    });

    return this.getExamById(id);
  },

  async deleteExam(id, req) {
    const exam = await Examination.findByIdAndDelete(id);
    if (!exam) {
      const err = new Error('Examination not found');
      err.statusCode = 404;
      throw err;
    }

    await Promise.all([
      ExamSubject.deleteMany({ examId: id }),
      Result.deleteMany({ examId: id }),
    ]);

    await logAudit({
      req,
      action: 'DELETE_EXAMINATION',
      entityType: 'Examination',
      entityId: id,
    });

    return { message: 'Examination and associated results deleted successfully' };
  },

  // Calculate grade based on configured GradingRule
  async calculateGrade(percentage) {
    const rules = await GradingRule.find().sort({ minPercentage: -1 });

    if (rules.length === 0) {
      // Default fallback standard scale
      if (percentage >= 90) return { grade: 'A+', isPassed: true };
      if (percentage >= 80) return { grade: 'A', isPassed: true };
      if (percentage >= 70) return { grade: 'B', isPassed: true };
      if (percentage >= 60) return { grade: 'C', isPassed: true };
      if (percentage >= 50) return { grade: 'D', isPassed: true };
      return { grade: 'F', isPassed: false };
    }

    for (const rule of rules) {
      if (percentage >= rule.minPercentage && percentage <= rule.maxPercentage) {
        return {
          grade: rule.grade,
          isPassed: rule.isPassing,
        };
      }
    }

    // Lowest fallback
    const lowest = rules[rules.length - 1];
    return {
      grade: lowest.grade,
      isPassed: lowest.isPassing,
    };
  },

  async submitMarks({ examId, subjectId, entries, user, teacher, req }) {
    const exam = await Examination.findById(examId);
    if (!exam) {
      const err = new Error('Examination not found');
      err.statusCode = 404;
      throw err;
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      const err = new Error('Subject not found');
      err.statusCode = 404;
      throw err;
    }

    // Role check: if teacher, verify assignment to subject for this class
    if (user.role === 'teacher') {
      if (!teacher) {
        const err = new Error('Teacher profile not found');
        err.statusCode = 403;
        throw err;
      }
      const isAssigned = await TeacherAssignment.findOne({
        teacherId: teacher._id,
        classId: exam.classId,
        subjectId,
        status: 'active',
      });
      if (!isAssigned) {
        const err = new Error('Access denied. You can only enter marks for subjects assigned to you.');
        err.statusCode = 403;
        throw err;
      }
    }

    // Look up exam subject config for max marks
    const examSub = await ExamSubject.findOne({ examId, subjectId });
    const maxMarks = examSub?.maxMarks || subject.maxMarks || 100;
    const passingMarks = examSub?.passingMarks || subject.passingMarks || 40;

    const savedResults = [];

    for (const entry of entries) {
      if (entry.marksObtained > maxMarks) {
        const err = new Error(
          `Marks obtained (${entry.marksObtained}) cannot exceed maximum marks (${maxMarks}) for student ${entry.studentId}`
        );
        err.statusCode = 400;
        throw err;
      }

      const percentage = Number(((entry.marksObtained / maxMarks) * 100).toFixed(2));
      const gradeResult = await this.calculateGrade(percentage);
      const isPassed = entry.marksObtained >= passingMarks && gradeResult.isPassed;

      const result = await Result.findOneAndUpdate(
        {
          studentId: entry.studentId,
          examId,
          subjectId,
        },
        {
          $set: {
            marksObtained: entry.marksObtained,
            maxMarks,
            percentage,
            grade: gradeResult.grade,
            isPassed,
            remarks: entry.remarks || '',
            evaluatedByTeacherId: teacher?._id || null,
          },
        },
        { upsert: true, new: true, runValidators: true }
      );

      savedResults.push(result);
    }

    await logAudit({
      req,
      action: 'SUBMIT_MARKS',
      entityType: 'Result',
      entityId: `${examId}_${subjectId}`,
      changeSummary: {
        examId,
        subjectId,
        entriesCount: entries.length,
      },
    });

    return savedResults;
  },

  async getResults({ examId, subjectId, classId, sectionId, studentId, user, teacher, guardian }) {
    const filter = {};
    if (examId) filter.examId = examId;
    if (subjectId) filter.subjectId = subjectId;

    if (user.role === 'guardian') {
      if (!guardian) return [];
      filter.studentId = { $in: guardian.linkedStudentIds };
      if (studentId) {
        if (!guardian.linkedStudentIds.some((id) => id.toString() === studentId.toString())) {
          const err = new Error('Access denied. Cannot access results for unlinked student.');
          err.statusCode = 403;
          throw err;
        }
        filter.studentId = studentId;
      }
    } else if (studentId) {
      filter.studentId = studentId;
    }

    const results = await Result.find(filter)
      .populate('studentId', 'admissionNumber firstName lastName classId sectionId')
      .populate('subjectId', 'name code')
      .populate('examId', 'name examType academicYear')
      .sort({ createdAt: -1 });

    return results;
  },

  async getStudentReportCard(studentId, examId, { user, teacher, guardian }) {
    const student = await Student.findById(studentId)
      .populate('classId', 'name academicYear')
      .populate('sectionId', 'name')
      .populate('guardianId', 'fullName email phone');

    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }

    // Role ownership check
    if (user.role === 'guardian') {
      const isLinked = guardian?.linkedStudentIds?.some((id) => id.toString() === studentId.toString());
      if (!isLinked) {
        const err = new Error('Access denied. You can only view report cards for your linked children.');
        err.statusCode = 403;
        throw err;
      }
    }

    const exam = await Examination.findById(examId);
    if (!exam) {
      const err = new Error('Examination not found');
      err.statusCode = 404;
      throw err;
    }

    const results = await Result.find({ studentId, examId })
      .populate('subjectId', 'name code maxMarks passingMarks')
      .sort({ 'subjectId.name': 1 });

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let allSubjectsPassed = true;

    const subjectsSummary = results.map((res) => {
      totalMarksObtained += res.marksObtained;
      totalMaxMarks += res.maxMarks;
      if (!res.isPassed) allSubjectsPassed = false;

      return {
        subjectName: res.subjectId?.name || 'Subject',
        subjectCode: res.subjectId?.code || '',
        marksObtained: res.marksObtained,
        maxMarks: res.maxMarks,
        percentage: res.percentage,
        grade: res.grade,
        isPassed: res.isPassed,
        remarks: res.remarks,
      };
    });

    const overallPercentage = totalMaxMarks > 0 ? Number(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)) : 0;
    const overallGradeInfo = await this.calculateGrade(overallPercentage);
    const finalResultStatus = allSubjectsPassed && overallGradeInfo.isPassed ? 'Passed' : 'Needs Improvement';

    return {
      schoolName: 'Algions International Academy',
      academicYear: exam.academicYear,
      examName: exam.name,
      examType: exam.examType,
      generatedDate: new Date(),
      student: {
        _id: student._id,
        admissionNumber: student.admissionNumber,
        fullName: `${student.firstName} ${student.lastName}`,
        className: student.classId?.name,
        sectionName: student.sectionId?.name,
        guardianName: student.guardianId?.fullName || 'N/A',
      },
      subjects: subjectsSummary,
      summary: {
        totalMarksObtained,
        totalMaxMarks,
        percentage: overallPercentage,
        overallGrade: overallGradeInfo.grade,
        resultStatus: finalResultStatus,
      },
    };
  },
};
