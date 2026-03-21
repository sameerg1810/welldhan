import mongoose from 'mongoose';
import { settings } from './config.js';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const db = await mongoose.connect(settings.mongoUrl, {
            dbName: settings.dbName,
        });
        isConnected = true;
        console.log(`MongoDB Connected: ${db.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export const getDB = () => mongoose.connection.db;

export const closeDB = async () => {
    if (isConnected) {
        await mongoose.connection.close();
        isConnected = false;
        console.log('MongoDB connection closed');
    }
};
