import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { randomBytes } from 'crypto'
import { config } from '../config/config.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: config.gmailUser,
      pass: config.gmailAppPassword,
    },
  })
}

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  if (!config.gmailUser || !config.gmailAppPassword) {
    console.warn('Gmail not configured, skipping OTP email')
    return false
  }

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: config.emailFrom || config.gmailUser,
      to: email,
      subject: 'WELLDHAN Login OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a4d2e;">WELLDHAN Login Verification</h2>
          <p>Your 6-digit verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; color: #4ade80; text-align: center; padding: 20px; border: 2px solid #4ade80; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    return false
  }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const db = req.app.locals.db || mongoose.connection.db
    let user = null
    let role = null

    // Check admin_users collection first
    const adminUser = await db.collection('admin_users').findOne({ email })
    if (adminUser) {
      const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)
      if (isValidPassword) {
        user = adminUser
        role = 'Admin'
      }
    }

    // Check trainers collection
    if (!user) {
      const trainerUser = await db.collection('trainers').findOne({ email })
      if (trainerUser && trainerUser.is_active) {
        const isValidPassword = await bcrypt.compare(password, trainerUser.password_hash)
        if (isValidPassword) {
          user = trainerUser
          role = 'Trainer'
        }
      }
    }

    // Check communities collection (managers)
    if (!user) {
      const managerUser = await db.collection('communities').findOne({ manager_email: email })
      if (managerUser && managerUser.is_active) {
        const isValidPassword = await bcrypt.compare(password, managerUser.password_hash)
        if (isValidPassword) {
          user = managerUser
          role = 'Manager'
        }
      }
    }

    // Check households collection (users)
    if (!user) {
      const householdUser = await db.collection('households').findOne({ primary_email: email })
      if (householdUser) {
        const isValidPassword = await bcrypt.compare(password, householdUser.password_hash)
        if (isValidPassword) {
          user = householdUser
          role = 'User'
        }
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email' })
    }

    // Generate OTP
    const otp = generateOTP()
    const challengeId = randomBytes(32).toString('hex')

    // Store OTP session (expires in 10 minutes)
    await db.collection('otp_sessions').insertOne({
      challenge_id: challengeId,
      user_id: user.id || user._id.toString(),
      email: email,
      otp: otp,
      role: role,
      used: false,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp)

    // Mask email for response
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3')

    const response = {
      requires_2fa: true,
      challenge_id: challengeId,
      masked_email: maskedEmail,
      role: role,
    }

    // Include OTP in dev mode if email not configured
    if (config.nodeEnv === 'development' && !emailSent) {
      response.otp_dev = otp
    }

    res.json(response)

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { challenge_id, otp } = req.body

    if (!challenge_id || !otp) {
      return res.status(400).json({ error: 'Challenge ID and OTP required' })
    }

    const db = req.app.locals.db || mongoose.connection.db

    // Find OTP session
    const session = await db.collection('otp_sessions').findOne({
      challenge_id: challenge_id,
      used: false,
      expires_at: { $gt: new Date() },
    })

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired OTP session' })
    }

    // Verify OTP
    if (session.otp !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' })
    }

    // Mark session as used
    await db.collection('otp_sessions').updateOne(
      { challenge_id: challenge_id },
      { $set: { used: true } }
    )

    // Get user data
    let userData = null
    const collections = {
      Admin: 'admin_users',
      Trainer: 'trainers',
      Manager: 'communities',
      User: 'households',
    }

    const collection = collections[session.role]
    if (collection) {
      if (session.role === 'Manager') {
        userData = await db.collection(collection).findOne({ manager_email: session.email })
      } else {
        userData = await db.collection(collection).findOne({ email: session.email })
      }
    }

    if (!userData) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Generate JWT
    const expiresIn = session.role === 'Admin' ? config.adminJwtExpiresIn : config.jwtExpiresIn
    const token = jwt.sign(
      {
        userId: userData.id || userData._id.toString(),
        role: session.role,
        email: session.email,
      },
      config.jwtSecret,
      { expiresIn }
    )

    // Clean user data (remove sensitive fields)
    const { password_hash, _id, ...cleanUserData } = userData

    res.json({
      token,
      role: session.role,
      userId: userData.id || userData._id.toString(),
      userData: cleanUserData,
    })

  } catch (error) {
    console.error('OTP verification error:', error)
    res.status(500).json({ error: 'OTP verification failed' })
  }
})

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { full_name, email, password, confirm_password, phone, flat_number, package_id } = req.body

    // Basic validation
    if (!full_name || !email || !password || !confirm_password || !phone || !flat_number) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase and number' })
    }

    const db = req.app.locals.db || mongoose.connection.db

    // Check if email already exists
    const existingHousehold = await db.collection('households').findOne({ primary_email: email })
    if (existingHousehold) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Find first active community
    const community = await db.collection('communities').findOne({ is_active: true })
    if (!community) {
      return res.status(400).json({ error: 'No active communities available' })
    }

    // Find package
    let selectedPackage = null
    if (package_id) {
      selectedPackage = await db.collection('packages').findOne({ id: package_id, is_active: true })
    }
    if (!selectedPackage) {
      // Get default package
      selectedPackage = await db.collection('packages').findOne({ is_active: true })
    }
    if (!selectedPackage) {
      return res.status(400).json({ error: 'No active packages available' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create household
    const householdId = randomBytes(16).toString('hex')
    const householdResult = await db.collection('households').insertOne({
      id: householdId,
      primary_email: email,
      password_hash: passwordHash,
      community_id: community.id,
      flat_number: flat_number,
      package_id: selectedPackage.id,
      is_active: true,
      created_at: new Date(),
      last_login: null,
    })

    // Create primary member
    await db.collection('members').insertOne({
      id: randomBytes(16).toString('hex'),
      household_id: householdId,
      name: full_name,
      email: email,
      phone: phone,
      is_primary: true,
      is_active: true,
      created_at: new Date(),
    })

    // Generate JWT for auto-login
    const token = jwt.sign(
      {
        userId: householdId,
        role: 'User',
        email: email,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    )

    // Get clean user data
    const userData = {
      id: householdId,
      primary_email: email,
      community_id: community.id,
      flat_number: flat_number,
      package_id: selectedPackage.id,
      is_active: true,
      created_at: new Date(),
    }

    res.status(201).json({
      token,
      role: 'User',
      userId: householdId,
      userData,
    })

  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/signup/trainer
router.post('/signup/trainer', async (req, res) => {
  try {
    const { name, email, phone, password, confirm_password, sport, community_id } = req.body

    // Basic validation
    if (!name || !email || !phone || !password || !confirm_password || !sport || !community_id) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase and number' })
    }

    const db = req.app.locals.db || mongoose.connection.db

    // Check if email already exists
    const existingTrainer = await db.collection('trainers').findOne({ email })
    if (existingTrainer) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Check community exists
    const community = await db.collection('communities').findOne({ id: community_id })
    if (!community) {
      return res.status(400).json({ error: 'Invalid community' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create trainer
    await db.collection('trainers').insertOne({
      id: randomBytes(16).toString('hex'),
      name: name,
      email: email,
      phone: phone,
      sport: sport,
      community_id: community_id,
      password_hash: passwordHash,
      is_active: false, // Pending approval
      rating: 0,
      total_sessions: 0,
      created_at: new Date(),
      last_login: null,
    })

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Pending admin approval.',
    })

  } catch (error) {
    console.error('Trainer signup error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/signup/manager
router.post('/signup/manager', async (req, res) => {
  try {
    const {
      manager_name,
      manager_email,
      manager_phone,
      password,
      confirm_password,
      community_id,
      community_name,
      location,
      total_flats,
    } = req.body

    // Basic validation
    if (!manager_name || !manager_email || !manager_phone || !password || !confirm_password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' })
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase and number' })
    }

    const db = req.app.locals.db || mongoose.connection.db

    // Check if email already exists
    const existingManager = await db.collection('communities').findOne({ manager_email })
    if (existingManager) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    if (community_id) {
      // Join existing community
      const community = await db.collection('communities').findOne({ id: community_id })
      if (!community) {
        return res.status(400).json({ error: 'Community not found' })
      }

      if (community.manager_email) {
        return res.status(400).json({ error: 'Community already has a manager' })
      }

      // Update community with manager details
      await db.collection('communities').updateOne(
        { id: community_id },
        {
          $set: {
            manager_name: manager_name,
            manager_email: manager_email,
            manager_phone: manager_phone,
            password_hash: passwordHash,
            is_active: false, // Pending admin approval
            updated_at: new Date(),
          },
        }
      )
    } else {
      // Create new community
      if (!community_name || !location || !total_flats) {
        return res.status(400).json({ error: 'Community details required for new registration' })
      }

      await db.collection('communities').insertOne({
        id: randomBytes(16).toString('hex'),
        name: community_name,
        location: location,
        total_flats: parseInt(total_flats),
        manager_name: manager_name,
        manager_email: manager_email,
        manager_phone: manager_phone,
        password_hash: passwordHash,
        is_active: false, // Pending admin approval
        created_at: new Date(),
        updated_at: new Date(),
      })
    }

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Pending WELLDHAN admin activation.',
    })

  } catch (error) {
    console.error('Manager signup error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const db = req.app.locals.db || mongoose.connection.db
    const { userId, role } = req.user

    let userData = null
    const collections = {
      Admin: 'admin_users',
      Trainer: 'trainers',
      Manager: 'communities',
      User: 'households',
    }

    const collection = collections[role]
    if (collection) {
      if (role === 'Manager') {
        userData = await db.collection(collection).findOne({ manager_email: req.user.email })
      } else {
        userData = await db.collection(collection).findOne({ email: req.user.email })
      }
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Clean user data
    const { password_hash, _id, ...cleanUserData } = userData

    res.json({
      userId,
      role,
      userData: cleanUserData,
    })

  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user data' })
  }
})

export default router