/**
 * Admin Seed Script
 * Run: npx tsx src/scripts/seedAdmin.ts
 * Creates an admin user in the database.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import config from '../config/index.js';

async function seedAdmin() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(config.mongodbUri);
  console.log('✅ Connected');

  const email = 'admin@aicareerhub.com';
  const password = 'Admin@123';

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log('✅ Existing user upgraded to admin role');
    } else {
      console.log('ℹ️  Admin user already exists, no changes made.');
    }
    await mongoose.disconnect();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  await User.create({
    name: 'Admin',
    email,
    passwordHash,
    role: 'admin',
  });

  console.log('\n✅ Admin user created!');
  console.log('─────────────────────────────');
  console.log(`  Email   : ${email}`);
  console.log(`  Password: ${password}`);
  console.log('─────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
