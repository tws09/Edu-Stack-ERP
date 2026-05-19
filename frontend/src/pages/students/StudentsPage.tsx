import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import type { CreateStudentPayload } from '../../services/studentService';
import { academicService } from '../../services/academicService';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

const STATUS_VARIANTS = { applied: 'warning', enrolled: 'info', active: 'success', graduated: 'default', transferred: 'purple', withdrawn: 'danger' } as const;

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

function StudentProfileView() {
  const { data: student, isLoading } = useQuery({ queryKey: ['my-profile'], queryFn: studentService.getMe });

  if (isLoading) return <div className="p-6 text-center text-gray-400 text-sm">Loading profile...</div>;
  if (!student) return <div className="p-6 text-center text-gray-400 text-sm">Profile not found.</div>;

  const className = typeof student.classId === 'object' ? student.classId.name : '—';
  const sectionName = typeof student.sectionId === 'object' ? student.sectionId.name : '—';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="My Profile" />

      {/* Identity card */}
      <div className="card p-5 mb-4 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shrink-0">
          {student.profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{student.profile.name}</h2>
          <p className="text-sm text-gray-500">{className} — Section {sectionName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-gray-400">Roll No: {student.rollNo}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs font-mono text-gray-400">Adm: {student.admissionNo}</span>
            <Badge variant={STATUS_VARIANTS[student.status as keyof typeof STATUS_VARIANTS] ?? 'default'}>{student.status}</Badge>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="card p-5 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Personal Information</p>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Date of Birth" value={formatDate(student.profile.dateOfBirth)} />
          <InfoRow label="Gender" value={student.profile.gender.charAt(0).toUpperCase() + student.profile.gender.slice(1)} />
          <InfoRow label="CNIC / B-Form" value={student.profile.cnicOrBForm} />
          <InfoRow label="Admission Date" value={formatDate(student.admissionDate)} />
          {student.profile.address && <div className="col-span-2"><InfoRow label="Address" value={student.profile.address} /></div>}
        </div>
      </div>

      {/* Guardian info */}
      <div className="card p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Guardian Information</p>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Father's Name" value={student.guardianInfo.fatherName} />
          <InfoRow label="Father's Phone" value={student.guardianInfo.fatherPhone} />
          {student.guardianInfo.fatherCnic && <InfoRow label="Father's CNIC" value={student.guardianInfo.fatherCnic} />}
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const user = useAuthStore(s => s.user);
  if (user?.role === 'student') return <StudentProfileView />;
  return <StaffStudentsView />;
}

function StaffStudentsView() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addResult, setAddResult] = useState<{ tempPassword: string; admissionNo: string } | null>(null);

  const { data: years = [] } = useQuery({ queryKey: ['years'], queryFn: academicService.getYears });
  const currentYear = years.find(y => y.isCurrent) ?? years[0];
  const { data: classes = [] } = useQuery({ queryKey: ['classes', currentYear?._id], queryFn: () => academicService.getClasses(currentYear?._id), enabled: !!currentYear });
  const { data: sections = [] } = useQuery({ queryKey: ['sections', classFilter], queryFn: () => academicService.getSections(classFilter || undefined) });

  const params: Record<string, string> = {};
  if (classFilter) params.classId = classFilter;
  if (sectionFilter) params.sectionId = sectionFilter;
  if (statusFilter) params.status = statusFilter;
  if (currentYear) params.academicYearId = currentYear._id;

  const { data: result, isLoading } = useQuery({
    queryKey: ['students', params],
    queryFn: () => studentService.list(params),
    enabled: !!currentYear,
  });

  const students = result?.data ?? [];
  const total = result?.meta?.total ?? 0;

  const createStudent = useMutation({
    mutationFn: studentService.create,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['students'] });
      setShowAdd(false);
      if (data) setAddResult({ tempPassword: data.tempPassword, admissionNo: data.student.admissionNo });
    },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Students"
        subtitle={`${total} students`}
        actions={
          <button onClick={() => setShowAdd(true)} className="btn-primary">+ Admit Student</button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <select value={classFilter} onChange={e => { setClassFilter(e.target.value); setSectionFilter(''); }} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} disabled={!classFilter} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 disabled:opacity-50">
          <option value="">All Sections</option>
          {sections.map(s => <option key={s._id} value={s._id}>Section {s.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
          <option value="">All Status</option>
          {['applied', 'enrolled', 'active', 'graduated', 'transferred', 'withdrawn'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Roll No</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Class / Section</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Guardian</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Admitted</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            )}
            {!isLoading && students.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No students found.</td></tr>
            )}
            {students.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-gray-600">{s.rollNo}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{s.profile.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {typeof s.classId === 'object' ? s.classId.name : '—'}
                  {typeof s.sectionId === 'object' ? ` / ${s.sectionId.name}` : ''}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <p>{s.guardianInfo.fatherName}</p>
                  <p className="text-xs text-gray-400">{s.guardianInfo.fatherPhone}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(s.admissionDate)}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANTS[s.status as keyof typeof STATUS_VARIANTS] ?? 'default'}>
                    {s.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admission form */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Admit New Student" size="xl">
        <AdmissionForm
          classes={classes}
          sections={sections}
          years={years}
          selectedClassId={classFilter}
          onClassChange={setClassFilter}
          onSubmit={(d) => createStudent.mutate(d)}
          loading={createStudent.isPending}
        />
      </Modal>

      {/* Success result */}
      {addResult && (
        <Modal open={!!addResult} onClose={() => setAddResult(null)} title="Student Admitted Successfully">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">The student has been registered. Share these login credentials:</p>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm space-y-1">
              <p><span className="text-gray-500">Admission No:</span> <strong>{addResult.admissionNo}</strong></p>
              <p><span className="text-gray-500">Temp Password:</span> <strong>{addResult.tempPassword}</strong></p>
            </div>
            <p className="text-xs text-gray-400">Student should change password on first login.</p>
            <button onClick={() => setAddResult(null)} className="btn-primary w-full">Done</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface AdmissionFormProps {
  classes: import('../../services/academicService').ClassDoc[];
  sections: import('../../services/academicService').SectionDoc[];
  years: import('../../services/academicService').AcademicYear[];
  selectedClassId: string;
  onClassChange: (id: string) => void;
  onSubmit: (d: CreateStudentPayload) => void;
  loading: boolean;
}

function AdmissionForm({ classes, sections, years, selectedClassId, onClassChange, onSubmit, loading }: AdmissionFormProps) {
  const [form, setForm] = useState({
    email: '',
    classId: selectedClassId,
    sectionId: '',
    academicYearId: years.find(y => y.isCurrent)?._id ?? years[0]?._id ?? '',
    previousSchool: '',
    profile: { name: '', dateOfBirth: '', gender: 'male' as const, cnicOrBForm: '', address: '' },
    guardianInfo: { fatherName: '', fatherPhone: '', fatherCnic: '', motherName: '', motherPhone: '' },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Student Information</p></div>

        <div><label className="label">Full Name *</label><input className="input" value={form.profile.name} onChange={e => setForm(f => ({ ...f, profile: { ...f.profile, name: e.target.value } }))} required /></div>
        <div><label className="label">Login Email *</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
        <div><label className="label">Date of Birth *</label><input type="date" className="input" value={form.profile.dateOfBirth} onChange={e => setForm(f => ({ ...f, profile: { ...f.profile, dateOfBirth: e.target.value } }))} required /></div>
        <div>
          <label className="label">Gender *</label>
          <select className="input" value={form.profile.gender} onChange={e => setForm(f => ({ ...f, profile: { ...f.profile, gender: e.target.value as 'male' | 'female' | 'other' } }))}>
            <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
          </select>
        </div>
        <div><label className="label">CNIC / B-Form *</label><input className="input" value={form.profile.cnicOrBForm} onChange={e => setForm(f => ({ ...f, profile: { ...f.profile, cnicOrBForm: e.target.value } }))} required /></div>
        <div><label className="label">Previous School</label><input className="input" value={form.previousSchool} onChange={e => setForm(f => ({ ...f, previousSchool: e.target.value }))} /></div>

        <div className="col-span-2 border-t border-gray-100 pt-4"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Enrollment</p></div>

        <div>
          <label className="label">Academic Year *</label>
          <select className="input" value={form.academicYearId} onChange={e => setForm(f => ({ ...f, academicYearId: e.target.value }))} required>
            {years.map(y => <option key={y._id} value={y._id}>{y.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Class *</label>
          <select className="input" value={form.classId} onChange={e => { setForm(f => ({ ...f, classId: e.target.value, sectionId: '' })); onClassChange(e.target.value); }} required>
            <option value="">Select class...</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Section *</label>
          <select className="input" value={form.sectionId} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))} required>
            <option value="">Select section...</option>
            {sections.map(s => <option key={s._id} value={s._id}>Section {s.name}</option>)}
          </select>
        </div>

        <div className="col-span-2 border-t border-gray-100 pt-4"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Guardian Information</p></div>

        <div><label className="label">Father's Name *</label><input className="input" value={form.guardianInfo.fatherName} onChange={e => setForm(f => ({ ...f, guardianInfo: { ...f.guardianInfo, fatherName: e.target.value } }))} required /></div>
        <div><label className="label">Father's Phone *</label><input className="input" value={form.guardianInfo.fatherPhone} onChange={e => setForm(f => ({ ...f, guardianInfo: { ...f.guardianInfo, fatherPhone: e.target.value } }))} required /></div>
        <div><label className="label">Father's CNIC</label><input className="input" value={form.guardianInfo.fatherCnic} onChange={e => setForm(f => ({ ...f, guardianInfo: { ...f.guardianInfo, fatherCnic: e.target.value } }))} /></div>
        <div><label className="label">Mother's Name</label><input className="input" value={form.guardianInfo.motherName} onChange={e => setForm(f => ({ ...f, guardianInfo: { ...f.guardianInfo, motherName: e.target.value } }))} /></div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
        {loading ? 'Registering...' : 'Register Student'}
      </button>
    </form>
  );
}
