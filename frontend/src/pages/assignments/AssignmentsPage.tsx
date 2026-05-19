import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '../../services/academicService';
import { assignmentService } from '../../services/assignmentService';
import type { AssignmentDoc, SubmissionDoc } from '../../services/assignmentService';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';
import { formatDate } from '../../lib/utils';

type Panel = 'list' | 'submissions';

function isPastDue(dueDate: string) { return new Date(dueDate) < new Date(); }

export default function AssignmentsPage() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const isStudent = user?.role === 'student';
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [panel, setPanel] = useState<Panel>('list');
  const [selected, setSelected] = useState<AssignmentDoc | null>(null);

  // Create form
  const [createOpen, setCreateOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formTotalMarks, setFormTotalMarks] = useState('');
  const [apiError, setApiError] = useState('');

  // Submit form (student)
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitText, setSubmitText] = useState('');
  const [submitTarget, setSubmitTarget] = useState<AssignmentDoc | null>(null);

  // Grade form
  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradeSubmission, setGradeSubmission] = useState<SubmissionDoc | null>(null);
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

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

  const assignmentParams: Record<string, string> = {};
  if (classId) assignmentParams['classId'] = classId;
  if (sectionId) assignmentParams['sectionId'] = sectionId;

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments', classId, sectionId],
    queryFn: () => assignmentService.list(assignmentParams),
    enabled: isStudent || (!!classId && !!sectionId),
  });

  const { data: submissions = [], isLoading: loadingSubs } = useQuery({
    queryKey: ['submissions', selected?._id],
    queryFn: () => assignmentService.getSubmissions(selected!._id),
    enabled: !!selected && panel === 'submissions',
  });

  const createMutation = useMutation({
    mutationFn: assignmentService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments'] }); setCreateOpen(false); resetForm(); },
    onError: (e: { response?: { data?: { message?: string } } }) => setApiError(e?.response?.data?.message ?? 'Failed to create'),
  });

  const submitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof assignmentService.submit>[1] }) =>
      assignmentService.submit(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assignments'] }); setSubmitOpen(false); setSubmitText(''); },
    onError: (e: { response?: { data?: { message?: string } } }) => setApiError(e?.response?.data?.message ?? 'Failed to submit'),
  });

  const gradeMutation = useMutation({
    mutationFn: ({ assignmentId, submissionId, data }: { assignmentId: string; submissionId: string; data: { marksAwarded: number; feedback?: string } }) =>
      assignmentService.grade(assignmentId, submissionId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['submissions'] }); setGradeOpen(false); setGradeMarks(''); setGradeFeedback(''); },
    onError: (e: { response?: { data?: { message?: string } } }) => setApiError(e?.response?.data?.message ?? 'Failed to grade'),
  });

  const resetForm = () => { setFormTitle(''); setFormDesc(''); setFormSubjectId(''); setFormDueDate(''); setFormTotalMarks(''); setApiError(''); };

  const handleCreate = () => {
    if (!formTitle || !formDueDate || !classId || !sectionId) { setApiError('Fill all required fields.'); return; }
    createMutation.mutate({
      title: formTitle,
      description: formDesc,
      classId,
      sectionId,
      subjectId: formSubjectId,
      dueDate: formDueDate,
      totalMarks: formTotalMarks ? Number(formTotalMarks) : undefined,
      isActive: true,
    } as Partial<AssignmentDoc>);
  };

  const handleSubmit = () => {
    if (!submitTarget || !user) return;
    submitMutation.mutate({ id: submitTarget._id, data: { studentId: user.id, textResponse: submitText } });
  };

  const handleGrade = () => {
    if (!gradeSubmission || !selected || !gradeMarks) return;
    gradeMutation.mutate({ assignmentId: selected._id, submissionId: gradeSubmission._id, data: { marksAwarded: Number(gradeMarks), feedback: gradeFeedback } });
  };

  const statusBadge = (s: SubmissionDoc) => {
    if (s.status === 'graded') return <Badge variant="success">Graded</Badge>;
    if (s.status === 'late') return <Badge variant="warning">Late</Badge>;
    return <Badge variant="info">Submitted</Badge>;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Assignments"
        actions={!isStudent && classId && sectionId ? (
          <button onClick={() => { resetForm(); setCreateOpen(true); }} className="btn-primary text-sm">+ Create Assignment</button>
        ) : undefined}
      />

      {/* Filters — hidden for students */}
      {!isStudent && (
        <div className="card p-4 mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="label">Class</label>
              <select className="input" value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); setSelected(null); setPanel('list'); }}>
                <option value="">Select class...</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Section</label>
              <select className="input" value={sectionId} onChange={e => { setSectionId(e.target.value); setSelected(null); setPanel('list'); }} disabled={!classId}>
                <option value="">Select section...</option>
                {sections.map(s => <option key={s._id} value={s._id}>Section {s.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="mb-4 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <span className="font-medium">{selected.title}</span>
          <span className="text-blue-400">Due {formatDate(selected.dueDate)}</span>
          <button
            onClick={() => setPanel(panel === 'list' ? 'submissions' : 'list')}
            className={cn('ml-auto text-xs px-3 py-1 rounded-lg border transition-colors',
              panel === 'submissions' ? 'bg-blue-600 text-white border-blue-600' : 'border-blue-200 text-blue-600 hover:bg-blue-50')}
          >
            {panel === 'submissions' ? 'Back to List' : 'View Submissions'}
          </button>
          <button onClick={() => { setSelected(null); setPanel('list'); }} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Assignment list */}
      {panel === 'list' && (
        <div className="card divide-y divide-gray-100">
          {isLoading && <div className="px-5 py-10 text-center text-gray-400 text-sm">Loading...</div>}
          {!isLoading && !isStudent && (!classId || !sectionId) && (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">Select a class and section.</div>
          )}
          {!isLoading && assignments.length === 0 && (isStudent || (classId && sectionId)) && (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">No assignments yet.</div>
          )}
          {assignments.map(a => {
            const pastDue = isPastDue(a.dueDate);
            const subject = typeof a.subjectId === 'object' ? a.subjectId : null;
            const creator = typeof a.createdById === 'object' ? a.createdById : null;
            return (
              <div key={a._id} className="flex items-start justify-between px-4 py-4 hover:bg-gray-50 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">{a.title}</p>
                    {subject && <Badge variant="info">{subject.name}</Badge>}
                    {pastDue && !isStudent && <Badge variant="warning">Past Due</Badge>}
                  </div>
                  {a.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Due {formatDate(a.dueDate)}
                    {a.totalMarks && ` · ${a.totalMarks} marks`}
                    {creator && ` · by ${creator.name}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {isStudent && (
                    <button
                      onClick={() => { setSubmitTarget(a); setSubmitText(''); setApiError(''); setSubmitOpen(true); }}
                      className="btn-secondary text-xs"
                      disabled={!a.isActive}
                    >
                      Submit
                    </button>
                  )}
                  {!isStudent && (
                    <button onClick={() => { setSelected(a); setPanel('submissions'); }} className="btn-secondary text-xs">
                      Submissions
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submissions panel (teacher view) */}
      {panel === 'submissions' && selected && (
        <div className="card overflow-hidden">
          {loadingSubs ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">No submissions yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Student</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Submitted</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Marks</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map(sub => {
                  const student = typeof sub.studentId === 'object' ? sub.studentId : null;
                  return (
                    <tr key={sub._id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{student?.profile.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{student?.rollNo}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">{formatDate(sub.submittedAt)}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(sub)}</td>
                      <td className="px-4 py-3 text-center font-medium">
                        {sub.marksAwarded != null ? `${sub.marksAwarded}/${selected.totalMarks ?? '—'}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {sub.textResponse && (
                          <span className="text-xs text-gray-500 mr-2 italic">"{sub.textResponse.slice(0, 40)}…"</span>
                        )}
                        <button
                          onClick={() => { setGradeSubmission(sub); setGradeMarks(String(sub.marksAwarded ?? '')); setGradeFeedback(sub.feedback ?? ''); setApiError(''); setGradeOpen(true); }}
                          className="text-xs px-3 py-1 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          Grade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create assignment modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); resetForm(); }} title="Create Assignment">
        <div className="space-y-4">
          {apiError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{apiError}</div>}
          <div>
            <label className="label">Title *</label>
            <input className="input" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Assignment title" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Instructions..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <select className="input" value={formSubjectId} onChange={e => setFormSubjectId(e.target.value)}>
                <option value="">Select subject...</option>
                {subjects.map((s: { _id: string; name: string }) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Total Marks</label>
              <input type="number" className="input" value={formTotalMarks} onChange={e => setFormTotalMarks(e.target.value)} placeholder="e.g. 20" />
            </div>
          </div>
          <div>
            <label className="label">Due Date *</label>
            <input type="date" className="input" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => { setCreateOpen(false); resetForm(); }} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Student submit modal */}
      <Modal open={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit Assignment">
        <div className="space-y-4">
          {submitTarget && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{submitTarget.title}</span>
              {submitTarget.totalMarks && <span className="text-gray-400"> · {submitTarget.totalMarks} marks</span>}
            </div>
          )}
          {apiError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{apiError}</div>}
          <div>
            <label className="label">Your Answer</label>
            <textarea className="input resize-none" rows={5} value={submitText} onChange={e => setSubmitText(e.target.value)} placeholder="Write your response here..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setSubmitOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={submitMutation.isPending || !submitText.trim()} className="btn-primary">
              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Grade modal */}
      <Modal open={gradeOpen} onClose={() => setGradeOpen(false)} title="Grade Submission">
        <div className="space-y-4">
          {gradeSubmission?.textResponse && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="text-xs text-gray-400 mb-1">Student response:</p>
              {gradeSubmission.textResponse}
            </div>
          )}
          {apiError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{apiError}</div>}
          <div>
            <label className="label">Marks Awarded{selected?.totalMarks ? ` (out of ${selected.totalMarks})` : ''}</label>
            <input type="number" className="input" value={gradeMarks} onChange={e => setGradeMarks(e.target.value)} min={0} max={selected?.totalMarks} placeholder="0" />
          </div>
          <div>
            <label className="label">Feedback (optional)</label>
            <textarea className="input resize-none" rows={3} value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)} placeholder="Write feedback..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setGradeOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleGrade} disabled={gradeMutation.isPending || !gradeMarks} className="btn-primary">
              {gradeMutation.isPending ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
