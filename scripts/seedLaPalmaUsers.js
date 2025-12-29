// /scripts/seedLaPalmaUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Organization = require('../models/Organization');
require('dotenv').config();

const SALT_ROUNDS = 10;

async function seedLaPalmaUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const engineerSmithOrg = await Organization.findOne({ isSuperOrg: true });
    if (!engineerSmithOrg) {
      throw new Error('EngineerSmith super org not found');
    }

    const usernames = [
      'lapalma1', 'lapalma2', 'lapalma3', 'lapalma4', 'lapalma5',
      'lapalma6', 'lapalma7', 'lapalma8', 'lapalma9', 'lapalma10',
      'lapalma11', 'lapalma12', 'lapalma13', 'lapalma14', 'lapalma15',
      'lapalma16', 'lapalma17'
    ];

    const password = 'LaPalma2025!';
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    console.log('Removing existing lapalma users...');
    await User.deleteMany({ loginId: { $in: usernames } });

    for (const username of usernames) {
      const user = new User({
        loginId: username,
        firstName: 'La Palma',
        lastName: username.replace('lapalma', ''),
        hashedPassword,
        organizationId: engineerSmithOrg._id,
        role: 'student',
        isSSO: false,
      });

      await user.save();
      console.log(`✅ Created: ${username}`);
    }

    console.log('\n🎉 La Palma users created!');
    console.log('\n📋 All users login with password: LaPalma2025!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedLaPalmaUsers();