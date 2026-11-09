import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { LogOut, User, Bell } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const roleLabels = {
    admin: 'Administrator',
    teacher: 'Faculty / Teacher',
    guardian: 'Parent / Guardian',
  };

  const roleBadgeColors = {
    admin: 'bg-rose-50 text-rose-700 border-rose-200',
    teacher: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    guardian: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20 shadow-subtle">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-slate-800 hidden sm:block">
          School Operations & Student Information System
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* User Role Badge */}
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
            roleBadgeColors[user?.role] || 'bg-slate-100 text-slate-700'
          }`}
        >
          {roleLabels[user?.role] || user?.role}
        </span>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
            {user?.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left">
            <span className="text-xs font-semibold text-slate-800 block leading-tight">
              {user?.profile?.fullName || user?.email?.split('@')[0]}
            </span>
            <span className="text-[10px] text-slate-400 block">{user?.email}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign out"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition ml-1"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
