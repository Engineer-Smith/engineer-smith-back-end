// /scripts/seedUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Organization = require('../models/Organization');
require('dotenv').config();

const SALT_ROUNDS = 10;

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Find organizations
    const engineerSmithOrg = await Organization.findOne({ isSuperOrg: true });
    if (!engineerSmithOrg) {
      throw new Error('EngineerSmith super org not found');
    }
    const simplyCodingOrg = await Organization.findOne({ name: 'Simply Coding' });
    if (!simplyCodingOrg) {
      throw new Error('Simply Coding org not found');
    }

    // Define users with real production accounts
    const users = [
      // EngineerSmith Super Org Users - Real Admins
      {
        loginId: 'zachary_smith',
        firstName: 'Zachary',
        lastName: 'Smith',
        email: 'zachary.6.smith@gmail.com',
        password: 'TempPassword123!', // Should be changed on first login
        organizationId: engineerSmithOrg._id,
        role: 'admin',
        isSSO: false,
        unlimitedAttempts: false,
      },
      {
        loginId: 'jordan_burger',
        firstName: 'Jordan',
        lastName: 'Burger',
        email: 'jordanburger22@gmail.com',
        password: 'TempPassword123!', // Should be changed on first login
        organizationId: engineerSmithOrg._id,
        role: 'admin',
        isSSO: false,
        unlimitedAttempts: false,
      },
      // EngineerSmith Demo Accounts - UNLIMITED ATTEMPTS
      {
        loginId: 'demo_instructor_es',
        firstName: 'Demo',
        lastName: 'Instructor',
        email: 'demo.instructor@engineersmith.com',
        password: 'DemoInstructor123!',
        organizationId: engineerSmithOrg._id,
        role: 'instructor',
        isSSO: false,
        unlimitedAttempts: true, // Demo account gets unlimited attempts
      },
      {
        loginId: 'demo_student_es',
        firstName: 'Demo',
        lastName: 'Student',
        email: 'demo.student@engineersmith.com',
        password: 'DemoStudent123!',
        organizationId: engineerSmithOrg._id,
        role: 'student',
        isSSO: false,
        unlimitedAttempts: true, // Demo account gets unlimited attempts
      },
      // Simply Coding Org Users - Real Admin
      {
        loginId: 'seth_iorg',
        firstName: 'Seth',
        lastName: 'Iorg',
        email: 'sethiorg11@gmail.com',
        password: 'TempPassword123!', // Should be changed on first login
        organizationId: simplyCodingOrg._id,
        role: 'admin',
        isSSO: false,
        unlimitedAttempts: false,
      },
      // Simply Coding Demo Accounts - UNLIMITED ATTEMPTS
      {
        loginId: 'demo_instructor_sc',
        firstName: 'Demo',
        lastName: 'Instructor',
        email: 'demo.instructor@simplycoding.com',
        password: 'DemoInstructor123!',
        organizationId: simplyCodingOrg._id,
        role: 'instructor',
        isSSO: false,
        unlimitedAttempts: true, // Demo account gets unlimited attempts
      },
      {
        loginId: 'demo_student_sc',
        firstName: 'Demo',
        lastName: 'Student',
        email: 'demo.student@simplycoding.com',
        password: 'DemoStudent123!',
        organizationId: simplyCodingOrg._id,
        role: 'student',
        isSSO: false,
        unlimitedAttempts: true, // Demo account gets unlimited attempts
      },
    ];

    // Clear existing users with these loginIds (optional - remove this if you want to keep existing users)
    console.log('Clearing existing users with matching loginIds...');
    await User.deleteMany({
      loginId: {
        $in: users.map(u => u.loginId)
      }
    });

    // Seed users
    for (const userData of users) {
      const { loginId, email, password, firstName, lastName } = userData;

      // Check if user already exists by username
      const existingUserByUsername = await User.findOne({ loginId });
      if (existingUserByUsername) {
        console.log(`User with username '${loginId}' already exists`);
        continue;
      }

      // Check if user already exists by email
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        console.log(`User with email '${email}' already exists`);
        continue;
      }

      // Create user object with required fields
      const userObj = {
        loginId: userData.loginId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        organizationId: userData.organizationId,
        role: userData.role,
        isSSO: userData.isSSO,
        unlimitedAttempts: userData.unlimitedAttempts || false,
      };

      // Add password hash for non-SSO users
      if (!userData.isSSO && password) {
        userObj.hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      }

      const user = new User(userObj);
      await user.save();

      const fullName = `${firstName} ${lastName}`;
      const unlimitedTag = userData.unlimitedAttempts ? ' [UNLIMITED ATTEMPTS]' : '';
      console.log(`✅ User created: ${loginId} (${fullName}) [${email}] - ${userData.role}${unlimitedTag}`);
    }

    console.log('\n🎉 Production user seeding completed successfully!');
    console.log('\n📋 Production Login Credentials:');
    console.log('==========================================');
    console.log('🔑 Login with USERNAME or EMAIL:');
    console.log('');
    console.log('ENGINEER SMITH ADMINS:');
    console.log('  • zachary_smith / zachary.6.smith@gmail.com → TempPassword123!');
    console.log('  • jordan_burger / jordanburger22@gmail.com → TempPassword123!');
    console.log('');
    console.log('ENGINEER SMITH DEMO ACCOUNTS (Unlimited Attempts):');
    console.log('  • demo_instructor_es / demo.instructor@engineersmith.com → DemoInstructor123!');
    console.log('  • demo_student_es / demo.student@engineersmith.com → DemoStudent123!');
    console.log('');
    console.log('SIMPLY CODING ADMIN:');
    console.log('  • seth_iorg / sethiorg11@gmail.com → TempPassword123!');
    console.log('');
    console.log('SIMPLY CODING DEMO ACCOUNTS (Unlimited Attempts):');
    console.log('  • demo_instructor_sc / demo.instructor@simplycoding.com → DemoInstructor123!');
    console.log('  • demo_student_sc / demo.student@simplycoding.com → DemoStudent123!');
    console.log('');
    console.log('⚠️  IMPORTANT: Real admin users should change their passwords on first login!');
    console.log('==========================================\n');

    // Display user counts
    const totalUsers = await User.countDocuments();
    const engineerSmithUsers = await User.countDocuments({ organizationId: engineerSmithOrg._id });
    const simplyCodingUsers = await User.countDocuments({ organizationId: simplyCodingOrg._id });
    const unlimitedUsers = await User.countDocuments({ unlimitedAttempts: true });

    console.log('📊 User Statistics:');
    console.log(`  • Total Users: ${totalUsers}`);
    console.log(`  • EngineerSmith Users: ${engineerSmithUsers}`);
    console.log(`  • Simply Coding Users: ${simplyCodingUsers}`);
    console.log(`  • Users with Unlimited Attempts: ${unlimitedUsers}`);

    // Disconnect
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
