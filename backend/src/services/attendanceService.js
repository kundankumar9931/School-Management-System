import { Attendance, Student, TeacherAssignment } from '../models/index.js';
import { logAudit } from './auditService.js';

export const attendanceService = {
  async recordAttendance({ classId, sectionId, date, session = 'Morning', records, user, teacher, req }) {
    // Check teacher assignment permission
    let teacherId = null;
    if (user.role === 'teacher') {
      if (!teacher) {
        const err = new Error('Teacher profile not found');
        err.statusCode = 403;
        throw err;
      }
      teacherId = teacher._id;
      const isAssigned = await TeacherAssignment.findOne({
        teacherId: teacher._id,
        classId,
        sectionId,
        status: 'active',
      });
      if (!isAssigned) {
        const err = new Error('Access denied. You can only record attendance for classes assigned to you.');
        err.statusCode = 403;
        throw err;
      }
    } else {
      teacherId = req.body.teacherId || null;
    }

    // Parse normalized date (start of day UTC)
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Verify students belong to this class and section
    const studentIds = records.map((r) => r.studentId);
    const validStudents = await Student.find({
      _id: { $in: studentIds },
      classId,
      sectionId,
      status: 'active',
    });

    if (validStudents.length !== records.length) {
      const validIdSet = new Set(validStudents.map((s) => s._id.toString()));
      const invalid = records.filter((r) => !validIdSet.has(r.studentId));
      const err = new Error(`One or more students do not belong to this class/section: ${invalid.map((i) => i.studentId).join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    // Atomic bulk write with upsert to prevent duplicates while permitting safe updates
    const bulkOps = records.map((record) => ({
      updateOne: {
        filter: {
          studentId: record.studentId,
          date: targetDate,
          session,
        },
        update: {
          $set: {
            classId,
            sectionId,
            teacherId: teacherId || user._id,
            status: record.status,
            remarks: record.remarks || '',
          },
        },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(bulkOps);

    await logAudit({
      req,
      action: 'RECORD_ATTENDANCE',
      entityType: 'Attendance',
      entityId: `${classId}_${sectionId}_${date}_${session}`,
      changeSummary: {
        classId,
        sectionId,
        date: targetDate,
        session,
        recordsCount: records.length,
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
      },
    });

    return {
      message: 'Attendance recorded successfully',
      date: targetDate,
      session,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
    };
  },

  async getDailyAttendance({ classId, sectionId, date, session = 'Morning', user, teacher }) {
    if (user.role === 'teacher') {
      const isAssigned = await TeacherAssignment.findOne({
        teacherId: teacher._id,
        classId,
        sectionId,
        status: 'active',
      });
      if (!isAssigned) {
        const err = new Error('Access denied. You can only view attendance for assigned classes.');
        err.statusCode = 403;
        throw err;
      }
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const students = await Student.find({ classId, sectionId, status: 'active' }).sort({
      admissionNumber: 1,
    });

    const attendanceRecords = await Attendance.find({
      classId,
      sectionId,
      date: targetDate,
      session,
    });

    const recordsMap = new Map();
    attendanceRecords.forEach((rec) => {
      recordsMap.set(rec.studentId.toString(), rec);
    });

    const studentListWithAttendance = students.map((s) => {
      const record = recordsMap.get(s._id.toString());
      return {
        studentId: s._id,
        admissionNumber: s.admissionNumber,
        firstName: s.firstName,
        lastName: s.lastName,
        fullName: `${s.firstName} ${s.lastName}`,
        status: record ? record.status : 'Present',
        remarks: record ? record.remarks : '',
        attendanceId: record ? record._id : null,
      };
    });

    return {
      date: targetDate,
      session,
      students: studentListWithAttendance,
      isRecorded: attendanceRecords.length > 0,
    };
  },

  async getStudentAttendanceSummary(studentId, { user, teacher, guardian }) {
    const student = await Student.findById(studentId);
    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }

    // Role check
    if (user.role === 'guardian') {
      const isLinked = guardian?.linkedStudentIds?.some((id) => id.toString() === studentId.toString());
      if (!isLinked) {
        const err = new Error('Access denied. You can only access your linked child.');
        err.statusCode = 403;
        throw err;
      }
    } else if (user.role === 'teacher') {
      const isAssigned = await TeacherAssignment.findOne({
        teacherId: teacher._id,
        sectionId: student.sectionId,
        status: 'active',
      });
      if (!isAssigned) {
        const err = new Error('Access denied. Student is not in your assigned class.');
        err.statusCode = 403;
        throw err;
      }
    }

    const records = await Attendance.find({ studentId }).sort({ date: -1 });
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const excused = records.filter((r) => r.status === 'Excused').length;
    const percentage = total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

    return {
      student: {
        _id: student._id,
        admissionNumber: student.admissionNumber,
        fullName: `${student.firstName} ${student.lastName}`,
      },
      stats: { total, present, absent, late, excused, percentage },
      records,
    };
  },
};
