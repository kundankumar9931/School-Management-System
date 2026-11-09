import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { DashboardCard } from '../../components/common/DataTable.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Users, GraduationCap, CalendarCheck, CreditCard, ArrowRight, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

export const GuardianOverview = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await api.get('/guardians/my-children');
        setChildren(res.data);
        if (res.data.length > 0) {
          setSelectedChild(res.data[0]);
        }
      } catch (err) {
        toast.error('Failed to load linked children');
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    const loadChildDossier = async () => {
      if (!selectedChild) return;
      try {
        const [attRes, feeRes, resRes] = await Promise.all([
          api.get(`/students/${selectedChild._id}/attendance`),
          api.get(`/students/${selectedChild._id}/fees`),
          api.get(`/students/${selectedChild._id}/academics`),
        ]);
        setAttendance(attRes.data);
        setInvoices(feeRes.data);
        setResults(resRes.data);
      } catch (err) {
        console.error('Failed to load child metrics:', err.message);
      }
    };
    loadChildDossier();
  }, [selectedChild]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const outstandingTotal = invoices.reduce((acc, inv) => acc + (inv.outstandingAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-indigo-900 rounded-2xl p-6 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider block mb-1">
            Guardian & Parent Portal
          </span>
          <h1 className="text-xl font-bold tracking-tight">
            Welcome, {user?.profile?.fullName || 'Parent'}!
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Monitor academic progress, daily attendance, and fee invoices for your linked children.
          </p>
        </div>

        {/* Child Selector Pills */}
        <div className="flex items-center gap-2">
          {children.map((child) => (
            <button
              key={child._id}
              onClick={() => setSelectedChild(child)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedChild?._id === child._id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              {child.firstName} {child.lastName} ({child.classId?.name})
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Attendance Rate"
          value={`${attendance?.percentage || 0}%`}
          subtitle={`${attendance?.presentDays || 0} of ${attendance?.totalDays || 0} sessions present`}
          icon={CalendarCheck}
          color="emerald"
        />
        <DashboardCard
          title="Recent Results"
          value={`${results.length} Subjects`}
          subtitle="Evaluations completed"
          icon={GraduationCap}
          color="indigo"
        />
        <DashboardCard
          title="Outstanding Dues"
          value={`$${outstandingTotal.toLocaleString()}`}
          subtitle={outstandingTotal === 0 ? 'All fees settled' : 'Payment pending'}
          icon={CreditCard}
          color={outstandingTotal > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Child Profile & Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Child Biodata Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Student Profile</h2>
            <StatusBadge status={selectedChild?.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Full Name</span>
              <span className="font-bold text-slate-800 text-sm">
                {selectedChild?.firstName} {selectedChild?.lastName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Admission Number</span>
              <span className="font-bold text-slate-800 text-sm">{selectedChild?.admissionNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Class & Section</span>
              <span className="font-bold text-slate-800">
                {selectedChild?.classId?.name} - Section {selectedChild?.sectionId?.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Student Email</span>
              <span className="font-medium text-slate-700">{selectedChild?.email || 'N/A'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => navigate('/guardian/results')}
              className="flex-1 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-semibold transition"
            >
              View Report Cards
            </button>
            <button
              onClick={() => navigate('/guardian/fees')}
              className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              View Invoices
            </button>
          </div>
        </div>

        {/* Recent Performance Snapshot */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Recent Academic Evaluations</h2>
            <span className="text-xs text-brand-600 font-semibold cursor-pointer" onClick={() => navigate('/guardian/results')}>
              View All
            </span>
          </div>

          <div className="space-y-3">
            {results.slice(0, 4).map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">{r.subjectId?.name}</span>
                  <span className="text-slate-400">{r.examId?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800">{r.marksObtained}/{r.maxMarks}</span>
                  <span className="font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                    {r.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const GuardianResultsPage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [chRes, exRes] = await Promise.all([
          api.get('/guardians/my-children'),
          api.get('/examinations'),
        ]);
        setChildren(chRes.data);
        setExams(exRes.data);
        if (chRes.data.length > 0) setSelectedChild(chRes.data[0]);
        if (exRes.data.length > 0) setSelectedExamId(exRes.data[0]._id);
      } catch (err) {
        toast.error('Failed to load portal data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const loadReportCard = async () => {
      if (!selectedChild || !selectedExamId) return;
      try {
        const res = await api.get(`/results/report-card/${selectedChild._id}/${selectedExamId}`);
        setReportCard(res.data);
      } catch (err) {
        setReportCard(null);
      }
    };
    loadReportCard();
  }, [selectedChild, selectedExamId]);

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Report Cards</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified performance transcripts for your linked children.
          </p>
        </div>
        {reportCard && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Report Card
          </button>
        )}
      </div>

      {/* Selectors - Hidden on Print */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-subtle">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Child</label>
          <select
            value={selectedChild?._id || ''}
            onChange={(e) => setSelectedChild(children.find((c) => c._id === e.target.value))}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
          >
            {children.map((c) => (
              <option key={c._id} value={c._id}>
                {c.firstName} {c.lastName} ({c.admissionNumber})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
          >
            {exams.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Card */}
      {!reportCard ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
          No examination marks published for this student yet.
        </div>
      ) : (
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-card max-w-4xl mx-auto printable-card">
          <div className="text-center pb-6 border-b-2 border-slate-800 mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              {reportCard.schoolName}
            </h2>
            <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">
              Official Academic Performance Transcript
            </p>
            <p className="text-xs text-brand-600 font-bold mt-1">
              {reportCard.examName} ({reportCard.academicYear})
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-8 text-xs">
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Student Name</span>
              <span className="font-bold text-slate-800 text-sm">{reportCard.student?.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Admission #</span>
              <span className="font-bold text-slate-800 text-sm">{reportCard.student?.admissionNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Class & Section</span>
              <span className="font-bold text-slate-800 text-sm">
                {reportCard.student?.className} - {reportCard.student?.sectionName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Result Outcome</span>
              <span className="font-bold text-emerald-600 text-sm">{reportCard.summary?.resultStatus}</span>
            </div>
          </div>

          <table className="w-full text-left text-xs text-slate-700 mb-8 border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                <th className="py-2.5 px-3 text-center">Max Marks</th>
                <th className="py-2.5 px-3 text-center">Grade</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border border-slate-200">
              {reportCard.subjects?.map((sub, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-semibold text-slate-900">{sub.subjectName}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800">{sub.marksObtained}</td>
                  <td className="py-3 px-3 text-center text-slate-500">{sub.maxMarks}</td>
                  <td className="py-3 px-3 text-center font-bold text-brand-600">{sub.grade}</td>
                  <td className="py-3 px-3 text-center font-semibold">
                    <span className={sub.isPassed ? 'text-emerald-600' : 'text-rose-600'}>
                      {sub.isPassed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-3 gap-4 p-5 rounded-xl bg-slate-900 text-white text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Aggregate Score</span>
              <span className="text-lg font-extrabold">
                {reportCard.summary?.totalMarksObtained} / {reportCard.summary?.totalMaxMarks}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Percentage</span>
              <span className="text-lg font-extrabold text-brand-300">
                {reportCard.summary?.percentage}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Overall Grade</span>
              <span className="text-lg font-extrabold text-emerald-400">
                {reportCard.summary?.overallGrade}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
