const mongoose = require('mongoose');
const Question = require('../models/Question')
require('dotenv').config();

async function updateQuestionStatus() {
  try {
    console.log('🚀 Starting question status update...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Update all questions to set status to "active"
    const result = await Question.updateMany(
      {}, // Empty filter to match all documents
      { $set: { status: 'active' } },
      { runValidators: true } // Ensure schema validation
    );

    console.log(`✅ Updated ${result.modifiedCount} questions to status: active`);
    console.log(`📊 Total questions matched: ${result.matchedCount}`);

  } catch (error) {
    console.error('❌ Error updating question status:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  }
}

if (require.main === module) {
  updateQuestionStatus()
    .then(() => {
      console.log('🎉 Question status update completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to update question status:', error);
      process.exit(1);
    });
}

updateQuestionStatus();