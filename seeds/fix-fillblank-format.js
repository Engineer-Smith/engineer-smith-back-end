// fix-fillblank-format.js - Update existing questions to use correct blank format
const mongoose = require('mongoose');
const path = require('path');

// Configure dotenv to look for .env file in project root
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const Question = require('../models/Question');

async function fixFillInBlankFormat() {
  try {
    console.log('🔧 Starting fix for fill-in-the-blank format...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Find all React fill-in-the-blank questions
    const fillBlankQuestions = await Question.find({
      language: 'react',
      type: 'fillInTheBlank'
    });

    console.log(`📋 Found ${fillBlankQuestions.length} fill-in-the-blank questions to check\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const question of fillBlankQuestions) {
      // Check if the question uses {{blank}} format instead of ___blank___ format
      if (question.codeTemplate && question.codeTemplate.includes('{{blank')) {
        console.log(`🔧 Fixing: "${question.title}"`);
        
        // Convert {{blankN}} to ___blankN___
        const fixedCodeTemplate = question.codeTemplate.replace(/\{\{(blank\d+)\}\}/g, '___$1___');
        
        // Update the question
        await Question.updateOne(
          { _id: question._id },
          { 
            codeTemplate: fixedCodeTemplate,
            updatedAt: new Date()
          }
        );
        
        updatedCount++;
        console.log(`   ✅ Updated blank format`);
      } else if (question.codeTemplate && question.codeTemplate.includes('___blank')) {
        console.log(`⏭️  Skipping: "${question.title}" (already correct format)`);
        skippedCount++;
      } else {
        console.log(`⚠️  Warning: "${question.title}" - No blanks found in codeTemplate`);
        skippedCount++;
      }
    }

    console.log(`\n📊 Fix Summary:`);
    console.log(`   Total questions checked: ${fillBlankQuestions.length}`);
    console.log(`   Questions updated: ${updatedCount}`);
    console.log(`   Questions skipped: ${skippedCount}`);

    // Verify the fixes
    console.log(`\n🔍 Verifying fixes...`);
    const verifyQuestions = await Question.find({
      language: 'react',
      type: 'fillInTheBlank',
      codeTemplate: { $regex: /\{\{blank/ }
    });

    if (verifyQuestions.length === 0) {
      console.log(`✅ All fill-in-the-blank questions now use correct ___blank___ format!`);
    } else {
      console.log(`⚠️  ${verifyQuestions.length} questions still have {{blank}} format:`);
      verifyQuestions.forEach(q => {
        console.log(`   - ${q.title}`);
      });
    }

    console.log(`\n🎉 Fill-in-the-blank format fix completed!`);
    
    return {
      total: fillBlankQuestions.length,
      updated: updatedCount,
      skipped: skippedCount
    };

  } catch (error) {
    console.error('💥 Fix failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔧 FILL-IN-THE-BLANK FORMAT FIXER

This script updates existing React fill-in-the-blank questions in the database 
to use the correct ___blank___ format instead of {{blank}} format.

Usage:
  node fix-fillblank-format.js        # Fix the format
  node fix-fillblank-format.js --help # Show this help

What it does:
  1. Finds all React fill-in-the-blank questions
  2. Converts {{blankN}} to ___blankN___ in codeTemplate
  3. Updates the questions in the database
  4. Verifies all questions use correct format

Safe to run multiple times - will skip questions already in correct format.
`);
  process.exit(0);
} else {
  fixFillInBlankFormat()
    .then((results) => {
      console.log(`\n🎉 SUCCESS! Updated ${results.updated} fill-in-the-blank questions!`);
      console.log(`🎯 Your React practice questions should now render input fields correctly!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to fix format:', error);
      process.exit(1);
    });
}