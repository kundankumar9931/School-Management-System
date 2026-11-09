import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { DashboardCard } from '../../components/common/DataTable.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  CalendarCheck,
  CreditCard,
  DollarSign,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const activities = data?.recentActivities || {};

  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Live school management metrics, academic attendance, and financial reconciliations.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Students"
          value={stats.totalStudents || 0}
          subtitle="Enrolled Active Roster"
          icon={GraduationCap}
          color="indigo"
        />
        <DashboardCard
          title="Teaching Faculty"
          value={stats.totalTeachers || 0}
          subtitle="Qualified Instructors"
          icon={Users}
          color="blue"
        />
        <DashboardCard
          title="Today's Attendance"
          value={`${stats.todayAttendancePercentage || 0}%`}
          subtitle="Morning Session Ratio"
          icon={CalendarCheck}
          color="emerald"
        />
        <DashboardCard
          title="Fees Collected"
          value={`₹${(stats.totalFeesCollected || 0).toLocaleString()}`}
          subtitle={`₹${(stats.outstandingFees || 0).toLocaleString()} outstanding`}
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Attendance Trends (%)</h3>
              <p className="text-xs text-slate-400">Daily presence percentage across all classes</p>
            </div>
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
              Past 7 Days
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.attendanceTrends || []}>
                <defs>
                  <linearGradient id="attendColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#attendColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Fee Collection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Fee Collections (₹)</h3>
              <p className="text-xs text-slate-400">Monthly reconciled payment ledger inflows</p>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Cash & Digital
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyFeeCollection || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip formatter={(val) => `₹${val}`} />
                <Bar dataKey="collected" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row: Grade Distribution & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Academic Grade Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Current exam outcomes based on grading rules</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.gradeDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="grade" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Registered Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Recent Admissions</h3>
          <p className="text-xs text-slate-400 mb-4">Latest enrolled students</p>
          <div className="space-y-3">
            {activities.students?.map((s) => (
              <div key={s._id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                <div>
                  <span className="font-semibold text-slate-800 block">
                    {s.firstName} {s.lastName}
                  </span>
                  <span className="text-slate-400">{s.admissionNumber}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                  {s.classId?.name || 'Class'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Fee Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-subtle">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Recent Payments</h3>
          <p className="text-xs text-slate-400 mb-4">Reconciled simulated transactions</p>
          <div className="space-y-3">
            {activities.payments?.map((p) => (
              <div key={p._id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                <div>
                  <span className="font-semibold text-slate-800 block">
                    {p.studentId?.firstName} {p.studentId?.lastName}
                  </span>
                  <span className="text-slate-400">{p.paymentMethod}</span>
                </div>
                <span className="font-bold text-emerald-600">
                  +₹{p.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
