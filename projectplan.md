EduStack PK
School & College ERP — SaaS Platform

Document Type
Project Development Plan	Status
v1.0 — Approved for Build
Target Market
Pakistan — Private Schools & Colleges	Timeline
3-Month MVP (Solo Dev)

Prepared by: WolfStack  |  Stack: MERN  |  Version: 1.0


1. Project Overview
EduStack PK is a multi-tenant SaaS ERP platform for private schools and colleges in Pakistan, targeting grades 9 through 12 and Intermediate (Part I & II). Built on the MERN stack by a solo developer with a 3-month target for MVP delivery.

7
Roles	8
Modules	3 Mo
Timeline	<500
Students/Branch

1.1 Requirements Summary
Parameter	Decision
Target Institutions	Private schools (9th–12th) + Colleges (Intermediate) + Combined
Tenant Model	School group/chain = 1 tenant, with multiple branches per tenant
Monetization	Usage-based SaaS — charged per active student per branch per month
Exam System	Custom internal grading (configurable per school, not BISE/Cambridge)
Fee Payments	Bank challan PDF (HBL/UBL) + JazzCash + EasyPaisa + Manual cash entry
Notifications	In-app only for v1. SMS/WhatsApp deferred to v2.
Language	Urdu + English bilingual UI with RTL support for Urdu
Scale Target	< 500 students per branch at launch

1.2 User Roles
Role	Responsibility	Layer
Super Admin	SaaS owner (you). Full platform access — manage all tenants, billing, usage.	Platform
Group Admin	School chain owner. Sees all branches, runs group-level reports.	Tenant
Branch Principal	Branch-level management — staff, students, academic oversight.	Branch
Teacher	Marks attendance, enters exam marks, creates assignments.	Branch
Student	Views own attendance, results, assignments, and notifications.	Branch
Accountant / Fee Manager	Manages fee structures, challans, payments, and payroll.	Branch
IT Admin (per branch)	Configures branch settings, manages user accounts.	Branch


2. Technology Stack
Full MERN stack chosen for solo developer velocity, Pakistani ecosystem compatibility, and your existing familiarity. Every choice prioritizes shipping over architectural elegance at this stage.

2.1 Frontend
Technology	Purpose & Rationale
React 18 + Vite + TypeScript	Core UI framework. Vite for fast HMR. TypeScript for type safety across the codebase.
Tailwind CSS + shadcn/ui	Rapid UI development. shadcn/ui provides accessible components out of the box — don't build from scratch.
react-i18next	Urdu + English bilingual support. Handles RTL direction switching for Urdu automatically.
Recharts	Dashboard charts — attendance trends, fee collection summaries, result distributions.
jsPDF + html2canvas	Client-side PDF generation for result cards, bank challans, and payslips.
Socket.IO Client	Real-time in-app notifications.
React Query (TanStack)	API state management — smart caching, background refetch, loading/error states.

2.2 Backend
Technology	Purpose & Rationale
Node.js + Express.js	REST API server. Familiar stack, fast to ship solo.
MongoDB Atlas + Mongoose	Shared database with tenantId scoping on all collections. Flexible schema suits education data well.
JWT + Redis (Upstash)	Auth tokens + session blacklisting on logout. Upstash provides serverless Redis with a free tier.
Socket.IO	Real-time bidirectional communication for notifications and live dashboard updates.
BullMQ	Background job queue for monthly challan generation, payroll processing, and PDF batch exports.
AWS S3 / Cloudinary	File storage for student documents, assignment uploads, and profile photos.
JazzCash + EasyPaisa APIs	Pakistani mobile wallet payment collection for school fees.

2.3 Infrastructure & Deployment
Technology	Purpose & Rationale
Railway	Backend hosting — Node.js + Redis + BullMQ on one platform. Simple and cost-effective for early stage.
Vercel	Frontend deployment — React app with edge CDN and instant deploys on push.
MongoDB Atlas	Managed cloud database. Free M0 cluster for dev, M10 for production.
Docker	Local development environment parity. Keeps backend + Redis consistent across machines.
GitHub Actions	Basic CI — lint, test, deploy on push to main.


3. Multi-Tenancy Architecture
EduStack PK uses a shared database with tenant-scoped collections. Every MongoDB document carries orgId and branchId fields. A school group (chain) is one tenant with multiple branches.

3.1 Approach Comparison
Approach	Pros	Cons	Decision
Isolated DB per tenant	Maximum data isolation	Operational nightmare solo	✗ Rejected
Shared DB + tenantId scoping	Simple ops, fast to ship	Must enforce on every query	✓ Chosen
Schema per tenant	Mid-level isolation	Not needed with MongoDB	✗ Rejected

3.2 Request Flow
Every API request is processed through the following middleware chain:

1. Browser sends request to [slug].edustack.pk
2. Express middleware extracts orgId from the subdomain
3. JWT is verified → userId, role, branchId attached to req object
4. RBAC middleware checks the user's role against required permission
5. Controller queries MongoDB with { orgId, branchId, ...filters }
6. Response is returned to the client

3.3 Subdomain Strategy
Subdomain	Purpose
app.edustack.pk	Super Admin dashboard only — platform-wide management
[slug].edustack.pk	Each tenant (school group) gets their own subdomain
Branch selection	Inside the app after login — users pick their branch from a dropdown

3.4 Critical Isolation Rule
⚠ CRITICAL — Every database query MUST include orgId in the filter. Build a Mongoose plugin that auto-injects orgId from the request context into all find/update/delete operations. A missing orgId means data from one school becomes visible to another — this is a production-breaking bug. Write integration tests specifically to assert cross-tenant isolation on every module.


4. Data Model
4.1 Entity Hierarchy
Organization (School Group / Chain — 1 tenant)
  └── Branch (Individual campus or school)
       ├── AcademicYear (e.g. 2024–25)
       │    └── Class (Grade 9, 10, 11, 12, Inter-I, Inter-II)
       │         └── Section (A, B, Science, Arts, Commerce)
       │              └── Student (enrolled in this section)
       ├── Staff (Teachers, Accountant, IT Admin, Principal)
       ├── Timetable (per Section)
       ├── FeeStructure (per Class)
       └── Exams (per AcademicYear)

4.2 MongoDB Collections by Domain
Domain	Collections
Identity & Auth	organizations, branches, users, sessions (Redis)
Academic	academicYears, classes, sections, students, subjects, timetables
Assessment	exams, results, assignments, submissions
Finance	feeStructures, challans, payments, payroll
Attendance	attendance (student), staffAttendance
System	notifications, auditLogs, usageMetrics

4.3 Key Collection Fields
Collection	Key Fields
organizations	name, slug, plan, status, usageBilling
branches	orgId, name, address, code, settings
users	orgId, branchId, role, name, email, passwordHash, active
students	orgId, branchId, classId, sectionId, rollNo, profile, guardianInfo, status
attendance	orgId, branchId, classId, date, records[{studentId, status}]
exams	orgId, branchId, name, academicYearId, subjects[], gradingConfig
results	examId, studentId, orgId, subjectMarks[], total, percentage, grade, position
challans	orgId, branchId, studentId, month, feeItems[], total, dueDate, paidAt, method
payroll	orgId, branchId, staffId, month, basicSalary, allowances, deductions, netPay, status
usageMetrics	orgId, branchId, month, activeStudents, generatedAt

4.4 Indexing Strategy
Create compound indexes on all high-frequency query patterns from day one. Do not add these retroactively in production.
•{ orgId: 1, branchId: 1 } — on every collection
•{ orgId: 1, branchId: 1, date: -1 } — on attendance
•{ orgId: 1, branchId: 1, studentId: 1, month: 1 } — on challans
•{ orgId: 1, branchId: 1, classId: 1, sectionId: 1 } — on students
•{ orgId: 1, month: 1 } — on usageMetrics


5. Core Modules (v1)
All eight modules are targeted for v1 delivery. If timeline pressure hits, Modules 5.6 and 5.7 (Fee Management and Payroll) are the safest to push to v1.1 without blocking the first pilot deployment.

5.1 Student Admissions   [Month 1]
•Student registration with full profile: name, CNIC/B-Form, date of birth, photo
•Guardian / parent information (name, CNIC, contact, relation)
•Class and section assignment (Grade 9–12, Intermediate Part I & II)
•Document upload support — previous result card, B-Form, character certificate (AWS S3)
•Auto-generated roll number per section per academic year
•Admission status workflow: Applied → Enrolled → Active → Graduated / Transferred
•Transfer Certificate (TC) generation as PDF

5.2 Attendance Management   [Month 2]
•Period-wise or daily attendance marking by class teacher
•Bulk-mark flow: mark all present first, then mark individual absents
•Staff attendance marked by Principal or IT Admin
•Monthly attendance summary per student with percentage calculation
•Shortage alert flag when student falls below configurable threshold (default 75%)
•Attendance register export as PDF and CSV
•Date-range attendance reports per class or per student

5.3 Timetable & Scheduling   [Month 2]
•Branch-level configuration: number of periods, period duration, break timings, working days
•Teacher-subject-period assignment per section
•Real-time conflict detection: prevents double-booking a teacher in two classes
•View modes: per class, per teacher, and master timetable for the full branch
•Substitute teacher assignment for absent staff
•Printable timetable export

5.4 Exam & Result Management   [Month 2]
•Exam creation: name, subjects included, max marks per subject, exam date, target classes
•Custom grading configuration per school (e.g. A+/A/B/C, or numeric percentage thresholds)
•Subject-wise marks entry by subject teacher
•Auto-calculation: total marks, percentage, grade, class position/ranking
•Pass/fail threshold configurable per exam
•Result card generation as PDF on school letterhead
•Result history per student across all exams

5.5 Assignments & Homework   [Month 2]
•Teacher creates assignment: title, description, subject, class, due date, optional file attachment
•Student submission: text response and/or file upload (PDF, image, docx) to S3
•Teacher grading with marks and written feedback
•Overdue detection and pending assignment tracking
•Assignment list views: per class (teacher) and per student (student portal)

5.6 Fee Management   [Month 3]
•Fee structure setup per class: tuition fee, lab fee, library fee, exam fee, etc.
•Monthly challan auto-generation for all active students via BullMQ background job
•Printable bank challan PDF in HBL / UBL format (jsPDF)
•JazzCash and EasyPaisa online payment API integration
•Manual cash collection entry by accountant with receipt generation
•Arrears tracking, partial payment support, discount and waiver management
•Monthly fee collection report with paid / unpaid breakdown

5.7 Payroll Management   [Month 3]
•Staff salary structure: basic salary, allowances (house rent, transport, medical), deductions
•Monthly payroll processing by accountant with one-click approval
•Attendance-linked auto-deduction calculation for absent days
•Payslip generation as PDF per staff member
•Payroll history with filterable records and bulk export

5.8 In-App Notifications   [Month 3]
•Real-time notification bell via Socket.IO — updates without page reload
•System-triggered notifications: fee due reminder, exam result published, assignment graded
•Manual broadcast: Principal sends message to all staff or all students in a branch
•Notification centre with read / unread state management
•Per-role notification routing — students only receive student-relevant alerts



6. Role & Permission Matrix
Permissions are enforced at the API level via middleware — not just in the UI. Each route declares the required role and action. A central permissions config object defines access rules.

Module	Super Admin	Group Admin	Principal	Teacher	Student	Accountant	IT Admin
Tenant / Org Mgmt	CRUD	Read	—	—	—	—	—
Branch Management	CRUD	CRUD	Read	—	—	—	Configure
User Management	CRUD	CRUD	CRUD	—	—	—	CRUD
Student Admissions	Read	Read	CRUD	Read	Own only	—	—
Attendance	—	Read	Read	Mark	Own only	—	—
Timetable	—	Read	CRUD	Read	Read	—	—
Exams & Results	—	Read	CRUD	Mark	Own only	—	—
Assignments	—	—	Read	CRUD	Submit	—	—
Fee Management	Read	Read	Read	—	Own only	CRUD	—
Payroll	—	Read	Read	Own only	—	CRUD	—
Notifications	Send	Send	Send	Send	Receive	—	—
Reports & Analytics	All	All	Branch	Class	Own only	Finance	—
System Settings	CRUD	CRUD	Branch	—	—	—	CRUD

6.1 Implementation
Build a PermissionMiddleware on Express that reads the user's role from req.user and checks it against a central PERMISSIONS config. Every protected route declares { module: 'attendance', action: 'mark' }. The frontend conditionally renders UI elements based on the role in the decoded JWT — never trust the frontend alone.


7. 3-Month Sprint Plan
Solo developer. Realistic scope. Ship something real at the end of every month. The hardest constraint is not the code — it is discipline against scope creep.

Phase 1 — Foundation & Core Infrastructure  Month 1 (Weeks 1–4)
Week 1	Project Skeleton & DevOps
•React + Vite + TypeScript + Tailwind CSS setup
•Node.js + Express + MongoDB Atlas connection
•JWT authentication flow with Upstash Redis session
•Multi-tenant middleware: extract orgId from subdomain
•Railway + Vercel CI/CD pipeline from Day 1 — deploy early, deploy often
•Docker local dev environment setup

Week 2	RBAC + Super Admin Dashboard
•7-role permission system (central config + middleware)
•Super Admin dashboard: tenant management, usage metrics, billing overview
•Tenant onboarding and creation flow
•Bilingual i18n setup: react-i18next with Urdu RTL support

Week 3	Group Admin + Branch Setup
•Group Admin dashboard — multi-branch overview
•Branch CRUD (create, edit, activate/deactivate)
•IT Admin user management within a branch
•Academic year configuration
•Class, section, and subject master data management

Week 4	Student Admissions Module
•Student registration form with full profile fields
•Guardian information capture
•Document upload to AWS S3
•Roll number auto-generation per section
•Enrollment status workflow
•Principal dashboard shell with placeholder sections


Phase 2 — Core Academic Modules  Month 2 (Weeks 5–8)
Week 5	Attendance Module
•Student daily / period-wise attendance marking UI for teachers
•Bulk-mark workflow (present all → mark absents individually)
•Staff attendance tracked by Principal or IT Admin
•Monthly summary per student with shortage flag logic
•Attendance register PDF and CSV export

Week 6	Timetable & Scheduling
•Period configuration per branch (periods, breaks, duration, days)
•Teacher-subject-period assignment per section
•Conflict detection engine for teacher double-booking
•Class view, teacher view, and master timetable views
•Substitute teacher assignment workflow

Week 7	Exam & Result Management
•Exam creation with subject list, max marks, and grading config
•Subject-wise marks entry by teacher
•Total, percentage, grade, and position auto-calculation
•Pass/fail threshold configuration per exam
•Result card PDF generation on school letterhead

Week 8	Assignments & Homework
•Teacher assignment creation with file attachment support
•Student submission portal: text + file upload to S3
•Teacher grading with marks and written feedback
•Overdue detection and pending submission tracking
•Assignment dashboards per class (teacher) and per student


Phase 3 — Finance, Notifications & Launch  Month 3 (Weeks 9–12)
Week 9	Fee Management Module
•Fee structure configuration per class
•BullMQ job: monthly auto-generation of challans for all active students
•Printable bank challan PDF (HBL / UBL format via jsPDF)
•JazzCash and EasyPaisa payment API integration
•Manual cash entry by accountant with receipt
•Arrears, partial payment, and fee waiver management

Week 10	Payroll Module
•Staff salary structure: basic, allowances, deductions
•Monthly payroll processing with one-click approval
•Attendance-linked automatic deduction calculation
•Payslip PDF generation per staff
•Payroll history with filterable records

Week 11	Notifications + Dashboards + Reports
•Socket.IO real-time notification bell for all roles
•System event triggers: fee due, result published, assignment graded
•Principal broadcast: message to all staff or all students
•Per-role dashboard analytics with Recharts visualisations
•Export functions across modules (PDF / CSV)

Week 12	QA, Security Audit & Pilot Launch
•End-to-end testing across all 7 roles and 8 modules
•Security audit: tenantId isolation check on every API endpoint
•Performance testing at 500 students per branch
•First pilot school onboarding and training
•Buffer week for bugs found during pilot



8. Usage-Based Billing Model
Schools pay per active student per branch per month. This model is predictable for schools, aligns revenue with the platform's actual usage, and scales naturally as WolfStack grows.

8.1 Pricing Tiers
Starter	Growth	Scale
Rs 50 / student / month
1 – 150 students per branch	Rs 40 / student / month
151 – 350 students per branch	Rs 30 / student / month
351 – 500 students per branch

Example: A school group with 3 branches, each with 300 students, would pay Rs 40 × 300 × 3 = Rs 36,000 per month.

8.2 Active Student Definition
Parameter	Definition
Active student	Status = active AND present in at least 1 attendance record that month
Counted on	1st of each month (monthly snapshot via BullMQ job)
Stored in	usageMetrics collection: orgId, branchId, month, activeStudents
Invoiced via	Manual invoice in v1. Stripe or local gateway integration planned for v2.

8.3 v1 Billing Flow
BullMQ job runs on 1st of every month
→ Counts activeStudents per branch per organization
→ Writes snapshot to usageMetrics collection
→ Super Admin reviews usage dashboard
→ Invoice generated manually and sent to Group Admin via email
→ Payment collected via bank transfer

Automated invoicing via Stripe or a local PK payment gateway is planned for v2.


9. Risks & Mitigations
These risks are not hypothetical — they will happen. Planning for them now is the difference between a controlled incident and a failed project.

Risk	Severity	Mitigation
Tenant data leak — missing orgId in query	Critical	Build Mongoose plugin auto-injecting orgId from request context. Write dedicated integration tests asserting cross-tenant isolation on every module before going live.
3-month timeline too short for 8 modules solo	High	Deliver Phase 1 + Phase 2 (6 modules) as the hard MVP. Fee Management and Payroll (Phase 3) can slip to v1.1 without blocking the first pilot school deployment.
JazzCash / EasyPaisa API integration complexity	Medium	Start integration in Week 9. Always maintain manual cash-only mode as a working fallback. Never block a launch waiting for a payment gateway.
Urdu RTL UI is harder than expected	Medium	Integrate react-i18next and set dir='rtl' on the HTML element from Week 2. Do not bolt it on at the end — retrofitting RTL into a finished UI is painful.
PDF generation quality for result cards and challans	Medium	Schools have strong opinions about document formatting. Collect sample challans and result cards from a target school in Week 1. Build templates to those exact specs.
Scope creep from first pilot school	Medium	Lock requirements contractually before build begins. Any additions outside the agreed scope are either paid customisation or queued for v2.
Load shedding — schools expect offline mode	Low	Out of scope for v1. Communicate this explicitly during onboarding. The practical workaround is 4G mobile data for attendance and mark entry.
MongoDB performance degradation at scale	Low	At < 500 students per branch, MongoDB performance is a non-issue. Establish compound indexes on orgId + branchId + key fields from Day 1 and revisit if scale grows.

9.1 Non-Negotiable First Steps
Do these before writing a single line of application code:
•Secure one pilot school and get a real principal involved by Week 1 — build with feedback, not in isolation
•Collect sample fee challans and result card formats from the target school in Week 1
•Design MongoDB compound indexes before creating collections — painful to retrofit in production
•Build the tenantId middleware in Week 1 — everything after depends on it being bulletproof
•Set up Railway + Vercel CI/CD pipeline from Day 1 — deploy to production early and often
•Define the custom grading config schema before starting the Exam module in Week 7