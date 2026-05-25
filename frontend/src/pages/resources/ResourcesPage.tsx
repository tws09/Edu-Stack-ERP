import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { LearningResource, ApiResponse, ResourceType } from '../../types';
import Modal from '../../components/ui/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClassOption { _id: string; name: string; level: string }
interface SubjectOption { _id: string; name: string; code: string }

interface UploadForm {
  title: string;
  description: string;
  type: ResourceType;
  classId: string;
  subjectId: string;
  tags: string;
  externalUrl: string;
  isPublished: boolean;
}

const EMPTY_FORM: UploadForm = {
  title: '', description: '', type: 'notes', classId: '',
  subjectId: '', tags: '', externalUrl: '', isPublished: true,
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_META: Record<ResourceType, { label: string; color: string; icon: string }> = {
  notes:      { label: 'Notes',      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',     icon: '📝' },
  book:       { label: 'Book',       color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400', icon: '📖' },
  past_paper: { label: 'Past Paper', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400', icon: '📋' },
  video_link: { label: 'Video',      color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',         icon: '▶️' },
  other:      { label: 'Other',      color: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300',      icon: '📎' },
};

const UPLOAD_ROLES = ['branch_principal', 'it_admin', 'teacher', 'group_admin'];

// ─── Helper components ────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ResourceType }) {
  const m = TYPE_META[type];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.color}`}>
      {m.icon} {m.label}
    </span>
  );
}

function BookmarkBtn({ isBookmarked, onClick }: { isBookmarked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={`p-1.5 rounded-lg transition-colors ${isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 dark:text-slate-600 hover:text-yellow-400'}`}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
    >
      <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  );
}

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const canUpload = UPLOAD_ROLES.includes(user?.role ?? '');

  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | ''>('');
  const [search, setSearch] = useState('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState<LearningResource | null>(null);
  const [form, setForm] = useState<UploadForm>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Queries ──
  const { data: classesData } = useQuery({
    queryKey: ['academic', 'classes'],
    queryFn: () => api.get<ApiResponse<ClassOption[]>>('/academic/classes').then(r => r.data.data ?? []),
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['academic', 'subjects'],
    queryFn: () => api.get<ApiResponse<SubjectOption[]>>('/academic/subjects').then(r => r.data.data ?? []),
  });

  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ['resources', classFilter, subjectFilter, typeFilter, search, bookmarkedOnly],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (classFilter) params.classId = classFilter;
      if (subjectFilter) params.subjectId = subjectFilter;
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;
      if (bookmarkedOnly) params.bookmarked = 'true';
      return api.get<ApiResponse<LearningResource[]>>('/resources', { params }).then(r => r.data.data ?? []);
    },
  });

  const classes = classesData ?? [];
  const subjects = subjectsData ?? [];
  const resources = resourcesData ?? [];

  // ── Mutations ──
  const bookmark = useMutation({
    mutationFn: (id: string) => api.post(`/resources/${id}/bookmark`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  });

  const deleteRes = useMutation({
    mutationFn: (id: string) => api.delete(`/resources/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  });

  const updateRes = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<UploadForm> }) =>
      api.put(`/resources/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      setEditing(null);
    },
  });

  // ── Upload flow (presigned URL → S3 → create resource) ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploadErr('');

    if (!form.classId) { setUploadErr('Please select a class.'); return; }
    if (form.type === 'video_link' && !form.externalUrl) { setUploadErr('Please enter a video URL.'); return; }
    if (form.type !== 'video_link' && !file) { setUploadErr('Please select a file to upload.'); return; }

    setUploading(true);
    try {
      let fileKey: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let mimeType: string | undefined;

      if (file && form.type !== 'video_link') {
        // 1. Get presigned URL
        const { data: urlData } = await api.post('/resources/upload-url', {
          filename: file.name,
          contentType: file.type,
        });
        const { uploadUrl, key } = urlData.data;

        // 2. Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        fileKey = key;
        fileName = file.name;
        fileSize = file.size;
        mimeType = file.type;
      }

      // 3. Create resource record
      await api.post('/resources', {
        ...form,
        fileKey,
        fileName,
        fileSize,
        mimeType,
      });

      qc.invalidateQueries({ queryKey: ['resources'] });
      setShowUpload(false);
      setForm(EMPTY_FORM);
      setFile(null);
    } catch (err: any) {
      setUploadErr(err?.response?.data?.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function openUpload() {
    setForm(EMPTY_FORM);
    setFile(null);
    setUploadErr('');
    setShowUpload(true);
  }

  function openEdit(res: LearningResource) {
    const cls = typeof res.classId === 'object' ? res.classId._id : res.classId;
    const sub = typeof res.subjectId === 'object' ? res.subjectId?._id : res.subjectId;
    setForm({
      title: res.title,
      description: res.description ?? '',
      type: res.type,
      classId: cls,
      subjectId: sub ?? '',
      tags: res.tags.join(', '),
      externalUrl: res.externalUrl ?? '',
      isPublished: res.isPublished,
    });
    setEditing(res);
  }

  async function handleOpenResource(res: LearningResource) {
    await api.post(`/resources/${res._id}/download`).catch(() => {});
    const url = res.type === 'video_link' ? res.externalUrl : res.fileUrl;
    if (url) window.open(url, '_blank');
  }

  const isStudent = user?.role === 'student';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Learning Resources</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {isStudent ? 'Study materials for your class' : 'Upload and manage class resources'}
          </p>
        </div>
        {canUpload && (
          <button
            onClick={openUpload}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Upload Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 mb-5 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-48">
            <input
              type="text"
              placeholder="Search by title, description, tags..."
              className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Class filter (not shown for students — they auto-filter) */}
          {!isStudent && classes.length > 0 && (
            <select
              className="border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm min-w-36"
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          )}

          {/* Subject filter */}
          {subjects.length > 0 && (
            <select
              className="border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 text-sm min-w-36"
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          )}
        </div>

        {/* Type pills + bookmark toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {(['', 'notes', 'book', 'past_paper', 'video_link', 'other'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t as ResourceType | '')}
              className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {t === '' ? 'All Types' : TYPE_META[t as ResourceType].label}
            </button>
          ))}
          <button
            onClick={() => setBookmarkedOnly(b => !b)}
            className={`ml-auto px-3 py-1 text-xs rounded-full border font-medium transition-colors flex items-center gap-1 ${
              bookmarkedOnly
                ? 'bg-yellow-400 text-yellow-900 border-yellow-400'
                : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            <svg className="w-3 h-3" fill={bookmarkedOnly ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Bookmarked
          </button>
        </div>
      </div>

      {/* Resource grid */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400 dark:text-slate-500">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3 text-3xl">📚</div>
          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">No resources found</p>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            {canUpload ? 'Upload the first resource for your class.' : 'Your teacher hasn\'t uploaded any resources yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(res => {
            const cls = typeof res.classId === 'object' ? res.classId : null;
            const sub = typeof res.subjectId === 'object' ? res.subjectId : null;
            const uploader = typeof res.uploadedBy === 'object' ? res.uploadedBy : null;
            const isOwner = uploader?._id === user?.id;
            const canEdit = canUpload && (isOwner || ['branch_principal', 'it_admin', 'group_admin'].includes(user?.role ?? ''));

            return (
              <div
                key={res._id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <TypeBadge type={res.type} />
                      {!res.isPublished && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">Draft</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-snug line-clamp-2">{res.title}</h3>
                  </div>
                  <BookmarkBtn isBookmarked={!!res.isBookmarked} onClick={() => bookmark.mutate(res._id)} />
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
                  {cls && <span>📚 {cls.name}</span>}
                  {sub && <span>• {sub.name}</span>}
                  {res.fileName && <span>• {formatBytes(res.fileSize)}</span>}
                </div>

                {/* Description */}
                {res.description && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{res.description}</p>
                )}

                {/* Tags */}
                {res.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {res.tags.map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-slate-700">
                  <div className="text-xs text-gray-400 dark:text-slate-500">
                    {uploader?.name} · {new Date(res.createdAt).toLocaleDateString('en-PK')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <>
                        <button
                          onClick={() => openEdit(res)}
                          className="text-xs px-2 py-1 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this resource?')) deleteRes.mutate(res._id); }}
                          className="text-xs px-2 py-1 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleOpenResource(res)}
                      className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                      {res.type === 'video_link' ? 'Watch' : 'Open'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Resource" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {uploadErr && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-lg px-4 py-2.5 text-sm">{uploadErr}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Title *</label>
              <input
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="e.g. Chapter 5 Notes — Motion"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Type *</label>
              <select
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as ResourceType }))}
              >
                {(Object.keys(TYPE_META) as ResourceType[]).map(t => (
                  <option key={t} value={t}>{TYPE_META[t].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Class *</label>
              <select
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                value={form.classId}
                onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                required
              >
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Subject</label>
              <select
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                value={form.subjectId}
                onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
              >
                <option value="">All subjects / General</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Tags</label>
              <input
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                placeholder="chapter5, motion, physics"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Comma-separated</p>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Description</label>
              <textarea
                rows={2}
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm resize-none"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this resource..."
              />
            </div>

            {/* File or URL */}
            {form.type === 'video_link' ? (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Video URL *</label>
                <input
                  type="url"
                  className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                  placeholder="https://youtube.com/watch?v=..."
                  value={form.externalUrl}
                  onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))}
                />
              </div>
            ) : (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">File * (PDF or Image, max 20 MB)</label>
                <div
                  className="border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {file ? (
                    <div className="text-sm text-gray-700 dark:text-slate-300">
                      <span className="font-medium">{file.name}</span>
                      <span className="text-gray-400 dark:text-slate-500 ml-2">({formatBytes(file.size)})</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Click to choose file</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">PDF, JPG, PNG, WebP</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            )}

            {/* Publish toggle */}
            <div className="col-span-2 flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Publish immediately</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">Students will be notified when published</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Resource" size="lg">
        {editing && (
          <form onSubmit={e => { e.preventDefault(); updateRes.mutate({ id: editing._id, body: form }); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Title</label>
                <input
                  className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Subject</label>
                <select
                  className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                  value={form.subjectId}
                  onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
                >
                  <option value="">All subjects / General</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Tags</label>
                <input
                  className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                  placeholder="comma-separated"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm resize-none"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              {editing.type === 'video_link' && (
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Video URL</label>
                  <input
                    type="url"
                    className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                    value={form.externalUrl}
                    onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))}
                  />
                </div>
              )}
              <div className="col-span-2 flex items-center justify-between py-2 border-t border-gray-100 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Published</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Visible to students</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={updateRes.isPending}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {updateRes.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
