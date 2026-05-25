import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { studentService, type StudentDoc } from '../../services/studentService';
import { examService, type ResultDoc } from '../../services/examService';
import { getInitials } from '../../lib/utils';

type SortKey = 'rank' | 'rollNo' | 'name';

interface EnrichedStudent extends StudentDoc {
  result?: ResultDoc;
}

function GradeBadge({ grade, isPassed }: { grade: string; isPassed: boolean }) {
  const color = isPassed
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400';
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${color}`}>
      {grade}
    </span>
  );
}

function Avatar({ name, photoUrl, size = 'md' }: { name: string; photoUrl?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'sm' ? 'w-9 h-9 text-xs' : 'w-12 h-12 text-sm';
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-2xl object-cover shrink-0`}
      />
    );
  }
  const colors = [
    'from-blue-500 to-blue-700',
    'from-violet-500 to-violet-700',
    'from-emerald-500 to-emerald-700',
    'from-rose-500 to-rose-700',
    'from-amber-500 to-orange-600',
    'from-teal-500 to-teal-700',
    'from-indigo-500 to-indigo-700',
    'from-pink-500 to-pink-700',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${sizeClass} rounded-2xl bg-linear-to-br ${color} flex items-center justify-center text-white font-bold shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

export default function ClassFellowsPage() {
  const user = useAuthStore(s => s.user);
  const [sortBy, setSortBy] = useState<SortKey>('rank');

  const { data: me } = useQuery({
    queryKey: ['student-me'],
    queryFn: studentService.getMe,
  });

  const classId = me?.classId
    ? (typeof me.classId === 'string' ? me.classId : me.classId._id)
    : undefined;
  const sectionId = me?.sectionId
    ? (typeof me.sectionId === 'string' ? me.sectionId : me.sectionId._id)
    : undefined;
  const className = me?.classId && typeof me.classId !== 'string' ? me.classId.name : '';
  const sectionName = me?.sectionId && typeof me.sectionId !== 'string' ? me.sectionId.name : '';

  const { data: studentsResp, isLoading: loadingStudents } = useQuery({
    queryKey: ['class-fellows', classId, sectionId],
    queryFn: () => studentService.list({ classId: classId!, sectionId: sectionId!, status: 'active' }),
    enabled: !!classId && !!sectionId,
  });
  const students: StudentDoc[] = studentsResp?.data ?? [];

  const { data: exams = [] } = useQuery({
    queryKey: ['exams-list'],
    queryFn: () => examService.list(),
  });

  const latestExam = useMemo(() =>
    exams
      .filter(e => e.isPublished)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0],
    [exams]
  );

  const { data: results = [] } = useQuery({
    queryKey: ['class-results', latestExam?._id, sectionId],
    queryFn: () => examService.getResults({ examId: latestExam!._id }),
    enabled: !!latestExam,
  });

  const resultMap = useMemo(() => {
    const map = new Map<string, ResultDoc>();
    results.forEach(r => {
      const sid = typeof r.studentId === 'string' ? r.studentId : (r.studentId as { _id: string })._id;
      map.set(sid, r);
    });
    return map;
  }, [results]);

  const enriched: EnrichedStudent[] = useMemo(() => {
    const list = students.map(s => ({ ...s, result: resultMap.get(s._id) }));
    if (sortBy === 'rank') {
      return list.sort((a, b) => {
        const ra = a.result?.classPosition ?? 9999;
        const rb = b.result?.classPosition ?? 9999;
        if (ra !== rb) return ra - rb;
        return (b.result?.percentage ?? 0) - (a.result?.percentage ?? 0);
      });
    }
    if (sortBy === 'rollNo') return list.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }));
    return list.sort((a, b) => a.profile.name.localeCompare(b.profile.name));
  }, [students, resultMap, sortBy]);

  const topper = useMemo(() =>
    enriched.find(s => s.result?.classPosition === 1) ??
    [...enriched].sort((a, b) => (b.result?.percentage ?? 0) - (a.result?.percentage ?? 0))[0],
    [enriched]
  );

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'rank',   label: 'By Rank' },
    { key: 'rollNo', label: 'By Roll No' },
    { key: 'name',   label: 'By Name' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-8">

      {/* ── PAGE HEADER ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">
          Class Fellows
        </h1>
        <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">
          {className && sectionName ? `${className} — Section ${sectionName}` : className || 'Your classmates'}
          {students.length > 0 && ` · ${students.length} students`}
        </p>
      </div>

      {/* ── CLASS TOPPER BANNER ── */}
      {topper?.result && (
        <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-amber-500 via-amber-400 to-orange-400 p-5 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -right-10 bottom-0 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="shrink-0 text-4xl leading-none">🏆</div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar
                name={topper.profile.name}
                photoUrl={topper.profile.photoUrl}
                size="md"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white/70 uppercase tracking-widest mb-0.5">
                  Class Topper — {latestExam?.name ?? 'Latest Exam'}
                </p>
                <p className="text-lg font-extrabold text-white truncate">{topper.profile.name}</p>
                <p className="text-sm text-white/80">
                  Roll #{topper.rollNo} &nbsp;·&nbsp;
                  {topper.result.grade} &nbsp;·&nbsp; {Math.round(topper.result.percentage)}%
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right hidden sm:block">
              <p className="text-3xl font-extrabold text-white">{Math.round(topper.result.percentage)}%</p>
              <p className="text-xs text-white/70">{topper.result.totalMarksObtained}/{topper.result.totalMarks} marks</p>
            </div>
          </div>
        </div>
      )}

      {/* ── SORT BAR ── */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-slate-500 font-medium mr-1">Sort:</span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-150 ${
              sortBy === opt.key
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── STUDENT CARDS ── */}
      {loadingStudents ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : enriched.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-gray-400 dark:text-slate-500 text-sm">No classmates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {enriched.map((student, idx) => {
            const isMe = student._id === me?._id || student.profile.name === user?.name;
            const rank = student.result?.classPosition ?? (sortBy === 'rank' ? idx + 1 : undefined);
            const pct = student.result?.percentage;
            return (
              <div
                key={student._id}
                className={`card p-4 flex items-center gap-3.5 transition-all duration-150 ${
                  isMe
                    ? 'border-2 border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-md'
                }`}
              >
                {/* Rank number (left side) */}
                <div className="shrink-0 w-7 text-center">
                  {rank === 1 ? (
                    <span className="text-xl">🥇</span>
                  ) : rank === 2 ? (
                    <span className="text-xl">🥈</span>
                  ) : rank === 3 ? (
                    <span className="text-xl">🥉</span>
                  ) : rank ? (
                    <span className="text-xs font-bold text-gray-400 dark:text-slate-500">#{rank}</span>
                  ) : (
                    <span className="text-xs text-gray-300 dark:text-slate-600">—</span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar name={student.profile.name} photoUrl={student.profile.photoUrl} size="md" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">
                      {student.profile.name}
                    </p>
                    {isMe && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    Roll #{student.rollNo}
                  </p>
                </div>

                {/* Result badges */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {student.result ? (
                    <>
                      <GradeBadge grade={student.result.grade} isPassed={student.result.isPassed} />
                      {pct !== undefined && (
                        <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">
                          {Math.round(pct)}%
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[11px] text-gray-300 dark:text-slate-600">No result</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!latestExam && students.length > 0 && (
        <p className="text-xs text-center text-gray-400 dark:text-slate-500">
          Ranks will appear once exam results are published
        </p>
      )}
    </div>
  );
}
