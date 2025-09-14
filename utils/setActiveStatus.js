// utils/setActiveStatus.js
/**
 * Utility function to add 'active' status to all questions in a seed data structure
 */
function setAllQuestionsActive(questionsData) {
  const updatedData = {};
  
  for (const [questionType, questions] of Object.entries(questionsData)) {
    updatedData[questionType] = questions.map(question => ({
      ...question,
      status: 'active' // Override any existing status
    }));
  }
  
  return updatedData;
}

module.exports = { setAllQuestionsActive };