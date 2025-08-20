// /routes/superadmin.js - No changes needed, this one is correct
const express = require('express');
const router = express.Router();
const { createOrganization, getAllOrganizations, deleteOrganization } = require('../controllers/organizationController');
const { verifyToken, validateSuperOrgAdmin } = require('../middleware/auth');

// Super org admin routes (site-wide actions)
router.post('/organizations', verifyToken, validateSuperOrgAdmin, createOrganization);
router.get('/organizations', verifyToken, validateSuperOrgAdmin, getAllOrganizations);
router.delete('/organizations/:id', verifyToken, validateSuperOrgAdmin, deleteOrganization);

module.exports = router;