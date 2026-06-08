import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '../../services/academicService';
import type { AcademicYear, ClassDoc, SectionDoc, SubjectDoc } from '../../services/academicService';
import {
  Calendar, Building2, LayoutGrid, GraduationCap,
  Plus, Check, Lock, ChevronRight, ArrowLeft, Sparkles, X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const CLASS_LEVELS = [
  { value: 'grade_9', label: 'Grade 9' },
  { value: 'grade_10', label: 'Grade 10' },
  { value: 'grade_11', label: 'Grade 11' },
  { value: 'grade_12', label: 'Grade 12' },
  { value: 'inter_1', label: 'Intermediate Part I' },
  { value: 'inter_2', label: 'Intermediate Part II' },
];

const STEPS = [
  {
    label: 'Foundation', subtitle: 'Academic Year', Icon: Calendar,
    gradient: 'from-amber-400 to-orange-500',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    ring: 'ring-amber-300 dark:ring-amber-700',
    btnClass: 'from-amber-400 to-orange-500',
    focusRing: 'focus:ring-amber-400',
    desc: 'Every school runs on a calendar year. Set your start and end — this is the foundation everything else is built on.',
  },
  {
    label: 'Walls & Floors', subtitle: 'Classes', Icon: Building2,
    gradient: 'from-blue-500 to-indigo-600',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    ring: 'ring-blue-300 dark:ring-blue-700',
    btnClass: 'from-blue-500 to-indigo-600',
    focusRing: 'focus:ring-blue-400',
    desc: 'Build the structure. Add the classes — Grade 9, Grade 10, Intermediate. These are the floors of your school.',
  },
  {
    label: 'Rooms', subtitle: 'Sections', Icon: LayoutGrid,
    gradient: 'from-violet-500 to-purple-600',
    text: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
    ring: 'ring-violet-300 dark:ring-violet-700',
    btnClass: 'from-violet-500 to-purple-600',
    focusRing: 'focus:ring-violet-400',
    desc: 'Divide the floors into rooms. Split each class into sections — A, B, Science, Arts. Students find their home here.',
  },
  {
    label: 'Curriculum', subtitle: 'Subjects', Icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-600',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    ring: 'ring-emerald-300 dark:ring-emerald-700',
    btnClass: 'from-emerald-500 to-teal-600',
    focusRing: 'focus:ring-emerald-400',
    desc: 'Load the curriculum. Add all subjects — Mathematics, Physics, Urdu, and everything else that will be taught.',
  },
];

type WizardProps = {
  years: AcademicYear[];
  classes: ClassDoc[];
  sections: SectionDoc[];
  subjects: SubjectDoc[];
  onExit: () => void;
};

// ─── School Building Illustration ─────────────────────────────────────────────

function SchoolBuilding({ activeStep, doneSteps }: { activeStep: number; doneSteps: number[] }) {
  const done = (s: number) => doneSteps.includes(s);
  const active = (s: number) => activeStep === s;
  const op = (s: number) => done(s) ? 1 : active(s) ? 0.95 : activeStep > s ? 0.55 : 0.14;

  const pulse = {
    animate: { opacity: [0, 0.14, 0] as number[] },
    transition: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' as const },
  };

  return (
    <div className="relative px-2">
      <svg viewBox="0 0 160 178" className="w-full drop-shadow-sm">
        {/* ── Roof / Step 3 ── */}
        <motion.g animate={{ opacity: op(3), y: done(3) || active(3) ? 0 : -6 }} transition={{ duration: 0.5, type: 'spring', stiffness: 180 }}>
          <polygon points="80,8 148,64 12,64" fill={done(3) ? '#10b981' : active(3) ? '#34d399' : '#d1d5db'} />
          <polygon points="80,8 148,64 12,64" fill="none" stroke={done(3) ? '#059669' : active(3) ? '#10b981' : '#9ca3af'} strokeWidth="1.5" />
          {/* Shine */}
          {(done(3) || active(3)) && <polygon points="80,12 118,46 80,46" fill="white" opacity="0.1" />}
          {/* Flag pole */}
          <line x1="80" y1="1" x2="80" y2="11" stroke={done(3) || active(3) ? '#065f46' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" />
          {/* Flag */}
          <motion.polygon
            points="80,1 95,5 80,10"
            fill={done(3) ? '#059669' : active(3) ? '#34d399' : '#9ca3af'}
            animate={active(3) ? { scaleX: [1, 1.12, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          />
          {active(3) && <motion.polygon points="80,8 148,64 12,64" fill="#10b981" {...pulse} />}
        </motion.g>

        {/* ── Upper Floor / Step 2 ── */}
        <motion.g animate={{ opacity: op(2) }} transition={{ duration: 0.45 }}>
          <rect x="12" y="64" width="136" height="44" fill={done(2) ? '#ede9fe' : active(2) ? '#f3e8ff' : '#f9fafb'} stroke={done(2) ? '#7c3aed' : active(2) ? '#a78bfa' : '#d1d5db'} strokeWidth="1.5" />
          {[22, 71, 120].map((x, i) => (
            <g key={i}>
              <rect x={x} y="74" width="24" height="20" rx="2" fill={done(2) ? '#7c3aed' : active(2) ? '#a78bfa' : '#e5e7eb'} opacity={done(2) || active(2) ? 0.75 : 0.5} />
              <line x1={x + 12} y1="74" x2={x + 12} y2="94" stroke="white" strokeWidth="1.5" opacity="0.6" />
              <line x1={x} y1="84" x2={x + 24} y2="84" stroke="white" strokeWidth="1.5" opacity="0.6" />
            </g>
          ))}
          {active(2) && <motion.rect x="12" y="64" width="136" height="44" fill="#7c3aed" {...pulse} />}
        </motion.g>

        {/* ── Ground Floor / Step 1 ── */}
        <motion.g animate={{ opacity: op(1) }} transition={{ duration: 0.45 }}>
          <rect x="12" y="108" width="136" height="44" fill={done(1) ? '#dbeafe' : active(1) ? '#eff6ff' : '#f9fafb'} stroke={done(1) ? '#3b82f6' : active(1) ? '#60a5fa' : '#d1d5db'} strokeWidth="1.5" />
          {/* Side windows */}
          {[22, 118].map((x, i) => (
            <g key={i}>
              <rect x={x} y="117" width="24" height="20" rx="2" fill={done(1) ? '#3b82f6' : active(1) ? '#60a5fa' : '#e5e7eb'} opacity={done(1) || active(1) ? 0.75 : 0.5} />
              <line x1={x + 12} y1="117" x2={x + 12} y2="137" stroke="white" strokeWidth="1.5" opacity="0.6" />
              <line x1={x} y1="127" x2={x + 24} y2="127" stroke="white" strokeWidth="1.5" opacity="0.6" />
            </g>
          ))}
          {/* Door */}
          <rect x="64" y="118" width="32" height="34" rx="3" fill={done(1) ? '#1d4ed8' : active(1) ? '#3b82f6' : '#9ca3af'} />
          <path d="M64,121 Q80,111 96,121" fill={done(1) ? '#1d4ed8' : active(1) ? '#3b82f6' : '#9ca3af'} />
          <circle cx="92" cy="135" r="2.5" fill={done(1) ? '#bfdbfe' : active(1) ? '#93c5fd' : '#e5e7eb'} />
          {active(1) && <motion.rect x="12" y="108" width="136" height="44" fill="#3b82f6" {...pulse} />}
        </motion.g>

        {/* ── Foundation / Step 0 ── */}
        <motion.g animate={{ opacity: op(0), y: done(0) || active(0) ? 0 : 4 }} transition={{ duration: 0.5, type: 'spring' }}>
          <rect x="6" y="152" width="148" height="16" rx="3" fill={done(0) ? '#f59e0b' : active(0) ? '#fbbf24' : '#9ca3af'} />
          {/* Brick pattern */}
          {[30, 60, 90, 120].map(x => (
            <line key={x} x1={x} y1="152" x2={x} y2="168" stroke={done(0) || active(0) ? '#92400e' : '#4b5563'} strokeWidth="1" opacity="0.2" />
          ))}
          <rect x="0" y="167" width="160" height="8" rx="2" fill={done(0) ? '#d97706' : active(0) ? '#f59e0b' : '#6b7280'} />
          {active(0) && <motion.rect x="6" y="152" width="148" height="23" rx="3" fill="#f59e0b" {...pulse} />}
        </motion.g>

        {/* ── Ground ── */}
        <rect x="0" y="174" width="160" height="4" fill="#9ca3af" opacity="0.25" rx="1" />

        {/* ── Completion sparkles ── */}
        <AnimatePresence>
          {doneSteps.length === 4 && (
            <>
              {[{ x: 8, y: 20 }, { x: 138, y: 14 }, { x: 150, y: 82 }].map((p, i) => (
                <motion.text key={i} x={p.x} y={p.y} fontSize="11"
                  initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 300 }}>
                  ✨
                </motion.text>
              ))}
            </>
          )}
        </AnimatePresence>
      </svg>

      <div className="text-center mt-3">
        <span className={cn('text-xs font-semibold px-3 py-1 rounded-full', STEPS[activeStep].bg, STEPS[activeStep].text)}>
          {doneSteps.length === 4 ? '🏫 School Ready!' : `Building: ${STEPS[activeStep].subtitle}`}
        </span>
      </div>
    </div>
  );
}

// ─── Reusable field ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const inputCls = (focusRing: string) =>
  `w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 ${focusRing} transition-shadow`;

// ─── Step 0: Foundation (Academic Year) ───────────────────────────────────────

function FoundationStep({ years, onNext }: { years: AcademicYear[]; onNext: () => void }) {
  const qc = useQueryClient();
  const s = STEPS[0];
  const [showForm, setShowForm] = useState(years.length === 0);
  const [form, setForm] = useState({ label: '', startDate: '', endDate: '', isCurrent: true });

  const create = useMutation({
    mutationFn: academicService.createYear,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['years'] }); setForm({ label: '', startDate: '', endDate: '', isCurrent: false }); setShowForm(false); },
  });

  return (
    <div className="space-y-5">
      <StepHeader step={s} title="Lay the Foundation" index={0} count={years.length} unit="year" />

      {years.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence>
            {years.map((y, i) => (
              <motion.div key={y._id}
                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 22 }}
                className={cn('bg-white dark:bg-slate-800 rounded-xl p-4 border shadow-sm', s.border)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{y.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(y.startDate).toLocaleDateString()} – {new Date(y.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {y.isCurrent && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold shrink-0', s.bg, s.text)}>Current</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!showForm && (
            <motion.button onClick={() => setShowForm(true)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className={cn('border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-2 transition-colors', s.border, s.text, 'hover:' + s.bg)}>
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add another year</span>
            </motion.button>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.28 }}
            className={cn('bg-white dark:bg-slate-800 rounded-xl p-5 border shadow-sm overflow-hidden', s.border)}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                {years.length === 0 ? 'Create your first academic year' : 'Add another academic year'}
              </p>
              {years.length > 0 && (
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              )}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
              <Field label="Year Label"><input className={inputCls(s.focusRing)} placeholder="e.g. 2025-26" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date"><input type="date" className={inputCls(s.focusRing)} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required /></Field>
                <Field label="End Date"><input type="date" className={inputCls(s.focusRing)} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required /></Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer select-none">
                <input type="checkbox" className="rounded" style={{ accentColor: '#f59e0b' }} checked={form.isCurrent} onChange={e => setForm(f => ({ ...f, isCurrent: e.target.checked }))} />
                Set as current academic year
              </label>
              <motion.button type="submit" disabled={create.isPending} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className={cn('w-full py-2.5 rounded-lg bg-gradient-to-r text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow disabled:opacity-60', s.btnClass)}>
                {create.isPending ? 'Saving…' : '+ Create Academic Year'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <StepFooter canContinue={years.length > 0} onNext={onNext} step={s} nextLabel="Continue to Classes" />
    </div>
  );
}

// ─── Step 1: Walls & Floors (Classes) ─────────────────────────────────────────

function WallsStep({ years, classes, onNext, onBack }: { years: AcademicYear[]; classes: ClassDoc[]; onNext: () => void; onBack: () => void }) {
  const qc = useQueryClient();
  const s = STEPS[1];
  const defaultYear = years.find(y => y.isCurrent)?._id ?? years[0]?._id ?? '';
  const [showForm, setShowForm] = useState(classes.length === 0);
  const [form, setForm] = useState({ name: '', level: '', academicYearId: defaultYear });

  const create = useMutation({
    mutationFn: academicService.createClass,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); setForm({ name: '', level: '', academicYearId: defaultYear }); setShowForm(false); },
  });
  const remove = useMutation({ mutationFn: academicService.deleteClass, onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }) });

  return (
    <div className="space-y-5">
      <StepHeader step={s} title="Build the Structure" index={1} count={classes.length} unit="class" />

      {classes.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence>
            {classes.map((c, i) => (
              <motion.div key={c._id}
                initial={{ opacity: 0, scale: 0.88, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 22 }}
                className={cn('bg-white dark:bg-slate-800 rounded-xl p-4 border shadow-sm group', s.border)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{CLASS_LEVELS.find(l => l.value === c.level)?.label}</p>
                  </div>
                  <button onClick={() => remove.mutate(c._id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!showForm && (
            <motion.button onClick={() => setShowForm(true)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className={cn('border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-2 transition-colors', s.border, s.text)}>
              <Plus className="w-4 h-4" /><span className="text-sm font-medium">Add class</span>
            </motion.button>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }}
            className={cn('bg-white dark:bg-slate-800 rounded-xl p-5 border shadow-sm overflow-hidden', s.border)}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">Add a class</p>
              {classes.length > 0 && <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
              <Field label="Class Name"><input className={inputCls(s.focusRing)} placeholder="e.g. 9-A Science" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></Field>
              <Field label="Level">
                <select className={inputCls(s.focusRing)} value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} required>
                  <option value="">Select level…</option>
                  {CLASS_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </Field>
              {years.length > 1 && (
                <Field label="Academic Year">
                  <select className={inputCls(s.focusRing)} value={form.academicYearId} onChange={e => setForm(f => ({ ...f, academicYearId: e.target.value }))} required>
                    <option value="">Select year…</option>
                    {years.map(y => <option key={y._id} value={y._id}>{y.label}</option>)}
                  </select>
                </Field>
              )}
              <motion.button type="submit" disabled={create.isPending} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className={cn('w-full py-2.5 rounded-lg bg-gradient-to-r text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow disabled:opacity-60', s.btnClass)}>
                {create.isPending ? 'Saving…' : '+ Add Class'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <StepFooter canContinue={classes.length > 0} onNext={onNext} onBack={onBack} step={s} nextLabel="Continue to Sections" />
    </div>
  );
}

// ─── Step 2: Rooms (Sections) ─────────────────────────────────────────────────

function RoomsStep({ classes, sections, onNext, onBack }: { classes: ClassDoc[]; sections: SectionDoc[]; onNext: () => void; onBack: () => void }) {
  const qc = useQueryClient();
  const s = STEPS[2];
  const [showForm, setShowForm] = useState(sections.length === 0);
  const [form, setForm] = useState({ name: '', classId: classes[0]?._id ?? '', capacity: '' });

  const create = useMutation({
    mutationFn: academicService.createSection,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sections'] });
      setForm(f => ({ ...f, name: '', capacity: '' }));
      setShowForm(false);
    },
  });
  const remove = useMutation({ mutationFn: academicService.deleteSection, onSuccess: () => qc.invalidateQueries({ queryKey: ['sections'] }) });

  return (
    <div className="space-y-5">
      <StepHeader step={s} title="Create the Rooms" index={2} count={sections.length} unit="section" />

      {sections.length > 0 && (
        <div className="space-y-4">
          {classes.map(cls => {
            const clsSections = sections.filter(sec => sec.classId === cls._id);
            if (clsSections.length === 0) return null;
            return (
              <div key={cls._id}>
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">{cls.name}</p>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {clsSections.map((sec, i) => (
                      <motion.div key={sec._id}
                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }} transition={{ delay: i * 0.04, type: 'spring', stiffness: 400 }}
                        className={cn('flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full border text-sm font-medium', s.bg, s.border, s.text)}>
                        {sec.name}
                        {sec.capacity && <span className="text-xs opacity-60">· {sec.capacity}</span>}
                        <button onClick={() => remove.mutate(sec._id)} className="ml-0.5 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }}
            className={cn('bg-white dark:bg-slate-800 rounded-xl p-5 border shadow-sm overflow-hidden', s.border)}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">Add a section</p>
              {sections.length > 0 && <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate({ ...form, capacity: form.capacity ? parseInt(form.capacity) : undefined }); }} className="space-y-4">
              <Field label="Class">
                <select className={inputCls(s.focusRing)} value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))} required>
                  <option value="">Select class…</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Section Name"><input className={inputCls(s.focusRing)} placeholder="e.g. A, B, Science, Arts" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></Field>
              <Field label="Capacity (optional)"><input type="number" className={inputCls(s.focusRing)} placeholder="Max students" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} /></Field>
              <motion.button type="submit" disabled={create.isPending} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className={cn('w-full py-2.5 rounded-lg bg-gradient-to-r text-white text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-60', s.btnClass)}>
                {create.isPending ? 'Saving…' : '+ Add Section'}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowForm(true)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className={cn('w-full border-2 border-dashed rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors', s.border, s.text)}>
            <Plus className="w-4 h-4" /> Add section
          </motion.button>
        )}
      </AnimatePresence>

      <StepFooter canContinue={sections.length > 0} onNext={onNext} onBack={onBack} step={s} nextLabel="Continue to Subjects" />
    </div>
  );
}

// ─── Step 3: Curriculum (Subjects) ────────────────────────────────────────────

function CurriculumStep({ subjects, onComplete, onBack }: { subjects: SubjectDoc[]; onComplete: () => void; onBack: () => void }) {
  const qc = useQueryClient();
  const s = STEPS[3];
  const [showForm, setShowForm] = useState(subjects.length === 0);
  const [form, setForm] = useState({ name: '', code: '', isElective: false });
  const [done, setDone] = useState(false);

  const create = useMutation({
    mutationFn: academicService.createSubject,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); setForm({ name: '', code: '', isElective: false }); setShowForm(false); },
  });
  const remove = useMutation({ mutationFn: academicService.deleteSubject, onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }) });

  if (done) {
    return (
      <motion.div className="flex flex-col items-center justify-center py-16 text-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
          animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 2, duration: 0.4 }}>
          <Sparkles className="w-9 h-9 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your school is built!</h2>
        <p className="text-gray-500 dark:text-slate-400 max-w-xs">Academic year, classes, sections, and subjects — all configured and ready.</p>
        <motion.button onClick={onComplete} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-md hover:shadow-lg transition-shadow">
          Open Academic Dashboard →
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <StepHeader step={s} title="Load the Curriculum" index={3} count={subjects.length} unit="subject" />

      {subjects.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence>
            {subjects.map((sub, i) => (
              <motion.div key={sub._id}
                initial={{ opacity: 0, scale: 0.88, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 22 }}
                className={cn('bg-white dark:bg-slate-800 rounded-xl p-4 border shadow-sm group', s.border)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{sub.name}</p>
                    <p className={cn('text-xs font-mono mt-0.5', s.text)}>{sub.code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.isElective && <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', s.bg, s.text)}>Elective</span>}
                    <button onClick={() => remove.mutate(sub._id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!showForm && (
            <motion.button onClick={() => setShowForm(true)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className={cn('border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-2 transition-colors', s.border, s.text)}>
              <Plus className="w-4 h-4" /><span className="text-sm font-medium">Add subject</span>
            </motion.button>
          )}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }}
            className={cn('bg-white dark:bg-slate-800 rounded-xl p-5 border shadow-sm overflow-hidden', s.border)}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">Add a subject</p>
              {subjects.length > 0 && <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
              <Field label="Subject Name"><input className={inputCls(s.focusRing)} placeholder="e.g. Mathematics" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></Field>
              <Field label="Subject Code"><input className={inputCls(s.focusRing)} placeholder="e.g. MATH, PHY, ENG" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required /></Field>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 cursor-pointer select-none">
                <input type="checkbox" className="rounded" style={{ accentColor: '#10b981' }} checked={form.isElective} onChange={e => setForm(f => ({ ...f, isElective: e.target.checked }))} />
                Elective subject
              </label>
              <motion.button type="submit" disabled={create.isPending} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className={cn('w-full py-2.5 rounded-lg bg-gradient-to-r text-white text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-60', s.btnClass)}>
                {create.isPending ? 'Saving…' : '+ Add Subject'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <motion.button
          onClick={() => subjects.length > 0 ? setDone(true) : undefined}
          disabled={subjects.length === 0}
          whileHover={subjects.length > 0 ? { scale: 1.02 } : {}}
          whileTap={subjects.length > 0 ? { scale: 0.97 } : {}}
          className={cn('flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all',
            subjects.length > 0
              ? `bg-gradient-to-r ${s.btnClass} text-white shadow-sm hover:shadow-md`
              : 'bg-gray-100 dark:bg-slate-700 text-gray-300 cursor-not-allowed')}>
          <Sparkles className="w-4 h-4" />
          Complete Setup
        </motion.button>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function StepHeader({ step, title, index, count, unit }: {
  step: typeof STEPS[number]; title: string; index: number; count: number; unit: string;
}) {
  const { Icon } = step;
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn('w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm', step.gradient)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-400">Step {index + 1} of 4 · {step.subtitle}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
      {count > 0 && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className={cn('mt-2 text-xs font-semibold', step.text)}>
          ✓ {count} {unit}{count !== 1 ? 's' : ''} added
        </motion.p>
      )}
    </div>
  );
}

function StepFooter({ canContinue, onNext, onBack, step, nextLabel }: {
  canContinue: boolean; onNext: () => void; onBack?: () => void;
  step: typeof STEPS[number]; nextLabel: string;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      {onBack ? (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      ) : <div />}
      <div className="flex flex-col items-end gap-1">
        {!canContinue && <p className="text-xs text-gray-400">Add at least one {step.subtitle.toLowerCase()} to continue</p>}
        <motion.button
          onClick={canContinue ? onNext : undefined}
          disabled={!canContinue}
          whileHover={canContinue ? { scale: 1.02 } : {}}
          whileTap={canContinue ? { scale: 0.97 } : {}}
          className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
            canContinue
              ? `bg-gradient-to-r ${step.btnClass} text-white shadow-sm hover:shadow-md`
              : 'bg-gray-100 dark:bg-slate-700 text-gray-300 cursor-not-allowed')}>
          {nextLabel} <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

export default function AcademicSetupWizard({ years, classes, sections, subjects, onExit }: WizardProps) {
  const initialStep = years.length === 0 ? 0 : classes.length === 0 ? 1 : sections.length === 0 ? 2 : 3;
  const [activeStep, setActiveStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);

  const doneSteps = [
    years.length > 0 ? 0 : -1,
    classes.length > 0 ? 1 : -1,
    sections.length > 0 ? 2 : -1,
    subjects.length > 0 ? 3 : -1,
  ].filter(n => n >= 0);

  const go = (step: number) => {
    setDirection(step > activeStep ? 1 : -1);
    setActiveStep(step);
  };

  const canVisit = (i: number) => {
    if (i === 0) return true;
    if (i === 1) return years.length > 0;
    if (i === 2) return classes.length > 0;
    if (i === 3) return classes.length > 0;
    return false;
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-slate-800">
      {/* Top bar */}
      <div className="border-b border-gray-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">Academic Setup</span>
              <span className="text-gray-400 text-xs ml-2">Building your school…</span>
            </div>
          </div>

          {/* Progress pills */}
          <div className="hidden sm:flex items-center gap-1.5">
            {STEPS.map((s, i) => {
              const { Icon } = s;
              const isDone = doneSteps.includes(i);
              const isActive = i === activeStep;
              return (
                <button key={i} onClick={() => canVisit(i) ? go(i) : undefined}
                  className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                    isActive && `bg-gradient-to-r ${s.gradient} text-white shadow-sm`,
                    !isActive && isDone && 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                    !isActive && !isDone && canVisit(i) && 'bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-gray-200',
                    !canVisit(i) && 'opacity-40 cursor-not-allowed text-gray-400',
                  )}>
                  {isDone && !isActive ? <Check className="w-3 h-3" /> : isActive ? <Icon className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span className="hidden md:inline">{s.subtitle}</span>
                </button>
              );
            })}
          </div>

          <button onClick={onExit} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
            Classic view →
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto p-6 flex gap-6">
        {/* Left sidebar */}
        <div className="w-64 shrink-0 space-y-4 hidden lg:block">
          {/* Building */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
            <SchoolBuilding activeStep={activeStep} doneSteps={doneSteps} />
          </div>

          {/* Step list */}
          <div className="space-y-1.5">
            {STEPS.map((s, i) => {
              const isDone = doneSteps.includes(i);
              const isActive = i === activeStep;
              const isLocked = !canVisit(i);
              return (
                <motion.button key={i} onClick={() => canVisit(i) ? go(i) : undefined}
                  whileTap={canVisit(i) ? { scale: 0.98 } : {}}
                  className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                    isActive && `${s.bg} ring-2 ${s.ring}`,
                    !isActive && canVisit(i) && 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750',
                    !isActive && !canVisit(i) && 'bg-white/50 dark:bg-slate-800/50',
                    isLocked && 'opacity-40 cursor-not-allowed',
                  )}>
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                    isDone && 'bg-green-500 text-white',
                    isActive && !isDone && `bg-gradient-to-br ${s.gradient} text-white`,
                    !isActive && !isDone && 'bg-gray-100 dark:bg-slate-700 text-gray-400',
                  )}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : isLocked ? <Lock className="w-3 h-3 text-gray-300" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-bold leading-tight', isActive ? s.text : 'text-gray-700 dark:text-slate-200')}>{s.label}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{s.subtitle}</p>
                  </div>
                  {isActive && <ChevronRight className={cn('w-3.5 h-3.5 shrink-0', s.text)} />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 min-h-[480px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={activeStep} custom={direction}
                variants={stepVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}>
                {activeStep === 0 && <FoundationStep years={years} onNext={() => go(1)} />}
                {activeStep === 1 && <WallsStep years={years} classes={classes} onNext={() => go(2)} onBack={() => go(0)} />}
                {activeStep === 2 && <RoomsStep classes={classes} sections={sections} onNext={() => go(3)} onBack={() => go(1)} />}
                {activeStep === 3 && <CurriculumStep subjects={subjects} onComplete={onExit} onBack={() => go(2)} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
