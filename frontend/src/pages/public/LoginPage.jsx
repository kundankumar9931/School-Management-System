
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { FormInput } from '../../components/common/FormInput.jsx';
import {
  School,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Eye,
  EyeOff,
  Sparkles,
  LockKeyhole,
  BookOpen,
  Stars,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      id: 'admin',
      label: 'Administrator',
      subtitle: 'Manage school',
      icon: ShieldCheck,
      color: 'blue',
    },
    {
      id: 'teacher',
      label: 'Teacher',
      subtitle: 'Educate students',
      icon: GraduationCap,
      color: 'violet',
    },
    {
      id: 'guardian',
      label: 'Guardian',
      subtitle: 'Track progress',
      icon: HeartHandshake,
      color: 'emerald',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role !== role) {
        await logout();
        toast.error(`Please select the correct role for this account.`);
        return;
      }

      const routes = {
        admin: '/admin',
        teacher: '/teacher',
        guardian: '/guardian',
      };

      toast.success(`Welcome back, ${user.role}!`);
      navigate(routes[user.role], { replace: true });

    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070B19] text-white flex items-center justify-center px-4 py-12">

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/[0.035] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/[0.035] rounded-full" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-lg">

        {/* Branding */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-[0_0_40px_rgba(99,102,241,0.35)] mb-5">
            <School size={30} />
          </div>

          <div className="flex justify-center items-center gap-2 mb-3">
            <Sparkles size={14} className="text-blue-400" />
            <span className="text-xs tracking-[0.3em] uppercase text-blue-300 font-semibold">
              Excellence in Education
            </span>
            <Sparkles size={14} className="text-violet-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Algions
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              {' '}Academy
            </span>
          </h1>

          <p className="mt-3 text-slate-400 text-sm">
            Your gateway to smarter school management.
          </p>
        </div>

        {/* Login Card */}
        <div className="relative rounded-3xl border border-white/10 bg-white/[0.055] backdrop-blur-2xl p-6 sm:p-9 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">

          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-slate-400 text-sm mt-1">
                Sign in to continue to your portal
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
              <BookOpen className="text-blue-400" />
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-7">
            <label className="text-sm font-semibold text-slate-300 mb-3 block">
              Select your portal
            </label>

            <div className="grid grid-cols-3 gap-3">
              {roles.map((item) => {
                const Icon = item.icon;
                const active = role === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`group relative flex flex-col items-center text-center p-3 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                      active
                        ? 'border-blue-400/70 bg-blue-500/15 shadow-[0_0_25px_rgba(59,130,246,0.15)]'
                        : 'border-white/10 bg-white/[0.025] hover:border-white/30 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg'
                        : 'bg-white/5 text-slate-400 group-hover:text-white'
                    }`}>
                      <Icon size={20} />
                    </div>

                    <span className={`text-xs font-bold ${
                      active ? 'text-white' : 'text-slate-300'
                    }`}>
                      {item.label}
                    </span>

                    <span className="text-[9px] text-slate-500 mt-1 hidden sm:block">
                      {item.subtitle}
                    </span>

                    {active && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-400 border-2 border-[#11172a]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="relative">
              <FormInput
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </div>

            <div className="relative">
              <FormInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-white transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full relative overflow-hidden flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_40px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LockKeyhole size={17} />
                  Sign In to Portal
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-7 pt-5 border-t border-white/10">
            <div className="flex justify-center items-center gap-2 text-slate-400">
              <Stars size={14} className="text-blue-400" />
              <span className="text-xs">
                Secure access for authorized school users
              </span>
            </div>
          </div>

        </div>

        {/* Bottom footer */}
        <p className="text-center text-xs text-slate-500 mt-7">
          © {new Date().getFullYear()} Algions International Academy.
          All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
