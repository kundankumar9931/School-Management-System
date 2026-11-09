import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import { DashboardLayout } from './components/layout/DashboardLayout.jsx';

// Public Pages
import { LoginPage } from './pages/public/LoginPage.jsx';
import { UnauthorizedPage, NotFoundPage } from './pages/public/NotFoundPage.jsx';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview.jsx';
import { StudentsPage } from './pages/admin/StudentsPage.jsx';
import { StudentDetailPage } from './pages/admin/StudentDetailPage.jsx';
import { GuardiansPage } from './pages/admin/GuardiansPage.jsx';
import { TeachersPage } from './pages/admin/TeachersPage.jsx';
import { ClassesPage } from './pages/admin/ClassesPage.jsx';
import { AttendancePage } from './pages/admin/AttendancePage.jsx';
import { ExamsPage } from './pages/admin/ExamsPage.jsx';
import { MarksEntryPage } from './pages/admin/MarksEntryPage.jsx';
import { ReportCardsPage } from './pages/admin/ReportCardsPage.jsx';
import { FeesPage } from './pages/admin/FeesPage.jsx';
import { ReportsPage } from './pages/admin/ReportsPage.jsx';
import { AuditLogsPage } from './pages/admin/AuditLogsPage.jsx';
import { SettingsPage } from './pages/admin/SettingsPage.jsx';

// Teacher Pages
import { TeacherOverview, TeacherClassesPage } from './pages/teacher/TeacherOverview.jsx';
import { TeacherAttendancePage } from './pages/teacher/TeacherAttendancePage.jsx';
import { TeacherMarksPage } from './pages/teacher/TeacherMarksPage.jsx';

// Guardian Pages
import { GuardianOverview, GuardianResultsPage } from './pages/guardian/GuardianOverview.jsx';
import { GuardianAttendancePage, GuardianFeesPage } from './pages/guardian/GuardianAttendancePage.jsx';

// Root Redirector based on user role
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
  if (user?.role === 'guardian') return <Navigate to="/guardian" replace />;
  return <Navigate to="/login" replace />;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Admin Portal */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/students" element={<StudentsPage />} />
          <Route path="/admin/students/:id" element={<StudentDetailPage />} />
          <Route path="/admin/guardians" element={<GuardiansPage />} />
          <Route path="/admin/teachers" element={<TeachersPage />} />
          <Route path="/admin/classes" element={<ClassesPage />} />
          <Route path="/admin/attendance" element={<AttendancePage />} />
          <Route path="/admin/examinations" element={<ExamsPage />} />
          <Route path="/admin/marks" element={<MarksEntryPage />} />
          <Route path="/admin/report-cards" element={<ReportCardsPage />} />
          <Route path="/admin/fees" element={<FeesPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Teacher Portal */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/teacher" element={<TeacherOverview />} />
          <Route path="/teacher/classes" element={<TeacherClassesPage />} />
          <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
          <Route path="/teacher/marks" element={<TeacherMarksPage />} />
          <Route path="/teacher/performance" element={<TeacherClassesPage />} />
        </Route>
      </Route>

      {/* Guardian Portal */}
      <Route element={<ProtectedRoute allowedRoles={['guardian']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/guardian" element={<GuardianOverview />} />
          <Route path="/guardian/children" element={<GuardianOverview />} />
          <Route path="/guardian/attendance" element={<GuardianAttendancePage />} />
          <Route path="/guardian/results" element={<GuardianResultsPage />} />
          <Route path="/guardian/fees" element={<GuardianFeesPage />} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
