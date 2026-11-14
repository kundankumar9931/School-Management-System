import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [switching, setSwitching] = useState(false);
  const { user, demoLogin, logout } = useAuth();
  const navigate = useNavigate();

  const handleSwitchDemoRole = async (targetRole) => {
    if (user?.role === targetRole) return;
    setSwitching(true);
    try {
      await demoLogin(targetRole);
      toast.success(`Switched demo persona to ${targetRole}`);
      navigate(`/${targetRole}`, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Failed to switch demo persona');
    } finally {
      setSwitching(false);
    }
  };

  const handleExitDemo = async () => {
    try {
      await logout();
      toast.success('Exited demo session');
      navigate('/', { replace: true });
    } catch (error) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col">
      {/* Demo Banner */}
      {user?.isDemo && (
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/25 border border-blue-400/40 text-[10px] font-bold uppercase tracking-wider text-blue-300">
              <Sparkles size={11} className="text-blue-300" />
              Demo Mode • Read-Only
            </span>
            <span className="hidden sm:inline text-slate-300 text-xs">
              Viewing as <strong>{user?.role?.toUpperCase()}</strong>. Modifications are blocked to protect school data.
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 hidden md:inline mr-1">Switch Persona:</span>
            <button
              type="button"
              disabled={switching}
              onClick={() => handleSwitchDemoRole('admin')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                user?.role === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              disabled={switching}
              onClick={() => handleSwitchDemoRole('teacher')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                user?.role === 'teacher'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              Teacher
            </button>
            <button
              type="button"
              disabled={switching}
              onClick={() => handleSwitchDemoRole('guardian')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                user?.role === 'guardian'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              Guardian
            </button>
            <button
              type="button"
              onClick={handleExitDemo}
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/30 transition"
            >
              <LogOut size={12} />
              Exit Demo
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
