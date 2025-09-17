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

    // Seed Simply Coding Org
    const simplyCodingOrg = {
      name: 'Simply Coding',
      isSuperOrg: false,
      inviteCode: 'SIMPLY2025',
    };

    const existingSimplyCodingOrg = await Organization.findOne({ name: 'Simply Coding' });
    if (!existingSimplyCodingOrg) {
      await Organization.create(simplyCodingOrg);
      console.log('Simply Coding org created');
    } else {
      console.log('Simply Coding org already exists');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding organizations:', error);
    process.exit(1);
  }
}

seedSuperOrg();