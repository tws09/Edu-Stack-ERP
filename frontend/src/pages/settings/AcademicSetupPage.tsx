import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicService } from '../../services/academicService';
import type { AcademicYear, ClassDoc, SectionDoc, SubjectDoc } from '../../services/academicService';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import AcademicSetupWizard from './AcademicSetupWizard';

const CLASS_LEVELS = [
  { value: 'grade_9', label: 'Grade 9' },
  { value: 'grade_10', label: 'Grade 10' },
  { value: 'grade_11', label: 'Grade 11' },
  { value: 'grade_12', label: 'Grade 12' },
  { value: 'inter_1', label: 'Intermediate Part I' },
  { value: 'inter_2', label: 'Intermediate Part II' },
];

type Tab = 'years' | 'classes' | 'sections' | 'subjects';

export default function AcademicSetupPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('years');
  const [modal, setModal] = useState<{ type: string; data?: Record<string, unknown> } | null>(null);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [wizardDismissed, setWizardDismissed] = useState(false);

  const { data: years = [], isLoading: yearsLoading } = useQuery({ queryKey: ['years'], queryFn: academicService.getYears });
  const { data: classes = [] } = useQuery({ queryKey: ['classes', selectedYearId], queryFn: () => academicService.getClasses(selectedYearId || undefined) });
  const { data: sections = [] } = useQuery({ queryKey: ['sections', selectedClassId], queryFn: () => academicService.getSections(selectedClassId || undefined) });
  const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: () => academicService.getSubjects() });

  // Show wizard on first-time setup (no years configured yet)
  const showWizard = !yearsLoading && years.length === 0 && !wizardDismissed;
  if (showWizard) {
    return (
      <AcademicSetupWizard
        years={years} classes={classes} sections={sections} subjects={subjects}
        onExit={() => setWizardDismissed(true)}
      />
    );
  }

  const createYear = useMutation({ mutationFn: academicService.createYear, onSuccess: () => { qc.invalidateQueries({ queryKey: ['years'] }); setModal(null); } });
  const createClass = useMutation({ mutationFn: academicService.createClass, onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); setModal(null); } });
  const createSection = useMutation({ mutationFn: academicService.createSection, onSuccess: () => { qc.invalidateQueries({ queryKey: ['sections'] }); setModal(null); } });
  const createSubject = useMutation({ mutationFn: academicService.createSubject, onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); setModal(null); } });
  const deleteClass = useMutation({ mutationFn: academicService.deleteClass, onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }) });
  const deleteSection = useMutation({ mutationFn: academicService.deleteSection, onSuccess: () => qc.invalidateQueries({ queryKey: ['sections'] }) });
  const deleteSubject = useMutation({ mutationFn: academicService.deleteSubject, onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }) });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'years', label: 'Academic Years' },
    { id: 'classes', label: 'Classes' },
    { id: 'sections', label: 'Sections' },
    { id: 'subjects', label: 'Subjects' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader title="Academic Setup" subtitle="Configure academic years, classes, sections, and subjects" />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg mb-6 w-fit">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === t.id ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Academic Years */}
      {tab === 'years' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Academic Years</h2>
            <button onClick={() => setModal({ type: 'year' })} className="btn-primary">+ Add Year</button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
            {years.map((y) => (
              <div key={y._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">{y.label}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{new Date(y.startDate).toLocaleDateString()} – {new Date(y.endDate).toLocaleDateString()}</p>
                </div>
                {y.isCurrent && <Badge variant="success">Current</Badge>}
              </div>
            ))}
            {years.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-slate-500">No academic years yet.</div>}
          </div>
        </div>
      )}

      {/* Classes */}
      {tab === 'classes' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-gray-900 dark:text-slate-100">Classes</h2>
              <select value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)}
                className="text-sm border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg px-2 py-1">
                <option value="">All Years</option>
                {years.map(y => <option key={y._id} value={y._id}>{y.label}</option>)}
              </select>
            </div>
            <button onClick={() => setModal({ type: 'class' })} className="btn-primary">+ Add Class</button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
            {classes.map((c) => (
              <div key={c._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">{c.name}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{CLASS_LEVELS.find(l => l.value === c.level)?.label}</p>
                </div>
                <button onClick={() => deleteClass.mutate(c._id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
            {classes.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-slate-500">No classes yet.</div>}
          </div>
        </div>
      )}

      {/* Sections */}
      {tab === 'sections' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-gray-900 dark:text-slate-100">Sections</h2>
              <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-sm border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg px-2 py-1">
                <option value="">All Classes</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <button onClick={() => setModal({ type: 'section' })} className="btn-primary">+ Add Section</button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
            {sections.map((s) => (
              <div key={s._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-gray-900">Section {s.name}</p>
                  {s.capacity && <p className="text-xs text-gray-400">Capacity: {s.capacity}</p>}
                </div>
                <button onClick={() => deleteSection.mutate(s._id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
            {sections.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-slate-500">No sections yet.</div>}
          </div>
        </div>
      )}

      {/* Subjects */}
      {tab === 'subjects' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Subjects</h2>
            <button onClick={() => setModal({ type: 'subject' })} className="btn-primary">+ Add Subject</button>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
            {subjects.map((s) => (
              <div key={s._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">{s.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{s.code}</p>
                </div>
                <div className="flex items-center gap-3">
                  {s.isElective && <Badge variant="purple">Elective</Badge>}
                  <button onClick={() => deleteSubject.mutate(s._id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
              </div>
            ))}
            {subjects.length === 0 && <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-slate-500">No subjects yet.</div>}
          </div>
        </div>
      )}

      {/* Create Year Modal */}
      <Modal open={modal?.type === 'year'} onClose={() => setModal(null)} title="Add Academic Year">
        <YearForm onSubmit={(d) => createYear.mutate(d)} loading={createYear.isPending} />
      </Modal>

      {/* Create Class Modal */}
      <Modal open={modal?.type === 'class'} onClose={() => setModal(null)} title="Add Class">
        <ClassForm years={years} onSubmit={(d) => createClass.mutate(d)} loading={createClass.isPending} />
      </Modal>

      {/* Create Section Modal */}
      <Modal open={modal?.type === 'section'} onClose={() => setModal(null)} title="Add Section">
        <SectionForm classes={classes} onSubmit={(d) => createSection.mutate(d)} loading={createSection.isPending} />
      </Modal>

      {/* Create Subject Modal */}
      <Modal open={modal?.type === 'subject'} onClose={() => setModal(null)} title="Add Subject">
        <SubjectForm onSubmit={(d) => createSubject.mutate(d)} loading={createSubject.isPending} />
      </Modal>
    </div>
  );
}

function YearForm({ onSubmit, loading }: { onSubmit: (d: Partial<AcademicYear>) => void; loading: boolean }) {
  const [form, setForm] = useState({ label: '', startDate: '', endDate: '', isCurrent: false });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Year Label (e.g. 2024-25)</label>
        <input className="input" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label">Start Date</label><input type="date" className="input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required /></div>
        <div><label className="label">End Date</label><input type="date" className="input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required /></div>
      </div>
      <label className="flex items-center gap-2 text-sm dark:text-slate-300"><input type="checkbox" checked={form.isCurrent} onChange={e => setForm(f => ({ ...f, isCurrent: e.target.checked }))} /> Set as current year</label>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : 'Create Year'}</button>
    </form>
  );
}

function ClassForm({ years, onSubmit, loading }: { years: AcademicYear[]; onSubmit: (d: Partial<ClassDoc>) => void; loading: boolean }) {
  const [form, setForm] = useState({ name: '', level: '', academicYearId: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Class Name</label>
        <input className="input" placeholder="e.g. 9-A Science" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
      </div>
      <div>
        <label className="label">Level</label>
        <select className="input" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} required>
          <option value="">Select level...</option>
          {CLASS_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Academic Year</label>
        <select className="input" value={form.academicYearId} onChange={e => setForm(f => ({ ...f, academicYearId: e.target.value }))} required>
          <option value="">Select year...</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.label}</option>)}
        </select>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : 'Create Class'}</button>
    </form>
  );
}

function SectionForm({ classes, onSubmit, loading }: { classes: ClassDoc[]; onSubmit: (d: Partial<SectionDoc>) => void; loading: boolean }) {
  const [form, setForm] = useState({ name: '', classId: '', capacity: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, capacity: form.capacity ? parseInt(form.capacity) : undefined }); }} className="space-y-4">
      <div>
        <label className="label">Class</label>
        <select className="input" value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))} required>
          <option value="">Select class...</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Section Name (e.g. A, B, Science)</label>
        <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
      </div>
      <div>
        <label className="label">Capacity (optional)</label>
        <input type="number" className="input" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : 'Create Section'}</button>
    </form>
  );
}

function SubjectForm({ onSubmit, loading }: { onSubmit: (d: Partial<SubjectDoc>) => void; loading: boolean }) {
  const [form, setForm] = useState({ name: '', code: '', isElective: false });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="label">Subject Name</label>
        <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
      </div>
      <div>
        <label className="label">Subject Code</label>
        <input className="input" placeholder="e.g. PHY, MATH, ENG" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required />
      </div>
      <label className="flex items-center gap-2 text-sm dark:text-slate-300"><input type="checkbox" checked={form.isElective} onChange={e => setForm(f => ({ ...f, isElective: e.target.checked }))} /> Elective subject</label>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : 'Create Subject'}</button>
    </form>
  );
}
