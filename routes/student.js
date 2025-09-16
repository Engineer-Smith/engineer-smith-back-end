// /routes/student.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getStudentDashboard } = require('../controllers/studentController');

router.get('/dashboard', verifyToken, getStudentDashboard);

module.exports = router;