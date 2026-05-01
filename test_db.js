const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: './server/.env' });

const testConnection = async () => {
    console.log('--- Database Connection Test ---');
    console.log('URI:', process.env.MONGO_URI ? 'URI found in .env' : 'URI NOT FOUND');
    
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Fail after 5 seconds
        });
        console.log('✅ Successfully connected to MongoDB!');

        // Define a temporary User Schema for testing
        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            role: String
        });
        const User = mongoose.models.User || mongoose.model('User', userSchema);

        // 1. Create a Demo User
        console.log('\nTesting: Creating Demo User...');
        const demoEmail = `testuser_${Date.now()}@example.com`;
        const demoUser = await User.create({
            name: 'Demo User',
            email: demoEmail,
            password: await bcrypt.hash('password123', 10),
            role: 'user'
        });
        console.log('✅ Demo User Created:', demoUser.email);

        // 2. Create an Admin User
        console.log('\nTesting: Creating Admin User...');
        const adminEmail = `admin_${Date.now()}@example.com`;
        const adminUser = await User.create({
            name: 'Admin User',
            email: adminEmail,
            password: await bcrypt.hash('admin123', 10),
            role: 'admin'
        });
        console.log('✅ Admin User Created:', adminUser.email);

        console.log('\n--- Test Completed Successfully! ---');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        
        if (error.message.includes('buffering timed out')) {
            console.log('\nTIP: This usually means Network Access (IP Whitelist) is not set to 0.0.0.0/0 in MongoDB Atlas.');
        } else if (error.message.includes('authentication failed')) {
            console.log('\nTIP: Check your password in the .env file.');
        }
        
        process.exit(1);
    }
};

testConnection();
