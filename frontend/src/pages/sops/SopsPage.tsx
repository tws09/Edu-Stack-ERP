import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { ApiResponse } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import { cn } from '../../lib/utils';

interface Sop {
  _id: string;
  title: string;
  category: string;
  content: string;
  targetRoles: string[];
  order: number;
  isPublished: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  teacher: 'Teachers',
  student: 'Students',
  accountant: 'Accountants',
  branch_principal: 'Principal',
  it_admin: 'IT Admin',
  group_admin: 'Group Admin',
};

const ROLE_COLORS: Record<string, string> = {
  teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  student: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  accountant: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  branch_principal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  it_admin: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-400',
  group_admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
};

const ADMIN_ROLES = ['branch_principal', 'it_admin', 'group_admin'];
const TARGET_ROLE_OPTIONS = ['teacher', 'student', 'accountant', 'branch_principal', 'it_admin'];

interface SopForm {
  title: string;
  category: string;
  content: string;
  targetRoles: string[];
  order: number;
  isPublished: boolean;
}

const EMPTY_FORM: SopForm = {
  title: '', category: '', content: '', targetRoles: ['teacher'], order: 0, isPublished: true,
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600')}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function ContentBlock({ content }: { content: string }) {
  return (
    <div className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
      {content}
    </div>
  );
}

export default function SopsPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role && ADMIN_ROLES.includes(user.role);

  const [openId, setOpenId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Sop | null>(null);
  const [form, setForm] = useState<SopForm>(EMPTY_FORM);
  const [catFilter, setCatFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sops'],
    queryFn: () => api.get<ApiResponse<Sop[]>>('/sops').then(r => r.data.data ?? []),
  });

  const sops = data ?? [];
  const categories = [...new Set(sops.map(s => s.category))].sort();
  const filtered = catFilter ? sops.filter(s => s.category === catFilter) : sops;

  // Group by category
  const grouped = filtered.reduce<Record<string, Sop[]>>((acc, sop) => {
    (acc[sop.category] = acc[sop.category] ?? []).push(sop);
    return acc;
  }, {});

  const createMutation = useMutation({
    mutationFn: (body: SopForm) => api.post('/sops', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sops'] }); closeForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<SopForm> }) => api.put(`/sops/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sops'] }); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/sops/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sops'] }),
  });

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(sop: Sop) {
    setEditTarget(sop);
    setForm({
      title: sop.title,
      category: sop.category,
      content: sop.content,
      targetRoles: sop.targetRoles,
      order: sop.order,
      isPublished: sop.isPublished,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editTarget) {
      updateMutation.mutate({ id: editTarget._id, body: form });
    } else {
      createMutation.mutate(form);
    }
  }

  function toggleRole(role: string) {
    setForm(f => ({
      ...f,
      targetRoles: f.targetRoles.includes(role)
        ? f.targetRoles.filter(r => r !== role)
        : [...f.targetRoles, role],
    }));
  }

  const roleTitle = user?.role === 'student' ? 'Student' : user?.role === 'teacher' ? 'Teacher' : 'Staff';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title={isAdmin ? 'Standard Operating Procedures' : `${roleTitle} Guide & SOPs`}
        subtitle={isAdmin ? 'Manage procedures for teachers and students' : 'Guidelines and procedures for your role'}
        actions={
          isAdmin ? (
            <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              + New SOP
            </button>
          ) : undefined
        }
      />

      {/* Category filter pills */}
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => setCatFilter('')}
            className={cn('px-3 py-1 text-sm rounded-full border transition-colors', !catFilter ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={cn('px-3 py-1 text-sm rounded-full border transition-colors', catFilter === cat ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700')}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-16 text-gray-400 dark:text-slate-500 text-sm">Loading procedures...</div>
      )}

      {!isLoading && sops.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-5 py-16 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 dark:text-slate-400 font-medium">No SOPs yet</p>
          {isAdmin && (
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Click "New SOP" to create the first procedure.</p>
          )}
        </div>
      )}

      {/* Grouped accordion */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">{category}</h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700 overflow-hidden">
              {items.filter(s => s.isPublished || isAdmin).map(sop => (
                <div key={sop._id}>
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors group"
                    onClick={() => setOpenId(openId === sop._id ? null : sop._id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cn(
                        'shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors',
                        openId === sop._id ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400 dark:border-slate-600 dark:text-slate-500'
                      )}>
                        {openId === sop._id ? '−' : '+'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{sop.title}</p>
                        {isAdmin && (
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {sop.targetRoles.map(r => <RoleBadge key={r} role={r} />)}
                            {!sop.isPublished && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400 italic">draft</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2 ml-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openEdit(sop)}
                          className="text-xs px-2.5 py-1 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this SOP?')) deleteMutation.mutate(sop._id); }}
                          className="text-xs px-2.5 py-1 border border-red-200 rounded-lg text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </button>

                  {openId === sop._id && (
                    <div className="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
                      <ContentBlock content={sop.content} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={showForm}
        onClose={closeForm}
        title={editTarget ? 'Edit SOP' : 'New Standard Operating Procedure'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Title *</label>
              <input
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. How to mark daily attendance"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Category *</label>
              <input
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Attendance, Exams, Fees"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                list="cat-suggestions"
                required
              />
              <datalist id="cat-suggestions">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Display Order</label>
              <input
                type="number"
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.order}
                onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                min={0}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Content *</label>
              <textarea
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                rows={10}
                placeholder={`Step 1: Go to Attendance in the sidebar.\nStep 2: Select your class and section.\nStep 3: ...`}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Write plain text. Use numbered steps for procedures.</p>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-2">Visible To *</label>
              <div className="flex gap-2 flex-wrap">
                {TARGET_ROLE_OPTIONS.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors',
                      form.targetRoles.includes(role)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'
                    )}
                  >
                    {ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
              {form.targetRoles.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Select at least one role.</p>
              )}
            </div>

            <div className="col-span-2 flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Published</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">Unpublished SOPs are only visible to admins</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                className={cn('relative w-10 h-5 rounded-full transition-colors', form.isPublished ? 'bg-blue-600' : 'bg-gray-200')}
              >
                <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', form.isPublished ? 'translate-x-5' : '')} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeForm} className="flex-1 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending || form.targetRoles.length === 0}
              className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editTarget ? 'Save Changes' : 'Create SOP'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
