import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Shared helpers

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const DOT_GRID = { backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.07) 1px, transparent 0)', backgroundSize: '24px 24px' };
const DOT_GRID_DARK = { backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '36px 36px' };
const DIAG_LINES = { backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' };

// Data

const FAQS = [
  {
    q: 'How long is the free trial and what does it include?',
    a: 'You get 7 full days of complete access - every module, every feature, every role. No restrictions. After the trial, choose the Pro plan to continue.',
  },
  {
    q: 'Can my teachers and accountant use it without training?',
    a: 'Yes. The system is designed for Pakistani school staff, not software engineers. Teachers mark attendance in 2 taps. Accountants generate challans in one click. Most staff are confident within a day.',
  },
  {
    q: 'Which payment methods can parents use?',
    a: 'JazzCash and EasyPaisa are fully integrated - parents pay from their mobile wallet in under a minute. Manual cash and bank payment recording with receipt numbers is also available.',
  },
  {
    q: 'We have 3 campuses. Can we manage them from one account?',
    a: 'Yes. The Group Admin role gives you a single dashboard across all branches - cross-branch fee summaries, attendance, staff, and analytics. Each branch keeps its own isolated data.',
  },
  {
    q: 'Is there a mobile app for students and teachers?',
    a: 'Yes - a Flutter app for Android and iOS. Students check results, timetable, and fee status. Teachers mark attendance and grade assignments on the go.',
  },
  {
    q: "Is our school's data secure? Can other schools see it?",
    a: 'Absolutely not. Every school is a fully isolated tenant - separate data, JWT authentication, and role-based access on every API endpoint. Cross-tenant access is architecturally impossible.',
  },
  {
    q: 'What happens after the 7-day trial ends?',
    a: "Your data stays intact. You choose whether to upgrade to Pro at Rs 35 per active student per month. If you don't upgrade, the account is paused - nothing is deleted.",
  },
  {
    q: 'Does the school get its own website?',
    a: 'Yes. Every school gets a public website at their subdomain with 3 themes - Classic, Modern, and Minimal. Edit all content live with a click-to-edit preview. No coding needed.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Mr. Tariq Mehmood',
    role: 'Principal, Al-Huda Academy, Lahore',
    quote: "Our accountant used to come to me stressed every month-end. Now she sends me a report by noon. I didn't realise how much energy was going into paperwork until it stopped.",
    highlight: 'Accountant: 10 PM -> done by noon',
    initials: 'TM',
  },
  {
    name: 'Ms. Ayesha Siddiqui',
    role: 'Group Admin, Crescent Schools, Karachi',
    quote: 'I was flying between three campuses just to understand what was happening. Now I open one screen in the morning and I know everything - fees, attendance, staff, all of it.',
    highlight: '3 campuses -> one dashboard',
    initials: 'AS',
  },
  {
    name: 'Sir Bilal Khurshid',
    role: 'IT Admin, Future Stars College, Islamabad',
    quote: 'Parents used to call me directly with attendance complaints. That stopped in the first week. They could see everything themselves. That alone saved me hours every day.',
    highlight: 'Parent complaints dropped to zero',
    initials: 'BK',
  },
];

// Navbar

function Navbar({ scrolled, menuOpen, setMenuOpen }: { scrolled: boolean; menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow: '0 4px 12px rgba(37,99,235,.35)' }}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <span className={`font-extrabold text-xl tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
            EduStack <span className="text-blue-400">PK</span>
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {[['#problem','The Problem'],['#features','Features'],['#pricing','Pricing'],['#faq','FAQ']].map(([href,label]) => (
            <a key={href} href={href} className={`transition-colors ${scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-blue-100 hover:text-white'}`}>{label}</a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login" className={`text-sm font-medium px-3 py-2 transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-blue-100 hover:text-white'}`}>
            Sign In
          </Link>
          <a href="mailto:hello@wolfstack.io?subject=Book%20a%20Demo%20-%20EduStack%20PK" className={`text-sm font-medium px-3 py-2 transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-blue-100 hover:text-white'}`}>
            Book a Demo
          </a>
          <Link to="/register" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30">
            Start Free Trial
          </Link>
        </div>

        <button className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-500 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
          onClick={() => setMenuOpen(!menuOpen)} aria-label="menu">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-2 shadow-lg">
          {[['#problem','The Problem'],['#features','Features'],['#pricing','Pricing'],['#faq','FAQ']].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600">{label}</a>
          ))}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link to="/login" className="py-2 text-center text-sm text-gray-600">Sign In</Link>
            <a href="mailto:hello@wolfstack.io?subject=Book%20a%20Demo%20-%20EduStack%20PK" className="py-2 text-center text-sm text-gray-600 hover:text-blue-600">Book a Demo</a>
            <Link to="/register" className="py-3 rounded-xl bg-blue-600 text-white text-center text-sm font-bold hover:bg-blue-700">
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// Hero

function HeroSection() {
  return (
    <section style={{ background: 'linear-gradient(150deg,#0a0e1a 0%,#0f1628 55%,#0c1420 100%)' }} className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={DOT_GRID_DARK} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width:'900px', height:'500px', background:'radial-gradient(ellipse,rgba(59,130,246,.18) 0%,transparent 68%)' }} />
      <div className="absolute top-1/3 -right-32 pointer-events-none"
        style={{ width:'500px', height:'500px', background:'radial-gradient(ellipse,rgba(139,92,246,.1) 0%,transparent 65%)' }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 lg:pt-36 lg:pb-32 text-center">
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5"
            style={{ background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.2)' }}>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
            <span className="text-sm font-medium text-blue-200">Built for Pakistani Schools and Colleges</span>
          </div>
        </div>

        <h1 className="font-extrabold tracking-tight leading-[1.07] mb-8 text-white" style={{ fontSize:'clamp(2.4rem,5.5vw,4rem)' }}>
          Running a school on paper<br />
          <span style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            is costing you more
          </span><br />
          than you realise.
        </h1>

        <div className="max-w-3xl mx-auto mb-10 rounded-2xl p-6 text-left"
          style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)' }}>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color:'rgba(191,219,254,.8)' }}>
            Your accountant hand-writes 300 challans every month.{' '}
            <span className="text-blue-300">A teacher called in sick and 40 students are sitting idle.</span>{' '}
            It is 2 AM and the result cards are not ready.{' '}
            <span className="text-blue-300">You posted an announcement - it got buried in the WhatsApp group.</span>{' '}
            A parent is disputing attendance and you have no record to show.
          </p>
          <p className="mt-4 text-base font-semibold" style={{ color:'rgba(251,191,36,.9)' }}>
            This is what running a school without the right system looks like. It does not have to be this way.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register"
            className="px-9 py-4 rounded-2xl font-bold text-base text-white transition-all hover:-translate-y-0.5"
            style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow:'0 8px 32px rgba(37,99,235,.45)' }}>
            Start Free Trial
          </Link>
          <a href="mailto:hello@wolfstack.io?subject=Book%20a%20Demo%20-%20EduStack%20PK"
            className="px-9 py-4 rounded-2xl text-white font-semibold text-base transition-all hover:bg-white/10"
            style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)' }}>
            Book a Live Demo
          </a>
        </div>
        <p className="mt-5 text-sm" style={{ color:'rgba(147,197,253,.45)' }}>
          <a href="#features" className="underline hover:text-white transition-colors">See features</a> &middot; No credit card &middot; 5 minutes to set up
        </p>
      </div>

      <div className="h-16 pointer-events-none" style={{ background:'linear-gradient(to bottom,transparent,white)' }} />
    </section>
  );
}

// Pain Stats - white + diagonal lines

function PainStatsSection() {
  return (
    <section id="problem" className="py-20 bg-white relative" style={DIAG_LINES}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Sound familiar?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Every school in Pakistan is running on the same broken system.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { stat: '300', unit: 'challans', desc: "Written by hand every month. Then chased individually by phone. Reconciled at 10 PM." },
            { stat: '2 AM', unit: 'result night', desc: "Staff still calculating grades on paper. One error undoes everything. Parents are waiting." },
            { stat: '0', unit: 'records', desc: "To show a parent disputing their child's attendance shortage. Zero. None. Nowhere." },
          ].map(item => (
            <div key={item.stat} className="bg-red-50 border border-red-100 rounded-2xl p-7 text-center">
              <div className="text-6xl font-black text-red-600 mb-1 leading-none">{item.stat}</div>
              <div className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3">{item.unit}</div>
              <div className="text-red-600/80 text-sm leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Manual registers. WhatsApp groups. Excel payroll. Paper challans.{' '}
            <span className="font-semibold text-gray-600">It worked in 1995. Not anymore.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

// Interactive Features Showcase

function FeaturesShowcase() {
  const [activeTab, setActiveTab] = useState<'finance' | 'academics' | 'attendance' | 'payroll' | 'admissions'>('finance');

  const tabData = {
    finance: {
      badge: 'Fee Management & Payments',
      title: 'Challans generate themselves. Parents pay online.',
      desc: 'Tired of hand-writing 300 challans? Generate dual-copy PDF challans automatically. Parents pay instantly via JazzCash or EasyPaisa in under a minute, with real-time automatic ledger reconciliation.',
      bullets: [
        'Automated monthly challan batch generation',
        'JazzCash and EasyPaisa mobile wallet integration',
        'Professional dual-copy bank PDF challan format',
        'Fee waivers, discounts, and outstanding analytics'
      ],
      mockup: (
        <div className="bg-white rounded-2xl shadow-xl p-6 w-72 border border-gray-100 text-gray-800">
          <div className="text-center border-b-2 border-dashed border-gray-200 pb-4 mb-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Al-Huda Academy</div>
            <div className="text-base font-extrabold text-gray-900">FEE CHALLAN</div>
            <div className="text-xs text-gray-400 mt-0.5">HBL Bank - Student Copy</div>
          </div>
          <div className="space-y-2.5 text-xs mb-4">
            {[
              ['Student', 'Ali Hassan - Class 9A'],
              ['Month', 'June 2025'],
              ['Due Date', '15 June 2025']
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-gray-400">{k}</span>
                <span className="font-semibold text-gray-700">{v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-gray-400 font-bold">Amount Due</span>
              <span className="font-extrabold text-blue-600 text-base">Rs 3,500</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-center">
              <div className="text-xs font-bold text-red-600">JazzCash</div>
              <div className="text-xs text-red-500 mt-0.5">Pay online</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center">
              <div className="text-xs font-bold text-emerald-700">EasyPaisa</div>
              <div className="text-xs text-emerald-600 mt-0.5">Pay online</div>
            </div>
          </div>
          <div className="mt-3 text-center text-[10px] text-gray-400">Auto-generated by EduStack PK</div>
        </div>
      )
    },
    academics: {
      badge: 'Exams & Grading',
      title: 'Marks go in. Results come out. Instantly.',
      desc: 'Calculate class rankings, averages, subject totals, and grades instantly. Teachers enter marks from a single portal, eliminating human arithmetic errors. Printable result cards are ready immediately.',
      bullets: [
        'Flexible custom grading configurations per class',
        'Secure marks entry by subject teacher',
        'Automatic class position and average ranking',
        'Professional printable result card PDF export'
      ],
      mockup: (
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-xl text-gray-800 w-72">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-4">Result Card - Class 9A</div>
          <div className="space-y-2 mb-4">
            {[
              ['Mathematics', '92 / 100', 'A+'],
              ['Physics', '88 / 100', 'A'],
              ['English', '79 / 100', 'B+'],
              ['Chemistry', '85 / 100', 'A']
            ].map(([sub, marks, grade]) => (
              <div key={sub} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                <span className="text-gray-500">{sub}</span>
                <span className="text-gray-700 font-medium">{marks}</span>
                <span className="font-extrabold text-blue-600 w-8 text-right">{grade}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-500 font-medium">Class Position</div>
              <div className="text-xl font-black text-blue-700">3rd</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-500 font-medium">Total Marks</div>
              <div className="text-xl font-black text-blue-700">86%</div>
            </div>
          </div>
        </div>
      )
    },
    attendance: {
      badge: 'Attendance & Timetables',
      title: 'Digital registers. Conflict-free timetables.',
      desc: 'Ditch manual paper registers. Mark daily or period-wise student attendance. Shortage alerts are triggered automatically. Run a conflict-free master timetable that alerts you of clashes before saving, and substitute absent teachers in a single tap.',
      bullets: [
        'Daily and period-wise digital register marking',
        'Automatic shortage alerts sent directly to dashboards',
        'Conflict-free timetable validator to prevent teacher clashes',
        'One-tap teacher substitute allocation system'
      ],
      mockup: (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xl text-gray-800 w-72">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
            <div className="text-xs font-bold text-gray-400 uppercase">DIGITAL REGISTER</div>
            <div className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Live</div>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Ali Hassan', status: 'Present', time: '07:45 AM' },
              { name: 'Zainab Bibi', status: 'Late', time: '08:02 AM' },
              { name: 'Muhammad Ahmed', status: 'Absent', time: '--' }
            ].map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs py-0.5">
                <span className="text-gray-700 font-semibold">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[10px]">{s.time}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : s.status === 'Late' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
            <span>Monthly Attendance Alerts</span>
            <span className="font-bold text-rose-600">3 Shortages</span>
          </div>
        </div>
      )
    },
    payroll: {
      badge: 'Staff & Payroll',
      title: 'One-click salary calculations. Payslips for all.',
      desc: 'Setup salary allowances and deductions once. Late arrival or leave deductions apply automatically based on digital attendance records. Process monthly payroll securely and print payslips on demand.',
      bullets: [
        'Custom salary structures with allowances and deductions',
        'Attendance-linked automated deductions and increments',
        'On-demand payroll batch processing and approval',
        'Printable monthly payslip PDF generation for staff'
      ],
      mockup: (
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-gray-800 w-72">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">PAYSLIP - JUNE 2025</div>
              <div className="font-bold text-gray-900 mt-0.5">Usman Ali - Teacher</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400">Net Pay</div>
              <div className="text-lg font-black text-blue-700">Rs 48,200</div>
            </div>
          </div>
          <div className="space-y-2 text-[11px]">
            {[
              ['Basic Salary', 'Rs 40,000', ''],
              ['House Allowance', 'Rs 8,000', ''],
              ['Transport', 'Rs 2,000', ''],
              ['Late Deduction', '- Rs 1,800', 'text-red-500']
            ].map(([k, v, cls]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-400">{k}</span>
                <span className={`font-semibold ${cls || 'text-gray-700'}`}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    admissions: {
      badge: 'Admissions Portal',
      title: 'Online applications. Seamless student onboarding.',
      desc: 'Allow prospective parents to submit applications online at your custom subdomain. Manage applicant status, issue offer letters, and auto-generate student registration numbers.',
      bullets: [
        'Public admissions portal page at school subdomain',
        'Centralized applicant tracking pipeline for school admins',
        'Automated student ID card and offer letter PDF generation',
        'Document attachments and parent communication logs'
      ],
      mockup: (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 text-gray-800 w-72">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">Online Admission</div>
              <div className="text-xs text-gray-400">Al-Huda Academy, Lahore</div>
            </div>
          </div>
          <div className="space-y-3 text-left">
            {[
              ['Student Full Name', 'Ahmad Hassan Khan'],
              ['Class Applying For', 'Class 9'],
              ['Parent Phone', '0300-1234567']
            ].map(([label, val]) => (
              <div key={label}>
                <div className="text-[10px] text-gray-400 mb-0.5">{label}</div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 font-semibold">{val}</div>
              </div>
            ))}
            <div className="rounded-xl py-2.5 text-xs font-bold text-white text-center mt-2 bg-blue-600">
              Submit Application
            </div>
          </div>
        </div>
      )
    }
  };

  const activeData = tabData[activeTab];

  return (
    <section id="features" className="py-20 bg-slate-50 relative border-y border-gray-100">
      <div className="absolute inset-0 pointer-events-none opacity-50" style={DOT_GRID} />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">All-In-One School ERP</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            One platform. Every operational need solved.
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
            No more manual files or scattered WhatsApp groups. Select a module below to see how EduStack PK transforms your operations.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-gray-200 pb-5">
          {(Object.keys(tabData) as Array<keyof typeof tabData>).map(tabKey => {
            const data = tabData[tabKey];
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'}`}
              >
                {tabKey === 'finance' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {tabKey === 'academics' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
                {tabKey === 'attendance' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {tabKey === 'payroll' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                {tabKey === 'admissions' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                )}
                {data.badge.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100 text-gray-900">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-6">
              {activeData.badge}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
              {activeData.title}
            </h3>
            <p className="text-gray-500 leading-relaxed mb-6 text-sm sm:text-base">
              {activeData.desc}
            </p>
            <ul className="space-y-3 mb-6">
              {activeData.bullets.map(bullet => (
                <li key={bullet} className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                  <CheckIcon className="w-4 h-4 text-blue-500 shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center bg-slate-50 rounded-2xl py-12 px-6 border border-gray-50">
            {activeData.mockup}
          </div>
        </div>
      </div>
    </section>
  );
}

// Roles - dark slate

function RolesSection() {
  return (
    <section className="py-20 bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">7 Roles - Complete Control</p>
            <h2 className="text-4xl font-extrabold mb-5 leading-tight">Everyone sees exactly what they should. Nothing more.</h2>
            <p className="text-gray-400 leading-relaxed">
              Teachers do not see payroll. Students do not see staff records. Accountants do not get into exam settings.
              Multi-branch? Group Admin sees across all campuses from one dashboard while each branch stays isolated.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, label:'Super Admin', desc:'Full platform control' },
              { icon: <svg className="w-5 h-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, label:'Group Admin', desc:'All branches, one view' },
              { icon: <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, label:'Principal', desc:'Branch oversight' },
              { icon: <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, label:'Teacher', desc:'Class and marks' },
              { icon: <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 7l9-5-9-5-9 5 9 5z" /></svg>, label:'Student', desc:'Results and timetable' },
              { icon: <svg className="w-5 h-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, label:'Accountant', desc:'Fees and payroll' },
              { icon: <svg className="w-5 h-5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, label:'IT Admin', desc:'Users and settings' },
            ].map(r => (
              <div key={r.label} className="p-4 rounded-xl flex items-center gap-3"
                style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)' }}>
                <div className="shrink-0">{r.icon}</div>
                <div>
                  <div className="text-sm font-bold text-white">{r.label}</div>
                  <div className="text-xs text-gray-500">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Payments - green gradient

function PaymentsSection() {
  return (
    <section className="py-20 bg-white relative border-y border-gray-100" style={DIAG_LINES}>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-4xl mb-4">&#127477;&#127472;</div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Built for the way Pakistan pays.</h2>
        <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Most parents do not have a credit card. They have JazzCash. They have EasyPaisa.
          Now they can pay school fees in under a minute - without leaving home.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { name:'JazzCash', sub:'Mobile wallet payment', icon: <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
            { name:'EasyPaisa', sub:'Mobile wallet payment', icon: <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
            { name:'Bank Challan', sub:'HBL/UBL format PDF', icon: <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg> },
            { name:'Cash', sub:'With receipt record', icon: <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
          ].map(m => (
            <div key={m.name} className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-50 border border-gray-150 shadow-sm"
              style={{ minWidth: '200px' }}>
              <div className="shrink-0">{m.icon}</div>
              <div className="text-left">
                <div className="text-gray-900 font-bold text-sm">{m.name}</div>
                <div className="text-gray-500 text-xs">{m.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials

function TestimonialsSection() {
  return (
    <section className="py-20 bg-slate-50 relative" style={DOT_GRID}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Trusted by School Leaders Across Pakistan</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">What actually changes when schools go live.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-7 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <StarRating />
              <div className="mt-4 mb-3 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full w-fit uppercase tracking-wide">
                {t.highlight}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed my-3 flex-1 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-sm shrink-0 border border-blue-100">
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing - dark section

function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-slate-950 relative" style={DOT_GRID_DARK}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Transparent Pricing</p>
          <h2 className="text-4xl font-extrabold text-white mb-4">Fair pricing in PKR.</h2>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Start a free trial or book a demo. Then pay per active student - only pay for what you use.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          <div className="rounded-3xl border-2 border-slate-700 bg-slate-900 p-8 flex flex-col">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Trial</div>
            <div className="text-5xl font-extrabold text-white mb-1">7 Days</div>
            <div className="text-gray-500 text-sm mb-7">Full access &middot; No commitment</div>
            <ul className="space-y-3 text-sm text-gray-400 mb-8 flex-1">
              {['All 10 modules unlocked','All branches and students','JazzCash and EasyPaisa','Mobile app included','9-document PDF suite','Email support'].map(item => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />{item}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center px-6 py-3.5 rounded-xl border-2 border-blue-600 text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition-colors">
              Start Free Trial
            </Link>
          </div>

          <div className="rounded-3xl p-8 flex flex-col text-white relative shadow-2xl"
            style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow:'0 20px 60px rgba(37,99,235,.3)' }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-xs font-bold uppercase tracking-wide px-4 py-1 rounded-full">
              Most Popular
            </div>
            <div className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">Pro</div>
            <div className="mb-1">
              <span className="text-5xl font-extrabold">Rs 35</span>
              <span className="text-blue-200 text-base"> /student /mo</span>
            </div>
            <div className="text-blue-200 text-sm mb-7">Per branch &middot; billed monthly in PKR</div>
            <ul className="space-y-3 text-sm text-blue-100 mb-8 flex-1">
              {['Unlimited students and branches','JazzCash and EasyPaisa payments','Priority support','Custom school branding','Website builder (3 themes)','Online admission portal','Dedicated onboarding call'].map(item => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-amber-400 shrink-0" />{item}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold transition-colors">
              Start Free Trial
            </Link>
          </div>

          <div className="bg-slate-900 rounded-3xl border-2 border-slate-700 p-8 flex flex-col text-white">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Enterprise</div>
            <div className="text-5xl font-extrabold mb-1">Custom</div>
            <div className="text-slate-500 text-sm mb-7">Large institution chains</div>
            <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
              {['On-premise deployment','SLA agreement','Dedicated account manager','Custom integrations','White-label branding','Staff training sessions'].map(item => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-blue-400 shrink-0" />{item}
                </li>
              ))}
            </ul>
            <a href="mailto:hello@wolfstack.io" className="block text-center px-6 py-3.5 rounded-xl border-2 border-slate-600 text-white font-bold hover:bg-slate-800 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
        <p className="text-center text-gray-600 text-sm mt-8">
          Trial includes full system access. Upgrade to Pro when you are ready. Your data stays safe.
        </p>
      </div>
    </section>
  );
}

// FAQ - light + diagonal lines

function FAQSection({ openFaq, setOpenFaq }: { openFaq: number | null; setOpenFaq: (i: number | null) => void }) {
  return (
    <section id="faq" className="py-24 bg-gray-50 relative" style={DIAG_LINES}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Questions</p>
          <h2 className="text-4xl font-extrabold text-gray-900">Things people ask before signing up.</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-gray-900 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
  );
}

// CTA - dark with glow

function CTASection() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={DOT_GRID_DARK} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width:'700px', height:'400px', background:'radial-gradient(ellipse,rgba(37,99,235,.15) 0%,transparent 65%)' }} />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
          Ready to modernize your school?
        </h2>
        <p className="text-lg mb-8 max-w-lg mx-auto text-blue-200">
          Get started with a free trial today, or schedule a personal live walkthrough demo with our team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register"
            className="px-8 py-3.5 rounded-xl font-bold text-base text-white transition-all hover:-translate-y-0.5"
            style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow:'0 8px 24px rgba(37,99,235,.4)' }}>
            Start Free Trial
          </Link>
          <a href="mailto:hello@wolfstack.io?subject=Book%20a%20Demo%20-%20EduStack%20PK"
            className="px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:bg-white/10"
            style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)' }}>
            Book a Live Demo
          </a>
        </div>
        <p className="mt-6 text-xs text-gray-500">
          No credit card required &middot; Full access &middot; Set up in 5 minutes
        </p>
      </div>
    </section>
  );
}

// Footer

function FooterSection() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <span className="font-extrabold text-white text-lg">EduStack <span className="text-blue-500">PK</span></span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              Pakistan's School and College ERP SaaS. Built by WolfStack.
            </p>
            <div className="text-sm text-gray-600">Made in Pakistan</div>
          </div>
          <div>
            <div className="font-semibold text-white text-sm mb-5">Platform</div>
            <ul className="space-y-3 text-sm">
              {[['#problem','The Problem'],['#modules','How We Fix It'],['#pricing','Pricing'],['#faq','FAQ']].map(([href,label]) => (
                <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white text-sm mb-5">Modules</div>
            <ul className="space-y-3 text-sm text-gray-500">
              {['Attendance','Fee Management','Exams and Results','Payroll','Admissions','Website Builder','Mobile App'].map(m => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white text-sm mb-5">Company</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Register School</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><a href="mailto:hello@wolfstack.io" className="hover:text-white transition-colors">hello@wolfstack.io</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} WolfStack. All rights reserved.</p>
          <p>EduStack PK - School and College ERP for Pakistan</p>
        </div>
      </div>
    </footer>
  );
}

// Main Page

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <HeroSection />
      <PainStatsSection />
      <TestimonialsSection />
      <FeaturesShowcase />
      <RolesSection />
      <PaymentsSection />
      <PricingSection />
      <FAQSection openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <CTASection />
      <FooterSection />
    </div>
  );
}
