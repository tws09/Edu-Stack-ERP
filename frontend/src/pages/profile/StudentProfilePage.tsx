import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { useAuthStore } from '../../stores/authStore';
import { formatDate, getInitials } from '../../lib/utils';

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
      <span className="text-xs text-gray-400 dark:text-slate-500 w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default function StudentProfilePage() {
  const { user } = useAuthStore();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['student-profile-me'],
    queryFn: studentService.getMe,
  });

  const className = typeof profile?.classId === 'object' ? profile.classId.name : null;
  const sectionName = typeof profile?.sectionId === 'object' ? profile.sectionId.name : null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* ── Hero card ── */}
      <div className="card overflow-hidden mb-4">
        {/* Gradient banner */}
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-500" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-amber-500 border-4 border-white dark:border-slate-800 flex items-center justify-center text-navy-950 text-2xl font-bold shadow-md">
              {profile?.profile.photoUrl ? (
                <img
                  src={profile.profile.photoUrl}
                  alt={profile.profile.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                getInitials(profile?.profile.name ?? user?.name ?? '?')
              )}
            </div>
          </div>

          {/* Name + badges */}
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                {profile?.profile.name ?? user?.name}
              </h1>
              <p className="text-sm text-gray-400 dark:text-slate-400 mt-0.5">{user?.email}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-0.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                Student
              </span>
              {profile?.rollNo && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  Roll # {profile.rollNo}
                </span>
              )}
              {className && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  {className}{sectionName ? ` — ${sectionName}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Loading / Error ── */}
      {isLoading && (
        <div className="card p-8 text-center text-sm text-gray-400 dark:text-slate-500">
          Loading profile…
        </div>
      )}

      {isError && (
        <div className="card p-6 text-center">
          <p className="text-sm text-red-500 dark:text-red-400 mb-1">Could not load full profile.</p>
          <p className="text-xs text-gray-400">Your basic info is shown above.</p>
        </div>
      )}

      {profile && (
        <>
          {/* ── Academic info ── */}
          <Section title="Academic Details">
            <InfoRow label="Roll Number"    value={profile.rollNo} />
            <InfoRow label="Admission No."  value={profile.admissionNo} />
            <InfoRow label="Class"          value={className ?? undefined} />
            <InfoRow label="Section"        value={sectionName ?? undefined} />
            <InfoRow label="Status"         value={profile.status ? profile.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : undefined} />
            <InfoRow label="Admission Date" value={profile.admissionDate ? formatDate(profile.admissionDate) : undefined} />
          </Section>

          {/* ── Personal info ── */}
          <Section title="Personal Details">
            <InfoRow label="Gender"       value={profile.profile.gender ? profile.profile.gender.replace(/\b\w/g, c => c.toUpperCase()) : undefined} />
            <InfoRow label="Date of Birth" value={profile.profile.dateOfBirth ? formatDate(profile.profile.dateOfBirth) : undefined} />
            <InfoRow label="CNIC / B-Form" value={profile.profile.cnicOrBForm} />
            <InfoRow label="Address"      value={profile.profile.address} />
          </Section>

          {/* ── Guardian info ── */}
          {(profile.guardianInfo?.fatherName || profile.guardianInfo?.fatherPhone) && (
            <Section title="Guardian Information">
              <InfoRow label="Father's Name"  value={profile.guardianInfo.fatherName} />
              <InfoRow label="Father's Phone" value={profile.guardianInfo.fatherPhone} />
              <InfoRow label="Father's CNIC"  value={profile.guardianInfo.fatherCnic} />
            </Section>
          )}
        </>
      )}
    </div>
  );
}
