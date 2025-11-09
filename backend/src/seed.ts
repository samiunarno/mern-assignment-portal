// FIX: Add reference to Node.js types to resolve issues with globals like `__dirname` and `process`.
/// <reference types="node" />

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User, { UserRole } from './models/user.model';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const seedAdmin = async () => {
  if (!DB || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ FATAL ERROR: MONGO_URI, ADMIN_EMAIL, and ADMIN_PASSWORD must be defined in your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(DB);
    console.log('🌱 MongoDB connection successful for seeding!');

    const userCount = await User.countDocuments();
    if (userCount >= 16) {
      console.error('❌ User limit of 16 has been reached. Cannot create admin user.');
      return;
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`ℹ️ Admin user ${ADMIN_EMAIL} already exists.`);
      return;
    }

    // Create new admin
    const admin = new User({
      name: 'Administrator',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: UserRole.Admin,
      approved: true, // First admin is pre-approved
    });

    await admin.save();
    console.log(`✅ Admin user ${ADMIN_EMAIL} created successfully.`);

  } catch (error) {
    console.error('❌ Error during admin seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🌱 MongoDB connection closed.');
  }
};

seedAdmin();