import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { DataTable } from '../../components/common/DataTable.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Download, CalendarCheck, GraduationCap, DollarSign, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [attendanceData, setAttendanceData] = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [attRes, acadRes, feeRes] = await Promise.all([
        api.get('/reports/attendance'),
        api.get('/reports/academic'),
        api.get('/reports/fees'),
      ]);
      setAttendanceData(attRes.data);
      setAcademicData(acadRes.data);
      setFeeData(feeRes.data);
    } catch (err) {
      toast.error('Failed to load analytical reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data available to export');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"₹{String(val ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `₹{filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`₹{filename}.csv exported successfully`);
  };

  const handleAttendanceCSV = () => {
    const rows = (attendanceData?.records || []).map((r) => ({
      Date: new Date(r.date).toLocaleDateString(),
      AdmissionNumber: r.studentId?.admissionNumber,
      StudentName: `₹${r.studentId?.firstName} ₹${r.studentId?.lastName}`,
      Class: r.classId?.name,
      Section: r.sectionId?.name,
      Status: r.status,
      Session: r.session,
    }));
    exportToCSV(rows, 'Attendance_Report');
  };

  const handleAcademicCSV = () => {
    const rows = (academicData?.results || []).map((r) => ({
      StudentName: `₹${r.studentId?.firstName} ₹${r.studentId?.lastName}`,
      AdmissionNumber: r.studentId?.admissionNumber,
      Exam: r.examId?.name,
      Subject: r.subjectId?.name,
      Marks: r.marksObtained,
      MaxMarks: r.maxMarks,
      Percentage: r.percentage,
      Grade: r.grade,
      Status: r.isPassed ? 'Passed' : 'Failed',
    }));
    exportToCSV(rows, 'Academic_Results_Report');
  };

  const handleFeeCSV = () => {
    const rows = (feeData?.invoices || []).map((inv) => ({
      InvoiceNumber: inv.invoiceNumber,
      StudentName: `₹${inv.studentId?.firstName} ₹${inv.studentId?.lastName}`,
      FeeStructure: inv.feeStructureId?.name,
      TotalAmount: inv.totalAmount,
      PaidAmount: inv.paidAmount,
      Outstanding: inv.outstandingAmount,
      DueDate: new Date(inv.dueDate).toLocaleDateString(),
      Status: inv.status,
    }));
    exportToCSV(rows, 'Fee_Ledger_Report');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Exportable operational records, attendance audits, academic standing, and revenue ledgers.
          </p>
        </div>

        <div>
          {activeTab === 'attendance' && (
            <button
              onClick={handleAttendanceCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export Attendance CSV
            </button>
          )}
          {activeTab === 'academic' && (
            <button
              onClick={handleAcademicCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export Academic CSV
            </button>
          )}
          {activeTab === 'fees' && (
            <button
              onClick={handleFeeCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export Fee Ledger CSV
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ₹{
              activeTab === 'attendance'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Attendance Audit
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ₹{
              activeTab === 'academic'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Academic Performance
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ₹{
              activeTab === 'fees'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Financial Ledger
          </button>
        </nav>
      </div>

      {/* Panels */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
              <span className="text-xs text-slate-400 uppercase font-medium">Total Tracked</span>
              <span className="text-xl font-bold text-slate-800 block mt-1">
                {attendanceData?.summary?.totalRecords || 0}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
              <span className="text-xs text-slate-400 uppercase font-medium">Present Sessions</span>
              <span className="text-xl font-bold text-emerald-600 block mt-1">
                {attendanceData?.summary?.present || 0}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
              <span className="text-xs text-slate-400 uppercase font-medium">Absent Sessions</span>
              <span className="text-xl font-bold text-rose-600 block mt-1">
                {attendanceData?.summary?.absent || 0}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
              <span className="text-xs text-slate-400 uppercase font-medium">Presence Ratio</span>
              <span className="text-xl font-bold text-brand-600 block mt-1">
                {attendanceData?.summary?.attendancePercentage || 0}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
            <DataTable
              columns={[
                {
                  header: 'Date',
                  render: (r) => new Date(r.date).toLocaleDateString(),
                },
                {
                  header: 'Student',
                  render: (r) => `${r.studentId?.firstName} ${r.studentId?.lastName} (${r.studentId?.admissionNumber})`,
                },
                {
                  header: 'Class / Section',
                  render: (r) => `${r.classId?.name} - ${r.sectionId?.name}`,
                },
                {
                  header: 'Status',
                  render: (r) => <StatusBadge status={r.status} />,
                },
              ]}
              data={attendanceData?.records || []}
              loading={loading}
            />
          </div>
        </div>
      )}

      {activeTab === 'academic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
              <span className="text-xs text-slate-400 uppercase font-medium">Total Entries</span>
              <span className="text-xl font-bold text-slate-800 block mt-1">
                {academicData?.summary?.totalEntries || 0}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
              <span className="text-xs text-slate-400 uppercase font-medium">Passing Entries</span>
              <span className="text-xl font-bold text-emerald-600 block mt-1">
                {academicData?.summary?.passedCount || 0}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
              <span className="text-xs text-slate-400 uppercase font-medium">Pass Percentage</span>
              <span className="text-xl font-bold text-brand-600 block mt-1">
                {academicData?.summary?.passPercentage || 0}%
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
              <span className="text-xs text-slate-400 uppercase font-medium">Top Grade (A+)</span>
              <span className="text-xl font-bold text-indigo-600 block mt-1">
                {academicData?.summary?.gradeCounts?.['A+'] || 0} students
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
            <DataTable
              columns={[
                {
                  header: 'Student',
                  render: (r) => `${r.studentId?.firstName} ${r.studentId?.lastName}`,
                },
                {
                  header: 'Examination',
                  render: (r) => r.examId?.name,
                },
                {
                  header: 'Subject',
                  render: (r) => r.subjectId?.name,
                },
                {
                  header: 'Score',
                  render: (r) => `${r.marksObtained} / ${r.maxMarks}`,
                },
                {
                  header: 'Grade',
                  render: (r) => (
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                      {r.grade}
                    </span>
                  ),
                },
                {
                  header: 'Outcome',
                  render: (r) => <StatusBadge status={r.isPassed ? 'Passed' : 'Needs Improvement'} />,
                },
              ]}
              data={academicData?.results || []}
              loading={loading}
            />
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
              <span className="text-xs text-slate-400 uppercase font-medium">Total Billed</span>
              <span className="text-xl font-bold text-slate-800 block mt-1">
                ₹{(feeData?.summary?.totalAmount || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
              <span className="text-xs text-slate-400 uppercase font-medium">Reconciled Collections</span>
              <span className="text-xl font-bold text-emerald-600 block mt-1">
                ₹{(feeData?.summary?.totalPaid || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
              <span className="text-xs text-slate-400 uppercase font-medium">Total Outstanding</span>
              <span className="text-xl font-bold text-rose-600 block mt-1">
                ₹{(feeData?.summary?.totalOutstanding || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
            <DataTable
              columns={[
                {
                  header: 'Invoice #',
                  accessor: 'invoiceNumber',
                },
                {
                  header: 'Student',
                  render: (r) => `${r.studentId?.firstName} ${r.studentId?.lastName}`,
                },
                {
                  header: 'Total Due',
                  render: (r) => `₹${r.totalAmount}`,
                },
                {
                  header: 'Paid Amount',
                  render: (r) => `₹${r.paidAmount}`,
                },
                {
                  header: 'Remaining Balance',
                  render: (r) => `₹${r.outstandingAmount}`,
                },
                {
                  header: 'Status',
                  render: (r) => <StatusBadge status={r.status} />,
                },
              ]}
              data={feeData?.invoices || []}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};
