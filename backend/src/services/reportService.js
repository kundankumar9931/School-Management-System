import {
  Student,
  Teacher,
  Guardian,
  Class,
  Subject,
  Attendance,
  FeeInvoice,
  Payment,
  Examination,
  Result,
  AuditLog,
} from '../models/index.js';

export const reportService = {
  async getDashboardStats() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Parallel counts and aggregations directly from MongoDB
    const [
      totalStudents,
      totalTeachers,
      totalGuardians,
      totalClasses,
      totalSubjects,
      todayAttendanceRecords,
      allInvoices,
      recentStudents,
      recentPayments,
      recentAttendance,
      recentExams,
    ] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      Teacher.countDocuments({ status: 'active' }),
      Guardian.countDocuments(),
      Class.countDocuments(),
      Subject.countDocuments(),
      Attendance.find({ date: today }),
      FeeInvoice.find(),
      Student.find().sort({ createdAt: -1 }).limit(5).populate('classId', 'name'),
      Payment.find().sort({ createdAt: -1 }).limit(5).populate('studentId', 'firstName lastName'),
      Attendance.find().sort({ createdAt: -1 }).limit(5).populate('studentId', 'firstName lastName'),
      Examination.find().sort({ createdAt: -1 }).limit(5).populate('classId', 'name'),
    ]);

    // Calculate today's attendance percentage
    let todayAttendancePercentage = 0;
    if (todayAttendanceRecords.length > 0) {
      const presentCount = todayAttendanceRecords.filter((a) => a.status === 'Present').length;
      todayAttendancePercentage = Number(((presentCount / todayAttendanceRecords.length) * 100).toFixed(1));
    }

    // Calculate financial figures from actual invoice records
    let totalFeesGenerated = 0;
    let totalFeesCollected = 0;
    let outstandingFees = 0;

    allInvoices.forEach((inv) => {
      totalFeesGenerated += inv.totalAmount;
      totalFeesCollected += inv.paidAmount;
      outstandingFees += inv.outstandingAmount;
    });

    // Chart 1: Monthly fee collection (Group payments by month)
    const payments = await Payment.find({ status: 'Success' });
    const monthlyFeeMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((m) => (monthlyFeeMap[m] = 0));

    payments.forEach((p) => {
      const d = new Date(p.paymentDate || p.createdAt);
      const mName = months[d.getMonth()];
      monthlyFeeMap[mName] = (monthlyFeeMap[mName] || 0) + p.amount;
    });

    const monthlyFeeCollection = months.map((m) => ({
      month: m,
      collected: monthlyFeeMap[m] || 0,
    }));

    // Chart 2: Student distribution by class
    const classes = await Class.find();
    const studentsByClass = await Promise.all(
      classes.map(async (cls) => {
        const count = await Student.countDocuments({ classId: cls._id, status: 'active' });
        return {
          name: cls.name,
          count,
        };
      })
    );

    // Chart 3: Attendance trend (last 7 recorded days)
    const attendanceTrendsAgg = await Attendance.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 7 },
    ]);

    const attendanceTrends = attendanceTrendsAgg.map((item) => ({
      date: item._id,
      percentage: item.total > 0 ? Number(((item.present / item.total) * 100).toFixed(1)) : 0,
    }));

    // Chart 4: Examination performance (grade distribution)
    const gradeDistributionAgg = await Result.aggregate([
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const gradeDistribution = gradeDistributionAgg.map((g) => ({
      grade: g._id || 'N/A',
      count: g.count,
    }));

    return {
      stats: {
        totalStudents,
        totalTeachers,
        totalGuardians,
        totalClasses,
        totalSubjects,
        todayAttendancePercentage,
        totalFeesGenerated,
        totalFeesCollected,
        outstandingFees,
      },
      charts: {
        monthlyFeeCollection,
        studentsByClass,
        attendanceTrends,
        gradeDistribution,
      },
      recentActivities: {
        students: recentStudents,
        payments: recentPayments,
        attendance: recentAttendance,
        exams: recentExams,
      },
    };
  },

  async getAttendanceReports({ classId, sectionId, startDate, endDate }) {
    const filter = {};
    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(filter)
      .populate('studentId', 'admissionNumber firstName lastName')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const excused = records.filter((r) => r.status === 'Excused').length;

    return {
      summary: {
        totalRecords: total,
        present,
        absent,
        late,
        excused,
        attendancePercentage: total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0,
      },
      records,
    };
  },

  async getAcademicReports({ examId, classId }) {
    const filter = {};
    if (examId) filter.examId = examId;

    const results = await Result.find(filter)
      .populate('studentId', 'admissionNumber firstName lastName classId')
      .populate('subjectId', 'name code maxMarks')
      .populate('examId', 'name academicYear');

    const totalResults = results.length;
    const passedCount = results.filter((r) => r.isPassed).length;
    const passPercentage = totalResults > 0 ? Number(((passedCount / totalResults) * 100).toFixed(1)) : 0;

    // Grade breakdown
    const gradeCounts = {};
    results.forEach((r) => {
      gradeCounts[r.grade] = (gradeCounts[r.grade] || 0) + 1;
    });

    return {
      summary: {
        totalEntries: totalResults,
        passedCount,
        failedCount: totalResults - passedCount,
        passPercentage,
        gradeCounts,
      },
      results,
    };
  },

  async getFeeReports({ status, academicYear }) {
    const invoices = await FeeInvoice.find()
      .populate('studentId', 'admissionNumber firstName lastName')
      .populate('feeStructureId', 'name feeType amount academicYear')
      .sort({ dueDate: -1 });

    let filteredInvoices = invoices;
    if (status) {
      filteredInvoices = filteredInvoices.filter((inv) => inv.status === status);
    }
    if (academicYear) {
      filteredInvoices = filteredInvoices.filter(
        (inv) => inv.feeStructureId?.academicYear === academicYear
      );
    }

    let totalAmount = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    filteredInvoices.forEach((inv) => {
      totalAmount += inv.totalAmount;
      totalPaid += inv.paidAmount;
      totalOutstanding += inv.outstandingAmount;
    });

    return {
      summary: {
        totalInvoices: filteredInvoices.length,
        totalAmount,
        totalPaid,
        totalOutstanding,
      },
      invoices: filteredInvoices,
    };
  },
};
