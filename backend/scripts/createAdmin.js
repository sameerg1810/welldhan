import 'dotenv/config'
import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'
import { randomUUID } from 'crypto'
import { initInfisical, loadSecrets } from '../app/config/secrets.js'

const createAdmin = async () => {
  try {
    console.log('🔐 Connecting to Infisical...')
    await initInfisical()
    await loadSecrets()

    console.log('🍃 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGO_URL, { dbName: process.env.DB_NAME || 'welldhan_db' })

    const db = mongoose.connection.db
    const collection = db.collection('admin_users')

    // Check if admin already exists
    const existing = await collection.findOne({
      email: process.env.ADMIN_EMAIL,
    })

    if (existing) {
      console.log(`⚠️  Admin already exists: ${process.env.ADMIN_EMAIL}`)
      console.log('   To reset password, delete the admin document and re-run.')
      await mongoose.connection.close()
      process.exit(0)
    }

    // Hash password with bcryptjs (cost factor 12)
    const passwordHash = await bcryptjs.hash(process.env.ADMIN_PASSWORD, 12)

    // Insert admin document
    const result = await collection.insertOne({
      id: randomUUID(),
      email: process.env.ADMIN_EMAIL,
      password_hash: passwordHash,
      name: 'WELLDHAN Admin',
      phone: process.env.MANAGER_PHONE || '9999999999',
      role: 'Admin',
      is_active: true,
      created_at: new Date(),
      last_login: null,
    })

    console.log(`✅ Admin account created successfully`)
    console.log(`   Email: ${process.env.ADMIN_EMAIL}`)
    console.log(`   ID: ${result.insertedId}`)
    console.log(`   Login at: /login (same page as all users)`)
    
    await mongoose.connection.close()
    process.exit(0)

  } catch (error) {
    console.error('❌ Failed to create admin:', error.message)
    process.exit(1)
  }
}

createAdmin()
