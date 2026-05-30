# EduStack PK — Flutter Mobile App: Answered Questions
> WolfStack · Decisions Log for Flutter Implementation
> Recorded: 2026-05-25

---

## Q1 & Q7 — School Finder / Org Configuration Flow

**Decision: Dual QR Code System (WhatsApp-inspired)**

Two parallel flows, both QR-based:

### Flow A — App Shows QR (WhatsApp Web Style)
```
User opens app (fresh install, no org configured)
      ↓
App generates a unique device QR code on screen
      ↓
Group Admin scans this QR from the web portal (admin panel)
      ↓
Web portal pushes org configuration to that device
(org slug, branding, logo, welcome message)
      ↓
App auto-mounts: org login page, branding, colors
      ↓
User sees their school's login screen — ready to log in
```

### Flow B — Admin Generates Printable QR
```
Group Admin generates an org QR code from web portal
      ↓
QR printed (paper, notice board, ID card, WhatsApp shared)
      ↓
User opens app → taps "Scan School QR" → camera opens
      ↓
User scans printed QR
      ↓
App decodes: org slug + config URL
      ↓
App fetches org branding from GET /api/public/orgs/:slug
      ↓
App mounts org login page with school colors/logo
```

### Super Admin Panel (Web)
- View all orgs with mobile configuration status
- See which devices have linked to which org (Flow A)
- Toggle mobile access per org (enable/disable)
- View mobile app usage metrics per org

### After Org Configured
- Org config persisted permanently in app (like WhatsApp stores your account)
- User never needs to scan again unless they log out or uninstall
- Splash screen → directly to login page of their school

---

## Q2 — App Name
**Status: NOT DECIDED YET** — placeholder "EduStack PK" used in planning

---

## Q3 — Logo / Branding
**Status: NOT READY** — placeholder icon used during development

---

## Q4 — Roles in v1
**Decision: ALL roles**
- `student`
- `teacher`
- `branch_principal`
- `coordinator`
- `accountant`
- `it_admin`
- `group_admin`
- `super_admin`

Each role gets a role-appropriate home dashboard after login.
Single app, role-adaptive UI.

---

## Q5 — Parent Role
**Decision: NOT NEEDED YET** — deferred to future version

---

## Q6 — Multi-Child Parents
**Decision: NOT NEEDED YET** — deferred along with parent role

---

## Q8 — Remember School After Login
**Decision: YES — always remember, like WhatsApp**
- Once org is configured, it is never forgotten
- App remembers: org slug, org name, org logo, primary color
- Even after logout, the login page shows the same school
- User must explicitly "Switch School" to change org

---

## Q9 — Token Session Length on Mobile
**Decision: 30 days refresh token for mobile**
- Access token: 15 minutes (unchanged)
- Refresh token: 30 days (mobile-specific — web stays 7 days)
- Backend must detect mobile requests and issue longer refresh token
- Detection: `X-Client-Type: mobile` header sent by Flutter app

---

## Q10 — Biometric Login
**Decision: V2** — not in first release

---

## Q11 — Auto-Logout on Inactivity
**Decision: 10 days of app-not-opened = auto logout**
- Flutter app tracks `lastActiveAt` timestamp in local storage
- On app open: if `now - lastActiveAt > 10 days` → clear tokens → show login
- This is client-side enforcement (server-side refresh token also expires at 30 days)

---

## Q12 — Student Screens
**Decision: ALL screens needed in v1**
- Home dashboard (attendance %, fee badge, upcoming exam countdown)
- Today's timetable with NOW badge
- Full weekly timetable view
- Exam results (latest + history)
- Per-subject marks breakdown
- Monthly attendance calendar
- Fee challans list (view only)
- Pending assignments
- Class fellows with ranks
- Notification inbox
- Profile screen

---

## Q13 — Fee Payment
**Decision: VIEW ONLY** — no in-app payment gateway in v1
- Students see challan status, amount due, due date
- Payment is done offline (cash/bank) as today
- Payment gateway (JazzCash/EasyPaisa) is a future feature

---

## Q14 — Download Results as PDF
**Decision: YES** — students can download result card as PDF
- Backend generates PDF (or Flutter renders and exports locally)
- Saved to device Downloads folder
- Share via WhatsApp/email from within app

---

## Q15 — Teacher Screens
**Decision: ALL screens needed in v1**
- Home dashboard (today's classes, quick stats)
- Today's schedule with NOW badge
- Attendance marking (bulk mode)
- Results entry (exam marks per student)
- Assignment list + create
- Submission review + grading
- Weekly timetable view
- Notifications
- Student list for their assigned classes

---

## Q16 — Attendance Marking UX
**Decision: Option A — Bulk Mode**
```
All students listed as PRESENT by default
Teacher taps only the ABSENT / LATE students
One-tap toggle: Present → Absent → Late → Excused
Submit button at bottom
```
Fastest for large classes (30-50 students). Matches how teachers think.

---

## Q17 — Offline Attendance Marking
**Decision: YES — v1 includes offline support**
- Teacher marks attendance without internet
- Stored locally (Hive/Isar database on device)
- Auto-syncs when internet returns
- UI shows "Pending sync" badge on offline records
- Conflict resolution: last-write-wins (server takes priority)

---

## Q18 — Firebase / Push Notifications
**Decision: PENDING** — evaluate cost before implementing
- FCM itself is FREE (Google Firebase — no charge per notification)
- firebase-admin on backend: free
- The concern may be about firebase_messaging Flutter package or setup complexity
- ACTION: Confirm Firebase is free → implement in v1 if confirmed free

> NOTE: Firebase Cloud Messaging (FCM) has NO per-message cost.
> The free Spark plan covers unlimited messages.
> Only Firebase products like Firestore/Hosting cost money.
> FCM for push notifications = completely free.

---

## Q19 — Push Notification Events
**Decision: ALL events trigger push**
- Fee due reminder → student
- Result published → student
- Assignment created → student
- Assignment graded → student
- Attendance shortage warning → student
- Broadcast from principal → all branch users
- New resource/SOP uploaded → relevant roles

---

## Q20 — Deep Link on Notification Tap
**Decision: YES** — notification tap opens specific screen
- "Result published" → opens Results screen
- "Assignment created" → opens Assignments screen
- "Fee due" → opens Fee Challans screen
- Uses Flutter GoRouter deep linking

---

## Q21 — Design System
**Decision: C — Material 3 colored with Navy Blue**
- Material 3 components (cards, bottom nav, FAB, chips)
- Navy Blue as primary seed color (same as web: #1e3a5f or similar)
- Dynamic color scheme seeded from org's brand color (per-school theming)
- Feels modern + familiar to Android users

---

## Q22 — Dark Mode
**Decision: YES** — dark mode support in v1
- Follows system setting by default
- User can override in app settings
- Same toggle behavior as web app

---

## Q23 — Urdu / RTL Support
**Decision: YES** — full Urdu + RTL layout in v1
- Language toggle: English / اردو
- Full layout flip when Urdu selected (RTL)
- Flutter has excellent built-in RTL support via `Directionality` widget
- Major differentiator in Pakistani market

---

## Q24 — Per-School Color Theming
**Decision: YES** — each school's primary color themes the app
- `Organization.settings` needs new field: `primaryColor: string` (hex)
- Flutter seeds `ColorScheme.fromSeed(seedColor: orgColor)` from this value
- Every school gets their own branded app experience — same app, different colors

---

## Q25 — State Management
**Decision: Riverpod 2.x** (recommended by developer, user deferred to developer)
- Best for async data fetching (like TanStack Query)
- Clean separation of UI and business logic
- Excellent DevTools support
- No build_runner needed for basic usage

---

## Q26 — Codebase Location
**Decision: Monorepo — mobile/ folder inside existing project**
```
School ERP/
├── backend/          (existing Node.js)
├── frontend/         (existing React)
├── mobile/           (new Flutter app)
├── CONCEPT.md
├── MOBILE_ANSWERS.md
└── MOBILE_PLAN.md
```

---

## Q27 & Q28 — Flutter & Android Studio Installed
**Status: UNKNOWN / NO**
- Flutter SDK: not confirmed installed
- Android Studio: NOT installed
- Plan: include full environment setup in implementation guide

---

## Q29 — Mac for iOS Builds
**Decision: NO Mac available**
- iOS builds via **Codemagic** (cloud CI/CD — free tier: 500 build minutes/month)
- Android builds locally via Android Studio (once installed)
- Or both platforms via Codemagic cloud builds

---

## Q30 — Apple Developer Account
**Decision: NOT YET** — Android (Google Play) first
- Apple Developer: $99/year — defer until Android is live and generating revenue
- Android-first strategy matches Pakistan market (~82% Android)

---

## Q31 — Backend Changes
**Decision: Implement if necessary**
- Backend changes are REQUIRED for Flutter to work
- All changes are additive (no breaking changes to existing web)
- Web continues to work exactly as before
- Mobile adds new auth header support alongside existing cookie auth

---

## CLARIFICATION NEEDED

**On QR Flow A (App generates QR → Admin scans):**
This requires a real-time channel between the app and backend during the QR scanning moment (like WebSocket or polling). The sequence would be:
1. App generates a session token → encodes as QR
2. Backend holds this session pending org assignment
3. Admin scans from web portal → backend links org to session token
4. App is polling/listening → receives org config

Is this the correct understanding? Or is Flow B (Admin generates QR → User scans) sufficient alone?

**Flow B is simpler and solves the same problem.** Recommend starting with Flow B only for v1, adding Flow A in v2. Confirm?

---

## RESOLVED (2026-05-25)
- [x] App name → **"EduStack"** (placeholder, changeable)
- [x] App icon → placeholder until branding ready
- [x] Firebase FCM → **confirmed free, implementing in v1**
- [x] QR → **v1 = Flow B only** (printable QR, user scans). Flow A deferred to v2.
- [x] `primaryColor` → added to `Organization.settings` in backend
- [x] All backend changes → **completed, TypeScript-verified clean**
