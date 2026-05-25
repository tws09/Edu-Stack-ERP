import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '../../services/academicService';
import { timetableService } from '../../services/timetableService';
import type { TimetableSlot, PeriodTiming } from '../../services/timetableService';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SUBJECT_COLORS = [
  { cell: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700/50', text: 'text-blue-800 dark:text-blue-300', sub: 'text-blue-500 dark:text-blue-400', dot: 'bg-blue-500' },
  { cell: 'bg-violet-50 border-violet-200 dark:bg-violet-900/30 dark:border-violet-700/50', text: 'text-violet-800 dark:text-violet-300', sub: 'text-violet-500 dark:text-violet-400', dot: 'bg-violet-500' },
  { cell: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700/50', text: 'text-green-800 dark:text-green-300', sub: 'text-green-500 dark:text-green-400', dot: 'bg-green-500' },
  { cell: 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-700/50', text: 'text-orange-800 dark:text-orange-300', sub: 'text-orange-500 dark:text-orange-400', dot: 'bg-orange-500' },
  { cell: 'bg-pink-50 border-pink-200 dark:bg-pink-900/30 dark:border-pink-700/50', text: 'text-pink-800 dark:text-pink-300', sub: 'text-pink-500 dark:text-pink-400', dot: 'bg-pink-500' },
  { cell: 'bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:border-teal-700/50', text: 'text-teal-800 dark:text-teal-300', sub: 'text-teal-500 dark:text-teal-400', dot: 'bg-teal-500' },
  { cell: 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700/50', text: 'text-amber-800 dark:text-amber-300', sub: 'text-amber-500 dark:text-amber-400', dot: 'bg-amber-500' },
  { cell: 'bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-700/50', text: 'text-rose-800 dark:text-rose-300', sub: 'text-rose-500 dark:text-rose-400', dot: 'bg-rose-500' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDefaultTimings(count: number): PeriodTiming[] {
  // Start at 08:00, 45-min periods, 5-min breaks
  const timings: PeriodTiming[] = [];
  let h = 8, m = 0;
  for (let i = 1; i <= count; i++) {
    const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    m += 45;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    const end = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    m += 5;
    if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    timings.push({ periodNo: i, startTime: start, endTime: end });
  }
  return timings;
}

function getSubjectColor(subjectId: string, subjects: { _id: string }[]) {
  const idx = subjects.findIndex(s => s._id === subjectId);
  return SUBJECT_COLORS[(idx < 0 ? 0 : idx) % SUBJECT_COLORS.length];
}

// ─── Editable cell ────────────────────────────────────────────────────────────

function EditCell({
  slot, subjects, isSelected, onClick,
}: {
  slot: TimetableSlot | undefined;
  subjects: { _id: string; name: string }[];
  isSelected: boolean;
  onClick: () => void;
}) {
  const subId = slot?.subjectId as string | undefined;
  const color = subId ? getSubjectColor(subId, subjects) : null;
  const subjectName = subjects.find(s => s._id === subId)?.name;

  if (slot && color) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full rounded-xl border px-2 py-2 text-center transition-all group relative',
          color.cell,
          isSelected
            ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-[1.03] shadow-md'
            : 'hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-600 hover:ring-offset-1 hover:scale-[1.01]'
        )}
      >
        <div className={cn('text-xs font-semibold leading-tight truncate', color.text)}>{subjectName ?? '—'}</div>
        {slot.roomNo && <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">{slot.roomNo}</div>}
        <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/70 dark:bg-slate-900/70 transition-opacity">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full h-12 rounded-xl border-2 border-dashed flex items-center justify-center transition-all group',
        isSelected
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
          : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-900/10'
      )}
    >
      <svg
        className={cn('w-4 h-4 transition-colors', isSelected ? 'text-blue-400' : 'text-gray-300 dark:text-slate-600 group-hover:text-blue-400')}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}

// ─── Right panel: slot editor ─────────────────────────────────────────────────

function SlotEditorPanel({
  day, period,
  subjectId, teacherId, roomNo,
  subjects, teachers,
  onChange, onApply, onClear,
}: {
  day: number; period: number;
  subjectId: string; teacherId: string; roomNo: string;
  subjects: { _id: string; name: string }[];
  teachers: { _id: string; profile?: { name: string } }[];
  onChange: (field: 'subjectId' | 'teacherId' | 'roomNo', value: string) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const hasSlot = subjectId || teacherId;

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
      {/* Panel header */}
      <div className="px-4 py-3 bg-blue-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-white text-xs font-bold">{period}</span>
          <span className="text-sm font-semibold text-white">{DAYS[day - 1]}</span>
        </div>
        <span className="text-xs text-blue-200">Period {period}</span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">Subject</label>
          <select
            value={subjectId}
            onChange={e => onChange('subjectId', e.target.value)}
            className="w-full text-sm border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— No subject —</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">Teacher</label>
          <select
            value={teacherId}
            onChange={e => onChange('teacherId', e.target.value)}
            className="w-full text-sm border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— No teacher —</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.profile?.name ?? t._id}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">Room <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            value={roomNo}
            onChange={e => onChange('roomNo', e.target.value)}
            placeholder="e.g. Room 12"
            className="w-full text-sm border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onApply}
            className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Apply
          </button>
          {hasSlot && (
            <button
              onClick={onClear}
              className="px-3 py-2 text-sm border border-red-200 dark:border-red-700/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state for right panel ─────────────────────────────────────────────

function PanelPlaceholder({ subjects }: { subjects: { _id: string; name: string }[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Slot Editor</p>
      </div>
      <div className="p-5 text-center">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Click any cell</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">to assign a subject, teacher &amp; room</p>
      </div>

      {subjects.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-2">Subject colours</p>
          <div className="space-y-1.5">
            {subjects.slice(0, 8).map((s, i) => {
              const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
              return (
                <div key={s._id} className="flex items-center gap-2">
                  <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', color.dot)} />
                  <span className="text-xs text-gray-600 dark:text-slate-400 truncate">{s.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main edit page ───────────────────────────────────────────────────────────

export default function TimetableEditPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);

  const classId = searchParams.get('classId') ?? '';
  const sectionId = searchParams.get('sectionId') ?? '';

  const basePath = user?.role === 'group_admin' ? '/group' : '/dashboard';

  // Edit state
  const [editSlots, setEditSlots] = useState<TimetableSlot[]>([]);
  const [periodTimings, setPeriodTimings] = useState<PeriodTiming[]>(() => buildDefaultTimings(8));
  const [editTimetableId, setEditTimetableId] = useState<string | null>(null);
  const [periods, setPeriods] = useState(8);
  const [initialized, setInitialized] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ day: number; period: number } | null>(null);
  const [cellForm, setCellForm] = useState({ subjectId: '', teacherId: '', roomNo: '' });
  const [apiError, setApiError] = useState('');

  // Data fetching
  const { data: years = [] } = useQuery({ queryKey: ['years'], queryFn: academicService.getYears });
  const currentYear = years.find(y => y.isCurrent) ?? years[0];

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', currentYear?._id],
    queryFn: () => academicService.getClasses(currentYear?._id),
    enabled: !!currentYear,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections', classId],
    queryFn: () => academicService.getSections(classId || undefined),
    enabled: !!classId,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: () => academicService.getSubjects(classId || undefined),
    enabled: !!classId,
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => userService.list({ role: 'teacher' }),
  });

  const { data: timetables = [], isLoading } = useQuery({
    queryKey: ['timetable', 'class', sectionId, currentYear?._id],
    queryFn: () => timetableService.get({ sectionId, academicYearId: currentYear!._id }),
    enabled: !!sectionId && !!currentYear,
  });

  // Initialise edit slots + timings from fetched timetable (once)
  const timetable = timetables[0] ?? null;
  if (!initialized && !isLoading && currentYear) {
    const slots: TimetableSlot[] = timetable
      ? timetable.slots.map(s => ({
          dayOfWeek: s.dayOfWeek,
          periodNo: s.periodNo,
          subjectId: typeof s.subjectId === 'object' ? s.subjectId._id : s.subjectId,
          teacherId: typeof s.teacherId === 'object' ? s.teacherId._id : s.teacherId,
          roomNo: s.roomNo,
        }))
      : [];
    const detectedPeriods = timetable ? Math.max(...timetable.slots.map(s => s.periodNo), 8) : 8;
    setEditSlots(slots);
    setEditTimetableId(timetable?._id ?? null);
    setPeriods(detectedPeriods);
    setPeriodTimings(
      timetable?.periodTimings?.length
        ? timetable.periodTimings
        : buildDefaultTimings(detectedPeriods)
    );
    setInitialized(true);
  }

  // Derived
  const className = classes.find(c => c._id === classId)?.name ?? '';
  const sectionName = sections.find(s => s._id === sectionId)?.name ?? '';
  const filledCount = editSlots.filter(s => s.subjectId && s.teacherId).length;
  const totalCells = periods * 6;

  // Sync timings array length when periods count changes
  const handlePeriodsChange = (n: number) => {
    setPeriods(n);
    setPeriodTimings(prev => {
      if (prev.length === n) return prev;
      if (prev.length > n) return prev.filter(t => t.periodNo <= n);
      // extend with defaults for new periods
      const defaults = buildDefaultTimings(n);
      const extended = [...prev];
      for (let i = prev.length + 1; i <= n; i++) {
        extended.push(defaults[i - 1]);
      }
      return extended;
    });
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (slots: TimetableSlot[]) =>
      timetableService.create({ classId, sectionId, academicYearId: currentYear!._id, slots, periodTimings }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable'] });
      navigate(`${basePath}/timetable`);
    },
    onError: (e: any) => setApiError(e?.response?.data?.message ?? 'Failed to save timetable'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, slots }: { id: string; slots: TimetableSlot[] }) =>
      timetableService.update(id, { slots, periodTimings }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timetable'] });
      navigate(`${basePath}/timetable`);
    },
    onError: (e: any) => setApiError(e?.response?.data?.message ?? 'Failed to save timetable'),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Handlers
  const handleCellClick = (day: number, period: number) => {
    const slot = editSlots.find(s => s.dayOfWeek === day && s.periodNo === period);
    setSelectedCell({ day, period });
    setCellForm({
      subjectId: (slot?.subjectId as string) ?? '',
      teacherId: (slot?.teacherId as string) ?? '',
      roomNo: slot?.roomNo ?? '',
    });
  };

  const applyCell = () => {
    if (!selectedCell) return;
    const { day, period } = selectedCell;
    if (!cellForm.subjectId && !cellForm.teacherId) {
      setEditSlots(prev => prev.filter(s => !(s.dayOfWeek === day && s.periodNo === period)));
    } else {
      setEditSlots(prev => {
        const exists = prev.find(s => s.dayOfWeek === day && s.periodNo === period);
        if (exists) {
          return prev.map(s =>
            s.dayOfWeek === day && s.periodNo === period
              ? { ...s, subjectId: cellForm.subjectId, teacherId: cellForm.teacherId, roomNo: cellForm.roomNo }
              : s
          );
        }
        return [...prev, {
          dayOfWeek: day, periodNo: period,
          subjectId: cellForm.subjectId, teacherId: cellForm.teacherId, roomNo: cellForm.roomNo,
        }];
      });
    }
    setSelectedCell(null);
    setCellForm({ subjectId: '', teacherId: '', roomNo: '' });
  };

  const clearCell = () => {
    if (!selectedCell) return;
    const { day, period } = selectedCell;
    setEditSlots(prev => prev.filter(s => !(s.dayOfWeek === day && s.periodNo === period)));
    setSelectedCell(null);
    setCellForm({ subjectId: '', teacherId: '', roomNo: '' });
  };

  const handleSave = () => {
    const validSlots = editSlots.filter(s => s.subjectId && s.teacherId);
    if (editTimetableId) updateMutation.mutate({ id: editTimetableId, slots: validSlots });
    else createMutation.mutate(validSlots);
  };

  if (!classId || !sectionId) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-gray-500 dark:text-slate-400 text-sm">Missing class or section. <button onClick={() => navigate(-1)} className="text-blue-600 underline">Go back</button></p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-gray-100 dark:border-slate-800 -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-6">
        <div className="flex flex-wrap items-center gap-3 justify-between">

          {/* Left: back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 dark:text-slate-100 truncate">
                {editTimetableId ? 'Edit Timetable' : 'Create Timetable'}
              </h1>
              {(className || sectionName) && (
                <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                  {className}{sectionName ? ` — Section ${sectionName}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Right: controls + save */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">Periods / day</label>
              <select
                value={periods}
                onChange={e => handlePeriodsChange(Number(e.target.value))}
                className="text-sm border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
              {filledCount} / {totalCells} slots
            </span>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {isPending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isPending ? 'Saving…' : 'Save Timetable'}
            </button>
          </div>
        </div>

        {apiError && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg px-3 py-2">
            {apiError}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500 text-sm">Loading timetable…</div>
      ) : (
        <div className="flex gap-5 items-start">

          {/* ── Grid (main area) ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80">
                      <th className="w-12 px-3 py-3 text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">#</th>
                      {DAYS.map((d, i) => (
                        <th key={i} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide min-w-30">
                          <span className="hidden sm:inline">{d}</span>
                          <span className="sm:hidden">{DAY_SHORT[i]}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: periods }, (_, p) => (
                      <tr key={p} className="border-b border-gray-50 dark:border-slate-800/60 last:border-0">
                        <td className="px-3 py-2 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 text-xs font-semibold text-gray-500 dark:text-slate-400">{p + 1}</span>
                        </td>
                        {DAYS.map((_, d) => {
                          const slot = editSlots.find(s => s.dayOfWeek === d + 1 && s.periodNo === p + 1);
                          const isSelected = selectedCell?.day === d + 1 && selectedCell?.period === p + 1;
                          return (
                            <td key={d} className="px-1.5 py-1.5">
                              <EditCell
                                slot={slot}
                                subjects={subjects}
                                isSelected={isSelected}
                                onClick={() => handleCellClick(d + 1, p + 1)}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-slate-500 mt-3 text-center">
              Click a cell to edit · Empty cells are skipped when saving
            </p>

            {/* ── Period Timings ── */}
            <div className="mt-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Period Times</h3>
                <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto">shown on timetable</span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {periodTimings.map((t, i) => (
                    <div key={t.periodNo} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">Period {t.periodNo}</p>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={t.startTime}
                          onChange={e => setPeriodTimings(prev => prev.map((x, j) => j === i ? { ...x, startTime: e.target.value } : x))}
                          className="flex-1 min-w-0 text-xs border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">—</span>
                        <input
                          type="time"
                          value={t.endTime}
                          onChange={e => setPeriodTimings(prev => prev.map((x, j) => j === i ? { ...x, endTime: e.target.value } : x))}
                          className="flex-1 min-w-0 text-xs border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Sticky right panel ── */}
          <div className="w-64 shrink-0 sticky top-24">
            {selectedCell ? (
              <SlotEditorPanel
                day={selectedCell.day}
                period={selectedCell.period}
                subjectId={cellForm.subjectId}
                teacherId={cellForm.teacherId}
                roomNo={cellForm.roomNo}
                subjects={subjects}
                teachers={teachers}
                onChange={(field, value) => setCellForm(f => ({ ...f, [field]: value }))}
                onApply={applyCell}
                onClear={clearCell}
              />
            ) : (
              <PanelPlaceholder subjects={subjects} />
            )}
          </div>

        </div>
      )}
    </div>
  );
}
