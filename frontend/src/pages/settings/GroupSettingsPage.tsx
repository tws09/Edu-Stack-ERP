import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { Organization, ApiResponse } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import PageHeader from '../../components/ui/PageHeader';

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  scale: 'Scale',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  trial: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
};

export default function GroupSettingsPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: '', contactEmail: '', contactPhone: '', address: '' });

  const { data: org, isLoading } = useQuery({
    queryKey: ['org', user?.orgId],
    queryFn: () =>
      api.get<ApiResponse<Organization>>(`/organizations/${user!.orgId}`).then(r => r.data.data!),
    enabled: !!user?.orgId,
  });

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name,
        contactEmail: org.contactEmail,
        contactPhone: org.contactPhone ?? '',
        address: (org as any).address ?? '',
      });
    }
  }, [org]);

  const update = useMutation({
    mutationFn: (body: typeof form) => api.put(`/organizations/${user!.orgId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (!user?.orgId) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="Organization Settings" subtitle="Your school group profile and contact details" />

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="space-y-5">
          {/* Read-only plan/status info */}
          {org && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm">Subscription</h2>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Plan</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{PLAN_LABELS[org.plan] ?? org.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[org.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {org.status}
                  </span>
                </div>
                {org.trialEndsAt && org.status === 'trial' && (
                  <div>
                    <p className="text-xs text-gray-500">Trial ends</p>
                    <p className="text-sm font-medium text-amber-600 mt-0.5">
                      {new Date(org.trialEndsAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">URL slug</p>
                  <p className="text-sm font-mono text-gray-700 mt-0.5">{org.slug}</p>
                </div>
              </div>
            </div>
          )}

          {/* Editable org info */}
          <form
            onSubmit={e => { e.preventDefault(); update.mutate(form); }}
            className="bg-white rounded-xl border border-gray-200 p-5 space-y-4"
          >
            <h2 className="font-semibold text-gray-900 text-sm">Profile</h2>

            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                Changes saved successfully.
              </div>
            )}
            {update.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {(update.error as any)?.response?.data?.message ?? 'Failed to save changes'}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">School Group Name *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email *</label>
                <input
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={form.contactEmail}
                  onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={form.contactPhone}
                  onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="+92 300 0000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Head Office Address</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Street, City"
              />
            </div>

            <button
              type="submit"
              disabled={update.isPending}
              className="w-full py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {update.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
