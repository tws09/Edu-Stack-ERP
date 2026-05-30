import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
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
  const [brandSaved, setBrandSaved] = useState(false);
  const [form, setForm] = useState({ name: '', contactEmail: '', contactPhone: '', address: '' });
  const [brand, setBrand] = useState({ logoUrl: '', welcomeMessage: '' });
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrOrgName, setQrOrgName] = useState('');
  const [qrGenerating, setQrGenerating] = useState(false);
  const [qrError, setQrError] = useState('');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError('');
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Image must be under 2 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setLogoUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setBrand(b => ({ ...b, logoUrl: base64 }));
    } catch {
      setLogoError('Failed to read image. Please try again.');
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleGenerateQr() {
    setQrError('');
    setQrGenerating(true);
    try {
      const { data } = await api.post<{ success: boolean; data: { qrData: string; org: { name: string; slug: string } } }>(
        `/organizations/${user!.orgId}/generate-qr`
      );
      setQrData(data.data.qrData);
      setQrOrgName(data.data.org.name);
    } catch {
      setQrError('Failed to generate QR code. Please try again.');
    } finally {
      setQrGenerating(false);
    }
  }

  function handleDownloadQr() {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${qrOrgName || 'school'}-mobile-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

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
      setBrand({
        logoUrl: (org as any).logoUrl ?? '',
        welcomeMessage: (org as any).welcomeMessage ?? '',
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

  const updateBrand = useMutation({
    mutationFn: (body: typeof brand) => api.put(`/organizations/${user!.orgId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org'] });
      setBrandSaved(true);
      setTimeout(() => setBrandSaved(false), 3000);
    },
  });

  if (!user?.orgId) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader title="Organization Settings" subtitle="Your school group profile and contact details" />

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 dark:text-slate-500 text-sm">Loading...</div>
      ) : (
        <div className="space-y-5">
          {/* Read-only plan/status info */}
          {org && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 text-sm">Subscription</h2>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Plan</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mt-0.5">{PLAN_LABELS[org.plan] ?? org.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Status</p>
                  <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[org.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {org.status}
                  </span>
                </div>
                {org.trialEndsAt && org.status === 'trial' && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Trial ends</p>
                    <p className="text-sm font-medium text-amber-600 mt-0.5">
                      {new Date(org.trialEndsAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">URL slug</p>
                  <p className="text-sm font-mono text-gray-700 dark:text-slate-300 mt-0.5">{org.slug}</p>
                </div>
              </div>
            </div>
          )}

          {/* Editable org info */}
          <form
            onSubmit={e => { e.preventDefault(); update.mutate(form); }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-4"
          >
            <h2 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Profile</h2>

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
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">School Group Name *</label>
              <input
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Contact Email *</label>
                <input
                  type="email"
                  className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                  value={form.contactEmail}
                  onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Contact Phone</label>
                <input
                  className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                  value={form.contactPhone}
                  onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="+92 300 0000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Head Office Address</label>
              <input
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Street, City"
              />
            </div>

            <button
              type="submit"
              disabled={update.isPending}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {update.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          {/* Login Page Branding */}
          <form
            onSubmit={e => { e.preventDefault(); updateBrand.mutate(brand); }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-4"
          >
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Login Page Branding</h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Customise what students and staff see on your school's login page.</p>
            </div>

            {brandSaved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                Branding saved successfully.
              </div>
            )}
            {updateBrand.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {(updateBrand.error as any)?.response?.data?.message ?? 'Failed to save branding'}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">School Logo</label>
              <div className="flex items-center gap-3">
                {brand.logoUrl && (
                  <img src={brand.logoUrl} alt="Logo" className="h-12 w-12 rounded-xl object-contain border border-gray-200 dark:border-slate-600 bg-white" />
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <button
                  type="button"
                  disabled={logoUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  {logoUploading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {brand.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </>
                  )}
                </button>
                {brand.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setBrand(b => ({ ...b, logoUrl: '' }))}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              {logoError && <p className="mt-1.5 text-xs text-red-500">{logoError}</p>}
              <p className="mt-1.5 text-xs text-gray-400 dark:text-slate-500">PNG, JPG, SVG or WebP. Shown on the login page.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Welcome Message</label>
              <textarea
                rows={2}
                className="w-full border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm resize-none"
                value={brand.welcomeMessage}
                onChange={e => setBrand(b => ({ ...b, welcomeMessage: e.target.value }))}
                placeholder="Welcome back! Please sign in to continue."
              />
            </div>

            <button
              type="submit"
              disabled={updateBrand.isPending}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {updateBrand.isPending ? 'Saving...' : 'Save Branding'}
            </button>
          </form>

          {/* Mobile App QR Code */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-slate-100 text-sm">Mobile App Onboarding</h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                Generate a QR code that staff and students scan to connect the EduStack mobile app to your school.
              </p>
            </div>

            {qrError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{qrError}</div>
            )}

            {qrData ? (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-xl border border-gray-200 dark:border-slate-600 inline-block">
                  <QRCodeCanvas
                    ref={qrCanvasRef}
                    value={qrData}
                    size={200}
                    level="M"
                    includeMargin
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 text-center font-medium">{qrOrgName}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 text-center -mt-2">
                  Scan with the EduStack mobile app to onboard your school
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PNG
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateQr}
                    disabled={qrGenerating}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerateQr}
                disabled={qrGenerating}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {qrGenerating ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3m2 0V6m0 2v2M5 8H3m5-4h2M5 8h.01" />
                    </svg>
                    Generate QR Code
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
