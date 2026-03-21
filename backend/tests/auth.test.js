import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app/app.js';
import Community from '../app/models/Community.js';
import Package from '../app/models/Package.js';
import Household from '../app/models/Household.js';

let mongoServer;

describe('Auth API', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await Community.deleteMany({});
        await Package.deleteMany({});
        await Household.deleteMany({});
        
        // Setup initial data
        await Community.create({
            id: 'comm-1',
            name: 'Test Community',
            manager_name: 'Manager',
            manager_phone: '1234567890',
            manager_email: 'manager@test.com',
            passwordHash: 'hash',
            address: 'Addr',
            city: 'City',
            pincode: '123456'
        });

        await Package.create({
            id: 'pkg-1',
            name: 'Sport Basic',
            description: 'Basic Package',
            price: 1000,
            duration_days: 30,
            is_active: true
        });
    });

    it('should signup a new user', async () => {
        const signupData = {
            full_name: 'Test User',
            email: 'test@user.com',
            password: 'password123',
            confirm_password: 'password123',
            phone: '9876543210',
            flat_number: 'A-101'
        };

        const res = await request(app)
            .post('/api/v1/signup')
            .send(signupData);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user_id');
        expect(res.body.role).toEqual('User');
    });

    it('should fail signup with mismatched passwords', async () => {
        const signupData = {
            full_name: 'Test User',
            email: 'test@user.com',
            password: 'password123',
            confirm_password: 'wrongpassword',
            phone: '9876543210',
            flat_number: 'A-101'
        };

        const res = await request(app)
            .post('/api/v1/signup')
            .send(signupData);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Passwords do not match');
        expect(res.body.detail).toEqual('Passwords do not match');
    });
});
