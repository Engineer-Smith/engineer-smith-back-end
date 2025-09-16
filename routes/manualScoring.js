// /routes/manualScoring.js
const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { verifyToken, validateOrgAdminOrInstructor } = require('../middleware/auth');

// Apply authentication to all routes
router.use(verifyToken);
router.use(validateOrgAdminOrInstructor);

// Update individual question scores
router.patch('/results/:resultId/questions/:questionIndex', async (req, res) => {
    try {
        const { resultId, questionIndex } = req.params;
        const { pointsEarned, isCorrect, feedback } = req.body;

        // Find the result
        const result = await Result.findById(resultId);
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        // Verify permissions
        if (!req.user.isSuperOrgAdmin &&
            result.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Update the specific question
        const questionIdx = parseInt(questionIndex);
        if (questionIdx < 0 || questionIdx >= result.questions.length) {
            return res.status(400).json({ error: 'Invalid question index' });
        }

        const question = result.questions[questionIdx];
        const oldPoints = question.pointsEarned;

        // Update question scoring
        question.pointsEarned = pointsEarned;
        question.isCorrect = isCorrect;
        if (feedback !== undefined) question.feedback = feedback;
        question.manuallyGraded = true;
        question.gradedBy = req.user.userId;
        question.gradedAt = new Date();

        // Recalculate total score
        const totalEarned = result.questions.reduce((sum, q) => sum + (q.pointsEarned || 0), 0);
        const totalPossible = result.questions.reduce((sum, q) => sum + (q.pointsPossible || 0), 0);
        const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
        const correctAnswers = result.questions.filter(q => q.isCorrect).length;
        const incorrectAnswers = result.questions.filter(q => !q.isCorrect && q.studentAnswer !== null).length;
        const unansweredQuestions = result.questions.filter(q => q.studentAnswer === null || q.studentAnswer === undefined).length;

        // Update result score with all required fields
        result.score = {
            earnedPoints: totalEarned,
            totalPoints: totalPossible,
            percentage: percentage,
            passed: percentage >= (result.score.passingThreshold || 70),
            totalQuestions: result.questions.length,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers,
            unansweredQuestions: unansweredQuestions,
            passingThreshold: result.score.passingThreshold || 70
        };

        result.lastModified = new Date();
        result.modifiedBy = req.user.userId;

        await result.save();

        res.json({
            success: true,
            message: 'Question score updated successfully',
            updatedQuestion: question,
            newTotalScore: result.score
        });

    } catch (error) {
        console.error('Error updating question score:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bulk update multiple questions in a result
router.patch('/results/:resultId/bulk-update', async (req, res) => {
    try {
        const { resultId } = req.params;
        const { updates, feedback } = req.body; // updates: [{ questionIndex, pointsEarned, isCorrect, feedback }]

        const result = await Result.findById(resultId);
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        // Verify permissions
        if (!req.user.isSuperOrgAdmin &&
            result.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Apply all updates
        updates.forEach(update => {
            const { questionIndex, pointsEarned, isCorrect, feedback: questionFeedback } = update;
            const question = result.questions[questionIndex];

            if (question) {
                question.pointsEarned = pointsEarned;
                question.isCorrect = isCorrect;
                if (questionFeedback !== undefined) {
                    question.feedback = questionFeedback;
                }
                question.manuallyGraded = true;
                question.gradedBy = req.user.userId;
                question.gradedAt = new Date();
            }
        });

        // Recalculate total score
        const totalEarned = result.questions.reduce((sum, q) => sum + (q.pointsEarned || 0), 0);
        const totalPossible = result.questions.reduce((sum, q) => sum + (q.pointsPossible || 0), 0);
        const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
        const correctAnswers = result.questions.filter(q => q.isCorrect).length;
        const incorrectAnswers = result.questions.filter(q => !q.isCorrect && q.studentAnswer !== null).length;
        const unansweredQuestions = result.questions.filter(q => q.studentAnswer === null || q.studentAnswer === undefined).length;

        // Update result score with all required fields
        result.score = {
            earnedPoints: totalEarned,
            totalPoints: totalPossible,
            percentage: percentage,
            passed: percentage >= (result.score.passingThreshold || 70),
            totalQuestions: result.questions.length,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers,
            unansweredQuestions: unansweredQuestions,
            passingThreshold: result.score.passingThreshold || 70
        };

        result.lastModified = new Date();
        result.modifiedBy = req.user.userId;
        if (feedback) result.instructorFeedback = feedback;

        await result.save();

        res.json({
            success: true,
            message: `Updated ${updates.length} questions successfully`,
            newTotalScore: result.score
        });

    } catch (error) {
        console.error('Error bulk updating scores:', error);
        res.status(500).json({ error: error.message });
    }
});

// Override total score directly
router.patch('/results/:resultId/override-score', async (req, res) => {
    try {
        const { resultId } = req.params;
        const { totalScore, percentage, passed, reason } = req.body;

        const result = await Result.findById(resultId);
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        // Verify permissions - only super admins can override total scores
        if (!req.user.isSuperOrgAdmin) {
            return res.status(403).json({ error: 'Only super administrators can override total scores' });
        }

        const oldScore = { ...result.score };
        const correctAnswers = result.questions.filter(q => q.isCorrect).length;
        const incorrectAnswers = result.questions.filter(q => !q.isCorrect && q.studentAnswer !== null).length;
        const unansweredQuestions = result.questions.filter(q => q.studentAnswer === null || q.studentAnswer === undefined).length;

        // Override the total score but keep required fields
        result.score = {
            earnedPoints: totalScore,
            totalPoints: result.score.totalPoints,
            percentage: percentage,
            passed: passed,
            totalQuestions: result.questions.length,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers,
            unansweredQuestions: unansweredQuestions,
            passingThreshold: result.score.passingThreshold || 70
        };

        result.scoreOverridden = true;
        result.overrideReason = reason;
        result.lastModified = new Date();
        result.modifiedBy = req.user.userId;

        await result.save();

        res.json({
            success: true,
            message: 'Total score overridden successfully',
            oldScore,
            newScore: result.score
        });

    } catch (error) {
        console.error('Error overriding total score:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get results that need manual grading
router.get('/pending-review', async (req, res) => {
    try {
        const { testId, orgId } = req.query;

        let query = {
            status: 'completed',
            $or: [
                { 'questions.type': { $in: ['essay', 'codeChallenge'] } },
                { manualReviewRequired: true }
            ]
        };

        // Organization filtering
        if (!req.user.isSuperOrgAdmin) {
            query.organizationId = req.user.organizationId;
        } else if (orgId) {
            query.organizationId = orgId;
        }

        if (testId) query.testId = testId;

        const results = await Result.find(query)
            .populate('userId', 'firstName lastName email')
            .populate('testId', 'title')
            .select('userId testId attemptNumber completedAt score questions.type questions.title questions.pointsEarned questions.pointsPossible questions.manuallyGraded')
            .sort({ completedAt: -1 })
            .limit(50);

        // Filter to only include results with ungraded manual questions
        const pendingResults = results.filter(result => {
            return result.questions.some(q =>
                ['essay', 'codeChallenge'].includes(q.type) && !q.manuallyGraded
            );
        });

        res.json(pendingResults);

    } catch (error) {
        console.error('Error fetching pending reviews:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;