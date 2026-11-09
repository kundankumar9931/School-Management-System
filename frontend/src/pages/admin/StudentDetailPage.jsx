import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import {
  ArrowLeft,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';

export const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [academics, setAcademics] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('academics');

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const [studentRes, acadRes, attendRes, feeRes] = await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/students/${id}/academics`),
          api.get(`/students/${id}/attendance`),
          api.get(`/students/${id}/fees`),
        ]);
        setStudent(studentRes.data);
        setAcademics(acadRes.data);
        setAttendance(attendRes.data);
        setFees(feeRes.data);
      } catch (err) {
        console.error('Failed to load student dossier:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800">Student not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-xs font-semibold text-brand-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const academicColumns = [
    {
      header: 'Examination',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.examId?.name}</span>
          <span className="text-xs text-slate-400">{row.examId?.examType} ({row.examId?.academicYear})</span>
        </div>
      ),
    },
    {
      header: 'Subject',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800">{row.subjectId?.name}</span>
          <span className="text-xs text-slate-400 block">{row.subjectId?.code}</span>
        </div>
      ),
    },
    {
      header: 'Marks Scored',
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.marksObtained} <span className="text-xs text-slate-400">/ {row.maxMarks}</span>
        </span>
      ),
    },
    {
      header: 'Percentage',
      render: (row) => (
        <span className="font-medium text-slate-700">{row.percentage}%</span>
      ),
    },
    {
      header: 'Grade',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
          {row.grade}
        </span>
      ),
    },
    {
      header: 'Result',
      render: (row) => <StatusBadge status={row.isPassed ? 'Passed' : 'Needs Improvement'} />,
    },
  ];

  const attendanceColumns = [
    {
      header: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      header: 'Session',
      accessor: 'session',
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Remarks',
      render: (row) => row.remarks || <span className="text-slate-400 italic">None</span>,
    },
  ];

  const feeColumns = [
    {
      header: 'Invoice #',
      render: (row) => <span className="font-semibold text-slate-800">{row.invoiceNumber}</span>,
    },
    {
      header: 'Fee Type',
      render: (row) => row.feeStructureId?.name || 'Tuition Fee',
    },
    {
      header: 'Total Amount',
      render: (row) => `$${row.totalAmount}`,
    },
    {
      header: 'Paid Amount',
      render: (row) => <span className="text-emerald-600 font-medium">${row.paidAmount}</span>,
    },
    {
      header: 'Outstanding Balance',
      render: (row) => (
        <span className={row.outstandingAmount > 0 ? 'text-rose-600 font-semibold' : 'text-slate-400'}>
          ${row.outstandingAmount}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Student Roster
      </button>

      {/* Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl shadow-sm">
            {student.firstName[0]}
            {student.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {student.firstName} {student.lastName}
              </h1>
              <StatusBadge status={student.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Admission ID: <span className="font-semibold text-slate-700">{student.admissionNumber}</span> • Class:{' '}
              <span className="font-semibold text-slate-700">{student.classId?.name} (Sec {student.sectionId?.name})</span>
            </p>
          </div>
        </div>

        {/* Contact Snippet */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{student.email || 'No email'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Guardian: {student.guardianId?.fullName || 'Unlinked'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('academics')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ${
              activeTab === 'academics'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Academic Results ({academics.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ${
              activeTab === 'attendance'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            Attendance History ({attendance?.percentage || 0}%)
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition ${
              activeTab === 'fees'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Fee Invoices ({fees.length})
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'academics' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
            <DataTable
              columns={academicColumns}
              data={academics}
              emptyMessage="No academic examinations recorded for this student yet."
            />
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
                <span className="text-xs text-slate-400 block font-medium">Total Tracked Sessions</span>
                <span className="text-xl font-bold text-slate-800">{attendance?.totalDays || 0}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
                <span className="text-xs text-slate-400 block font-medium">Present Sessions</span>
                <span className="text-xl font-bold text-emerald-600">{attendance?.presentDays || 0}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-subtle">
                <span className="text-xs text-slate-400 block font-medium">Overall Attendance Rate</span>
                <span className="text-xl font-bold text-brand-600">{attendance?.percentage || 0}%</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
              <DataTable
                columns={attendanceColumns}
                data={attendance?.history || []}
                emptyMessage="No attendance sessions recorded yet."
              />
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
            <DataTable
              columns={feeColumns}
              data={fees}
              emptyMessage="No fee invoices issued for this student."
            />
          </div>
        )}
      </div>
    </div>
  );
};
