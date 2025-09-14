// scripts/runValidationTest.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('🧪 Starting Validation Test Suite\n');
console.log('Environment check:');
console.log('- MongoDB URL:', process.env.MONGO_URL ? '✅ Set' : '❌ Missing');
console.log('- Node ENV:', process.env.NODE_ENV || 'development');
console.log('');

// Test the validation utilities
const { testValidationUtilities } = require('./testValidation');

async function runTests() {
  try {
    console.log('='.repeat(60));
    console.log('🚀 RUNNING VALIDATION UTILITY TESTS');
    console.log('='.repeat(60));
    
    await testValidationUtilities();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL VALIDATION TESTS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ VALIDATION TESTS FAILED');
    console.log('='.repeat(60));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };