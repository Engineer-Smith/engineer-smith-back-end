// /routes/admin.js
const express = require('express');
const router = express.Router();
const { getOrganization, updateOrganization } = require('../controllers/organizationController');
const { verifyToken, validateOrgAccess, validateOrgAdminOnly } = require('../middleware/auth');

// Org-specific routes (super org admins or org admins/instructors)
// These routes have :id parameter, so validateOrgAccess works perfectly
router.get('/organizations/:id', verifyToken, validateOrgAccess, getOrganization);
router.patch('/organizations/:id', verifyToken, validateOrgAdminOnly, updateOrganization); // Only admins can update orgs

module.exports = router;