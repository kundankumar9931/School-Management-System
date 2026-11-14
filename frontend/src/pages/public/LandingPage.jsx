import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  School,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Users,
  CalendarCheck,
  FileCheck,
  CreditCard,
  BarChart3,
  BookOpen,
  Sparkles,
  LockKeyhole,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  FileText,
  Clock,
  Layers,
  Award,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('admin');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePortalRedirect = () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    const routes = {
      admin: '/admin',
      teacher: '/teacher',
      guardian: '/guardian',
    };
    navigate(routes[user.role] || '/login');
  };

  const features = [
    {
      title: 'Student Management',
      description:
        'Complete student lifecycle management with detailed profiles, biodata, admission records, class placements, and academic histories.',
      icon: GraduationCap,
      color: 'blue',
      badge: 'Core SIS',
      points: ['Admission & biodata tracking', 'Section & class assignments', 'Search & filtered student rosters'],
    },
    {
      title: 'Teacher Management',
      description:
        'Faculty directory with department organization, employee IDs, contact data, and active class-subject teaching assignments.',
      icon: Users,
      color: 'violet',
      badge: 'Faculty',
      points: ['Faculty profile & credentials', 'Subject & class mappings', 'Teacher workload tracking'],
    },
    {
      title: 'Attendance Management',
      description:
        'Session-based attendance for Morning and Afternoon sessions with compound unique indexing preventing duplicate records.',
      icon: CalendarCheck,
      color: 'emerald',
      badge: 'Session-Based',
      points: ['Morning & afternoon sessions', 'Atomic bulk status recording', 'Duplicate entry prevention'],
    },
    {
      title: 'Class and Section Management',
      description:
        'Structured academic hierarchy organizing academic years, classes, sections, and curriculum subject catalogs.',
      icon: BookOpen,
      color: 'cyan',
      badge: 'Academics',
      points: ['Multi-year class structures', 'Section capacity control', 'Subject code cataloging'],
    },
    {
      title: 'Examination Management',
      description:
        'Dynamic grading engine (A+ to F), marks entry per subject, automatic GPA calculation, and official printable report cards.',
      icon: FileCheck,
      color: 'amber',
      badge: 'Grading Engine',
      points: ['Custom grading boundaries', 'Marks entry with auto GPA', 'Printable official report cards'],
    },
    {
      title: 'Fee Management',
      description:
        'Tuition and lab fee structures, automated student invoice generation, overpayment protection, and reconciled balance ledgers.',
      icon: CreditCard,
      color: 'rose',
      badge: 'Ledger-Safe',
      points: ['Multi-component fee structures', 'Overpayment validation', 'Strict ledger balance balance'],
    },
    {
      title: 'Academic Reports',
      description:
        'Real-time institutional analytics computed directly from MongoDB records with Recharts visuals and CSV exports.',
      icon: BarChart3,
      color: 'indigo',
      badge: 'Analytics',
      points: ['Dynamic KPI calculation', 'Visual collection & grade charts', 'Audit-ready CSV exports'],
    },
    {
      title: 'Guardian Portal',
      description:
        'Restricted family portal granting parents real-time visibility into their linked children’s attendance, marks, and invoices.',
      icon: HeartHandshake,
      color: 'teal',
      badge: 'Parent SIS',
      points: ['Multi-child family link', 'Live attendance history', 'Direct report card & fee access'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#070B19] text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-white/[0.025] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/[0.035] rounded-full" />
      </div>

      {/* Sticky Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070B19]/80 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform duration-300">
              <School size={22} />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block leading-tight">
                Algions
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                  {' '}Academy
                </span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-blue-300 font-semibold block">
                School Management System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              Platform Preview
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-300 bg-blue-500/10 border border-blue-400/30 hover:bg-blue-500/20 hover:border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300"
            >
              <Sparkles size={16} className="text-blue-400" />
              Explore Demo
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handlePortalRedirect}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 shadow-[0_4px_20px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-all duration-300"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 shadow-[0_4px_20px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <LockKeyhole size={15} />
                Login to Portal
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a1024]/95 border-b border-white/10 px-4 pt-4 pb-6 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition"
              >
                Features
              </a>
              <a
                href="#preview"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition"
              >
                Platform Preview
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition"
              >
                How It Works
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition"
              >
                About
              </a>
            </nav>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <Link
                to="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-blue-300 bg-blue-500/10 border border-blue-400/30"
              >
                <Sparkles size={16} />
                Explore Demo
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600"
              >
                <LockKeyhole size={15} />
                Login to Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Sparkles size={14} className="text-blue-400" />
            <span>Smart School Management Made Simple</span>
            <Sparkles size={14} className="text-violet-400" />
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Smart School Management <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
              Made Simple
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A modern platform to manage students, teachers, attendance, academic activities, and school administration.
            Built with strict role-based access control, session-accurate attendance, dynamic grading, and reconciled fee ledgers.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/demo"
              className="w-full sm:w-auto group relative overflow-hidden inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500 shadow-[0_8px_35px_rgba(79,70,229,0.45)] hover:shadow-[0_12px_45px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Sparkles size={18} className="text-blue-200" />
              <span>Explore Demo</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <LockKeyhole size={17} className="text-slate-400" />
              <span>Login to Portal</span>
            </Link>
          </div>

          {/* Key Metrics / Highlights Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-white/10 text-left">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 block">3 Portals</span>
              <span className="text-xs text-slate-400 font-medium">Admin, Faculty & Guardian</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-2xl sm:text-3xl font-extrabold text-violet-400 block">2 Sessions</span>
              <span className="text-xs text-slate-400 font-medium">Morning & Afternoon Daily</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block">100%</span>
              <span className="text-xs text-slate-400 font-medium">Reconciled Fee Ledgers</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 block">A+ to F</span>
              <span className="text-xs text-slate-400 font-medium">Dynamic Grading Engine</span>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DASHBOARD PREVIEW SECTION */}
        <section id="preview" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Layers size={13} />
              <span>Interactive System Preview</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Built for Administrators, Faculty & Families
            </h2>
            <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Experience the tailored user interfaces designed to streamline workflows for each educational stakeholder.
            </p>

            {/* Role Preview Switcher Tabs */}
            <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-white/[0.05] border border-white/10 max-w-xl mx-auto w-full sm:w-auto">
              <button
                onClick={() => setActivePreviewTab('admin')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activePreviewTab === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck size={16} />
                Administrator Portal
              </button>
              <button
                onClick={() => setActivePreviewTab('teacher')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activePreviewTab === 'teacher'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap size={16} />
                Faculty Portal
              </button>
              <button
                onClick={() => setActivePreviewTab('guardian')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activePreviewTab === 'guardian'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HeartHandshake size={16} />
                Guardian Portal
              </button>
            </div>
          </div>

          {/* Simulated Application Window Chrome */}
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Top Bar of Window */}
            <div className="px-5 py-3.5 bg-slate-950/70 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs text-slate-400 font-mono hidden sm:inline">
                  https://algions-academy.internal/
                  {activePreviewTab === 'admin' ? 'admin' : activePreviewTab === 'teacher' ? 'teacher' : 'guardian'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">
                  Live Preview Mode
                </span>
              </div>
            </div>

            {/* Inner Dashboard Mock Content */}
            <div className="p-6 sm:p-8 bg-[#0b1228]/90">
              {activePreviewTab === 'admin' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-xl font-bold text-white">Administrator Executive Overview</h3>
                      <p className="text-xs text-slate-400">Institutional metrics, financial ledger, and student records</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-400/30 text-blue-300">
                      Academic Year 2025–2026
                    </span>
                  </div>

                  {/* 4 KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium">Total Students</span>
                        <GraduationCap size={16} className="text-blue-400" />
                      </div>
                      <span className="text-2xl font-extrabold text-white">1,248</span>
                      <span className="text-[11px] text-emerald-400 block mt-1">↑ 8.2% from last term</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium">Active Faculty</span>
                        <Users size={16} className="text-violet-400" />
                      </div>
                      <span className="text-2xl font-extrabold text-white">84</span>
                      <span className="text-[11px] text-slate-400 block mt-1">100% Assigned</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium">Today's Attendance</span>
                        <CalendarCheck size={16} className="text-emerald-400" />
                      </div>
                      <span className="text-2xl font-extrabold text-white">96.8%</span>
                      <span className="text-[11px] text-emerald-400 block mt-1">Morning session verified</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium">Fee Collection</span>
                        <CreditCard size={16} className="text-amber-400" />
                      </div>
                      <span className="text-2xl font-extrabold text-white">₹184,250</span>
                      <span className="text-[11px] text-blue-400 block mt-1">Reconciled ledger</span>
                    </div>
                  </div>

                  {/* Sample Data Table Snapshot */}
                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/20">
                    <div className="px-4 py-3 bg-white/[0.02] border-b border-white/10 flex items-center justify-between text-xs text-slate-300 font-semibold">
                      <span>Recent Student Admissions & Placements</span>
                      <span className="text-blue-400">View All 1,248</span>
                    </div>
                    <div className="divide-y divide-white/5 text-xs text-slate-300">
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                            LS
                          </div>
                          <div>
                            <span className="font-semibold text-white block">Rahul jha</span>
                            <span className="text-[10px] text-slate-400">ADM-2025-0104 • Grade 10-A</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Active Enrolled
                        </span>
                      </div>
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold">
                            ES
                          </div>
                          <div>
                            <span className="font-semibold text-white block">Kundan kumar</span>
                            <span className="text-[10px] text-slate-400">ADM-2025-0105 • Grade 9-B</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Active Enrolled
                        </span>
                      </div>
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                            OD
                          </div>
                          <div>
                            <span className="font-semibold text-white block">Sachin singh</span>
                            <span className="text-[10px] text-slate-400">ADM-2025-0109 • Grade 10-A</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Active Enrolled
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'teacher' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-xl font-bold text-white">Faculty Instruction & Grading Engine</h3>
                      <p className="text-xs text-slate-400">Scoped strictly to assigned classes and curricula</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-400/30 text-violet-300">
                      Instructor: Dr. Sarah Connor
                    </span>
                  </div>

                  {/* Teacher Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <span className="text-xs text-slate-400 block mb-1">Assigned Classes</span>
                      <span className="text-2xl font-bold text-white">Grade 10-A, 11-B</span>
                      <span className="text-xs text-violet-400 block mt-1">Science & Physics</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <span className="text-xs text-slate-400 block mb-1">Session Attendance</span>
                      <span className="text-2xl font-bold text-emerald-400">Morning Logged</span>
                      <span className="text-xs text-slate-400 block mt-1">32 Present • 1 Late • 0 Absent</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <span className="text-xs text-slate-400 block mb-1">Exam Marks Status</span>
                      <span className="text-2xl font-bold text-amber-400">Mid-Term Evaluated</span>
                      <span className="text-xs text-slate-400 block mt-1">Class Average GPA: 3.65 (A)</span>
                    </div>
                  </div>

                  {/* Attendance Marker Simulation */}
                  <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-semibold text-white">Daily Session Roster (Grade 10 Science)</span>
                      <span className="text-slate-400">Duplicate Check: Protected</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                        <span className="text-xs font-medium text-slate-200">Lucas Smith (Roll 101)</span>
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">Present</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                        <span className="text-xs font-medium text-slate-200">Sophia Davis (Roll 102)</span>
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">Present</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                        <span className="text-xs font-medium text-slate-200">Liam Wilson (Roll 103)</span>
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold">Late (10m)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'guardian' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="text-xl font-bold text-white">Parent & Guardian Portal</h3>
                      <p className="text-xs text-slate-400">Linked to children’s academic performance and fee invoices</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
                      Parent: Robert Smith
                    </span>
                  </div>

                  {/* Linked Children Snapshot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-emerald-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-base">Lucas Smith</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                          Grade 10-A
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-300 mt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Attendance Rate:</span>
                          <span className="font-semibold text-emerald-400">97.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Latest GPA:</span>
                          <span className="font-semibold text-white">3.85 / 4.0 (A+)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Term Invoices:</span>
                          <span className="font-semibold text-emerald-400">Paid in Full</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-base">Emma Smith</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300">
                          Grade 9-B
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-300 mt-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Attendance Rate:</span>
                          <span className="font-semibold text-emerald-400">95.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Latest GPA:</span>
                          <span className="font-semibold text-white">3.70 / 4.0 (A)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Term Invoices:</span>
                          <span className="font-semibold text-emerald-400">Paid in Full</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report Card Snapshot Preview */}
                  <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-semibold pb-2 border-b border-white/10">
                      <span>Official Term 1 Report Card Preview (Lucas Smith)</span>
                      <span className="text-emerald-400 font-bold">STATUS: PASSED (FIRST CLASS)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-3 text-center text-xs">
                      <div className="p-2 rounded-xl bg-white/[0.02]">
                        <span className="text-[10px] text-slate-400 block">Mathematics</span>
                        <span className="font-bold text-white text-sm">94%</span>
                        <span className="text-[10px] text-blue-400 font-semibold block">Grade A+</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02]">
                        <span className="text-[10px] text-slate-400 block">Science</span>
                        <span className="font-bold text-white text-sm">88%</span>
                        <span className="text-[10px] text-blue-400 font-semibold block">Grade A</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02]">
                        <span className="text-[10px] text-slate-400 block">English</span>
                        <span className="font-bold text-white text-sm">91%</span>
                        <span className="text-[10px] text-blue-400 font-semibold block">Grade A+</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02]">
                        <span className="text-[10px] text-slate-400 block">History</span>
                        <span className="font-bold text-white text-sm">85%</span>
                        <span className="text-[10px] text-blue-400 font-semibold block">Grade A</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles size={14} />
              <span>Full-Spectrum Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Comprehensive Institutional Management
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg">
              Engineered for academic precision, absolute transparency, and robust administrative control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="group relative rounded-3xl p-6 bg-white/[0.035] hover:bg-white/[0.07] border border-white/10 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 shadow-[0_10px_30px_rgba(0,0,0,0.25)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-blue-400 group-hover:text-white group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-violet-600 transition-all duration-300">
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {feat.description}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-4 border-t border-white/5 text-[11px] text-slate-300">
                    {feat.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Clock size={14} />
              <span>Cohesive Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              How Algions Academy Operates
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg">
              A unified end-to-end workflow connecting institutional administration, daily classroom execution, and family engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-3xl p-8 bg-white/[0.03] border border-white/10 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/30 text-blue-400 flex items-center justify-center font-extrabold text-lg mb-6">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Institutional Setup</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Administrators configure the academic foundation: classes, sections, course subjects, fee ledgers, and grading rules.
                Faculty members are assigned to their designated teaching schedules.
              </p>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-blue-300 font-semibold flex items-center gap-2">
                <span>Role: Administrator Portal</span>
                <ChevronRight size={14} />
              </div>
            </div>

            <div className="relative rounded-3xl p-8 bg-white/[0.03] border border-white/10 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-400/30 text-violet-400 flex items-center justify-center font-extrabold text-lg mb-6">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Daily Classroom Instruction</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Teachers record session-based attendance (Morning & Afternoon) with duplicate-entry prevention.
                Exam results and subject marks are submitted directly into the automated calculation engine.
              </p>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-violet-300 font-semibold flex items-center gap-2">
                <span>Role: Faculty Portal</span>
                <ChevronRight size={14} />
              </div>
            </div>

            <div className="relative rounded-3xl p-8 bg-white/[0.03] border border-white/10 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-extrabold text-lg mb-6">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Family Visibility & Progress</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Parents track attendance logs in real time, review term-by-term GPA progress, download official printable report cards,
                and review clear, reconciled fee invoices.
              </p>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                <span>Role: Guardian Portal</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <School size={14} />
                <span>About Algions Academy</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Modernizing Educational Management For The Digital Age
              </h2>
              <p className="mt-4 text-slate-300 text-base leading-relaxed">
                Algions Academy was engineered to overcome the bottlenecks of fragmented spreadsheets, paper-based roll calls,
                and disconnected billing records. We provide educational institutions with an integrated, secure, and intuitive
                operating platform.
              </p>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                By enforcing database-level integrity, role-based boundary separation, and transactional ledger accounting,
                our software gives school leaders complete operational visibility while keeping educators and parents closely aligned.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-lg font-bold text-white block mb-1">Session-Based Safety</span>
                  <span className="text-xs text-slate-400">Unique compound indexing guarantees no duplicate attendance marks.</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <span className="text-lg font-bold text-white block mb-1">Financial Reconciliation</span>
                  <span className="text-xs text-slate-400">Strict ledger validation ensures payments never exceed invoice balances.</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl p-8 bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-violet-950/40 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="text-blue-400" />
                Enterprise Security Architecture
              </h3>
              <ul className="space-y-4 text-xs text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block">Dual Token Transport</strong>
                    Secure HTTP-only cookies paired with Bearer Authorization headers for robust API protection.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block">Server-Side Role Guarding</strong>
                    Every endpoint strictly checks authenticated identities before releasing records. Unassigned access returns 403 Forbidden.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white block">Non-Blocking Audit Logger</strong>
                    Asynchronously captures user identity, action type, IP address, and payload signatures without blocking responses.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA CALLOUT */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-violet-900/60 border border-white/20 text-center overflow-hidden shadow-[0_20px_80px_rgba(79,70,229,0.3)]">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Ready to Experience Algions Academy?
              </h2>
              <p className="mt-4 text-slate-200 text-base sm:text-lg">
                Explore the platform immediately with seeded synthetic records in our read-only demo sandbox, or sign in to your authorized portal.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Sparkles size={18} />
                  <span>Explore Live Demo Sandbox</span>
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <LockKeyhole size={17} />
                  <span>Portal Login</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#050814] text-slate-400 text-sm py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Branding */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white">
                <School size={20} />
              </div>
              <span className="text-lg font-bold text-white">Algions Academy</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Production-grade School Management System engineered with modern MERN stack technology, strict RBAC, and ledger reconciliation.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#features" className="hover:text-white transition">
                  Platform Features
                </a>
              </li>
              <li>
                <a href="#preview" className="hover:text-white transition">
                  Interactive Preview
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition">
                  About Algions
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Dedicated Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Portals & Demo</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/demo" className="hover:text-blue-400 transition flex items-center gap-1.5">
                  <Sparkles size={12} className="text-blue-400" />
                  Explore Demo Sandbox
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Administrator Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Faculty / Teacher Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Parent / Guardian Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & System Status */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">System Information</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Algions International Academy SMS Platform
              <br />
              Secure Cloud Hosted Deployment
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Algions Academy. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/demo" className="hover:text-slate-400 transition">
              Explore Demo
            </Link>
            <Link to="/login" className="hover:text-slate-400 transition">
              Portal Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
