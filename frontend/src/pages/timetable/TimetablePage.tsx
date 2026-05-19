import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '../../services/academicService';
import { timetableService } from '../../services/timetableService';
import type { TimetableSlot } from '../../services/timetableService';
import { userService } from '../../services/userService';
import { studentService } from '../../services/studentService';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function slotKey(day: number, period: number) { return `${day}-${period}`; }

function TimetableGrid({ timetable, periods }: { timetable: import('../../services/timetableService').TimetableDoc; periods: number }) {
  const getSlot = (day: number, period: number) =>
    timetable.slots.find(s => s.dayOfWeek === day && s.periodNo === period);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-3 py-3 font-medium text-gray-500 w-20">Period</th>
            {DAYS.map((d, i) => (
              <th key={i} className="text-center px-3 py-3 font-medium text-gray-500">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: periods }, (_, p) => (
            <tr key={p} className="hover:bg-gray-50">
              <td className="px-3 py-3 font-mono text-gray-400 text-xs">{p + 1}</td>
              {DAYS.map((_, d) => {
                const slot = getSlot(d + 1, p + 1);
                const subject = typeof slot?.subjectId === 'object' ? slot.subjectId : null;
                const teacher = typeof slot?.teacherId === 'object' ? slot.teacherId : null;
                return (
                  <td key={d} className="px-2 py-2 text-center">
                    {slot ? (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-1.5 text-xs">
                        <div className="font-medium text-blue-800">{subject?.name ?? '—'}</div>
                        <div className="text-blue-500 mt-0.5">{teacher?.profile?.name?.split(' ')[0] ?? '—'}</div>
                        {slot.roomNo && <div className="text-gray-400">{slot.roomNo}</div>}
                      </div>
                    ) : (
                      <div className="text-gray-200">—</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StudentTimetableView() {
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
  const periods = timetable
    ? Math.max(...timetable.slots.map(s => s.periodNo), 8)
    : 8;

  const className = typeof student?.classId === 'object' ? student.classId.name : '';
  const sectionName = typeof student?.sectionId === 'object' ? student.sectionId.name : '';

  if (loadingProfile || isLoading) {
    return <div className="p-6 text-center text-gray-400 text-sm py-20">Loading timetable...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="My Timetable"
        subtitle={className && sectionName ? `${className} — Section ${sectionName}` : undefined}
      />
      <div className="card overflow-hidden">
        {!timetable ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">No timetable has been set up for your class yet.</div>
        ) : (
          <TimetableGrid timetable={timetable} periods={periods} />
        )}
      </div>
    </div>
  );
}

export default function TimetablePage() {
  const user = useAuthStore(s => s.user);
  if (user?.role === 'student') return <StudentTimetableView />;
  return <StaffTimetableView />;
}

function StaffTimetableView() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();

  const [view, setView] = useState<'class' | 'teacher'>('class');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editSlots, setEditSlots] = useState<TimetableSlot[]>([]);
  const [editTimetableId, setEditTimetableId] = useState<string | null>(null);
  const [periods, setPeriods] = useState(8);
  const [apiError, setApiError] = useState('');

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

  const createMutation = useMutation({
    mutationFn: (slots: TimetableSlot[]) =>
      timetableService.create({ classId, sectionId, academicYearId: currentYear!._id, slots }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['timetable'] }); setEditOpen(false); setApiError(''); },
    onError: (e: { response?: { data?: { message?: string } } }) => setApiError(e?.response?.data?.message ?? 'Failed to save timetable'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, slots }: { id: string; slots: TimetableSlot[] }) => timetableService.update(id, { slots }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['timetable'] }); setEditOpen(false); setApiError(''); },
    onError: (e: { response?: { data?: { message?: string } } }) => setApiError(e?.response?.data?.message ?? 'Failed to save timetable'),
  });

  const openEdit = () => {
    const slots: TimetableSlot[] = timetable
      ? timetable.slots.map(s => ({
          dayOfWeek: s.dayOfWeek,
          periodNo: s.periodNo,
          subjectId: typeof s.subjectId === 'object' ? s.subjectId._id : s.subjectId,
          teacherId: typeof s.teacherId === 'object' ? s.teacherId._id : s.teacherId,
          roomNo: s.roomNo,
        }))
      : [];
    setEditSlots(slots);
    setEditTimetableId(timetable?._id ?? null);
    setApiError('');
    setEditOpen(true);
  };

  const setSlot = (day: number, period: number, field: keyof TimetableSlot, value: string) => {
    setEditSlots(prev => {
      const key = slotKey(day, period);
      const existing = prev.find(s => slotKey(s.dayOfWeek, s.periodNo) === key);
      if (!value) return prev.filter(s => slotKey(s.dayOfWeek, s.periodNo) !== key);
      if (existing) return prev.map(s => slotKey(s.dayOfWeek, s.periodNo) === key ? { ...s, [field]: value } : s);
      const newSlot: TimetableSlot = { dayOfWeek: day, periodNo: period, subjectId: '', teacherId: '', [field]: value };
      return [...prev, newSlot];
    });
  };

  const getSlot = (day: number, period: number) =>
    editSlots.find(s => slotKey(s.dayOfWeek, s.periodNo) === slotKey(day, period));

  const getTimetableSlot = (day: number, period: number) =>
    timetable?.slots.find(s => s.dayOfWeek === day && s.periodNo === period);

  const handleSave = () => {
    const validSlots = editSlots.filter(s => s.subjectId && s.teacherId);
    if (editTimetableId) updateMutation.mutate({ id: editTimetableId, slots: validSlots });
    else createMutation.mutate(validSlots);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const canEdit = user?.role === 'branch_principal' || user?.role === 'it_admin' || user?.role === 'group_admin';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Timetable"
        actions={canEdit && view === 'class' && sectionId ? (
          <button onClick={openEdit} className="btn-primary text-sm">
            {timetable ? 'Edit Timetable' : 'Create Timetable'}
          </button>
        ) : undefined}
      />

      {/* Controls */}
      <div className="card p-4 mb-5">
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex gap-1 rounded-lg border border-gray-200 p-1">
            <button onClick={() => setView('class')} className={cn('px-3 py-1.5 text-sm rounded-md transition-colors', view === 'class' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50')}>Class View</button>
            <button onClick={() => setView('teacher')} className={cn('px-3 py-1.5 text-sm rounded-md transition-colors', view === 'teacher' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50')}>Teacher View</button>
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
                {teachers.map((t: { _id: string; profile?: { name: string } }) => (
                  <option key={t._id} value={t._id}>{t.profile?.name ?? t._id}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading && <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>}

      {!isLoading && (view === 'class' ? !sectionId : !teacherFilter) && (
        <div className="text-center py-12 text-gray-400 text-sm">
          {view === 'class' ? 'Select a class and section to view timetable.' : 'Select a teacher to view their schedule.'}
        </div>
      )}

      {!isLoading && ((view === 'class' && sectionId) || (view === 'teacher' && teacherFilter)) && (
        <div className="card overflow-hidden">
          {!timetable ? (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">
              No timetable found.{canEdit && view === 'class' && ' Click "Create Timetable" to set one up.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-3 py-3 font-medium text-gray-500 w-20">Period</th>
                    {DAYS.map((d, i) => (
                      <th key={i} className="text-center px-3 py-3 font-medium text-gray-500">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.from({ length: periods }, (_, p) => (
                    <tr key={p} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-mono text-gray-400 text-xs">{p + 1}</td>
                      {DAYS.map((_, d) => {
                        const slot = getTimetableSlot(d + 1, p + 1);
                        const subject = typeof slot?.subjectId === 'object' ? slot.subjectId : null;
                        const teacher = typeof slot?.teacherId === 'object' ? slot.teacherId : null;
                        return (
                          <td key={d} className="px-2 py-2 text-center">
                            {slot ? (
                              <div className="bg-blue-50 border border-blue-100 rounded-lg p-1.5 text-xs">
                                <div className="font-medium text-blue-800">{subject?.name ?? '—'}</div>
                                {view === 'class' && <div className="text-blue-500 mt-0.5">{teacher?.profile?.name?.split(' ')[0] ?? '—'}</div>}
                                {slot.roomNo && <div className="text-gray-400">{slot.roomNo}</div>}
                              </div>
                            ) : (
                              <div className="text-gray-200">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editTimetableId ? 'Edit Timetable' : 'Create Timetable'} size="xl">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Periods per day:</label>
            <select value={periods} onChange={e => setPeriods(Number(e.target.value))} className="text-sm border border-gray-200 rounded-lg px-2 py-1">
              {[6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {apiError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{apiError}</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-2 py-2 font-medium text-gray-500 w-14">Period</th>
                  {DAY_SHORT.map((d, i) => (
                    <th key={i} className="text-center px-1 py-2 font-medium text-gray-500 min-w-35">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: periods }, (_, p) => (
                  <tr key={p}>
                    <td className="px-2 py-1.5 font-mono text-gray-400">{p + 1}</td>
                    {DAYS.map((_, d) => {
                      const slot = getSlot(d + 1, p + 1);
                      return (
                        <td key={d} className="px-1 py-1.5">
                          <div className="space-y-1">
                            <select
                              value={typeof slot?.subjectId === 'string' ? slot.subjectId : ''}
                              onChange={e => setSlot(d + 1, p + 1, 'subjectId', e.target.value)}
                              className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            >
                              <option value="">Subject</option>
                              {subjects.map((s: { _id: string; name: string }) => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                            <select
                              value={typeof slot?.teacherId === 'string' ? slot.teacherId : ''}
                              onChange={e => setSlot(d + 1, p + 1, 'teacherId', e.target.value)}
                              className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            >
                              <option value="">Teacher</option>
                              {teachers.map((t: { _id: string; profile?: { name: string } }) => <option key={t._id} value={t._id}>{t.profile?.name ?? t._id}</option>)}
                            </select>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={isPending} className="btn-primary">
              {isPending ? 'Saving...' : 'Save Timetable'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
