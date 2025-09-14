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

    // Define users with updated model structure including firstName and lastName
    const users = [
      // EngineerSmith Super Org Users
      {
        loginId: 'admin_engineersmith',
        firstName: 'Admin',
        lastName: 'Smith',
        email: 'admin@engineersmith.com',
        password: 'secureAdmin123',
        organizationId: engineerSmithOrg._id,
        role: 'admin',
        isSSO: false,
      },
      {
        loginId: 'instructor_engineersmith',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'instructor@engineersmith.com',
        password: 'secureInstructor123',
        organizationId: engineerSmithOrg._id,
        role: 'instructor',
        isSSO: false,
      },
      {
        loginId: 'student_engineersmith',
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'student@engineersmith.com',
        password: 'secureStudent123',
        organizationId: engineerSmithOrg._id,
        role: 'student',
        isSSO: false,
      },
      {
        loginId: 'sso_user',
        firstName: 'SSO',
        lastName: 'User',
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
        firstName: 'Alex',
        lastName: 'Rodriguez',
        email: 'admin@testorg.com',
        password: 'secureAdminTest123',
        organizationId: testOrg._id,
        role: 'admin',
        isSSO: false,
      },
      {
        loginId: 'instructor_testorg',
        firstName: 'Emily',
        lastName: 'Chen',
        email: 'instructor@testorg.com',
        password: 'secureInstructorTest123',
        organizationId: testOrg._id,
        role: 'instructor',
        isSSO: false,
      },
      {
        loginId: 'student_testorg',
        firstName: 'David',
        lastName: 'Brown',
        email: 'student@testorg.com',
        password: 'secureStudentTest123',
        organizationId: testOrg._id,
        role: 'student',
        isSSO: false,
      },
      // Users with only username (no email) for testing
      {
        loginId: 'username_only_user',
        firstName: 'Username',
        lastName: 'Only',
        // No email field
        password: 'testPassword123',
        organizationId: engineerSmithOrg._id,
        role: 'student',
        isSSO: false,
      },
      // Test users for login credential testing
      {
        loginId: 'john_doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'johnPassword123',
        organizationId: testOrg._id,
        role: 'student',
        isSSO: false,
      },
      // Additional diverse test users
      {
        loginId: 'jane_smith',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@testorg.com',
        password: 'janePassword123',
        organizationId: testOrg._id,
        role: 'instructor',
        isSSO: false,
      },
      {
        loginId: 'test_student',
        firstName: 'Test',
        lastName: 'Student',
        password: 'testStudent123',
        organizationId: engineerSmithOrg._id,
        role: 'student',
        isSSO: false,
      },
    ];

    // Clear existing users (optional - remove this if you want to keep existing users)
    console.log('Clearing existing test users...');
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

      // Check if user already exists by email (if email is provided)
      if (email) {
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
          console.log(`User with email '${email}' already exists`);
          continue;
        }
      }

      // Create user object with required fields
      const userObj = {
        loginId: userData.loginId,
        firstName: userData.firstName, // Required field
        lastName: userData.lastName,   // Required field
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
      
      const fullName = `${firstName} ${lastName}`;
      console.log(`✅ User created: ${loginId} (${fullName})${email ? ` [${email}]` : ''} - ${userData.role}`);
    }

    console.log('\n🎉 User seeding completed successfully!');
    console.log('\n📋 Test Login Credentials:');
    console.log('==========================================');
    console.log('🔑 Login with USERNAME or EMAIL:');
    console.log('');
    console.log('SUPER ORG ADMINS:');
    console.log('  • admin_engineersmith / admin@engineersmith.com → secureAdmin123');
    console.log('');
    console.log('INSTRUCTORS:');
    console.log('  • instructor_engineersmith / instructor@engineersmith.com → secureInstructor123');
    console.log('  • instructor_testorg / instructor@testorg.com → secureInstructorTest123');
    console.log('  • jane_smith / jane.smith@testorg.com → janePassword123');
    console.log('');
    console.log('STUDENTS:');
    console.log('  • student_engineersmith / student@engineersmith.com → secureStudent123');
    console.log('  • john_doe / john.doe@example.com → johnPassword123');
    console.log('  • student_testorg / student@testorg.com → secureStudentTest123');
    console.log('  • test_student (no email) → testStudent123');
    console.log('  • username_only_user (no email) → testPassword123');
    console.log('');
    console.log('ORG ADMINS:');
    console.log('  • admin_testorg / admin@testorg.com → secureAdminTest123');
    console.log('==========================================\n');

    // Display user counts
    const totalUsers = await User.countDocuments();
    const engineerSmithUsers = await User.countDocuments({ organizationId: engineerSmithOrg._id });
    const testOrgUsers = await User.countDocuments({ organizationId: testOrg._id });
    
    console.log('📊 User Statistics:');
    console.log(`  • Total Users: ${totalUsers}`);
    console.log(`  • EngineerSmith Users: ${engineerSmithUsers}`);
    console.log(`  • TestOrg Users: ${testOrgUsers}`);

    // Disconnect
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();