import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { initInfisical, loadSecrets } from './config/secrets.js'
import { config } from './config/config.js'

// Import routes
import authRoutes from './routes/auth.js'
import householdsRoutes from './routes/households.js'
import membersRoutes from './routes/members.js'
import bookingsRoutes from './routes/bookings.js'
import foodRoutes from './routes/food.js'
import paymentsRoutes from './routes/payments.js'
import slotsRoutes from './routes/slots.js'
import trainersRoutes from './routes/trainers.js'
import communityRoutes from './routes/community.js'
import packagesRoutes from './routes/packages.js'
import dashboardRoutes from './routes/dashboard.js'
import notificationsRoutes from './routes/notifications.js'

const app = express()

const startServer = async () => {
  try {
    // ── STEP 1: Load Infisical secrets FIRST ──────────────────────────
    console.log('🔐 Initializing Infisical...')
    await initInfisical()
    await loadSecrets()
    // After loadSecrets(), ALL secrets are in process.env automatically.

    // ── STEP 2: Connect to MongoDB ────────────────────────────────────
    console.log('🍃 Connecting to MongoDB...')
    await mongoose.connect(config.mongoUrl, {
      dbName: config.dbName,
    })
    console.log('✅ MongoDB connected to welldhan database')

    // ── STEP 3: Express middleware ────────────────────────────────────
    app.use(cors({
      origin: config.frontendUrl,
      credentials: true,
    }))
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // ── STEP 4: Health check ──────────────────────────────────────────
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        app: 'WELLDHAN API',
        environment: config.nodeEnv,
        timestamp: new Date().toISOString(),
      })
    })

    // ── STEP 5: Register all API routes ──────────────────────────────
    app.use('/api/auth', authRoutes)
    app.use('/api/households', householdsRoutes)
    app.use('/api/members', membersRoutes)
    app.use('/api/bookings', bookingsRoutes)
    app.use('/api/food', foodRoutes)
    app.use('/api/payments', paymentsRoutes)
    app.use('/api/slots', slotsRoutes)
    app.use('/api/trainers', trainersRoutes)
    app.use('/api/community', communityRoutes)
    app.use('/api/packages', packagesRoutes)
    app.use('/api/dashboard', dashboardRoutes)
    app.use('/api/notifications', notificationsRoutes)

    // ── STEP 6: Global error handler ─────────────────────────────────
    app.use((err, req, res, next) => {
      console.error('❌ Unhandled error:', err.message)
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
      })
    })

    // ── STEP 7: Start listening ───────────────────────────────────────
    app.listen(config.port, () => {
      console.log(`🚀 WELLDHAN API running on http://localhost:${config.port}`)
      console.log(`📦 Environment: ${config.nodeEnv}`)
    })

  } catch (error) {
    console.error('❌ Failed to start WELLDHAN server:', error.message)
    process.exit(1)
  }
}

startServer()