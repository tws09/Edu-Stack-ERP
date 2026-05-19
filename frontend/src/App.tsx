import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import './i18n';

import ProtectedRoute from './components/shared/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import OrganizationsPage from './pages/admin/OrganizationsPage';
import BillingPage from './pages/admin/BillingPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminSettingsPage from './pages/admin/SettingsPage';
import BranchDashboard from './pages/dashboard/BranchDashboard';
import AcademicSetupPage from './pages/settings/AcademicSetupPage';
import SettingsPage from './pages/settings/SettingsPage';
import StudentsPage from './pages/students/StudentsPage';
import AttendancePage from './pages/attendance/AttendancePage';
import TimetablePage from './pages/timetable/TimetablePage';
import ExamsPage from './pages/exams/ExamsPage';
import AssignmentsPage from './pages/assignments/AssignmentsPage';
import FeesPage from './pages/fees/FeesPage';
import PayrollPage from './pages/payroll/PayrollPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SopsPage from './pages/sops/SopsPage';
import StaffPage from './pages/staff/StaffPage';
import GroupSettingsPage from './pages/settings/GroupSettingsPage';
import BranchesPage from './pages/branches/BranchesPage';

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Super Admin area */}
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
              <Route path="billing" element={<BillingPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Branch-level app */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['group_admin', 'branch_principal', 'teacher', 'student', 'accountant', 'it_admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<BranchDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="academic" element={<AcademicSetupPage />} />
              <Route path="fees" element={<FeesPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="sops" element={<SopsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="staff" element={<StaffPage />} />
            </Route>

            {/* Group admin area */}
            <Route
              path="/group"
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
              <Route path="exams" element={<ExamsPage />} />
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="academic" element={<AcademicSetupPage />} />
              <Route path="fees" element={<FeesPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="sops" element={<SopsPage />} />
              <Route path="settings" element={<GroupSettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
