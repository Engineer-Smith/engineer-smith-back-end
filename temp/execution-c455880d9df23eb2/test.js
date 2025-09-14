
// Disable dangerous functions
global.require = undefined;
global.process = {
  exit: () => {} // Prevent process.exit calls
};
global.__dirname = undefined;
global.__filename = undefined;

// Student's code
function findMax(num) {
    // Your code here
    return Math.max(...num)
}

// Test runner
const results = [];
let totalPassed = 0;

const deepEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  
  if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) {
    return true;
  }
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (let key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  
  return false;
};

const safeStringify = (obj) => {
  try {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'undefined') return 'undefined';
      if (typeof value === 'function') return '[function]';
      if (typeof value === 'symbol') return '[symbol]';
      return value;
    });
  } catch (error) {
    return '[Unable to stringify]';
  }
};

try {
  // Check if function exists
  if (typeof findMax !== 'function') {
    console.log(JSON.stringify({
      results: [],
      overallPassed: false,
      totalPassed: 0,
      error: 'Function "findMax" not found or is not a function'
    }));
    process.exit(1);
  }

  // Run test cases
  const testCases = [{"id":"test_1756604604322","name":"test","description":"","args":[1,23,4,6,8],"expected":23,"hidden":false,"points":1},{"id":"test_1756604623188","name":"test2","description":"","args":[1,-1,5,-5],"expected":5,"hidden":false,"points":1}];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const startTime = Date.now();
    
    try {
      const actualOutput = findMax.apply(null, testCase.args || []);
      const executionTime = Date.now() - startTime;
      const passed = deepEqual(actualOutput, testCase.expected);
      
      if (passed) totalPassed++;
      
      results.push({
        testName: testCase.name || `Test case ${i + 1}`,
        testCaseIndex: i,
        passed,
        actualOutput: safeStringify(actualOutput),
        expectedOutput: safeStringify(testCase.expected),
        executionTime,
        error: null
      });
      
    } catch (error) {
      results.push({
        testName: testCase.name || `Test case ${i + 1}`,
        testCaseIndex: i,
        passed: false,
        actualOutput: null,
        expectedOutput: safeStringify(testCase.expected),
        executionTime: Date.now() - startTime,
        error: error.message
      });
    }
  }

  // Output results
  console.log(JSON.stringify({
    results: results,
    overallPassed: totalPassed === testCases.length && totalPassed > 0,
    totalPassed: totalPassed
  }));

} catch (globalError) {
  console.log(JSON.stringify({
    results: [],
    overallPassed: false,
    totalPassed: 0,
    error: globalError.message
  }));
}
