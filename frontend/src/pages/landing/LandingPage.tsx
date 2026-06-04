import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// â”€â”€ Shared helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FAQS = [
  { q: 'How long is the free trial and what does it include?', a: 'You get 7 full days of complete access â€” every module, every feature, every role. No restrictions. After the trial, choose the Pro plan to continue.' },
  { q: 'Can my teachers and accountant use it without training?', a: 'Yes. The system is designed for Pakistani school staff, not software engineers. Teachers mark attendance in 2 taps. Accountants generate challans in one click. Most staff are confident within a day.' },
  { q: 'Which payment methods can parents use?', a: 'JazzCash and EasyPaisa are fully integrated â€” parents pay from their mobile wallet in under a minute. Manual cash and bank payment recording with receipt numbers is also available.' },
  { q: 'We have 3 campuses. Can we manage them from one account?', a: 'Yes. The Group Admin role gives you a single dashboard across all branches â€” cross-branch fee summaries, attendance, staff, and analytics. Each branch keeps its own isolated data.' },
  { q: 'Is there a mobile app for students and teachers?', a: 'Yes â€” a Flutter app for Android and iOS. Students check results, timetable, and fee status. Teachers mark attendance and grade assignments on the go.' },
  { q: "Is our school's data secure? Can other schools see it?", a: 'Absolutely not. Every school is a fully isolated tenant â€” separate data, JWT authentication, and role-based access on every API endpoint. Cross-tenant access is architecturally impossible.' },
  { q: 'What happens after the 7-day trial ends?', a: "Your data stays intact. You choose whether to upgrade to Pro at Rs 35 per active student per month. If you don't upgrade, the account is paused â€” nothing is deleted." },
  { q: 'Does the school get its own website?', a: 'Yes. Every school gets a public website at their subdomain with 3 themes â€” Classic, Modern, and Minimal. Edit all content live with a click-to-edit preview. No coding needed.' },
];

const TESTIMONIALS = [
  { name: 'Mr. Tariq Mehmood', role: 'Principal, Al-Huda Academy, Lahore', quote: "Our accountant used to come to me stressed every month-end. Now she sends me a report by noon. I didn't realise how much energy was going into paperwork until it stopped.", highlight: 'Accountant: 10 PM â†’ done by noon' },
  { name: 'Ms. Ayesha Siddiqui', role: 'Group Admin, Crescent Schools, Karachi', quote: 'I was flying between three campuses just to understand what was happening. Now I open one screen in the morning and I know everything â€” fees, attendance, staff, all of it.', highlight: '3 campuses â†’ one dashboard' },
  { name: 'Sir Bilal Khurshid', role: 'IT Admin, Future Stars College, Islamabad', quote: 'Parents used to call me directly with attendance complaints. That stopped in the first week. They could see everything themselves. That alone saved me hours every day.', highlight: 'Parent complaints dropped to zero' },
];

// â”€â”€ Navbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          <span className={`font-extrabold text-xl tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>EduStack <span className="text-blue-400">PK</span></span>
        </div>
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {[['#problem','The Problem'],['#modules','How We Fix It'],['#pricing','Pricing'],['#faq','FAQ']].map(([href,label]) => (
            <a key={href} href={href} className={`transition-colors ${scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-blue-100 hover:text-white'}`}>{label}</a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login" className={`text-sm font-medium px-3 py-2 transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-blue-100 hover:text-white'}`}>Sign In</Link>
          <Link to="/register" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30">Start Free Trial</Link>
        </div>
        <button className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-500 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="menu">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-2 shadow-lg">
          {[['#problem','The Problem'],['#modules','How We Fix It'],['#pricing','Pricing'],['#faq','FAQ']].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)} className="py-2 px-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600">{label}</a>
          ))}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link to="/login" className="py-2 text-center text-sm text-gray-600">Sign In</Link>
            <Link to="/register" className="py-3 rounded-xl bg-blue-600 text-white text-center text-sm font-bold hover:bg-blue-700">Start Free Trial</Link>
          </div>
        </div>
      )}
    </header>
  );
}

// â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function HeroSection() {
  return (
    <section style={{ background: 'linear-gradient(150deg,#0a0e1a 0%,#0f1628 55%,#0c1420 100%)' }} className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={DOT_GRID_DARK} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width:'900px', height:'500px', background:'radial-gradient(ellipse,rgba(59,130,246,.18) 0%,transparent 68%)' }} />
      <div className="absolute top-1/3 -right-32 pointer-events-none" style={{ width:'500px', height:'500px', background:'radial-gradient(ellipse,rgba(139,92,246,.1) 0%,transparent 65%)' }} />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 lg:pt-36 lg:pb-32 text-center">
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5" style={{ background:'rgba(59,130,246,.1)', border:'1px solid rgba(59,130,246,.2)' }}>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
            <span className="text-sm font-medium text-blue-200">Built for Pakistani Schools & Colleges</span>
          </div>
        </div>
        <h1 className="font-extrabold tracking-tight leading-[1.07] mb-8 text-white" style={{ fontSize:'clamp(2.4rem,5.5vw,4rem)' }}>
          Running a school on paper<br />
          <span style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>is costing you more</span><br />
          than you realise.
        </h1>
        <div className="max-w-3xl mx-auto mb-10 rounded-2xl p-6 text-left" style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)' }}>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color:'rgba(191,219,254,.8)' }}>
            Your accountant hand-writes 300 challans every month.{' '}
            <span className="text-blue-300">A teacher called in sick and 40 students are sitting idle.</span>{' '}
            It is 2 AM and the result cards still are not ready.{' '}
            <span className="text-blue-300">You announced something important â€” it got buried in the WhatsApp group.</span>{' '}
            A parent is calling to dispute attendance, and you have no record to show them.
          </p>
          <p className="mt-4 text-base font-semibold" style={{ color:'rgba(251,191,36,.9)' }}>
            This is what running a school without the right system looks like. It does not have to be this way.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="px-9 py-4 rounded-2xl font-bold text-base text-white transition-all hover:-translate-y-0.5"
            style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow:'0 8px 32px rgba(37,99,235,.45)' }}>
            Start Your 7-Day Free Trial
          </Link>
          <a href="#problem" className="px-9 py-4 rounded-2xl text-white font-semibold text-base transition-all"
            style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)' }}>
            See How We Solve It â†’
          </a>
        </div>
        <p className="mt-5 text-sm" style={{ color:'rgba(147,197,253,.45)' }}>7 days full access Â· No credit card Â· 5 minutes to set up</p>
      </div>
      <div className="h-16 pointer-events-none" style={{ background:'linear-gradient(to bottom,transparent,white)' }} />
    </section>
  );
}

// â”€â”€ Pain Stats â€” white + diagonal lines â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PainStatsSection() {
  return (
    <section id="problem" className="py-20 bg-white relative" style={DIAG_LINES}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Sound familiar?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Every school in Pakistan is running<br className="hidden sm:block" /> on the same broken system.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { stat: '300', unit: 'challans', desc: 'written by hand every single month. Then chased individually by phone.' },
            { stat: '2 AM', unit: 'result night', desc: 'Staff still calculating grades on paper. One error undoes everything.' },
            { stat: '0', unit: 'records', desc: 'to show a parent disputing their child\'s attendance. Zero. None.' },
          ].map(item => (
            <div key={item.stat} className="bg-red-50 border border-red-100 rounded-2xl p-7 text-center">
              <div className="text-6xl font-black text-red-600 mb-1 leading-none">{item.stat}</div>
              <div className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3">{item.unit}</div>
              <div className="text-red-600/80 text-sm leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">Manual registers. WhatsApp groups. Excel payroll. Paper challans. <span className="font-semibold text-gray-600">It worked in 1995.</span></p>
        </div>
      </div>
    </section>
  );
}

// â”€â”€ 1. Attendance â€” horizontal split, dot grid right side â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AttendanceSection() {
  return (
    <section id="modules" className="grid grid-cols-1 lg:grid-cols-2 min-h-130">
      {/* Pain â€” dark left */}
      <div className="bg-slate-950 p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={DOT_GRID_DARK} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-6">ðŸ“‹ Attendance â€” The Problem</div>
          <div className="text-4xl font-black text-white mb-2 leading-tight">Every. Single. Morning.</div>
          <p className="text-gray-400 leading-relaxed text-base">
            A teacher reads 40 names out loud. Students shout "present" for absent friends.
            The register is a crumpled notebook that lives in a drawer.
            When a parent calls about a shortage â€” <span className="text-white font-semibold">you have no answer. Because you have no record.</span>
          </p>
        </div>
      </div>
      {/* Solution â€” light blue right */}
      <div className="bg-blue-50 p-10 lg:p-14 flex flex-col justify-center relative" style={DOT_GRID}>
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-6 w-fit">How EduStack Fixes It</div>
        <div className="text-5xl font-black text-blue-600 leading-none mb-1">Zero</div>
        <div className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">arguments about attendance. Ever again.</div>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          Digital attendance per period or daily. Shortage alerts fire automatically. Students see their own calendar. Parents see the live record. No calls. No disputes. No crumpled notebooks.
        </p>
        <ul className="space-y-2.5">
          {['Daily & period-wise digital marking','Auto shortage alert at your threshold','Student attendance calendar heatmap','PDF register + CSV export in one click'].map(p => (
            <li key={p} className="flex items-center gap-2.5 text-sm text-gray-600">
              <CheckIcon className="w-4 h-4 text-blue-500 shrink-0" />{p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// â”€â”€ 2. Fees â€” full-width dark, oversized stat + challan mockup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FeesSection() {
  return (
    <section className="bg-slate-950 py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={DOT_GRID_DARK} />
      <div className="absolute -top-40 right-0 pointer-events-none" style={{ width:'500px', height:'500px', background:'radial-gradient(ellipse,rgba(16,185,129,.08) 0%,transparent 65%)' }} />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Oversized pain stat */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-8">ðŸ’µ Fee Management â€” The Problem</div>
          <div className="font-black leading-none mb-4" style={{ fontSize:'clamp(5rem,18vw,12rem)', color:'rgba(255,255,255,.07)' }}>300</div>
          <div className="-mt-8 sm:-mt-12 lg:-mt-16 relative z-10">
            <div className="text-3xl sm:text-4xl font-extrabold text-white mb-3">challans written by hand.</div>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Every month. Every year. Then your accountant spends three weeks on the phone chasing each one. Cash sits in a drawer, unreconciled. A parent claims they paid â€” you have no proof.</p>
          </div>
        </div>

        {/* Solution + mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/30 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-6">How EduStack Fixes It</div>
            <h3 className="text-3xl font-extrabold text-white mb-4">Challans generate themselves.<br />Parents pay from their phone.</h3>
            <p className="text-gray-400 leading-relaxed mb-6">BullMQ auto-generates every challan every month. Parents pay via JazzCash or EasyPaisa in 30 seconds. Every payment logged, timestamped, receipted. Your accountant leaves at 5 PM.</p>
            <ul className="space-y-3">
              {['Auto challan generation every month (BullMQ)','JazzCash & EasyPaisa online payments','HBL/UBL dual-copy PDF challan format','Discounts, waivers & fee status analytics'].map(p => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />{p}
                </li>
              ))}
            </ul>
          </div>
          {/* Challan mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-72 border border-gray-100">
              <div className="text-center border-b-2 border-dashed border-gray-200 pb-4 mb-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Al-Huda Academy</div>
                <div className="text-base font-extrabold text-gray-900">FEE CHALLAN</div>
                <div className="text-xs text-gray-400 mt-0.5">HBL Bank Â· Student Copy</div>
              </div>
              <div className="space-y-2.5 text-xs mb-4">
                {[['Student','Ali Hassan â€” Class 9A'],['Month','June 2025'],['Due Date','15 June 2025']].map(([k,v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-semibold text-gray-700">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-400 font-bold">Amount Due</span>
                  <span className="font-extrabold text-emerald-700 text-base">Rs 3,500</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-center">
                  <div className="text-xs font-bold text-red-600">JazzCash</div>
                  <div className="text-xs text-red-500 mt-0.5">0300-XXXXXXX</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center">
                  <div className="text-xs font-bold text-emerald-700">EasyPaisa</div>
                  <div className="text-xs text-emerald-600 mt-0.5">Pay online</div>
                </div>
              </div>
              <div className="mt-3 text-center text-xs text-gray-300">Auto-generated Â· EduStack PK</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// â”€â”€ 3. Exams â€” pull quote on deep violet + before/after below â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ExamsSection() {
  return (
    <section>
      {/* Pull quote â€” dark violet */}
      <div className="relative overflow-hidden py-20 text-center" style={{ background:'linear-gradient(135deg,#1e1b4b,#2e1065)' }}>
        <div className="absolute inset-0 pointer-events-none" style={DOT_GRID_DARK} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-violet-900/50 border border-violet-700/40 text-violet-300 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-8">ðŸ“Š Exams & Results â€” The Problem</div>
          <div className="font-black text-white mb-4 leading-none" style={{ fontSize:'clamp(4rem,14vw,9rem)' }}>2 AM.</div>
          <p className="text-2xl sm:text-3xl font-bold text-violet-200 mb-4">The night before result day.</p>
          <p className="text-violet-300/80 text-lg max-w-xl mx-auto leading-relaxed">
            Your staff is still calculating grades on paper. Someone made an arithmetic error in Class 9 and nobody caught it. The result cards will not be ready by morning. Parents are calling. You have been awake since yesterday.
          </p>
        </div>
      </div>
      {/* Solution â€” light with dot grid */}
      <div className="bg-violet-50 py-16 relative" style={DOT_GRID}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-5 w-fit">How EduStack Fixes It</div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-4">Marks go in. Results come out. Instantly.</h3>
              <p className="text-gray-500 leading-relaxed mb-6">Teachers enter marks per subject online. The system calculates grades, positions, and ranking automatically â€” zero errors. Result card PDFs are ready the moment marks are submitted.</p>
              <ul className="space-y-2.5">
                {['Custom grading config per class','Marks entry by subject teacher','Auto class position ranking','Printable result card PDF'].map(p => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckIcon className="w-4 h-4 text-violet-500 shrink-0" />{p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-violet-200 p-6 shadow-lg">
              <div className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-4">Result Card â€” Class 9A</div>
              <div className="space-y-2 mb-4">
                {[['Mathematics','92 / 100','A+'],['Physics','88 / 100','A'],['English','79 / 100','B+'],['Chemistry','85 / 100','A']].map(([sub, marks, grade]) => (
                  <div key={sub} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">{sub}</span>
                    <span className="text-gray-700 font-medium">{marks}</span>
                    <span className="font-extrabold text-violet-600 w-8 text-right">{grade}</span>
                  </div>
                ))}
              </div>
              <div className="bg-violet-50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-violet-500 font-medium">Class Position</div>
                  <div className="text-2xl font-black text-violet-700">3rd</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-violet-500 font-medium">Total Marks</div>
                  <div className="text-2xl font-black text-violet-700">86%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// â”€â”€ 4. Timetable â€” before/after comparison, light + diagonal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TimetableSection() {
  return (
    <section className="py-20 bg-white relative" style={DIAG_LINES}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-4">ðŸ—“ï¸ Timetable & Scheduling</div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">7:30 AM. A teacher calls in sick.</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">40 students are sitting in a classroom with no one. It happens every week. Monday morning is always chaos.</p>
        </div>
        {/* Before / After */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-7">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <span className="font-bold text-red-700 text-sm">The old way</span>
            </div>
            <ul className="space-y-3 text-sm text-red-700">
              {['Paper timetable, covered in correction fluid','Teacher absent â†’ scramble, no system','Period clashes discovered after they happen','Substitute found by walking the corridors','New timetable redrawn from scratch each term'].map(item => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-red-400 mt-0.5 shrink-0">âœ•</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-7">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckIcon className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-bold text-purple-700 text-sm">With EduStack PK</span>
            </div>
            <ul className="space-y-3 text-sm text-purple-700">
              {['Digital conflict-free timetable, validated live','Absent teacher â†’ assign substitute in one click','Clashes caught before the timetable is saved','All staff notified automatically of changes','Printable timetable PDF for every class, always'].map(item => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckIcon className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// â”€â”€ 5. Payroll â€” dark indigo, transformation visual â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PayrollSection() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)' }}>
      <div className="absolute inset-0 pointer-events-none" style={DOT_GRID_DARK} />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-900/50 border border-indigo-700/40 text-indigo-300 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-8">ðŸ‘” Payroll â€” The Problem</div>
          {/* Transformation visual */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8">
            <div className="text-center">
              <div className="text-5xl sm:text-7xl font-black text-white/20 leading-none">4</div>
              <div className="text-sm font-bold text-red-400 mt-1">days wasted</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-10 h-6 text-indigo-400" fill="none" viewBox="0 0 40 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h30M25 6l10 6-10 6" />
              </svg>
              <span className="text-indigo-400 text-xs font-bold">EduStack</span>
            </div>
            <div className="text-center">
              <div className="text-5xl sm:text-7xl font-black text-indigo-300 leading-none">1</div>
              <div className="text-sm font-bold text-indigo-300 mt-1">click</div>
            </div>
          </div>
          <p className="text-indigo-200/80 text-lg max-w-2xl mx-auto leading-relaxed">
            Manual calculations. Attendance deductions done wrong. A teacher disputes their salary â€” and they are right. There is no paper trail. Trust erodes. Your best teachers start looking elsewhere.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-extrabold text-white mb-4">One click. Every salary correct. Every time.</h3>
            <p className="text-indigo-200/70 leading-relaxed mb-6">Salary structures, allowances, and deductions configured once. Attendance-linked deductions apply automatically. Process payroll in one click. Print payslips. Staff disputes end permanently.</p>
            <ul className="space-y-2.5">
              {['Salary structure with allowances & deductions','Attendance-linked auto-deduction','One-click payroll approval','Printable payslip PDF'].map(p => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-indigo-200">
                  <CheckIcon className="w-4 h-4 text-indigo-400 shrink-0" />{p}
                </li>
              ))}
            </ul>
          </div>
          {/* Payslip mockup */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">PAYSLIP â€” JUNE 2025</div>
                <div className="font-bold text-gray-900 mt-0.5">Usman Ali â€” Teacher</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Net Pay</div>
                <div className="text-xl font-black text-indigo-700">Rs 48,200</div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {[['Basic Salary','Rs 40,000',''],['House Allowance','Rs 8,000',''],['Transport','Rs 2,000',''],['Late Deduction','â€” Rs 1,800','text-red-500']].map(([k,v,cls]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-400">{k}</span>
                  <span className={`font-semibold ${cls || 'text-gray-700'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// â”€â”€ 6. Assignments â€” orange left / white dot-grid right split â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AssignmentsSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-120">
      <div className="p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden" style={{ background:'linear-gradient(135deg,#c2410c,#ea580c)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-10" style={DOT_GRID_DARK} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-black/20 text-orange-100 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-6 w-fit">ðŸ“ Assignments â€” The Problem</div>
          <div className="text-3xl font-black text-white mb-4 leading-tight">"I submitted it. I swear."</div>
          <p className="text-orange-100 leading-relaxed">
            Some students hand in paper. Some WhatsApp a photo. One claims they submitted â€” you cannot find it. Half the class gets credit, half does not, and nobody can prove anything. Grading takes three evenings. You still have not given feedback.
          </p>
        </div>
      </div>
      <div className="bg-white p-10 lg:p-14 flex flex-col justify-center relative" style={DOT_GRID}>
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-6 w-fit">How EduStack Fixes It</div>
        <h3 className="text-3xl font-extrabold text-gray-900 mb-4">Every submission. Timestamped. Undeniable.</h3>
        <p className="text-gray-500 leading-relaxed mb-6">Students submit files online. The moment the deadline passes, late submissions are flagged automatically. Teachers grade and write feedback from a single screen. Every submission is stored permanently on S3.</p>
        <ul className="space-y-2.5">
          {['Online file submission via S3','Deadline enforcement â€” auto late flag','Marks + written feedback per submission','Full submission history per student'].map(p => (
            <li key={p} className="flex items-center gap-2.5 text-sm text-gray-600">
              <CheckIcon className="w-4 h-4 text-orange-500 shrink-0" />{p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// â”€â”€ 7. Notifications â€” dark rose/slate, phone mockup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function NotificationsSection() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#0f172a,#1c0a14)' }}>
      <div className="absolute inset-0 pointer-events-none" style={DOT_GRID_DARK} />
      <div className="absolute top-0 right-0 pointer-events-none" style={{ width:'400px', height:'400px', background:'radial-gradient(ellipse,rgba(190,24,93,.12) 0%,transparent 65%)' }} />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-rose-900/40 border border-rose-800/40 text-rose-400 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-6">ðŸ”” Notifications â€” The Problem</div>
            <h2 className="text-4xl font-extrabold text-white mb-5 leading-tight">You posted it in the WhatsApp group.</h2>
            <p className="text-gray-400 leading-relaxed mb-6">It got buried under 200 voice notes. Three parents called in angry on the event day claiming they never saw it. You are managing a dozen WhatsApp groups, spending 2 hours a day on a platform you were never supposed to run a school on.</p>
            <div className="border-l-4 border-rose-600 pl-5 my-8">
              <p className="text-white text-lg font-semibold italic">"One announcement. Every screen. Instantly."</p>
            </div>
            <ul className="space-y-2.5">
              {['Real-time notification bell (Socket.IO)','Role-targeted broadcasts â€” teachers, students, all','Unread count badge in every user\'s sidebar','Full notification history on every account'].map(p => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <CheckIcon className="w-4 h-4 text-rose-400 shrink-0" />{p}
                </li>
              ))}
            </ul>
          </div>
          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="relative" style={{ width: 220 }}>
              <div className="rounded-3xl p-3 shadow-2xl" style={{ background:'#1c1c1e' }}>
                <div className="rounded-2xl overflow-hidden" style={{ background:'#000' }}>
                  <div className="h-7 flex items-center justify-between px-4" style={{ background:'#1c1c1e' }}>
                    <span className="text-white text-xs font-semibold">9:41</span>
                    <div className="flex gap-1 items-center">
                      <div className="w-3.5 h-1.5 rounded-sm bg-white opacity-70" />
                      <div className="w-1 h-2 rounded-sm bg-white opacity-50" />
                    </div>
                  </div>
                  <div className="p-3 space-y-2.5" style={{ background:'#0a0a0a' }}>
                    <div className="text-xs text-gray-500 text-center mb-1">Notifications</div>
                    {[
                      { color:'bg-blue-600', title:'ðŸ“£ Principal', msg:'June fee challans are live. Pay via JazzCash.' },
                      { color:'bg-violet-700', title:'ðŸ“Š Results', msg:'Class 9 result cards are ready to download.' },
                      { color:'bg-slate-700', title:'ðŸ“‹ Attendance', msg:'Ahmad Shah: shortage 72% â€” alert sent to parent.' },
                    ].map((n, i) => (
                      <div key={i} className={`${n.color} rounded-xl p-3 text-white`}>
                        <div className="font-bold text-xs mb-0.5">{n.title}</div>
                        <div className="text-xs opacity-80 leading-relaxed">{n.msg}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Notification badge */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shadow-lg">3</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// â”€â”€ 8. Admissions â€” teal gradient, form mockup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AdmissionsSection() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#0d9488,#0f766e)' }}>
      <div className="absolute inset-0 pointer-events-none opacity-10" style={DOT_GRID_DARK} />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-black/20 text-teal-100 text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 mb-6">ðŸŽ“ Admissions â€” The Problem</div>
            <h2 className="text-4xl font-extrabold text-white mb-5 leading-tight">Admission season. Seats go unfilled that should not.</h2>
            <p className="text-teal-100/80 leading-relaxed mb-6">Students coming in person just to collect a form. Applications on loose sheets stuffed in a drawer. No way to know how many applied or who was approved. Every year you miss registrations. Every year you leave revenue on the table.</p>
            <h3 className="text-xl font-bold text-white mb-4">Apply online. Track every application. Fill every seat.</h3>
            <ul className="space-y-2.5">
              {['Public admission form at your school subdomain','Application tracking dashboard for staff','Approval workflow with status per applicant','Offer letter + student ID card PDF generation'].map(p => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-teal-100">
                  <CheckIcon className="w-4 h-4 text-teal-200 shrink-0" />{p}
                </li>
              ))}
            </ul>
          </div>
          {/* Form mockup */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-teal-100">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white text-sm">ðŸŽ“</div>
              <div>
                <div className="font-bold text-gray-900 text-sm">Online Admission 2025-26</div>
                <div className="text-xs text-gray-400">Al-Huda Academy, Lahore</div>
              </div>
            </div>
            <div className="space-y-3">
              {[['Student Full Name','Ahmad Hassan Khan'],['Class Applying For','Class 9'],['Previous Marks','78%'],['Parent Phone','0300-1234567']].map(([label,val]) => (
                <div key={label}>
                  <div className="text-xs text-gray-400 mb-1">{label}</div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium">{val}</div>
                </div>
              ))}
              <div className="rounded-xl py-3 text-sm font-bold text-white text-center mt-2" style={{ background:'linear-gradient(135deg,#0d9488,#0f766e)' }}>
                Submit Application â†’
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// â”€â”€ Beyond the basics â€” light dot grid, 3 distinct cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function BeyondSection() {
  return (
    <section className="py-24 bg-gray-50 relative" style={DOT_GRID}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Also included</p>
          <h2 className="text-4xl font-extrabold text-gray-900">Things your school never had â€” but always needed.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji:'ðŸŒ', color:'border-violet-200 bg-white', badge:'bg-violet-100 text-violet-700', check:'text-violet-500', title:'School Website â€” included.', desc:"A competitor shows up on Google. Yours doesn't. Every school gets a live public website â€” 3 premium themes, click-to-edit, no coding.", points:['Classic, Modern & Minimal themes','Click-to-edit live preview','Public admission portal built in'] },
            { emoji:'ðŸ“±', color:'border-blue-200 bg-white', badge:'bg-blue-100 text-blue-700', check:'text-blue-500', title:'Flutter Mobile App.', desc:'Students check results at midnight. Teachers mark attendance on the way to class. Parents pay fees while standing in a shop. All from the app.', points:['Android & iOS via Flutter','Results, timetable, fee status','Real-time push notifications'] },
            { emoji:'ðŸ“„', color:'border-amber-200 bg-white', badge:'bg-amber-100 text-amber-700', check:'text-amber-500', title:'9 official documents.', desc:'Result cards, challans, payslips, attendance registers, offer letters, ID cards, transfer certificates, character certificates, timetables. All on demand.', points:['Professional PDF output','School letterhead & branding','One click, any document'] },
          ].map(c => (
            <div key={c.title} className={`rounded-2xl border-2 ${c.color} p-7 flex flex-col shadow-sm hover:shadow-lg transition-shadow`}>
              <div className="text-4xl mb-4">{c.emoji}</div>
              <div className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${c.badge} w-fit mb-3`}>Included</div>
              <div className="font-bold text-gray-900 mb-2">{c.title}</div>
              <p className="text-gray-500 text-sm leading-relaxed mb-5 flex-1">{c.desc}</p>
              <ul className="space-y-2">
                {c.points.map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckIcon className={`w-3.5 h-3.5 shrink-0 ${c.check}`} />{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// â”€â”€ Roles â€” dark slate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function RolesSection() {
  return (
    <section className="py-20 bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">7 Roles Â· Complete Control</p>
            <h2 className="text-4xl font-extrabold mb-5 leading-tight">Everyone sees exactly what they should. Nothing more.</h2>
            <p className="text-gray-400 leading-relaxed">Teachers do not see payroll. Students do not see staff records. Accountants do not get into exam settings. Multi-branch? Group Admin sees across all campuses from one dashboard while each branch stays isolated.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon:'ðŸ‘¨â€ðŸ’¼', label:'Super Admin',  desc:'Full platform control'  },
              { icon:'ðŸ¢', label:'Group Admin',  desc:'All branches, one view' },
              { icon:'ðŸ«', label:'Principal',    desc:'Branch oversight'       },
              { icon:'ðŸ‘¨â€ðŸ«', label:'Teacher',      desc:'Class & marks'         },
              { icon:'ðŸŽ“', label:'Student',      desc:'Results & timetable'   },
              { icon:'ðŸ’°', label:'Accountant',   desc:'Fees & payroll'        },
              { icon:'ðŸ”§', label:'IT Admin',     desc:'Users & settings'      },
            ].map(r => (
              <div key={r.label} className="p-4 rounded-xl flex items-center gap-3" style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)' }}>
                <div className="text-2xl shrink-0">{r.icon}</div>
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

// â”€â”€ Payments â€” green gradient â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PaymentsSection() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background:'linear-gradient(135deg,#047857,#065f46)' }}>
      <div className="absolute inset-0 pointer-events-none opacity-10" style={DIAG_LINES} />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-5xl mb-5">ðŸ‡µðŸ‡°</div>
        <h2 className="text-4xl font-extrabold text-white mb-4">Built for the way Pakistan pays.</h2>
        <p className="text-emerald-100 text-lg max-w-xl mx-auto mb-10 leading-relaxed">Most parents do not have a credit card. They have JazzCash. They have EasyPaisa. Now they can pay school fees in under a minute â€” without leaving home.</p>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { name:'JazzCash', emoji:'ðŸ’³', sub:'Mobile wallet payment' },
            { name:'EasyPaisa', emoji:'ðŸ“±', sub:'Mobile wallet payment' },
            { name:'Bank Challan', emoji:'ðŸ¦', sub:'HBL/UBL format PDF' },
            { name:'Cash', emoji:'ðŸ’µ', sub:'With receipt record' },
          ].map(m => (
            <div key={m.name} className="flex items-center gap-3 px-5 py-4 rounded-2xl" style={{ background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)' }}>
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
  );
}

// â”€â”€ Testimonials â€” white + dot grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TestimonialsSection() {
  return (
    <section className="py-24 bg-white relative" style={DOT_GRID}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">From the field</p>
          <h2 className="text-4xl font-extrabold text-gray-900">What actually changes when schools go live.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl border border-gray-200 p-7 flex flex-col shadow-sm hover:shadow-lg transition-shadow">
              <StarRating />
              <div className="mt-4 mb-3 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full w-fit uppercase tracking-wide">{t.highlight}</div>
              <p className="text-gray-600 text-sm leading-relaxed my-3 flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="border-t border-gray-50 pt-4">
                <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                <div className="text-gray-400 text-xs mt-0.5">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// â”€â”€ Pricing â€” dark section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-slate-950 relative" style={DOT_GRID_DARK}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Transparent Pricing</p>
          <h2 className="text-4xl font-extrabold text-white mb-4">Fair pricing in PKR.</h2>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">Start with a 7-day free trial. Then pay per active student â€” you only pay for what you use.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          <div className="rounded-3xl border-2 border-slate-700 bg-slate-900 p-8 flex flex-col">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Trial</div>
            <div className="text-5xl font-extrabold text-white mb-1">7 Days</div>
            <div className="text-gray-500 text-sm mb-7">Full access Â· No commitment</div>
            <ul className="space-y-3 text-sm text-gray-400 mb-8 flex-1">
              {['All 10 modules unlocked','All branches & students','JazzCash & EasyPaisa','Mobile app included','9-document PDF suite','Email support'].map(item => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />{item}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center px-6 py-3.5 rounded-xl border-2 border-blue-600 text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition-colors">Start Free Trial</Link>
          </div>
          <div className="rounded-3xl p-8 flex flex-col text-white relative shadow-2xl" style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow:'0 20px 60px rgba(37,99,235,.3)' }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-xs font-bold uppercase tracking-wide px-4 py-1 rounded-full">Most Popular</div>
            <div className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">Pro</div>
            <div className="mb-1"><span className="text-5xl font-extrabold">Rs 35</span><span className="text-blue-200 text-base"> /student /mo</span></div>
            <div className="text-blue-200 text-sm mb-7">Per branch Â· billed monthly in PKR</div>
            <ul className="space-y-3 text-sm text-blue-100 mb-8 flex-1">
              {['Unlimited students & branches','JazzCash & EasyPaisa payments','Priority support','Custom school branding','Website builder (3 themes)','Online admission portal','Dedicated onboarding call'].map(item => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckIcon className="w-4 h-4 text-amber-400 shrink-0" />{item}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold transition-colors">Start Free Trial</Link>
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
            <a href="mailto:hello@wolfstack.io" className="block text-center px-6 py-3.5 rounded-xl border-2 border-slate-600 text-white font-bold hover:bg-slate-800 transition-colors">Contact Us</a>
          </div>
        </div>
        <p className="text-center text-gray-600 text-sm mt-8">7-day trial includes full access. Upgrade to Pro after it ends. Your data stays safe either way.</p>
      </div>
    </section>
  );
}

// â”€â”€ FAQ â€” light + diagonal lines â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
              <button className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-gray-900 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

// â”€â”€ CTA â€” dark with glow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CTASection() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background:'linear-gradient(150deg,#0a0e1a 0%,#0f1628 60%,#0c1420 100%)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width:'700px', height:'400px', background:'radial-gradient(ellipse,rgba(59,130,246,.18) 0%,transparent 65%)' }} />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">Your school deserves better<br />than a paper register.</h2>
        <p className="text-xl mb-3 max-w-xl mx-auto" style={{ color:'rgba(191,219,254,.7)' }}>Start your 7-day free trial. All modules, every feature, unlocked from day one.</p>
        <p className="text-sm mb-10" style={{ color:'rgba(147,197,253,.4)' }}>5 minutes to set up. No credit card. No commitment.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="px-10 py-4 rounded-2xl font-bold text-lg text-white transition-all hover:-translate-y-0.5"
            style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow:'0 8px 32px rgba(37,99,235,.45)' }}>
            Start Your 7-Day Free Trial â†’
          </Link>
          <a href="#modules" className="px-10 py-4 rounded-2xl text-white font-semibold text-lg transition-all"
            style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)' }}>
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}

// â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            <p className="text-sm text-gray-500 leading-relaxed mb-3">Pakistan's School & College ERP SaaS. Built by WolfStack.</p>
            <div className="text-sm text-gray-600">ðŸ‡µðŸ‡° Made in Pakistan</div>
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
              {['Attendance','Fee Management','Exams & Results','Payroll','Admissions','Website Builder','Mobile App'].map(m => <li key={m}>{m}</li>)}
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
          <p>EduStack PK â€” School & College ERP for Pakistan</p>
        </div>
      </div>
    </footer>
  );
}

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      <AttendanceSection />
      <FeesSection />
      <ExamsSection />
      <TimetableSection />
      <PayrollSection />
      <AssignmentsSection />
      <NotificationsSection />
      <AdmissionsSection />
      <BeyondSection />
      <RolesSection />
      <PaymentsSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <CTASection />
      <FooterSection />
    </div>
  );
}
