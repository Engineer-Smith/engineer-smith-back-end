// /routes/users.js - UPDATED
const express = require('express');
const router = express.Router();
const { getUser, getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { verifyToken, validateOrgAdminOrInstructor, validateOrgAdminOnly } = require('../middleware/auth');

// Get specific user - admins and instructors can view users
router.get('/:userId', verifyToken, validateOrgAdminOrInstructor, getUser);

// Get all users - admins and instructors can view (this was causing the 403 error!)
router.get('/', verifyToken, validateOrgAdminOrInstructor, getAllUsers);

// Update user - only admins can modify users
router.patch('/:userId', verifyToken, validateOrgAdminOnly, updateUser);

// Delete user - only admins can delete users
router.delete('/:userId', verifyToken, validateOrgAdminOnly, deleteUser);

module.exports = router;