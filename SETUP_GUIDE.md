# Quick Setup & Troubleshooting Guide

## Issue Fixed

### Original Error

```
Server Error: Unable to resolve module react-native-css-interop/jsx-runtime
```

### Root Cause

The dependency `react-native-css-interop` was missing from `package.json`. This package is required by nativewind for JSX runtime support.

### Solution Applied

Added `react-native-css-interop@^0.0.34` to frontend dependencies.

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd frontend
yarn install
# or
npm install
```

### Step 2: Clear Cache

```bash
# Clear metro cache
rm -rf .metro-cache
# or on Windows
rmdir /s .metro-cache

# Clear yarn/npm cache
yarn cache clean
# or
npm cache clean --force
```

### Step 3: Start Development Server

```bash
yarn start
# or
npm start

# For Android
yarn android
# or
npm run android

# For iOS
yarn ios
# or
npm run ios

# For Web
yarn web
# or
npm run web
```

## Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Create `.env` file in backend root:

```env
# JWT Configuration
JWT_SECRET=your_strong_secret_key_minimum_32_characters
REFRESH_SECRET=your_refresh_secret_key_minimum_32_characters
JWT_EXPIRE_DAYS=7
JWT_ALGORITHM=HS256

# OTP Configuration
OTP_HMAC_SECRET=your_otp_hmac_secret_key

# 2FA Configuration
TWOFACTOR_API_KEY=your_2fa_api_key_from_provider

# Database
MONGODB_URI=mongodb://localhost:27017/welldhan

# Server
PORT=3000
NODE_ENV=development
```

### Step 3: Start Backend Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

## Testing OAuth Authentication

### Test 1: Admin Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Expected Response:

```json
{
  "requires_2fa": true,
  "challenge_id": "uuid_here",
  "masked_phone": "91****5678",
  "sms_sent": true,
  "role": "Admin"
}
```

### Test 2: Verify OTP

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "challenge_id": "challenge_uuid",
    "otp": "123456"
  }'
```

Expected Response:

```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "random_hex_token",
  "token_type": "Bearer",
  "expires_in": 900,
  "scope": "admin",
  "role": "Admin",
  "user_id": "admin_uuid",
  "user_data": { ... }
}
```

### Test 3: Access Protected Admin Endpoint

```bash
curl -X GET http://localhost:3000/api/admin/summary \
  -H "Authorization: Bearer eyJhbGc..."
```

### Test 4: Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "random_hex_token"
  }'
```

## Common Issues & Solutions

### Issue 1: Module Resolution Error

```
Unable to resolve module react-native-css-interop/jsx-runtime
```

**Solution:**

1. Delete `frontend/node_modules` directory
2. Delete `frontend/yarn.lock` or `frontend/package-lock.json`
3. Run `yarn install` or `npm install`
4. Clear metro cache: `rm -rf .metro-cache`
5. Restart dev server

### Issue 2: Token Expired Error

```
{
  "error": "invalid_token",
  "error_description": "Token has expired"
}
```

**Solution:**

1. Use refresh endpoint with refresh_token
2. Or re-login with email/password
3. Frontend API client handles this automatically

### Issue 3: Admin Access Denied

```
{
  "error": "forbidden",
  "error_description": "Admin access required"
}
```

**Solution:**

1. Verify user role is 'Admin'
2. Check JWT payload contains correct role
3. Ensure admin middleware is applied to route

### Issue 4: CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

1. Check backend CORS configuration in `app.js`
2. Verify `EXPO_PUBLIC_BACKEND_URL` matches API server
3. Ensure proper headers are set

### Issue 5: Token Not Being Stored

**Solution:**

1. Verify AsyncStorage is working
2. Check auth store's `setOAuthTokens()` is called
3. Verify storage key: `welldhan_auth_oauth`
4. Check browser DevTools -> Storage -> AsyncStorage

## File Structure

### Frontend

```
frontend/
  ├── app/
  │   └── (admin)/
  │       └── dashboard.tsx          # Admin dashboard
  ├── src/
  │   ├── api/
  │   │   └── client.ts              # OAuth API client
  │   └── store/
  │       └── authStore.ts           # OAuth token management
  └── package.json                   # Dependencies (updated)
```

### Backend

```
backend/
  ├── app/
  │   ├── core/
  │   │   ├── oauth.js               # NEW: OAuth utilities
  │   │   └── security.js            # Token functions
  │   ├── middleware/
  │   │   ├── auth.js                # Legacy auth
  │   │   └── oauth.js               # NEW: OAuth middleware
  │   ├── models/
  │   │   └── RefreshToken.js        # NEW: Token storage
  │   ├── routes/
  │   │   ├── v1/
  │   │   │   ├── auth.js            # Login/signup
  │   │   │   └── oauth.js           # NEW: Token endpoints
  │   │   └── dashboard.js
  │   └── app.js                     # Updated routes
  ├── OAUTH_ADMIN_AUTH.md            # NEW: OAuth documentation
  └── package.json
```

## Verification Checklist

After setup, verify:

- [ ] Frontend runs without module errors
- [ ] Admin can login with email/password
- [ ] OTP verification works
- [ ] Access token is received in OAuth format
- [ ] Refresh token endpoint works
- [ ] Admin dashboard loads with admin role
- [ ] Token expires correctly (15 minutes)
- [ ] Logout revokes token
- [ ] Auto-logout on session expiration

## Development Tips

### Enable Debug Logging

```typescript
// In frontend API client
if (process.env.DEBUG_API) {
  console.log("API Request:", path, token);
  console.log("API Response:", data);
}
```

### Monitor Token Expiry

```typescript
// In auth store
const remainingTime = (state.tokenExpiresAt - Date.now()) / 1000;
console.log("Token expires in:", remainingTime, "seconds");
```

### Test Token Refresh

```typescript
// Manually trigger refresh
const newToken = await api.post("/auth/refresh", {
  refresh_token: store.refreshToken,
});
```

## Performance Optimization

1. **Caching Strategy**
   - Cache admin summary for 5 minutes
   - Invalidate on data updates
   - Use stale-while-revalidate pattern

2. **Token Refresh**
   - Refresh 1 minute before expiry
   - Cache refreshed token
   - Prevent thundering herd on expiry

3. **Error Handling**
   - Retry on network errors only
   - Don't retry on auth errors
   - Show clear error messages

## Next Steps

1. Update admin login screen to use OAuth responses
2. Add password change functionality
3. Implement token blacklist for immediate logout
4. Add rate limiting on auth endpoints
5. Setup audit logging for admin actions
6. Configure HTTPS for production
7. Add support for multiple admin accounts
8. Implement session management

## Support

For issues or questions:

1. Check this troubleshooting guide
2. Review OAUTH_ADMIN_AUTH.md for API details
3. Check browser console for errors
4. Check backend logs for detailed errors
5. Verify environment variables are set correctly

---

**Last Updated:** March 2026
**Version:** 1.0.0 - OAuth 2.0 Implementation
