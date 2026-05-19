/**
 * Demo school seed — creates a complete working school with all roles, students, and sample data.
 * Run: npx ts-node --transpile-only scripts/seedSchool.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGODB_URI!;
if (!MONGO_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

// ── helpers ──────────────────────────────────────────────────────────────────

function oid() { return new mongoose.Types.ObjectId(); }
async function hash(pw: string) { return bcrypt.hash(pw, 10); }

const now = new Date();
const yearStr = String(now.getFullYear()).slice(2);

// ── school config ────────────────────────────────────────────────────────────

const ORG_NAME  = 'Beacon House Model School';
const ORG_SLUG  = 'beaconhouse';
const BRANCH_NAME = 'Main Campus – Lahore';

const CREDENTIALS = {
  group_admin:       { email: 'owner@beaconhouse.pk',     password: 'Admin@1234' },
  branch_principal:  { email: 'principal@beaconhouse.pk', password: 'Admin@1234' },
  teacher1:          { email: 'teacher1@beaconhouse.pk',  password: 'Admin@1234' },
  teacher2:          { email: 'teacher2@beaconhouse.pk',  password: 'Admin@1234' },
  accountant:        { email: 'accounts@beaconhouse.pk',  password: 'Admin@1234' },
  it_admin:          { email: 'it@beaconhouse.pk',        password: 'Admin@1234' },
  student1:          { email: 'ali.khan@beaconhouse.pk',  password: 'Ali@2009' },
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db!;
  console.log('Connected to MongoDB\n');

  // ── wipe existing demo data (idempotent) ────────────────────────────────────
  const orgs = db.collection('organizations');
  const existing = await orgs.findOne({ slug: ORG_SLUG });
  if (existing) {
    const orgId = existing._id;
    await Promise.all([
      db.collection('branches').deleteMany({ orgId }),
      db.collection('users').deleteMany({ orgId }),
      db.collection('academicyears').deleteMany({ orgId }),
      db.collection('classes').deleteMany({ orgId }),
      db.collection('sections').deleteMany({ orgId }),
      db.collection('subjects').deleteMany({ orgId }),
      db.collection('students').deleteMany({ orgId }),
      db.collection('attendance').deleteMany({ orgId }),
      db.collection('feestructures').deleteMany({ orgId }),
      db.collection('challans').deleteMany({ orgId }),
      db.collection('notifications').deleteMany({ orgId }),
    ]);
    await orgs.deleteOne({ _id: orgId });
    console.log('Cleared previous demo data.');
  }

  // ── 1. Organization ─────────────────────────────────────────────────────────
  const orgId = oid();
  await orgs.insertOne({
    _id: orgId,
    name: ORG_NAME,
    slug: ORG_SLUG,
    plan: 'growth',
    status: 'active',
    contactEmail: CREDENTIALS.group_admin.email,
    contactPhone: '0300-1234567',
    address: 'Gulberg III, Lahore',
    settings: { timezone: 'Asia/Karachi', currency: 'PKR', academicYearStart: 3 },
    usageBilling: { activeStudents: 0 },
    trialEndsAt: new Date(Date.now() + 30 * 86400000),
    createdAt: now, updatedAt: now,
  });

  // ── 2. Branch ───────────────────────────────────────────────────────────────
  const branchId = oid();
  await db.collection('branches').insertOne({
    _id: branchId,
    orgId,
    name: BRANCH_NAME,
    code: 'LHR-MAIN',
    address: 'Gulberg III, Lahore',
    city: 'Lahore',
    phone: '042-35761234',
    email: 'info@beaconhouse.pk',
    principalName: 'Dr. Fatima Malik',
    status: 'active',
    settings: {
      attendanceThreshold: 75,
      periodsPerDay: 7,
      workingDays: [1, 2, 3, 4, 5, 6],
      periodDurationMinutes: 45,
      breakTimings: [{ name: 'Lunch', afterPeriod: 4, durationMinutes: 30 }],
      gradingSystem: 'percentage',
    },
    createdAt: now, updatedAt: now,
  });

  // ── 3. Users ─────────────────────────────────────────────────────────────────
  const users = db.collection('users');

  const groupAdminId = oid();
  const principalId  = oid();
  const teacher1Id   = oid();
  const teacher2Id   = oid();
  const accountantId = oid();
  const itAdminId    = oid();

  await users.insertMany([
    {
      _id: groupAdminId, orgId, branchId,
      role: 'group_admin', name: 'Zahid Hussain',
      email: CREDENTIALS.group_admin.email,
      passwordHash: await hash(CREDENTIALS.group_admin.password),
      active: true, createdAt: now, updatedAt: now,
    },
    {
      _id: principalId, orgId, branchId,
      role: 'branch_principal', name: 'Dr. Fatima Malik',
      email: CREDENTIALS.branch_principal.email,
      passwordHash: await hash(CREDENTIALS.branch_principal.password),
      active: true, createdAt: now, updatedAt: now,
    },
    {
      _id: teacher1Id, orgId, branchId,
      role: 'teacher', name: 'Asim Raza',
      email: CREDENTIALS.teacher1.email,
      passwordHash: await hash(CREDENTIALS.teacher1.password),
      active: true, createdAt: now, updatedAt: now,
    },
    {
      _id: teacher2Id, orgId, branchId,
      role: 'teacher', name: 'Hina Anwar',
      email: CREDENTIALS.teacher2.email,
      passwordHash: await hash(CREDENTIALS.teacher2.password),
      active: true, createdAt: now, updatedAt: now,
    },
    {
      _id: accountantId, orgId, branchId,
      role: 'accountant', name: 'Bilal Qureshi',
      email: CREDENTIALS.accountant.email,
      passwordHash: await hash(CREDENTIALS.accountant.password),
      active: true, createdAt: now, updatedAt: now,
    },
    {
      _id: itAdminId, orgId, branchId,
      role: 'it_admin', name: 'Sara Ahmed',
      email: CREDENTIALS.it_admin.email,
      passwordHash: await hash(CREDENTIALS.it_admin.password),
      active: true, createdAt: now, updatedAt: now,
    },
  ]);

  // ── 4. Academic Year ─────────────────────────────────────────────────────────
  const yearId = oid();
  const yearStart = new Date('2025-04-01');
  const yearEnd   = new Date('2026-03-31');
  await db.collection('academicyears').insertOne({
    _id: yearId, orgId, branchId,
    label: '2025–26',
    startDate: yearStart,
    endDate: yearEnd,
    isCurrent: true,
    createdAt: now, updatedAt: now,
  });

  // ── 5. Classes ───────────────────────────────────────────────────────────────
  const classData = [
    { name: 'Grade 9',  level: 'grade_9',  order: 1 },
    { name: 'Grade 10', level: 'grade_10', order: 2 },
    { name: 'Inter I',  level: 'inter_1',  order: 3 },
    { name: 'Inter II', level: 'inter_2',  order: 4 },
  ];
  const classIds = classData.map(() => oid());
  await db.collection('classes').insertMany(
    classData.map((c, i) => ({
      _id: classIds[i], orgId, branchId, academicYearId: yearId,
      name: c.name, level: c.level, displayOrder: c.order,
      createdAt: now, updatedAt: now,
    }))
  );

  // ── 6. Sections (A & B for each class) ─────────────────────────────────────
  const sectionIds: mongoose.Types.ObjectId[][] = [];
  const sectionDocs: object[] = [];
  for (let ci = 0; ci < classIds.length; ci++) {
    const pair = [oid(), oid()];
    sectionIds.push(pair);
    sectionDocs.push(
      { _id: pair[0], orgId, branchId, classId: classIds[ci], academicYearId: yearId, name: 'A', classTeacherId: teacher1Id, capacity: 35, createdAt: now, updatedAt: now },
      { _id: pair[1], orgId, branchId, classId: classIds[ci], academicYearId: yearId, name: 'B', classTeacherId: teacher2Id, capacity: 35, createdAt: now, updatedAt: now },
    );
  }
  await db.collection('sections').insertMany(sectionDocs);

  // ── 7. Subjects ──────────────────────────────────────────────────────────────
  const subjectData = [
    { name: 'Mathematics',    code: 'MATH' },
    { name: 'English',        code: 'ENG'  },
    { name: 'Urdu',           code: 'URD'  },
    { name: 'Physics',        code: 'PHY'  },
    { name: 'Chemistry',      code: 'CHEM' },
    { name: 'Biology',        code: 'BIO'  },
    { name: 'Pakistan Studies', code: 'PST' },
    { name: 'Islamiyat',      code: 'ISL'  },
  ];
  const subjectIds = subjectData.map(() => oid());
  await db.collection('subjects').insertMany(
    subjectData.map((s, i) => ({
      _id: subjectIds[i], orgId, branchId,
      name: s.name, code: s.code, isElective: false,
      createdAt: now, updatedAt: now,
    }))
  );

  // ── 8. Students (10 per section in Grade 9A & 9B for demo) ──────────────────
  const studentNames = [
    ['Ali Khan', 'Sara Malik', 'Ahmed Raza', 'Fatima Sheikh', 'Usman Tariq',
     'Ayesha Qureshi', 'Bilal Hassan', 'Zainab Hussain', 'Omar Farooq', 'Nida Aziz'],
    ['Hamza Ali', 'Sana Butt', 'Kamran Iqbal', 'Hira Baig', 'Talha Mirza',
     'Maria Siddiqui', 'Faisal Chaudhry', 'Amna Nawaz', 'Asad Mehmood', 'Rabia Javed'],
  ];

  const studentUserIds: mongoose.Types.ObjectId[] = [];
  const studentDocIds: mongoose.Types.ObjectId[] = [];

  for (let si = 0; si < 2; si++) {       // sections A & B of Grade 9
    const sectionId = sectionIds[0][si];
    const classId   = classIds[0];

    for (let n = 0; n < studentNames[si].length; n++) {
      const sName = studentNames[si][n];
      const firstName = sName.split(' ')[0].toLowerCase();
      const stuUserId = oid();
      const stuId     = oid();
      studentUserIds.push(stuUserId);
      studentDocIds.push(stuId);

      const rollNo = `25${String(si + 1).padStart(2, '0')}${String(n + 1).padStart(3, '0')}`;
      const admNo  = `ADM-25-${String(studentDocIds.length).padStart(4, '0')}`;
      const dob    = new Date(2009, (n % 12), 10 + n);

      await users.insertOne({
        _id: stuUserId, orgId, branchId,
        role: 'student', name: sName,
        email: `${firstName}${n + 1}@beaconhouse.pk`,
        passwordHash: await hash(`${firstName.charAt(0).toUpperCase()}${firstName.slice(1)}@${dob.getFullYear()}`),
        active: true, createdAt: now, updatedAt: now,
      });

      await db.collection('students').insertOne({
        _id: stuId, orgId, branchId,
        userId: stuUserId, classId, sectionId, academicYearId: yearId,
        rollNo, admissionNo: admNo,
        profile: {
          name: sName,
          dateOfBirth: dob,
          gender: n % 2 === 0 ? 'male' : 'female',
          cnicOrBForm: `35202-${String(1000000 + n).padStart(7, '0')}-${n % 9}`,
          religion: 'Islam', nationality: 'Pakistani',
        },
        guardianInfo: {
          fatherName: `${sName.split(' ')[1]} Sr.`,
          fatherPhone: `0300-${String(1000000 + n).padStart(7, '0')}`,
        },
        documents: [],
        status: 'active',
        admissionDate: new Date('2025-04-01'),
        createdAt: now, updatedAt: now,
      });
    }
  }

  // student1 login = first student
  await users.updateOne({ _id: studentUserIds[0] }, { $set: {
    email: CREDENTIALS.student1.email,
    passwordHash: await hash(CREDENTIALS.student1.password),
  }});

  // ── 9. Attendance — last 7 school days for Grade 9A ─────────────────────────
  const grade9A_studentDocs = await db.collection('students')
    .find({ orgId, sectionId: sectionIds[0][0] }).toArray();

  const attendanceDays: Date[] = [];
  let d = new Date(now);
  while (attendanceDays.length < 7) {
    d = new Date(d.getTime() - 86400000);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 5) attendanceDays.push(new Date(d)); // skip Fri & Sun
  }

  for (const day of attendanceDays) {
    const dateStr = day.toISOString().split('T')[0];
    const records = grade9A_studentDocs.map((s, i) => ({
      studentId: s._id,
      status: i === 2 ? 'absent' : i === 5 ? 'late' : 'present',
      note: '',
    }));
    await db.collection('attendance').insertOne({
      _id: oid(), orgId, branchId,
      classId: classIds[0], sectionId: sectionIds[0][0],
      academicYearId: yearId,
      date: day,
      dateStr,
      records,
      createdAt: day, updatedAt: day,
    });
  }

  // ── 10. Fee Structure for Grade 9 ───────────────────────────────────────────
  const feeStructId = oid();
  await db.collection('feestructures').insertOne({
    _id: feeStructId, orgId, branchId,
    classId: classIds[0], academicYearId: yearId,
    name: 'Grade 9 Monthly Fee',
    items: [
      { name: 'Tuition Fee', amount: 8000, isOptional: false },
      { name: 'Computer Lab', amount: 500, isOptional: false },
      { name: 'Library Fee', amount: 300, isOptional: false },
    ],
    totalAmount: 8800,
    dueDay: 10,
    isActive: true,
    createdAt: now, updatedAt: now,
  });

  // ── 11. Sample Challan (current month, first student) ───────────────────────
  const firstStudentId = studentDocIds[0];
  const challanMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  await db.collection('challans').insertOne({
    _id: oid(), orgId, branchId,
    studentId: firstStudentId, classId: classIds[0],
    feeStructureId: feeStructId,
    month: challanMonth,
    challanNo: `CH-25-00001`,
    items: [
      { name: 'Tuition Fee', amount: 8000 },
      { name: 'Computer Lab', amount: 500 },
      { name: 'Library Fee', amount: 300 },
    ],
    totalAmount: 8800, discount: 0, waiver: 0, netAmount: 8800,
    paidAmount: 0, dueDate: new Date(now.getFullYear(), now.getMonth(), 10),
    status: 'unpaid', payments: [],
    createdAt: now, updatedAt: now,
  });

  // ── Done ─────────────────────────────────────────────────────────────────────
  console.log('\n✓ Demo school seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  School  : ${ORG_NAME}`);
  console.log(`  Branch  : ${BRANCH_NAME}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ROLE              EMAIL                         PASSWORD');
  console.log('  ──────────────────────────────────────────────────────');
  console.log(`  Group Admin       ${CREDENTIALS.group_admin.email.padEnd(28)}  ${CREDENTIALS.group_admin.password}`);
  console.log(`  Principal         ${CREDENTIALS.branch_principal.email.padEnd(28)}  ${CREDENTIALS.branch_principal.password}`);
  console.log(`  Teacher 1         ${CREDENTIALS.teacher1.email.padEnd(28)}  ${CREDENTIALS.teacher1.password}`);
  console.log(`  Teacher 2         ${CREDENTIALS.teacher2.email.padEnd(28)}  ${CREDENTIALS.teacher2.password}`);
  console.log(`  Accountant        ${CREDENTIALS.accountant.email.padEnd(28)}  ${CREDENTIALS.accountant.password}`);
  console.log(`  IT Admin          ${CREDENTIALS.it_admin.email.padEnd(28)}  ${CREDENTIALS.it_admin.password}`);
  console.log(`  Student (Ali)     ${CREDENTIALS.student1.email.padEnd(28)}  ${CREDENTIALS.student1.password}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  20 students seeded in Grade 9 (Sections A & B)`);
  console.log(`  7 days of attendance recorded for Grade 9-A`);
  console.log(`  1 fee structure + 1 unpaid challan for demo`);

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
