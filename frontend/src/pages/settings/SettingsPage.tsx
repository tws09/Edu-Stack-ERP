import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { Branch, ApiResponse } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import PageHeader from '../../components/ui/PageHeader';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SettingsPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['branch', user?.branchId],
    queryFn: () => api.get<ApiResponse<Branch>>(`/branches/${user!.branchId}`).then(r => r.data.data!),
    enabled: !!user?.branchId,
  });

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    principalName: '',
    settings: {
      attendanceThreshold: 75,
      periodsPerDay: 8,
      workingDays: [1, 2, 3, 4, 5],
    },
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        address: data.address ?? '',
        city: data.city ?? '',
        phone: (data as any).phone ?? '',
        email: (data as any).email ?? '',
        principalName: (data as any).principalName ?? '',
        settings: {
          attendanceThreshold: data.settings?.attendanceThreshold ?? 75,
          periodsPerDay: data.settings?.periodsPerDay ?? 8,
          workingDays: data.settings?.workingDays ?? [1, 2, 3, 4, 5],
        },
      });
    }
  }, [data]);

  const update = useMutation({
    mutationFn: (body: typeof form) => api.put(`/branches/${user!.branchId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branch'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const toggleDay = (day: number) => {
    setForm(f => ({
      ...f,
      settings: {
        ...f.settings,
        workingDays: f.settings.workingDays.includes(day)
          ? f.settings.workingDays.filter(d => d !== day)
          : [...f.settings.workingDays, day].sort((a, b) => a - b),
      },
    }));
  };

  if (!user?.branchId) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <PageHeader title="Settings" />
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center text-gray-400 text-sm">
          Settings are available for branch-level users only.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="Branch Settings" subtitle="Configure your branch's operational parameters" />

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading settings...</div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); update.mutate(form); }} className="space-y-6">
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
              ✓ Settings saved successfully.
            </div>
          )}

          {/* Branch Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Branch Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Branch Name</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Principal Name</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.principalName}
                  onChange={e => setForm(f => ({ ...f, principalName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Academic Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Academic Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Attendance Threshold</p>
                  <p className="text-xs text-gray-400">Minimum attendance % before shortage alert</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={0} max={100}
                    className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center"
                    value={form.settings.attendanceThreshold}
                    onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, attendanceThreshold: Number(e.target.value) } }))}
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Periods Per Day</p>
                  <p className="text-xs text-gray-400">Number of class periods in a school day</p>
                </div>
                <input
                  type="number" min={1} max={16}
                  className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-center"
                  value={form.settings.periodsPerDay}
                  onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, periodsPerDay: Number(e.target.value) } }))}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Working Days</p>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        form.settings.workingDays.includes(i)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">0 = Sunday, 6 = Saturday</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={update.isPending}
            className="w-full py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {update.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
}
