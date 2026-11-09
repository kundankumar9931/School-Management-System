import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { CheckCircle2, CalendarCheck, Check, Clock, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AttendancePage = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('Morning');

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/classes');
        setClasses(res.data);
        if (res.data.length > 0) {
          setSelectedClass(res.data[0]._id);
          const secRes = await api.get('/sections', { params: { classId: res.data[0]._id } });
          setSections(secRes.data);
          if (secRes.data.length > 0) {
            setSelectedSection(secRes.data[0]._id);
          }
        }
      } catch (err) {
        toast.error('Failed to load classes');
      }
    };
    fetchClasses();
  }, []);

  const handleClassChange = async (clsId) => {
    setSelectedClass(clsId);
    setSelectedSection('');
    if (clsId) {
      const secRes = await api.get('/sections', { params: { classId: clsId } });
      setSections(secRes.data);
      if (secRes.data.length > 0) {
        setSelectedSection(secRes.data[0]._id);
      }
    }
  };

  const loadAttendanceRoster = async () => {
    if (!selectedClass || !selectedSection || !date) return;
    setLoading(true);
    try {
      const res = await api.get('/attendance/daily', {
        params: {
          classId: selectedClass,
          sectionId: selectedSection,
          date,
          session,
        },
      });
      setStudents(res.data.students || []);
      setIsRecorded(res.data.isRecorded || false);

      // Pre-fill state
      const initialMap = {};
      (res.data.students || []).forEach((s) => {
        initialMap[s.studentId] = {
          status: s.status || 'Present',
          remarks: s.remarks || '',
        };
      });
      setRecords(initialMap);
    } catch (err) {
      toast.error(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadAttendanceRoster();
    }
  }, [selectedClass, selectedSection, date, session]);

  const handleMarkAllPresent = () => {
    const updated = { ...records };
    students.forEach((s) => {
      updated[s.studentId] = {
        ...updated[s.studentId],
        status: 'Present',
      };
    });
    setRecords(updated);
    toast.success('Marked all students as Present');
  };

  const handleStatusChange = (studentId, newStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: newStatus,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleSubmitAttendance = async () => {
    if (students.length === 0) {
      toast.error('No students in this class/section');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        classId: selectedClass,
        sectionId: selectedSection,
        date,
        session,
        records: students.map((s) => ({
          studentId: s.studentId,
          status: records[s.studentId]?.status || 'Present',
          remarks: records[s.studentId]?.remarks || '',
        })),
      };
      await api.post('/attendance', payload);
      toast.success('Attendance recorded and synchronized successfully');
      loadAttendanceRoster();
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daily Attendance Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record session-based attendance with automatic duplicate protection.
          </p>
        </div>

        {students.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Mark All Present
            </button>
            <button
              onClick={handleSubmitAttendance}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50 transition"
            >
              <CalendarCheck className="w-4 h-4" />
              {submitting ? 'Submitting...' : isRecorded ? 'Update Attendance' : 'Submit Attendance'}
            </button>
          </div>
        )}
      </div>

      {/* Control Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-subtle">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
          >
            {sections.map((s) => (
              <option key={s._id} value={s._id}>
                Section {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Date</label>
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No students enrolled in this class and section.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Adm #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Status Selector</th>
                  <th className="py-3 px-4">Session Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const currentStatus = records[s.studentId]?.status || 'Present';
                  const currentRemarks = records[s.studentId]?.remarks || '';

                  return (
                    <tr key={s.studentId} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">
                        {s.admissionNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 text-sm">
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
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Optional notes..."
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(s.studentId, e.target.value)}
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
