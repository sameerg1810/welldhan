import app from './app.js';
import { connectDB, closeDB } from './core/db.js';

const PORT = process.env.PORT || 8000;

// Connect to DB
connectDB();

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Shutdown hook
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await closeDB();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
