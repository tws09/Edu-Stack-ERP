# EduStack PK — Flutter Mobile App: Implementation Plan
> WolfStack · Complete Build Roadmap
> Created: 2026-05-25

---

## EXECUTIVE SUMMARY

Build a Flutter mobile app (Android-first, iOS via Codemagic) that connects to the existing EduStack PK Node.js backend. Single app, all 8 roles, QR-based org onboarding, Material 3 + Navy Blue theme, Urdu RTL support, offline attendance, result PDF export.

**Timeline estimate (solo dev):** 10–14 weeks to Play Store submission
**Backend changes required:** Yes (additive only, zero breaking changes to web)

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                   FLUTTER APP (mobile/)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  GoRouter    │  │  Riverpod    │  │   Dio HTTP       │   │
│  │  Navigation  │  │  State Mgmt  │  │   Client         │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Hive/Isar   │  │  FCM Push    │  │  flutter_secure  │   │
│  │  Local Cache │  │  Notif.      │  │  _storage        │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  mobile_scan │  │  QR Generate │  │  pdf / open_file │   │
│  │  (camera)    │  │  (org setup) │  │  (result export) │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                    REST API + FCM
                           │
┌─────────────────────────────────────────────────────────────┐
│              EXISTING BACKEND (no breaking changes)          │
│  + Bearer token auth  + X-Org-Slug header                    │
│  + X-Client-Type header  + mobile refresh endpoint           │
│  + FCM token field  + org QR generation endpoint             │
└─────────────────────────────────────────────────────────────┘
```

---

## COMPLETE PACKAGE LIST

```yaml
# pubspec.yaml — all dependencies

dependencies:
  flutter:
    sdk: flutter

  # Navigation
  go_router: ^14.0.0

  # State management
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0

  # HTTP
  dio: ^5.4.0

  # Secure token storage
  flutter_secure_storage: ^9.2.0

  # Local preferences (org slug, theme, language)
  shared_preferences: ^2.3.0

  # Local offline database (attendance queue)
  hive_flutter: ^1.1.0
  hive: ^2.2.3

  # QR code scanning
  mobile_scanner: ^5.0.0

  # QR code generation (show QR on screen)
  qr_flutter: ^4.1.0

  # Push notifications
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0

  # Charts (results trend, attendance)
  fl_chart: ^0.68.0

  # PDF generation / viewing
  pdf: ^3.11.0
  printing: ^5.13.0
  open_filex: ^4.4.0

  # Image picker (profile photo)
  image_picker: ^1.1.0

  # Localization
  flutter_localizations:
    sdk: flutter
  intl: ^0.19.0

  # Connectivity
  connectivity_plus: ^6.0.0

  # Network image caching
  cached_network_image: ^3.3.0

  # Date formatting
  timeago: ^3.6.0

  # App icons + splash
  flutter_svg: ^2.0.10

dev_dependencies:
  flutter_test:
    sdk: flutter
  riverpod_generator: ^2.4.0
  build_runner: ^2.4.0
  flutter_launcher_icons: ^0.13.0
  flutter_native_splash: ^2.4.0
  hive_generator: ^2.0.0
```

---

## FOLDER STRUCTURE

```
mobile/
├── android/                    # Android project files
├── ios/                        # iOS project files
├── assets/
│   ├── images/
│   │   ├── logo_placeholder.png
│   │   └── splash.png
│   ├── translations/
│   │   ├── en.json             # English strings
│   │   └── ur.json             # Urdu strings
│   └── fonts/
│       └── NotoNastaliqUrdu.ttf  # Urdu font
├── lib/
│   ├── main.dart               # Entry point
│   ├── app.dart                # MaterialApp + GoRouter + Riverpod
│   │
│   ├── core/
│   │   ├── constants/
│   │   │   ├── api_constants.dart      # Base URL, endpoints
│   │   │   ├── storage_keys.dart       # SharedPrefs + SecureStore keys
│   │   │   └── app_colors.dart         # Navy Blue palette
│   │   ├── theme/
│   │   │   ├── app_theme.dart          # Material 3 theme builder
│   │   │   └── color_scheme.dart       # Dynamic org color seeding
│   │   ├── router/
│   │   │   ├── app_router.dart         # GoRouter config + guards
│   │   │   └── route_names.dart        # Named route constants
│   │   ├── network/
│   │   │   ├── dio_client.dart         # Dio instance + interceptors
│   │   │   └── auth_interceptor.dart   # Bearer token + refresh logic
│   │   ├── storage/
│   │   │   ├── secure_storage.dart     # flutter_secure_storage wrapper
│   │   │   └── local_storage.dart      # SharedPreferences wrapper
│   │   ├── offline/
│   │   │   ├── hive_boxes.dart         # Hive box definitions
│   │   │   └── sync_service.dart       # Offline → online sync logic
│   │   └── l10n/
│   │       ├── app_localizations.dart  # i18n setup
│   │       └── locale_provider.dart    # Riverpod locale state
│   │
│   ├── models/                 # Dart data classes (mirrors backend models)
│   │   ├── user.dart
│   │   ├── student.dart
│   │   ├── org.dart
│   │   ├── timetable.dart
│   │   ├── exam.dart
│   │   ├── result.dart
│   │   ├── assignment.dart
│   │   ├── attendance.dart
│   │   ├── challan.dart
│   │   ├── notification.dart
│   │   └── api_response.dart   # Generic { success, data, message }
│   │
│   ├── services/               # API call layer (mirrors web services/)
│   │   ├── auth_service.dart
│   │   ├── student_service.dart
│   │   ├── timetable_service.dart
│   │   ├── exam_service.dart
│   │   ├── attendance_service.dart
│   │   ├── assignment_service.dart
│   │   ├── fee_service.dart
│   │   ├── notification_service.dart
│   │   └── org_service.dart    # Org branding + QR config
│   │
│   ├── providers/              # Riverpod providers (state)
│   │   ├── auth_provider.dart          # Login, logout, current user
│   │   ├── org_provider.dart           # Org config, theme color
│   │   ├── timetable_provider.dart
│   │   ├── exam_provider.dart
│   │   ├── attendance_provider.dart
│   │   ├── assignment_provider.dart
│   │   ├── fee_provider.dart
│   │   └── notification_provider.dart
│   │
│   ├── screens/
│   │   ├── onboarding/
│   │   │   ├── splash_screen.dart          # Logo + check auth state
│   │   │   ├── qr_scanner_screen.dart      # Scan school QR (Flow B)
│   │   │   └── org_confirm_screen.dart     # Show school info, confirm
│   │   │
│   │   ├── auth/
│   │   │   ├── login_screen.dart           # Role-tabbed login
│   │   │   └── change_password_screen.dart
│   │   │
│   │   ├── student/
│   │   │   ├── student_shell.dart          # Bottom nav shell
│   │   │   ├── dashboard/
│   │   │   │   └── student_dashboard.dart
│   │   │   ├── timetable/
│   │   │   │   ├── today_timetable.dart
│   │   │   │   └── weekly_timetable.dart
│   │   │   ├── results/
│   │   │   │   ├── results_list.dart
│   │   │   │   ├── result_detail.dart
│   │   │   │   └── result_pdf_view.dart
│   │   │   ├── attendance/
│   │   │   │   └── my_attendance.dart      # Monthly calendar
│   │   │   ├── assignments/
│   │   │   │   └── my_assignments.dart
│   │   │   ├── fees/
│   │   │   │   └── my_challans.dart
│   │   │   ├── class_fellows/
│   │   │   │   └── class_fellows.dart
│   │   │   └── notifications/
│   │   │       └── notifications.dart
│   │   │
│   │   ├── teacher/
│   │   │   ├── teacher_shell.dart          # Bottom nav shell
│   │   │   ├── dashboard/
│   │   │   │   └── teacher_dashboard.dart
│   │   │   ├── attendance/
│   │   │   │   ├── select_class.dart       # Pick class + period
│   │   │   │   └── mark_attendance.dart    # Bulk mark screen
│   │   │   ├── results/
│   │   │   │   ├── select_exam.dart
│   │   │   │   └── enter_marks.dart
│   │   │   ├── assignments/
│   │   │   │   ├── assignment_list.dart
│   │   │   │   ├── create_assignment.dart
│   │   │   │   └── submissions.dart
│   │   │   ├── timetable/
│   │   │   │   └── teacher_timetable.dart
│   │   │   └── notifications/
│   │   │       └── notifications.dart
│   │   │
│   │   ├── principal/           # branch_principal screens
│   │   ├── coordinator/         # coordinator screens
│   │   ├── accountant/          # accountant screens
│   │   ├── group_admin/         # group_admin screens
│   │   ├── super_admin/         # super_admin screens (incl. mobile configs)
│   │   │   └── mobile_config.dart   # Org mobile config management
│   │   │
│   │   └── shared/
│   │       ├── profile_screen.dart
│   │       ├── settings_screen.dart     # Theme, language, logout
│   │       └── no_internet_screen.dart
│   │
│   └── widgets/                # Reusable UI components
│       ├── app_bar.dart
│       ├── bottom_nav.dart
│       ├── stat_card.dart
│       ├── avatar.dart
│       ├── grade_badge.dart
│       ├── timetable_card.dart
│       ├── challan_card.dart
│       ├── result_chart.dart        # fl_chart wrapper
│       ├── attendance_calendar.dart
│       ├── loading_overlay.dart
│       ├── error_state.dart
│       └── empty_state.dart
│
├── test/
│   ├── unit/
│   └── widget/
├── pubspec.yaml
├── analysis_options.yaml
└── README.md
```

---

## PHASE-BY-PHASE IMPLEMENTATION ROADMAP

---

### PHASE 0 — Environment Setup (Week 1)
**Goal:** Working Flutter development environment + empty app running on emulator

#### Steps:
1. Install Flutter SDK (Windows)
   ```powershell
   # Download Flutter SDK
   # Add to PATH: C:\flutter\bin
   flutter doctor  # verify all green
   ```

2. Install Android Studio + Android SDK
   - Android SDK Platform 34 (Android 14)
   - Android Virtual Device (Pixel 7 emulator)
   - Android Studio Flutter plugin

3. Create Flutter project
   ```powershell
   cd "c:\Users\Super\School ERP"
   flutter create mobile --org com.wolfstack.edustack --platforms android,ios
   ```

4. Add all dependencies to `pubspec.yaml`

5. Run on emulator — confirm blank app boots

6. Configure `flutter_launcher_icons` (placeholder icon for now)

7. Configure `flutter_native_splash` (Navy Blue splash screen)

**Deliverable:** App boots, Navy Blue splash, blank home screen

---

### PHASE 1 — Backend Adaptation (Week 1-2)
**Goal:** Backend ready to serve Flutter without breaking web

#### 1.1 — Bearer Token Auth in `authenticate` middleware
```typescript
// backend/src/middleware/auth/authenticate.ts
// ADD: check Authorization header if no cookie

const token =
  req.cookies?.accessToken ||
  req.headers.authorization?.replace('Bearer ', '');
```

#### 1.2 — X-Org-Slug Header in `extractTenant` middleware
```typescript
// backend/src/middleware/tenant/extractTenant.ts
// ADD: read header if not a known subdomain

const slugFromHeader = req.headers['x-org-slug'] as string | undefined;
const slug = slugFromHost || slugFromHeader;
```

#### 1.3 — Mobile Refresh Token Endpoint
```typescript
// POST /api/auth/mobile/refresh
// Accepts: { refreshToken: string } in request body
// Returns: { accessToken, refreshToken } in JSON (not cookies)
// Reason: Flutter cannot access httpOnly refresh cookie on /api/auth/refresh path
```

#### 1.4 — X-Client-Type Header → 30-day Refresh Token
```typescript
// In login controller:
const isMobile = req.headers['x-client-type'] === 'mobile';
const refreshExpiry = isMobile ? '30d' : env.jwtRefreshExpiresIn; // '7d'
```

#### 1.5 — FCM Token Field on User Model
```typescript
// backend/src/models/User.ts
fcmTokens: { type: [String], default: [] }

// New endpoint: PUT /api/users/fcm-token
// Body: { fcmToken: string }
// Adds token to user's fcmTokens array (prevent duplicates)
```

#### 1.6 — Org QR Code Generation
```typescript
// New endpoint: POST /api/organizations/:id/generate-qr
// Auth: group_admin only
// Returns: { qrData: string } — encoded org config
// QR payload: { slug, name, logoUrl, primaryColor, apiUrl }
// QR is just a JSON string encoded — Flutter decodes it
```

#### 1.7 — Primary Color Field on Organization
```typescript
// backend/src/models/Organization.ts
// In settings object:
primaryColor: { type: String, default: '#1e3a5f' } // Navy Blue default
```

#### 1.8 — Mobile Config in Super Admin
```typescript
// New endpoint: GET /api/organizations/mobile-config (super_admin only)
// Returns list of orgs with: mobileEnabled, fcmTokenCount, lastMobileLoginAt
// New field on Organization: mobileEnabled: boolean (default true)
```

**Deliverable:** Backend accepts Flutter requests. Web works unchanged.

---

### PHASE 2 — Core Infrastructure (Week 2-3)
**Goal:** App can reach API, auth works, org persists

#### 2.1 — Dio Client with Auth Interceptor
```dart
// lib/core/network/dio_client.dart
// - Base URL from constants
// - Request interceptor: attach Bearer token from SecureStorage
// - Request interceptor: attach X-Org-Slug from LocalStorage
// - Request interceptor: attach X-Client-Type: mobile
// - Response interceptor: on 401 → call mobile refresh → retry
// - Response interceptor: on refresh fail → clear tokens → redirect to login
```

#### 2.2 — Secure Storage Service
```dart
// lib/core/storage/secure_storage.dart
// Keys: accessToken, refreshToken
// Methods: saveTokens(), getAccessToken(), getRefreshToken(), clearTokens()
```

#### 2.3 — Local Storage Service
```dart
// lib/core/storage/local_storage.dart
// Keys: orgSlug, orgName, orgLogo, orgPrimaryColor, lastActiveAt
// Methods: saveOrg(), getOrg(), clearOrg(), updateLastActive()
```

#### 2.4 — Auth Provider (Riverpod)
```dart
// lib/providers/auth_provider.dart
// State: AuthState { user, isAuthenticated, isLoading }
// Methods: login(), logout(), checkSession()
// On app open: check lastActiveAt → if > 10 days → logout
```

#### 2.5 — GoRouter with Auth Guards
```dart
// lib/core/router/app_router.dart
// Routes:
//   /splash           → SplashScreen (checks auth + org state)
//   /onboarding/scan  → QrScannerScreen
//   /onboarding/confirm → OrgConfirmScreen
//   /login            → LoginScreen
//   /student/*        → StudentShell (guarded: role=student)
//   /teacher/*        → TeacherShell (guarded: role=teacher)
//   /principal/*      → PrincipalShell
//   /coordinator/*    → CoordinatorShell
//   /accountant/*     → AccountantShell
//   /group/*          → GroupAdminShell
//   /admin/*          → SuperAdminShell
//
// Guards:
//   No org configured → /onboarding/scan
//   No auth → /login
//   Wrong role → role-appropriate home
```

**Deliverable:** Login works. Tokens stored. Auth guard redirects correctly per role.

---

### PHASE 3 — Onboarding / QR Flow (Week 3)
**Goal:** User can scan QR → org configured → login screen appears

#### 3.1 — Splash Screen
```
App opens →
  Check org in LocalStorage:
    No org → navigate to /onboarding/scan
    Has org → Check auth tokens:
      No tokens → navigate to /login
      Has tokens → Check 10-day inactivity:
        Inactive → clear tokens → /login
        Active → update lastActiveAt → navigate to role home
```

#### 3.2 — QR Scanner Screen (Flow B — Primary)
```dart
// Uses mobile_scanner package
// Full-screen camera viewfinder
// Overlay: semi-transparent with scan window cutout
// Text: "Scan your school's QR code"
// QR payload expected: JSON string
//   { "slug": "beaconhouse", "apiUrl": "...", "name": "Beaconhouse School" }
// On scan:
//   1. Parse JSON
//   2. Call GET /api/public/orgs/:slug
//   3. Fetch: name, logoUrl, primaryColor
//   4. Navigate to /onboarding/confirm with org data
```

#### 3.3 — Org Confirm Screen
```dart
// Shows: school logo (or placeholder), school name, "Is this your school?"
// [Confirm] → save org to LocalStorage → navigate to /login
// [Wrong School] → back to scanner
```

#### 3.4 — QR Generation (Group Admin Web — backend + frontend)
```
Web portal → Group Admin → Settings → "Generate Mobile QR"
Backend: POST /api/organizations/:id/generate-qr
Returns: qrData string (JSON encoded)
Frontend: renders QR image (using qrcode npm package)
Display: QR code + "Print this QR" button → A4 printout template
```

#### 3.5 — Switch School
```dart
// Settings screen → "Switch School" →
// Confirms: "This will log you out and reset the app"
// Clears: tokens + org config
// Navigates to: /onboarding/scan
```

**Deliverable:** Full onboarding flow. QR scan → org set → login page shows school branding.

---

### PHASE 4 — Login & Session (Week 3-4)
**Goal:** All 8 roles can log in, see role-appropriate home

#### 4.1 — Login Screen
```dart
// School logo at top (from org config)
// Tab bar: Admin | Teacher | Student (matches web)
// Email + Password fields
// "Forgot Password" placeholder
// Login button → calls POST /api/auth/login with:
//   { email, password, slug: orgSlug, loginAs: roleGroup }
//   Headers: X-Org-Slug, X-Client-Type: mobile
// On success: save tokens → navigate to role home
// On mustChangePassword: navigate to change_password screen
```

#### 4.2 — Role-based Navigation
```dart
// After login, router reads user.role:
// student       → /student/dashboard
// teacher       → /teacher/dashboard
// branch_principal, accountant, it_admin → /principal/dashboard
// coordinator   → /coordinator/dashboard
// group_admin   → /group/dashboard
// super_admin   → /admin/dashboard
```

#### 4.3 — 10-Day Inactivity Logout
```dart
// On every app foreground (AppLifecycleListener):
//   Update lastActiveAt in SharedPreferences
// On app open (SplashScreen):
//   Read lastActiveAt
//   If DateTime.now().difference(lastActiveAt).inDays >= 10:
//     clearTokens() → clearOrg() → navigate to /onboarding/scan
```

**Deliverable:** Login works for all roles. Wrong role shows error. Sessions persist 30 days.

---

### PHASE 5 — Student Portal (Week 4-6)
**Goal:** Full student experience

#### 5.1 — Student Shell (Bottom Navigation)
```
Bottom tabs:
  🏠 Home        → /student/dashboard
  📅 Timetable   → /student/timetable
  📊 Results     → /student/results
  💳 Fees        → /student/fees
  🔔 Alerts      → /student/notifications
```

#### 5.2 — Student Dashboard
```dart
// Cards: Attendance %, Last Grade, Fee Badge (overdue = red), Next Exam countdown
// Today's timetable preview (next 2-3 periods)
// Recent notification snippet
// Quick links: Class Fellows, Assignments
```

#### 5.3 — Timetable
```dart
// Today view: list of periods with subject, teacher, room, time
// NOW badge: highlight current period based on system time + periodTimings
// Weekly view: tab per day (Mon-Sat), swipe between days
// Data: GET /api/timetable with classId + sectionId from student profile
```

#### 5.4 — Results
```dart
// List of published exams → tap to see detail
// Detail: subject-by-subject marks table
// Grade badge, percentage, class position, pass/fail
// fl_chart: bar chart of marks per subject
// "Download PDF" button → generates PDF → opens with open_filex
// Marks trend chart across multiple exams (LineChart)
```

#### 5.5 — Monthly Attendance Calendar
```dart
// TableCalendar or custom grid
// Tap a month → fetch GET /api/attendance/my-records?month=X&year=Y
// Color code: green=present, red=absent, orange=late, grey=excused
// Summary: X/Y days present, attendance %
// Warning: if % < 75% → red banner "Attendance shortage warning"
```

#### 5.6 — Assignments
```dart
// List sorted by dueDate ascending (overdue first with red badge)
// Status: Pending / Submitted / Graded
// Tap → view details, attachment download, submission status + marks
```

#### 5.7 — Fee Challans
```dart
// List of challans sorted by month descending
// Status badges: Paid (green), Unpaid (red), Partial (amber), Overdue (dark red)
// Challan detail: fee breakdown, items, due date, payment history
// View only — no payment button in v1
```

#### 5.8 — Class Fellows
```dart
// Mirrors web ClassFellowsPage
// Sort: By Rank | By Roll No | By Name
// Class Topper banner (amber gradient, 🏆)
// Student cards: avatar, name, roll #, grade badge, 🥇🥈🥉 medals
// "You" badge on own card (blue border)
```

#### 5.9 — Notifications
```dart
// Full notification inbox
// Unread = slightly highlighted
// Tap → mark read + deep link to relevant screen
// Swipe to dismiss (mark read)
```

**Deliverable:** Complete student portal. All 9 screens working.

---

### PHASE 6 — Teacher Portal (Week 6-8)
**Goal:** Full teacher experience including offline attendance

#### 6.1 — Teacher Shell (Bottom Navigation)
```
Bottom tabs:
  🏠 Home          → /teacher/dashboard
  ✅ Attendance    → /teacher/attendance
  📝 Marks         → /teacher/results
  📚 Assignments   → /teacher/assignments
  🔔 Notifications → /teacher/notifications
```

#### 6.2 — Teacher Dashboard
```dart
// Stat cards: Students I teach, Pending to grade, Upcoming exams, Unread notifs
// Today's class schedule with NOW badge (same logic as student timetable)
// My Classes overview (subject chips per section)
// Quick actions: Mark Attendance, Enter Marks, Create Assignment
```

#### 6.3 — Attendance Marking (Offline-Capable)
```dart
// Step 1: Select class + section
// Step 2: Select date (default today) + period
// Step 3: Bulk mark screen:
//   - All students loaded as PRESENT by default
//   - Tap student → cycle: Present → Absent → Late → Excused
//   - Color coding: green/red/orange/grey
//   - Student count summary: "28 Present, 2 Absent, 1 Late"
//   - "Submit" button
//
// Online: POST /api/attendance directly
// Offline: save to Hive box { classId, sectionId, date, periodNo, records[] }
//   → show "Saved offline — will sync when connected"
//   → connectivity_plus listener: on reconnect → sync_service uploads
```

#### 6.4 — Results Entry
```dart
// Step 1: Select exam (list of exams teacher can enter marks for)
// Step 2: Select subject (teacher's subjects only)
// Step 3: Select class + section
// Step 4: Marks entry screen:
//   - Student list with name + roll no
//   - TextFormField per student for marks
//   - Validate: marks ≤ totalMarks
//   - "Absent" toggle
//   - Auto-calculate percentage preview
//   - Submit → POST /api/exams/:id/results
```

#### 6.5 — Assignments
```dart
// List: created by this teacher
// Create Assignment:
//   - Title, Description, Class, Section, Subject, Due Date
//   - Optional file attachment (image_picker → upload to S3 → get URL)
//   - POST /api/assignments
// Submissions:
//   - See which students submitted
//   - View submission, enter marks + feedback
```

**Deliverable:** Full teacher portal. Offline attendance with auto-sync.

---

### PHASE 7 — Other Role Portals (Week 8-9)
**Goal:** Principal, Coordinator, Accountant, Group Admin, Super Admin home screens

Each role gets:
- Role-appropriate dashboard with stats
- Access to relevant feature sections
- Same shared components (notifications, timetable, etc.)

#### Principal Dashboard
- Total students, today's attendance rate, fee collection this month, staff count
- Quick access: Mark staff attendance, View fee reports, Notifications

#### Coordinator Dashboard
- Class-wise attendance summary
- Upcoming exams, assignment submission rates

#### Accountant Dashboard
- Fee collected this month, pending challans count, overdue count
- Quick: Record payment, Generate challan

#### Group Admin Dashboard
- Multi-branch overview: students per branch, fee summary
- Generate org QR code (mobile onboarding QR)

#### Super Admin Dashboard
- All orgs list, mobile config management
- Toggle mobile access per org
- View device connection logs

---

### PHASE 8 — Push Notifications / FCM (Week 9-10)
**Goal:** App receives push notifications when app is closed

#### 8.1 — Firebase Project Setup
- Create Firebase project → add Android app (`com.wolfstack.edustack`)
- Download `google-services.json` → place in `mobile/android/app/`
- Enable Cloud Messaging in Firebase Console

#### 8.2 — Flutter FCM Integration
```dart
// main.dart: Firebase.initializeApp()
// Request notification permission (Android 13+ requires explicit permission)
// Get FCM token → PUT /api/users/fcm-token
// Handle foreground messages: show in-app banner
// Handle background/terminated: system notification → tap → deep link
```

#### 8.3 — Backend FCM Sender
```typescript
// backend/src/services/fcmService.ts
// import * as admin from 'firebase-admin'
// sendToUser(userId, title, body, data):
//   fetch user.fcmTokens → admin.messaging().sendEachForMulticast()
// Called from: notificationController when creating a notification
```

**Deliverable:** Push notifications work. App receives alerts even when closed.

---

### PHASE 9 — Theming, Urdu, Dark Mode (Week 10)
**Goal:** App feels polished, supports Urdu RTL, dark mode, per-school colors

#### 9.1 — Dynamic Color Theming
```dart
// On org load: fetch primaryColor from org config
// ColorScheme.fromSeed(seedColor: Color(int.parse(primaryColor)))
// Store in OrgProvider → ThemeData rebuilt on change
// Navy Blue default: #1e3a5f
```

#### 9.2 — Dark Mode
```dart
// ThemeMode in Riverpod provider
// System default → user can override in Settings
// ThemeData.light() + ThemeData.dark() both built from org color
```

#### 9.3 — Urdu / RTL
```dart
// flutter_localizations: add Urdu locale
// assets/translations/ur.json: Urdu strings for all UI text
// Directionality: TextDirection.rtl when Urdu selected
// Urdu font: NotoNastaliqUrdu for beautiful Urdu rendering
// Language selector in Settings screen
// Stored in SharedPreferences: 'locale' → 'en' or 'ur'
```

**Deliverable:** Full Urdu RTL mode. Dark mode. Per-school color branding.

---

### PHASE 10 — Result PDF Export (Week 10-11)
**Goal:** Students download their result card as PDF

```dart
// lib/screens/student/results/result_pdf_view.dart
// Uses: pdf package to generate in-memory PDF
// PDF layout:
//   - School header: logo + name + branch
//   - Student info: name, roll no, class, section
//   - Exam name + date range
//   - Subject marks table: Subject | Marks | Total | %
//   - Total: overall marks, percentage, grade, position
//   - Pass/Fail stamp
// printing.layoutPdf() → save to Downloads
// open_filex.open() → native PDF viewer
// Share button → system share sheet → WhatsApp, email, etc.
```

---

### PHASE 11 — Testing & Polish (Week 11-12)
**Goal:** Stable, crash-free app ready for Play Store

- [ ] Test on real Android device (not just emulator)
- [ ] Test all 8 role flows
- [ ] Test offline attendance → sync
- [ ] Test QR scan flow (print a QR, scan it)
- [ ] Test Urdu RTL layout (no text overflow, no clipping)
- [ ] Test dark mode (all screens)
- [ ] Test push notifications (foreground + background + terminated)
- [ ] Test 10-day auto-logout
- [ ] Test token refresh (wait 15min → app auto-refreshes)
- [ ] Performance: no jank on attendance list (100 students)
- [ ] Error states: no internet, server error, empty data

---

### PHASE 12 — Play Store Submission (Week 12-14)
**Goal:** App live on Google Play

#### App Signing
```powershell
# Generate release keystore
keytool -genkey -v -keystore edustack-release.jks -keyAlias edustack -keyalg RSA -keysize 2048 -validity 10000
```

#### Release Build
```powershell
cd mobile
flutter build appbundle --release
# Outputs: build/app/outputs/bundle/release/app-release.aab
```

#### Play Store Console
1. Create app listing: "EduStack PK" (or final name)
2. Short description (80 chars): "School management app for students & teachers"
3. Full description
4. Screenshots (min 2 per form factor)
5. App icon (512x512 PNG)
6. Privacy policy URL (required)
7. Target age group: 13+
8. Submit for review (typically 1-3 days)

---

## BACKEND CHANGES SUMMARY

All changes are **additive only** — zero impact on existing web functionality.

| Change | File | Breaking? |
|---|---|---|
| Bearer token in authenticate middleware | `middleware/auth/authenticate.ts` | No |
| X-Org-Slug header in extractTenant | `middleware/tenant/extractTenant.ts` | No |
| POST /api/auth/mobile/refresh (body-based) | `routes/auth.ts` + `controllers/authController.ts` | No |
| X-Client-Type → 30d refresh token | `controllers/authController.ts` | No |
| fcmTokens field on User model | `models/User.ts` | No |
| PUT /api/users/fcm-token endpoint | `routes/users.ts` + `controllers/userController.ts` | No |
| primaryColor in Organization.settings | `models/Organization.ts` | No |
| POST /api/organizations/:id/generate-qr | `routes/organizations.ts` + controller | No |
| GET /api/organizations/mobile-config | `routes/organizations.ts` + controller | No |
| firebase-admin integration | `services/fcmService.ts` (new) | No |

---

## TIMELINE SUMMARY

| Phase | Description | Weeks |
|---|---|---|
| 0 | Environment setup | 1 |
| 1 | Backend adaptations | 1-2 |
| 2 | Core Flutter infra (Dio, auth, router) | 2-3 |
| 3 | QR onboarding flow | 3 |
| 4 | Login + session management | 3-4 |
| 5 | Student portal (9 screens) | 4-6 |
| 6 | Teacher portal (offline attendance) | 6-8 |
| 7 | Other role portals | 8-9 |
| 8 | Push notifications (FCM) | 9-10 |
| 9 | Theming + Urdu RTL + Dark mode | 10 |
| 10 | Result PDF export | 10-11 |
| 11 | Testing + polish | 11-12 |
| 12 | Play Store submission | 12-14 |

**Total: ~14 weeks (solo dev, part-time)**

---

## OPEN DECISIONS (Must Resolve Before Starting)

1. **App name** — needed for Play Store + Flutter project creation (`flutter create`)
2. **App icon / logo** — needed before Phase 12 (can use placeholder until then)
3. **Firebase free tier confirmed?** — FCM is 100% free. Confirm to enable Phase 8.
4. **QR Flow A (App generates QR, admin scans from web)** — include in v1 or defer to v2?
   - Recommendation: **defer to v2**. Flow B alone (admin generates printable QR, user scans) solves the problem simply.
5. **Backend changes approval** — confirm to start Phase 1 immediately.

---

## FIRST ACTION (When Ready to Start)

```
Step 1: Answer the 5 open decisions above
Step 2: Say "start Phase 0" → I install Flutter, create project, boot on emulator
Step 3: Say "start Phase 1" → I make all backend changes (no web breakage)
Step 4: Flutter build begins
```
