// fix-remaining-blank.js - Fix ALL questions with {{blank}} format (any language)
const mongoose = require('mongoose');
const path = require('path');

// Configure dotenv to look for .env file in project root
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const Question = require('../models/Question');

async function fixAllRemainingBlanks() {
  try {
    console.log('🔧 Checking ALL fill-in-the-blank questions for {{blank}} format...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Find ALL questions that still have {{blank}} format (any language)
    const questionsWithBraces = await Question.find({
      type: 'fillInTheBlank',
      codeTemplate: { $regex: /\{\{blank/ }
    });

    if (questionsWithBraces.length === 0) {
      console.log('✅ No questions found with {{blank}} format - all are already fixed!');
      return { updated: 0 };
    }

    console.log(`🔧 Found ${questionsWithBraces.length} questions with {{blank}} format:\n`);

    let updatedCount = 0;

    for (const question of questionsWithBraces) {
      console.log(`📝 Fixing: "${question.title}" (Language: ${question.language})`);
      console.log(`   Before: ${question.codeTemplate.substring(0, 80)}...`);

      // Fix the format: {{blankN}} -> ___blankN___
      const fixedCodeTemplate = question.codeTemplate.replace(/\{\{(blank\d+)\}\}/g, '___$1___');

      console.log(`   After:  ${fixedCodeTemplate.substring(0, 80)}...`);

      // Update the question
      await Question.updateOne(
        { _id: question._id },
        { 
          codeTemplate: fixedCodeTemplate,
          updatedAt: new Date()
        }
      );

      console.log(`   ✅ Updated successfully!\n`);
      updatedCount++;
    }

    // Verify the fix
    const remainingBraces = await Question.countDocuments({
      type: 'fillInTheBlank',
      codeTemplate: { $regex: /\{\{blank/ }
    });

    console.log(`📊 Fix Summary:`);
    console.log(`   Questions updated: ${updatedCount}`);
    console.log(`   Questions still with {{blank}}: ${remainingBraces}`);

    if (remainingBraces === 0) {
      console.log('\n🎉 ALL fill-in-the-blank questions now use correct ___blank___ format!');
    } else {
      console.log(`\n⚠️  ${remainingBraces} questions still have {{blank}} format`);
    }

    return { updated: updatedCount };

  } catch (error) {
    console.error('💥 Fix failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixAllRemainingBlanks()
  .then((results) => {
    if (results.updated > 0) {
      console.log(`\n🎉 SUCCESS! Fixed ${results.updated} questions!`);
      console.log(`🎯 All fill-in-the-blank questions should now work correctly!`);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed to fix remaining questions:', error);
    process.exit(1);
  });