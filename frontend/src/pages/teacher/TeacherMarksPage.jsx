import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Save, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export const TeacherMarksPage = () => {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedCohortIndex, setSelectedCohortIndex] = useState(0);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [clsRes, examRes] = await Promise.all([
          api.get('/teachers/my-classes'),
          api.get('/examinations'),
        ]);
        setAssignedClasses(clsRes.data);
        setExams(examRes.data);
        if (examRes.data.length > 0) {
          setSelectedExamId(examRes.data[0]._id);
        }
        if (clsRes.data.length > 0 && clsRes.data[0].subjects?.length > 0) {
          setSelectedSubjectId(clsRes.data[0].subjects[0].subjectId);
        }
      } catch (err) {
        toast.error('Failed to load teacher assignments');
      }
    };
    init();
  }, []);

  const currentCohort = assignedClasses[selectedCohortIndex];

  const loadStudents = async () => {
    if (!currentCohort || !selectedExamId || !selectedSubjectId) return;
    setLoading(true);
    try {
      const [studRes, resRes] = await Promise.all([
        api.get('/students', {
          params: { classId: currentCohort.classId, sectionId: currentCohort.sectionId, limit: 100 },
        }),
        api.get('/results', {
          params: { examId: selectedExamId, subjectId: selectedSubjectId },
        }),
      ]);

      const studentList = studRes.data.students || [];
      const existingResults = resRes.data || [];
      const map = new Map();
      existingResults.forEach((r) => map.set(r.studentId?._id?.toString() || r.studentId?.toString(), r));

      const initialEntries = {};
      studentList.forEach((s) => {
        const r = map.get(s._id.toString());
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
      toast.error('Failed to load evaluation roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentCohort && selectedExamId && selectedSubjectId) {
      loadStudents();
    }
  }, [selectedCohortIndex, selectedExamId, selectedSubjectId]);

  const handleMarksChange = (studentId, val) => {
    const num = val === '' ? '' : Math.max(0, Number(val));
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: num,
      },
    }));
  };

  const handleSubmit = async () => {
    const validEntries = [];
    for (const s of students) {
      const entry = entries[s._id];
      if (entry && entry.marksObtained !== '') {
        const marks = Number(entry.marksObtained);
        if (marks > 100) {
          toast.error(`Marks for ${s.firstName} cannot exceed 100`);
          return;
        }
        validEntries.push({
          studentId: s._id,
          marksObtained: marks,
          maxMarks: 100,
          remarks: entry.remarks || '',
        });
      }
    }

    if (validEntries.length === 0) {
      toast.error('Please input marks for at least one student');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/results', {
        examId: selectedExamId,
        subjectId: selectedSubjectId,
        entries: validEntries,
      });
      toast.success('Marks and calculated grades saved successfully');
      loadStudents();
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Enter Subject Marks</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grade students exclusively in your assigned curriculum courses.
          </p>
        </div>

        {students.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Submit Subject Marks'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-subtle">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Class Cohort</label>
          <select
            value={selectedCohortIndex}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setSelectedCohortIndex(idx);
              if (assignedClasses[idx]?.subjects?.length > 0) {
                setSelectedSubjectId(assignedClasses[idx].subjects[0].subjectId);
              }
            }}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
          >
            {assignedClasses.map((item, idx) => (
              <option key={idx} value={idx}>
                {item.className} - Section {item.sectionName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Examination</label>
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

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assigned Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
          >
            {currentCohort?.subjects?.map((sub, sIdx) => (
              <option key={sIdx} value={sub.subjectId}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Adm #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4 w-36">Marks (0-100)</th>
                  <th className="py-3 px-4">Grade</th>
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
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={entry.marksObtained}
                          onChange={(e) => handleMarksChange(s._id, e.target.value)}
                          className="w-24 text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                          {entry.grade || '—'}
                        </span>
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
