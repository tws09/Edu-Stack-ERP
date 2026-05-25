import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import type { AuthUser } from '../../types';
import { cn } from '../../lib/utils';

type Step = 1 | 2;

interface FormData {
  orgName: string;
  slug: string;
  contactEmail: string;
  contactPhone: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
}

const EMPTY: FormData = {
  orgName: '', slug: '', contactEmail: '', contactPhone: '',
  adminName: '', adminEmail: '', adminPassword: '', confirmPassword: '',
};

function autoSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore(s => s.setSession);
  const { isDark, toggle } = useThemeStore();

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function handleOrgNameChange(name: string) {
    set('orgName', name);
    if (!slugManual) set('slug', autoSlug(name));
  }

  function validateStep1(): string {
    if (!form.orgName.trim()) return 'School name is required.';
    if (!form.slug.trim()) return 'URL slug is required.';
    if (!/^[a-z0-9-]+$/.test(form.slug)) return 'Slug can only contain lowercase letters, numbers and hyphens.';
    if (!form.contactEmail.trim()) return 'Contact email is required.';
    return '';
  }

  function validateStep2(): string {
    if (!form.adminName.trim()) return 'Your name is required.';
    if (!form.adminEmail.trim()) return 'Admin email is required.';
    if (form.adminPassword.length < 8) return 'Password must be at least 8 characters.';
    if (form.adminPassword !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', {
        orgName: form.orgName,
        slug: form.slug,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
      });

      setSession(data.data.user as AuthUser, form.slug);
      navigate(`/${form.slug}/group`, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message
        ?? err?.response?.data?.errors?.[0]?.msg
        ?? 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-10">
      {/* Dark mode toggle */}
      <button
        onClick={toggle}
        className="fixed top-4 right-4 w-9 h-9 rounded-xl bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 flex items-center justify-center transition-colors z-50"
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

      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Register your school</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">30-day free trial — no credit card required</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6 px-1">
          {([1, 2] as Step[]).map((s, i) => (
            <>
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                )}>
                  {step > s ? '✓' : s}
                </div>
                <span className={cn('text-sm font-medium', step === s ? 'text-gray-900 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500')}>
                  {s === 1 ? 'School Info' : 'Admin Account'}
                </span>
              </div>
              {i === 0 && <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />}
            </>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8">

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          {/* Step 1 — School Info */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">School / College Name *</label>
                <input
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Punjab Grammar School"
                  value={form.orgName}
                  onChange={e => handleOrgNameChange(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Your URL *</label>
                <div className="flex rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="bg-gray-50 dark:bg-slate-700/50 px-3.5 py-2.5 text-sm text-gray-400 dark:text-slate-500 border-r border-gray-300 dark:border-slate-600 whitespace-nowrap">edustack.pk/</span>
                  <input
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none font-mono dark:bg-slate-700 dark:text-slate-100"
                    placeholder="your-school"
                    value={form.slug}
                    onChange={e => { setSlugManual(true); set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }}
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Students and staff will use this URL to access your school.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">School Contact Email *</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="school@example.pk"
                  value={form.contactEmail}
                  onChange={e => set('contactEmail', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Contact Phone</label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+92 300 0000000"
                  value={form.contactPhone}
                  onChange={e => set('contactPhone', e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Continue →
              </button>
            </form>
          )}

          {/* Step 2 — Admin Account */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-500 dark:text-slate-400 -mt-1 mb-1">
                This account will be the <strong className="text-gray-700 dark:text-slate-200">Group Admin</strong> — full access to manage the school.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Your Full Name *</label>
                <input
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Muhammad Ahmed"
                  value={form.adminName}
                  onChange={e => set('adminName', e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Your Email *</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@school.pk"
                  value={form.adminEmail}
                  onChange={e => set('adminEmail', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Password *</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min 8 characters"
                  value={form.adminPassword}
                  onChange={e => set('adminPassword', e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  className={cn(
                    'w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100',
                    form.confirmPassword && form.confirmPassword !== form.adminPassword
                      ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-slate-600'
                  )}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>

              <p className="text-xs text-gray-400 dark:text-slate-500 text-center">
                By registering you agree to our Terms of Service. Your school starts on a 30-day free trial.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/admin/login" className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300">Sign in</Link>
        </p>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-3">
          EduStack PK &copy; {new Date().getFullYear()} — WolfStack
        </p>
      </div>
    </div>
  );
}
