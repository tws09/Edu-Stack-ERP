import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// ── Pain → Solution Stories ───────────────────────────────────────────────────

const STORIES = [
  {
    id: 'attendance',
    emoji: '📋',
    color: { pill: 'bg-blue-100 text-blue-700', icon: 'bg-blue-50 text-blue-600', check: 'text-blue-500' },
    pain: {
      label: 'Every. Single. Morning.',
      scene: `A teacher reads 40 names out loud. Students shout "present" for friends who aren't there. The register is a crumpled notebook that lives in a drawer. When a parent calls demanding to know why their child got a shortage — you go silent. Because you genuinely don't know.`,
    },
    fix: {
      headline: 'Every mark. Every period. On record. Forever.',
      desc: 'Attendance is marked digitally per period or per day. Shortage alerts fire the moment a student crosses your threshold — automatically. Parents see the record. No arguments. No calls.',
      points: ['Period-wise digital marking', 'Auto shortage alerts', 'Student calendar heatmap', 'Landscape PDF register + CSV export'],
    },
  },
  {
    id: 'fees',
    emoji: '💵',
    color: { pill: 'bg-green-100 text-green-700', icon: 'bg-green-50 text-green-600', check: 'text-green-500' },
    pain: {
      label: "The accountant's nightmare.",
      scene: `Hand-writing 300 challans. Calling 300 parents, one by one, every month. Cash sitting in a drawer without a record. A parent walks in claiming they paid last week — you have no proof. Your accountant goes home at 10 PM for three weeks straight and still the reconciliation is wrong.`,
    },
    fix: {
      headline: 'Challans generate themselves. Parents pay from their phone.',
      desc: 'BullMQ auto-generates every challan every month. Parents pay via JazzCash or EasyPaisa in 30 seconds. Every payment is logged, timestamped, and receipted. Your accountant leaves at 5.',
      points: ['Auto challan generation (BullMQ)', 'JazzCash & EasyPaisa online payments', 'HBL/UBL dual-copy PDF challans', 'Discounts, waivers & fee analytics'],
    },
  },
  {
    id: 'exams',
    emoji: '📊',
    color: { pill: 'bg-violet-100 text-violet-700', icon: 'bg-violet-50 text-violet-600', check: 'text-violet-500' },
    pain: {
      label: 'It\'s 2 AM the night before result day.',
      scene: `Your staff is still calculating grades on paper. Someone made an arithmetic error in Class 9 and nobody caught it. The result cards won't be ready by morning. Parents are calling. Children are anxious. You've been awake since yesterday. And there's still next week's exams to schedule.`,
    },
    fix: {
      headline: 'Marks go in. Results come out. Instantly.',
      desc: 'Teachers enter marks per subject online. The system calculates grades, positions, and GPA automatically — no errors. Result cards are generated as printable PDFs the moment entry is done.',
      points: ['Custom grading config per class', 'Marks entry by subject teacher', 'Class position auto-ranking', 'Printable result card PDF'],
    },
  },
  {
    id: 'timetable',
    emoji: '🗓️',
    color: { pill: 'bg-purple-100 text-purple-700', icon: 'bg-purple-50 text-purple-600', check: 'text-purple-500' },
    pain: {
      label: '7:30 AM. A teacher calls in sick.',
      scene: `You scramble. 40 students are sitting in a classroom with no teacher. You reassign someone, but now their class is unattended. Period clashes happen every week. The paper timetable is a maze of corrections and arrows. Monday morning is always chaos.`,
    },
    fix: {
      headline: 'Conflicts caught before they happen. Substitutes assigned in seconds.',
      desc: "Build conflict-free timetables that the system validates automatically. When a teacher is absent, assign a substitute from available staff in one click. Everyone's schedule updates instantly.",
      points: ['Conflict detection engine', 'One-click substitute assignment', 'Printable timetable PDF per class', 'Exam schedule integration'],
    },
  },
  {
    id: 'payroll',
    emoji: '👔',
    color: { pill: 'bg-indigo-100 text-indigo-700', icon: 'bg-indigo-50 text-indigo-600', check: 'text-indigo-500' },
    pain: {
      label: 'Your accountant spends 4 days on payroll.',
      scene: `Manual calculations. Attendance deductions done wrong. A teacher disputes their salary — and they're right. There's no paper trail. The trust between management and staff quietly erodes, every single month. Your best teachers start looking elsewhere.`,
    },
    fix: {
      headline: 'One click. Every salary calculated correctly. Every time.',
      desc: 'Salary structures, allowances, and deductions are configured once. Attendance-linked deductions apply automatically. Run payroll in one click. Print payslips. Staff disputes end.',
      points: ['Salary structure with allowances & deductions', 'Attendance-linked auto-deduction', 'One-click payroll approval', 'Printable payslip PDF'],
    },
  },
  {
    id: 'assignments',
    emoji: '📝',
    color: { pill: 'bg-orange-100 text-orange-700', icon: 'bg-orange-50 text-orange-600', check: 'text-orange-500' },
    pain: {
      label: 'The assignment was due Monday.',
      scene: `Some students submitted on paper. Some sent photos on WhatsApp. One claims they submitted — you can't find it. Half the class gets credit, half doesn't, and nobody can prove anything. Grading takes three evenings and you still haven't given feedback.`,
    },
    fix: {
      headline: 'Submitted on time. Graded fast. No disputes.',
      desc: 'Students submit files online. Late submissions are flagged automatically. Teachers grade and leave feedback from a single screen. Every submission is timestamped and stored on S3.',
      points: ['Online file submission (S3)', 'Auto late-submission flagging', 'Marks & written feedback', 'Deadline enforcement per class'],
    },
  },
  {
    id: 'notifications',
    emoji: '🔔',
    color: { pill: 'bg-rose-100 text-rose-700', icon: 'bg-rose-50 text-rose-600', check: 'text-rose-500' },
    pain: {
      label: 'You announced it in the WhatsApp group.',
      scene: `It got buried under 200 voice notes and memes. Half the parents never saw it. Three called in angry on event day. You're spending 2 hours a day on personal WhatsApp, in a dozen different groups, just to communicate with people you're supposed to be managing.`,
    },
    fix: {
      headline: 'One announcement. Every screen. Instantly.',
      desc: 'Socket.IO-powered notifications reach every staff member and student the moment you send. Target by role — all teachers, all students, or the whole school. Everyone gets it. No group chats needed.',
      points: ['Real-time notification bell (Socket.IO)', 'Role-targeted broadcasts', 'Unread badge count per user', 'Full notification history log'],
    },
  },
  {
    id: 'admissions',
    emoji: '🎓',
    color: { pill: 'bg-teal-100 text-teal-700', icon: 'bg-teal-50 text-teal-600', check: 'text-teal-500' },
    pain: {
      label: 'Admission season. Your phone doesn\'t stop.',
      scene: `Students coming in person just to collect a paper form. Applications on loose sheets, stuffed in a drawer. No way to know how many applied. No way to track who was approved and who wasn't. Every year you miss registrations. Every year, seats go unfilled that shouldn't.`,
    },
    fix: {
      headline: 'Apply online. Track every application. Fill every seat.',
      desc: "Students apply via your school's public admission portal — from home, on mobile. Staff review and approve from the dashboard. Generate offer letters and ID cards in one click.",
      points: ['Public online admission form', 'Application tracking dashboard', 'Offer letter PDF generation', 'Student ID card PDF'],
    },
  },
];

const FAQS = [
  {
    q: 'How long is the free trial and what does it include?',
    a: 'You get 7 full days of complete access — every module, every feature, every role. No restrictions. After the trial, choose the Pro plan to continue.',
  },
  {
    q: 'Can my teachers and accountant use it without training?',
    a: 'Yes. The system is designed for Pakistani school staff, not software engineers. Teachers mark attendance in 2 taps. Accountants generate challans in one click. Most staff are confident within a day.',
  },
  {
    q: 'Which payment methods can parents use to pay fees?',
    a: 'JazzCash and EasyPaisa are fully integrated — parents pay from their mobile wallet in under a minute. Manual cash and bank payment recording with receipt numbers is also available.',
  },
  {
    q: 'We have 3 campuses. Can we manage all of them from one account?',
    a: 'Yes. The Group Admin role gives you a single dashboard across all your branches — cross-branch fee summaries, attendance, staff, and analytics. Each branch still has its own isolated data.',
  },
  {
    q: 'Is there a mobile app for students and teachers?',
    a: 'Yes — a Flutter app for Android and iOS. Students check results, timetable, and fee status. Teachers mark attendance and grade assignments. Works on any smartphone.',
  },
  {
    q: "Is our school's data secure? Can other schools see it?",
    a: 'Absolutely not. Every school is a fully isolated tenant — separate data, separate subdomain, JWT authentication, and role-based access on every single API endpoint. Cross-tenant access is architecturally impossible.',
  },
  {
    q: 'What happens after the 7-day trial ends?',
    a: "Your data stays intact. You choose whether to upgrade to the Pro plan at Rs 35 per active student per month. If you don't upgrade, your account is paused — nothing is deleted.",
  },
  {
    q: 'Does the school get its own website?',
    a: 'Yes. Every school gets a public-facing website at their subdomain with 3 premium themes — Classic, Modern, and Minimal. The Principal or IT Admin can edit all content live, no coding needed. The admission portal is built in.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Mr. Tariq Mehmood',
    role: 'Principal, Al-Huda Academy, Lahore',
    quote: 'Our accountant used to come to me stressed every month-end. Now she sends me a report by noon. I didn\'t realise how much of our energy was going into paperwork until it stopped.',
    highlight: 'Accountant went from 10 PM finishes to done by noon.',
  },
  {
    name: 'Ms. Ayesha Siddiqui',
    role: 'Group Admin, Crescent Schools Network, Karachi',
    quote: 'I was flying between three campuses just to understand what was happening. Now I open one screen in the morning and I know everything — fees, attendance, staff, everything.',
    highlight: 'From 3 campuses to one dashboard.',
  },
  {
    name: 'Sir Bilal Khurshid',
    role: 'IT Admin, Future Stars College, Islamabad',
    quote: 'Parents used to call me directly with complaints about attendance records. That stopped within a week of going live. They could see everything themselves. That alone saved me hours.',
    highlight: 'Parent complaints dropped to zero in one week.',
  },
];

// ── Components ────────────────────────────────────────────────────────────────

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'w-4 h-4'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

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

// ── Page ──────────────────────────────────────────────────────────────────────

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

      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className={`font-extrabold text-xl tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              EduStack <span className="text-blue-400">PK</span>
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {[['#problem', 'The Problem'], ['#modules', 'How We Fix It'], ['#pricing', 'Pricing'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href}
                className={`transition-colors ${scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-blue-100 hover:text-white'}`}>
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className={`text-sm font-medium px-3 py-2 transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-blue-100 hover:text-white'}`}>
              Sign In
            </Link>
            <Link to="/register"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30">
              Start Free Trial
            </Link>
          </div>

          <button className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-500 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
            onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-2 shadow-lg">
            {[['#problem', 'The Problem'], ['#modules', 'How We Fix It'], ['#pricing', 'Pricing'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="py-2 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600">{label}</a>
            ))}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/login" className="py-2 text-center text-sm font-medium text-gray-600">Sign In</Link>
              <Link to="/register" className="py-3 rounded-xl bg-blue-600 text-white text-center text-sm font-bold hover:bg-blue-700">Start Free Trial</Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #0a0e1a 0%, #0f1628 55%, #0c1420 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)', backgroundSize: '38px 38px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: '900px', height: '500px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.16) 0%, transparent 68%)' }} />
        <div className="absolute top-1/3 -right-32 pointer-events-none"
          style={{ width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(139,92,246,0.09) 0%, transparent 65%)' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 lg:pt-36 lg:pb-32 text-center">
          {/* Status badge */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-sm font-medium text-blue-200">Built for Pakistani Schools & Colleges</span>
            </div>
          </div>

          {/* Headline — the pain hook */}
          <h1 className="font-extrabold tracking-tight leading-[1.08] mb-8 text-white" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4rem)' }}>
            Running a school on paper<br />
            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              is costing you more
            </span>
            <br />than you realise.
          </h1>

          {/* The scene */}
          <div className="max-w-3xl mx-auto mb-10 rounded-2xl p-6 text-left"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'rgba(191,219,254,0.8)' }}>
              Your accountant hand-writes 300 challans every month.{' '}
              <span className="text-blue-300">A teacher called in sick and 40 students are sitting idle.</span>{' '}
              It's 2 AM and the result cards still aren't ready.{' '}
              <span className="text-blue-300">You announced something important — it got buried in the WhatsApp group.</span>{' '}
              A parent is calling to dispute their child's attendance, and you have no record to show them.
            </p>
            <p className="mt-4 text-base font-semibold" style={{ color: 'rgba(251,191,36,0.9)' }}>
              This is what running a school without the right system looks like. It doesn't have to be this way.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="px-9 py-4 rounded-2xl font-bold text-base text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 8px 32px rgba(37,99,235,0.45)' }}>
              Start Your 7-Day Free Trial
            </Link>
            <a href="#problem"
              className="px-9 py-4 rounded-2xl text-white font-semibold text-base transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              See How We Solve It →
            </a>
          </div>

          <p className="mt-5 text-sm" style={{ color: 'rgba(147,197,253,0.5)' }}>
            7 days full access · No credit card required · Takes 5 minutes to set up
          </p>
        </div>

        <div className="h-16 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, white)' }} />
      </section>

      {/* ── THE REAL COST ─────────────────────────────────────────────────── */}
      <section id="problem" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Sound familiar?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            Every school in Pakistan is running on the same broken system.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-14 max-w-2xl mx-auto">
            Manual registers. WhatsApp groups. Excel payroll. Paper challans. It worked in 1995.
            It's destroying your school's efficiency — and your staff's sanity — in 2025.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              {
                stat: '3 weeks',
                label: 'every month lost to fee collection',
                desc: 'Chasing parents. Writing challans. Reconciling cash. Your accountant deserves better.',
              },
              {
                stat: '40+ hours',
                label: 'per result cycle on manual calculation',
                desc: 'Marks on paper. Excel formulas. All-nighters before result day. Errors that humiliate everyone.',
              },
              {
                stat: 'Zero record',
                label: 'when a parent disputes attendance',
                desc: 'A crumpled notebook is not evidence. You need a system — not an argument.',
              },
            ].map((item) => (
              <div key={item.stat} className="p-6 rounded-2xl bg-red-50 border border-red-100">
                <div className="text-3xl font-extrabold text-red-600 mb-1">{item.stat}</div>
                <div className="text-sm font-bold text-red-700 mb-2">{item.label}</div>
                <div className="text-red-600/80 text-sm leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULE STORIES ────────────────────────────────────────────────── */}
      <section id="modules" className="py-4 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">The Solution</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              Every problem your school has.<br />
              <span className="text-blue-600">One platform solves all of them.</span>
            </h2>
          </div>

          <div className="space-y-6 pb-20">
            {STORIES.map((story, i) => (
              <div key={story.id}
                className={`rounded-3xl overflow-hidden border ${i % 2 === 0 ? 'border-gray-200 bg-white' : 'border-gray-200 bg-white'}`}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 ${i % 2 !== 0 ? 'lg:grid-flow-dense' : ''}`}>

                  {/* Pain side */}
                  <div className={`p-8 lg:p-10 bg-gray-950 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:col-start-2' : ''}`}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="text-3xl">{story.emoji}</div>
                      <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-900/30 px-2.5 py-1 rounded-full border border-red-800/40">
                        The Problem
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white mb-4">{story.pain.label}</div>
                    <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{story.pain.scene}</p>
                  </div>

                  {/* Solution side */}
                  <div className={`p-8 lg:p-10 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                    <span className={`inline-block text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-5 w-fit ${story.color.pill}`}>
                      How EduStack Fixes It
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 leading-tight">
                      {story.fix.headline}
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6">
                      {story.fix.desc}
                    </p>
                    <ul className="space-y-2.5">
                      {story.fix.points.map((p) => (
                        <li key={p} className="flex items-center gap-2.5 text-sm text-gray-600">
                          <CheckIcon className={`w-4 h-4 shrink-0 ${story.color.check}`} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE BIGGER PICTURE ────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Beyond the basics</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Things your school never had — but always needed.
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Built on top of the core modules — and included in the same plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Website Builder */}
            <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-7 flex flex-col gap-4">
              <div className="text-3xl">🌐</div>
              <div>
                <div className="font-bold text-gray-900 text-base mb-0.5">School Website — included.</div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  A competitor's school shows up on Google. Yours doesn't. Every school on EduStack PK gets a live public website — 3 premium themes, click-to-edit, no coding needed.
                </p>
              </div>
              <ul className="space-y-2 mt-auto">
                {['Classic, Modern & Minimal themes', 'Click-to-edit live preview', 'Public admission portal built in'].map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckIcon className="w-3.5 h-3.5 text-violet-500 shrink-0" />{p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile App */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-7 flex flex-col gap-4">
              <div className="text-3xl">📱</div>
              <div>
                <div className="font-bold text-gray-900 text-base mb-0.5">Flutter Mobile App.</div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Students checking results at midnight on their phone. Teachers marking attendance before entering the classroom. Parents paying fees while standing in a shop. All of it, from the app.
                </p>
              </div>
              <ul className="space-y-2 mt-auto">
                {['Android & iOS via Flutter', 'Results, timetable, fee status', 'Real-time push notifications'].map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />{p}
                  </li>
                ))}
              </ul>
            </div>

            {/* PDF Suite */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-7 flex flex-col gap-4">
              <div className="text-3xl">📄</div>
              <div>
                <div className="font-bold text-gray-900 text-base mb-0.5">9 official documents. On demand.</div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Result cards, challans, payslips, attendance registers, offer letters, ID cards, transfer certificates, character certificates, timetables — generated instantly. No Word. No Excel. No printing shop.
                </p>
              </div>
              <ul className="space-y-2 mt-auto">
                {['Professional PDF output', 'School letterhead & branding', 'One click, any document'].map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />{p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── MULTI-TENANT / ROLES ──────────────────────────────────────────── */}
      <section className="py-20 bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">7 Roles · Complete Control</p>
              <h2 className="text-4xl font-extrabold mb-5 leading-tight">
                Everyone sees exactly what they should. Nothing more.
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Teachers don't see payroll. Students don't see staff records. Accountants don't get into exam settings. You configure it once — the system enforces it forever.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Multi-branch institutions? A Group Admin sees across all campuses — fees, attendance, staff — from one dashboard. Each branch stays completely isolated underneath.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '👨‍💼', label: 'Super Admin',  desc: 'Full platform control'            },
                { icon: '🏢', label: 'Group Admin',  desc: 'All branches, one view'           },
                { icon: '🏫', label: 'Principal',    desc: 'Branch-level oversight'           },
                { icon: '👨‍🏫', label: 'Teacher',      desc: 'Class, marks, attendance'        },
                { icon: '🎓', label: 'Student',      desc: 'Results, fees, timetable'         },
                { icon: '💰', label: 'Accountant',   desc: 'Fees, payroll, challans'          },
                { icon: '🔧', label: 'IT Admin',     desc: 'Users, settings, website'         },
              ].map((r) => (
                <div key={r.label}
                  className="p-4 rounded-xl flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-2xl flex-shrink-0">{r.icon}</div>
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

      {/* ── PAYMENTS ──────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #047857, #065f46)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-6">🇵🇰</div>
          <h2 className="text-4xl font-extrabold text-white mb-4">Built for the way Pakistan pays.</h2>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Most parents don't have a credit card or an online banking account. They have JazzCash. They have EasyPaisa. Now they can pay school fees in under a minute — without leaving home.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'JazzCash',     emoji: '💳', sub: 'Mobile wallet payment' },
              { name: 'EasyPaisa',    emoji: '📱', sub: 'Mobile wallet payment' },
              { name: 'Bank Challan', emoji: '🏦', sub: 'HBL/UBL format PDF'   },
              { name: 'Cash',         emoji: '💵', sub: 'With receipt record'   },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-3 px-5 py-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="text-3xl">{m.emoji}</div>
                <div className="text-left">
                  <div className="text-white font-bold text-sm">{m.name}</div>
                  <div className="text-emerald-200 text-xs">{m.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">From the field</p>
            <h2 className="text-4xl font-extrabold text-gray-900">
              What actually changes when schools go live.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-7 flex flex-col shadow-sm">
                <StarRating count={5} />
                <div className="mt-4 mb-2 text-xs font-bold text-blue-600 uppercase tracking-wide bg-blue-50 px-2.5 py-1 rounded-full w-fit">
                  {t.highlight}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed my-4 flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="border-t border-gray-50 pt-4">
                  <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Simple Pricing</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Pay as you grow. In PKR.</h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Start with a 7-day free trial. Then pay per active student — you only pay for what you use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {/* Trial */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 flex flex-col">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Trial</div>
              <div className="text-5xl font-extrabold text-gray-900 mb-1">7 Days</div>
              <div className="text-gray-400 text-sm mb-7">Full access · No commitment</div>
              <ul className="space-y-3 text-sm text-gray-600 mb-8 flex-1">
                {['All 10 modules unlocked', 'All branches & students', 'JazzCash & EasyPaisa', 'Mobile app included', '9-document PDF suite', 'Email support'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <Link to="/register"
                className="block text-center px-6 py-3.5 rounded-xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors">
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-3xl p-8 flex flex-col text-white relative"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 20px 60px rgba(37,99,235,0.3)' }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-xs font-bold uppercase tracking-wide px-4 py-1 rounded-full">
                Most Popular
              </div>
              <div className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">Pro</div>
              <div className="mb-1">
                <span className="text-5xl font-extrabold">Rs 35</span>
                <span className="text-blue-200 text-base"> /student /mo</span>
              </div>
              <div className="text-blue-200 text-sm mb-7">Per branch · billed monthly in PKR</div>
              <ul className="space-y-3 text-sm text-blue-100 mb-8 flex-1">
                {[
                  'Unlimited students & branches',
                  'JazzCash & EasyPaisa payments',
                  'Priority support',
                  'Custom school branding',
                  'Website builder (3 themes)',
                  'Online admission portal',
                  'Dedicated onboarding call',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckIcon className="w-4 h-4 text-amber-400 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <Link to="/register"
                className="block text-center px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold transition-colors">
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-900 rounded-3xl border-2 border-slate-700 p-8 flex flex-col text-white">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Enterprise</div>
              <div className="text-5xl font-extrabold mb-1">Custom</div>
              <div className="text-slate-400 text-sm mb-7">Large institution chains</div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8 flex-1">
                {[
                  'On-premise deployment',
                  'SLA agreement',
                  'Dedicated account manager',
                  'Custom integrations',
                  'White-label branding',
                  'Staff training included',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckIcon className="w-4 h-4 text-blue-400 shrink-0" />{item}
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
            7-day trial includes full access. Upgrade to Pro after it ends. If you don't — your data stays safe.
          </p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Questions</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Things people ask before signing up.</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-gray-900 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
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

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #0a0e1a 0%, #0f1628 60%, #0c1420 100%)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 65%)' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Your school deserves better<br />than a paper register.
          </h2>
          <p className="text-xl mb-3 max-w-xl mx-auto" style={{ color: 'rgba(191,219,254,0.7)' }}>
            Start your 7-day free trial. The whole system, all modules, every feature — unlocked from day one.
          </p>
          <p className="text-sm mb-10" style={{ color: 'rgba(147,197,253,0.45)' }}>
            Takes 5 minutes to set up. No credit card. No commitment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 8px 32px rgba(37,99,235,0.45)' }}>
              Start Your 7-Day Free Trial →
            </Link>
            <a href="#modules"
              className="px-10 py-4 rounded-2xl text-white font-semibold text-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
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
              <p className="text-sm text-gray-500 leading-relaxed mb-3">Pakistan's School & College ERP SaaS. Built by WolfStack.</p>
              <div className="text-sm text-gray-600">🇵🇰 Made in Pakistan</div>
            </div>

            <div>
              <div className="font-semibold text-white text-sm mb-5">Platform</div>
              <ul className="space-y-3 text-sm">
                {[['#problem', 'The Problem'], ['#modules', 'How We Fix It'], ['#pricing', 'Pricing'], ['#faq', 'FAQ']].map(([href, label]) => (
                  <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-semibold text-white text-sm mb-5">Modules</div>
              <ul className="space-y-3 text-sm text-gray-500">
                {['Attendance', 'Fee Management', 'Exams & Results', 'Payroll', 'Admissions', 'Website Builder', 'Mobile App'].map((m) => (
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
            <p>EduStack PK — School & College ERP for Pakistan</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
