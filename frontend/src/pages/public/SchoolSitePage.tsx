import { useState } from 'react';
import type { PublicSiteData } from '../../types';

interface Props { site: PublicSiteData; }

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function getNavLinks(site: PublicSiteData) {
  return [
    ...(site.hero?.enabled       ? [{ id: 'home',       label: 'Home'       }] : []),
    ...(site.about?.enabled      ? [{ id: 'about',      label: 'About'      }] : []),
    ...(site.admissions?.enabled ? [{ id: 'admissions', label: 'Admissions' }] : []),
    ...(site.contact?.enabled    ? [{ id: 'contact',    label: 'Contact'    }] : []),
    ...(site.news?.enabled && site.news.posts.length > 0 ? [{ id: 'news', label: 'News' }] : []),
  ];
}

// ════════════════════════════════════════════════════════════
// CLASSIC TEMPLATE — dark navy, formal, prestigious
// ════════════════════════════════════════════════════════════

function ClassicTemplate({ site }: { site: PublicSiteData }) {
  const primary    = site.primaryColor || '#f59e0b';
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState<string | null>(null);
  const navLinks = getNavLinks(site);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#0f172a' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3 shrink-0">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.orgName} className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm"
                style={{ borderColor: primary, color: primary }}>
                {site.orgName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="font-bold text-sm text-white leading-tight">{site.orgName}</p>
              {site.tagline && <p className="text-[11px] mt-0.5" style={{ color: primary }}>{site.tagline}</p>}
            </div>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <a key={l.id} href={`#${l.id}`}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: primary }}>
              Staff Login
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t bg-slate-900 border-slate-800 px-4 py-3 flex flex-col gap-1">
            {navLinks.map(l => (
              <a key={l.id} href={`#${l.id}`} onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800">
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      {site.hero?.enabled && (
        <section data-section="hero" id="home" className="relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }} />
          <div className="h-1" style={{ backgroundColor: primary }} />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-36 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center font-extrabold text-xl"
                style={{ borderColor: primary, color: primary }}>
                {site.orgName.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {site.hero.headline || site.orgName}
            </h1>
            {site.tagline && (
              <p className="text-base md:text-lg font-semibold mt-3 italic" style={{ color: primary }}>
                {site.tagline}
              </p>
            )}
            {(site.hero.subtext || site.welcomeMessage) && (
              <p className="text-slate-400 text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
                {site.hero.subtext || site.welcomeMessage}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 my-8">
              <div className="h-px w-14 opacity-30" style={{ backgroundColor: primary }} />
              <div className="w-2 h-2 rotate-45" style={{ backgroundColor: primary }} />
              <div className="h-px w-14 opacity-30" style={{ backgroundColor: primary }} />
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {site.admissions?.enabled && (
                <a href="#admissions"
                  className="px-7 py-3 rounded-lg text-white font-bold text-sm shadow-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: primary }}>
                  {site.hero.ctaText || 'Apply Now'}
                </a>
              )}
              {site.contact?.enabled && (
                <a href="#contact"
                  className="px-7 py-3 rounded-lg font-bold text-sm border-2 text-white transition-all hover:bg-white/10"
                  style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
                  Contact Us
                </a>
              )}
            </div>
          </div>
          <div className="h-1" style={{ backgroundColor: primary }} />
        </section>
      )}

      {/* STATS */}
      {site.stats?.enabled && site.stats.items.length > 0 && (
        <section data-section="stats" style={{ backgroundColor: '#1e293b' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {site.stats.items.map((item, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl md:text-4xl font-extrabold" style={{ color: primary }}>{item.value}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      {site.about?.enabled && (
        <section data-section="about" id="about" className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-10" style={{ backgroundColor: primary }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>
                    About Our School
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                  {site.about.founded ? `Established ${site.about.founded}` : site.orgName}
                </h2>
                {site.about.body && (
                  <p className="text-slate-600 mt-6 leading-relaxed text-[0.95rem] whitespace-pre-wrap">{site.about.body}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  {site.about.mission && (
                    <div className="border-l-4 pl-4 py-1" style={{ borderColor: primary }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Our Mission</p>
                      <p className="text-sm text-slate-700 leading-snug">{site.about.mission}</p>
                    </div>
                  )}
                  {site.about.vision && (
                    <div className="border-l-4 pl-4 py-1" style={{ borderColor: primary }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Our Vision</p>
                      <p className="text-sm text-slate-700 leading-snug">{site.about.vision}</p>
                    </div>
                  )}
                </div>
              </div>

              {(site.about.principalName || site.about.principalQuote) && (
                <div className="rounded-2xl p-8 text-white" style={{ backgroundColor: '#0f172a' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: primary }}>
                    Principal's Message
                  </p>
                  {site.about.principalQuote && (
                    <blockquote className="text-slate-300 text-[0.95rem] leading-relaxed italic mb-6 border-l-4 pl-4"
                      style={{ borderColor: primary }}>
                      "{site.about.principalQuote}"
                    </blockquote>
                  )}
                  {site.about.principalName && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: primary }}>
                        {site.about.principalName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{site.about.principalName}</p>
                        <p className="text-xs text-slate-400">Principal</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ADMISSIONS */}
      {site.admissions?.enabled && (
        <section data-section="admissions" id="admissions" className="py-20 md:py-28 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 opacity-40" style={{ backgroundColor: primary }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>Admissions</p>
              <div className="h-px w-12 opacity-40" style={{ backgroundColor: primary }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-5">Join Our Institution</h2>
            {site.admissions.body && (
              <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12 leading-relaxed text-[0.95rem]">
                {site.admissions.body}
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              {site.admissions.criteria && (
                <div className="bg-white rounded-2xl border border-slate-200 p-7">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-5" style={{ backgroundColor: primary }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-3">Eligibility Criteria</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{site.admissions.criteria}</p>
                </div>
              )}
              {site.admissions.process && (
                <div className="bg-white rounded-2xl border border-slate-200 p-7">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-5" style={{ backgroundColor: primary }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-3">How to Apply</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{site.admissions.process}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      {site.contact?.enabled && (
        <section data-section="contact" id="contact" className="py-20 md:py-28" style={{ backgroundColor: '#0f172a' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 opacity-30" style={{ backgroundColor: primary }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>Contact</p>
              <div className="h-px w-12 opacity-30" style={{ backgroundColor: primary }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-14">Get in Touch</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {site.contact.address && (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto mb-5" style={{ backgroundColor: primary }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Address</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{site.contact.address}</p>
                </div>
              )}
              {site.contact.phone && (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto mb-5" style={{ backgroundColor: primary }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Phone</p>
                  <a href={`tel:${site.contact.phone}`} className="text-sm font-semibold hover:underline" style={{ color: primary }}>
                    {site.contact.phone}
                  </a>
                </div>
              )}
              {site.contact.email && (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto mb-5" style={{ backgroundColor: primary }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email</p>
                  <a href={`mailto:${site.contact.email}`} className="text-sm font-semibold hover:underline break-all" style={{ color: primary }}>
                    {site.contact.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* NEWS */}
      {site.news?.enabled && site.news.posts.length > 0 && (
        <section data-section="news" id="news" className="py-20 md:py-28 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 opacity-40" style={{ backgroundColor: primary }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: primary }}>News</p>
              <div className="h-px w-12 opacity-40" style={{ backgroundColor: primary }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-14">Latest Announcements</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {site.news.posts.map(post => (
                <button key={post.id} onClick={() => setNewsOpen(newsOpen === post.id ? null : post.id)}
                  className="text-left bg-white rounded-2xl border border-slate-200 p-6 transition-all hover:shadow-md hover:border-slate-300">
                  <p className="text-xs text-slate-400 mb-3 font-medium">{post.date}</p>
                  <h3 className="font-bold text-slate-900 text-[0.95rem] leading-snug mb-2">{post.title}</h3>
                  {newsOpen === post.id
                    ? <p className="text-sm text-slate-600 leading-relaxed mt-3 whitespace-pre-wrap">{post.body}</p>
                    : <p className="text-sm text-slate-500 line-clamp-2">{post.body}</p>}
                  <p className="text-xs font-semibold mt-3" style={{ color: primary }}>
                    {newsOpen === post.id ? 'Show less ↑' : 'Read more ↓'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* POLICIES */}
      {site.policies?.enabled && (site.policies.privacy || site.policies.conduct) && (
        <section data-section="policies" className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Policies</h2>
            <div className="space-y-3">
              {site.policies.privacy && (
                <details className="group rounded-xl border border-slate-200 overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-sm text-slate-900 list-none">
                    Privacy Policy
                    <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 whitespace-pre-wrap">{site.policies.privacy}</div>
                </details>
              )}
              {site.policies.conduct && (
                <details className="group rounded-xl border border-slate-200 overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-sm text-slate-900 list-none">
                    Code of Conduct
                    <svg className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 whitespace-pre-wrap">{site.policies.conduct}</div>
                </details>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0f172a' }}>
        <div className="h-px" style={{ backgroundColor: primary }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {site.logoUrl
              ? <img src={site.logoUrl} alt="" className="h-6 w-auto object-contain opacity-70" />
              : <span className="text-sm font-bold text-slate-500">{site.orgName}</span>}
          </div>
          <p className="text-xs text-slate-500">Powered by <span className="font-semibold">EduStack PK</span> · WolfStack</p>
          <a href="/login" className="text-xs font-semibold hover:underline" style={{ color: primary }}>Staff Login →</a>
        </div>
      </footer>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MODERN TEMPLATE — fresh, brand-colored, card-based
// ════════════════════════════════════════════════════════════

function ModernTemplate({ site }: { site: PublicSiteData }) {
  const primary    = site.primaryColor || '#2563eb';
  const rgb        = hexToRgb(primary.length === 7 ? primary : '#2563eb');
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState<string | null>(null);
  const navLinks = getNavLinks(site);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-2.5 shrink-0">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.orgName} className="h-9 w-auto object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md" style={{ backgroundColor: primary }}>
                {site.orgName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-[0.95rem] text-gray-900 dark:text-slate-100 hidden sm:block leading-tight max-w-[180px] truncate">
              {site.orgName}
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <a key={l.id} href={`#${l.id}`}
                className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: primary }}>
              Staff Login
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex flex-col gap-1">
            {navLinks.map(l => (
              <a key={l.id} href={`#${l.id}`} onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      {site.hero?.enabled && (
        <section data-section="hero" id="home" className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(${rgb},0.04) 0%, rgba(${rgb},0.12) 100%)` }} />
          <div className="absolute inset-0 dark:opacity-30" style={{
            backgroundImage: `radial-gradient(circle, rgba(${rgb},0.15) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }} />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-36">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ backgroundColor: `rgba(${rgb},0.1)`, color: primary }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
              Welcome to {site.orgName}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-slate-50 tracking-tight leading-[1.1] max-w-3xl">
              {site.hero.headline || site.orgName}
            </h1>
            {site.tagline && (
              <p className="text-base md:text-lg font-semibold mt-3 italic" style={{ color: primary }}>
                {site.tagline}
              </p>
            )}
            {(site.hero.subtext || site.welcomeMessage) && (
              <p className="text-lg text-gray-500 dark:text-slate-400 mt-5 max-w-xl leading-relaxed">
                {site.hero.subtext || site.welcomeMessage}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-8">
              {site.admissions?.enabled && (
                <a href="#admissions"
                  className="px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-lg shadow-black/10 transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: primary }}>
                  {site.hero.ctaText || 'Apply Now'}
                </a>
              )}
              {site.contact?.enabled && (
                <a href="#contact"
                  className="px-6 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:bg-gray-50 dark:hover:bg-slate-800"
                  style={{ borderColor: `rgba(${rgb},0.35)`, color: primary }}>
                  Contact Us
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      {site.stats?.enabled && site.stats.items.length > 0 && (
        <section data-section="stats" className="border-y border-gray-100 dark:border-slate-800" style={{ backgroundColor: `rgba(${rgb},0.04)` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {site.stats.items.map((item, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl md:text-4xl font-extrabold" style={{ color: primary }}>{item.value}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      {site.about?.enabled && (
        <section data-section="about" id="about" className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>About Us</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-slate-50 tracking-tight leading-tight mb-6">
                  {site.about.founded ? `Est. ${site.about.founded}` : site.orgName}
                </h2>
                {site.about.body && (
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-[0.95rem] mb-6 whitespace-pre-wrap">{site.about.body}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  {site.about.mission && (
                    <div className="rounded-2xl p-4 border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Our Mission</p>
                      <p className="text-sm text-gray-700 dark:text-slate-300 leading-snug">{site.about.mission}</p>
                    </div>
                  )}
                  {site.about.vision && (
                    <div className="rounded-2xl p-4 border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">Our Vision</p>
                      <p className="text-sm text-gray-700 dark:text-slate-300 leading-snug">{site.about.vision}</p>
                    </div>
                  )}
                </div>
              </div>
              {(site.about.principalName || site.about.principalQuote) && (
                <div className="rounded-3xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-none">
                  <div className="text-5xl font-serif leading-none mb-4" style={{ color: `rgba(${rgb},0.2)` }}>"</div>
                  {site.about.principalQuote && (
                    <p className="text-gray-700 dark:text-slate-300 text-[0.95rem] leading-relaxed italic mb-6">
                      {site.about.principalQuote}
                    </p>
                  )}
                  {site.about.principalName && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow" style={{ backgroundColor: primary }}>
                        {site.about.principalName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{site.about.principalName}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">Principal</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ADMISSIONS */}
      {site.admissions?.enabled && (
        <section data-section="admissions" id="admissions" className="py-20 md:py-28 bg-gray-50 dark:bg-slate-900/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>Admissions</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-slate-50 tracking-tight leading-tight">
                Join Our School
              </h2>
              {site.admissions.body && (
                <p className="text-gray-500 dark:text-slate-400 mt-4 leading-relaxed text-[0.95rem]">{site.admissions.body}</p>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {site.admissions.criteria && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white mb-4 shadow-md" style={{ backgroundColor: primary }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Eligibility Criteria</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{site.admissions.criteria}</p>
                </div>
              )}
              {site.admissions.process && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white mb-4 shadow-md" style={{ backgroundColor: primary }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">How to Apply</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{site.admissions.process}</p>
                </div>
              )}
            </div>
            {site.contact?.enabled && site.contact.phone && (
              <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-8">
                Questions? Call us at{' '}
                <a href={`tel:${site.contact.phone}`} className="font-semibold hover:underline" style={{ color: primary }}>
                  {site.contact.phone}
                </a>
              </p>
            )}
          </div>
        </section>
      )}

      {/* CONTACT */}
      {site.contact?.enabled && (
        <section data-section="contact" id="contact" className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>Contact</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-slate-50 tracking-tight leading-tight">
                Get in Touch
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {site.contact.address && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-md" style={{ backgroundColor: primary }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">Address</p>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{site.contact.address}</p>
                </div>
              )}
              {site.contact.phone && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-md" style={{ backgroundColor: primary }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">Phone</p>
                  <a href={`tel:${site.contact.phone}`} className="text-sm font-semibold hover:underline" style={{ color: primary }}>
                    {site.contact.phone}
                  </a>
                </div>
              )}
              {site.contact.email && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 text-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-md" style={{ backgroundColor: primary }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">Email</p>
                  <a href={`mailto:${site.contact.email}`} className="text-sm font-semibold hover:underline break-all" style={{ color: primary }}>
                    {site.contact.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* NEWS */}
      {site.news?.enabled && site.news.posts.length > 0 && (
        <section data-section="news" id="news" className="py-20 md:py-28 bg-gray-50 dark:bg-slate-900/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>News</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-slate-50 tracking-tight leading-tight">
                Latest Announcements
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {site.news.posts.map(post => (
                <button key={post.id} onClick={() => setNewsOpen(newsOpen === post.id ? null : post.id)}
                  className="text-left bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-slate-600">
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-3 font-medium">{post.date}</p>
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-[0.95rem] leading-snug mb-2">{post.title}</h3>
                  {newsOpen === post.id
                    ? <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mt-3 whitespace-pre-wrap">{post.body}</p>
                    : <p className="text-sm text-gray-500 dark:text-slate-500 line-clamp-2">{post.body}</p>}
                  <p className="text-xs font-semibold mt-3" style={{ color: primary }}>
                    {newsOpen === post.id ? 'Show less ↑' : 'Read more ↓'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* POLICIES */}
      {site.policies?.enabled && (site.policies.privacy || site.policies.conduct) && (
        <section data-section="policies" className="py-16 border-t border-gray-100 dark:border-slate-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50 mb-6">Policies</h2>
            <div className="space-y-4">
              {site.policies.privacy && (
                <details className="group rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-sm text-gray-900 dark:text-slate-100 list-none">
                    Privacy Policy
                    <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-gray-600 dark:text-slate-400 leading-relaxed border-t border-gray-50 dark:border-slate-800 pt-4 whitespace-pre-wrap">
                    {site.policies.privacy}
                  </div>
                </details>
              )}
              {site.policies.conduct && (
                <details className="group rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-sm text-gray-900 dark:text-slate-100 list-none">
                    Code of Conduct
                    <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-gray-600 dark:text-slate-400 leading-relaxed border-t border-gray-50 dark:border-slate-800 pt-4 whitespace-pre-wrap">
                    {site.policies.conduct}
                  </div>
                </details>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-gray-100 dark:border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {site.logoUrl
              ? <img src={site.logoUrl} alt="" className="h-6 w-auto object-contain opacity-60" />
              : <span className="text-sm font-bold text-gray-400 dark:text-slate-600">{site.orgName}</span>}
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-600">
            Powered by <span className="font-semibold">EduStack PK</span> · WolfStack
          </p>
          <a href="/login" className="text-xs font-semibold hover:underline" style={{ color: primary }}>Staff Login →</a>
        </div>
      </footer>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MINIMAL TEMPLATE — whitespace, typography, understated
// ════════════════════════════════════════════════════════════

function MinimalTemplate({ site }: { site: PublicSiteData }) {
  const primary = site.primaryColor || '#111827';
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState<string | null>(null);
  const navLinks = getNavLinks(site);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3 shrink-0">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt={site.orgName} className="h-8 w-auto object-contain" />
            ) : (
              <div>
                <p className="font-bold text-sm text-gray-900 leading-tight">{site.orgName}</p>
                {site.tagline && <p className="text-[10px] text-gray-400 mt-0.5">{site.tagline}</p>}
              </div>
            )}
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.id} href={`#${l.id}`}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href="/login" className="hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Staff Login →
            </a>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
            {navLinks.map(l => (
              <a key={l.id} href={`#${l.id}`} onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                {l.label}
              </a>
            ))}
            <a href="/login" className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              Staff Login →
            </a>
          </div>
        )}
      </nav>

      {/* HERO */}
      {site.hero?.enabled && (
        <section data-section="hero" id="home" className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-32">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: primary }} />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{site.orgName}</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.05] max-w-4xl">
              {site.hero.headline || site.orgName}
            </h1>
            {site.tagline && (
              <p className="text-lg font-medium mt-4 italic text-gray-500">{site.tagline}</p>
            )}
            {(site.hero.subtext || site.welcomeMessage) && (
              <p className="text-xl text-gray-500 mt-6 max-w-xl leading-relaxed">
                {site.hero.subtext || site.welcomeMessage}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-10">
              {site.admissions?.enabled && (
                <a href="#admissions"
                  className="px-7 py-3.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primary }}>
                  {site.hero.ctaText || 'Apply Now'}
                </a>
              )}
              {site.contact?.enabled && (
                <a href="#contact"
                  className="px-7 py-3.5 rounded-xl text-gray-700 text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
                  Contact Us
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      {site.stats?.enabled && site.stats.items.length > 0 && (
        <section data-section="stats" className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-wrap gap-10 md:gap-16">
              {site.stats.items.map((item, i) => (
                <div key={i}>
                  <p className="text-4xl font-black text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      {site.about?.enabled && (
        <section data-section="about" id="about" className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
              <div>
                <div className="w-5 h-0.5 mb-4" style={{ backgroundColor: primary }} />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">About</p>
                {site.about.founded && (
                  <p className="text-4xl font-black text-gray-900">{site.about.founded}</p>
                )}
                {site.about.founded && <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Founded</p>}
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 leading-tight">
                  {site.about.founded ? `Established ${site.about.founded}` : site.orgName}
                </h2>
                {site.about.body && (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-8 text-[0.95rem]">{site.about.body}</p>
                )}
                {(site.about.mission || site.about.vision) && (
                  <div className="space-y-5 mb-8">
                    {site.about.mission && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Mission</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{site.about.mission}</p>
                      </div>
                    )}
                    {site.about.vision && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Vision</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{site.about.vision}</p>
                      </div>
                    )}
                  </div>
                )}
                {(site.about.principalName || site.about.principalQuote) && (
                  <blockquote className="border-l-4 pl-6" style={{ borderColor: primary }}>
                    {site.about.principalQuote && (
                      <p className="text-lg text-gray-700 italic leading-relaxed mb-3">
                        "{site.about.principalQuote}"
                      </p>
                    )}
                    {site.about.principalName && (
                      <cite className="text-sm font-semibold text-gray-900 not-italic">
                        — {site.about.principalName}, Principal
                      </cite>
                    )}
                  </blockquote>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ADMISSIONS */}
      {site.admissions?.enabled && (
        <section data-section="admissions" id="admissions" className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
              <div>
                <div className="w-5 h-0.5 mb-4" style={{ backgroundColor: primary }} />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Admissions</p>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Join Our School</h2>
                {site.admissions.body && (
                  <p className="text-gray-600 leading-relaxed mb-8 text-[0.95rem]">{site.admissions.body}</p>
                )}
                <div className="space-y-8">
                  {site.admissions.criteria && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Eligibility Criteria</p>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{site.admissions.criteria}</p>
                    </div>
                  )}
                  {site.admissions.process && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">How to Apply</p>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{site.admissions.process}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      {site.contact?.enabled && (
        <section data-section="contact" id="contact" className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
              <div>
                <div className="w-5 h-0.5 mb-4" style={{ backgroundColor: primary }} />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact</p>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Get in Touch</h2>
                <div className="space-y-5">
                  {site.contact.address && (
                    <div className="flex gap-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 w-16 pt-0.5 shrink-0">Address</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{site.contact.address}</p>
                    </div>
                  )}
                  {site.contact.phone && (
                    <div className="flex gap-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 w-16 pt-0.5 shrink-0">Phone</p>
                      <a href={`tel:${site.contact.phone}`} className="text-sm font-semibold hover:underline" style={{ color: primary }}>
                        {site.contact.phone}
                      </a>
                    </div>
                  )}
                  {site.contact.email && (
                    <div className="flex gap-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 w-16 pt-0.5 shrink-0">Email</p>
                      <a href={`mailto:${site.contact.email}`} className="text-sm font-semibold hover:underline break-all" style={{ color: primary }}>
                        {site.contact.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* NEWS */}
      {site.news?.enabled && site.news.posts.length > 0 && (
        <section data-section="news" id="news" className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
              <div>
                <div className="w-5 h-0.5 mb-4" style={{ backgroundColor: primary }} />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">News</p>
              </div>
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Latest Announcements</h2>
                {site.news.posts.map(post => (
                  <button key={post.id} onClick={() => setNewsOpen(newsOpen === post.id ? null : post.id)}
                    className="w-full text-left border-t border-gray-100 pt-6 group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-1.5 font-medium">{post.date}</p>
                        <h3 className="font-bold text-gray-900 leading-snug">{post.title}</h3>
                        {newsOpen === post.id
                          ? <p className="text-sm text-gray-600 leading-relaxed mt-3 whitespace-pre-wrap">{post.body}</p>
                          : <p className="text-sm text-gray-400 mt-1.5 line-clamp-1">{post.body}</p>}
                      </div>
                      <span className="text-gray-300 group-hover:text-gray-500 transition-colors mt-1 shrink-0 text-lg leading-none">
                        {newsOpen === post.id ? '↑' : '↓'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* POLICIES */}
      {site.policies?.enabled && (site.policies.privacy || site.policies.conduct) && (
        <section data-section="policies" className="border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Policies</p>
            <div className="space-y-3">
              {site.policies.privacy && (
                <details className="group border-t border-gray-100">
                  <summary className="flex items-center justify-between py-4 cursor-pointer font-semibold text-sm text-gray-900 list-none">
                    Privacy Policy
                    <svg className="w-4 h-4 text-gray-300 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="pb-6 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{site.policies.privacy}</div>
                </details>
              )}
              {site.policies.conduct && (
                <details className="group border-t border-gray-100">
                  <summary className="flex items-center justify-between py-4 cursor-pointer font-semibold text-sm text-gray-900 list-none">
                    Code of Conduct
                    <svg className="w-4 h-4 text-gray-300 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="pb-6 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{site.policies.conduct}</div>
                </details>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {site.logoUrl
              ? <img src={site.logoUrl} alt="" className="h-5 w-auto object-contain opacity-50" />
              : <span className="text-xs font-bold text-gray-300">{site.orgName}</span>}
          </div>
          <p className="text-xs text-gray-300">Powered by <span className="font-semibold">EduStack PK</span></p>
          <a href="/login" className="text-xs font-semibold hover:underline text-gray-400">Staff Login →</a>
        </div>
      </footer>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ROUTER — picks template based on site.templateId
// ════════════════════════════════════════════════════════════

export default function SchoolSitePage({ site }: Props) {
  if (site.templateId === 'classic') return <ClassicTemplate site={site} />;
  if (site.templateId === 'minimal') return <MinimalTemplate site={site} />;
  return <ModernTemplate site={site} />;
}
