import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { academicService } from '../../services/academicService';
import { timetableService, type TimetableSlot } from '../../services/timetableService';
import { userService } from '../../services/userService';
import { studentService } from '../../services/studentService';
import PageHeader from '../../components/ui/PageHeader';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';
import { ExamScheduleTab, StudentExamScheduleTab } from './ExamScheduleTab';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SUBJECT_COLORS = [
  { cell: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700/50', text: 'text-blue-800 dark:text-blue-300', sub: 'text-blue-500 dark:text-blue-400' },
  { cell: 'bg-violet-50 border-violet-200 dark:bg-violet-900/30 dark:border-violet-700/50', text: 'text-violet-800 dark:text-violet-300', sub: 'text-violet-500 dark:text-violet-400' },
  { cell: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700/50', text: 'text-green-800 dark:text-green-300', sub: 'text-green-500 dark:text-green-400' },
  { cell: 'bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-700/50', text: 'text-orange-800 dark:text-orange-300', sub: 'text-orange-500 dark:text-orange-400' },
  { cell: 'bg-pink-50 border-pink-200 dark:bg-pink-900/30 dark:border-pink-700/50', text: 'text-pink-800 dark:text-pink-300', sub: 'text-pink-500 dark:text-pink-400' },
  { cell: 'bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:border-teal-700/50', text: 'text-teal-800 dark:text-teal-300', sub: 'text-teal-500 dark:text-teal-400' },
  { cell: 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700/50', text: 'text-amber-800 dark:text-amber-300', sub: 'text-amber-500 dark:text-amber-400' },
  { cell: 'bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-700/50', text: 'text-rose-800 dark:text-rose-300', sub: 'text-rose-500 dark:text-rose-400' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _slotKey(day: number, period: number) { return `${day}-${period}`; }

function getSubjectColor(subjectId: string, subjects: { _id: string }[]) {
  const idx = subjects.findIndex(s => s._id === subjectId);
  return SUBJECT_COLORS[(idx < 0 ? 0 : idx) % SUBJECT_COLORS.length];
}

// ─── Read-only grid (shared between student + staff view mode) ────────────────

function TimetableGrid({
  slots,
  periods,
  periodTimings = [],
  showTeacher = true,
  subjects = [],
}: {
  slots: TimetableSlot[];
  periods: number;
  periodTimings?: { periodNo: number; startTime: string; endTime: string }[];
  showTeacher?: boolean;
  subjects?: { _id: string }[];
}) {
  const getSlot = (day: number, period: number) =>
    slots.find(s => s.dayOfWeek === day && s.periodNo === period);

  const getTiming = (periodNo: number) =>
    periodTimings.find(t => t.periodNo === periodNo);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-100 dark:border-slate-700">
            <th className="w-16 px-3 py-3 text-left text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Period</th>
            {DAYS.map((d, i) => (
              <th key={i} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide min-w-27.5">
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{DAY_SHORT[i]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: periods }, (_, p) => {
            const timing = getTiming(p + 1);
            return (
            <tr key={p} className="border-b border-gray-50 dark:border-slate-800 last:border-0">
              <td className="px-3 py-2 text-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 text-xs font-semibold text-gray-500 dark:text-slate-400">{p + 1}</span>
                {timing && (
                  <div className="mt-1 space-y-0.5">
                    <div className="text-xs text-gray-400 dark:text-slate-500 leading-none">{timing.startTime}</div>
                    <div className="text-xs text-gray-300 dark:text-slate-600 leading-none">{timing.endTime}</div>
                  </div>
                )}
              </td>
              {DAYS.map((_, d) => {
                const slot = getSlot(d + 1, p + 1);
                const subId = typeof slot?.subjectId === 'object' ? slot.subjectId._id : slot?.subjectId;
                const color = subId ? getSubjectColor(subId, subjects.length > 0 ? subjects : (slot?.subjectId && typeof slot.subjectId === 'object' ? [slot.subjectId] : [])) : null;
                const subject = typeof slot?.subjectId === 'object' ? slot.subjectId : null;
                const teacher = typeof slot?.teacherId === 'object' ? slot.teacherId : null;
                return (
                  <td key={d} className="px-1.5 py-1.5">
                    {slot && color ? (
                      <div className={cn('rounded-lg border px-2 py-1.5 text-center', color.cell)}>
                        <div className={cn('text-xs font-semibold leading-tight truncate', color.text)}>{subject?.name ?? '—'}</div>
                        {showTeacher && teacher && (
                          <div className={cn('text-xs mt-0.5 truncate', color.sub)}>
                            {(teacher as any).name?.split(' ')[0] ?? '—'}
                          </div>
                        )}
                        {slot.roomNo && <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{slot.roomNo}</div>}
                      </div>
                    ) : (
                      <div className="h-10 flex items-center justify-center text-gray-200 dark:text-slate-800 text-xs">—</div>
                    )}
                  </td>
                );
              })}
            </tr>
          );})}
        </tbody>
      </table>
    </div>
  );
}

// ─── Student view ─────────────────────────────────────────────────────────────

function StudentTimetableView() {
  const [tab, setTab] = useState<'class' | 'exam'>('class');

  const { data: student, isLoading: loadingProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: studentService.getMe,
  });

  const { data: years = [] } = useQuery({ queryKey: ['years'], queryFn: academicService.getYears });
  const currentYear = years.find(y => y.isCurrent) ?? years[0];
  const sectionId = typeof student?.sectionId === 'object' ? student.sectionId._id : student?.sectionId ?? '';

  const { data: timetables = [], isLoading } = useQuery({
    queryKey: ['timetable', sectionId, currentYear?._id],
    queryFn: () => timetableService.get({ sectionId, academicYearId: currentYear!._id }),
    enabled: !!sectionId && !!currentYear,
  });

  const timetable = timetables[0] ?? null;
  const periods = timetable ? Math.max(...timetable.slots.map(s => s.periodNo), 8) : 8;
  const studentClassName = typeof student?.classId === 'object' ? student.classId.name : '';
  const sectionName = typeof student?.sectionId === 'object' ? student.sectionId.name : '';

  if (loadingProfile) {
    return <div className="p-6 text-center text-gray-400 dark:text-slate-500 text-sm py-20">Loading timetable...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Timetable"
        subtitle={studentClassName && sectionName ? `${studentClassName} — Section ${sectionName}` : undefined}
      />

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-gray-200 dark:border-gray-600 p-1 mb-5 w-fit">
        <button
          onClick={() => setTab('class')}
          className={cn('px-4 py-1.5 text-sm rounded-lg transition-colors font-medium', tab === 'class' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700')}
        >
          Class Schedule
        </button>
        <button
          onClick={() => setTab('exam')}
          className={cn('px-4 py-1.5 text-sm rounded-lg transition-colors font-medium', tab === 'exam' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700')}
        >
          Exam Schedule
        </button>
      </div>

      {tab === 'class' && (
        <>
          {isLoading && <div className="text-center py-12 text-gray-400 dark:text-slate-500 text-sm">Loading...</div>}
          {!isLoading && (
            <div className="card overflow-hidden">
              {!timetable ? (
                <div className="px-5 py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                  No timetable has been set up for your class yet.
                </div>
              ) : (
                <TimetableGrid slots={timetable.slots} periods={periods} periodTimings={timetable.periodTimings ?? []} />
              )}
            </div>
          )}
        </>
      )}

      {tab === 'exam' && <StudentExamScheduleTab />}
    </div>
  );
}

// ─── Staff view ───────────────────────────────────────────────────────────────

export default function TimetablePage() {
  const user = useAuthStore(s => s.user);
  if (user?.role === 'student') return <StudentTimetableView />;
  return <StaffTimetableView />;
}

function StaffTimetableView() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const [mainTab, setMainTab] = useState<'class-schedule' | 'exam-schedule'>('class-schedule');
  const [view, setView] = useState<'class' | 'teacher'>('class');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');

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

  const timetableParams: Record<string, string> = { academicYearId: currentYear?._id ?? '' };
  if (view === 'class' && sectionId) timetableParams['sectionId'] = sectionId;
  if (view === 'teacher' && teacherFilter) timetableParams['teacherId'] = teacherFilter;

  const { data: timetables = [], isLoading } = useQuery({
    queryKey: ['timetable', view, sectionId, teacherFilter, currentYear?._id],
    queryFn: () => timetableService.get(timetableParams),
    enabled: !!currentYear && (view === 'class' ? !!sectionId : !!teacherFilter),
  });

  const timetable = timetables[0] ?? null;
  const viewPeriods = timetable ? Math.max(...timetable.slots.map(s => s.periodNo), 8) : 8;

  const canEdit = ['branch_principal', 'it_admin', 'group_admin'].includes(user?.role ?? '');
  const basePath = user?.role === 'group_admin' ? '/group' : '/dashboard';

  const goToEdit = () => {
    navigate(`${basePath}/timetable/edit?classId=${classId}&sectionId=${sectionId}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Timetable"
        actions={canEdit && mainTab === 'class-schedule' && view === 'class' && sectionId ? (
          <button onClick={goToEdit} className="btn-primary text-sm">
            {timetable ? 'Edit Timetable' : 'Create Timetable'}
          </button>
        ) : undefined}
      />

      {/* Main tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 dark:border-gray-600 p-1 mb-5 w-fit">
        <button
          onClick={() => setMainTab('class-schedule')}
          className={cn('px-4 py-1.5 text-sm rounded-lg transition-colors font-medium', mainTab === 'class-schedule' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700')}
        >
          Class Schedule
        </button>
        <button
          onClick={() => setMainTab('exam-schedule')}
          className={cn('px-4 py-1.5 text-sm rounded-lg transition-colors font-medium', mainTab === 'exam-schedule' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700')}
        >
          Exam Schedule
        </button>
      </div>

      {mainTab === 'exam-schedule' && <ExamScheduleTab />}

      {mainTab === 'class-schedule' && <>

      {/* Controls */}
      <div className="card p-4 mb-5">
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-slate-600 p-1">
            <button onClick={() => setView('class')} className={cn('px-3 py-1.5 text-sm rounded-md transition-colors', view === 'class' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-700')}>Class View</button>
            <button onClick={() => setView('teacher')} className={cn('px-3 py-1.5 text-sm rounded-md transition-colors', view === 'teacher' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-700')}>Teacher View</button>
          </div>

          {view === 'class' && (
            <>
              <div>
                <label className="label">Class</label>
                <select className="input" value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }}>
                  <option value="">Select class...</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Section</label>
                <select className="input" value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId}>
                  <option value="">Select section...</option>
                  {sections.map(s => <option key={s._id} value={s._id}>Section {s.name}</option>)}
                </select>
              </div>
            </>
          )}

          {view === 'teacher' && (
            <div>
              <label className="label">Teacher</label>
              <select className="input" value={teacherFilter} onChange={e => setTeacherFilter(e.target.value)}>
                <option value="">Select teacher...</option>
                {teachers.map((t: { _id: string; name: string }) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading && <div className="text-center py-12 text-gray-400 dark:text-slate-500 text-sm">Loading...</div>}

      {!isLoading && (view === 'class' ? !sectionId : !teacherFilter) && (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-2xl">📅</div>
          <p className="text-sm text-gray-400 dark:text-slate-500">
            {view === 'class' ? 'Select a class and section to view the timetable.' : 'Select a teacher to view their schedule.'}
          </p>
        </div>
      )}

      {!isLoading && ((view === 'class' && sectionId) || (view === 'teacher' && teacherFilter)) && (
        <div className="card overflow-hidden">
          {!timetable ? (
            <div className="px-5 py-12 text-center">
              <div className="text-3xl mb-3">🗓️</div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">No timetable set up yet</p>
              {canEdit && view === 'class' && (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Click "Create Timetable" to build one.</p>
              )}
            </div>
          ) : (
            <TimetableGrid slots={timetable.slots} periods={viewPeriods} periodTimings={timetable.periodTimings ?? []} showTeacher={view === 'class'} subjects={subjects} />
          )}
        </div>
      )}

      </>}
    </div>
  );
}
