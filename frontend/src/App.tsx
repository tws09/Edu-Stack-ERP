import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useEffect } from 'react';
import './i18n';
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';

import ProtectedRoute from './components/shared/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import LoginPage from './pages/auth/LoginPage';
import SuperAdminLoginPage from './pages/auth/SuperAdminLoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import OrganizationsPage from './pages/admin/OrganizationsPage';
import OrgDetailPage from './pages/admin/OrgDetailPage';
import BillingPage from './pages/admin/BillingPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminSettingsPage from './pages/admin/SettingsPage';
import BranchDashboard from './pages/dashboard/BranchDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ClassFellowsPage from './pages/classFellows/ClassFellowsPage';
import AcademicSetupPage from './pages/settings/AcademicSetupPage';
import SettingsPage from './pages/settings/SettingsPage';
import StudentsPage from './pages/students/StudentsPage';
import AttendancePage from './pages/attendance/AttendancePage';
import TimetablePage from './pages/timetable/TimetablePage';
import TimetableEditPage from './pages/timetable/TimetableEditPage';
import ExamsPage from './pages/exams/ExamsPage';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import FeesPage from './pages/fees/FeesPage';
import PayrollPage from './pages/payroll/PayrollPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SopsPage from './pages/sops/SopsPage';
import StaffPage from './pages/staff/StaffPage';
import GroupSettingsPage from './pages/settings/GroupSettingsPage';
import BranchesPage from './pages/branches/BranchesPage';
import ResourcesPage from './pages/resources/ResourcesPage';
import ExamPaperPage from './pages/examPaper/ExamPaperPage';
import RolesHierarchyPage from './pages/roles/RolesHierarchyPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function RootRedirect() {
  const { isAuthenticated, user, orgSlug } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/register" replace />;
  if (user.role === 'super_admin') return <Navigate to="/admin" replace />;
  if (!orgSlug) return <Navigate to="/register" replace />;
  if (user.role === 'group_admin') return <Navigate to={`/${orgSlug}/group`} replace />;
  if (user.role === 'coordinator') return <Navigate to={`/${orgSlug}/coordinator`} replace />;
  if (user.role === 'teacher') return <Navigate to={`/${orgSlug}/teacher`} replace />;
  if (user.role === 'student') return <Navigate to={`/${orgSlug}/student`} replace />;
  return <Navigate to={`/${orgSlug}/dashboard`} replace />;
}

export default function App() {
  const isDark = useThemeStore((s) => s.isDark);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Global public ──────────────────────────── */}
            <Route path="/admin/login" element={<SuperAdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ── Super Admin (no org slug) ──────────────── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SuperAdminDashboard />} />
              <Route path="organizations" element={<OrganizationsPage />} />
              <Route path="organizations/:id" element={<OrgDetailPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* ── Org-scoped routes (all under /:slug) ───── */}
            <Route path="/:slug/login" element={<LoginPage />} />

            {/* Branch-level staff */}
            <Route
              path="/:slug/dashboard"
              element={
                <ProtectedRoute allowedRoles={['branch_principal', 'accountant', 'it_admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<BranchDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="timetable/edit" element={<TimetableEditPage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="academic" element={<AcademicSetupPage />} />
              <Route path="fees" element={<FeesPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="sops" element={<SopsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="exam-paper" element={<ExamPaperPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="staff" element={<StaffPage />} />
            </Route>

            {/* Coordinator */}
            <Route
              path="/:slug/coordinator"
              element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<BranchDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="exam-paper" element={<ExamPaperPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Teacher */}
            <Route
              path="/:slug/teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<BranchDashboard />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="exam-paper" element={<ExamPaperPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="sops" element={<SopsPage />} />
              <Route path="fees" element={<FeesPage />} />
              <Route path="payroll" element={<PayrollPage />} />
            </Route>

            {/* Student */}
            <Route
              path="/:slug/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="class-fellows" element={<ClassFellowsPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="fees" element={<FeesPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="sops" element={<SopsPage />} />
            </Route>

            {/* Group admin */}
            <Route
              path="/:slug/group"
              element={
                <ProtectedRoute allowedRoles={['group_admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<BranchDashboard />} />
              <Route path="branches" element={<BranchesPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="timetable/edit" element={<TimetableEditPage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="academic" element={<AcademicSetupPage />} />
              <Route path="fees" element={<FeesPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="sops" element={<SopsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="exam-paper" element={<ExamPaperPage />} />
              <Route path="settings" element={<GroupSettingsPage />} />
              <Route path="roles" element={<RolesHierarchyPage />} />
            </Route>

            {/* ── Catch-all ──────────────────────────────── */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
