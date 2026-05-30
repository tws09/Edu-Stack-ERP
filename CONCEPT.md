# EduStack PK — Project Concept & SOP Document
> WolfStack · Multi-Tenant SaaS ERP for Pakistani Private Schools
> Last Updated: 2026-05-25

---

## 1. PRODUCT VISION

EduStack PK is a cloud-based School ERP SaaS built for Pakistani private schools (grades 6–12 and Intermediate/F.Sc). It replaces paper-based administration with a unified digital platform covering academics, fees, attendance, staff, and communication.

**Brand:** WolfStack (developer) → EduStack PK (product)
**Market:** Private schools & colleges in Pakistan
**Model:** Multi-tenant SaaS — one platform, one database, multiple schools isolated by orgId
**Deployment:** Web (primary) + Mobile (React Native, planned)
**Revenue:** Per-student monthly billing (usage-based SaaS)

---

## 2. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTS                               │
│  Web (React + Vite)    Mobile (React Native — planned)   │
└────────────────┬────────────────────────────────────────┘
                 │ HTTPS / WSS
┌────────────────▼────────────────────────────────────────┐
│              BACKEND (Node.js + Express + TS)            │
│  Railway (production) · Port 5000                        │
│                                                          │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │  REST API    │  │  Socket.IO  │  │  Background    │  │
│  │  20+ routes  │  │  Real-time  │  │  Jobs (Cron)   │  │
│  └──────────────┘  └─────────────┘  └────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                   DATA LAYER                             │
│  MongoDB Atlas (shared multi-tenant DB)                  │
│  Upstash Redis (token blacklist)                         │
│  AWS S3 (file uploads — photos, docs, resources)         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. MULTI-TENANCY MODEL

- **Strategy:** Shared database, shared collections, tenant isolation via `orgId` field
- **Tenant resolution (web):** Subdomain → `beaconhouse.edustack.pk` → slug `beaconhouse` → lookup `Organization` → attach `req.orgId`
- **Tenant resolution (mobile, planned):** `X-Org-Slug` header → same lookup logic
- **Fallback:** If hostname doesn't match base domain (Railway direct URL) → skip extraction, use `orgId` from JWT token
- **tenantPlugin:** Mongoose plugin applied to all models — auto-scopes all queries by `orgId` so data never leaks between schools

---

## 4. AUTHENTICATION & AUTHORIZATION

### Auth Flow
```
POST /api/auth/login
  body: { email, password, slug, loginAs: 'admin'|'teacher'|'student' }
  → validates credentials
  → checks ROLE_GROUPS (loginAs must match user's actual role)
  → issues Access Token (JWT, 15min, httpOnly cookie)
  → issues Refresh Token (JWT, 7d, httpOnly cookie, path: /api/auth/refresh)
  → returns user object

POST /api/auth/refresh
  → reads refresh cookie
  → rotates both tokens (new access + new refresh)

POST /api/auth/logout
  → blacklists access token in Redis
  → clears cookies
```

### Role System (8 roles)
| Role | Access Level | Portal |
|---|---|---|
| `super_admin` | Full platform admin | `/admin` |
| `group_admin` | Multi-branch school group | `/:slug/group` |
| `branch_principal` | Single branch full access | `/:slug/dashboard` |
| `coordinator` | Academic coordination | `/:slug/coordinator` |
| `teacher` | Class teaching + grading | `/:slug/teacher` |
| `accountant` | Fee management only | `/:slug/dashboard` |
| `it_admin` | System settings | `/:slug/dashboard` |
| `student` | Own data only | `/:slug/student` |

### RBAC
- `authenticate` middleware: verifies JWT from cookie, attaches `req.user`
- `authorize(...roles)` middleware: checks `req.user.role` against allowed roles
- Route-level permission checks throughout all controllers

---

## 5. COMPLETE API SURFACE

### Auth Routes — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/login` | Unified login (all roles) |
| POST | `/register` | New organization registration |
| POST | `/refresh` | Rotate access + refresh tokens |
| POST | `/logout` | Blacklist token + clear cookies |
| GET | `/me` | Get current user profile |
| PUT | `/change-password` | Change own password |

### Public Routes — `/api/public`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/orgs/:slug` | Get org branding (no auth) — logo, name, welcome message |

### Organization Routes — `/api/organizations`
Super admin only — CRUD for all schools

### Branch Routes — `/api/branches`
Manage branches within an organization

### User Routes — `/api/users`
Staff management — create/list/update/deactivate users

### Academic Routes — `/api/academic`
Classes, sections, subjects, academic years setup

### Student Routes — `/api/students`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List students (filtered by class/section/status) |
| POST | `/` | Admit new student |
| GET | `/:id` | Get student detail |
| PUT | `/:id` | Update student |
| GET | `/me` | Student's own profile |
| POST | `/:id/documents` | Upload document |

### Attendance Routes — `/api/attendance`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List attendance records |
| POST | `/` | Mark class attendance |
| GET | `/my-records` | Student's own monthly attendance |
| GET | `/staff` | Staff attendance |
| POST | `/staff` | Mark staff attendance |

### Timetable Routes — `/api/timetable`
GET/POST/PUT — class timetables with period timings

### Exam Routes — `/api/exams`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List exams |
| POST | `/` | Create exam |
| GET | `/:id/results` | Get results for exam |
| POST | `/:id/results` | Enter/update marks |
| GET | `/:id/results/my` | Student's own result |

### Assignment Routes — `/api/assignments`
Create, list, submit assignments + grade submissions

### Fee Routes — `/api/fees`
Fee structures, challan generation, payment recording

### Payroll Routes — `/api/payroll`
Staff payroll — draft, approve, mark paid

### Notification Routes — `/api/notifications`
Create, list, mark-read notifications + unread count

### SOP Routes — `/api/sops`
Standard operating procedures / guides

### Resource Routes — `/api/resources`
Learning resources (PDFs, videos, links)

### Topic Routes — `/api/topics`
Subject topics/syllabus tracking

### Paper Routes — `/api/papers`
Exam paper builder

### Clearance Routes — `/api/clearances`
Student clearance exams

### Exam Type Routes — `/api/exam-types`
Custom exam type configuration

### Question Bank Routes — `/api/question-bank`
Question repository for paper generation

### Exam Paper Drafts — `/api/exam-paper-drafts`
Draft exam papers

### Branch Header — `/api/branch-header`
Customizable branch header for printouts

### Exam Schedules — `/api/exam-schedules`
Per-subject exam date scheduling

### Settings Routes — `/api/settings`
Platform and branch settings

---

## 6. DATA MODELS (MongoDB Schemas)

### Core Models
| Model | Key Fields | Purpose |
|---|---|---|
| `Organization` | name, slug, plan, status, logoUrl, settings | School/college tenant |
| `User` | orgId, branchId, role, email, passwordHash, active | All system users |
| `Branch` | orgId, name, address, contactPhone | Physical branches |
| `AcademicYear` | orgId, name, startDate, endDate, isCurrent | Academic session |
| `Class` | orgId, branchId, name, order | e.g. Class 9, Class 10 |
| `Section` | orgId, branchId, classId, name | e.g. Section A, B |
| `Subject` | orgId, branchId, classId, name, code | Teaching subjects |

### Academic Models
| Model | Key Fields | Purpose |
|---|---|---|
| `Student` | orgId, branchId, userId, classId, sectionId, rollNo, admissionNo, profile, guardianInfo | Student record |
| `Timetable` | orgId, classId, sectionId, slots[], periodTimings[] | Class schedule |
| `Exam` | orgId, name, targetClasses[], subjects[], gradingConfig[], startDate, endDate, isPublished | Exam definition |
| `Result` | orgId, examId, studentId, subjectMarks[], percentage, grade, classPosition | Student result |
| `Assignment` | orgId, classId, sectionId, subjectId, title, dueDate | Homework/assignment |
| `Submission` | orgId, assignmentId, studentId, fileUrl, marks, feedback | Student submission |
| `Attendance` | orgId, classId, sectionId, date, periodNo, records[] | Daily attendance |
| `StaffAttendance` | orgId, staffId, date, status | Staff attendance |
| `SubjectTopic` | orgId, subjectId, title, isCompleted | Syllabus tracking |

### Finance Models
| Model | Key Fields | Purpose |
|---|---|---|
| `FeeStructure` | orgId, classId, items[], totalAmount | Monthly fee template |
| `Challan` | orgId, studentId, month, items[], netAmount, paidAmount, status, payments[] | Fee invoice |
| `Payroll` | orgId, staffId, month, basicSalary, allowances[], deductions[], netPay, status | Staff salary |

### Communication Models
| Model | Key Fields | Purpose |
|---|---|---|
| `Notification` | orgId, recipientId, type, title, message, isRead | In-app notification |
| `Sop` | orgId, title, content, category | Guides/SOPs |
| `LearningResource` | orgId, title, type, url, classId | Educational resources |

### System Models
| Model | Key Fields | Purpose |
|---|---|---|
| `TokenBlacklist` | token, expiresAt | Logged-out token store |
| `RefreshToken` | userId, tokenHash, expiresAt | Refresh token store |
| `UsageMetric` | orgId, activeStudents, billedAt | Billing metric |
| `ExamType` | orgId, name | Custom exam categories |
| `QuestionBank` | orgId, subjectId, question, options[], answer | Question repository |
| `Paper` | orgId, examId, questions[] | Built exam paper |
| `PaperResult` | orgId, paperId, studentId, score | Paper scoring |
| `ClearanceExam` | orgId, studentId, status | Supplementary exam |
| `ExamSchedule` | orgId, examId, subjectId, date, venue | Per-subject schedule |
| `BranchHeader` | orgId, branchId, logoUrl, headerText | Printout header |
| `ExamPaperDraft` | orgId, title, sections[] | Draft paper builder |
| `Sequence` | orgId, key, value | Auto-increment counters |

---

## 7. FRONTEND PAGES & ROLE ACCESS

### Web App Pages (React + Vite)
| Page | Route | Roles |
|---|---|---|
| Login | `/:slug/login` | All |
| Student Dashboard | `/:slug/student` | student |
| Teacher Dashboard | `/:slug/teacher` | teacher |
| Branch Dashboard | `/:slug/dashboard` | principal, accountant, it_admin |
| Class Fellows | `/:slug/student/class-fellows` | student |
| Students | `*/students` | group_admin, principal, coordinator, teacher |
| Attendance | `*/attendance` | All staff + student (read) |
| Timetable | `*/timetable` | All |
| Exams & Results | `*/exams` | All |
| Assignments | `*/assignments` | All |
| Fees | `*/fees` | principal, accountant, student |
| Payroll | `*/payroll` | principal, accountant, teacher |
| Notifications | `*/notifications` | All |
| SOPs & Guides | `*/sops` | All |
| Learning Resources | `*/resources` | All |
| Exam Papers | `*/exam-paper` | principal, coordinator, teacher |
| Academic Setup | `*/academic` | principal, group_admin |
| Staff | `*/staff` | principal, group_admin |
| Branches | `*/branches` | group_admin |
| Settings | `*/settings` | principal, group_admin |
| Roles Hierarchy | `*/roles` | group_admin |
| Super Admin Dashboard | `/admin` | super_admin |
| Organizations | `/admin/organizations` | super_admin |
| Billing | `/admin/billing` | super_admin |

### Frontend Services (API call layer)
| Service | Calls |
|---|---|
| `authService` | login, logout, getMe, changePassword, getOrgBranding |
| `studentService` | list, getMe, create, update, uploadDocument |
| `attendanceService` | list, mark, getMyRecords, staffAttendance |
| `examService` | list, create, getResults, enterResults, getMyResult |
| `assignmentService` | list, create, submit, grade |
| `feeService` | listChallans, getStructures, recordPayment |
| `payrollService` | list, create, approve, markPaid |
| `notificationService` | list, getUnreadCount, markRead |
| `timetableService` | get, create, update |
| `academicService` | getClasses, getSections, getSubjects, getAcademicYears |
| `userService` | list, create, update, deactivate |
| `examTypeService` | list, create |
| `questionBankService` | list, create, import |
| `branchHeaderService` | get, update |
| `examScheduleService` | list, create |
| `examPaperDraftService` | list, create, update |

### Frontend State (Zustand)
| Store | State |
|---|---|
| `authStore` | user, isAuthenticated, orgSlug, activeBranch |
| `themeStore` | isDark |

---

## 8. REAL-TIME (Socket.IO)
- Users join two rooms on connect: `user:{userId}` (personal) + `branch:{orgId}:{branchId}` (broadcast)
- Auth: JWT passed via `socket.handshake.auth.token`
- Events used: notification delivery, real-time attendance updates
- Web client connects via `useSocket` hook in AppLayout

---

## 9. FILE STORAGE (AWS S3)
- Student photos → S3 → URL stored in `student.profile.photoUrl`
- Student documents → S3 → URLs in `student.documents[]`
- Assignment attachments → S3 → `assignment.attachmentUrl`
- Submission files → S3 → `submission.fileUrl`
- Learning resources → S3 → `resource.url`
- Organization logo → S3 → `organization.logoUrl`
- Payslips → S3 → `payroll.payslipUrl`

---

## 10. BACKGROUND JOBS (Cron)
| Job | Schedule | Purpose |
|---|---|---|
| `billingHandler` | Monthly | Count active students → update usageBilling |
| `challanHandler` | Monthly | Auto-generate fee challans for all active students |
| `payrollHandler` | Monthly | Draft payroll records |
| `weakReportHandler` | Weekly | Flag students with <75% attendance |

---

## 11. DEPLOYMENT
| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Static React build |
| Backend | Railway | Node.js server with Socket.IO |
| Database | MongoDB Atlas | Shared multi-tenant |
| Cache | Upstash Redis | Token blacklist |
| Storage | AWS S3 | Media and documents |

---

## 12. FLUTTER MOBILE APP PLAN (PLANNED)

### Why Flutter for EduStack PK
- Single Dart codebase → Android APK + iOS IPA
- Truly native compiled performance (no bridge overhead)
- Material 3 design system — familiar and modern for Pakistani users
- Built-in RTL support — critical for Urdu language
- Strong in Pakistan developer community
- Google backing — long-term stability guaranteed

### Architecture Decision: Zero Web Code Sharing
- Flutter uses Dart — completely separate from the TypeScript/React web codebase
- What IS shared: the entire Node.js backend REST API (100%)
- What is NOT shared: UI components, state management, routing, service layer
- Flutter codebase lives at `mobile/` inside the monorepo

### Recommended Flutter Stack (2025)
| Concern | Package | Reason |
|---|---|---|
| State management | Riverpod 2.x | Best for async data, testable, no boilerplate |
| Navigation | GoRouter | Declarative, deep link support, maintained by Flutter team |
| HTTP client | Dio | Interceptors for auth refresh, identical to Axios pattern from web |
| Secure token storage | flutter_secure_store | Encrypted keychain/keystore per platform |
| Local data cache | Hive or Isar | Fast NoSQL for offline timetable/results cache |
| Push notifications | firebase_messaging | FCM for Android + APNs bridge for iOS |
| File handling | open_filex + path_provider | Open PDFs, download resources |
| Camera/image | image_picker | Student profile photo, assignment photos |
| Biometric auth | local_auth | Fingerprint/Face ID after first login |
| Charts | fl_chart | Results trend, attendance bar charts |
| Localization | flutter_localizations + intl | English + Urdu RTL built-in |
| Connectivity | connectivity_plus | Detect offline state |

### Auth Adaptation Required
- Web uses httpOnly cookies — Flutter cannot use these
- Flutter: JWT Bearer tokens stored in `flutter_secure_storage` (AES-encrypted)
- Backend needs: `Authorization: Bearer <token>` header support alongside existing cookie auth
- Flutter token refresh: Dio interceptor catches 401 → calls `/auth/refresh` with stored refresh token → retries original request (mirrors the web axios interceptor pattern exactly)

### Multi-tenancy Adaptation Required
- Web uses subdomain routing (`beaconhouse.edustack.pk`) — Flutter has no subdomains
- Flutter: org picker screen → user types/selects school slug → persisted in SharedPreferences
- Backend needs: `X-Org-Slug: beaconhouse` header support in `extractTenant` middleware
- Already partially handled: non-subdomain hosts skip to JWT orgId from token

### Target Roles (Phase 1 — TBD)
- Student: dashboard, timetable, results, attendance, assignments, fees, class fellows, notifications
- Teacher: schedule, attendance marking, results entry, assignments, notifications
- Parent (optional): child's attendance, results, fee dues (requires new parent role in backend)

### Push Notifications Strategy
- Firebase Cloud Messaging (FCM) — free, works Android + iOS
- User model needs new field: `fcmTokens: string[]` (array, user may have multiple devices)
- Backend: firebase-admin sends push when `emitToUser()` is called
- Flutter: `firebase_messaging` package handles foreground + background + terminated state

### Build & Distribution
- Android: Android Studio + Gradle → APK/AAB for Google Play
- iOS: Xcode on Mac OR use Codemagic/GitHub Actions cloud build
- CI/CD: Codemagic (Flutter-specific, free tier available)

---

## 13. LOCALIZATION
- Languages: English (default) + Urdu (RTL)
- Library: i18next (web), i18next-react-native (mobile)
- Locale files: `en.json` + `ur.json`
- Urdu is RTL — layout must flip on language change

---

## 14. PAYMENT METHODS SUPPORTED
Fee payment tracking supports:
- Cash
- Bank Transfer
- JazzCash
- EasyPaisa
- Cheque

(Payments are recorded manually by accountant — no in-app payment gateway yet)

---

## 15. KEY BUSINESS RULES
1. Every student belongs to exactly one: org → branch → class → section → academic year
2. A challan is generated per student per month — unique constraint (orgId + studentId + month)
3. Exam results are per exam per student — unique (examId + studentId)
4. Attendance is per class per section per date per period — unique constraint
5. Roll numbers are unique within org + branch + class + section
6. Admission numbers are unique within org
7. Token refresh rotates both tokens (sliding session)
8. Suspended organizations cannot log in
9. `mustChangePassword` flag forces password change before any action
10. Active students count drives monthly billing

---

## 16. OPEN ITEMS / FUTURE ROADMAP
- [ ] React Native mobile app (Student + Teacher portals)
- [ ] Parent accounts (linked to student guardianInfo)
- [ ] In-app fee payment (JazzCash/EasyPaisa gateway integration)
- [ ] SMS notifications (Twilio / local SMS gateway)
- [ ] Biometric attendance (fingerprint scanner integration)
- [ ] AI-powered weak student alerts
- [ ] WhatsApp notification integration
- [ ] Offline-first mobile with sync
- [ ] Multi-language report cards (English + Urdu PDF)
- [ ] Google Play Store + App Store listing
