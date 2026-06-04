import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// ── Data ──────────────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    badge: 'bg-blue-100 text-blue-700'    },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  badge: 'bg-purple-100 text-purple-700'  },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  badge: 'bg-orange-100 text-orange-700'  },
  green:   { bg: 'bg-green-50',   text: 'text-green-600',   badge: 'bg-green-100 text-green-700'   },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  badge: 'bg-indigo-100 text-indigo-700'  },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    badge: 'bg-rose-100 text-rose-700'    },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-600',     badge: 'bg-sky-100 text-sky-700'      },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-600',    badge: 'bg-teal-100 text-teal-700'    },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  badge: 'bg-violet-100 text-violet-700'  },
};

const FEATURES = [
  {
    color: 'blue',
    emoji: '📋',
    title: 'Attendance Management',
    badge: 'PDF + CSV',
    desc: 'Mark attendance per period or daily. Shortage alerts, student calendar heatmaps, and landscape A4 register PDFs.',
    points: ['Daily & period-wise marking', 'Shortage alert at custom %', 'Student calendar heatmap view', 'PDF register + CSV export'],
  },
  {
    color: 'purple',
    emoji: '🗓️',
    title: 'Timetable & Scheduling',
    badge: 'Conflict-free',
    desc: 'Build conflict-free period schedules per class. Assign substitute teachers on the fly and export printable timetable PDFs.',
    points: ['Conflict detection engine', 'Substitute teacher assignment', 'Per-class timetable PDF', 'Exam schedule integration'],
  },
  {
    color: 'emerald',
    emoji: '📊',
    title: 'Exams & Results',
    badge: 'Result Card PDF',
    desc: 'Custom grading configs, marks entry by teacher, class position ranking, and printable result card PDFs for parents.',
    points: ['Custom grading per class', 'Marks entry by subject teacher', 'Class position ranking', 'Printable result card PDF'],
  },
  {
    color: 'orange',
    emoji: '📝',
    title: 'Assignments',
    badge: 'S3 File Upload',
    desc: 'Create, distribute, and grade assignments with file uploads. Auto late-submission flags and teacher feedback system.',
    points: ['File upload via S3', 'Deadline enforcement', 'Auto late-submission flag', 'Marks & feedback system'],
  },
  {
    color: 'green',
    emoji: '💵',
    title: 'Fee Management',
    badge: 'JazzCash + EasyPaisa',
    desc: 'BullMQ auto-challan generation, HBL/UBL PDF challans, online payment via JazzCash & EasyPaisa, discounts, and analytics.',
    points: ['Auto challan (BullMQ)', 'HBL/UBL dual-copy format', 'JazzCash & EasyPaisa online', 'Discounts & waiver management'],
  },
  {
    color: 'indigo',
    emoji: '👔',
    title: 'Payroll',
    badge: 'Payslip PDF',
    desc: 'Salary structures with allowances and deductions. Attendance-linked auto-deductions, one-click payroll run, payslip PDFs.',
    points: ['Basic + allowances + deductions', 'Attendance-linked deduction', 'One-click payroll approval', 'Printable payslip PDF'],
  },
  {
    color: 'rose',
    emoji: '🔔',
    title: 'Real-time Notifications',
    badge: 'Socket.IO',
    desc: 'Live notification bell powered by Socket.IO. Principals and teachers broadcast announcements to any role instantly.',
    points: ['Real-time notification bell', 'Unread count badge', 'Role-targeted broadcasts', 'Full notification history'],
  },
  {
    color: 'sky',
    emoji: '🌐',
    title: 'School Website Builder',
    badge: '3 Themes',
    desc: 'Every school gets a public website — Classic, Modern, or Minimal themes. Click-to-edit live preview, no coding needed.',
    points: ['Classic, Modern, Minimal themes', 'Click-to-edit live preview', 'Custom branding & logo', 'SEO-ready public pages'],
  },
  {
    color: 'teal',
    emoji: '🎓',
    title: 'Online Admissions',
    badge: 'Public Portal',
    desc: 'Students apply via a public admission form at your school subdomain. Staff manage, approve, and generate offer letters.',
    points: ['Public admission form URL', 'Application management flow', 'Offer letter PDF', 'Student ID card PDF'],
  },
  {
    color: 'violet',
    emoji: '🏢',
    title: 'Multi-tenant & Multi-branch',
    badge: 'Unlimited Scale',
    desc: 'One platform, unlimited institutions. Each school gets its own subdomain, isolated data, and branding. Group admin oversight.',
    points: ['Subdomain per school', 'Full cross-tenant isolation', 'Group admin cross-branch view', 'Branch-level configuration'],
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '🏫',
    title: 'Register Your School',
    desc: 'Sign up in minutes. Your institution gets a dedicated subdomain and isolated workspace — no data shared with others.',
  },
  {
    step: '02',
    icon: '⚙️',
    title: 'Set Up & Invite Your Team',
    desc: 'Configure branches, classes, subjects, fee structures. Invite staff with specific roles — teacher, accountant, IT admin.',
  },
  {
    step: '03',
    icon: '🚀',
    title: 'Run Your School Digitally',
    desc: 'Mark attendance, enter results, collect fees online, run payroll, and communicate — all from one dashboard.',
  },
];

const ROLES = [
  { icon: '👨‍💼', label: 'Super Admin',  bg: 'bg-slate-50',   text: 'text-slate-700',   desc: 'Platform-wide oversight — all organisations, billing, system config.' },
  { icon: '🏢', label: 'Group Admin',  bg: 'bg-violet-50',  text: 'text-violet-700',  desc: 'Manage multiple branches under one institution. Cross-branch analytics.' },
  { icon: '🏫', label: 'Principal',    bg: 'bg-blue-50',    text: 'text-blue-700',    desc: 'Full branch control — staff, students, reports, announcements, admissions.' },
  { icon: '👨‍🏫', label: 'Teacher',      bg: 'bg-emerald-50', text: 'text-emerald-700', desc: 'Mark attendance, assign tasks, enter marks, grade assignments, view timetable.' },
  { icon: '🎓', label: 'Student',      bg: 'bg-amber-50',   text: 'text-amber-700',   desc: 'View results, timetable, assignments, fee status. Mobile-first dashboard.' },
  { icon: '💰', label: 'Accountant',   bg: 'bg-green-50',   text: 'text-green-700',   desc: 'Fee collection, challans, online payment tracking, discounts, payroll.' },
  { icon: '🔧', label: 'IT Admin',     bg: 'bg-rose-50',    text: 'text-rose-700',    desc: 'User management, role assignment, system settings, website builder.' },
];

const PDFS = [
  { emoji: '📄', title: 'Result Card',        desc: 'Per-student result card with grades, position, and school letterhead.' },
  { emoji: '🧾', title: 'Fee Challan',        desc: 'HBL/UBL dual-copy auto-generated challan per student per month.' },
  { emoji: '💼', title: 'Payslip',            desc: 'Detailed salary breakdown with allowances, deductions, and net pay.' },
  { emoji: '📋', title: 'Attendance Register', desc: 'Landscape A4 register with color-coded cells and shortage alerts.' },
  { emoji: '🎓', title: 'Offer Letter',       desc: 'Admission offer letter with student details and conditional terms.' },
  { emoji: '🪪', title: 'Student ID Card',    desc: 'Printable ID cards with photo placeholder and school info.' },
  { emoji: '📜', title: 'Character Certificate', desc: 'Formal character certificate with student conduct record.' },
  { emoji: '🔄', title: 'Transfer Certificate', desc: 'Official TC document when a student transfers schools.' },
  { emoji: '📅', title: 'Timetable PDF',      desc: 'Per-class printable timetable with period-wise slot mapping.' },
];

const FAQS = [
  {
    q: 'Is EduStack PK suitable for both schools and colleges?',
    a: 'Yes. The platform handles both with configurable academic structures, class/section setups, and grading configurations. Grades 1–12 and Intermediate Part I & II are fully supported.',
  },
  {
    q: 'Which online payment methods are supported?',
    a: 'JazzCash and EasyPaisa are fully integrated with HMAC-SHA256 secure signing. Cash and bank payment recording with receipt numbers is also built in as a fallback.',
  },
  {
    q: 'Can I manage multiple branches from one account?',
    a: 'Absolutely. Group Admin accounts give you oversight of all branches — cross-branch analytics, staff management, and fee summaries — from a single dashboard.',
  },
  {
    q: 'Is there a mobile app for students and teachers?',
    a: 'Yes — a Flutter app for Android and iOS. Students view results, timetable, fee status, and assignments. Teachers mark attendance and grade assignments on mobile. Result card PDFs are also downloadable from the app.',
  },
  {
    q: "How is my school's data kept secure and isolated?",
    a: "Every organisation gets a fully isolated multi-tenant environment. JWT authentication, 7-level RBAC, and a cross-tenant firewall guard every API endpoint. No school can access another school's data.",
  },
  {
    q: 'Can students apply for admission online?',
    a: 'Yes. Each school gets a public-facing admission portal at its subdomain. Students fill the form online, and school staff manage, review, and approve applications from the dashboard — then generate offer letters and ID cards.',
  },
  {
    q: 'What does the school website builder include?',
    a: 'Every school gets a public website with 3 themes (Classic, Modern, Minimal). Principals and IT Admins edit content live via a click-to-edit preview. No coding or web designer needed.',
  },
  {
    q: 'How does pricing work?',
    a: 'Pricing is per active student per branch per month in PKR — proportional to your school size. The Starter plan is free for up to 150 students. The Pro plan is Rs 35/student/mo and unlocks everything for growing institutions.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Mr. Tariq Mehmood',
    role: 'Principal, Al-Huda Academy, Lahore',
    text: 'Fee collection used to take our accountant 3 days each month. With EduStack PK, challans are auto-generated and parents pay via JazzCash. It has transformed how we run the school.',
    rating: 5,
  },
  {
    name: 'Ms. Ayesha Siddiqui',
    role: 'Group Admin, Crescent Schools, Karachi',
    text: 'Managing 4 branches from one dashboard is something I never thought possible. The cross-branch analytics and attendance reports save me hours every single week.',
    rating: 5,
  },
  {
    name: 'Sir Bilal Khurshid',
    role: 'IT Admin, Future Stars College, Islamabad',
    text: 'Setup was straightforward. The role-based access is very well-designed — teachers only see what they need, and nothing more. Very professional platform built for Pakistan.',
    rating: 5,
  },
];

// ── Components ────────────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">

      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/30 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className={`font-extrabold text-xl tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              EduStack <span className="text-blue-400">PK</span>
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {[
              { href: '#features',     label: 'Features'     },
              { href: '#how-it-works', label: 'How it Works' },
              { href: '#roles',        label: 'For Your Team'},
              { href: '#pricing',      label: 'Pricing'      },
              { href: '#faq',          label: 'FAQ'          },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`hover:text-blue-400 transition-colors ${scrolled ? 'text-gray-500 hover:text-blue-600' : 'text-blue-100 hover:text-white'}`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className={`text-sm font-medium transition-colors px-3 py-2 ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-blue-100 hover:text-white'}`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-500 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
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
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-2 shadow-lg">
            {[
              { href: '#features',     label: 'Features'     },
              { href: '#how-it-works', label: 'How it Works' },
              { href: '#roles',        label: 'For Your Team'},
              { href: '#pricing',      label: 'Pricing'      },
              { href: '#faq',          label: 'FAQ'          },
            ].map(({ href, label }) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="py-2 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                {label}
              </a>
            ))}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2 mt-1">
              <Link to="/login" className="py-2 px-3 text-center rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Sign In</Link>
              <Link to="/register" className="py-3 px-4 rounded-xl bg-blue-600 text-white text-center text-sm font-bold hover:bg-blue-700">Get Started Free</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1628 50%, #0d1535 100%)' }}>
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '36px 36px' }}
        />
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)' }}
        />
        <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
        />
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.10) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 lg:pt-36 lg:pb-32">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2.5 bg-blue-600/10 border border-blue-500/25 rounded-full px-4 py-1.5 backdrop-blur">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-sm font-medium text-blue-200">Pakistan's First School & College ERP SaaS</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-center font-extrabold tracking-tight leading-[1.06] mb-7" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            <span className="text-white">Run Your Entire </span>
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              School or College
            </span>
            <span className="text-white"> From One Platform.</span>
          </h1>

          <p className="text-center max-w-2xl mx-auto text-lg sm:text-xl mb-10" style={{ color: 'rgba(191,219,254,0.75)', lineHeight: '1.7' }}>
            Attendance, timetable, exams, fees, payroll, admissions, website — everything your institution needs.{' '}
            <span className="text-blue-300 font-semibold">JazzCash &amp; EasyPaisa built in.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              to="/register"
              className="px-8 py-4 rounded-2xl font-bold text-base text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 8px 32px rgba(37,99,235,0.45)' }}
            >
              Start Free — Register Your School
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-2xl text-white font-semibold text-base transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
            >
              See All Features →
            </a>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '10+',             label: 'Core Modules'       },
              { value: '7',              label: 'User Roles'          },
              { value: 'JazzCash + EasyPaisa', label: 'Online Payments' },
              { value: '🇵🇰 100%',        label: 'Built for Pakistan'  },
            ].map((s) => (
              <div key={s.label}
                className="rounded-2xl py-5 px-4 text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(8px)' }}
              >
                <div className="text-xl font-extrabold text-white leading-tight">{s.value}</div>
                <div className="text-xs font-medium mt-1.5" style={{ color: 'rgba(147,197,253,0.7)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="h-20 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #f9fafb)' }} />
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <span className="text-gray-300 uppercase text-xs tracking-widest font-semibold">Everything included</span>
            {[
              '✓ RBAC Security',
              '✓ Multi-branch Ready',
              '✓ Real-time Notifications',
              '✓ 9-document PDF Suite',
              '✓ Flutter Mobile App',
              '✓ JazzCash &amp; EasyPaisa',
            ].map((t) => (
              <span key={t} className="text-gray-500 text-sm font-medium" dangerouslySetInnerHTML={{ __html: t }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-50 text-blue-600 font-semibold text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-4">Complete Platform</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              10 modules. One subscription.
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              No feature locked behind a higher tier. Every module — attendance, exams, fees, payroll, website — ships with your account from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {FEATURES.map((f) => {
              const c = colorMap[f.color];
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center text-2xl`}>
                      {f.emoji}
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>{f.badge}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{f.desc}</p>
                  <ul className="space-y-1.5">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckIcon className={`w-3.5 h-3.5 ${c.text} shrink-0`} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-blue-200 font-semibold text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-4"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Simple Setup
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">Up and running in minutes.</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(191,219,254,0.65)' }}>
              No technical knowledge required. Get your school live in three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                    style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(191,219,254,0.65)' }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              to="/register"
              className="inline-block px-9 py-4 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 8px 32px rgba(37,99,235,0.4)' }}
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── ROLES ─────────────────────────────────────────────────────────── */}
      <section id="roles" className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-violet-50 text-violet-600 font-semibold text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-4">Role-based Access</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              7 roles. Everyone covered.
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Granular permissions mean every staff member sees exactly what they need — nothing more, nothing less.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {ROLES.map((r) => (
              <div key={r.label}
                className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:shadow-gray-100 transition-all hover:-translate-y-0.5">
                <div className={`w-14 h-14 rounded-2xl ${r.bg} ${r.text} flex items-center justify-center text-3xl`}>
                  {r.icon}
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">{r.label}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAKISTAN PAYMENTS ─────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="inline-block font-semibold text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-5"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(209,250,229,0.9)' }}>
                Built for Pakistan
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
                Online fee collection<br />the way Pakistan pays.
              </h2>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: 'rgba(209,250,229,0.85)' }}>
                Students and parents pay school fees directly via JazzCash or EasyPaisa wallets. No bank account needed. HBL/UBL format challans for traditional bank payments are auto-generated too.
              </p>
              <ul className="space-y-3 text-sm" style={{ color: 'rgba(209,250,229,0.85)' }}>
                {[
                  'HMAC-SHA256 secured payment transactions',
                  'BullMQ auto-challan generation every month',
                  'HBL/UBL dual-copy challan format PDFs',
                  'Manual cash & bank payment recording with receipts',
                  'Discount & fee waiver management per student',
                  'Fee analytics dashboard (paid / pending / overdue)',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckIcon className="w-4 h-4 text-emerald-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'JazzCash',    emoji: '💳', from: 'rgba(239,68,68,0.2)',   to: 'rgba(185,28,28,0.2)',   border: 'rgba(239,68,68,0.3)'   },
                { name: 'EasyPaisa',   emoji: '📱', from: 'rgba(16,185,129,0.2)',  to: 'rgba(4,120,87,0.2)',    border: 'rgba(16,185,129,0.3)'  },
                { name: 'Cash',        emoji: '💵', from: 'rgba(245,158,11,0.2)',  to: 'rgba(180,83,9,0.2)',    border: 'rgba(245,158,11,0.3)'  },
                { name: 'Bank Challan',emoji: '🏦', from: 'rgba(59,130,246,0.2)',  to: 'rgba(29,78,216,0.2)',   border: 'rgba(59,130,246,0.3)'  },
              ].map((m) => (
                <div key={m.name}
                  className="p-6 rounded-2xl text-center flex flex-col items-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${m.from}, ${m.to})`, border: `1px solid ${m.border}`, backdropFilter: 'blur(8px)' }}
                >
                  <div className="text-5xl">{m.emoji}</div>
                  <div className="font-bold text-white text-sm">{m.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PDF DOCUMENT SUITE ────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-amber-50 text-amber-600 font-semibold text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-4">Document Suite</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Every document your school needs.
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              9 professional PDFs generated on-demand — no Word templates, no Excel, no manual formatting. Ever.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {PDFS.map((p) => (
              <div key={p.title}
                className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-amber-200 hover:bg-amber-50/40 transition-all text-center group cursor-default">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">{p.emoji}</div>
                <div className="font-bold text-gray-900 text-sm mb-1.5">{p.title}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCHOOL WEBSITE BUILDER ────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-violet-50 via-white to-blue-50 border-y border-violet-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="inline-block bg-violet-100 text-violet-700 font-semibold text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-5">Built-in Feature</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
                Your school's public website — included.
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Every school on EduStack PK gets a full public-facing website with 3 premium themes. Edit content live with a click-to-edit preview — no coding or web designer needed.
              </p>
              <div className="space-y-3">
                {[
                  { icon: '🎨', title: 'Classic Theme',  desc: 'Traditional school aesthetic with a professional header and structured layout.'   },
                  { icon: '✨', title: 'Modern Theme',   desc: 'Contemporary design with bold sections, cards, and hero imagery.'                  },
                  { icon: '⬜', title: 'Minimal Theme',  desc: 'Elegant minimal look — less clutter, more clarity. Clean and premium.'             },
                ].map((t) => (
                  <div key={t.title} className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-violet-100 shadow-sm">
                    <div className="text-2xl flex-shrink-0">{t.icon}</div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm mb-0.5">{t.title}</div>
                      <div className="text-gray-500 text-sm">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock website preview */}
            <div className="bg-white rounded-3xl border border-violet-200 shadow-2xl shadow-violet-100/60 overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200">
                  alhuda.edu.tws.enterprises
                </div>
              </div>
              {/* Site content mock */}
              <div className="p-5 flex flex-col gap-3">
                <div className="rounded-xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                  <div className="text-xs font-medium mb-1" style={{ color: 'rgba(221,214,254,0.8)' }}>Al-Huda Academy, Lahore</div>
                  <div className="font-extrabold text-xl mb-0.5">Where Knowledge Meets Character</div>
                  <div className="text-sm" style={{ color: 'rgba(221,214,254,0.8)' }}>Est. 1998 · Grades 1–12</div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['About', 'Admissions', 'Gallery', 'Contact'].map((label) => (
                    <div key={label} className="bg-gray-50 rounded-lg py-2 text-xs font-medium text-gray-600 text-center border border-gray-100">{label}</div>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="text-amber-700 font-bold text-sm mb-0.5">Admissions Open 2025-26</div>
                  <div className="text-amber-600 text-xs">Apply online — results in 3 business days</div>
                </div>
                <div className="rounded-xl py-3 text-sm font-bold text-white text-center" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                  Apply for Admission →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE APP ────────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { emoji: '📊', title: 'Results & Grades',    role: 'Student'   },
                  { emoji: '📋', title: 'Mark Attendance',     role: 'Teacher'   },
                  { emoji: '🗓️', title: 'Class Timetable',     role: 'Student'   },
                  { emoji: '💵', title: 'Fee Status',          role: 'Student'   },
                  { emoji: '📝', title: 'Grade Assignments',   role: 'Teacher'   },
                  { emoji: '🔔', title: 'Live Notifications',  role: 'All Roles' },
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                    <div className="text-3xl mb-2">{item.emoji}</div>
                    <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.role}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="inline-block bg-blue-50 text-blue-600 font-semibold text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-5">Flutter Mobile App</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
                Your school in your pocket.
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                A full-featured Flutter app for Android &amp; iOS. Students check results, teachers mark attendance, and parents track fee status — on the go.
              </p>
              <ul className="space-y-3 text-gray-600 text-sm">
                {[
                  'Students: results, timetable, assignments, fee status',
                  'Teachers: attendance marking, assignment grading',
                  'Real-time push notifications for all roles',
                  'Result card PDF download from mobile',
                  'Multi-language support (English + Urdu ready)',
                  'Available on Android & iOS via Flutter',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckIcon className="w-4 h-4 text-blue-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-50 text-green-700 font-semibold text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-4">Transparent Pricing</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Fair pricing in PKR.
            </h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Pay per active student — scale as you grow. No feature paywalls. Every module included from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 flex flex-col">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Starter</div>
              <div className="text-5xl font-extrabold text-gray-900 mb-1">Free</div>
              <div className="text-gray-400 text-sm mb-7">Perfect to get started</div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8 flex-1">
                {['1 branch', 'Up to 150 students', 'All 10 modules included', 'Mobile app access', '9-document PDF suite', 'Email support'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block text-center px-6 py-3.5 rounded-xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors">
                Start Free
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-3xl p-8 flex flex-col text-white relative shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', boxShadow: '0 20px 60px rgba(37,99,235,0.35)' }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-xs font-bold uppercase tracking-wide px-4 py-1 rounded-full shadow">
                Most Popular
              </div>
              <div className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">Pro</div>
              <div className="mb-1">
                <span className="text-5xl font-extrabold">Rs 35</span>
                <span className="text-blue-200 text-base"> /student /mo</span>
              </div>
              <div className="text-blue-200 text-sm mb-7">Per branch · billed monthly in PKR</div>
              <ul className="space-y-3 text-sm text-blue-100 mb-8 flex-1">
                {['Unlimited students', 'Unlimited branches', 'JazzCash & EasyPaisa payments', 'Priority support', 'Custom school branding', 'Website builder (3 themes)', 'Online admission portal', 'Dedicated onboarding call'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckIcon className="w-4 h-4 text-amber-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block text-center px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold transition-colors">
                Get Started
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-900 rounded-3xl border-2 border-slate-700 p-8 flex flex-col text-white">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Enterprise</div>
              <div className="text-5xl font-extrabold mb-1">Custom</div>
              <div className="text-slate-400 text-sm mb-7">For large institution chains</div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
                {['On-premise deployment option', 'SLA agreement', 'Dedicated account manager', 'Custom integrations', 'White-label branding', 'Staff training sessions', 'Custom reporting & exports'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckIcon className="w-4 h-4 text-blue-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@wolfstack.io"
                className="block text-center px-6 py-3.5 rounded-xl border-2 border-slate-600 text-white font-bold hover:bg-slate-800 transition-colors">
                Contact Us
              </a>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            All plans include full feature access. No credit card required to start.
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-blue-50 text-blue-600 font-semibold text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-4">Early Adopters</span>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Schools love EduStack PK.
            </h2>
            <p className="text-gray-500 text-lg">Here's what our pilot schools are saying.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-7 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col">
                <StarRating count={t.rating} />
                <p className="text-gray-700 text-sm leading-relaxed mt-4 mb-5 flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-widest rounded-full px-3 py-1 mb-4">FAQ</span>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Common questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 border-t border-gray-50">
                    <p className="pt-4 text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0f1628 60%, #0d1535 100%)' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.2) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-7 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 12px 40px rgba(37,99,235,0.45)' }}
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Ready to go digital?
          </h2>
          <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: 'rgba(191,219,254,0.7)' }}>
            Join schools across Pakistan already using EduStack PK. Free to start — no technical knowledge needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 8px 32px rgba(37,99,235,0.4)' }}
            >
              Register Your School Free →
            </Link>
            <a href="#features"
              className="px-10 py-4 rounded-2xl text-white font-semibold text-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow shadow-blue-600/30">
                  <svg className="w-4.5 h-4.5 text-white w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <span className="font-extrabold text-white text-lg">EduStack <span className="text-blue-500">PK</span></span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Pakistan's complete School &amp; College ERP SaaS — built and maintained by WolfStack.
              </p>
              <div className="text-sm font-medium text-gray-500">🇵🇰 Made in Pakistan</div>
            </div>

            {/* Product */}
            <div>
              <div className="font-semibold text-white text-sm mb-5">Platform</div>
              <ul className="space-y-3 text-sm">
                {[
                  { href: '#features',     label: 'All Features'   },
                  { href: '#how-it-works', label: 'How it Works'   },
                  { href: '#pricing',      label: 'Pricing'        },
                  { href: '#roles',        label: 'For Your Team'  },
                  { href: '#faq',          label: 'FAQ'            },
                ].map(({ href, label }) => (
                  <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>

            {/* Modules */}
            <div>
              <div className="font-semibold text-white text-sm mb-5">Modules</div>
              <ul className="space-y-3 text-sm text-gray-500">
                {['Attendance Management', 'Exams & Results', 'Fee Management', 'Payroll', 'Admissions Portal', 'Website Builder', 'Mobile App'].map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="font-semibold text-white text-sm mb-5">Company</div>
              <ul className="space-y-3 text-sm">
                <li><Link to="/register" className="hover:text-white transition-colors">Register School</Link></li>
                <li><Link to="/login"    className="hover:text-white transition-colors">Sign In</Link></li>
                <li>
                  <a href="mailto:hello@wolfstack.io" className="hover:text-white transition-colors">
                    hello@wolfstack.io
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} WolfStack. All rights reserved.</p>
            <p>EduStack PK — Pakistan's School &amp; College ERP</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
