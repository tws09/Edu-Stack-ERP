import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrgSlug } from '../../utils/tenant';
import { getAdmissionConfig, getPublicUploadUrl, submitApplication, type AdmissionProgram } from '../../services/admissionService';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Pref { programId: string; programName: string; rank: 1 | 2 | 3 }
interface DocFile { file: File; key?: string; uploading?: boolean; error?: string }

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const QUOTA_TYPES = [
  { value: 'none', label: 'None / General' },
  { value: 'sports', label: 'Sports Quota' },
  { value: 'staff', label: 'Staff Children Quota' },
  { value: 'army', label: 'Army / Govt Employee Quota' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function uploadFile(slug: string, file: File): Promise<string> {
  const { uploadUrl, key } = await getPublicUploadUrl(slug, file.name, file.type);
  await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  return key;
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span>Step {step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
const sel = `${inp} bg-white`;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdmissionPortalPage() {
  const slug = getOrgSlug();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state
  const [prefs, setPrefs] = useState<Pref[]>([]);
  const [personal, setPersonal] = useState({
    name: '', fatherName: '', motherName: '', dob: '', gender: 'male',
    bloodGroup: '', religion: '', nationality: 'Pakistani',
    address: '', studentPhone: '', parentPhone: '', emergencyContact: '',
  });
  const [academic, setAcademic] = useState({
    previousSchool: '', board: '', rollNo: '', marksObtained: '', totalMarks: '',
  });
  const [sibling, setSibling] = useState({ has: false, siblingName: '', siblingGrNo: '' });
  const [quota, setQuota] = useState({ type: 'none' });
  const [docs, setDocs] = useState<{
    photo?: DocFile; bForm?: DocFile; resultCard?: DocFile; quotaProof?: DocFile;
  }>({});

  const { data: config, isLoading, isError } = useQuery({
    queryKey: ['admission-config', slug],
    queryFn: () => getAdmissionConfig(slug!),
    enabled: !!slug,
    retry: false,
  });

  if (!slug) return null;
  if (isLoading) return <PageLoader />;
  if (isError || !config?.isOpen) return <ClosedPortal config={config} />;

  const perc = academic.marksObtained && academic.totalMarks
    ? Math.min(100, Math.round((Number(academic.marksObtained) / Number(academic.totalMarks)) * 10000) / 100)
    : null;

  // ── Program Selection ──────────────────────────────────────────────────────

  function togglePref(prog: AdmissionProgram) {
    setPrefs((prev) => {
      const exists = prev.find((p) => p.programId === prog._id);
      if (exists) return prev.filter((p) => p.programId !== prog._id).map((p, i) => ({ ...p, rank: (i + 1) as 1|2|3 }));
      if (prev.length >= 3) return prev;
      return [...prev, { programId: prog._id, programName: prog.name, rank: (prev.length + 1) as 1|2|3 }];
    });
  }

  // ── Document Upload ────────────────────────────────────────────────────────

  async function handleFileChange(docType: keyof typeof docs, file: File) {
    setDocs((d) => ({ ...d, [docType]: { file, uploading: true } }));
    try {
      const key = await uploadFile(slug!, file);
      setDocs((d) => ({ ...d, [docType]: { file, key, uploading: false } }));
    } catch {
      setDocs((d) => ({ ...d, [docType]: { file, error: 'Upload failed. Try again.', uploading: false } }));
    }
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  function validateStep(s: number): string {
    if (s === 1 && prefs.length === 0) return 'Select at least one program preference.';
    if (s === 2) {
      if (!personal.name.trim()) return 'Full name is required.';
      if (!personal.fatherName.trim()) return "Father's name is required.";
      if (!personal.dob) return 'Date of birth is required.';
      if (!personal.address.trim()) return 'Address is required.';
      if (!personal.parentPhone.trim()) return 'Parent phone is required.';
    }
    if (s === 3) {
      if (!academic.previousSchool.trim()) return 'Previous school is required.';
      if (!academic.marksObtained) return 'Marks obtained is required.';
      if (!academic.totalMarks) return 'Total marks is required.';
      if (Number(academic.marksObtained) > Number(academic.totalMarks)) return 'Marks obtained cannot exceed total marks.';
    }
    if (s === 4) {
      if (!docs.photo?.key) return 'Passport photo upload is required.';
      if (!docs.bForm?.key) return 'B-Form / CNIC upload is required.';
      if (!docs.resultCard?.key) return 'Previous result card upload is required.';
      if (quota.type !== 'none' && !docs.quotaProof?.key) return 'Quota proof document is required.';
    }
    return '';
  }

  function next() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
  }
  function back() { setError(''); setStep((s) => s - 1); }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    const err = validateStep(4);
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const result = await submitApplication(slug!, {
        preferences: prefs,
        personal,
        academic: {
          ...academic,
          marksObtained: Number(academic.marksObtained),
          totalMarks: Number(academic.totalMarks),
        },
        sibling,
        quota,
        documents: {
          photo: docs.photo?.key ? { key: docs.photo.key } : undefined,
          bForm: docs.bForm?.key ? { key: docs.bForm.key } : undefined,
          resultCard: docs.resultCard?.key ? { key: docs.resultCard.key } : undefined,
          quotaProof: docs.quotaProof?.key ? { key: docs.quotaProof.key } : undefined,
        },
      });
      setSubmitted(result.refNo);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Success Screen ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-6">Your application has been received and is under review.</p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-blue-500 font-medium mb-1">APPLICATION REFERENCE NUMBER</p>
            <p className="text-2xl font-bold text-blue-700 font-mono tracking-wider">{submitted}</p>
          </div>
          <p className="text-sm text-gray-500">
            Please note your reference number. The institution will contact you on your registered phone number.
          </p>
          <p className="text-xs text-gray-400 mt-4 font-semibold">Powered by EduStack PK</p>
        </div>
      </div>
    );
  }

  // ── Portal Layout ──────────────────────────────────────────────────────────

  const primary = config.org.primaryColor ?? '#1d4ed8';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: primary }}>
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-4">
          {config.org.logoUrl && (
            <img src={config.org.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-contain bg-white p-1 shrink-0" />
          )}
          <div>
            <h1 className="text-xl font-bold text-white">{config.org.name}</h1>
            <p className="text-sm text-white/80">Online Admission Portal</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <ProgressBar step={step} total={5} />

          {error && (
            <div className="mb-5 flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg p-3 border border-red-200">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Step 1 — Programs */}
          {step === 1 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Select Program Preferences</h2>
              <p className="text-sm text-gray-500 mb-6">Choose up to 3 programs in order of preference. Rank 1 = your top choice.</p>
              <div className="space-y-3">
                {config.programs.map((prog) => {
                  const sel = prefs.find((p) => p.programId === prog._id);
                  return (
                    <button
                      key={prog._id}
                      onClick={() => togglePref(prog)}
                      className={`w-full text-left border rounded-xl p-4 transition-all duration-150 ${
                        sel ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm font-bold mt-0.5 ${
                          sel ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {sel ? sel.rank : ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{prog.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{prog.totalSeats} total seats</p>
                          {prog.description && <p className="text-xs text-gray-400 mt-1">{prog.description}</p>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {prefs.length > 0 && (
                <p className="mt-4 text-sm text-blue-600 font-medium">
                  Selected: {prefs.map((p) => `${p.rank}. ${p.programName}`).join(' · ')}
                </p>
              )}
            </section>
          )}

          {/* Step 2 — Personal Info */}
          {step === 2 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Personal Information</h2>
              <p className="text-sm text-gray-500 mb-6">Provide your complete personal details.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Full Name" required>
                    <input className={inp} value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} placeholder="As per B-Form / CNIC" />
                  </Field>
                </div>
                <Field label="Father's Name" required>
                  <input className={inp} value={personal.fatherName} onChange={(e) => setPersonal({ ...personal, fatherName: e.target.value })} />
                </Field>
                <Field label="Mother's Name">
                  <input className={inp} value={personal.motherName} onChange={(e) => setPersonal({ ...personal, motherName: e.target.value })} />
                </Field>
                <Field label="Date of Birth" required>
                  <input type="date" className={inp} value={personal.dob} onChange={(e) => setPersonal({ ...personal, dob: e.target.value })} />
                </Field>
                <Field label="Gender" required>
                  <select className={sel} value={personal.gender} onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>
                <Field label="Blood Group">
                  <select className={sel} value={personal.bloodGroup} onChange={(e) => setPersonal({ ...personal, bloodGroup: e.target.value })}>
                    <option value="">Select…</option>
                    {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Religion">
                  <input className={inp} value={personal.religion} onChange={(e) => setPersonal({ ...personal, religion: e.target.value })} placeholder="e.g. Islam" />
                </Field>
                <Field label="Nationality">
                  <input className={inp} value={personal.nationality} onChange={(e) => setPersonal({ ...personal, nationality: e.target.value })} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Full Address" required>
                    <textarea rows={2} className={inp} value={personal.address} onChange={(e) => setPersonal({ ...personal, address: e.target.value })} placeholder="Street, City, District" />
                  </Field>
                </div>
                <Field label="Student Phone">
                  <input className={inp} type="tel" value={personal.studentPhone} onChange={(e) => setPersonal({ ...personal, studentPhone: e.target.value })} placeholder="0300-0000000" />
                </Field>
                <Field label="Parent / Guardian Phone" required>
                  <input className={inp} type="tel" value={personal.parentPhone} onChange={(e) => setPersonal({ ...personal, parentPhone: e.target.value })} placeholder="0300-0000000" />
                </Field>
                <Field label="Emergency Contact">
                  <input className={inp} type="tel" value={personal.emergencyContact} onChange={(e) => setPersonal({ ...personal, emergencyContact: e.target.value })} placeholder="0300-0000000" />
                </Field>
              </div>
            </section>
          )}

          {/* Step 3 — Academic + Sibling + Quota */}
          {step === 3 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Academic History</h2>
              <p className="text-sm text-gray-500 mb-6">Provide your previous education and additional information.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <Field label="Previous School / College" required>
                    <input className={inp} value={academic.previousSchool} onChange={(e) => setAcademic({ ...academic, previousSchool: e.target.value })} />
                  </Field>
                </div>
                <Field label="Board / University">
                  <input className={inp} value={academic.board} onChange={(e) => setAcademic({ ...academic, board: e.target.value })} placeholder="e.g. BISE Lahore" />
                </Field>
                <Field label="Roll Number">
                  <input className={inp} value={academic.rollNo} onChange={(e) => setAcademic({ ...academic, rollNo: e.target.value })} />
                </Field>
                <Field label="Marks Obtained" required>
                  <input type="number" className={inp} value={academic.marksObtained} onChange={(e) => setAcademic({ ...academic, marksObtained: e.target.value })} min={0} />
                </Field>
                <Field label="Total Marks" required>
                  <input type="number" className={inp} value={academic.totalMarks} onChange={(e) => setAcademic({ ...academic, totalMarks: e.target.value })} min={1} />
                </Field>
                {perc !== null && (
                  <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-700 font-semibold text-sm">Calculated Percentage: {perc}%</span>
                  </div>
                )}
              </div>

              {/* Sibling */}
              <div className="border border-gray-200 rounded-xl p-4 mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={sibling.has}
                    onChange={(e) => setSibling({ ...sibling, has: e.target.checked })} />
                  <span className="text-sm font-medium text-gray-700">I have a sibling currently studying at this institution</span>
                </label>
                {sibling.has && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Field label="Sibling Name">
                      <input className={inp} value={sibling.siblingName} onChange={(e) => setSibling({ ...sibling, siblingName: e.target.value })} />
                    </Field>
                    <Field label="Sibling GR Number">
                      <input className={inp} value={sibling.siblingGrNo} onChange={(e) => setSibling({ ...sibling, siblingGrNo: e.target.value })} />
                    </Field>
                  </div>
                )}
              </div>

              {/* Quota */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Quota / Special Category</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUOTA_TYPES.map((q) => (
                    <label key={q.value} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-sm transition-colors ${
                      quota.type === q.value ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                      <input type="radio" name="quota" className="accent-blue-600" checked={quota.type === q.value}
                        onChange={() => setQuota({ type: q.value })} />
                      {q.label}
                    </label>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Step 4 — Documents */}
          {step === 4 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Documents</h2>
              <p className="text-sm text-gray-500 mb-6">Upload clear scans or photos. Accepted: JPG, PNG, PDF (max 2MB).</p>
              <div className="space-y-4">
                {([
                  { key: 'photo', label: 'Passport Size Photo', required: true, accept: 'image/jpeg,image/png,image/webp' },
                  { key: 'bForm', label: 'B-Form / CNIC', required: true, accept: 'image/jpeg,image/png,application/pdf' },
                  { key: 'resultCard', label: 'Previous Result Card / Marksheet', required: true, accept: 'image/jpeg,image/png,application/pdf' },
                  ...(quota.type !== 'none' ? [{ key: 'quotaProof', label: 'Quota Proof Document', required: true, accept: 'image/jpeg,image/png,application/pdf' }] : []),
                ] as { key: keyof typeof docs; label: string; required: boolean; accept: string }[]).map((doc) => {
                  const d = docs[doc.key];
                  return (
                    <div key={doc.key} className="border border-gray-200 rounded-xl p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {doc.label} {doc.required && <span className="text-red-500">*</span>}
                      </p>
                      {d?.uploading && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          Uploading…
                        </div>
                      )}
                      {d?.error && <p className="text-red-500 text-sm">{d.error}</p>}
                      {d?.key && !d.uploading && (
                        <div className="flex items-center gap-2 text-green-600 text-sm mb-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {d.file.name} — uploaded
                        </div>
                      )}
                      <label className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                        d?.key ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100' : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                      }`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {d?.key ? 'Replace file' : 'Choose file'}
                        <input type="file" className="hidden" accept={doc.accept} onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileChange(doc.key, file);
                        }} />
                      </label>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Step 5 — Review */}
          {step === 5 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Review & Submit</h2>
              <p className="text-sm text-gray-500 mb-6">Please review your application carefully before submitting.</p>
              <div className="space-y-4 text-sm">
                <ReviewSection title="Programs Selected">
                  {prefs.map((p) => <p key={p.programId}>{p.rank}. {p.programName}</p>)}
                </ReviewSection>
                <ReviewSection title="Personal Information">
                  <ReviewRow label="Name" value={personal.name} />
                  <ReviewRow label="Father's Name" value={personal.fatherName} />
                  <ReviewRow label="Date of Birth" value={personal.dob} />
                  <ReviewRow label="Gender" value={personal.gender} />
                  <ReviewRow label="Phone" value={personal.parentPhone} />
                  <ReviewRow label="Address" value={personal.address} />
                </ReviewSection>
                <ReviewSection title="Academic History">
                  <ReviewRow label="Previous School" value={academic.previousSchool} />
                  <ReviewRow label="Marks" value={`${academic.marksObtained} / ${academic.totalMarks} (${perc}%)`} />
                </ReviewSection>
                <ReviewSection title="Documents">
                  {(['photo', 'bForm', 'resultCard', 'quotaProof'] as const).map((k) => docs[k]?.key && (
                    <p key={k} className="text-green-600">✓ {k === 'photo' ? 'Photo' : k === 'bForm' ? 'B-Form/CNIC' : k === 'resultCard' ? 'Result Card' : 'Quota Proof'}</p>
                  ))}
                </ReviewSection>
                {sibling.has && (
                  <ReviewSection title="Sibling">
                    <ReviewRow label="Name" value={sibling.siblingName ?? '—'} />
                    <ReviewRow label="GR No" value={sibling.siblingGrNo ?? '—'} />
                  </ReviewSection>
                )}
                {quota.type !== 'none' && (
                  <ReviewSection title="Quota">
                    <p className="capitalize">{QUOTA_TYPES.find((q) => q.value === quota.type)?.label}</p>
                  </ReviewSection>
                )}
              </div>
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                By submitting, I confirm that all information provided is accurate and complete.
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={back} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                ← Back
              </button>
            ) : <div />}
            {step < 5 ? (
              <button onClick={next} className="px-6 py-2 text-sm font-semibold text-white rounded-lg transition-colors" style={{ backgroundColor: primary }}>
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? 'Submitting…' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700 text-xs uppercase tracking-wide border-b border-gray-200">{title}</div>
      <div className="px-4 py-3 space-y-1">{children}</div>
    </div>
  );
}
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 shrink-0 w-32">{label}:</span>
      <span className="text-gray-900 font-medium">{value || '—'}</span>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ClosedPortal({ config }: { config?: { org: { name: string; logoUrl?: string } } }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        {config?.org.logoUrl && <img src={config.org.logoUrl} alt="Logo" className="w-16 h-16 object-contain mx-auto mb-4" />}
        <h2 className="text-xl font-bold text-gray-900 mb-2">{config?.org.name ?? 'Admission Portal'}</h2>
        <p className="text-gray-500">Admissions are currently closed. Please check back later or contact the institution directly.</p>
      </div>
    </div>
  );
}
