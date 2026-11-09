import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { Check, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const MarksEntryPage = () => {
  const [searchParams] = useSearchParams();
  const initialExamId = searchParams.get('examId') || '';

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [examDetails, setExamDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/examinations');
        setExams(res.data);
        if (res.data.length > 0 && !selectedExamId) {
          setSelectedExamId(res.data[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load exams');
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    const loadExamInfo = async () => {
      if (!selectedExamId) return;
      try {
        const res = await api.get(`/examinations/${selectedExamId}`);
        setExamDetails(res.data);
        if (res.data.subjects?.length > 0) {
          setSelectedSubjectId(res.data.subjects[0].subjectId?._id || res.data.subjects[0].subjectId);
        }
      } catch (err) {
        console.error('Failed to load exam details:', err.message);
      }
    };
    loadExamInfo();
  }, [selectedExamId]);

  const loadStudentsAndExistingResults = async () => {
    if (!examDetails?.classId?._id || !selectedSubjectId) return;
    setLoading(true);
    try {
      const [studRes, resRes] = await Promise.all([
        api.get('/students', { params: { classId: examDetails.classId._id, limit: 100 } }),
        api.get('/results', { params: { examId: selectedExamId, subjectId: selectedSubjectId } }),
      ]);

      const studentList = studRes.data.students || [];
      const existingResults = resRes.data || [];

      const resultsMap = new Map();
      existingResults.forEach((r) => resultsMap.set(r.studentId?._id?.toString() || r.studentId?.toString(), r));

      const initialEntries = {};
      studentList.forEach((s) => {
        const r = resultsMap.get(s._id.toString());
        initialEntries[s._id] = {
          marksObtained: r ? r.marksObtained : '',
          maxMarks: r ? r.maxMarks : 100,
          grade: r ? r.grade : '—',
          remarks: r ? r.remarks : '',
        };
      });

      setStudents(studentList);
      setEntries(initialEntries);
    } catch (err) {
      toast.error('Failed to load students roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examDetails && selectedSubjectId) {
      loadStudentsAndExistingResults();
    }
  }, [examDetails, selectedSubjectId]);

  // Compute preview grade dynamically
  const getPreviewGrade = (marks, maxMarks) => {
    if (marks === '' || isNaN(marks)) return '—';
    const pct = (Number(marks) / Number(maxMarks)) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  const handleMarksChange = (studentId, val) => {
    const max = entries[studentId]?.maxMarks || 100;
    const num = val === '' ? '' : Math.max(0, Number(val));

    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: num,
        grade: getPreviewGrade(num, max),
      },
    }));
  };

  const handleRemarksChange = (studentId, val) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: val,
      },
    }));
  };

  const handleSubmitMarks = async () => {
    const validEntries = [];
    for (const s of students) {
      const entry = entries[s._id];
      if (entry && entry.marksObtained !== '') {
        const marks = Number(entry.marksObtained);
        const max = Number(entry.maxMarks || 100);
        if (marks > max) {
          toast.error(`Marks for ${s.firstName} (${marks}) exceeds maximum marks (${max})`);
          return;
        }
        validEntries.push({
          studentId: s._id,
          marksObtained: marks,
          maxMarks: max,
          remarks: entry.remarks || '',
        });
      }
    }

    if (validEntries.length === 0) {
      toast.error('Please enter marks for at least one student');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/results', {
        examId: selectedExamId,
        subjectId: selectedSubjectId,
        entries: validEntries,
      });
      toast.success('Marks recorded and grades calculated successfully!');
      loadStudentsAndExistingResults();
    } catch (err) {
      toast.error(err.message || 'Failed to submit marks');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Examination Marks Entry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record subject evaluations with automatic grading engine calculation.
          </p>
        </div>
        {students.length > 0 && (
          <button
            onClick={handleSubmitMarks}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving Marks...' : 'Save & Calculate Grades'}
          </button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-subtle">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
          >
            {exams.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name} ({e.classId?.name} - {e.academicYear})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
          >
            {examDetails?.subjects?.map((s) => (
              <option key={s.subjectId?._id || s._id} value={s.subjectId?._id || s.subjectId}>
                {s.subjectId?.name || 'Subject'} ({s.subjectId?.code || ''}) - Max {s.maxMarks || 100}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No students found for this class.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Adm #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 w-36">Marks Obtained</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Calculated Grade</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const entry = entries[s._id] || {};
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-semibold text-slate-800 text-xs">
                        {s.admissionNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 text-sm">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max={entry.maxMarks || 100}
                          value={entry.marksObtained}
                          onChange={(e) => handleMarksChange(s._id, e.target.value)}
                          placeholder="0-100"
                          className="w-24 text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-500">
                        {entry.maxMarks || 100}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                          {entry.grade || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={entry.remarks || ''}
                          onChange={(e) => handleRemarksChange(s._id, e.target.value)}
                          placeholder="Evaluation feedback..."
                          className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
