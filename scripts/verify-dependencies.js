// verify-dependencies.js - Check if all dependencies are available
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const TestSession = require('../models/TestSession');
const Test = require('../models/Test');
require('dotenv').config();

async function verifyDependencies() {
    console.log('Verifying dependencies...\n');
    
    try {
        // 1. Check environment variables
        console.log('1. Checking environment variables:');
        console.log('   MONGO_URL:', process.env.MONGO_URL ? 'Set' : 'Missing');
        console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
        
        if (!process.env.MONGO_URL || !process.env.JWT_SECRET) {
            throw new Error('Required environment variables missing');
        }
        
        // 2. Check models
        console.log('\n2. Models loaded:');
        console.log('   User model: OK');
        console.log('   Organization model: OK');
        console.log('   TestSession model: OK');
        console.log('   Test model: OK');
        
        // 3. Check services
        console.log('\n3. Loading services:');
        try {
            const socketService = require('../services/socketService');
            console.log('   socketService: OK');
        } catch (e) {
            console.log('   socketService: ERROR -', e.message);
        }
        
        try {
            const { handleSocketDisconnection, handleSocketReconnection } = require('../services/testSession/sessionManager');
            console.log('   sessionManager: OK');
        } catch (e) {
            console.log('   sessionManager: ERROR -', e.message);
        }
        
        // 4. Check database connection
        console.log('\n4. Testing database connection:');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('   MongoDB connection: OK');
        
        // 5. Check if test user exists
        console.log('\n5. Checking test data:');
        const user = await User.findOne({ loginId: 'student_engineersmith' }).populate('organizationId');
        console.log('   student_engineersmith user:', user ? 'Found' : 'Not found');
        
        if (user) {
            console.log('   User details:', {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                role: user.role,
                organizationId: user.organizationId._id
            });
        }
        
        // 6. Check if any tests exist
        const testCount = await Test.countDocuments();
        console.log('   Tests in database:', testCount);
        
        console.log('\nAll dependencies verified successfully!');
        
    } catch (error) {
        console.error('Dependency verification failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

verifyDependencies().catch(console.error);