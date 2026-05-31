import { Link } from 'react-router-dom';
import { useState } from 'react';

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Attendance Management',
    desc: 'Mark, track, and export student & staff attendance. Shortage alerts, calendar heatmaps, and PDF register export.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Timetable & Scheduling',
    desc: 'Conflict-free period scheduling, substitute teacher assignment, and printable timetable PDFs per class.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Exams & Results',
    desc: 'Custom grading configs, marks entry, class position ranking, and printable result card PDFs — ready for parents.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Assignments',
    desc: 'Create, distribute, and grade assignments with file uploads. Deadline enforcement with automatic late-submission flags.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Fee Management',
    desc: 'Auto challan generation, HBL/UBL-format PDFs, online payment via JazzCash & EasyPaisa, discounts, and analytics.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Payroll',
    desc: 'Salary structures, attendance-linked deductions, one-click payroll processing, and printable payslip PDFs.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: 'Real-time Notifications',
    desc: 'Socket.IO-powered notification bell. Broadcast announcements to staff, teachers, or students instantly.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Multi-tenant & Multi-branch',
    desc: 'One platform, unlimited schools. Each institution gets its own subdomain, branding, and isolated data.',
  },
];

const ROLES = [
  { icon: '🏫', label: 'Principal', desc: 'Full branch oversight — analytics, staff, reports.' },
  { icon: '👨‍💼', label: 'Group Admin', desc: 'Manage multiple branches under one organisation.' },
  { icon: '👨‍🏫', label: 'Teacher', desc: 'Mark attendance, assign tasks, enter exam marks.' },
  { icon: '🎓', label: 'Student', desc: 'View results, timetable, fees, and assignments.' },
  { icon: '💰', label: 'Accountant', desc: 'Fee collection, challans, payroll processing.' },
  { icon: '🔧', label: 'IT Admin', desc: 'User management, settings, system configuration.' },
];

const STATS = [
  { value: '8+', label: 'Core Modules' },
  { value: '7', label: 'User Roles' },
  { value: '2', label: 'Payment Gateways' },
  { value: '100%', label: 'Made for Pakistan' },
];

const FAQS = [
  {
    q: 'Is EduStack PK suitable for both schools and colleges?',
    a: 'Yes. The platform handles both schools and colleges with configurable academic structures, class/section setups, and exam systems.',
  },
  {
    q: 'Which online payment methods are supported?',
    a: 'JazzCash and EasyPaisa are fully integrated for fee collection. Cash and bank payment recording is also available.',
  },
  {
    q: 'Can I manage multiple branches from one account?',
    a: 'Absolutely. Group Admin accounts let you oversee all branches of your institution from a single dashboard.',
  },
  {
    q: 'Is there a mobile app?',
    a: 'Yes — a Flutter mobile app is available for students and teachers on Android and iOS.',
  },
  {
    q: 'How is my data kept secure?',
    a: 'Every organisation gets a fully isolated tenant. JWT auth, role-based access control, and cross-tenant firewall on every endpoint.',
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow shadow-blue-600/30">
              <svg className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-gray-900">EduStack <span className="text-blue-600">PK</span></span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#roles"    className="hover:text-gray-900 transition-colors">Who's it for</a>
            <a href="#pricing"  className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq"      className="hover:text-gray-900 transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow shadow-blue-600/20"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3 text-sm font-medium text-gray-600">
            <a href="#features" onClick={() => setMenuOpen(false)} className="py-1 hover:text-blue-600">Features</a>
            <a href="#roles"    onClick={() => setMenuOpen(false)} className="py-1 hover:text-blue-600">Who's it for</a>
            <a href="#pricing"  onClick={() => setMenuOpen(false)} className="py-1 hover:text-blue-600">Pricing</a>
            <a href="#faq"      onClick={() => setMenuOpen(false)} className="py-1 hover:text-blue-600">FAQ</a>
            <Link
              to="/register"
              className="mt-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-center font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Blob decorations */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-blue-100 mb-6 backdrop-blur">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Built for Pakistani Schools & Colleges
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Run your entire school
            <br />
            <span className="text-amber-400">from one platform.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 leading-relaxed mb-10">
            EduStack PK is a complete School & College ERP — attendance, timetable, exams, fees, payroll and more.
            Multi-branch ready, with JazzCash & EasyPaisa built in.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-base transition-colors shadow-xl shadow-black/20"
            >
              Start Free — Register Your School
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base transition-colors backdrop-blur"
            >
              Explore Features →
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-2xl py-5 px-4 backdrop-blur">
                <div className="text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Everything you need</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              All 8 modules. One subscription.
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
              No feature locked behind a higher tier. Every module ships with your account from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-blue-600/5 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Role-based access</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Every role. Every user. Covered.
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-xl mx-auto">
              7 distinct roles with granular permissions so everyone only sees what they need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ROLES.map((r) => (
              <div key={r.label} className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                <div className="text-3xl leading-none mt-0.5">{r.icon}</div>
                <div>
                  <div className="font-bold text-gray-900">{r.label}</div>
                  <div className="text-gray-500 text-sm mt-0.5">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAYMENT HIGHLIGHT ── */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50 border-y border-green-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-4 mb-5">
            <div className="bg-white rounded-2xl px-5 py-3 border border-green-200 flex items-center gap-2 shadow-sm">
              <span className="text-2xl">💳</span>
              <span className="font-bold text-gray-700">JazzCash</span>
            </div>
            <div className="bg-white rounded-2xl px-5 py-3 border border-green-200 flex items-center gap-2 shadow-sm">
              <span className="text-2xl">📱</span>
              <span className="font-bold text-gray-700">EasyPaisa</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
            Online fee collection — built for Pakistan
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Students and parents can pay fees directly via JazzCash or EasyPaisa. Auto-generated HBL/UBL format challans for manual payments too.
          </p>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Simple pricing</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              One plan. All features.
            </h2>
            <p className="mt-3 text-gray-500 text-lg max-w-lg mx-auto">
              No hidden tiers, no feature paywalls. Get started for free and upgrade when you're ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free tier */}
            <div className="rounded-3xl border-2 border-gray-200 p-8 flex flex-col">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Starter</div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">Free</div>
              <div className="text-gray-400 text-sm mb-6">Get your school set up</div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8 flex-1">
                {['1 branch', 'Up to 150 students', 'All 8 modules', 'Mobile app access', 'Email support'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block text-center px-6 py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Pro tier */}
            <div className="rounded-3xl border-2 border-blue-600 bg-blue-600 p-8 flex flex-col text-white shadow-xl shadow-blue-600/20">
              <div className="text-sm font-semibold text-blue-200 uppercase tracking-wide mb-2">Pro</div>
              <div className="text-4xl font-extrabold mb-1">
                PKR 4,999<span className="text-xl font-normal text-blue-200">/mo</span>
              </div>
              <div className="text-blue-200 text-sm mb-6">Per branch — billed monthly</div>
              <ul className="space-y-3 text-sm text-blue-100 mb-8 flex-1">
                {['Unlimited students', 'Multi-branch support', 'JazzCash & EasyPaisa', 'Priority support', 'Custom branding & logo', 'PDF exports (results, payslips)', 'Dedicated onboarding'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block text-center px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">FAQs</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Common questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-50">
                    <div className="pt-4">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to modernise your school?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join schools across Pakistan already using EduStack PK. Set up in minutes — no technical knowledge required.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-lg transition-colors shadow-xl shadow-black/20"
          >
            Register Your School Free →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <span className="font-bold text-white">EduStack PK</span>
              <span className="text-gray-600">·</span>
              <span className="text-sm text-gray-500">by WolfStack</span>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
              <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            </nav>

            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} WolfStack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
