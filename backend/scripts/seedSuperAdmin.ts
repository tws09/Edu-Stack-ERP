/**
 * One-time seed: create the platform super_admin account.
 * Run with: npx ts-node -e "require('./scripts/seedSuperAdmin')"
 * Or:       npx ts-node scripts/seedSuperAdmin.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

const SUPER_ADMIN_EMAIL = 'admin@edustack.pk';
const SUPER_ADMIN_PASSWORD = 'EduStack@2025!';
const SUPER_ADMIN_NAME = 'Platform Admin';

async function seed() {
  await mongoose.connect(MONGO_URI!);
  console.log('Connected to MongoDB');

  // Use raw collection to skip tenant plugin & schema hooks
  const db = mongoose.connection.db!;
  const users = db.collection('users');

  const existing = await users.findOne({ email: SUPER_ADMIN_EMAIL });
  if (existing) {
    console.log(`Super admin already exists: ${SUPER_ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
  await users.insertOne({
    role: 'super_admin',
    name: SUPER_ADMIN_NAME,
    email: SUPER_ADMIN_EMAIL,
    passwordHash,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('');
  console.log('✓ Super admin created successfully');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Email    : ${SUPER_ADMIN_EMAIL}`);
  console.log(`  Password : ${SUPER_ADMIN_PASSWORD}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Change the password after first login!');

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
