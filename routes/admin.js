// /routes/admin.js
const express = require('express');
const router = express.Router();
const { getOrganization, updateOrganization } = require('../controllers/organizationController');
const { getUserDashboard, getUserDetailsDashboard } = require('../controllers/adminController');
const { verifyToken, validateOrgAccess, validateOrgAdminOnly, validateOrgAdminOrInstructor } = require('../middleware/auth');

// Org-specific routes (super org admins or org admins/instructors)
// These routes have :_id parameter, so validateOrgAccess works perfectly
router.get('/organizations/:id', verifyToken, validateOrgAccess, getOrganization);
router.patch('/organizations/:id', verifyToken, validateOrgAdminOnly, updateOrganization); // Only admins can update orgs

// User management dashboard (admin/instructor access)
router.get('/users/dashboard', verifyToken, validateOrgAdminOrInstructor, getUserDashboard);

// Individual user details dashboard (admin/instructor access)
router.get('/users/:userId/dashboard', verifyToken, validateOrgAdminOrInstructor, getUserDetailsDashboard);

module.exports = router;