import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Printer, Download, School, Award, CheckCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportCardsPage = () => {
  const [searchParams] = useSearchParams();
  const initialExamId = searchParams.get('examId') || '';

  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBase = async () => {
      try {
        const [examRes, studRes] = await Promise.all([
          api.get('/examinations'),
          api.get('/students', { params: { limit: 100 } }),
        ]);
        setExams(examRes.data);
        setStudents(studRes.data.students || []);

        if (examRes.data.length > 0 && !selectedExamId) {
          setSelectedExamId(examRes.data[0]._id);
        }
        if (studRes.data.students?.length > 0) {
          setSelectedStudentId(studRes.data.students[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load initial data');
      }
    };
    fetchBase();
  }, []);

  const generateReportCard = async () => {
    if (!selectedStudentId || !selectedExamId) return;
    setLoading(true);
    try {
      const res = await api.get(`/results/report-card/${selectedStudentId}/${selectedExamId}`);
      setReportCard(res.data);
    } catch (err) {
      toast.error(err.message || 'Report card not available for this selection');
      setReportCard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId && selectedExamId) {
      generateReportCard();
    }
  }, [selectedStudentId, selectedExamId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header - Hidden when printing */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Report Cards</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official student transcripts and performance evaluations.
          </p>
        </div>
        {reportCard && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        )}
      </div>

      {/* Selectors - Hidden when printing */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-subtle">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
          >
            {exams.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name} ({e.classId?.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
          >
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.firstName} {s.lastName} ({s.admissionNumber} - {s.classId?.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Card Container */}
      {loading ? (
        <div className="py-20 flex justify-center bg-white rounded-2xl border border-slate-100">
          <LoadingSpinner size="lg" />
        </div>
      ) : !reportCard ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
          No examination results found for this student.
        </div>
      ) : (
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-card max-w-4xl mx-auto printable-card">
          {/* Institution Header */}
          <div className="text-center pb-6 border-b-2 border-slate-800 mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <School className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {reportCard.schoolName}
              </h2>
            </div>
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
              Official Student Academic Performance Transcript
            </p>
            <p className="text-xs text-brand-600 font-bold mt-1">
              Academic Year: {reportCard.academicYear} • Term: {reportCard.examType}
            </p>
          </div>

          {/* Student Dossier Information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-8 text-xs">
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Student Name</span>
              <span className="font-bold text-slate-800 text-sm">{reportCard.student?.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Admission Number</span>
              <span className="font-bold text-slate-800 text-sm">{reportCard.student?.admissionNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Class & Section</span>
              <span className="font-bold text-slate-800 text-sm">
                {reportCard.student?.className} - {reportCard.student?.sectionName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium uppercase text-[10px]">Guardian</span>
              <span className="font-bold text-slate-800 text-sm">{reportCard.student?.guardianName}</span>
            </div>
          </div>

          {/* Subject-Wise Marks Breakdown Table */}
          <table className="w-full text-left text-xs text-slate-700 mb-8 border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                <th className="py-2.5 px-3 text-center">Maximum Marks</th>
                <th className="py-2.5 px-3 text-center">Percentage</th>
                <th className="py-2.5 px-3 text-center">Grade</th>
                <th className="py-2.5 px-3 text-center">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border border-slate-200">
              {reportCard.subjects?.map((sub, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {sub.subjectName} <span className="text-slate-400 font-normal">({sub.subjectCode})</span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800">{sub.marksObtained}</td>
                  <td className="py-3 px-3 text-center text-slate-500">{sub.maxMarks}</td>
                  <td className="py-3 px-3 text-center font-medium">{sub.percentage}%</td>
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

          {/* Transcript Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-900 text-white mb-8">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Aggregate Marks</span>
              <span className="text-lg font-extrabold">
                {reportCard.summary?.totalMarksObtained} / {reportCard.summary?.totalMaxMarks}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Overall Percentage</span>
              <span className="text-lg font-extrabold text-brand-300">
                {reportCard.summary?.percentage}%
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cumulative Grade</span>
              <span className="text-lg font-extrabold text-emerald-400">
                {reportCard.summary?.overallGrade}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Final Standing</span>
              <span className="text-sm font-bold uppercase text-white bg-slate-800 px-3 py-1 rounded-full inline-block mt-0.5">
                {reportCard.summary?.resultStatus}
              </span>
            </div>
          </div>

          {/* Institutional Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-12 mt-8 border-t border-slate-200 text-center text-xs text-slate-500">
            <div>
              <div className="border-b border-slate-300 w-32 mx-auto mb-1"></div>
              <span>Class Teacher</span>
            </div>
            <div>
              <div className="border-b border-slate-300 w-32 mx-auto mb-1"></div>
              <span>Academic Controller</span>
            </div>
            <div>
              <div className="border-b border-slate-300 w-32 mx-auto mb-1"></div>
              <span>Principal / Headmaster</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
