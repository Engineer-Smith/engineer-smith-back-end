// /scripts/seedSuperOrg.js
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
require('dotenv').config();

async function seedSuperOrg() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Seed EngineerSmith super org
    const superOrg = {
      name: 'EngineerSmith',
      isSuperOrg: true,
      inviteCode: 'ENG2025',
    };

    const existingSuperOrg = await Organization.findOne({ name: 'EngineerSmith' });
    if (!existingSuperOrg) {
      await Organization.create(superOrg);
      console.log('EngineerSmith super org created');
    } else {
      console.log('EngineerSmith super org already exists');
    }

    // Seed Public Org
    const publicOrg = {
      name: 'Public Org',
      isSuperOrg: false,
      inviteCode: 'PUBLIC2025',
    };

    const existingPublicOrg = await Organization.findOne({ name: 'Public Org' });
    if (!existingPublicOrg) {
      await Organization.create(publicOrg);
      console.log('Public Org created');
    } else {
      console.log('Public Org already exists');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding super org:', error);
    process.exit(1);
  }
}

seedSuperOrg();