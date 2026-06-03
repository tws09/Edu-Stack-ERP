import { useState } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { schoolUrl, adminLoginUrl } from '../../utils/tenant';
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

const FEATURES = [
  {
    label: 'Attendance & Timetable',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Fee Management & Payroll',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: 'Exams, Results & Assignments',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    label: 'Student & Staff Management',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Mobile App for Android',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const SCHOOL_SEEDS = [
  { initials: 'PG', color: 'bg-violet-500' },
  { initials: 'BH', color: 'bg-blue-500' },
  { initials: 'FS', color: 'bg-emerald-500' },
  { initials: 'AC', color: 'bg-amber-500' },
];

export default function RegisterPage() {
  const setSession = useAuthStore(s => s.setSession);
  const { isDark, toggle } = useThemeStore();

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slugManual, setSlugManual] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      window.location.href = schoolUrl(form.slug, '/group');
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
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT BRAND PANEL ─────────────────────────────────── */}
      <div className="lg:w-[46%] bg-slate-900 text-white flex flex-col lg:min-h-screen">

        {/* Mobile-only compact banner */}
        <div className="lg:hidden flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-base leading-none">EduStack PK</div>
            <div className="text-slate-400 text-xs mt-0.5">by WolfStack</div>
          </div>
        </div>

        {/* Desktop full panel */}
        <div className="hidden lg:flex flex-col flex-1 px-12 py-12 justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-14">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg leading-none tracking-tight">EduStack PK</div>
                <div className="text-slate-500 text-xs mt-0.5">by WolfStack</div>
              </div>
            </div>

            {/* Headline */}
            <div className="mb-10">
              <h1 className="text-[2.1rem] font-bold leading-tight text-white mb-3">
                Modern school management<br />
                <span className="text-blue-400">built for Pakistan.</span>
              </h1>
              <p className="text-slate-400 text-xl font-light" dir="rtl" lang="ur">
                اپنے اسکول کو ڈیجیٹل بنائیں
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-3 mb-10">
              {FEATURES.map(f => (
                <li key={f.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-slate-300 text-sm">{f.label}</span>
                </li>
              ))}
            </ul>

            {/* Social proof */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex -space-x-2">
                {SCHOOL_SEEDS.map(s => (
                  <div
                    key={s.initials}
                    className={cn('w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-bold', s.color)}
                  >
                    {s.initials}
                  </div>
                ))}
              </div>
              <p className="text-slate-400 text-sm">
                Trusted by <span className="text-white font-semibold">500+ schools</span> across Pakistan
              </p>
            </div>

            {/* Pricing card */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-start justify-between mb-1">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-medium">Pricing</div>
                <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2.5 py-0.5 font-medium">
                  Free trial
                </span>
              </div>
              <div className="text-white font-semibold text-base mt-2">30 days completely free</div>
              <div className="text-slate-400 text-sm mt-0.5">
                Then from <span className="text-white font-medium">PKR 2,999 / month</span>
              </div>
              <div className="text-xs text-slate-600 mt-2">No credit card required &middot; Cancel anytime</div>
            </div>
          </div>

          <div className="text-xs text-slate-700 mt-8">
            &copy; {new Date().getFullYear()} WolfStack &middot; EduStack PK
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ─────────────────────────────────── */}
      <div className="flex-1 bg-gray-50 dark:bg-slate-800 flex flex-col items-center justify-center relative px-6 py-10 lg:py-12 lg:px-12">

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-500 dark:text-slate-300 flex items-center justify-center transition-colors"
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

        <div className="w-full max-w-md">

          {/* Step header */}
          <div className="mb-8">
            {/* Step indicator */}
            <div className="flex items-center gap-0 mb-7">
              {([1, 2] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                      step === s
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-110'
                        : step > s
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-400 dark:text-slate-400'
                    )}>
                      {step > s ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : s}
                    </div>
                    <span className={cn(
                      'text-xs font-medium hidden sm:block',
                      step === s ? 'text-gray-800 dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'
                    )}>
                      {s === 1 ? 'School Info' : 'Admin Account'}
                    </span>
                  </div>
                  {i === 0 && (
                    <div className="w-10 sm:w-16 h-px mx-3 bg-gray-200 dark:bg-slate-600 relative overflow-hidden">
                      <div className={cn(
                        'absolute inset-0 bg-emerald-500 transition-transform duration-500 origin-left',
                        step > 1 ? 'scale-x-100' : 'scale-x-0'
                      )} />
                    </div>
                  )}
                </div>
              ))}
              <div className="ml-auto text-xs text-gray-400 dark:text-slate-500 tabular-nums">
                {step === 1 ? '~2 min' : 'Almost done'}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">
              {step === 1 ? 'Register your school' : 'Set up your admin account'}
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
              {step === 1
                ? 'Step 1 of 2 — School details'
                : 'Step 2 of 2 — This account gets full access to manage your school'}
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              <Field label="School / College Name" required>
                <input
                  className={inputCls}
                  placeholder="e.g. Punjab Grammar School"
                  value={form.orgName}
                  onChange={e => handleOrgNameChange(e.target.value)}
                  required
                  autoFocus
                />
              </Field>

              <Field label="Your School URL" required hint="Students and staff will log in at this address.">
                <div className="flex rounded-xl border border-gray-300 dark:border-slate-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <span className="bg-gray-100 dark:bg-slate-700/70 px-3.5 py-2.5 text-sm text-gray-400 dark:text-slate-500 border-r border-gray-300 dark:border-slate-600 whitespace-nowrap select-none font-mono">
                    tws.enterprises/
                  </span>
                  <input
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none font-mono bg-white dark:bg-slate-700 dark:text-slate-100"
                    placeholder="your-school"
                    value={form.slug}
                    onChange={e => {
                      setSlugManual(true);
                      set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    }}
                    required
                  />
                </div>
              </Field>

              <Field label="School Contact Email" required>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="school@example.pk"
                  value={form.contactEmail}
                  onChange={e => set('contactEmail', e.target.value)}
                  required
                />
              </Field>

              <Field label="Contact Phone" hint="Optional — for account recovery and support.">
                <input
                  type="tel"
                  className={inputCls}
                  placeholder="+92 300 0000000"
                  value={form.contactPhone}
                  onChange={e => set('contactPhone', e.target.value)}
                />
              </Field>

              <button type="submit" className={btnPrimary}>
                Continue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Your Full Name" required>
                <input
                  className={inputCls}
                  placeholder="Muhammad Ahmed"
                  value={form.adminName}
                  onChange={e => set('adminName', e.target.value)}
                  required
                  autoFocus
                />
              </Field>

              <Field label="Your Email Address" required>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="admin@yourschool.pk"
                  value={form.adminEmail}
                  onChange={e => set('adminEmail', e.target.value)}
                  required
                />
              </Field>

              <Field label="Password" required>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={cn(inputCls, 'pr-11')}
                    placeholder="Minimum 8 characters"
                    value={form.adminPassword}
                    onChange={e => set('adminPassword', e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPwd ? (
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
                {form.adminPassword.length > 0 && (
                  <PasswordStrength password={form.adminPassword} />
                )}
              </Field>

              <Field label="Confirm Password" required>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={cn(
                      inputCls, 'pr-11',
                      form.confirmPassword && form.confirmPassword !== form.adminPassword
                        ? 'border-red-400 dark:border-red-500 focus:ring-red-500'
                        : form.confirmPassword && form.confirmPassword === form.adminPassword
                          ? 'border-emerald-400 dark:border-emerald-500 focus:ring-emerald-500'
                          : ''
                    )}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
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
              </Field>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="flex items-center justify-center gap-1.5 flex-[0_0_auto] w-24 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(btnPrimary, 'flex-1')}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-400 dark:text-slate-600 text-center pt-1">
                By creating an account you agree to our Terms of Service.<br />
                Your school starts on a <strong className="text-gray-500 dark:text-slate-500">30-day free trial</strong>.
              </p>
            </form>
          )}

          <p className="text-center text-sm text-gray-400 dark:text-slate-500 mt-8">
            Already registered?{' '}
            <a href={adminLoginUrl()} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign in to your school
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Shared primitives ────────────────────────────────────────

const inputCls =
  'w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all';

const btnPrimary =
  'w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all';

function Field({
  label, required, hint, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500'];
  const textColors = ['', 'text-red-500', 'text-amber-500', 'text-blue-500', 'text-emerald-500'];

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors duration-300', i <= score ? colors[score] : 'bg-gray-200 dark:bg-slate-600')}
          />
        ))}
      </div>
      {score > 0 && (
        <span className={cn('text-xs font-medium', textColors[score])}>{labels[score]}</span>
      )}
    </div>
  );
}
