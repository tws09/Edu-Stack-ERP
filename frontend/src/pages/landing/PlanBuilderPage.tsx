import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// ─── Data ────────────────────────────────────────────────────────────────────

const ADDONS = [
  { id: 'backup',     label: 'Daily Backup',                           desc: 'Daily backup of your data.',                                       rate: 500,   type: 'monthly'     as const, icon: '💾' },
  { id: 'sms',        label: 'SMS Notifications',                      desc: 'Send important updates to parents via SMS.',                       rate: 20,    type: 'per-student' as const, icon: '📲' },
  { id: 'apps',       label: 'Mobile Apps (Student, Teacher, Parent)', desc: 'EduStack branded apps for the whole community on iOS & Android.', rate: 25,    type: 'per-student' as const, icon: '📱' },
  { id: 'whitelabel', label: 'Whitelabel App Customization',           desc: 'Your branding on the App Store & Play Store.',                    rate: 45000, type: 'one-time'    as const, icon: '🏷️' },
  { id: 'biometric',  label: 'Biometric Integration',                  desc: 'ZKTeco/Hikvision devices for staff attendance & payroll.',        rate: 45000, type: 'one-time'    as const, icon: '🔐' },
] as const;

const BASE = 35;
const MIN  = 1750;
const fmt  = (n: number) => n.toLocaleString('en-PK');

type Step = 1 | 2 | 3 | 4 | 5;

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const CapSVG = ({ size = 20, color = 'white' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
  </svg>
);

const stepIcons: Record<number, (dim: boolean) => JSX.Element> = {
  1: (d) => <svg className={`w-5 h-5 ${d ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  2: (d) => <svg className={`w-5 h-5 ${d ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  3: (d) => <svg className={`w-5 h-5 ${d ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  4: (d) => <svg className={`w-5 h-5 ${d ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>,
  5: (d) => <svg className={`w-5 h-5 ${d ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322S3.087 3.01 1.5 3.75V19.5a.75.75 0 00.75.75h19.5a.75.75 0 00.75-.75V3.75c-1.587-.74-3.257-1.215-5.907-1.178A48.214 48.214 0 0012 2.25z" /></svg>,
};

const STEP_LABELS: Record<number, string> = { 1: 'INSTITUTION', 2: 'MODEL', 3: 'SCALE', 4: 'ADD-ONS', 5: 'ESTIMATE' };

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 bg-[#0d1b2a]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl px-3 py-2.5">
      {([1, 2, 3, 4, 5] as Step[]).map((s, i) => {
        const done   = s < step;
        const active = s === step;
        const future = s > step;
        return (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200
              ${active ? 'bg-[#1aa3c8]/15' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                ${active ? 'bg-white' : done ? 'bg-[#1aa3c8]' : 'bg-white/[0.05]'}`}>
                <span style={{ color: active ? '#0d1b2a' : done ? 'white' : undefined }}>
                  {stepIcons[s](future)}
                </span>
              </div>
              {active && <span className="text-xs font-bold tracking-widest text-[#1aa3c8] whitespace-nowrap">{STEP_LABELS[s]}</span>}
            </div>
            {i < 4 && (
              <div className="w-6 h-px mx-1 transition-all duration-500"
                style={{ background: s < step ? '#1aa3c8' : 'rgba(255,255,255,0.07)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Selection Card ───────────────────────────────────────────────────────────

function SelectCard({ selected, onClick, icon, title, subtitle }: {
  selected: boolean; onClick: () => void; icon: JSX.Element; title: string; subtitle: string;
}) {
  return (
    <button onClick={onClick}
      className={`group text-left w-full p-7 rounded-2xl border-2 transition-all duration-200 flex flex-col gap-5
        ${selected
          ? 'border-[#1aa3c8] bg-[#1aa3c8]/[0.07] shadow-[0_0_40px_rgba(26,163,200,0.1)]'
          : 'border-white/[0.07] bg-[#0d1b2a] hover:border-white/20'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200
        ${selected ? 'bg-[#1aa3c8]/20' : 'bg-white/[0.05] group-hover:bg-white/[0.08]'}`}>
        {icon}
      </div>
      <div>
        <div className="text-lg font-extrabold text-white mb-1.5">{title}</div>
        <div className="text-sm text-slate-400 leading-relaxed">{subtitle}</div>
      </div>
    </button>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function InstitutionStep({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
        Select your <span style={{ color: '#1aa3c8' }}>Institution Type</span>
      </h1>
      <p className="text-slate-400 mb-12 text-sm sm:text-base">
        This helps us tailor academic cycles (Years vs Semesters).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SelectCard
          selected={value === 'school'}
          onClick={() => onChange('school')}
          icon={<svg className="w-7 h-7 text-[#1aa3c8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>}
          title="K-12 School / Academy"
          subtitle="Supports Annual cycles, Grade-wise records & Parent apps."
        />
        <SelectCard
          selected={value === 'university'}
          onClick={() => onChange('university')}
          icon={<svg className="w-7 h-7 text-[#1aa3c8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>}
          title="University / College"
          subtitle="Semester-based control, Degree tracks & Subject attendance."
        />
      </div>
    </div>
  );
}

function ModelStep({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
        Select your <span style={{ color: '#1aa3c8' }}>Campus Model</span>
      </h1>
      <p className="text-slate-400 mb-12 text-sm sm:text-base">
        This determines your administrative structure and dashboard access.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SelectCard
          selected={value === 'single'}
          onClick={() => onChange('single')}
          icon={<svg className="w-7 h-7 text-[#1aa3c8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>}
          title="Single Campus"
          subtitle="One location, unified management & simplified reporting."
        />
        <SelectCard
          selected={value === 'multi'}
          onClick={() => onChange('multi')}
          icon={<svg className="w-7 h-7 text-[#1aa3c8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 9.75v10.125c0 .621-.504 1.125-1.125 1.125" /></svg>}
          title="Multi-Campus / Chain"
          subtitle="Multiple branches with Group Admin dashboard & cross-campus analytics."
        />
      </div>
    </div>
  );
}

function ScaleStep({ students, onChange }: { students: number; onChange: (v: number) => void }) {
  const monthly = Math.max(students * BASE, MIN);
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Institutional Scale</h1>
      <p className="text-slate-400 mb-10 text-sm sm:text-base">Slide to select your total active student enrollment.</p>
      <div className="bg-[#0d1b2a] border border-white/[0.07] rounded-2xl p-8 text-left">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#1aa3c8] mb-2">TOTAL ENROLLMENT</p>
            <p className="text-6xl font-black text-white leading-none">{students}</p>
          </div>
          <svg className="w-12 h-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <input type="range" min={50} max={5000} step={50} value={students}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full cursor-pointer mb-3" style={{ accentColor: '#1aa3c8' }} />
        <div className="flex justify-between text-xs text-slate-600 mb-6">
          <span>MIN (50)</span><span>MAX (5000+)</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-[#0a1424] border border-white/[0.06] px-5 py-3.5">
          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Active Price Tier</span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg border text-[#1aa3c8] border-[#1aa3c8]/30 bg-[#1aa3c8]/10">
            {students <= 500 ? '50 – 500' : students <= 1000 ? '501 – 1,000' : '1,000+'} (RS. {BASE}/STUDENT)
          </span>
        </div>
        <div className="mt-4 flex justify-between items-center pt-4 border-t border-white/[0.05]">
          <span className="text-sm text-slate-500">Estimated monthly base</span>
          <span className="text-lg font-extrabold text-white">Rs. {fmt(monthly)}<span className="text-slate-500 font-normal text-sm">/mo</span></span>
        </div>
      </div>
    </div>
  );
}

function AddonsStep({ students, selected, toggle }: {
  students: number; selected: Set<string>; toggle: (id: string) => void;
}) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Enhance your Ecosystem</h1>
        <p className="text-slate-400 text-sm sm:text-base">Optional modules to further automate your institution.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ADDONS.map(a => {
          const on = selected.has(a.id);
          const isOnce = a.type === 'one-time';
          const rateLabel = a.type === 'per-student'
            ? `Rs. ${a.rate} /student`
            : isOnce
              ? `Rs. ${fmt(a.rate)} once`
              : `Rs. ${fmt(a.rate)} /mo`;
          return (
            <button key={a.id} onClick={() => toggle(a.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col
                ${on
                  ? 'border-[#f0a520] bg-[#f0a520]/[0.06] shadow-[0_0_30px_rgba(240,165,32,0.07)]'
                  : 'border-white/[0.07] bg-[#0d1b2a] hover:border-white/20'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all
                  ${on ? 'bg-[#f0a520]/20' : 'bg-white/[0.05]'}`}>
                  {a.icon}
                </div>
                <span className="font-bold text-white text-sm leading-snug">{a.label}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">{a.desc}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase mb-0.5">Rate</p>
                  <p className={`text-sm font-extrabold ${on ? 'text-[#f0a520]' : 'text-white'}`}>
                    {rateLabel}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all
                  ${on
                    ? 'bg-[#f0a520] text-[#0d1b2a]'
                    : 'bg-white/[0.05] text-slate-500 border border-white/[0.08]'}`}>
                  {on ? 'ADDED' : 'SELECT'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Estimate Step ────────────────────────────────────────────────────────────

function EstimateStep({
  estimateId, institutionType, campusModel, students, selected,
  totalMonthly, totalOneTime,
  onRestart,
}: {
  estimateId: string;
  institutionType: string;
  campusModel: string;
  students: number;
  selected: Set<string>;
  totalMonthly: number;
  totalOneTime: number;
  onRestart: () => void;
}) {
  const [showContact, setShowContact] = useState(false);
  const [contactDone, setContactDone] = useState(false);
  const [cf, setCf] = useState({ name: '', institution: '', email: '', message: '' });
  const [showPdf, setShowPdf] = useState(false);
  const [pdfSent, setPdfSent] = useState(false);
  const [pf, setPf] = useState({ institution: '', name: '', email: '', phone: '' });
  const canDownload = !!(pf.email.trim() || pf.phone.trim());

  const inp = 'w-full rounded-xl border border-slate-700 bg-slate-800 text-white text-sm px-4 py-3 placeholder-slate-500 focus:outline-none focus:border-[#1aa3c8] transition-colors';

  const pickedAddons = ADDONS.filter(a => selected.has(a.id));

  function downloadEstimate() {
    const date = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
    const instLabel = institutionType === 'school' ? 'K-12 School / Academy' : 'University / College';
    const modelLabel = campusModel === 'single' ? 'Single Campus' : 'Multi-Campus';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>EduStack PK — Investment Proposal</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#0d1b2a}
.page{max-width:780px;margin:0 auto;padding:44px 40px 0}

/* header */
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:22px;border-bottom:2px solid #e8edf2;margin-bottom:28px}
.logo-row{display:flex;align-items:center;gap:14px}
.logo-box{width:54px;height:54px;background:#1aa3c8;border-radius:14px;display:flex;align-items:center;justify-content:center}
.brand{font-size:21px;font-weight:900;color:#0d1b2a;letter-spacing:-0.3px}
.brand-sub{font-size:9px;font-weight:800;color:#1aa3c8;letter-spacing:2.5px;text-transform:uppercase;margin-top:3px}
.doc-title{text-align:right}
.doc-title h2{font-size:19px;font-weight:900;color:#0d1b2a}
.doc-title p{font-size:11px;color:#7a8fa6;margin-top:3px}

/* info grid */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:30px}
.info-box{border:1px solid #dce3eb;border-radius:10px;padding:18px 22px}
.info-lbl{font-size:8.5px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#7a8fa6;margin-bottom:9px}
.info-title{font-size:17px;font-weight:900;color:#0d1b2a;margin-bottom:3px}
.info-sub{font-size:11.5px;color:#4a6077;margin-bottom:2px}
.info-meta{font-size:10.5px;color:#7a8fa6;margin-top:3px}

/* table */
.tbl-head{display:grid;grid-template-columns:1fr 140px 130px;gap:12px;padding:10px 0;border-bottom:2px solid #0d1b2a;margin-bottom:0}
.tbl-head span{font-size:8.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#0d1b2a}
.tbl-head span:nth-child(2){text-align:center}
.tbl-head span:last-child{text-align:right}
.line{display:grid;grid-template-columns:1fr 140px 130px;gap:12px;padding:18px 0;border-bottom:1px solid #f0f4f8;align-items:center}
.line-name{font-size:13.5px;font-weight:800;color:#0d1b2a}
.line-desc{font-size:10.5px;color:#7a8fa6;margin-top:2px}
.line-type{text-align:center;font-size:10.5px;color:#4a6077}
.line-amt{text-align:right;font-size:15px;font-weight:900;color:#0d1b2a}

/* summary */
.sum-wrap{display:grid;grid-template-columns:1fr 1fr;gap:0;margin-top:22px}
.sum-box{background:#0d1b2a;border-radius:14px;padding:26px 30px}
.sum-lbl{font-size:8.5px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#4a6077;margin-bottom:7px}
.sum-monthly{font-size:34px;font-weight:900;color:#1aa3c8;margin-bottom:2px}
.sum-sub{font-size:8.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#2a4560;margin-bottom:18px}
.sum-divider{border:none;border-top:1px solid rgba(255,255,255,0.08);margin:14px 0}
.sum-once{font-size:26px;font-weight:900;color:#ffffff;margin-bottom:2px}

/* next steps */
.next{margin-top:28px}
.next-title{font-size:12.5px;font-weight:900;color:#0d1b2a;margin-bottom:14px}
.next-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px}
.next-lbl{font-size:8.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#7a8fa6;margin-bottom:7px}
.next-val{font-size:12.5px;font-weight:700;color:#1aa3c8}
.next-sub{font-size:10.5px;color:#7a8fa6;margin-top:2px}

/* disclaimer */
.disc{margin-top:22px;font-size:9.5px;color:#a0afbf;line-height:1.65}

/* footer */
.footer{background:#0d1b2a;margin:28px -40px 0;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;position:relative;overflow:hidden}
.footer-deco{position:absolute;bottom:0;left:0;width:110px;height:55px;background:linear-gradient(135deg,#1aa3c8 0%,transparent 65%);opacity:.35;border-radius:0 55px 0 0}
.footer-brand{font-size:13px;font-weight:900;color:#fff}
.footer-web{font-size:10px;color:#4a6077;margin-top:1px}
.footer-phone{font-size:11px;color:#4a6077}

@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:24px 28px 0}}
</style></head><body>
<div class="page">
<div class="hdr">
  <div class="logo-row">
    <div class="logo-box">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
    </div>
    <div>
      <div class="brand">EDUSTACK PK</div>
      <div class="brand-sub">Academic Infrastructure</div>
    </div>
  </div>
  <div class="doc-title">
    <h2>Investment Proposal</h2>
    <p>Dated: ${date}</p>
  </div>
</div>

<div class="info-grid">
  <div class="info-box">
    <div class="info-lbl">Institution Details</div>
    <div class="info-title">${pf.institution || 'Your Institution'}</div>
    <div class="info-sub">Attn: ${pf.name || '—'}</div>
    <div class="info-meta">${students} Enrolled Students · ${instLabel}</div>
    <div class="info-meta">${modelLabel} · ${pf.email || pf.phone || ''}</div>
  </div>
  <div class="info-box">
    <div class="info-lbl">System Architecture</div>
    <div class="info-title">Online Ecosystem</div>
    <div class="info-sub">Active Cloud Subscription</div>
    <div class="info-meta">EduStack PK Pro Plan · ${modelLabel}</div>
  </div>
</div>

<div class="tbl-head">
  <span>Line Calculations &amp; Description</span>
  <span>Type</span>
  <span>Amount (PKR)</span>
</div>

<div class="line">
  <div>
    <div class="line-name">Base Online Core Platform</div>
    <div class="line-desc">PKR ${BASE}/student × ${students} students${students * BASE < MIN ? ' (minimum applies)' : ''}</div>
  </div>
  <div class="line-type">Per Student/Mo</div>
  <div class="line-amt">Rs. ${fmt(Math.max(students * BASE, MIN))}</div>
</div>

${pickedAddons.filter(a => a.type !== 'one-time').map(a => `
<div class="line">
  <div>
    <div class="line-name">&#10003; ${a.label}</div>
    <div class="line-desc">${a.type === 'per-student' ? `PKR ${a.rate}/student × ${students} students` : 'Flat monthly fee'}</div>
  </div>
  <div class="line-type">${a.type === 'per-student' ? 'Per Student/Mo' : 'Monthly Fee'}</div>
  <div class="line-amt">Rs. ${fmt(a.type === 'per-student' ? a.rate * students : a.rate)}</div>
</div>`).join('')}

${pickedAddons.filter(a => a.type === 'one-time').map(a => `
<div class="line">
  <div>
    <div class="line-name">&#10003; ${a.label}</div>
    <div class="line-desc">One-time setup fee (PKR ${fmt(a.rate)})</div>
  </div>
  <div class="line-type">One-time Fee</div>
  <div class="line-amt">Rs. ${fmt(a.rate)}</div>
</div>`).join('')}

<div class="sum-wrap">
  <div></div>
  <div class="sum-box">
    <div class="sum-lbl">Monthly Subscription</div>
    <div class="sum-monthly">Rs. ${fmt(totalMonthly)}</div>
    <div class="sum-sub">Recurring Investment</div>
    ${totalOneTime > 0 ? `
    <hr class="sum-divider">
    <div class="sum-lbl">One-Time Implementation</div>
    <div class="sum-once">Rs. ${fmt(totalOneTime)}</div>
    <div class="sum-sub">One-Time Setup Investment</div>` : ''}
  </div>
</div>

<div class="next">
  <div class="next-title">Next Steps &amp; Verification</div>
  <div class="next-grid">
    <div>
      <div class="next-lbl">Sales &amp; Engagements</div>
      <div class="next-val">hello@wolfstack.io</div>
      <div class="next-sub">+92 326 5744095</div>
    </div>
    <div>
      <div class="next-lbl">Proposal Status</div>
      <div class="next-val">Official Estimate</div>
      <div class="next-sub">Valid for 30 Days</div>
    </div>
    <div>
      <div class="next-lbl">EduStack Platform</div>
      <div class="next-val">edu.tws.enterprises</div>
      <div class="next-sub">Estimate ID: ${estimateId}</div>
    </div>
  </div>
</div>

<div class="disc">* This is an official system-generated estimate based on the selected campus scale parameters. Final contracts are subject to detailed institutional audits and service SLAs. Estimates exclude transaction gateway fees and external telecom utility charges.</div>
</div>

<div class="footer">
  <div class="footer-deco"></div>
  <div class="logo-row">
    <div class="logo-box" style="width:38px;height:38px;border-radius:10px">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
    </div>
    <div>
      <div class="footer-brand">EduStack PK</div>
      <div class="footer-web">edu.tws.enterprises</div>
    </div>
  </div>
  <div class="footer-phone">&#128222; +92 326 5744095</div>
</div>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 350); }
  }

  const instLabel = institutionType === 'school' ? 'K-12 School / Academy' : 'University / College';
  const modelLabel = campusModel === 'single' ? 'Single Campus' : 'Multi-Campus';

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* heading */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1aa3c8]/20 text-[#1aa3c8] tracking-wider">PROPOSAL GENERATED</span>
            <span className="text-xs text-slate-500">ESTIMATE ID: {estimateId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Institutional{' '}
            <span style={{ color: '#f0a520' }}>Investment Summary</span>
          </h1>
        </div>
        <div className="shrink-0 px-4 py-2 rounded-xl border border-white/10 text-xs font-bold tracking-widest text-slate-400 self-start">
          OFFICIAL PROJECTION
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* left column */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* system profile */}
          <div className="bg-[#0d1b2a] border border-white/[0.07] rounded-2xl p-6">
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-5">System Profile</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'TYPE', value: instLabel.split('/')[0].trim() },
                { label: 'STUDENTS', value: students.toString() },
                { label: 'MODEL', value: modelLabel.split(' ')[0] },
              ].map(item => (
                <div key={item.label} className="bg-[#0a1424] rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold tracking-widest text-slate-600 mb-2">{item.label}</p>
                  <p className={`text-base font-extrabold ${item.label === 'MODEL' ? 'text-[#1aa3c8]' : 'text-white'}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* selected add-ons */}
          {pickedAddons.length > 0 && (
            <div className="bg-[#0d1b2a] border border-white/[0.07] rounded-2xl p-6">
              <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-5">Selected Ecosystem Add-Ons</p>
              <div className="grid grid-cols-2 gap-2">
                {pickedAddons.map(a => (
                  <div key={a.id} className="bg-[#0a1424] rounded-xl px-4 py-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-white leading-snug">{a.label}</p>
                      <p className="text-[10px] text-slate-600 uppercase tracking-wide mt-0.5">
                        {a.type === 'one-time' ? 'ONE-TIME' : a.type === 'per-student' ? `RS. ${a.rate}/STUD.` : `RS. ${fmt(a.rate)}/MO`}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#f0a520] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* complimentary */}
          <div className="bg-[#0d1b2a] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-[#f0a520]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Standard Support Package</p>
            </div>
            <p className="text-xs text-slate-600 mb-4">Complimentary Inclusions</p>
            <div className="grid grid-cols-2 gap-2">
              {['Dedicated Onboarding Call','7-Day Full Trial Included','JazzCash & EasyPaisa Ready','Free Staff Training Session'].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                  <svg className="w-3.5 h-3.5 text-[#1aa3c8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {totalOneTime > 0 && (
            <div className="bg-[#0d1b2a] border border-white/[0.07] rounded-2xl p-6">
              <p className="text-[10px] font-bold tracking-widest text-[#f0a520] mb-2">ONE-TIME SETUP</p>
              <p className="text-xs text-slate-600 uppercase tracking-wide mb-4">Implementation, Training &amp; Deployment</p>
              <p className="text-slate-500 text-xs mb-1">PKR</p>
              <p className="text-4xl font-black text-white">{fmt(totalOneTime)} <span className="text-slate-500 text-base font-normal">once</span></p>
            </div>
          )}

          <div className="bg-[#0d1b2a] border border-white/[0.07] rounded-2xl p-6">
            <p className="text-[10px] font-bold tracking-widest text-[#1aa3c8] mb-2">MONTHLY SAAS</p>
            <p className="text-xs text-slate-600 uppercase tracking-wide mb-4">Cloud Ecosystem, Portal &amp; Updates</p>
            <p className="text-slate-500 text-xs mb-1">PKR</p>
            <p className="text-4xl font-black text-white">{fmt(totalMonthly)} <span className="text-slate-500 text-base font-normal">/ month</span></p>
          </div>

          <div className="bg-[#0d1b2a]/50 border border-white/[0.05] rounded-2xl p-5 flex items-start gap-3">
            <svg className="w-4 h-4 text-[#1aa3c8] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            <p className="text-xs text-slate-500 leading-relaxed">This estimate represents a direct operational projection tailored specifically for your campus. Final legal contracts may include SLA guarantees and custom support schedules.</p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button onClick={() => setShowContact(true)}
          className="flex-1 py-4 rounded-2xl font-bold text-base text-[#0d1b2a] flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, #1aa3c8, #0e8caf)', boxShadow: '0 8px 30px rgba(26,163,200,0.3)' }}>
          Secure This Rate Now →
        </button>
        <button onClick={() => { setShowPdf(true); setPdfSent(false); }}
          className="px-8 py-4 rounded-2xl font-bold text-sm text-white border border-white/10 hover:bg-white/5 transition-colors">
          DOWNLOAD PDF
        </button>
        <button onClick={onRestart}
          className="px-8 py-4 rounded-2xl font-bold text-sm text-slate-500 border border-white/[0.07] hover:text-white hover:border-white/20 transition-colors">
          RESTART
        </button>
      </div>

      {/* Contact modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto" onClick={() => setShowContact(false)}>
          <div className="relative w-full max-w-md bg-[#0d1b2a] border border-white/10 rounded-3xl p-8 shadow-2xl my-8" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowContact(false)} className="absolute top-5 right-5 text-slate-500 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            {!contactDone ? (
              <>
                <p className="text-xs font-bold tracking-widest text-[#1aa3c8] mb-1">YOUR INVESTMENT SUMMARY</p>
                <h3 className="text-xl font-extrabold text-white mb-1">Secure This Rate</h3>
                <p className="text-slate-500 text-sm mb-6">We'll reach out within one business day to finalise your plan.</p>
                <div className="space-y-4">
                  <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Full Name</label><input className={inp} placeholder="Your name" value={cf.name} onChange={e => setCf(p => ({...p, name: e.target.value}))} /></div>
                  <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Institution Name</label><input className={inp} placeholder="e.g. Beacon House, NUST" value={cf.institution} onChange={e => setCf(p => ({...p, institution: e.target.value}))} /></div>
                  <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Work Email</label><input className={inp} type="email" placeholder="you@school.edu.pk" value={cf.email} onChange={e => setCf(p => ({...p, email: e.target.value}))} /></div>
                  <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">How can we help?</label><textarea className={`${inp} resize-none`} rows={3} placeholder="Timeline, current system, specific requirements…" value={cf.message} onChange={e => setCf(p => ({...p, message: e.target.value}))} /></div>
                  <div className="bg-[#0a1424] rounded-xl p-4 flex justify-between text-sm">
                    <span className="text-slate-500">Your quote</span>
                    <span className="text-white font-bold">Rs. {fmt(totalMonthly)}/mo{totalOneTime > 0 ? ` + Rs. ${fmt(totalOneTime)} once` : ''}</span>
                  </div>
                  <button onClick={() => setContactDone(true)} disabled={!cf.name.trim() || !cf.email.trim()}
                    className="w-full py-3.5 rounded-xl font-bold text-[#0d1b2a] text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #1aa3c8, #0e8caf)' }}>
                    Submit Request →
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#1aa3c8]/15 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-[#1aa3c8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2">Request Received!</h3>
                <p className="text-slate-400 text-sm mb-6">Thanks, <strong className="text-white">{cf.name}</strong>. We'll reply to <strong className="text-white">{cf.email}</strong> within one business day.</p>
                <button onClick={() => setShowContact(false)} className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-semibold transition-colors">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF modal */}
      {showPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto" onClick={() => setShowPdf(false)}>
          <div className="relative w-full max-w-md bg-[#0d1b2a] border border-white/10 rounded-3xl p-8 shadow-2xl my-8" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPdf(false)} className="absolute top-5 right-5 text-slate-500 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="w-12 h-12 rounded-2xl bg-[#1aa3c8]/15 flex items-center justify-center mb-5"><svg className="w-6 h-6 text-[#1aa3c8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
            <h3 className="text-xl font-extrabold text-white mb-1">Final Step</h3>
            <p className="text-slate-400 text-sm mb-6">Tell us where to send your official estimate.</p>
            <div className="space-y-4">
              <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Institution Name</label><input className={inp} placeholder="Springfield Academy" value={pf.institution} onChange={e => setPf(p => ({...p, institution: e.target.value}))} /></div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Your Name</label><input className={inp} placeholder="Your name" value={pf.name} onChange={e => setPf(p => ({...p, name: e.target.value}))} /></div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Email Address</label><input className={inp} type="email" placeholder="you@school.edu.pk" value={pf.email} onChange={e => setPf(p => ({...p, email: e.target.value}))} /></div>
              <div><label className="text-xs font-semibold text-slate-400 block mb-1.5">Phone Number</label><input className={inp} type="tel" placeholder="0326-5744095" value={pf.phone} onChange={e => setPf(p => ({...p, phone: e.target.value}))} /></div>
              <p className="text-xs text-slate-600">* Please provide at least an email or phone number to unlock the PDF.</p>
              <button onClick={() => { if (canDownload) { downloadEstimate(); setPdfSent(true); } }}
                disabled={!canDownload}
                className="w-full py-3.5 rounded-xl font-bold text-[#0d1b2a] text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: canDownload ? 'linear-gradient(135deg, #1aa3c8, #0e8caf)' : undefined }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Unlock &amp; Download Estimate
              </button>
              {pdfSent && <p className="text-center text-[#1aa3c8] text-xs font-medium">PDF opened — use your browser's print dialog to save as PDF.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlanBuilderPage() {
  const estimateId = useRef('EPK-' + Math.floor(1000 + Math.random() * 9000)).current;

  const [step, setStep]                   = useState<Step>(1);
  const [institutionType, setType]        = useState<string | null>(null);
  const [campusModel, setModel]           = useState<string | null>(null);
  const [students, setStudents]           = useState(150);
  const [selected, setSelected]           = useState<Set<string>>(new Set());

  const BASE_CALC = 35;
  const MIN_CALC  = 1750;
  const baseMonthly = Math.max(students * BASE_CALC, MIN_CALC);
  let addMonthly = 0, addOneTime = 0;
  for (const id of selected) {
    const a = ADDONS.find(x => x.id === id);
    if (!a) continue;
    if (a.type === 'monthly')     addMonthly += a.rate;
    if (a.type === 'per-student') addMonthly += a.rate * students;
    if (a.type === 'one-time')    addOneTime += a.rate;
  }

  const canNext =
    (step === 1 && institutionType !== null) ||
    (step === 2 && campusModel !== null) ||
    step >= 3;

  const next = () => setStep(s => Math.min(s + 1, 5) as Step);
  const back = () => setStep(s => Math.max(s - 1, 1) as Step);

  const toggleAddon = (id: string) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const restart = () => {
    setStep(1); setType(null); setModel(null);
    setStudents(150); setSelected(new Set());
  };

  const isEstimate = step === 5;

  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden"
      style={{ background: '#070d1f' }}>

      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #1aa3c8 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #1aa3c8 0%, transparent 70%)' }} />
      </div>

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4">
        <Link to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold text-slate-400 hover:text-white hover:border-white/20 transition-colors bg-[#0d1b2a]/50 backdrop-blur-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg>
          Go to Home
        </Link>

        <ProgressBar step={step} />

        <div className="w-32" /> {/* spacer */}
      </div>

      {/* step 1 big title (only on first step) */}
      {step === 1 && (
        <div className="relative z-10 text-center pt-6 pb-2 px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Let's build your <span style={{ color: '#f0a520' }}>plan.</span>
          </h1>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            A few quick questions to understand your institution's specific needs.
          </p>
        </div>
      )}

      {/* main content */}
      <div className={`relative z-10 flex-1 flex items-${isEstimate ? 'start' : 'center'} justify-center px-4 py-10`}>
        {step === 1 && <InstitutionStep value={institutionType} onChange={v => { setType(v); }} />}
        {step === 2 && <ModelStep value={campusModel} onChange={v => { setModel(v); }} />}
        {step === 3 && <ScaleStep students={students} onChange={setStudents} />}
        {step === 4 && <AddonsStep students={students} selected={selected} toggle={toggleAddon} />}
        {step === 5 && (
          <EstimateStep
            estimateId={estimateId}
            institutionType={institutionType ?? 'school'}
            campusModel={campusModel ?? 'single'}
            students={students}
            selected={selected}
            totalMonthly={baseMonthly + addMonthly}
            totalOneTime={addOneTime}
            onRestart={restart}
          />
        )}
      </div>

      {/* bottom navigation (hidden on estimate step) */}
      {!isEstimate && (
        <div className="relative z-10 flex items-center justify-between px-6 py-5 border-t border-white/[0.05]">
          {step > 1
            ? <button onClick={back} className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors font-semibold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                Go back
              </button>
            : <div />
          }
          <p className="text-xs text-slate-700 font-bold tracking-widest uppercase hidden sm:block">
            EduStack PK · Built for Pakistan
          </p>
          <button onClick={next} disabled={!canNext}
            className={`flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all
              ${step === 4
                ? 'text-[#0d1b2a]'
                : 'text-[#0d1b2a]'}
              ${canNext ? 'opacity-100 hover:scale-[1.02]' : 'opacity-30 cursor-not-allowed'}`}
            style={canNext ? { background: step === 4 ? '#f0a520' : 'linear-gradient(135deg, #1aa3c8, #0e8caf)' } : { background: '#1aa3c8' }}>
            {step === 4 ? (
              <>Final Calculation <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18z" /></svg></>
            ) : (
              <>Next Step <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg></>
            )}
          </button>
        </div>
      )}

      {/* brand footer on estimate */}
      {isEstimate && (
        <div className="relative z-10 text-center py-4 border-t border-white/[0.05]">
          <p className="text-xs text-slate-700 font-bold tracking-widest uppercase">EduStack PK · Built for Pakistan</p>
        </div>
      )}
    </div>
  );
}
