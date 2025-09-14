// /services/grading/fillInBlankGrader.js - FIXED for Option 2 scoring
const gradeFillInBlanks = (answers, blanks) => {
  // Handle edge cases
  if (!blanks || !Array.isArray(blanks) || blanks.length === 0) {
    return {
      results: [],
      totalPoints: 0,
      allCorrect: false,
      totalPossiblePoints: 0,
      individualBlankPoints: 0
    };
  }

  if (!answers || typeof answers !== 'object') {
    // User provided no answers - create empty results
    const results = blanks.map(blank => ({
      blankId: blank.id,
      answer: '',
      isCorrect: false,
      pointsEarned: 0,
      possiblePoints: blank.points || 1
    }));

    return {
      results,
      totalPoints: 0,
      allCorrect: false,
      totalPossiblePoints: blanks.reduce((sum, blank) => sum + (blank.points || 1), 0),
      individualBlankPoints: 0
    };
  }

  const results = [];
  let individualBlankPoints = 0; // Track sum of individual blank points for reference
  
  for (const blank of blanks) {
    const userAnswer = answers[blank.id];
    const correctAnswers = blank.correctAnswers || [];
    const caseSensitive = blank.caseSensitive !== false; // Default to true
    
    let isCorrect = false;
    
    // Only check if user provided an answer
    if (userAnswer && typeof userAnswer === 'string' && userAnswer.trim() !== '') {
      const normalizedAnswer = caseSensitive ? userAnswer.trim() : userAnswer.trim().toLowerCase();
      
      isCorrect = correctAnswers.some(correct => {
        if (typeof correct !== 'string') return false;
        const normalizedCorrect = caseSensitive ? correct.trim() : correct.trim().toLowerCase();
        return normalizedAnswer === normalizedCorrect;
      });
    }
    
    const blankPoints = isCorrect ? (blank.points || 1) : 0;
    individualBlankPoints += blankPoints;
    
    results.push({
      blankId: blank.id,
      answer: userAnswer || '',
      isCorrect,
      pointsEarned: blankPoints, // Individual blank points (for detailed tracking)
      possiblePoints: blank.points || 1
    });
  }
  
  const totalPossiblePoints = blanks.reduce((sum, blank) => sum + (blank.points || 1), 0);
  const allCorrect = results.length > 0 && results.every(r => r.isCorrect);
  
  // OPTION 2: Return individual blank points for tracking, but actual scoring 
  // should be handled by the calling function (question-level points)
  return {
    results,
    totalPoints: individualBlankPoints, // Keep for backward compatibility
    allCorrect, // This is the key field for binary scoring
    totalPossiblePoints,
    individualBlankPoints // Explicit tracking
  };
};

// Helper function to validate fill-in-blank configuration
const validateFillInBlankConfig = (blanks) => {
  if (!Array.isArray(blanks)) {
    throw new Error('Blanks must be an array');
  }
  
  for (let i = 0; i < blanks.length; i++) {
    const blank = blanks[i];
    
    if (!blank.id || typeof blank.id !== 'string') {
      throw new Error(`Blank ${i + 1} must have a valid string id`);
    }
    
    if (!blank.correctAnswers || !Array.isArray(blank.correctAnswers) || blank.correctAnswers.length === 0) {
      throw new Error(`Blank ${i + 1} must have at least one correct answer`);
    }
    
    // Validate all correct answers are strings
    for (let j = 0; j < blank.correctAnswers.length; j++) {
      if (typeof blank.correctAnswers[j] !== 'string') {
        throw new Error(`Blank ${i + 1}, correct answer ${j + 1} must be a string`);
      }
    }
    
    if (blank.points && (typeof blank.points !== 'number' || blank.points < 0)) {
      throw new Error(`Blank ${i + 1} points must be a non-negative number`);
    }
  }
  
  return true;
};

module.exports = { 
  gradeFillInBlanks,
  validateFillInBlankConfig
};