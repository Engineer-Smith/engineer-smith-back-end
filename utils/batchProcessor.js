// utils/batchProcessor.js
const Question = require('../models/Question');

class BatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10;
    this.continueOnError = options.continueOnError || true;
    this.logProgress = options.logProgress !== false;
  }

  /**
   * Inserts questions in batches with error handling
   */
  async insertBatch(questions, options = {}) {
    const results = {
      success: 0,
      failures: [],
      totalProcessed: 0,
      insertedIds: []
    };

    if (!Array.isArray(questions) || questions.length === 0) {
      console.log('⚠️  No questions to insert');
      return results;
    }

    const batchSize = options.batchSize || this.batchSize;
    const totalBatches = Math.ceil(questions.length / batchSize);

    console.log(`📦 Processing ${questions.length} questions in ${totalBatches} batches of ${batchSize}`);

    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      if (this.logProgress) {
        console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} questions)...`);
        // Log the questions in this batch for debugging
        console.log(`    Questions in batch: ${batch.map(q => q.title).join(', ')}`);
      }

      try {
        const batchResult = await this.processBatch(batch, batchNumber);
        results.success += batchResult.success;
        results.failures.push(...batchResult.failures);
        results.insertedIds.push(...batchResult.insertedIds);
        results.totalProcessed += batch.length;

        if (this.logProgress) {
          console.log(`  ✅ Batch ${batchNumber}: ${batchResult.success}/${batch.length} successful`);
          if (batchResult.failures.length > 0) {
            console.log(`  ❌ Batch ${batchNumber}: ${batchResult.failures.length} failures`);

            // Log a summary of the failures
            console.log(`    🔍 FAILURE SUMMARY:`);
            batchResult.failures.forEach((failure, idx) => {
              console.log(`      ${idx + 1}. ${failure.title}: ${failure.errorCode || 'Unknown'} - ${failure.error}`);
            });
          }
        }

      } catch (error) {
        console.error(`❌ Batch ${batchNumber} failed completely - DETAILED ANALYSIS:`);
        console.error(`  Error Type: ${error.constructor.name}`);
        console.error(`  Error Name: ${error.name}`);
        console.error(`  Error Message: ${error.message}`);
        console.error(`  Error Code: ${error.code || 'none'}`);
        console.error(`  Batch Size: ${batch.length}`);
        console.error(`  Questions in failed batch:`);
        batch.forEach((q, idx) => {
          console.error(`    ${idx + 1}. "${q.title}" (${q.type}, ${q.language}${q.category ? ', ' + q.category : ''})`);
        });

        if (this.continueOnError) {
          // Try inserting individually if batch fails
          console.log(`  🔄 Attempting individual recovery for batch ${batchNumber}...`);
          const individualResults = await this.insertIndividually(batch, batchNumber);
          results.success += individualResults.success;
          results.failures.push(...individualResults.failures);
          results.insertedIds.push(...individualResults.insertedIds);
          results.totalProcessed += batch.length;
        } else {
          throw error;
        }
      }
    }

    // Enhanced summary logging
    if (results.failures.length > 0) {
      console.log(`\n🔍 COMPREHENSIVE FAILURE ANALYSIS:`);
      console.log(`Total Failures: ${results.failures.length}`);

      // Group failures by error type
      const errorTypes = {};
      results.failures.forEach(failure => {
        const errorType = failure.errorCode || 'Unknown';
        if (!errorTypes[errorType]) {
          errorTypes[errorType] = [];
        }
        errorTypes[errorType].push(failure.title);
      });

      console.log(`\nError Types:`);
      Object.entries(errorTypes).forEach(([errorCode, titles]) => {
        console.log(`  ${errorCode}: ${titles.length} questions`);
        titles.forEach(title => console.log(`    - ${title}`));
      });
    }

    return results;
  }

  /**
   * Processes a single batch of questions
   */
  async processBatch(questions, batchNumber) {
    const result = {
      success: 0,
      failures: [],
      insertedIds: []
    };

    try {
      // Attempt bulk insert with ordered: true to get better error reporting
      console.log(`    🔍 DEBUG: Attempting bulk insert of ${questions.length} questions`);

      const inserted = await Question.insertMany(questions, {
        ordered: true, // Changed to true to get detailed error reporting
        validateBeforeSave: true
      });

      result.success = inserted.length;
      result.insertedIds = inserted.map(q => q._id);

      console.log(`    ✅ DEBUG: Bulk insert successful for ${inserted.length} questions`);
      return result;

    } catch (error) {
      console.log(`    🔍 DEBUG: Batch ${batchNumber} error analysis:`);
      console.log(`      Error Name: ${error.name}`);
      console.log(`      Error Message: ${error.message}`);
      console.log(`      Has writeErrors: ${!!error.writeErrors}`);
      console.log(`      Has result: ${!!error.result}`);
      console.log(`      Error Code: ${error.code || 'none'}`);

      if (error.name === 'BulkWriteError' || error.writeErrors) {
        // Handle partial success in bulk operations
        const insertedDocs = error.result?.insertedDocs || error.insertedDocs || [];
        const writeErrors = error.writeErrors || [];

        result.success = insertedDocs.length;
        result.insertedIds = insertedDocs.map(q => q._id);

        console.log(`    📊 Bulk operation results: ${insertedDocs.length} inserted, ${writeErrors.length} errors`);

        // Process individual failures with enhanced debugging
        writeErrors.forEach((writeError, index) => {
          const failedQuestionIndex = writeError.index;
          const failedQuestion = questions[failedQuestionIndex];

          console.log(`    ❌ DETAILED ERROR for question ${failedQuestionIndex + 1}:`);
          console.log(`      Title: ${failedQuestion?.title || 'Unknown'}`);
          console.log(`      Error Code: ${writeError.code}`);
          console.log(`      Error Message: ${writeError.errmsg || writeError.message}`);
          console.log(`      Key Pattern: ${JSON.stringify(writeError.keyPattern || {})}`);
          console.log(`      Key Value: ${JSON.stringify(writeError.keyValue || {})}`);

          // Additional debugging for common errors
          if (writeError.code === 11000) {
            console.log(`      🔍 DUPLICATE KEY ANALYSIS:`);
            console.log(`        Conflicting field: ${Object.keys(writeError.keyPattern || {})[0] || 'unknown'}`);
            console.log(`        Conflicting value: ${Object.values(writeError.keyValue || {})[0] || 'unknown'}`);

            // Log the specific field values that might be causing conflicts
            if (failedQuestion) {
              console.log(`        Question details:`);
              console.log(`          Title: "${failedQuestion.title}"`);
              console.log(`          Type: ${failedQuestion.type}`);
              console.log(`          Language: ${failedQuestion.language}`);
              console.log(`          Category: ${failedQuestion.category || 'none'}`);
              if (failedQuestion.codeConfig?.entryFunction) {
                console.log(`          EntryFunction: ${failedQuestion.codeConfig.entryFunction}`);
              }
            }
          }

          result.failures.push({
            title: failedQuestion?.title || `Question ${failedQuestionIndex + 1}`,
            error: writeError.errmsg || writeError.message,
            question: failedQuestion,
            errorCode: writeError.code,
            keyPattern: writeError.keyPattern,
            keyValue: writeError.keyValue
          });
        });

        return result;
      } else {
        // Single document error (first document failed)
        console.log(`    💥 SINGLE DOCUMENT FAILURE:`);
        console.log(`      Failed on first question: ${questions[0]?.title}`);
        console.log(`      Error Type: ${error.constructor.name}`);
        console.log(`      Error Message: ${error.message}`);
        console.log(`      Error Code: ${error.code || 'none'}`);

        if (error.code === 11000) {
          console.log(`      🔍 DUPLICATE KEY DETAILS:`);
          console.log(`        Key Pattern: ${JSON.stringify(error.keyPattern || {})}`);
          console.log(`        Key Value: ${JSON.stringify(error.keyValue || {})}`);
          console.log(`        Conflicting Question: ${questions[0]?.title}`);
        }

        // Re-throw for individual processing
        throw error;
      }
    }
  }

  /**
   * Inserts questions individually when batch fails
   */
  async insertIndividually(questions, batchNumber) {
    const result = {
      success: 0,
      failures: [],
      insertedIds: []
    };

    console.log(`  ⚠️  Batch ${batchNumber} failed, trying individual inserts with detailed logging...`);

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      try {
        console.log(`    🔍 Individual insert ${i + 1}/${questions.length}: "${question.title}"`);

        const inserted = await Question.create(question);
        result.success++;
        result.insertedIds.push(inserted._id);

        console.log(`      ✅ Success: ${question.title}`);

      } catch (error) {
        console.log(`      ❌ INDIVIDUAL INSERT FAILURE:`);
        console.log(`        Question: ${question.title}`);
        console.log(`        Position: ${i + 1}/${questions.length}`);
        console.log(`        Error Name: ${error.name}`);
        console.log(`        Error Message: ${error.message}`);
        console.log(`        Error Code: ${error.code || 'none'}`);

        if (error.code === 11000) {
          console.log(`        🔍 DUPLICATE KEY DETAILS:`);
          console.log(`          Key Pattern: ${JSON.stringify(error.keyPattern || {})}`);
          console.log(`          Key Value: ${JSON.stringify(error.keyValue || {})}`);
        }

        if (error.errors) {
          console.log(`        📝 VALIDATION ERRORS:`);
          Object.entries(error.errors).forEach(([field, fieldError]) => {
            console.log(`          ${field}: ${fieldError.message}`);
          });
        }

        const errorDetails = {
          title: question.title || `Question ${i + 1}`,
          position: `${i + 1}/${questions.length}`,
          errorName: error.name,
          errorMessage: error.message,
          errorCode: error.code,
          keyPattern: error.keyPattern,
          keyValue: error.keyValue,
          validationErrors: error.errors ? Object.keys(error.errors) : null
        };

        result.failures.push({
          title: errorDetails.title,
          error: errorDetails.errorMessage,
          question: question,
          errorCode: errorDetails.errorCode,
          keyPattern: errorDetails.keyPattern,
          keyValue: errorDetails.keyValue
        });
      }
    }

    console.log(`  📊 Individual insertion results: ${result.success}/${questions.length} successful`);
    return result;
  }

  /**
   * Deletes questions by language (for cleanup before seeding)
   */
  async deleteByLanguage(language) {
    try {
      console.log(`🗑️  Deleting existing ${language} questions...`);
      const result = await Question.deleteMany({ language });
      console.log(`✅ Deleted ${result.deletedCount} existing ${language} questions`);
      return result.deletedCount;
    } catch (error) {
      console.error(`❌ Failed to delete ${language} questions:`, error.message);
      throw error;
    }
  }

  /**
   * Counts questions by language
   */
  async countByLanguage(language) {
    try {
      const count = await Question.countDocuments({ language });
      return count;
    } catch (error) {
      console.error(`❌ Failed to count ${language} questions:`, error.message);
      return 0;
    }
  }

  /**
   * Verifies inserted questions
   */
  async verifyInsertedQuestions(insertedIds) {
    if (!insertedIds || insertedIds.length === 0) {
      return { found: 0, missing: 0, missingIds: [] };
    }

    try {
      const found = await Question.find({ _id: { $in: insertedIds } }).select('_id title');
      const foundIds = found.map(q => q._id.toString());
      const missingIds = insertedIds.filter(id => !foundIds.includes(id.toString()));

      return {
        found: found.length,
        missing: missingIds.length,
        missingIds,
        foundQuestions: found
      };

    } catch (error) {
      console.error('❌ Failed to verify inserted questions:', error.message);
      return { found: 0, missing: insertedIds.length, missingIds: insertedIds };
    }
  }

  /**
   * Creates a backup of existing questions before seeding
   */
  async createBackup(language) {
    try {
      console.log(`💾 Creating backup of existing ${language} questions...`);

      const existingQuestions = await Question.find({ language }).lean();

      if (existingQuestions.length === 0) {
        console.log(`ℹ️  No existing ${language} questions to backup`);
        return null;
      }

      const backup = {
        language,
        timestamp: new Date().toISOString(),
        count: existingQuestions.length,
        questions: existingQuestions
      };

      // You could save this to a file or another collection
      // For now, just return the backup data
      console.log(`✅ Created backup of ${existingQuestions.length} ${language} questions`);
      return backup;

    } catch (error) {
      console.error(`❌ Failed to create backup for ${language}:`, error.message);
      throw error;
    }
  }

  /**
   * Restores questions from backup
   */
  async restoreFromBackup(backup) {
    if (!backup || !backup.questions) {
      throw new Error('Invalid backup data');
    }

    try {
      console.log(`📥 Restoring ${backup.count} ${backup.language} questions from backup...`);

      // Remove current questions
      await this.deleteByLanguage(backup.language);

      // Restore from backup
      const result = await this.insertBatch(backup.questions);

      console.log(`✅ Restored ${result.success}/${backup.count} questions`);
      return result;

    } catch (error) {
      console.error('❌ Failed to restore from backup:', error.message);
      throw error;
    }
  }

  /**
   * Prints processing summary
   */
  printProcessingSummary(results, language) {
    console.log(`\n📊 ${language} Processing Summary:`);
    console.log(`Total Processed: ${results.totalProcessed}`);
    console.log(`✅ Successfully Inserted: ${results.success}`);
    console.log(`❌ Failed: ${results.failures.length}`);

    if (results.failures.length > 0) {
      console.log('\n❌ Failed Questions:');
      results.failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.title}:`);
        console.log(`   Error: ${failure.error}`);

        if (failure.errorCode) {
          console.log(`   Code: ${failure.errorCode}`);
        }

        if (failure.keyPattern) {
          console.log(`   Constraint: ${JSON.stringify(failure.keyPattern)}`);
          console.log(`   Value: ${JSON.stringify(failure.keyValue)}`);
        }

        // Common error interpretations
        if (failure.errorCode === 11000) {
          console.log(`   💡 This is a duplicate key error - a question with similar data already exists`);
        } else if (failure.error.includes('validation')) {
          console.log(`   💡 This is a validation error - the data doesn't meet schema requirements`);
        } else if (failure.error.includes('timeout')) {
          console.log(`   💡 This is a timeout error - database operation took too long`);
        }
      });

      console.log('\n🔍 Error Analysis:');
      const errorTypes = {};
      results.failures.forEach(failure => {
        const errorType = failure.errorCode || 'Unknown';
        errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
      });

      Object.entries(errorTypes).forEach(([type, count]) => {
        console.log(`   ${type}: ${count} questions`);
      });
    }

    if (results.insertedIds.length > 0) {
      console.log(`\n📄 Inserted ${results.insertedIds.length} questions with IDs: ${results.insertedIds.slice(0, 3).join(', ')}${results.insertedIds.length > 3 ? '...' : ''}`);
    }
  }
}

module.exports = BatchProcessor;