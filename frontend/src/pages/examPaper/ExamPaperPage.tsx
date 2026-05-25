import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Trash2, Edit2, Eye, CheckCircle, XCircle, Printer, Download, ChevronRight, BookOpen, Settings, ClipboardList, AlertCircle, ArrowLeft, Filter, Upload, LayoutTemplate, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Modal from '../../components/ui/Modal';
import { examTypeService, type ExamTypeDoc } from '../../services/examTypeService';
import { questionBankService, type QuestionDoc } from '../../services/questionBankService';
import { examPaperDraftService, type ExamPaperDoc, type PaperSection } from '../../services/examPaperDraftService';
import { examService } from '../../services/examService';
import { academicService } from '../../services/academicService';
import { branchHeaderService, type BranchHeaderConfig } from '../../services/branchHeaderService';
import { useAuthStore } from '../../stores/authStore';

type Tab = 'papers' | 'question-bank' | 'exam-types' | 'header';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  pending_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  printed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  printed: 'Printed',
};

// ─── Paper Header Preview (reused in HeaderTab + PaperPrintView) ─────────────
interface PaperHeaderPreviewProps {
  config: BranchHeaderConfig;
  paperInfo?: { subject: string; className: string; date: string; totalMarks: number | string };
  isUrdu?: boolean;
  compact?: boolean; // smaller scale for the designer preview
}

function PaperHeaderPreview({ config, paperInfo, isUrdu = false, compact = false }: PaperHeaderPreviewProps) {
  const initials = config.schoolName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 3)
    .join('')
    .toUpperCase() || '?';

  const dir = isUrdu ? 'rtl' : 'ltr';
  const sample = paperInfo ?? { subject: 'Physics', className: 'Grade 9-A', date: '—', totalMarks: 75 };

  return (
    <div dir={dir} className={`border-b-2 border-gray-800 dark:border-gray-400 pb-3 mb-4 ${compact ? 'text-xs' : ''}`}>
      {/* School branding row */}
      <div className={`flex items-center ${isUrdu ? 'flex-row-reverse' : ''} justify-center gap-4 mb-3`}>
        {config.logoBase64 ? (
          <img src={config.logoBase64} alt="logo" className={`object-contain shrink-0 ${compact ? 'w-10 h-10' : 'w-16 h-16'}`} />
        ) : (
          <div className={`rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold shrink-0 ${compact ? 'w-10 h-10 text-sm' : 'w-16 h-16 text-xl'}`}>
            {initials}
          </div>
        )}
        <div className={isUrdu ? 'text-right' : 'text-center'}>
          <h1 className={`font-bold text-gray-900 dark:text-white leading-tight ${compact ? 'text-sm' : 'text-xl'}`}>
            {config.schoolName || 'School Name'}
          </h1>
          {config.tagline && (
            <p className={`text-gray-500 dark:text-gray-400 mt-0.5 ${compact ? 'text-xs' : 'text-sm'}`}>{config.tagline}</p>
          )}
          {config.address && (
            <p className={`text-gray-400 dark:text-gray-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>{config.address}</p>
          )}
        </div>
      </div>

      {/* Exam info row */}
      <div className={`border-t border-gray-300 dark:border-gray-600 pt-2 grid grid-cols-4 gap-2 ${compact ? 'text-[10px]' : 'text-sm'}`}>
        <div className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Class:</span> {sample.className}
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Subject:</span> {sample.subject}
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Date:</span> {sample.date}
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Marks:</span> {sample.totalMarks}
        </div>
      </div>

      {/* Student fields row */}
      {(config.showStudentName || config.showRollNo || config.showSection) && (
        <div className={`grid grid-cols-3 gap-2 mt-1.5 ${compact ? 'text-[10px]' : 'text-sm'}`}>
          {config.showStudentName && (
            <div className="text-gray-700 dark:text-gray-300 flex items-baseline gap-1">
              <span className="font-medium shrink-0">Name:</span>
              <span className="flex-1 border-b border-gray-400 dark:border-gray-500" />
            </div>
          )}
          {config.showRollNo && (
            <div className="text-gray-700 dark:text-gray-300 flex items-baseline gap-1">
              <span className="font-medium shrink-0">Roll No:</span>
              <span className="flex-1 border-b border-gray-400 dark:border-gray-500" />
            </div>
          )}
          {config.showSection && (
            <div className="text-gray-700 dark:text-gray-300 flex items-baseline gap-1">
              <span className="font-medium shrink-0">Section:</span>
              <span className="flex-1 border-b border-gray-400 dark:border-gray-500" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Header Tab ───────────────────────────────────────────────────────────────
function HeaderTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState<BranchHeaderConfig>({
    schoolName: '', tagline: '', address: '', logoBase64: '',
    showStudentName: true, showRollNo: true, showSection: true,
  });
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['branch-header'],
    queryFn: branchHeaderService.get,
  });

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: () => branchHeaderService.save(form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branch-header'] }),
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setLogoError('Logo must be under 500 KB. Please compress the image and try again.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, logoBase64: reader.result as string }));
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500">
        <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading header config…</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── Left: Config form ── */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4" /> School Identity
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.schoolName}
                onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                placeholder="e.g. Gulshan Public School"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline / Motto</label>
              <input
                value={form.tagline}
                onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                placeholder="e.g. Excellence in Education"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Address / City</label>
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100"
                placeholder="e.g. Gulshan-e-Iqbal, Karachi"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">School Logo</label>
          {form.logoBase64 ? (
            <div className="flex items-center gap-3 p-3 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800">
              <img src={form.logoBase64} alt="logo" className="w-14 h-14 object-contain rounded-lg border border-gray-200 dark:border-gray-600 bg-white" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Logo uploaded</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Stored as base64 in database</p>
              </div>
              <button
                onClick={() => { setForm(f => ({ ...f, logoBase64: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Remove logo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#1e3a5f] dark:hover:border-blue-500 text-gray-400 dark:text-gray-500 hover:text-[#1e3a5f] dark:hover:text-blue-400 rounded-xl py-5 text-sm font-medium transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload Logo (max 500 KB)
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
          {logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">If no logo is uploaded, your school initials will appear instead.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Student info fields to print on paper</label>
          <div className="space-y-2">
            {([
              ['showStudentName', 'Student Name line'],
              ['showRollNo', 'Roll No line'],
              ['showSection', 'Section line'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${form[key] ? 'bg-[#1e3a5f] border-[#1e3a5f]' : 'border-gray-300 dark:border-gray-500'}`}
                >
                  {form[key] && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!form.schoolName.trim() || saveMutation.isPending}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg disabled:opacity-50 hover:bg-[#162d4a] transition-colors"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Header Config'}
          </button>
          {saveMutation.isSuccess && (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* ── Right: Live preview ── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Eye className="w-3.5 h-3.5" /> Live Preview
        </p>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <PaperHeaderPreview config={form} />
          <div className="space-y-3 mt-4">
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-full" />
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-4/5" />
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-full" />
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Class, Subject, Date and Marks auto-fill from the actual paper when printing.
          The placeholder values shown above are for preview only.
        </p>
      </div>
    </div>
  );
}

// ─── Exam Types Tab ──────────────────────────────────────────────────────────
function ExamTypesTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExamTypeDoc | null>(null);
  const [form, setForm] = useState({ name: '', totalMarks: '', sections: [{ name: '', type: 'MCQ' as 'MCQ' | 'SQ' | 'LQ', totalMarks: '', questionCount: '' }] });

  const { data: types = [], isLoading } = useQuery({ queryKey: ['exam-types'], queryFn: examTypeService.list });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', totalMarks: '', sections: [{ name: '', type: 'SQ', totalMarks: '', questionCount: '' }] });
    setOpen(true);
  };

  const openEdit = (t: ExamTypeDoc) => {
    setEditing(t);
    setForm({
      name: t.name,
      totalMarks: String(t.totalMarks),
      sections: t.sections.map(s => ({ name: s.name, type: s.type as 'MCQ' | 'SQ' | 'LQ', totalMarks: String(s.totalMarks), questionCount: String(s.questionCount) })),
    });
    setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        totalMarks: Number(form.totalMarks),
        sections: form.sections.map(s => ({ name: s.name, type: s.type, totalMarks: Number(s.totalMarks), questionCount: Number(s.questionCount) })),
      };
      return editing ? examTypeService.update(editing._id, payload) : examTypeService.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exam-types'] }); setOpen(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examTypeService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-types'] }),
  });

  const addSection = () => setForm(f => ({ ...f, sections: [...f.sections, { name: '', type: 'SQ', totalMarks: '', questionCount: '' }] }));
  const removeSection = (i: number) => setForm(f => ({ ...f, sections: f.sections.filter((_, idx) => idx !== i) }));
  const updateSection = (i: number, field: string, value: string) =>
    setForm(f => ({ ...f, sections: f.sections.map((s, idx) => idx === i ? { ...s, [field]: value } : s) }));

  const sectionSum = form.sections.reduce((sum, s) => sum + (Number(s.totalMarks) || 0), 0);
  const marksMatch = Number(form.totalMarks) > 0 && sectionSum === Number(form.totalMarks);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Define paper structures (sections, marks, question counts) for each exam type.</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-navy-700 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium bg-[#1e3a5f] hover:bg-[#162d4a]">
          <Plus className="w-4 h-4" /> Add Exam Type
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading…</p>
        </div>
      ) : types.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No exam types configured yet</p>
          <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">Add a template to define how papers are structured.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Marks</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sections</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {types.map((t, idx) => (
                <tr key={t._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{t.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{t.totalMarks} marks</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {t.sections.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                          <span className="font-medium">{s.name}</span>
                          <span className="text-gray-400 dark:text-gray-500">·</span>
                          <span>{s.questionCount}Q</span>
                          <span className="text-gray-400 dark:text-gray-500">·</span>
                          <span>{s.totalMarks}m</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${t.isActive ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(t)} title="Edit" className="p-1.5 text-gray-400 hover:text-[#1e3a5f] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this exam type?')) deleteMutation.mutate(t._id); }} title="Delete" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-400 dark:text-gray-500">
            {types.length} exam type{types.length !== 1 ? 's' : ''} total
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Exam Type' : 'New Exam Type'} size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border dark:border-gray-600 rounded-lg dark:hover:bg-gray-700">Cancel</button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={!form.name || !marksMatch || saveMutation.isPending}
              className="px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100" placeholder="e.g. Annual Exam" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Marks</label>
              <input type="number" value={form.totalMarks} onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100" placeholder="75" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sections</label>
              <button onClick={addSection} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Add Section</button>
            </div>
            <div className="space-y-2">
              {form.sections.map((s, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={s.name} onChange={e => updateSection(i, 'name', e.target.value)} placeholder="Section name" className="col-span-4 border dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm dark:bg-gray-700 dark:text-gray-100" />
                  <select value={s.type} onChange={e => updateSection(i, 'type', e.target.value)} className="col-span-2 border dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm dark:bg-gray-700 dark:text-gray-100">
                    <option value="MCQ">MCQ</option>
                    <option value="SQ">Short Q</option>
                    <option value="LQ">Long Q</option>
                  </select>
                  <input type="number" value={s.totalMarks} onChange={e => updateSection(i, 'totalMarks', e.target.value)} placeholder="Marks" className="col-span-2 border dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm dark:bg-gray-700 dark:text-gray-100" />
                  <input type="number" value={s.questionCount} onChange={e => updateSection(i, 'questionCount', e.target.value)} placeholder="Q Count" className="col-span-2 border dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm dark:bg-gray-700 dark:text-gray-100" />
                  <div className="col-span-1 text-xs text-gray-400 dark:text-gray-500 text-center">
                    {s.totalMarks && s.questionCount ? `${Number(s.totalMarks) / Number(s.questionCount)}m each` : ''}
                  </div>
                  {form.sections.length > 1 && (
                    <button onClick={() => removeSection(i)} className="col-span-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              ))}
            </div>
            {form.totalMarks && (
              <p className={`text-xs mt-2 ${marksMatch ? 'text-green-600' : 'text-red-500'}`}>
                Section sum: {sectionSum} / {form.totalMarks} marks {marksMatch ? '✓' : '(must match total)'}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Question Bank Tab ────────────────────────────────────────────────────────
type QRow = {
  text: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: [string, string, string, string]; // MCQ only
  correctAnswer: 'A' | 'B' | 'C' | 'D';    // MCQ only
};
const emptyRow = (): QRow => ({ text: '', chapter: '', difficulty: 'medium', options: ['', '', '', ''], correctAnswer: 'A' });

function QuestionBankTab() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editQ, setEditQ] = useState<QuestionDoc | null>(null);
  const [filters, setFilters] = useState({ subjectId: '', classId: '', type: '' as '' | 'MCQ' | 'SQ' | 'LQ', difficulty: '' });

  // Shared fields (bulk add)
  const [shared, setShared] = useState({ subjectId: '', classId: '', type: 'SQ' as 'MCQ' | 'SQ' | 'LQ', language: 'en' as 'en' | 'ur', chapter: '' });
  // Per-question rows (bulk add)
  const [rows, setRows] = useState<QRow[]>([emptyRow()]);
  // Edit single question form
  const [editForm, setEditForm] = useState({
    text: '', chapter: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    language: 'en' as 'en' | 'ur',
    options: ['', '', '', ''] as [string, string, string, string],
    correctAnswer: 'A' as 'A' | 'B' | 'C' | 'D',
  });

  const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: () => academicService.getSubjects() });
  const { data: classes = [] } = useQuery({ queryKey: ['classes'], queryFn: () => academicService.getClasses() });
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['question-bank', filters],
    queryFn: () => questionBankService.list({ ...filters, type: filters.type || undefined }),
  });

  const openCreate = () => {
    setEditQ(null);
    setShared({ subjectId: '', classId: '', type: 'SQ', language: 'en', chapter: '' });
    setRows([emptyRow()]);
    setView('add');
  };

  const openEdit = (q: QuestionDoc) => {
    setEditQ(q);
    setEditForm({
      text: q.text,
      chapter: q.chapter,
      difficulty: q.difficulty,
      language: q.language,
      options: (q.options && q.options.length === 4 ? q.options : ['', '', '', '']) as [string, string, string, string],
      correctAnswer: q.correctAnswer ?? 'A',
    });
    setView('edit');
  };

  const updateRow = (i: number, field: keyof QRow, value: string) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  const updateRowOption = (rowIdx: number, optIdx: number, value: string) =>
    setRows(prev => prev.map((r, i) => {
      if (i !== rowIdx) return r;
      const opts = [...r.options] as [string, string, string, string];
      opts[optIdx] = value;
      return { ...r, options: opts };
    }));

  const addRow = () => setRows(prev => [...prev, emptyRow()]);

  const removeRow = (i: number) => setRows(prev => prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i));

  const isMcqAdd = shared.type === 'MCQ';
  const isMcqEdit = editQ?.type === 'MCQ';

  const saveMutation = useMutation({
    mutationFn: async (): Promise<QuestionDoc[]> => {
      if (editQ) {
        const result = await questionBankService.update(editQ._id, {
          text: editForm.text, chapter: editForm.chapter,
          difficulty: editForm.difficulty, language: editForm.language,
          ...(isMcqEdit ? { options: editForm.options, correctAnswer: editForm.correctAnswer } : {}),
        });
        return [result];
      }
      // Bulk save — fire all rows in parallel
      return Promise.all(
        rows.filter(r => r.text.trim()).map(r =>
          questionBankService.create({
            subjectId: shared.subjectId, classId: shared.classId,
            type: shared.type, language: shared.language,
            text: r.text.trim(), chapter: shared.chapter.trim(), difficulty: r.difficulty,
            ...(isMcqAdd ? { options: r.options, correctAnswer: r.correctAnswer } : {}),
          })
        )
      );
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['question-bank'] }); setView('list'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionBankService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['question-bank'] }),
  });

  const canManage = user?.role === 'teacher' || user?.role === 'branch_principal' || user?.role === 'it_admin';
  const validRows = rows.filter(r => r.text.trim());

  // ── Add Questions page ──────────────────────────────────────────────────────
  if (view === 'add') {
    return (
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Questions to Bank</h2>
          </div>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!shared.subjectId || !shared.classId || !shared.chapter.trim() || validRows.length === 0 || saveMutation.isPending}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg disabled:opacity-50 hover:bg-[#162d4a] transition-colors"
          >
            {saveMutation.isPending ? 'Saving…' : `Save ${validRows.length > 0 ? validRows.length : ''} Question${validRows.length !== 1 ? 's' : ''}`}
          </button>
        </div>

        {/* Shared fields */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Shared fields — applied to every question below</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Subject <span className="text-red-500">*</span></label>
              <select value={shared.subjectId} onChange={e => setShared(s => ({ ...s, subjectId: e.target.value }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100">
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Class <span className="text-red-500">*</span></label>
              <select value={shared.classId} onChange={e => setShared(s => ({ ...s, classId: e.target.value }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100">
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Chapter / Topic <span className="text-red-500">*</span></label>
              <input
                value={shared.chapter}
                onChange={e => setShared(s => ({ ...s, chapter: e.target.value }))}
                className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                placeholder="e.g. Chapter 3 — Motion"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Question Type</label>
              <select value={shared.type} onChange={e => setShared(s => ({ ...s, type: e.target.value as 'MCQ' | 'SQ' | 'LQ' }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100">
                <option value="MCQ">MCQ</option>
                <option value="SQ">Short Question</option>
                <option value="LQ">Long Question</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
              <select value={shared.language} onChange={e => setShared(s => ({ ...s, language: e.target.value as 'en' | 'ur' }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100">
                <option value="en">English</option>
                <option value="ur">اردو</option>
              </select>
            </div>
          </div>
        </div>

        {/* Question rows */}
        <div className="space-y-4">
          {rows.map((row, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Q{i + 1}</span>
                {rows.length > 1 && (
                  <button onClick={() => removeRow(i)} className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>

              <textarea
                value={row.text}
                onChange={e => updateRow(i, 'text', e.target.value)}
                rows={isMcqAdd ? 2 : 3}
                dir={shared.language === 'ur' ? 'rtl' : 'ltr'}
                className={`w-full border dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 ${shared.language === 'ur' ? 'text-right' : ''}`}
                placeholder={shared.language === 'ur' ? 'سوال یہاں لکھیں…' : 'Write question text here…'}
              />

              {/* MCQ options */}
              {isMcqAdd && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Options</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map((letter, oi) => (
                      <div key={letter} className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${row.correctAnswer === letter ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                        <button
                          type="button"
                          onClick={() => updateRow(i, 'correctAnswer', letter)}
                          className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${row.correctAnswer === letter ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 dark:border-gray-500 text-gray-400 dark:text-gray-500 hover:border-green-400'}`}
                        >
                          {letter}
                        </button>
                        <input
                          value={row.options[oi]}
                          onChange={e => updateRowOption(i, oi, e.target.value)}
                          dir={shared.language === 'ur' ? 'rtl' : 'ltr'}
                          className="flex-1 text-sm outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-600 dark:text-gray-100"
                          placeholder={`Option ${letter}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Click a letter to mark it as the correct answer</p>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Difficulty</label>
                <select value={row.difficulty} onChange={e => updateRow(i, 'difficulty', e.target.value)} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#1e3a5f] dark:hover:border-blue-400 text-gray-400 dark:text-gray-500 hover:text-[#1e3a5f] dark:hover:text-blue-400 rounded-xl py-3 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Another Question
        </button>
      </div>
    );
  }

  // ── Edit Question page ──────────────────────────────────────────────────────
  if (view === 'edit' && editQ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Question</h2>
          </div>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!editForm.text.trim() || !editForm.chapter.trim() || saveMutation.isPending}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg disabled:opacity-50 hover:bg-[#162d4a] transition-colors"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-5 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
              <select value={editForm.difficulty} onChange={e => setEditForm(f => ({ ...f, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
              <select value={editForm.language} onChange={e => setEditForm(f => ({ ...f, language: e.target.value as 'en' | 'ur' }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100">
                <option value="en">English</option>
                <option value="ur">اردو</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chapter / Topic</label>
            <input value={editForm.chapter} onChange={e => setEditForm(f => ({ ...f, chapter: e.target.value }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100" placeholder="Chapter name or topic" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question Text</label>
            <textarea
              value={editForm.text}
              onChange={e => setEditForm(f => ({ ...f, text: e.target.value }))}
              rows={isMcqEdit ? 2 : 5}
              dir={editForm.language === 'ur' ? 'rtl' : 'ltr'}
              className={`w-full border dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 ${editForm.language === 'ur' ? 'text-right' : ''}`}
              placeholder={editForm.language === 'ur' ? 'سوال یہاں لکھیں' : 'Write your question here…'}
            />
          </div>

          {/* MCQ options edit */}
          {isMcqEdit && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Options</label>
              <div className="grid grid-cols-2 gap-2">
                {(['A', 'B', 'C', 'D'] as const).map((letter, oi) => (
                  <div key={letter} className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 ${editForm.correctAnswer === letter ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                    <button
                      type="button"
                      onClick={() => setEditForm(f => ({ ...f, correctAnswer: letter }))}
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${editForm.correctAnswer === letter ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 dark:border-gray-500 text-gray-400 dark:text-gray-500 hover:border-green-400'}`}
                    >
                      {letter}
                    </button>
                    <input
                      value={editForm.options[oi]}
                      onChange={e => {
                        const opts = [...editForm.options] as [string, string, string, string];
                        opts[oi] = e.target.value;
                        setEditForm(f => ({ ...f, options: opts }));
                      }}
                      dir={editForm.language === 'ur' ? 'rtl' : 'ltr'}
                      className="flex-1 text-sm outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-600 dark:text-gray-100"
                      placeholder={`Option ${letter}`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Click a letter to mark it as the correct answer</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Question list ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>
          <select value={filters.subjectId} onChange={e => setFilters(f => ({ ...f, subjectId: e.target.value }))} className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select value={filters.classId} onChange={e => setFilters(f => ({ ...f, classId: e.target.value }))} className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value as '' | 'MCQ' | 'SQ' | 'LQ' }))} className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option>
            <option value="SQ">Short Q</option>
            <option value="LQ">Long Q</option>
          </select>
          <select value={filters.difficulty} onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))} className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        {canManage && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Questions
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading question bank…</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No questions found</p>
          <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">
            {Object.values(filters).some(Boolean) ? 'Try adjusting your filters.' : 'Start adding questions to the bank.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Question</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Class</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Chapter / Topic</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Difficulty</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Lang</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {questions.map((q, idx) => {
                const subjectName = typeof q.subjectId === 'object' ? q.subjectId.name : '';
                const cls = typeof q.classId === 'object' ? q.classId.name : '';
                const isOwn = typeof q.createdById === 'object' ? q.createdById._id === user?._id : q.createdById === user?.id;
                const canEdit = user?.role !== 'teacher' || isOwn;

                const typeStyle: Record<string, string> = {
                  MCQ: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
                  SQ: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
                  LQ: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
                };
                const diffStyle: Record<string, string> = {
                  easy: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
                  medium: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
                  hard: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
                };

                return (
                  <tr key={q._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{idx + 1}</td>

                    <td className="px-4 py-3 max-w-xs">
                      <p
                        className={`text-gray-800 dark:text-gray-200 font-medium line-clamp-2 leading-snug ${q.language === 'ur' ? 'text-right' : ''}`}
                        dir={q.language === 'ur' ? 'rtl' : 'ltr'}
                        title={q.text}
                      >
                        {q.text}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{subjectName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{cls || '—'}</td>

                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-[120px] truncate" title={q.chapter}>
                      {q.chapter}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeStyle[q.type] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                        {q.type}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${diffStyle[q.difficulty] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                        {q.difficulty}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {q.language === 'ur'
                        ? <span className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded font-medium">اردو</span>
                        : <span className="text-xs text-gray-400 dark:text-gray-500">EN</span>}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <>
                            <button onClick={() => openEdit(q)} title="Edit" className="p-1.5 text-gray-400 hover:text-[#1e3a5f] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => { if (confirm('Delete this question?')) deleteMutation.mutate(q._id); }} title="Delete" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-400 dark:text-gray-500">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
            {Object.values(filters).some(Boolean) ? ' (filtered)' : ' total'}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Safe PDF builder (no Tailwind / oklch) ───────────────────────────────────
function buildPrintElement(paper: ExamPaperDoc, isUrdu: boolean, headerCfg?: BranchHeaderConfig | null): HTMLDivElement {
  const examName  = typeof paper.examId     === 'object' ? paper.examId.name         : '';
  const subject   = typeof paper.subjectId  === 'object' ? paper.subjectId.name      : '';
  const cls       = typeof paper.classId    === 'object' ? paper.classId.name        : '';
  const typeLabel = typeof paper.examTypeId === 'object' ? (paper.examTypeId as { name: string; totalMarks: number }).name  : '';
  const totalMark = typeof paper.examTypeId === 'object' ? (paper.examTypeId as { totalMarks: number }).totalMarks : '';
  const examDate  = typeof paper.examId     === 'object' ? new Date(paper.examId.startDate).toLocaleDateString('en-PK') : '';
  const dir       = isUrdu ? 'rtl' : 'ltr';

  const wrap = document.createElement('div');
  wrap.setAttribute('dir', dir);
  wrap.style.cssText = [
    'position:fixed', 'top:-9999px', 'left:-9999px',
    'width:794px', 'background:#fff', 'color:#111',
    'font-family:Arial,sans-serif', 'font-size:13px',
    'padding:40px', 'box-sizing:border-box', 'line-height:1.5',
  ].join(';');

  // ── Header (branch design or fallback) ──────────────────────────────────────
  const hdr = document.createElement('div');
  hdr.style.cssText = 'border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px';

  if (headerCfg && headerCfg.schoolName) {
    // ── Branded header: logo/initials + school name centered ──
    const initials = headerCfg.schoolName.split(' ').filter(Boolean).map((w: string) => w[0]).slice(0, 3).join('').toUpperCase();

    const brandRow = document.createElement('div');
    brandRow.style.cssText = `display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:8px;${isUrdu ? 'flex-direction:row-reverse' : ''}`;

    // Logo or initials circle
    if (headerCfg.logoBase64) {
      const logoImg = document.createElement('img');
      logoImg.src = headerCfg.logoBase64;
      logoImg.style.cssText = 'width:56px;height:56px;object-fit:contain';
      brandRow.appendChild(logoImg);
    } else {
      const circle = document.createElement('div');
      circle.style.cssText = 'width:52px;height:52px;border-radius:50%;background:#1e3a5f;color:#fff;font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0';
      circle.textContent = initials;
      brandRow.appendChild(circle);
    }

    const nameBlock = document.createElement('div');
    nameBlock.style.cssText = `text-align:${isUrdu ? 'right' : 'center'}`;
    nameBlock.innerHTML = `
      <div style="font-size:18px;font-weight:700">${headerCfg.schoolName}</div>
      ${headerCfg.tagline ? `<div style="font-size:12px;color:#555;margin-top:2px">${headerCfg.tagline}</div>` : ''}
      ${headerCfg.address ? `<div style="font-size:11px;color:#888;margin-top:1px">${headerCfg.address}</div>` : ''}
    `;
    brandRow.appendChild(nameBlock);
    hdr.appendChild(brandRow);

    // Exam info row
    const infoRow = document.createElement('div');
    infoRow.style.cssText = 'border-top:1px solid #bbb;padding-top:7px;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:12px';
    infoRow.innerHTML = `
      <div><b>Class:</b> ${cls}</div>
      <div><b>Subject:</b> ${subject}</div>
      <div><b>Date:</b> ${examDate}</div>
      <div><b>Marks:</b> ${totalMark}</div>
    `;
    hdr.appendChild(infoRow);

    // Student fields row
    const studentFields: string[] = [];
    if (headerCfg.showStudentName) studentFields.push('<div><b>Name:</b> <span style="display:inline-block;width:130px;border-bottom:1px solid #555">&nbsp;</span></div>');
    if (headerCfg.showRollNo)     studentFields.push('<div><b>Roll No:</b> <span style="display:inline-block;width:90px;border-bottom:1px solid #555">&nbsp;</span></div>');
    if (headerCfg.showSection)    studentFields.push('<div><b>Section:</b> <span style="display:inline-block;width:70px;border-bottom:1px solid #555">&nbsp;</span></div>');

    if (studentFields.length > 0) {
      const studentRow = document.createElement('div');
      studentRow.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font-size:12px;margin-top:5px';
      studentRow.innerHTML = studentFields.join('');
      hdr.appendChild(studentRow);
    }
  } else {
    // ── Fallback: simple text header ──
    hdr.style.cssText += 'text-align:center';
    hdr.innerHTML = `
      <div style="font-size:17px;font-weight:700">${subject} Exam Paper</div>
      <table style="width:100%;margin-top:8px;font-size:12px;border-collapse:collapse">
        <tr>
          <td style="text-align:${isUrdu?'right':'left'}"><b>Class:</b> ${cls}</td>
          <td style="text-align:${isUrdu?'left':'right'}"><b>Subject:</b> ${subject}</td>
        </tr>
        <tr>
          <td style="text-align:${isUrdu?'right':'left'}"><b>Exam:</b> ${examName}</td>
          <td style="text-align:${isUrdu?'left':'right'}"><b>Date:</b> ${examDate}</td>
        </tr>
        <tr>
          <td style="text-align:${isUrdu?'right':'left'}"><b>Type:</b> ${typeLabel}</td>
          <td style="text-align:${isUrdu?'left':'right'}"><b>Total Marks:</b> ${totalMark}</td>
        </tr>
      </table>`;
  }

  wrap.appendChild(hdr);

  // Sections
  const mcqAnswerKey: { qNum: number; answer: string }[] = [];
  let globalQNum = 1;

  paper.sections.forEach((section) => {
    const isMCQ = section.type === 'MCQ';
    const isTwoCol = section.type === 'SQ' || isMCQ;

    const secDiv = document.createElement('div');
    secDiv.style.cssText = 'margin-bottom:24px';

    const secTitle = document.createElement('div');
    secTitle.style.cssText = 'font-weight:700;font-size:13px;border-bottom:1px solid #555;padding-bottom:4px;margin-bottom:12px';
    secTitle.textContent = `${section.name} — (${section.totalMarks} Marks)`;
    secDiv.appendChild(secTitle);

    if (isMCQ) {
      // 2-column grid: each cell has question + stacked A/B/C/D options
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:14px 28px';

      section.questions.forEach((q) => {
        const qObj = typeof q.questionId === 'object' ? q.questionId as { text: string; options?: string[]; correctAnswer?: string } : null;
        const qText = q.textOverride ?? qObj?.text ?? '';
        const opts = qObj?.options ?? [];
        const correct = qObj?.correctAnswer ?? '';
        const num = globalQNum++;

        if (correct) mcqAnswerKey.push({ qNum: num, answer: correct });

        const cell = document.createElement('div');
        cell.setAttribute('dir', isUrdu ? 'rtl' : 'ltr');
        cell.style.cssText = 'font-size:12px;margin-bottom:4px';

        const qtop = document.createElement('div');
        qtop.style.cssText = 'display:flex;gap:5px;margin-bottom:5px';
        qtop.innerHTML = `<span style="font-weight:700;white-space:nowrap">Q${num}.</span><span style="flex:1">${qText}</span><span style="white-space:nowrap;color:#555">(${q.marks})</span>`;
        cell.appendChild(qtop);

        const optLabels = ['A', 'B', 'C', 'D'];
        opts.forEach((optText, oi) => {
          const optRow = document.createElement('div');
          optRow.style.cssText = 'display:flex;gap:5px;padding-left:14px;margin-bottom:2px';
          optRow.innerHTML = `<span style="font-weight:600;min-width:16px">${optLabels[oi]}.</span><span>${optText}</span>`;
          cell.appendChild(optRow);
        });

        grid.appendChild(cell);
      });

      secDiv.appendChild(grid);
    } else if (isTwoCol) {
      // SQ: 2-column, question text only
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px 24px';
      section.questions.forEach((q) => {
        const qText = q.textOverride ?? (typeof q.questionId === 'object' ? (q.questionId as { text: string }).text : '');
        const num = globalQNum++;
        const cell = document.createElement('div');
        cell.style.cssText = 'font-size:12px;display:flex;gap:6px';
        cell.setAttribute('dir', isUrdu ? 'rtl' : 'ltr');
        cell.innerHTML = `<span style="font-weight:600;white-space:nowrap">Q${num}.</span><span style="flex:1">${qText}</span><span style="white-space:nowrap;color:#555">(${q.marks})</span>`;
        grid.appendChild(cell);
      });
      secDiv.appendChild(grid);
    } else {
      // LQ: single column
      section.questions.forEach((q) => {
        const qText = q.textOverride ?? (typeof q.questionId === 'object' ? (q.questionId as { text: string }).text : '');
        const num = globalQNum++;
        const row = document.createElement('div');
        row.style.cssText = 'font-size:12px;display:flex;gap:6px;margin-bottom:10px';
        row.setAttribute('dir', isUrdu ? 'rtl' : 'ltr');
        row.innerHTML = `<span style="font-weight:600;white-space:nowrap">Q${num}.</span><span style="flex:1">${qText}</span><span style="white-space:nowrap;color:#555">(${q.marks} marks)</span>`;
        secDiv.appendChild(row);
      });
    }

    wrap.appendChild(secDiv);
  });

  // Answer key page (MCQ only)
  if (mcqAnswerKey.length > 0) {
    const akPage = document.createElement('div');
    akPage.style.cssText = 'margin-top:32px;border-top:2px dashed #aaa;padding-top:16px';

    const akTitle = document.createElement('div');
    akTitle.style.cssText = 'font-weight:700;font-size:13px;margin-bottom:10px;text-align:center';
    akTitle.textContent = '— Answer Key (MCQ) —';
    akPage.appendChild(akTitle);

    const akGrid = document.createElement('div');
    akGrid.style.cssText = 'display:grid;grid-template-columns:repeat(8,1fr);gap:6px;font-size:12px;text-align:center';
    mcqAnswerKey.forEach(({ qNum, answer }) => {
      const cell = document.createElement('div');
      cell.style.cssText = 'border:1px solid #ddd;padding:4px 2px;border-radius:4px';
      cell.innerHTML = `<div style="font-weight:600;color:#555">Q${qNum}</div><div style="font-weight:700;color:#1e3a5f">${answer}</div>`;
      akGrid.appendChild(cell);
    });
    akPage.appendChild(akGrid);
    wrap.appendChild(akPage);
  }

  return wrap;
}

// ─── Paper Print View ─────────────────────────────────────────────────────────
function PaperPrintView({ paperId, onClose, autoAction }: { paperId: string; onClose: () => void; autoAction?: 'download' | 'print' }) {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  const autoFired = useRef(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const canApprove = user?.role === 'branch_principal';

  const { data: paper, isLoading } = useQuery({
    queryKey: ['exam-paper-draft', paperId],
    queryFn: () => examPaperDraftService.get(paperId),
  });

  const { data: headerCfg } = useQuery({
    queryKey: ['branch-header'],
    queryFn: branchHeaderService.get,
  });

  const [downloading, setDownloading] = useState(false);

  const markPrintedMutation = useMutation({
    mutationFn: () => examPaperDraftService.markPrinted(paperId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-paper-drafts'] }),
  });

  const approveMutation = useMutation({
    mutationFn: () => examPaperDraftService.approve(paperId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-paper-drafts'] });
      qc.invalidateQueries({ queryKey: ['exam-paper-draft', paperId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => examPaperDraftService.reject(paperId, rejectComment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exam-paper-drafts'] });
      qc.invalidateQueries({ queryKey: ['exam-paper-draft', paperId] });
      setRejectOpen(false);
      setRejectComment('');
      onClose();
    },
  });

  const handlePrint = () => {
    markPrintedMutation.mutate();
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!paper) return;
    setDownloading(true);

    // Build a safe off-screen element using only hex inline styles — avoids
    // html2canvas crashing on oklch() colors injected by Tailwind CSS variables.
    const el = buildPrintElement(paper, isUrdu, headerCfg);
    document.body.appendChild(el);

    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width;
      let y = 0;
      while (y < imgH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -y, imgW, imgH);
        y += pageH;
      }
      const subjectName = typeof paper.subjectId === 'object' ? paper.subjectId.name : 'paper';
      const classLabel = typeof paper.classId === 'object' ? paper.classId.name : '';
      pdf.save(`${subjectName}-${classLabel}-exam-paper.pdf`);
      markPrintedMutation.mutate();
    } finally {
      document.body.removeChild(el);
      setDownloading(false);
    }
  };

  // Auto-trigger download or print once paper content is rendered
  useEffect(() => {
    if (!autoAction || !paper || !printRef.current || autoFired.current) return;
    autoFired.current = true;
    // Small delay to let the DOM fully paint before capturing
    const t = setTimeout(() => {
      if (autoAction === 'download') handleDownloadPDF();
      else if (autoAction === 'print') handlePrint();
    }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper, autoAction]);

  if (isLoading || !paper) {
    return (
      <Modal open onClose={onClose} title="Loading Paper…" size="xl">
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">Loading paper details…</div>
      </Modal>
    );
  }

  const subjectName = typeof paper.subjectId === 'object' ? paper.subjectId.name : '';
  const className = typeof paper.classId === 'object' ? paper.classId.name : '';
  const examDate = typeof paper.examId === 'object' ? new Date(paper.examId.startDate).toLocaleDateString('en-PK') : '';
  const isUrdu = subjectName.toLowerCase().includes('urdu');

  const statusBadge: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    pending_approval: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    printed: 'bg-blue-100 text-blue-700',
  };

  return (
    <>
      <Modal open onClose={onClose} title={`Paper Preview — ${subjectName}`} size="xl"
        footer={
          <div className="flex justify-between items-center print:hidden w-full">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border rounded-lg">Close</button>
            <div className="flex gap-2">
              {canApprove && paper.status === 'pending_approval' && (
                <>
                  <button
                    onClick={() => { setRejectOpen(true); setRejectComment(''); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> {approveMutation.isPending ? 'Approving…' : 'Approve Paper'}
                  </button>
                </>
              )}
              {paper.status === 'approved' && (
                <>
                  <button onClick={handleDownloadPDF} disabled={downloading} className="flex items-center gap-2 px-4 py-2 text-sm border border-[#1e3a5f] text-[#1e3a5f] rounded-lg disabled:opacity-50">
                    <Download className="w-4 h-4" /> {downloading ? 'Generating…' : 'Download PDF'}
                  </button>
                  <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg">
                    <Printer className="w-4 h-4" /> Print
                  </button>
                </>
              )}
            </div>
          </div>
        }
      >
        <div ref={printRef} className={`bg-white p-6 border-2 border-gray-800 shadow-sm ${isUrdu ? 'rtl' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
          {/* Header — branch design or fallback */}
          {headerCfg && headerCfg.schoolName ? (
            <PaperHeaderPreview
              config={headerCfg}
              paperInfo={{
                subject: subjectName,
                className,
                date: examDate,
                totalMarks: typeof paper.examTypeId === 'object' ? (paper.examTypeId as { totalMarks: number }).totalMarks : '',
              }}
              isUrdu={isUrdu}
            />
          ) : (
            <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
              <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">{subjectName} Examination Paper</h1>
              <div className="grid grid-cols-4 gap-2 mt-2 text-sm text-gray-700 border-t border-gray-400 pt-2">
                <div><span className="font-semibold">Class:</span> {className}</div>
                <div><span className="font-semibold">Subject:</span> {subjectName}</div>
                <div><span className="font-semibold">Date:</span> {examDate}</div>
                <div><span className="font-semibold">Total Marks:</span> {typeof paper.examTypeId === 'object' ? (paper.examTypeId as { totalMarks: number }).totalMarks : ''}</div>
              </div>
            </div>
          )}

          {/* Sections */}
          {(() => {
            let globalQ = 1;
            const mcqAnswers: { num: number; answer: string }[] = [];

            const sections = paper.sections.map((section, si) => {
              const isMCQ = section.type === 'MCQ';
              const isSQ = section.type === 'SQ';

              const renderedQuestions = section.questions.map((q, qi) => {
                const qObj = typeof q.questionId === 'object' ? q.questionId : null;
                const qText = q.textOverride ?? qObj?.text ?? '';
                const qLang = qObj?.language ?? 'en';
                const opts = (qObj as { options?: string[] } | null)?.options ?? [];
                const correct = (qObj as { correctAnswer?: string } | null)?.correctAnswer ?? '';
                const num = globalQ++;

                if (isMCQ && correct) mcqAnswers.push({ num, answer: correct });

                if (isMCQ) {
                  return (
                    <div key={qi} className="border border-gray-200 rounded p-2" dir={qLang === 'ur' ? 'rtl' : 'ltr'}>
                      <div className="flex gap-1.5 text-sm">
                        <span className="font-bold text-gray-700 shrink-0 w-6">{num}.</span>
                        <span className="text-gray-900 flex-1 leading-snug">{qText}</span>
                      </div>
                      {opts.length > 0 && (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0 pl-6 mt-1 text-xs text-gray-700">
                          {opts.slice(0, 4).map((opt, oi) => (
                            <div key={oi} className="flex gap-1">
                              <span className="font-semibold text-gray-500">{['A','B','C','D'][oi]}.</span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                if (isSQ) {
                  return (
                    <div key={qi} className="flex items-start gap-1.5 text-sm" dir={qLang === 'ur' ? 'rtl' : 'ltr'}>
                      <span className="font-bold text-gray-700 shrink-0 w-6">{num}.</span>
                      <span className="text-gray-900 flex-1">{qText}</span>
                      <span className="text-gray-500 shrink-0 text-xs">[{q.marks}]</span>
                    </div>
                  );
                }

                // LQ
                return (
                  <div key={qi} className="text-sm" dir={qLang === 'ur' ? 'rtl' : 'ltr'}>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-gray-700 shrink-0 w-6">{num}.</span>
                      <span className="text-gray-900 flex-1">{qText}</span>
                      <span className="text-gray-500 shrink-0 text-xs">[{q.marks} marks]</span>
                    </div>
                  </div>
                );
              });

              return (
                <div key={si} className="mb-6">
                  <div className="border border-gray-800 bg-gray-100 px-3 py-1.5 mb-3">
                    {isUrdu
                      ? <span dir="rtl" className="font-bold text-sm text-gray-900">{section.name} — ({section.totalMarks} نمبر)</span>
                      : <span className="font-bold text-sm text-gray-900">{section.name} — ({section.totalMarks} Marks)</span>}
                  </div>
                  {isMCQ ? (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">{renderedQuestions}</div>
                  ) : isSQ ? (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">{renderedQuestions}</div>
                  ) : (
                    <div className="space-y-3">{renderedQuestions}</div>
                  )}
                </div>
              );
            });

            return (
              <>
                {sections}
                {/* Answer Key */}
                {mcqAnswers.length > 0 && (
                  <div className="mt-6 border-t-2 border-dashed border-gray-300 dark:border-gray-600 pt-4">
                    <p className="text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">— Answer Key (MCQ) —</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {mcqAnswers.map(({ num, answer }) => (
                        <div key={num} className="border border-gray-200 dark:border-gray-600 rounded px-2.5 py-1.5 text-center min-w-[44px]">
                          <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">Q{num}</div>
                          <div className="text-sm font-bold text-[#1e3a5f] dark:text-blue-400">{answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Status banner inside preview */}
        <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium text-center ${statusBadge[paper.status] ?? 'bg-gray-100 text-gray-600'}`}>
          Status: {STATUS_LABELS[paper.status]}
          {paper.rejectionComment && <span className="ml-2 font-normal">— {paper.rejectionComment}</span>}
        </div>
      </Modal>

      {/* Reject inline modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Paper" size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setRejectOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border dark:border-gray-600 rounded-lg dark:hover:bg-gray-700">Cancel</button>
            <button
              onClick={() => rejectMutation.mutate()}
              disabled={!rejectComment.trim() || rejectMutation.isPending}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50"
            >
              {rejectMutation.isPending ? 'Rejecting…' : 'Reject Paper'}
            </button>
          </div>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for rejection (visible to teacher)</label>
          <textarea
            value={rejectComment}
            onChange={e => setRejectComment(e.target.value)}
            rows={3}
            className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm resize-none dark:bg-gray-700 dark:text-gray-100"
            placeholder="Explain what needs to be changed…"
            autoFocus
          />
        </div>
      </Modal>
    </>
  );
}

// ─── Paper Wizard ─────────────────────────────────────────────────────────────
type WizardStep = 'setup' | 'questions' | 'review';

function PaperWizard({ onClose, onCreated, editPaperId }: { onClose: () => void; onCreated: () => void; editPaperId?: string }) {
  const qc = useQueryClient();
  const isEditMode = !!editPaperId;
  const [step, setStep] = useState<WizardStep>(isEditMode ? 'questions' : 'setup');
  const [paperId, setPaperId] = useState<string | null>(editPaperId ?? null);
  const [setup, setSetup] = useState({ examId: '', examTypeId: '', subjectId: '', classId: '' });
  const [sections, setSections] = useState<PaperSection[]>([]);
  const [bankFilters, setBankFilters] = useState({ type: '' as '' | 'MCQ' | 'SQ' | 'LQ' });
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [_editingSectionIdx, setEditingSectionIdx] = useState<number | null>(null);
  const [editingSectionName, _setEditingSectionName] = useState('');
  const [editingQ, setEditingQ] = useState<{ si: number; qi: number } | null>(null);
  const [editingQText, setEditingQText] = useState('');
  const [editLoaded, setEditLoaded] = useState(false);

  // Load existing paper when editing
  const { data: editPaperData } = useQuery({
    queryKey: ['exam-paper-draft', editPaperId],
    queryFn: () => examPaperDraftService.get(editPaperId!),
    enabled: isEditMode,
    staleTime: 0,
  });

  useEffect(() => {
    if (!editPaperData || editLoaded) return;
    const paper = editPaperData;
    const examTypeId = typeof paper.examTypeId === 'object' ? (paper.examTypeId as { _id: string })._id : String(paper.examTypeId);
    const examId = typeof paper.examId === 'object' ? paper.examId._id : paper.examId;
    const subjectId = typeof paper.subjectId === 'object' ? paper.subjectId._id : paper.subjectId;
    const classId = typeof paper.classId === 'object' ? paper.classId._id : paper.classId;
    setSetup({ examId, examTypeId, subjectId, classId });
    setSections(paper.sections.map(s => ({ ...s })));
    setEditLoaded(true);
  }, [editPaperData, editLoaded]);

  const { data: exams = [] } = useQuery({ queryKey: ['exams'], queryFn: () => examService.list() });
  const { data: examTypes = [] } = useQuery({ queryKey: ['exam-types'], queryFn: examTypeService.list });
  const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: () => academicService.getSubjects() });
  const { data: classes = [] } = useQuery({ queryKey: ['classes'], queryFn: () => academicService.getClasses() });
  const { data: _wizardHeaderCfg } = useQuery({ queryKey: ['branch-header'], queryFn: branchHeaderService.get });

  const selectedExamType = examTypes.find(t => t._id === setup.examTypeId);

  const { data: bankQuestions = [] } = useQuery({
    queryKey: ['question-bank', setup.subjectId, setup.classId, bankFilters.type],
    queryFn: () => questionBankService.list({
      subjectId: setup.subjectId || undefined,
      classId: setup.classId || undefined,
      type: bankFilters.type || undefined,
    }),
    enabled: step === 'questions' && !!setup.subjectId,
  });

  const createMutation = useMutation({
    mutationFn: () => examPaperDraftService.create(setup),
    onSuccess: (paper) => {
      setPaperId(paper._id);
      if (selectedExamType) {
        setSections(selectedExamType.sections.map(s => ({
          name: s.name,
          type: s.type,
          totalMarks: s.totalMarks,
          questions: [],
        })));
      }
      setStep('questions');
    },
  });

  const stripSections = (secs: PaperSection[]): PaperSection[] =>
    secs.map(s => ({
      ...s,
      questions: s.questions.map(q => ({
        questionId: typeof q.questionId === 'object' ? (q.questionId as { _id: string })._id : q.questionId,
        marks: q.marks,
        isOverridden: q.isOverridden,
        ...(q.textOverride ? { textOverride: q.textOverride } : {}),
      })),
    }));

  const saveSectionsMutation = useMutation({
    mutationFn: () => examPaperDraftService.updateSections(paperId!, stripSections(sections)),
    onSuccess: () => setStep('review'),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await examPaperDraftService.updateSections(paperId!, stripSections(sections));
      return examPaperDraftService.submit(paperId!);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exam-paper-drafts'] }); onCreated(); },
  });

  const saveDraftMutation = useMutation({
    mutationFn: () => examPaperDraftService.updateSections(paperId!, stripSections(sections)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exam-paper-drafts'] }); onCreated(); },
  });

  const activeSection = sections[activeSectionIdx];
  const activeSectionDef = selectedExamType?.sections[activeSectionIdx];

  const isQuestionSelected = (qId: string) =>
    activeSection?.questions.some(q => {
      const id = typeof q.questionId === 'object' ? (q.questionId as { _id: string })._id : q.questionId;
      return id === qId;
    }) ?? false;

  const toggleQuestion = (q: QuestionDoc) => {
    if (!activeSection || !activeSectionDef) return;
    const isSelected = isQuestionSelected(q._id);
    if (isSelected) {
      setSections(prev => prev.map((s, i) => i !== activeSectionIdx ? s : {
        ...s,
        questions: s.questions.filter(sq => {
          const id = typeof sq.questionId === 'object' ? (sq.questionId as { _id: string })._id : sq.questionId;
          return id !== q._id;
        }),
      }));
    } else {
      if (activeSection.questions.length >= activeSectionDef.questionCount) return;
      const marksEach = activeSectionDef.totalMarks / activeSectionDef.questionCount;
      const qObj = { _id: q._id, text: q.text, chapter: q.chapter, difficulty: q.difficulty, type: q.type, language: q.language, options: q.options, correctAnswer: q.correctAnswer };
      setSections(prev => prev.map((s, i) => i !== activeSectionIdx ? s : {
        ...s,
        questions: [...s.questions, { questionId: qObj, marks: marksEach, isOverridden: false }],
      }));
    }
  };

  const updateQuestionMarks = (sectionIdx: number, qIdx: number, marks: number) => {
    setSections(prev => prev.map((s, i) => i !== sectionIdx ? s : {
      ...s,
      questions: s.questions.map((q, qi) => qi !== qIdx ? q : { ...q, marks, isOverridden: true }),
    }));
  };

  const _moveQuestion = (sectionIdx: number, qIdx: number, dir: -1 | 1) => {
    setSections(prev => prev.map((s, i) => {
      if (i !== sectionIdx) return s;
      const qs = [...s.questions];
      const target = qIdx + dir;
      if (target < 0 || target >= qs.length) return s;
      [qs[qIdx], qs[target]] = [qs[target], qs[qIdx]];
      return { ...s, questions: qs };
    }));
  };

  const _removeQuestion = (sectionIdx: number, qIdx: number) => {
    setSections(prev => prev.map((s, i) => i !== sectionIdx ? s : {
      ...s,
      questions: s.questions.filter((_, qi) => qi !== qIdx),
    }));
  };

  const _commitSectionName = (sectionIdx: number) => {
    const name = editingSectionName.trim();
    if (name) {
      setSections(prev => prev.map((s, i) => i !== sectionIdx ? s : { ...s, name }));
    }
    setEditingSectionIdx(null);
  };

  const commitQuestionText = () => {
    if (!editingQ) return;
    const { si, qi } = editingQ;
    const text = editingQText.trim();
    setSections(prev => prev.map((s, i) => i !== si ? s : {
      ...s,
      questions: s.questions.map((q, j) => {
        if (j !== qi) return q;
        const originalText = typeof q.questionId === 'object' ? (q.questionId as { text: string }).text : '';
        return { ...q, textOverride: text && text !== originalText ? text : undefined };
      }),
    }));
    setEditingQ(null);
  };

  const setupValid = setup.examId && setup.examTypeId && setup.subjectId && setup.classId;

  if (isEditMode && !editLoaded) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading paper data…</p>
        </div>
      </div>
    );
  }

  // ── Step indicator (shared) ─────────────────────────────────────────────────
  const stepBar = (
    <div className="flex items-center gap-2 text-sm">
      {(['setup', 'questions', 'review'] as WizardStep[]).map((s, i, arr) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-[#1e3a5f] text-white' : i < arr.indexOf(step) ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
            {i < arr.indexOf(step) ? '✓' : i + 1}
          </div>
          <span className={step === s ? 'text-[#1e3a5f] dark:text-blue-400 font-medium' : 'text-gray-400 dark:text-gray-500'}>
            {s === 'setup' ? 'Setup' : s === 'questions' ? 'Select Questions' : 'Review'}
          </span>
          {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Papers
          </button>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditMode ? 'Edit Exam Paper' : 'Create Exam Paper'}</h2>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
          {stepBar}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {step !== 'setup' && !(isEditMode && step === 'questions') && (
            <button onClick={() => setStep(step === 'review' ? 'questions' : 'setup')} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Back
            </button>
          )}
          {step === 'setup' && (
            <button onClick={() => createMutation.mutate()} disabled={!setupValid || createMutation.isPending} className="px-5 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg disabled:opacity-50 hover:bg-[#162d4a]">
              {createMutation.isPending ? 'Creating…' : 'Next — Select Questions'}
            </button>
          )}
          {step === 'questions' && (
            <>
              <button onClick={() => saveDraftMutation.mutate()} disabled={saveDraftMutation.isPending} className="px-4 py-2 text-sm border border-[#1e3a5f] text-[#1e3a5f] rounded-lg disabled:opacity-50 hover:bg-blue-50">
                {saveDraftMutation.isPending ? 'Saving…' : 'Save Draft'}
              </button>
              <button onClick={() => saveSectionsMutation.mutate()} disabled={saveSectionsMutation.isPending} className="px-5 py-2 text-sm bg-[#1e3a5f] text-white rounded-lg disabled:opacity-50 hover:bg-[#162d4a]">
                {saveSectionsMutation.isPending ? 'Saving…' : 'Review Paper →'}
              </button>
            </>
          )}
          {step === 'review' && (
            <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="px-5 py-2 text-sm bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700">
              {submitMutation.isPending ? 'Submitting…' : 'Submit for Approval'}
            </button>
          )}
        </div>
      </div>

      {/* Step: Setup */}
      {step === 'setup' && (
        <div className="max-w-2xl space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam</label>
              <select value={setup.examId} onChange={e => setSetup(s => ({ ...s, examId: e.target.value }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100">
                <option value="">Select exam</option>
                {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Type (Paper Structure)</label>
              <select value={setup.examTypeId} onChange={e => setSetup(s => ({ ...s, examTypeId: e.target.value }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100">
                <option value="">Select type</option>
                {examTypes.filter(t => t.isActive).map(t => <option key={t._id} value={t._id}>{t.name} ({t.totalMarks} marks)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <select value={setup.subjectId} onChange={e => setSetup(s => ({ ...s, subjectId: e.target.value }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100">
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
              <select value={setup.classId} onChange={e => setSetup(s => ({ ...s, classId: e.target.value }))} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-gray-100">
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {selectedExamType && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Paper Structure: {selectedExamType.name}</p>
              <div className="space-y-1">
                {selectedExamType.sections.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm text-blue-700 dark:text-blue-400">
                    <span>{s.name}</span>
                    <span>{s.questionCount} questions × {s.totalMarks / s.questionCount} marks = {s.totalMarks} marks</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step: Questions */}
      {step === 'questions' && (
        <div className="flex gap-4" style={{ minHeight: 520 }}>
          {/* Left: Sections */}
          <div className="w-52 shrink-0 border-r border-gray-200 dark:border-gray-700 pr-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Sections</p>
            {sections.map((s, i) => {
              const def = selectedExamType?.sections[i];
              const filled = s.questions.length;
              const required = def?.questionCount ?? 0;
              return (
                <button key={i} onClick={() => { setActiveSectionIdx(i); setBankFilters({ type: s.type }); }}
                  className={`w-full text-left p-3 rounded-xl mb-1.5 text-sm transition-colors ${activeSectionIdx === i ? 'bg-[#1e3a5f] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  <div className="font-medium truncate">{s.name}</div>
                  <div className={`text-xs mt-0.5 ${activeSectionIdx === i ? 'text-blue-200' : filled === required ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {filled}/{required} questions
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Question Bank */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{activeSection?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Select {activeSectionDef?.questionCount} questions • {activeSection?.questions.length} selected
                </p>
              </div>
              <select value={bankFilters.type} onChange={e => setBankFilters(f => ({ ...f, type: e.target.value as '' | 'MCQ' | 'SQ' | 'LQ' }))} className="border dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-gray-100">
                <option value="">All Types</option>
                <option value="MCQ">MCQ</option>
                <option value="SQ">Short Q</option>
                <option value="LQ">Long Q</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: 460 }}>
              {bankQuestions.length === 0 ? (
                <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">No questions found for this subject/class.</div>
              ) : bankQuestions.map(q => {
                const selected = isQuestionSelected(q._id);
                const atLimit = !selected && activeSection?.questions.length >= (activeSectionDef?.questionCount ?? 0);
                return (
                  <button key={q._id} onClick={() => toggleQuestion(q)} disabled={atLimit}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${selected ? 'border-[#1e3a5f] bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' : atLimit ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-50' : 'border-gray-200 dark:border-gray-700 hover:border-[#1e3a5f] dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded mt-0.5 border-2 shrink-0 flex items-center justify-center ${selected ? 'border-[#1e3a5f] bg-[#1e3a5f]' : 'border-gray-300 dark:border-gray-600'}`}>
                        {selected && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="min-w-0 w-full">
                        <p className={`text-gray-800 dark:text-gray-200 text-sm ${q.language === 'ur' ? 'text-right' : ''}`} dir={q.language === 'ur' ? 'rtl' : 'ltr'}>{q.text}</p>
                        {q.type === 'MCQ' && q.options && q.options.length === 4 && (
                          <div className="grid grid-cols-2 gap-x-3 mt-1.5">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex gap-1 text-xs text-gray-500 dark:text-gray-400" dir={q.language === 'ur' ? 'rtl' : 'ltr'}>
                                <span className="font-semibold text-gray-400 dark:text-gray-500">{['A','B','C','D'][oi]}.</span>
                                <span className="truncate">{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-1.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{q.chapter}</span>
                          <span className={`text-xs px-1.5 rounded ${q.difficulty === 'easy' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : q.difficulty === 'hard' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'}`}>{q.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <div className="space-y-4">
          {sections.map((section, si) => {
            const sectionTotal = section.questions.reduce((sum, q) => sum + q.marks, 0);
            const expectedTotal = section.totalMarks;
            const marksOk = Math.abs(sectionTotal - expectedTotal) < 0.01;
            return (
              <div key={si} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className={`px-4 py-2.5 flex justify-between items-center ${marksOk ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{section.name}</span>
                  <span className={`text-sm font-medium ${marksOk ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {sectionTotal} / {expectedTotal} marks {marksOk ? '✓' : '⚠ mismatch'}
                  </span>
                </div>
                <div className="divide-y dark:divide-gray-700">
                  {section.questions.map((q, qi) => {
                    const qObj = typeof q.questionId === 'object' ? q.questionId as { text: string; language: string } : null;
                    const qText = q.textOverride ?? qObj?.text ?? '';
                    const qLang = qObj?.language ?? 'en';
                    const isEditing = editingQ?.si === si && editingQ?.qi === qi;
                    return (
                      <div key={qi} className="px-4 py-2 flex items-start gap-3 dark:bg-gray-800">
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-6 shrink-0 pt-1.5">Q{qi + 1}</span>
                        {isEditing ? (
                          <textarea
                            className={`flex-1 text-sm text-gray-800 dark:text-gray-100 bg-blue-50 dark:bg-slate-700 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${qLang === 'ur' ? 'text-right' : ''}`}
                            dir={qLang === 'ur' ? 'rtl' : 'ltr'}
                            rows={2}
                            value={editingQText}
                            onChange={e => setEditingQText(e.target.value)}
                            onBlur={commitQuestionText}
                            onKeyDown={e => { if (e.key === 'Escape') setEditingQ(null); }}
                            autoFocus
                          />
                        ) : (
                          <span
                            className={`flex-1 text-sm text-gray-800 dark:text-gray-200 cursor-text hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded px-1 py-1 -mx-1 transition-colors ${qLang === 'ur' ? 'text-right' : ''}`}
                            dir={qLang === 'ur' ? 'rtl' : 'ltr'}
                            title="Click to edit"
                            onClick={() => { setEditingQ({ si, qi }); setEditingQText(qText); }}
                          >
                            {qText || <span className="text-gray-400 italic">Click to add question text…</span>}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 shrink-0 pt-1">
                          <input
                            type="number"
                            value={q.marks}
                            onChange={e => updateQuestionMarks(si, qi, Number(e.target.value))}
                            className="w-14 border dark:border-gray-600 rounded px-2 py-0.5 text-xs text-center dark:bg-gray-700 dark:text-gray-100"
                            min={0}
                          />
                          <span className="text-xs text-gray-400 dark:text-gray-500">marks</span>
                          {q.isOverridden && <span className="text-xs text-orange-500">*</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className="text-xs text-gray-400 dark:text-gray-500">* marks manually overridden. Adjust marks so each section sums to its target before submitting.</p>
        </div>
      )}
    </div>
  );
}

// ─── Papers Tab ───────────────────────────────────────────────────────────────
function PapersTab() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [showWizard, setShowWizard] = useState(false);
  const [editPaperId, setEditPaperId] = useState<string | undefined>(undefined);
  const [printPaperId, setPrintPaperId] = useState<string | null>(null);
  const [printAction, setPrintAction] = useState<'view' | 'download' | 'print'>('view');
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const openView = (id: string) => { setPrintPaperId(id); setPrintAction('view'); };
  const openDownload = (id: string) => { setPrintPaperId(id); setPrintAction('download'); };
  const openPrint = (id: string) => { setPrintPaperId(id); setPrintAction('print'); };

  const { data: papers = [], isLoading } = useQuery({
    queryKey: ['exam-paper-drafts', statusFilter],
    queryFn: () => examPaperDraftService.list(statusFilter ? { status: statusFilter as 'draft' } : undefined),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => examPaperDraftService.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exam-paper-drafts'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => examPaperDraftService.reject(rejectModal!.id, rejectComment),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exam-paper-drafts'] }); setRejectModal(null); setRejectComment(''); },
  });

  const isTeacher = user?.role === 'teacher';
  const isPrincipal = user?.role === 'branch_principal';

  const openEdit = (id: string) => { setEditPaperId(id); setShowWizard(true); };
  const closeWizard = () => { setShowWizard(false); setEditPaperId(undefined); };

  // Full-page wizard — replaces the list entirely
  if (showWizard) {
    return (
      <PaperWizard
        editPaperId={editPaperId}
        onClose={closeWizard}
        onCreated={() => { closeWizard(); qc.invalidateQueries({ queryKey: ['exam-paper-drafts'] }); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="printed">Printed</option>
          </select>
        </div>
        {(isTeacher || isPrincipal) && (
          <button onClick={() => setShowWizard(true)} className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> Create Paper
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading papers…</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500 dark:text-gray-400">No papers found</p>
          {(isTeacher || isPrincipal) && <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">Click "Create Paper" to build your first exam paper.</p>}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subject</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Class</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Exam</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sections</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {papers.map((p, idx) => {
                const examName = typeof p.examId === 'object' ? p.examId.name : '';
                const subjectName = typeof p.subjectId === 'object' ? p.subjectId.name : '';
                const cls = typeof p.classId === 'object' ? p.classId.name : '';
                const creatorName = typeof p.createdById === 'object' ? p.createdById.name : '';
                const createdDate = new Date(p.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
                const sectionCount = p.sections?.length ?? 0;
                const totalQ = p.sections?.reduce((s, sec) => s + sec.questions.length, 0) ?? 0;

                return (
                  <tr key={p._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{idx + 1}</td>

                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 dark:text-white">{subjectName || '—'}</span>
                    </td>

                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{cls || '—'}</td>

                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[140px] truncate" title={examName}>{examName || '—'}</td>

                    <td className="px-4 py-3">
                      {sectionCount > 0 ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{sectionCount} section{sectionCount !== 1 ? 's' : ''} • {totalQ} Q</span>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600">No sections</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                          {STATUS_LABELS[p.status]}
                        </span>
                        {p.rejectionComment && (
                          <div className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400" title={p.rejectionComment}>
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[120px]">{p.rejectionComment}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{creatorName || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">{createdDate}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Always: view */}
                        <button onClick={() => openView(p._id)} title="Preview" className="p-1.5 text-gray-400 hover:text-[#1e3a5f] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Draft / Rejected: edit */}
                        {(p.status === 'draft' || p.status === 'rejected') && (
                          <button onClick={() => openEdit(p._id)} title="Edit" className="p-1.5 text-gray-400 hover:text-[#1e3a5f] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Approved / Printed: download + print */}
                        {(p.status === 'approved' || p.status === 'printed') && (
                          <>
                            <button onClick={() => openDownload(p._id)} title="Download PDF" className="p-1.5 text-gray-400 hover:text-[#1e3a5f] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={() => openPrint(p._id)} title="Print" className="p-1.5 text-gray-400 hover:text-[#1e3a5f] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                              <Printer className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Principal + pending: approve / reject */}
                        {isPrincipal && p.status === 'pending_approval' && (
                          <>
                            <button onClick={() => approveMutation.mutate(p._id)} disabled={approveMutation.isPending} title="Approve" className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-40">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setRejectModal({ id: p._id }); setRejectComment(''); }} title="Reject" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-400 dark:text-gray-500">
            {papers.length} paper{papers.length !== 1 ? 's' : ''} {statusFilter ? `— filtered by "${STATUS_LABELS[statusFilter] ?? statusFilter}"` : 'total'}
          </div>
        </div>
      )}

      {printPaperId && (
        <PaperPrintView
          paperId={printPaperId}
          onClose={() => { setPrintPaperId(null); setPrintAction('view'); }}
          autoAction={printAction !== 'view' ? printAction : undefined}
        />
      )}

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Paper" size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setRejectModal(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border dark:border-gray-600 rounded-lg dark:hover:bg-gray-700">Cancel</button>
            <button onClick={() => rejectMutation.mutate()} disabled={!rejectComment.trim() || rejectMutation.isPending} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
              {rejectMutation.isPending ? 'Rejecting…' : 'Reject Paper'}
            </button>
          </div>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for rejection (visible to teacher)</label>
          <textarea value={rejectComment} onChange={e => setRejectComment(e.target.value)} rows={3} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm resize-none dark:bg-gray-700 dark:text-gray-100" placeholder="Explain what needs to be changed…" />
        </div>
      </Modal>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExamPaperPage() {
  const user = useAuthStore(s => s.user);
  const [tab, setTab] = useState<Tab>('papers');

  const isPrincipal = user?.role === 'branch_principal';
  const isItAdmin = user?.role === 'it_admin';

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'papers', label: 'Papers', icon: <FileText className="w-4 h-4" /> },
    { id: 'question-bank', label: 'Question Bank', icon: <BookOpen className="w-4 h-4" /> },
    ...(isPrincipal || isItAdmin ? [
      { id: 'exam-types' as Tab, label: 'Exam Types', icon: <Settings className="w-4 h-4" /> },
      { id: 'header' as Tab, label: 'Header Design', icon: <LayoutTemplate className="w-4 h-4" /> },
    ] : []),
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Paper Creation</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Build, manage, and print exam papers from your question bank.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-[#1e3a5f] text-[#1e3a5f] dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {tab === 'papers' && <PapersTab />}
        {tab === 'question-bank' && <QuestionBankTab />}
        {tab === 'exam-types' && (isPrincipal || isItAdmin) && <ExamTypesTab />}
        {tab === 'header' && (isPrincipal || isItAdmin) && <HeaderTab />}
      </div>
    </div>
  );
}
