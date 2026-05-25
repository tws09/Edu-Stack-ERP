import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-navy-950 px-4"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(96,165,250,0.06) 1px, transparent 0)',
        backgroundSize: '36px 36px',
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-700/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-600/8 blur-3xl" />
      </div>

      <div className="relative text-center max-w-md">
        <div className="text-[120px] font-black text-white/5 leading-none select-none">404</div>
        <div className="-mt-8 mb-6">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
          <p className="text-blue-300/70 text-sm leading-relaxed">
            The page you're looking for doesn't exist or you may not have permission to access it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors border border-white/10"
          >
            ← Go back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
          >
            Home
          </button>
        </div>

        <p className="text-xs text-blue-400/40 mt-10">
          EduStack PK — WolfStack
        </p>
      </div>
    </div>
  );
}
