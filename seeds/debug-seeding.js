// /debug-seeding.js - Debug seeding issues step by step
const mongoose = require('mongoose');
require('dotenv').config();

// Simple test to isolate issues
async function debugSeeding() {
  console.log('🔍 Debugging seeding process...\n');
  
  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    const mongoUrl = process.env.MONGO_URL;
    
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('   ✅ Database connected successfully\n');
    
    // 2. Test if models exist
    console.log('2️⃣ Checking for required models...');
    
    try {
      const User = require('../models/User');
      console.log('   ✅ User model found');
    } catch (error) {
      console.log('   ❌ User model not found:', error.message);
    }
    
    try {
      const Organization = require('../models/Organization');
      console.log('   ✅ Organization model found');
    } catch (error) {
      console.log('   ❌ Organization model not found:', error.message);
    }
    
    // 3. Test if CodeChallenge model exists (this is likely missing)
    try {
      const CodeChallenge = require('../models/CodeChallenge');
      console.log('   ✅ CodeChallenge model found');
    } catch (error) {
      console.log('   ❌ CodeChallenge model NOT FOUND - This is likely the issue!');
      console.log('   📝 You need to create /models/CodeChallenge.js');
      console.log('   📝 Copy the CodeChallenge model I provided to your models directory\n');
    }
    
    // 4. Check if super organization exists
    console.log('3️⃣ Checking for super organization...');
    const Organization = require('../models/Organization');
    const superOrg = await Organization.findOne({ isSuperOrg: true });
    
    if (superOrg) {
      console.log(`   ✅ Super organization found: ${superOrg.name}`);
    } else {
      console.log('   ❌ Super organization not found!');
      console.log('   📝 You need to create a super organization first');
      console.log('   📝 Run your organization seeder or create one manually\n');
    }
    
    // 5. Check if admin user exists
    if (superOrg) {
      console.log('4️⃣ Checking for admin user...');
      const User = require('../models/User');
      const adminUser = await User.findOne({ 
        organizationId: superOrg._id, 
        role: 'admin' 
      });
      
      if (adminUser) {
        console.log(`   ✅ Admin user found: ${adminUser.firstName} ${adminUser.lastName}`);
      } else {
        console.log('   ❌ Admin user not found in super organization!');
        console.log('   📝 You need to create an admin user in the super organization\n');
      }
    }
    
    // 6. Test seeder file imports
    console.log('5️⃣ Testing seeder file imports...');
    
    const seederFiles = [
      './javascriptChallenges.js',
      './pythonChallenges.js',
      './dartChallenges.js'
    ];
    
    for (const file of seederFiles) {
      try {
        require(file);
        console.log(`   ✅ ${file} imports successfully`);
      } catch (error) {
        console.log(`   ❌ ${file} failed to import:`, error.message);
      }
    }
    
    console.log('\n🎯 Diagnosis complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy the CodeChallenge model to /models/CodeChallenge.js');
    console.log('2. Ensure you have a super organization');
    console.log('3. Ensure you have an admin user in the super organization');
    console.log('4. Fix any import errors in your seeder files');
    console.log('5. Try running the seeder again');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Debug interrupted');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the debug
debugSeeding()
  .then(() => {
    console.log('\n🏁 Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Debug failed:', error.message);
    process.exit(1);
  });