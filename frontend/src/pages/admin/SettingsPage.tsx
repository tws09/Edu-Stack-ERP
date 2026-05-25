import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { ApiResponse } from '../../types';

interface PlatformSettings {
  _id: string;
  planPricing: { starter: number; growth: number; scale: number };
  trialDays: number;
  supportEmail: string;
  maintenanceMode: boolean;
  updatedAt: string;
}

const PLAN_LABELS = { starter: 'Starter', growth: 'Growth', scale: 'Scale' };
const PLAN_DESCS = {
  starter: 'Up to 300 students',
  growth: 'Up to 1,000 students',
  scale: 'Unlimited students',
};

export default function AdminSettingsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: () => api.get<ApiResponse<PlatformSettings>>('/settings').then(r => r.data.data!),
  });

  const [form, setForm] = useState({
    planPricing: { starter: 50, growth: 40, scale: 30 },
    trialDays: 30,
    supportEmail: 'support@edustack.pk',
    maintenanceMode: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        planPricing: data.planPricing,
        trialDays: data.trialDays,
        supportEmail: data.supportEmail,
        maintenanceMode: data.maintenanceMode,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (body: typeof form) => api.put<ApiResponse<PlatformSettings>>('/settings', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) {
    return <div className="p-6 text-center text-gray-400 dark:text-slate-500 text-sm">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Platform Settings</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Global configuration for EduStack PK</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-5">
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
            ✓ Settings saved successfully.
          </div>
        )}

        {/* Plan Pricing */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Plan Pricing</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Price per active student per month (PKR)</p>
          <div className="space-y-3">
            {(['starter', 'growth', 'scale'] as const).map(plan => (
              <div key={plan} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{PLAN_LABELS[plan]}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">{PLAN_DESCS[plan]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-slate-400">PKR</span>
                  <input
                    type="number"
                    min={0}
                    className="w-24 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-1.5 text-sm text-right"
                    value={form.planPricing[plan]}
                    onChange={e => setForm(f => ({ ...f, planPricing: { ...f.planPricing, [plan]: Number(e.target.value) } }))}
                  />
                  <span className="text-xs text-gray-400 dark:text-slate-500">/ student</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trial & Support */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-4">General</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Trial Period</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">Days granted on new organization signup</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={365}
                  className="w-20 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-1.5 text-sm text-center"
                  value={form.trialDays}
                  onChange={e => setForm(f => ({ ...f, trialDays: Number(e.target.value) }))}
                />
                <span className="text-xs text-gray-400 dark:text-slate-500">days</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">Support Email</label>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">Shown to school admins in the app</p>
                <input
                  type="email"
                  className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                  value={form.supportEmail}
                  onChange={e => setForm(f => ({ ...f, supportEmail: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-slate-100">Maintenance Mode</h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">When enabled, all non-super-admin logins are blocked</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, maintenanceMode: !f.maintenanceMode }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.maintenanceMode ? 'bg-red-500' : 'bg-gray-200 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.maintenanceMode ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          {form.maintenanceMode && (
            <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3 text-xs text-red-700 dark:text-red-400">
              Warning: enabling maintenance mode will immediately log out all active school users.
            </div>
          )}
        </div>

        {/* Last saved */}
        {data?.updatedAt && (
          <p className="text-xs text-gray-400 dark:text-slate-500 text-right">
            Last saved: {new Date(data.updatedAt).toLocaleString('en-PK')}
          </p>
        )}

        <button
          type="submit"
          disabled={save.isPending}
          className="w-full py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {save.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
