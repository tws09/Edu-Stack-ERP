import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, BookOpenText, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { getOrgBranding } from '../../services/authService';
import { getOrgSlug } from '../../utils/tenant';
import { cn } from '../../lib/utils';

type LoginRole = 'admin' | 'teacher' | 'student';

const ROLE_OPTIONS: { value: LoginRole; label: string; Icon: React.ElementType }[] = [
  { value: 'admin',   label: 'Admin / Staff', Icon: ShieldCheck   },
  { value: 'teacher', label: 'Teacher',        Icon: BookOpenText  },
  { value: 'student', label: 'Student',        Icon: GraduationCap },
];

function getDashboardPath(role?: string): string {
  if (role === 'super_admin') return '/';
  if (role === 'group_admin') return '/group';
  if (role === 'teacher')     return '/teacher';
  if (role === 'student')     return '/student';
  return '/dashboard';
}

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const slug = getOrgSlug();
  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const { isDark, toggle } = useThemeStore();

  const { data: branding } = useQuery({
    queryKey: ['org-branding', slug],
    queryFn: () => getOrgBranding(slug!),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });

  const [selectedRole, setSelectedRole] = useState<LoginRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(getDashboardPath(user.role), { replace: true });
  }, [user, navigate]);

  function handleRoleChange(role: LoginRole) {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
    setError('');
  }

  function validate(): string | null {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('auth.invalidEmail');
    if (password.length < 6) return t('auth.passwordTooShort');
    return null;
  }

  const ADMIN_ROLES = ['group_admin', 'branch_principal', 'coordinator', 'accountant', 'it_admin'];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password, slug ?? undefined, selectedRole as 'admin' | 'teacher' | 'student');
      const updatedUser = useAuthStore.getState().user;
      if (updatedUser) {
        if (selectedRole === 'teacher' && updatedUser.role !== 'teacher') {
          setError('This account is not registered as a Teacher. Please select the correct role.');
          await useAuthStore.getState().logout();
          return;
        }
        if (selectedRole === 'admin' && !ADMIN_ROLES.includes(updatedUser.role)) {
          setError('This account is not registered as Staff / Admin. Please select the correct role.');
          await useAuthStore.getState().logout();
          return;
        }
        if (selectedRole === 'student' && updatedUser.role !== 'student') {
          setError('This account is not registered as a Student. Please select the correct role.');
          await useAuthStore.getState().logout();
          return;
        }
      }
      navigate(getDashboardPath(updatedUser?.role), { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'PASSWORD_CHANGE_REQUIRED') {
        setError(t('auth.mustChangePassword'));
      } else if (msg && msg !== 'Login failed') {
        setError(msg);
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } finally {
      setLoading(false);
    }
  }

  const roleLabel = ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label ?? '';
  const schoolName = branding?.name ?? 'EduStack PK';

  return (
    <div className="min-h-screen flex">

      {/* Dark mode toggle */}
      <button
        onClick={toggle}
        className={cn(
          'fixed top-4 right-4 w-9 h-9 rounded-xl z-50 flex items-center justify-center transition-colors',
          'bg-white/10 hover:bg-white/20 text-white',
          'lg:bg-gray-100 lg:hover:bg-gray-200 lg:text-gray-600'
        )}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* ── LEFT PANEL — desktop only ── */}
      <div className="hidden lg:flex w-1/2 bg-white border-r border-gray-100 flex-col items-center justify-center px-16 relative">
        <div className="text-center">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={schoolName}
              className="h-28 w-auto object-contain mx-auto mb-7"
            />
          ) : (
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-7 shadow-xl shadow-blue-600/20">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {schoolName}
          </h1>
          <p className="text-gray-400 text-base mt-2 font-medium">
            {branding?.welcomeMessage || 'School Management System'}
          </p>
        </div>

        <p className="absolute bottom-6 text-xs text-gray-300">
          EduStack PK &copy; {new Date().getFullYear()} — WolfStack
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className="flex-1 flex items-center justify-center px-4 py-12 relative bg-navy-950 lg:bg-gray-50"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(96,165,250,0.08) 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      >
        {/* Desktop: hide dot pattern */}
        <div className="hidden lg:block absolute inset-0 bg-gray-50 pointer-events-none" />

        {/* Mobile decorative blobs */}
        <div className="lg:hidden pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">

          {/* Mobile-only brand mark */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={schoolName}
                className="h-16 w-auto object-contain mb-4 drop-shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
                <svg className="w-9 h-9 text-navy-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{schoolName}</h1>
            <p className="text-blue-300 text-sm mt-1 font-medium">
              {branding?.welcomeMessage || 'School Management System'}
            </p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-black/8 overflow-hidden">
            <div className="h-1 bg-linear-to-r from-blue-600 to-blue-400" />

            <div className="px-8 py-8 lg:px-10 lg:py-9">
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">{t('auth.loginTitle')}</h2>
              <p className="text-gray-400 text-sm mb-6">{t('auth.loginSubtitle')}</p>

              {/* Role selector */}
              <div className="mb-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Sign in as</p>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleRoleChange(opt.value)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 px-1 text-xs font-semibold transition-all duration-150',
                        selectedRole === opt.value
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <opt.Icon size={20} strokeWidth={1.75} />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <label className="label">{t('auth.email')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@school.pk"
                      className="input pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">{t('auth.password')}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="input pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'w-full rounded-xl py-3 text-sm font-bold text-white mt-1',
                    'bg-blue-600 hover:bg-blue-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    'shadow-lg shadow-blue-600/20 transition-colors duration-150',
                    'flex items-center justify-center gap-2'
                  )}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      Login as {roleLabel}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-gray-50 border-t border-gray-100 px-8 lg:px-10 py-4 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Register your school →
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-blue-400/60 mt-6 lg:hidden">
            EduStack PK &copy; {new Date().getFullYear()} — WolfStack
          </p>
        </div>
      </div>

    </div>
  );
}
