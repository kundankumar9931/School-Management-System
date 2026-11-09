import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { DashboardCard } from '../../components/common/DataTable.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { BookOpen, Users, CalendarCheck, FileCheck, ArrowRight, Award } from 'lucide-react';

export const TeacherOverview = () => {
  const { user } = useAuth();
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/teachers/my-classes');
        setAssignedClasses(res.data);
      } catch (err) {
        console.error('Failed to load assigned classes:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-indigo-900 rounded-2xl p-6 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider block mb-1">
            Faculty Portal
          </span>
          <h1 className="text-xl font-bold tracking-tight">
            Welcome, {user?.profile?.fullName || 'Instructor'}!
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Department: <span className="font-semibold">{user?.profile?.department || 'General Education'}</span> • Employee ID:{' '}
            <span className="font-semibold font-mono">{user?.profile?.employeeId || 'TCH'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <CalendarCheck className="w-4 h-4" />
            Take Attendance
          </button>
          <button
            onClick={() => navigate('/teacher/marks')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition"
          >
            <FileCheck className="w-4 h-4" />
            Enter Marks
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Assigned Cohorts"
          value={assignedClasses.length}
          subtitle="Class-Section Assignments"
          icon={BookOpen}
          color="indigo"
        />
        <DashboardCard
          title="Teaching Experience"
          value={`${user?.profile?.experienceYears || 0} Years`}
          subtitle={user?.profile?.qualification || 'Certified Faculty'}
          icon={Award}
          color="blue"
        />
        <DashboardCard
          title="Roster Scope"
          value="Scoped & Secure"
          subtitle="Enforced Server-Side RBAC"
          icon={CalendarCheck}
          color="emerald"
        />
      </div>

      {/* Assigned Classes Roster List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">My Assigned Classes & Sections</h2>
          <span className="text-xs text-slate-400">Strictly authorized teaching roster</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedClasses.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-brand-200 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">
                  {item.className}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-brand-50 text-brand-700">
                  Section {item.sectionName}
                </span>
              </div>

              <div className="text-xs text-slate-500">
                <span className="block font-medium text-slate-700 mb-1">Assigned Subjects:</span>
                <div className="flex flex-wrap gap-1">
                  {item.subjects?.map((sub, sIdx) => (
                    <span key={sIdx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-800">
                      {sub.name} ({sub.code})
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Capacity: {item.capacity}</span>
                <button
                  onClick={() => navigate('/teacher/classes')}
                  className="text-brand-600 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  View Students <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TeacherClassesPage = () => {
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await api.get('/teachers/my-classes');
        setAssignedClasses(res.data);
        if (res.data.length > 0) {
          setSelectedAssignment(res.data[0]);
          loadStudents(res.data[0].classId, res.data[0].sectionId);
        }
      } catch (err) {
        toast.error('Failed to load assigned classes');
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  const loadStudents = async (classId, sectionId) => {
    try {
      const res = await api.get('/students', { params: { classId, sectionId, limit: 100 } });
      setStudents(res.data.students || []);
    } catch (err) {
      toast.error('Failed to load students in class');
    }
  };

  const handleSelectCohort = (item) => {
    setSelectedAssignment(item);
    loadStudents(item.classId, item.sectionId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Classes & Students</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Roster of students enrolled in your assigned classes and sections.
        </p>
      </div>

      {/* Cohort Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {assignedClasses.map((item, idx) => {
          const isSelected = selectedAssignment?.classId === item.classId && selectedAssignment?.sectionId === item.sectionId;
          return (
            <button
              key={idx}
              onClick={() => handleSelectCohort(item)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.className} - Section {item.sectionName}
            </button>
          );
        })}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Student Roster ({students.length} Enrolled)
          </h3>
          <span className="text-xs text-slate-400">
            {selectedAssignment?.className} - Section {selectedAssignment?.sectionName}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Adm #</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Guardian Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-semibold text-slate-800 text-xs">
                    {s.admissionNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="py-3 px-4 text-xs capitalize text-slate-600">
                    {s.gender}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    {s.guardianId?.fullName || 'N/A'} ({s.guardianId?.phone || 'N/A'})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
