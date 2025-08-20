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
    const testOrg = await Organization.findOne({ name: 'TestOrg' });
    if (!testOrg) {
      throw new Error('TestOrg not found');
    }

    // Define users with updated model structure
    const users = [
      // EngineerSmith Super Org Users
      {
        loginId: 'admin_engineersmith',
        email: 'admin@engineersmith.com',
        password: 'secureAdmin123',
        organizationId: engineerSmithOrg._id,
        role: 'admin',
        isSSO: false,
      },
      {
        loginId: 'instructor_engineersmith',
        email: 'instructor@engineersmith.com',
        password: 'secureInstructor123',
        organizationId: engineerSmithOrg._id,
        role: 'instructor',
        isSSO: false,
      },
      {
        loginId: 'student_engineersmith',
        email: 'student@engineersmith.com',
        password: 'secureStudent123',
        organizationId: engineerSmithOrg._id,
        role: 'student',
        isSSO: false,
      },
      {
        loginId: 'sso_user',
        email: 'sso.user@engineersmith.com',
        ssoId: 'sso123',
        ssoToken: 'sso-token-placeholder',
        organizationId: engineerSmithOrg._id,
        role: 'student',
        isSSO: true,
      },
      // TestOrg Users
      {
        loginId: 'admin_testorg',
        email: 'admin@testorg.com',
        password: 'secureAdminTest123',
        organizationId: testOrg._id,
        role: 'admin',
        isSSO: false,
      },
      {
        loginId: 'instructor_testorg',
        email: 'instructor@testorg.com',
        password: 'secureInstructorTest123',
        organizationId: testOrg._id,
        role: 'instructor',
        isSSO: false,
      },
      {
        loginId: 'student_testorg',
        email: 'student@testorg.com',
        password: 'secureStudentTest123',
        organizationId: testOrg._id,
        role: 'student',
        isSSO: false,
      },
      // Users with only username (no email) for testing
      {
        loginId: 'username_only_user',
        // No email field
        password: 'testPassword123',
        organizationId: engineerSmithOrg._id,
        role: 'student',
        isSSO: false,
      },
      // Test users for login credential testing
      {
        loginId: 'john_doe',
        email: 'john.doe@example.com',
        password: 'johnPassword123',
        organizationId: testOrg._id,
        role: 'student',
        isSSO: false,
      },
    ];

    // Seed users
    for (const userData of users) {
      const { loginId, email, password } = userData;
      
      // Check if user already exists by username
      const existingUserByUsername = await User.findOne({ loginId });
      if (existingUserByUsername) {
        console.log(`User with username '${loginId}' already exists`);
        continue;
      }

      // Check if user already exists by email (if email is provided)
      if (email) {
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
          console.log(`User with email '${email}' already exists`);
          continue;
        }
      }

      // Create user object
      const userObj = {
        loginId: userData.loginId,
        email: userData.email || undefined, // Only set if provided
        organizationId: userData.organizationId,
        role: userData.role,
        isSSO: userData.isSSO,
      };

      // Add password hash for non-SSO users
      if (!userData.isSSO && password) {
        userObj.hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      }

      // Add SSO fields for SSO users
      if (userData.isSSO) {
        userObj.ssoId = userData.ssoId;
        userObj.ssoToken = userData.ssoToken;
      }

      const user = new User(userObj);
      await user.save();
      
      console.log(`✅ User created: ${loginId}${email ? ` (${email})` : ''} - ${userData.role}`);
    }

    console.log('\n🎉 User seeding completed successfully!');
    console.log('\n📋 Test Login Credentials:');
    console.log('==========================================');
    console.log('🔑 Login with USERNAME or EMAIL:');
    console.log('  • admin_engineersmith / admin@engineersmith.com → secureAdmin123');
    console.log('  • john_doe / john.doe@example.com → johnPassword123');
    console.log('  • student_testorg / student@testorg.com → secureStudentTest123');
    console.log('  • username_only_user (no email) → testPassword123');
    console.log('==========================================\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();