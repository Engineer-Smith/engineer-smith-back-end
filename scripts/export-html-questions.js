// export-html-questions.js - Export HTML questions to JSON/CSV
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configure dotenv to look for .env file in project root
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import the existing Question model
const Question = require('../models/Question');

async function exportHtmlQuestions() {
  try {
    console.log('📤 Exporting HTML questions...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Fetch only HTML questions with the fields you need
    const questions = await Question.find({ language: 'html' }, {
      title: 1,
      description: 1,
      type: 1,
      language: 1,
      category: 1,
      difficulty: 1,
      options: 1,
      correctAnswer: 1,
      codeTemplate: 1,
      blanks: 1,
      buggyCode: 1,
      solutionCode: 1,
      testCases: 1,
      _id: 0  // Exclude the MongoDB _id field
    });

    console.log(`📋 Found ${questions.length} HTML questions`);

    if (questions.length === 0) {
      console.log('ℹ️  No HTML questions found to export');
      return { exported: 0 };
    }

    // Create simplified export data
    const exportData = questions.map(q => {
      const simplified = {
        title: q.title,
        description: q.description,
        type: q.type,
        language: q.language,
        category: q.category,
        difficulty: q.difficulty
      };

      // Add type-specific fields
      if (q.type === 'multipleChoice' || q.type === 'trueFalse') {
        simplified.options = q.options;
        simplified.correctAnswer = q.correctAnswer;
      }

      if (q.type === 'fillInTheBlank') {
        simplified.codeTemplate = q.codeTemplate;
        simplified.blanks = q.blanks;
      }

      if (q.type === 'codeDebugging') {
        simplified.buggyCode = q.buggyCode;
        simplified.solutionCode = q.solutionCode;
      }

      if (q.type === 'codeChallenge') {
        simplified.testCases = q.testCases;
      }

      return simplified;
    });

    // Export as JSON
    const jsonOutput = JSON.stringify(exportData, null, 2);
    fs.writeFileSync('html-questions-export.json', jsonOutput);
    console.log('✅ JSON export saved as html-questions-export.json');

    // Export as CSV for multiple choice/true false questions
    const mcQuestions = exportData.filter(q => 
      q.type === 'multipleChoice' || q.type === 'trueFalse'
    );

    if (mcQuestions.length > 0) {
      const csvHeader = 'Title,Description,Type,Language,Category,Difficulty,Options,CorrectAnswer\n';
      const csvRows = mcQuestions.map(q => {
        const options = Array.isArray(q.options) ? q.options.join('|') : '';
        return [
          `"${q.title.replace(/"/g, '""')}"`,
          `"${q.description.replace(/"/g, '""')}"`,
          q.type,
          q.language,
          q.category,
          q.difficulty,
          `"${options}"`,
          `"${q.correctAnswer}"`
        ].join(',');
      });
      
      const csvOutput = csvHeader + csvRows.join('\n');
      fs.writeFileSync('html-questions-export.csv', csvOutput);
      console.log(`✅ CSV export saved as html-questions-export.csv (${mcQuestions.length} HTML MC/TF questions)`);
    }

    console.log('\n📊 Export Summary:');
    const typeCounts = exportData.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} questions`);
    });

    return { exported: questions.length };

  } catch (error) {
    console.error('💥 Export failed:', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the export
exportHtmlQuestions()
  .then((results) => {
    if (results.exported > 0) {
      console.log(`\n🎉 SUCCESS! Exported ${results.exported} HTML questions!`);
      console.log(`📁 Check html-questions-export.json and html-questions-export.csv files`);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed to export HTML questions:', error);
    process.exit(1);
  });