import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { CalendarCheck, Check, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const TeacherAttendancePage = () => {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedCohortIndex, setSelectedCohortIndex] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('Morning');

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await api.get('/teachers/my-classes');
        setAssignedClasses(res.data);
      } catch (err) {
        toast.error('Failed to load assigned classes');
      }
    };
    fetchAssigned();
  }, []);

  const currentCohort = assignedClasses[selectedCohortIndex];

  const loadAttendance = async () => {
    if (!currentCohort) return;
    setLoading(true);
    try {
      const res = await api.get('/attendance/daily', {
        params: {
          classId: currentCohort.classId,
          sectionId: currentCohort.sectionId,
          date,
          session,
        },
      });
      setStudents(res.data.students || []);
      setIsRecorded(res.data.isRecorded || false);

      const map = {};
      (res.data.students || []).forEach((s) => {
        map[s.studentId] = {
          status: s.status || 'Present',
          remarks: s.remarks || '',
        };
      });
      setRecords(map);
    } catch (err) {
      toast.error(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentCohort) {
      loadAttendance();
    }
  }, [selectedCohortIndex, date, session, assignedClasses]);

  const handleMarkAllPresent = () => {
    const updated = { ...records };
    students.forEach((s) => {
      updated[s.studentId] = { ...updated[s.studentId], status: 'Present' };
    });
    setRecords(updated);
    toast.success('All marked Present');
  };

  const handleStatusChange = (studentId, status) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleSubmit = async () => {
    if (students.length === 0) return;
    setSubmitting(true);
    try {
      await api.post('/attendance', {
        classId: currentCohort.classId,
        sectionId: currentCohort.sectionId,
        date,
        session,
        records: students.map((s) => ({
          studentId: s.studentId,
          status: records[s.studentId]?.status || 'Present',
          remarks: records[s.studentId]?.remarks || '',
        })),
      });
      toast.success('Attendance submitted successfully');
      loadAttendance();
    } catch (err) {
      toast.error(err.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Record Daily Attendance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Restricted exclusively to your assigned classrooms.
          </p>
        </div>

        {students.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Mark All Present
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Submitting...' : isRecorded ? 'Update Records' : 'Submit Attendance'}
            </button>
          </div>
        )}
      </div>

      {/* Class Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-subtle">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">My Assigned Class</label>
          <select
            value={selectedCohortIndex}
            onChange={(e) => setSelectedCohortIndex(Number(e.target.value))}
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
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Session Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Session</label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
          >
            <option value="Morning">Morning Session</option>
            <option value="Afternoon">Afternoon Session</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
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
                  <th className="py-3 px-4">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const currentStatus = records[s.studentId]?.status || 'Present';
                  return (
                    <tr key={s.studentId} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                        {s.admissionNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {s.fullName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {['Present', 'Absent', 'Late', 'Excused'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(s.studentId, st)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                currentStatus === st
                                  ? st === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : st === 'Late'
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : st === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
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
