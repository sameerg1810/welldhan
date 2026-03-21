import request from 'supertest';
import app from '../app/app.js';
import mongoose from 'mongoose';

describe('Health Check', () => {
    it('should return status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });

    it('should return root message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'WELLDHAN API (Node.js/Express)');
    });
});
