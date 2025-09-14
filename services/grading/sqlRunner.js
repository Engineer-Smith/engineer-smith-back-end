// /services/grading/runners/sqlRunner.js - Enhanced with console log capture
const initSqlJs = require('sql.js');

const runSqlTests = async ({ query, testCases, timeoutMs }) => {
  const results = [];
  let totalPassed = 0;
  const consoleLogs = []; // Track all console/debug output
  
  // Input validation
  if (!query || typeof query !== 'string') {
    return {
      testResults: [],
      overallPassed: false,
      totalTestsPassed: 0,
      totalTests: testCases?.length || 0,
      consoleLogs: [],
      executionError: 'Query is required and must be a string'
    };
  }

  if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
    return {
      testResults: [],
      overallPassed: false,
      totalTestsPassed: 0,
      totalTests: 0,
      consoleLogs: [],
      executionError: 'At least one test case is required'
    };
  }
  
  // Helper function to add console logs
  const addConsoleLog = (type, message) => {
    consoleLogs.push({
      type,
      message,
      timestamp: Date.now()
    });
  };
  
  try {
    const SQL = await initSqlJs();
    addConsoleLog('log', 'SQL.js initialized successfully');
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const startTime = Date.now();
      const testStartLogs = consoleLogs.length; // Track logs for this test
      let db;
      
      try {
        addConsoleLog('log', `Starting test case ${i + 1}: ${testCase.name || `SQL test ${i + 1}`}`);
        
        // Create new database for each test
        db = new SQL.Database();
        addConsoleLog('log', 'Database created for test case');
        
        // Set up schema and seed data
        if (testCase.schemaSql) {
          addConsoleLog('log', `Executing schema SQL: ${testCase.schemaSql.substring(0, 100)}${testCase.schemaSql.length > 100 ? '...' : ''}`);
          db.exec(testCase.schemaSql);
          addConsoleLog('log', 'Schema SQL executed successfully');
        }
        
        if (testCase.seedSql) {
          addConsoleLog('log', `Executing seed SQL: ${testCase.seedSql.substring(0, 100)}${testCase.seedSql.length > 100 ? '...' : ''}`);
          db.exec(testCase.seedSql);
          addConsoleLog('log', 'Seed SQL executed successfully');
        }
        
        // Execute user query with timeout protection
        addConsoleLog('log', `Executing user query: ${query.substring(0, 200)}${query.length > 200 ? '...' : ''}`);
        const queryStartTime = Date.now();
        const stmt = db.prepare(query);
        
        // Simple timeout check (sql.js doesn't have built-in timeout)
        if (Date.now() - queryStartTime > timeoutMs) {
          throw new Error('Query execution timed out');
        }
        
        const rows = [];
        let rowCount = 0;
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
          rowCount++;
          
          // Check timeout during result iteration
          if (Date.now() - queryStartTime > timeoutMs) {
            stmt.free();
            throw new Error('Query execution timed out');
          }
        }
        stmt.free();
        
        addConsoleLog('log', `Query executed successfully, returned ${rowCount} rows`);
        if (rowCount > 0) {
          addConsoleLog('log', `First row example: ${JSON.stringify(rows[0])}`);
        }
        
        const executionTime = Date.now() - startTime;
        
        // Compare results
        const passed = compareQueryResults(rows, testCase.expectedRows, testCase.orderMatters);
        if (passed) {
          totalPassed++;
          addConsoleLog('log', `Test case ${i + 1} PASSED`);
        } else {
          addConsoleLog('warn', `Test case ${i + 1} FAILED - Results don't match expected output`);
          addConsoleLog('warn', `Expected: ${JSON.stringify(testCase.expectedRows)}`);
          addConsoleLog('warn', `Actual: ${JSON.stringify(rows)}`);
        }
        
        // Get console logs for this specific test case
        const testConsoleLogs = consoleLogs.slice(testStartLogs);
        
        results.push({
          testName: testCase.name || `SQL test ${i + 1}`,
          testCaseIndex: i,
          passed,
          actualOutput: JSON.stringify(rows),
          expectedOutput: JSON.stringify(testCase.expectedRows || []),
          executionTime,
          consoleLogs: testConsoleLogs, // Console logs specific to this test
          error: null
        });
        
      } catch (error) {
        addConsoleLog('error', `Test case ${i + 1} failed with error: ${error.message}`);
        
        // Get console logs for this test even if it failed
        const testConsoleLogs = consoleLogs.slice(testStartLogs);
        
        results.push({
          testName: testCase.name || `SQL test ${i + 1}`,
          testCaseIndex: i,
          passed: false,
          actualOutput: null,
          expectedOutput: JSON.stringify(testCase.expectedRows || []),
          executionTime: Date.now() - startTime,
          consoleLogs: testConsoleLogs,
          error: error.message
        });
      } finally {
        // Ensure database is always closed
        if (db) {
          try {
            db.close();
            addConsoleLog('log', `Database closed for test case ${i + 1}`);
          } catch (closeError) {
            addConsoleLog('error', `Failed to close SQL database: ${closeError.message}`);
            console.warn('Failed to close SQL database:', closeError);
          }
        }
      }
    }
    
  } catch (error) {
    addConsoleLog('error', `SQL initialization failed: ${error.message}`);
    console.error('SQL initialization error:', error);
    return {
      testResults: [],
      overallPassed: false,
      totalTestsPassed: 0,
      totalTests: testCases.length,
      consoleLogs: consoleLogs,
      executionError: `SQL initialization failed: ${error.message}`
    };
  }
  
  addConsoleLog('log', `SQL test execution completed. ${totalPassed}/${testCases.length} tests passed`);
  
  return {
    testResults: results,
    overallPassed: totalPassed === testCases.length && totalPassed > 0,
    totalTestsPassed: totalPassed,
    totalTests: testCases.length,
    consoleLogs: consoleLogs, // NEW: All console logs from the entire execution
    executionError: null,
    compilationError: null // Added for consistency with other runners
  };
};

const compareQueryResults = (actual, expected, orderMatters = true) => {
  // Handle null/undefined cases
  if (!actual && !expected) return true;
  if (!actual || !expected) return false;
  if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
  
  if (actual.length !== expected.length) return false;
  
  // Make copies to avoid mutating original arrays
  let actualCopy = [...actual];
  let expectedCopy = [...expected];
  
  if (!orderMatters) {
    // Sort both arrays for comparison
    actualCopy = actualCopy.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    expectedCopy = expectedCopy.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  }
  
  for (let i = 0; i < actualCopy.length; i++) {
    if (JSON.stringify(actualCopy[i]) !== JSON.stringify(expectedCopy[i])) {
      return false;
    }
  }
  
  return true;
};

// Validate SQL test case structure
const validateSqlTestCase = (testCase, index) => {
  if (!testCase.expectedRows) {
    throw new Error(`Test case ${index + 1} is missing 'expectedRows' property`);
  }
  
  if (!Array.isArray(testCase.expectedRows)) {
    throw new Error(`Test case ${index + 1} 'expectedRows' must be an array`);
  }
  
  return true;
};

module.exports = { 
  runSqlTests,
  compareQueryResults,
  validateSqlTestCase
};