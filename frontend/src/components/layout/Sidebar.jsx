import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  CalendarCheck,
  FileCheck,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  School,
  FileText,
  User,
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  const adminNav = [
    { name: 'Overview', to: '/admin', icon: LayoutDashboard },
    { name: 'Students', to: '/admin/students', icon: GraduationCap },
    { name: 'Guardians', to: '/admin/guardians', icon: UserCheck },
    { name: 'Teachers', to: '/admin/teachers', icon: Users },
    { name: 'Academic Structure', to: '/admin/classes', icon: BookOpen },
    { name: 'Attendance', to: '/admin/attendance', icon: CalendarCheck },
    { name: 'Examinations', to: '/admin/examinations', icon: FileCheck },
    { name: 'Marks Entry', to: '/admin/marks', icon: FileText },
    { name: 'Report Cards', to: '/admin/report-cards', icon: School },
    { name: 'Fees & Invoices', to: '/admin/fees', icon: CreditCard },
    { name: 'Reports & Analytics', to: '/admin/reports', icon: BarChart3 },
    { name: 'Audit Logs', to: '/admin/audit-logs', icon: ShieldCheck },
    { name: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  const teacherNav = [
    { name: 'Overview', to: '/teacher', icon: LayoutDashboard },
    { name: 'My Classes & Students', to: '/teacher/classes', icon: BookOpen },
    { name: 'Attendance Recording', to: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Marks Entry', to: '/teacher/marks', icon: FileCheck },
    { name: 'Student Performance', to: '/teacher/performance', icon: BarChart3 },
  ];

  const guardianNav = [
    { name: 'Overview', to: '/guardian', icon: LayoutDashboard },
    { name: 'My Children', to: '/guardian/children', icon: Users },
    { name: 'Attendance History', to: '/guardian/attendance', icon: CalendarCheck },
    { name: 'Exam Results & Cards', to: '/guardian/results', icon: FileCheck },
    { name: 'Fee Invoices & Dues', to: '/guardian/fees', icon: CreditCard },
  ];

  const navLinks = role === 'admin' ? adminNav : role === 'teacher' ? teacherNav : guardianNav;

  return (
    <aside
      className={`bg-navy-900 text-slate-300 flex flex-col justify-between transition-all duration-300 z-30 h-screen sticky top-0 border-r border-navy-800 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-800/80 bg-navy-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
              <School className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-bold text-white tracking-tight text-sm block">Algions Academy</span>
                <span className="text-[10px] text-brand-400 font-medium uppercase tracking-wider block">
                  SMS Portal
                </span>
              </div>
            )}
          </div>
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/teacher' || item.to === '/guardian'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-navy-800/60'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Role Pill Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-navy-800/80 bg-navy-950/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-slate-400">Environment: <strong className="text-slate-200">Live</strong></span>
          </div>
        </div>
      )}
    </aside>
  );
};
