import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { SiteConfig, SiteNewsPost } from '../../types';
import { cn } from '../../lib/utils';

type TemplateId = 'classic' | 'modern' | 'minimal';
type SectionId  = 'hero' | 'about' | 'stats' | 'admissions' | 'contact' | 'news' | 'policies';

const DEFAULT_SITE: SiteConfig = {
  published:   false,
  hero:        { enabled: true,  headline: '', subtext: '', ctaText: 'Apply Now' },
  about:       { enabled: true,  body: '', founded: '', principalName: '', principalQuote: '', vision: '', mission: '' },
  stats:       { enabled: false, items: [{ label: 'Students', value: '500+' }, { label: 'Teachers', value: '30+' }, { label: 'Branches', value: '2' }, { label: 'Years', value: '20+' }] },
  admissions:  { enabled: true,  body: '', criteria: '', process: '' },
  contact:     { enabled: true,  address: '', phone: '', email: '', mapUrl: '' },
  news:        { enabled: false, posts: [] },
  policies:    { enabled: false, privacy: '', conduct: '' },
};

const SECTIONS: { id: SectionId; label: string; desc: string }[] = [
  { id: 'hero',       label: 'Hero Banner',    desc: 'Headline, tagline, call-to-action' },
  { id: 'about',      label: 'About School',   desc: "History, mission, principal's message" },
  { id: 'stats',      label: 'Key Stats',      desc: 'Students, teachers, branches, years' },
  { id: 'admissions', label: 'Admissions',     desc: 'Criteria, how to apply' },
  { id: 'contact',    label: 'Contact',        desc: 'Address, phone, email' },
  { id: 'news',       label: 'News & Updates', desc: 'Announcements and posts' },
  { id: 'policies',   label: 'Policies',       desc: 'Privacy & code of conduct' },
];

// ── Template thumbnails (SVG mockups) ──────────────────────

function ClassicThumb() {
  return (
    <svg viewBox="0 0 280 175" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="280" height="26" fill="#0f172a"/>
      <rect x="10" y="9" width="36" height="8" rx="2" fill="#f59e0b" fillOpacity="0.9"/>
      <rect x="176" y="11" width="22" height="4" rx="1" fill="white" fillOpacity="0.4"/>
      <rect x="203" y="11" width="22" height="4" rx="1" fill="white" fillOpacity="0.4"/>
      <rect x="230" y="11" width="22" height="4" rx="1" fill="white" fillOpacity="0.4"/>
      <rect y="26" width="280" height="70" fill="#1e293b"/>
      <circle cx="140" cy="42" r="8" fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
      <rect x="136" y="39" width="8" height="6" rx="1" fill="#f59e0b"/>
      <rect x="70" y="54" width="140" height="8" rx="2" fill="white" fillOpacity="0.9"/>
      <rect x="95" y="66" width="90" height="5" rx="1" fill="white" fillOpacity="0.5"/>
      <rect x="112" y="75" width="56" height="13" rx="2" fill="#f59e0b"/>
      <rect y="26" width="280" height="2" fill="#f59e0b"/>
      <rect y="94" width="280" height="2" fill="#f59e0b"/>
      <rect y="96" width="280" height="22" fill="#0f172a"/>
      <rect x="20" y="101" width="28" height="5" rx="1" fill="white" fillOpacity="0.8"/>
      <rect x="22" y="110" width="24" height="3" rx="1" fill="white" fillOpacity="0.35"/>
      <rect x="86" y="101" width="28" height="5" rx="1" fill="white" fillOpacity="0.8"/>
      <rect x="88" y="110" width="24" height="3" rx="1" fill="white" fillOpacity="0.35"/>
      <rect x="152" y="101" width="28" height="5" rx="1" fill="white" fillOpacity="0.8"/>
      <rect x="154" y="110" width="24" height="3" rx="1" fill="white" fillOpacity="0.35"/>
      <rect x="218" y="101" width="28" height="5" rx="1" fill="white" fillOpacity="0.8"/>
      <rect x="220" y="110" width="24" height="3" rx="1" fill="white" fillOpacity="0.35"/>
      <rect y="118" width="280" height="49" fill="white"/>
      <rect x="12" y="126" width="120" height="6" rx="1" fill="#1e293b"/>
      <rect x="12" y="136" width="108" height="3" rx="1" fill="#94a3b8"/>
      <rect x="12" y="142" width="95" height="3" rx="1" fill="#94a3b8"/>
      <rect x="12" y="148" width="102" height="3" rx="1" fill="#94a3b8"/>
      <rect x="12" y="154" width="90" height="3" rx="1" fill="#94a3b8"/>
      <rect x="148" y="120" width="120" height="46" rx="4" fill="#0f172a"/>
      <rect x="155" y="128" width="30" height="3" rx="1" fill="#f59e0b" fillOpacity="0.7"/>
      <rect x="155" y="135" width="96" height="3" rx="1" fill="white" fillOpacity="0.5"/>
      <rect x="155" y="141" width="86" height="3" rx="1" fill="white" fillOpacity="0.4"/>
      <rect x="155" y="147" width="92" height="3" rx="1" fill="white" fillOpacity="0.4"/>
      <circle cx="162" cy="158" r="5" fill="#f59e0b"/>
      <rect x="172" y="155" width="50" height="6" rx="1" fill="white" fillOpacity="0.5"/>
      <rect y="167" width="280" height="8" fill="#0f172a"/>
    </svg>
  );
}

function ModernThumb() {
  return (
    <svg viewBox="0 0 280 175" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="280" height="24" fill="white"/>
      <rect y="23" width="280" height="1" fill="#e5e7eb"/>
      <rect x="10" y="8" width="28" height="8" rx="4" fill="#2563eb"/>
      <rect x="100" y="10" width="18" height="4" rx="1" fill="#9ca3af"/>
      <rect x="124" y="10" width="18" height="4" rx="1" fill="#9ca3af"/>
      <rect x="148" y="10" width="18" height="4" rx="1" fill="#9ca3af"/>
      <rect x="237" y="7" width="34" height="10" rx="5" fill="#2563eb"/>
      <rect y="24" width="280" height="80" fill="#eff6ff"/>
      <ellipse cx="210" cy="64" rx="55" ry="40" fill="#bfdbfe" fillOpacity="0.7"/>
      <rect x="163" y="44" width="80" height="5" rx="1" fill="#93c5fd" fillOpacity="0.8"/>
      <rect x="163" y="53" width="64" height="4" rx="1" fill="#93c5fd" fillOpacity="0.6"/>
      <rect x="163" y="61" width="70" height="4" rx="1" fill="#93c5fd" fillOpacity="0.6"/>
      <rect x="10" y="35" width="12" height="5" rx="2.5" fill="#2563eb" fillOpacity="0.15"/>
      <rect x="10" y="44" width="125" height="9" rx="2" fill="#111827"/>
      <rect x="10" y="57" width="105" height="4" rx="1" fill="#6b7280"/>
      <rect x="10" y="65" width="90" height="4" rx="1" fill="#6b7280"/>
      <rect x="10" y="77" width="38" height="12" rx="3" fill="#2563eb"/>
      <rect x="54" y="77" width="32" height="12" rx="3" fill="none" stroke="#2563eb" strokeWidth="1.5"/>
      <rect y="104" width="280" height="28" fill="white"/>
      <rect x="8" y="110" width="58" height="15" rx="4" fill="#eff6ff"/>
      <rect x="74" y="110" width="58" height="15" rx="4" fill="#eff6ff"/>
      <rect x="140" y="110" width="58" height="15" rx="4" fill="#eff6ff"/>
      <rect x="206" y="110" width="66" height="15" rx="4" fill="#eff6ff"/>
      <rect x="16" y="114" width="18" height="4" rx="1" fill="#2563eb"/>
      <rect x="16" y="120" width="26" height="3" rx="1" fill="#9ca3af"/>
      <rect x="82" y="114" width="18" height="4" rx="1" fill="#2563eb"/>
      <rect x="82" y="120" width="26" height="3" rx="1" fill="#9ca3af"/>
      <rect x="148" y="114" width="18" height="4" rx="1" fill="#2563eb"/>
      <rect x="148" y="120" width="26" height="3" rx="1" fill="#9ca3af"/>
      <rect x="214" y="114" width="18" height="4" rx="1" fill="#2563eb"/>
      <rect x="214" y="120" width="26" height="3" rx="1" fill="#9ca3af"/>
      <rect y="132" width="280" height="43" fill="#f9fafb"/>
      <rect x="96" y="138" width="88" height="6" rx="1" fill="#111827"/>
      <rect x="30" y="148" width="220" height="3" rx="1" fill="#d1d5db"/>
      <rect x="50" y="154" width="180" height="3" rx="1" fill="#d1d5db"/>
      <rect x="60" y="160" width="160" height="3" rx="1" fill="#d1d5db"/>
      <rect y="167" width="280" height="8" fill="#1f2937"/>
    </svg>
  );
}

function MinimalThumb() {
  return (
    <svg viewBox="0 0 280 175" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="280" height="22" fill="white"/>
      <rect y="21" width="280" height="1" fill="#f3f4f6"/>
      <rect x="12" y="7" width="22" height="8" rx="1" fill="#111827"/>
      <rect x="12" y="16" width="42" height="2" rx="1" fill="#9ca3af"/>
      <rect x="176" y="9" width="18" height="4" rx="1" fill="#9ca3af"/>
      <rect x="200" y="9" width="18" height="4" rx="1" fill="#9ca3af"/>
      <rect x="224" y="9" width="18" height="4" rx="1" fill="#9ca3af"/>
      <rect x="255" y="8" width="13" height="6" rx="1" fill="none" stroke="#111827" strokeWidth="0.8"/>
      <rect y="22" width="280" height="88" fill="white"/>
      <rect x="12" y="32" width="6" height="6" rx="1" fill="#6366f1"/>
      <rect x="22" y="32" width="50" height="6" rx="1" fill="#374151"/>
      <rect x="12" y="44" width="230" height="14" rx="2" fill="#111827"/>
      <rect x="12" y="62" width="180" height="14" rx="2" fill="#111827"/>
      <rect x="12" y="82" width="200" height="4" rx="1" fill="#9ca3af"/>
      <rect x="12" y="90" width="170" height="4" rx="1" fill="#9ca3af"/>
      <rect x="12" y="100" width="46" height="12" rx="2" fill="#111827"/>
      <rect x="64" y="100" width="40" height="12" rx="2" fill="none" stroke="#d1d5db" strokeWidth="1"/>
      <rect y="110" width="280" height="1" fill="#f3f4f6"/>
      <rect y="111" width="280" height="20" fill="white"/>
      <rect x="12" y="117" width="22" height="6" rx="1" fill="#111827"/>
      <rect x="38" y="119" width="28" height="3" rx="1" fill="#9ca3af"/>
      <rect x="88" y="117" width="22" height="6" rx="1" fill="#111827"/>
      <rect x="114" y="119" width="28" height="3" rx="1" fill="#9ca3af"/>
      <rect x="164" y="117" width="22" height="6" rx="1" fill="#111827"/>
      <rect x="190" y="119" width="28" height="3" rx="1" fill="#9ca3af"/>
      <rect y="131" width="280" height="44" fill="white"/>
      <rect x="12" y="138" width="6" height="3" rx="0.5" fill="#6366f1"/>
      <rect x="22" y="136" width="80" height="6" rx="1" fill="#111827"/>
      <rect x="12" y="147" width="256" height="3" rx="1" fill="#d1d5db"/>
      <rect x="12" y="153" width="230" height="3" rx="1" fill="#d1d5db"/>
      <rect x="12" y="159" width="210" height="3" rx="1" fill="#d1d5db"/>
      <rect x="12" y="165" width="180" height="3" rx="1" fill="#d1d5db"/>
      <rect y="168" width="280" height="1" fill="#e5e7eb"/>
      <rect y="169" width="280" height="6" fill="white"/>
      <rect x="12" y="172" width="55" height="2" rx="1" fill="#9ca3af"/>
      <rect x="200" y="172" width="68" height="2" rx="1" fill="#9ca3af"/>
    </svg>
  );
}

// ── Template definitions ────────────────────────────────────

interface TemplateInfo {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  Thumb: React.FC;
}

const TEMPLATES: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Classic',
    tagline: 'Timeless · Formal · Prestigious',
    description: 'A dark, authoritative design inspired by established institutions. Navy header, accent lines, formal two-column body.',
    features: ['Dark navy header & footer', 'Accent-line ornaments', "Principal's dark quote card", 'Stats strip on dark band'],
    Thumb: ClassicThumb,
  },
  {
    id: 'modern',
    name: 'Modern',
    tagline: 'Clean · Bold · Contemporary',
    description: 'A fresh split-hero design with card-based sections. Makes strong use of your brand color throughout.',
    features: ['Split hero with gradient blob', 'Stat cards with icon backgrounds', 'Card-based section layout', 'Brand-colored accents everywhere'],
    Thumb: ModernThumb,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Simple · Elegant · Refined',
    description: 'Maximum whitespace and typography-first design. Understated accents let the school content speak.',
    features: ['Large bold display typography', 'Maximum breathing room', 'Blockquote principal message', 'Subtle color accents only'],
    Thumb: MinimalThumb,
  },
];

// ── Shared editor primitives ────────────────────────────────

const inputCls = [
  'w-full rounded-xl border border-gray-200 dark:border-slate-600',
  'bg-white dark:bg-slate-700/50 dark:text-slate-100',
  'px-3.5 py-2.5 text-sm',
  'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
  'transition-all duration-150 placeholder:text-gray-300 dark:placeholder:text-slate-600',
].join(' ');

function FL({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-[10.5px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1.5">
        {children}
      </span>
      {hint && <span className="block text-xs text-gray-400 dark:text-slate-500 mb-1.5 -mt-1">{hint}</span>}
    </label>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={cn('w-9 h-5 rounded-full transition-colors duration-200 relative flex-shrink-0',
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600')}
      >
        <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0.5')} />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-slate-200">{label}</span>
    </label>
  );
}

// ── Section editors ─────────────────────────────────────────

function HeroEditor({ site, set }: { site: SiteConfig; set: (s: SiteConfig) => void }) {
  const h = site.hero;
  const up = (patch: Partial<typeof h>) => set({ ...site, hero: { ...h, ...patch } });
  return (
    <div className="space-y-4">
      <div><FL>Main Headline</FL><input className={inputCls} value={h.headline} onChange={e => up({ headline: e.target.value })} placeholder="Shaping Tomorrow's Leaders" /></div>
      <div><FL hint="Shown below the headline">Subtext / Welcome Message</FL><textarea rows={3} className={cn(inputCls, 'resize-none')} value={h.subtext} onChange={e => up({ subtext: e.target.value })} placeholder="We are committed to providing quality education..." /></div>
      <div><FL hint="Text on the primary call-to-action button">CTA Button Label</FL><input className={inputCls} value={h.ctaText} onChange={e => up({ ctaText: e.target.value })} placeholder="Apply Now" /></div>
    </div>
  );
}

function AboutEditor({ site, set }: { site: SiteConfig; set: (s: SiteConfig) => void }) {
  const a = site.about;
  const up = (patch: Partial<typeof a>) => set({ ...site, about: { ...a, ...patch } });
  return (
    <div className="space-y-4">
      <div><FL>About Text</FL><textarea rows={5} className={cn(inputCls, 'resize-none')} value={a.body} onChange={e => up({ body: e.target.value })} placeholder="Tell visitors about your school..." /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><FL>Year Founded</FL><input className={inputCls} value={a.founded} onChange={e => up({ founded: e.target.value })} placeholder="1985" /></div>
        <div><FL>Principal Name</FL><input className={inputCls} value={a.principalName} onChange={e => up({ principalName: e.target.value })} placeholder="Mr. Ahmed Khan" /></div>
      </div>
      <div><FL>Principal's Quote</FL><textarea rows={3} className={cn(inputCls, 'resize-none')} value={a.principalQuote} onChange={e => up({ principalQuote: e.target.value })} placeholder="Education is the most powerful weapon..." /></div>
      <div><FL>Mission</FL><textarea rows={2} className={cn(inputCls, 'resize-none')} value={a.mission} onChange={e => up({ mission: e.target.value })} placeholder="To nurture every student..." /></div>
      <div><FL>Vision</FL><textarea rows={2} className={cn(inputCls, 'resize-none')} value={a.vision} onChange={e => up({ vision: e.target.value })} placeholder="A generation of confident, ethical leaders..." /></div>
    </div>
  );
}

function StatsEditor({ site, set }: { site: SiteConfig; set: (s: SiteConfig) => void }) {
  const s = site.stats;
  const upItem = (i: number, patch: Partial<{ label: string; value: string }>) => {
    const items = s.items.map((it, idx) => idx === i ? { ...it, ...patch } : it);
    set({ ...site, stats: { ...s, items } });
  };
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 dark:text-slate-500">Up to 4 stats shown as large numbers across the page.</p>
      {s.items.map((item, i) => (
        <div key={i} className="grid grid-cols-2 gap-3">
          <div><FL>Value</FL><input className={inputCls} value={item.value} onChange={e => upItem(i, { value: e.target.value })} placeholder="500+" /></div>
          <div><FL>Label</FL><input className={inputCls} value={item.label} onChange={e => upItem(i, { label: e.target.value })} placeholder="Students" /></div>
        </div>
      ))}
    </div>
  );
}

function AdmissionsEditor({ site, set }: { site: SiteConfig; set: (s: SiteConfig) => void }) {
  const a = site.admissions;
  const up = (patch: Partial<typeof a>) => set({ ...site, admissions: { ...a, ...patch } });
  return (
    <div className="space-y-4">
      <div><FL hint="Intro paragraph for the admissions section">Description</FL><textarea rows={3} className={cn(inputCls, 'resize-none')} value={a.body} onChange={e => up({ body: e.target.value })} placeholder="We welcome applications for all grades..." /></div>
      <div><FL hint="Age, grade, documents required">Eligibility Criteria</FL><textarea rows={3} className={cn(inputCls, 'resize-none')} value={a.criteria} onChange={e => up({ criteria: e.target.value })} placeholder="Students aged 4-16 may apply..." /></div>
      <div><FL hint="Step-by-step process">How to Apply</FL><textarea rows={4} className={cn(inputCls, 'resize-none')} value={a.process} onChange={e => up({ process: e.target.value })} placeholder="1. Visit the school office&#10;2. Fill in the application form&#10;3. Submit required documents..." /></div>
    </div>
  );
}

function ContactEditor({ site, set }: { site: SiteConfig; set: (s: SiteConfig) => void }) {
  const c = site.contact;
  const up = (patch: Partial<typeof c>) => set({ ...site, contact: { ...c, ...patch } });
  return (
    <div className="space-y-4">
      <div><FL>Address</FL><input className={inputCls} value={c.address} onChange={e => up({ address: e.target.value })} placeholder="123 Model Town, Lahore, Punjab" /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><FL>Phone</FL><input type="tel" className={inputCls} value={c.phone} onChange={e => up({ phone: e.target.value })} placeholder="+92 300 0000000" /></div>
        <div><FL>Email</FL><input type="email" className={inputCls} value={c.email} onChange={e => up({ email: e.target.value })} placeholder="info@school.pk" /></div>
      </div>
    </div>
  );
}

function NewsEditor({ site, set }: { site: SiteConfig; set: (s: SiteConfig) => void }) {
  const n = site.news;
  const addPost = () => {
    const newPost: SiteNewsPost = { id: Date.now().toString(), title: '', body: '', date: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) };
    set({ ...site, news: { ...n, posts: [newPost, ...n.posts] } });
  };
  const removePost = (id: string) => set({ ...site, news: { ...n, posts: n.posts.filter(p => p.id !== id) } });
  const upPost = (id: string, patch: Partial<SiteNewsPost>) =>
    set({ ...site, news: { ...n, posts: n.posts.map(p => p.id === id ? { ...p, ...patch } : p) } });

  return (
    <div className="space-y-5">
      <button type="button" onClick={addPost}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl text-sm font-medium text-gray-500 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-600 dark:hover:text-blue-400 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Post
      </button>
      {n.posts.map(post => (
        <div key={post.id} className="rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <FL>Post Title</FL>
            <button type="button" onClick={() => removePost(post.id)} className="text-red-400 hover:text-red-600 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
          <input className={inputCls} value={post.title} onChange={e => upPost(post.id, { title: e.target.value })} placeholder="Annual Results 2025" />
          <div><FL>Date</FL><input className={inputCls} value={post.date} onChange={e => upPost(post.id, { date: e.target.value })} placeholder="15 Jun 2025" /></div>
          <div><FL>Content</FL><textarea rows={3} className={cn(inputCls, 'resize-none')} value={post.body} onChange={e => upPost(post.id, { body: e.target.value })} placeholder="We are pleased to announce..." /></div>
        </div>
      ))}
      {n.posts.length === 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-slate-500 py-4">No posts yet. Click "Add Post" to create one.</p>
      )}
    </div>
  );
}

function PoliciesEditor({ site, set }: { site: SiteConfig; set: (s: SiteConfig) => void }) {
  const p = site.policies;
  const up = (patch: Partial<typeof p>) => set({ ...site, policies: { ...p, ...patch } });
  return (
    <div className="space-y-4">
      <div><FL>Privacy Policy</FL><textarea rows={5} className={cn(inputCls, 'resize-none')} value={p.privacy} onChange={e => up({ privacy: e.target.value })} placeholder="We collect personal information only for educational purposes..." /></div>
      <div><FL>Code of Conduct</FL><textarea rows={5} className={cn(inputCls, 'resize-none')} value={p.conduct} onChange={e => up({ conduct: e.target.value })} placeholder="All students are expected to maintain respect and discipline..." /></div>
    </div>
  );
}

// ── Template gallery ────────────────────────────────────────

function TemplateGallery({
  currentTemplateId,
  onSelect,
}: {
  currentTemplateId?: TemplateId;
  onSelect: (id: TemplateId) => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Choose Your Website Template</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1.5">
          Select the design that best fits your school. You can change it at any time.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {TEMPLATES.map(t => {
          const isActive = currentTemplateId === t.id;
          return (
            <div
              key={t.id}
              className={cn(
                'bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden transition-all',
                isActive
                  ? 'border-blue-500 dark:border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'
                  : 'border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg',
              )}
            >
              <div className="aspect-[16/10] bg-gray-50 dark:bg-slate-900 overflow-hidden">
                <t.Thumb />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base">{t.name}</h3>
                  {isActive && (
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 mb-2 tracking-wide">{t.tagline}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed mb-4">{t.description}</p>

                <ul className="space-y-1.5 mb-5">
                  {t.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                      <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelect(t.id)}
                  className={cn(
                    'w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-blue-600 text-white cursor-default'
                      : 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-gray-700 dark:hover:bg-white',
                  )}
                >
                  {isActive ? '✓ Currently Active' : `Use ${t.name} Template`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────

interface Props {
  orgId: string;
  initialSite?: SiteConfig;
  orgSlug: string;
}

export default function WebsiteBuilderTab({ orgId, initialSite, orgSlug }: Props) {
  const qc = useQueryClient();
  const [site, setSite]           = useState<SiteConfig>(initialSite ?? DEFAULT_SITE);
  const [view, setView]           = useState<'gallery' | 'editor'>(() => initialSite?.templateId ? 'editor' : 'gallery');
  const [activeSection, setActive] = useState<SectionId>('hero');
  const [saved, setSaved]          = useState(false);

  const saveMutation = useMutation({
    mutationFn: (payload: SiteConfig) => api.put(`/organizations/${orgId}/site`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const togglePublish = useCallback(() => {
    const updated = { ...site, published: !site.published };
    setSite(updated);
    saveMutation.mutate(updated);
  }, [site, saveMutation]);

  const toggleSection = useCallback((id: SectionId, enabled: boolean) => {
    setSite(s => ({ ...s, [id]: { ...(s[id] as object), enabled } }));
  }, []);

  const handleSelectTemplate = (templateId: TemplateId) => {
    const updated = { ...site, templateId };
    setSite(updated);
    setView('editor');
    saveMutation.mutate(updated);
  };

  if (view === 'gallery') {
    return <TemplateGallery currentTemplateId={site.templateId} onSelect={handleSelectTemplate} />;
  }

  const activeTemplate = TEMPLATES.find(t => t.id === site.templateId) ?? TEMPLATES[1];
  const activeInfo     = SECTIONS.find(s => s.id === activeSection)!;

  return (
    <div className="space-y-4">

      {/* Status bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] dark:shadow-none px-5 py-3.5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 pr-3 border-r border-gray-200 dark:border-slate-600">
            <span className="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wide">{activeTemplate.name}</span>
            <button
              onClick={() => setView('gallery')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Change
            </button>
          </div>
          <span className={cn(
            'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
            site.published
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400',
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', site.published ? 'bg-emerald-500' : 'bg-gray-400')} />
            {site.published ? 'Published' : 'Draft'}
          </span>
          {site.published && (
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              {orgSlug}.tws.enterprises
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Saved
            </span>
          )}
          <button
            onClick={() => saveMutation.mutate(site)}
            disabled={saveMutation.isPending}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={togglePublish}
            disabled={saveMutation.isPending}
            className={cn(
              'px-4 py-2 text-sm font-semibold rounded-xl disabled:opacity-50 transition-all',
              site.published
                ? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_2px_8px_-2px_rgba(59,130,246,0.5)]',
            )}
          >
            {site.published ? 'Unpublish' : 'Publish Site'}
          </button>
        </div>
      </div>

      {saveMutation.isError && (
        <p className="text-xs text-red-500 px-1">{(saveMutation.error as any)?.response?.data?.message ?? 'Failed to save. Try again.'}</p>
      )}

      {/* Builder body */}
      <div className="flex gap-5">

        {/* Section sidebar */}
        <aside className="w-52 flex-shrink-0 hidden sm:block">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] dark:shadow-none overflow-hidden">
            {SECTIONS.map(s => {
              const sec = site[s.id] as { enabled: boolean };
              return (
                <div
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-slate-700/70 last:border-0 transition-colors',
                    activeSection === s.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700/50',
                  )}
                >
                  <p className={cn('text-sm font-medium truncate', activeSection === s.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-slate-200')}>
                    {s.label}
                  </p>
                  <div onClick={e => { e.stopPropagation(); toggleSection(s.id, !sec.enabled); }} className="ml-2 flex-shrink-0">
                    <div className={cn('w-8 h-4 rounded-full transition-colors duration-200 relative', sec.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600')}>
                      <span className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200', sec.enabled ? 'translate-x-4' : 'translate-x-0.5')} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Section editor panel */}
        <div className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] dark:shadow-none overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700/70 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-50 text-[0.95rem] tracking-tight">{activeInfo.label}</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{activeInfo.desc}</p>
            </div>
            <Toggle
              checked={(site[activeSection] as { enabled: boolean }).enabled}
              onChange={v => toggleSection(activeSection, v)}
              label={(site[activeSection] as { enabled: boolean }).enabled ? 'On' : 'Off'}
            />
          </div>

          <div className={cn('px-6 py-6', !(site[activeSection] as { enabled: boolean }).enabled && 'opacity-40 pointer-events-none')}>
            {activeSection === 'hero'       && <HeroEditor       site={site} set={setSite} />}
            {activeSection === 'about'      && <AboutEditor      site={site} set={setSite} />}
            {activeSection === 'stats'      && <StatsEditor      site={site} set={setSite} />}
            {activeSection === 'admissions' && <AdmissionsEditor site={site} set={setSite} />}
            {activeSection === 'contact'    && <ContactEditor    site={site} set={setSite} />}
            {activeSection === 'news'       && <NewsEditor       site={site} set={setSite} />}
            {activeSection === 'policies'   && <PoliciesEditor   site={site} set={setSite} />}
          </div>
        </div>
      </div>

      {/* Mobile section picker */}
      <div className="sm:hidden flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={cn(
              'flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              activeSection === s.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50',
            )}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
