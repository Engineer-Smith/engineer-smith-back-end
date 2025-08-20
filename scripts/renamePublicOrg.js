// /scripts/renamePublicOrg.js
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
require('dotenv').config();

async function renamePublicOrg() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Find and update Public Org
    const publicOrg = await Organization.findOne({ name: 'Public Org' });
    if (!publicOrg) {
      console.log('Public Org not found');
      return;
    }

    publicOrg.name = 'TestOrg';
    publicOrg.inviteCode = 'TEST2025'; // Update invite code for consistency
    publicOrg.updatedAt = Date.now();
    await publicOrg.save();

    console.log('Public Org renamed to TestOrg');

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error renaming Public Org:', error);
    process.exit(1);
  }
}

renamePublicOrg();