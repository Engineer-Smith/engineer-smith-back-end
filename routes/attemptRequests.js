// /routes/attemptRequests.js - FIXED to prevent double notifications
const express = require('express');
const router = express.Router();
const AttemptRequest = require('../models/AttemptRequest');
const Test = require('../models/Test');
const { validateContentAccess, verifyToken } = require('../middleware/auth');

// Student submits attempt request
router.post('/', verifyToken, async (req, res) => {
    try {
        const { testId, requestedAttempts, reason } = req.body;
        const userId = req.user._id;
        const organizationId = req.user.organizationId;

        // Validate test exists and student has exhausted attempts
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }

        const remainingAttempts = await test.getRemainingAttempts(userId);
        if (remainingAttempts > 0) {
            return res.status(400).json({
                error: `You still have ${remainingAttempts} attempt(s) remaining`
            });
        }

        // Check for existing pending request
        const existingRequest = await AttemptRequest.findOne({
            userId,
            testId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                error: 'You already have a pending request for this test'
            });
        }

        // Create request
        const attemptRequest = await AttemptRequest.create({
            userId,
            testId,
            organizationId,
            requestedAttempts,
            reason
        });

        // FIXED: Use the notification controller properly - single notification creation
        try {
            const notificationController = req.notificationController;
            if (notificationController) {

                // This will handle BOTH database storage AND real-time socket notifications
                const result = await notificationController.submitAttemptRequest({
                    userId: userId.toString(),
                    organizationId: organizationId.toString(),
                    testId: testId.toString(),
                    requestedAttempts,
                    reason
                });

                if (result.success) {
                    console.log('[ATTEMPT_REQUEST_ROUTE] Notifications sent successfully');
                } else {
                    console.error('[ATTEMPT_REQUEST_ROUTE] Notification controller failed:', result.message);
                }
            } else {
                console.error('[ATTEMPT_REQUEST_ROUTE] Notification controller not available');
            }
        } catch (notificationError) {
            console.error('[ATTEMPT_REQUEST_ROUTE] Error sending notifications:', notificationError);
            // Don't fail the request if notifications fail
        }

        res.status(201).json({
            success: true,
            message: 'Request submitted successfully',
            requestId: attemptRequest._id
        });

    } catch (error) {
        console.error('Error submitting attempt request:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rest of the routes remain the same...
router.patch('/:requestId/review', verifyToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { decision, reviewNotes } = req.body;
        const reviewerId = req.user._id;

        if (!['instructor', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const attemptRequest = await AttemptRequest.findById(requestId);
        if (!attemptRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (attemptRequest.status !== 'pending') {
            return res.status(400).json({ error: 'Request already reviewed' });
        }

        // Process decision
        if (decision === 'approved') {
            await attemptRequest.approve(reviewerId, reviewNotes);
        } else if (decision === 'rejected') {
            await attemptRequest.reject(reviewerId, reviewNotes);
        } else {
            return res.status(400).json({ error: 'Decision must be "approved" or "rejected"' });
        }

        // FIXED: Use notification controller for consistent handling
        try {
            const notificationController = req.notificationController;
            if (notificationController) {
                await notificationController.reviewAttemptRequest({
                    requestId,
                    reviewerId,
                    decision,
                    reviewNotes
                });
            }
        } catch (notificationError) {
            console.error('[ATTEMPT_REQUEST_ROUTE] Error sending review notifications:', notificationError);
        }

        res.json({
            success: true,
            message: `Request ${decision} successfully`
        });

    } catch (error) {
        console.error('Error reviewing attempt request:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get pending requests for instructors
router.get('/pending', verifyToken, async (req, res) => {
    try {
        if (!['instructor', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const requests = await AttemptRequest.find({
            organizationId: req.user.organizationId,
            status: 'pending'
        })
            .populate('userId', 'firstName lastName fullName email') // Added fullName
            .populate('testId', 'title description') // Added description
            .sort({ createdAt: -1 });

        // Transform the response to match frontend expectations
        const transformedRequests = requests.map(request => ({
            ...request.toObject(),
            user: request.userId, // Map userId to user for frontend compatibility
            test: request.testId   // Map testId to test for frontend compatibility
        }));

        res.json(transformedRequests);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get student's own requests
router.get('/my-requests', verifyToken, async (req, res) => {
    try {
        const requests = await AttemptRequest.find({
            userId: req.user._id
        })
            .populate('testId', 'title')
            .populate('reviewedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific request details
router.get('/:requestId', verifyToken, validateContentAccess, async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await AttemptRequest.findById(requestId)
            .populate('userId', 'firstName lastName email')
            .populate('testId', 'title description')
            .populate('reviewedBy', 'firstName lastName');

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const canView = request.userId._id.toString() === req.user._id.toString() ||
            (['instructor', 'admin'].includes(req.user.role) &&
                request.organizationId.toString() === req.user.organizationId.toString());

        if (!canView) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(request);

    } catch (error) {
        console.error('Error fetching request:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;