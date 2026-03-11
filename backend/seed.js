const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const ActivityLog = require('./models/ActivityLog');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();
        
        // Clear existing
        await User.deleteMany();
        await ActivityLog.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('mahi123', salt);

        const admin = await User.create({
            name: 'Mahendra',
            email: 'mandlamahendravalmiki@gmail.com',
            password: hashedPassword,
            role: 'Admin',
            permissions: {
                read: true,
                write: true,
                update: true,
                delete: true
            }
        });

        await ActivityLog.create({
            action: 'System Init',
            userId: admin._id,
            details: 'Admin user created via seeding'
        });

        console.log('Seeded Admin User: mandlamahendravalmiki@gmail.com / mahi123');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();
