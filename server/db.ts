import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
    try {
        // Check if already connected
        if (mongoose.connection.readyState === 1) {
            isConnected = true;
            return;
        }

        // If connection is in progress, wait for it
        if (mongoose.connection.readyState === 2) {
            await new Promise((resolve) => {
                mongoose.connection.once('connected', resolve);
                mongoose.connection.once('error', resolve);
            });
            if (mongoose.connection.readyState === 1) {
                isConnected = true;
                return;
            }
        }

        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.warn('⚠️ MONGODB_URI not found. Using in-memory storage (data will be lost on restart).');
            return;
        }

        // Connect with options for serverless
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        isConnected = true;
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        isConnected = false;
        throw error;
    }
};

// Middleware to ensure DB connection before handling requests
export const ensureDB = async () => {
    if (!isConnected || mongoose.connection.readyState !== 1) {
        await connectDB();
    }
};

export default connectDB;
