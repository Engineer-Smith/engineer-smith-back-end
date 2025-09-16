// /models/Notification.js
const { Schema, model } = require('mongoose');

const notificationSchema = new Schema({
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },

  type: {
    type: String,
    enum: [
      'attempt_request_submitted',
      'attempt_request_approved',
      'attempt_request_rejected',
      'attempt_request_pending_review',
      'attempts_granted_directly',
      'system_notification',
      'test_related'
    ],
    required: true,
  },

  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },

  // Related data
  relatedModel: {
    type: String,
    enum: ['AttemptRequest', 'Test', 'TestSession', 'StudentTestOverride'],
  },
  relatedId: {
    type: Schema.Types.ObjectId,
  },

  // Action data for buttons/links
  actionUrl: {
    type: String,
  },
  actionText: {
    type: String,
  },

  // Status
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Indexes
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ organizationId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Static method to create attempt request notification
notificationSchema.statics.createAttemptRequestNotification = async function (attemptRequest) {
  try {
    const User = require('./User');
    const Test = require('./Test');

    // Get student and test data with error handling
    const [student, test] = await Promise.all([
      User.findById(attemptRequest.userId),
      Test.findById(attemptRequest.testId)
    ]);

    if (!student) {
      console.error('[NOTIFICATION_MODEL] Student not found:', attemptRequest.userId);
      return [];
    }

    if (!test) {
      console.error('[NOTIFICATION_MODEL] Test not found:', attemptRequest.testId);
      return [];
    }

    // Create student name with fallbacks
    const studentName = student.fullName ||
      `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
      student.loginId ||
      `Student ${student._id.toString().slice(-6)}`;

    // Find instructors/admins in the organization
    const instructors = await User.find({
      organizationId: attemptRequest.organizationId,
      role: { $in: ['instructor', 'admin'] },
      _id: { $ne: attemptRequest.userId } // Don't notify the requester
    });

    if (instructors.length === 0) {
      console.warn('[NOTIFICATION_MODEL] No instructors found for organization:', attemptRequest.organizationId);
      return [];
    }

    // FIXED: Create notifications with proper recipient targeting
    const notifications = instructors.map(instructor => ({
      recipientId: instructor._id, // FIXED: Target specific instructors, not broadcast
      senderId: attemptRequest.userId,
      organizationId: attemptRequest.organizationId,
      type: 'attempt_request_pending_review',
      title: 'New Attempt Request',
      message: `${studentName} has requested ${attemptRequest.requestedAttempts} additional attempt(s) for "${test.title}"`,
      relatedModel: 'AttemptRequest',
      relatedId: attemptRequest._id,
      actionUrl: `/admin/attempt-requests/${attemptRequest._id}`,
      actionText: 'Review Request'
    }));

    const createdNotifications = await this.insertMany(notifications);

    return createdNotifications;

  } catch (error) {
    console.error('[NOTIFICATION_MODEL] Error creating attempt request notifications:', error);
    return [];
  }
};

// Static method to notify about request decision
notificationSchema.statics.notifyRequestDecision = async function (attemptRequest, decision) {
  const Test = require('./Test');
  const test = await Test.findById(attemptRequest.testId);

  const isApproved = decision === 'approved';

  return this.create({
    recipientId: attemptRequest.userId,
    senderId: attemptRequest.reviewedBy,
    organizationId: attemptRequest.organizationId,
    type: `attempt_request_${decision}`,
    title: `Attempt Request ${isApproved ? 'Approved' : 'Rejected'}`,
    message: isApproved
      ? `Your request for ${attemptRequest.requestedAttempts} additional attempt(s) for "${test.title}" has been approved!`
      : `Your request for additional attempts for "${test.title}" has been rejected. ${attemptRequest.reviewNotes}`,
    relatedModel: 'Test',
    relatedId: attemptRequest.testId,
    actionUrl: isApproved ? `/tests/${attemptRequest.testId}` : null,
    actionText: isApproved ? 'Take Test' : null
  });
};

// Static method to notify about direct attempt grant
notificationSchema.statics.notifyDirectAttemptGrant = async function (override) {
  const User = require('./User');
  const Test = require('./Test');

  const student = await User.findById(override.userId);
  const test = await Test.findById(override.testId);
  const grantedBy = await User.findById(override.grantedBy);

  return this.create({
    recipientId: override.userId,
    senderId: override.grantedBy,
    organizationId: override.organizationId,
    type: 'attempts_granted_directly',
    title: 'Additional Attempts Granted',
    message: `${grantedBy.fullName} has granted you ${override.extraAttempts} additional attempt(s) for "${test.title}"`,
    relatedModel: 'Test',
    relatedId: override.testId,
    actionUrl: `/tests/${override.testId}`,
    actionText: 'Take Test'
  });
};

module.exports = model('Notification', notificationSchema);