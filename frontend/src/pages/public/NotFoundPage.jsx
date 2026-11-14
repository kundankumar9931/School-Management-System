import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LockKeyhole, School, Sparkles } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-2">403 - Access Denied</h1>
      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        You do not have the required permissions to access this page or portal resource. Please sign in with an account that has the appropriate role.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 transition"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg"
        >
          <LockKeyhole className="w-4 h-4" />
          <span>Sign In With Another Account</span>
        </Link>
      </div>
    </div>
  );
};

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white mb-6 shadow-lg">
        <School className="w-7 h-7" />
      </div>
      <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-2">
        404
      </h1>
      <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        The page you are looking for does not exist, has been removed, or requires valid authentication.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
        <Link
          to="/demo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-xl border border-blue-400/30 transition"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Explore Demo</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
