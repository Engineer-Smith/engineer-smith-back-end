// /routes/adminOverrides.js - Direct attempt granting for admins
const express = require('express');
const router = express.Router();
const StudentTestOverride = require('../models/StudentTestOverride');
const Test = require('../models/Test');
const User = require('../models/User');
const { 
  verifyToken, 
  validateOrgAdminOrInstructor 
} = require('../middleware/auth');

// Apply authentication to all routes
router.use(verifyToken);
router.use(validateOrgAdminOrInstructor);

// Grant attempts directly (admin/instructor action)
router.post('/grant-attempts', async (req, res) => {
  try {
    const { userId, testId, extraAttempts, reason } = req.body;
    const grantedBy = req.user.userId;
    const organizationId = req.user.organizationId;

    // Validate required fields
    if (!userId || !testId || !extraAttempts || !reason) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, testId, extraAttempts, reason' 
      });
    }

    // Validate test exists and belongs to organization
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Super org admins can grant for any test, others only for their org's tests
    if (!req.user.isSuperOrgAdmin && 
        test.organizationId && 
        test.organizationId.toString() !== organizationId.toString()) {
      return res.status(403).json({ error: 'Cannot grant attempts for tests outside your organization' });
    }

    // Validate user exists and belongs to organization
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!req.user.isSuperOrgAdmin && 
        student.organizationId.toString() !== organizationId.toString()) {
      return res.status(403).json({ error: 'Cannot grant attempts for students outside your organization' });
    }

    // Create or update override
    const override = await StudentTestOverride.findOneAndUpdate(
      { userId, testId },
      {
        $inc: { extraAttempts: extraAttempts },
        $set: {
          organizationId,
          reason: reason,
          grantedBy,
          grantedAt: new Date(),
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Granted ${extraAttempts} additional attempt(s) to ${student.fullName}`,
      override
    });

  } catch (error) {
    console.error('Error granting attempts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all overrides for organization
router.get('/overrides', async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { testId, userId } = req.query;

    let query = {};
    
    // Super org admins can see all overrides, others only their org
    if (!req.user.isSuperOrgAdmin) {
      query.organizationId = organizationId;
    }

    if (testId) query.testId = testId;
    if (userId) query.userId = userId;

    const overrides = await StudentTestOverride.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('testId', 'title')
      .populate('grantedBy', 'firstName lastName')
      .sort({ grantedAt: -1 });

    res.json(overrides);

  } catch (error) {
    console.error('Error fetching overrides:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove/reduce override
router.patch('/overrides/:overrideId', async (req, res) => {
  try {
    const { overrideId } = req.params;
    const { extraAttempts, reason } = req.body;
    const modifiedBy = req.user.userId;

    const override = await StudentTestOverride.findById(overrideId);
    if (!override) {
      return res.status(404).json({ error: 'Override not found' });
    }

    // Check permissions
    if (!req.user.isSuperOrgAdmin && 
        override.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update override
    override.extraAttempts = extraAttempts;
    override.reason = reason;
    override.grantedBy = modifiedBy; // Track who last modified
    override.grantedAt = new Date(); // Update timestamp
    
    await override.save();

    res.json({
      success: true,
      message: 'Override updated successfully',
      override
    });

  } catch (error) {
    console.error('Error updating override:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete override
router.delete('/overrides/:overrideId', async (req, res) => {
  try {
    const { overrideId } = req.params;

    const override = await StudentTestOverride.findById(overrideId);
    if (!override) {
      return res.status(404).json({ error: 'Override not found' });
    }

    // Check permissions
    if (!req.user.isSuperOrgAdmin && 
        override.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await StudentTestOverride.findByIdAndDelete(overrideId);

    res.json({
      success: true,
      message: 'Override removed successfully'
    });

  } catch (error) {
    console.error('Error deleting override:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student's current attempt status for a test
router.get('/status/:testId/:userId', async (req, res) => {
  try {
    const { testId, userId } = req.params;
    const organizationId = req.user.organizationId;

    // Validate access
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check permissions
    if (!req.user.isSuperOrgAdmin) {
      if (test.organizationId && test.organizationId.toString() !== organizationId.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (student.organizationId.toString() !== organizationId.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get attempt information
    const totalAllowed = await test.getAllowedAttemptsForStudent(userId);
    const remaining = await test.getRemainingAttempts(userId);
    const used = totalAllowed - remaining;

    // Get override info
    const override = await StudentTestOverride.findOne({ userId, testId })
      .populate('grantedBy', 'firstName lastName');

    res.json({
      student: {
        id: student._id,
        name: student.fullName,
        email: student.email
      },
      test: {
        id: test._id,
        title: test.title,
        baseAttempts: test.settings.attemptsAllowed
      },
      attempts: {
        total: totalAllowed,
        used,
        remaining
      },
      override: override ? {
        extraAttempts: override.extraAttempts,
        reason: override.reason,
        grantedBy: override.grantedBy?.fullName,
        grantedAt: override.grantedAt
      } : null
    });

  } catch (error) {
    console.error('Error getting attempt status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;