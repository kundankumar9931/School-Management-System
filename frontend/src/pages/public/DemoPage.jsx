import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  School,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  LockKeyhole,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  Layers,
  Database,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DemoPage = () => {
  const [loadingRole, setLoadingRole] = useState(null);
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLaunchDemo = async (role) => {
    setLoadingRole(role);
    try {
      const user = await demoLogin(role);

      const routes = {
        admin: '/admin',
        teacher: '/teacher',
        guardian: '/guardian',
      };

      toast.success(`Demo initialized! Welcome to the ${user.role} portal.`);
      navigate(routes[user.role] || '/admin', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Failed to initialize demo session');
      setLoadingRole(null);
    }
  };

  const demoRoles = [
    {
      id: 'admin',
      title: 'Institution Administrator',
      badge: 'Full Institutional Scope',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      icon: ShieldCheck,
      color: 'blue',
      description:
        'Oversee institutional metrics, student rosters, faculty assignments, classes, dynamic grading rules, financial fee reconciliation, and security audit trails.',
      highlights: [
        'Real-time KPI overview & Recharts graphs',
        'Student admissions & class placements',
        'Fee ledger reconciliation & invoice tracking',
        'System-wide audit trail logs',
      ],
      buttonText: 'Launch Admin Demo',
      gradient: 'from-blue-600 via-indigo-600 to-blue-700',
    },
    {
      id: 'teacher',
      title: 'Faculty / Teacher',
      badge: 'Classroom Educator',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
      icon: GraduationCap,
      color: 'violet',
      description:
        'Experience the educator workspace: view assigned classes and subject curricula, record morning & afternoon attendance with duplicate protection, and submit exam marks.',
      highlights: [
        'Scoped strictly to assigned classes',
        'Session attendance recording (Morning/Afternoon)',
        'Subject marks entry with automated GPA',
        'Class performance distributions',
      ],
      buttonText: 'Launch Faculty Demo',
      gradient: 'from-violet-600 via-indigo-600 to-purple-700',
    },
    {
      id: 'guardian',
      title: 'Parent / Guardian',
      badge: 'Family Portal',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      icon: HeartHandshake,
      color: 'emerald',
      description:
        'Engage with student progress: monitor daily session attendance, download term report cards with letter grades and GPA, and check fee invoices and dues.',
      highlights: [
        'Multi-child linked profiles',
        'Real-time session attendance calendar',
        'Official high-resolution report cards',
        'Transparent fee payment status',
      ],
      buttonText: 'Launch Guardian Demo',
      gradient: 'from-emerald-600 via-teal-600 to-green-700',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#070B19] text-white selection:bg-blue-600 selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Background ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-white/[0.035] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between border-b border-white/10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]">
            <School size={20} />
          </div>
          <div>
            <span className="text-lg font-bold text-white block leading-tight">
              Algions
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                {' '}Academy
              </span>
            </span>
            <span className="text-[9px] uppercase tracking-wider text-blue-300 font-semibold block">
              Demo Sandbox
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition"
          >
            <LockKeyhole size={13} />
            <span>Portal Login</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={13} />
            <span>Interactive Demo Environment</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Explore Algions Academy Firsthand
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Select an institutional persona below to access a live, pre-populated demonstration sandbox.
            Experience the system’s modules without creating an account or needing passwords.
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {demoRoles.map((role) => {
            const Icon = role.icon;
            const isLoading = loadingRole === role.id;
            const isAnyLoading = loadingRole !== null;

            return (
              <div
                key={role.id}
                className="group relative rounded-3xl p-7 bg-white/[0.045] hover:bg-white/[0.08] border border-white/10 hover:border-blue-400/40 transition-all duration-300 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Icon size={24} className="text-blue-400" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${role.badgeColor}`}
                    >
                      {role.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    {role.description}
                  </p>

                  <div className="pt-4 border-t border-white/10 mb-6">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                      Included Capabilities
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {role.highlights.map((item, hIdx) => (
                        <li key={hIdx} className="flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchDemo(role.id)}
                  disabled={isAnyLoading}
                  className={`w-full relative overflow-hidden flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl font-bold text-white bg-gradient-to-r ${role.gradient} hover:opacity-95 shadow-[0_8px_25px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Initializing Demo...</span>
                    </>
                  ) : (
                    <>
                      <span>{role.buttonText}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security & Sandbox Guarantee Notice */}
        <div className="rounded-2xl p-6 bg-blue-950/30 border border-blue-500/20 max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-300">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm mb-1">
              Read-Only Sandbox Protection
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Demo sessions operate with dedicated guest credentials secured by server-side authorization.
              All administrative and academic records can be thoroughly inspected and explored, while modifications and deletions are prevented to preserve data integrity.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 px-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Algions Academy. Public Interactive Demo Environment.</p>
      </footer>
    </div>
  );
};

export default DemoPage;
