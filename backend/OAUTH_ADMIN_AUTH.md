# OAuth 2.0 & Admin Authorization Implementation Guide

## Overview

This document describes the OAuth 2.0 and OpenID Connect implementation for the Welldhan application, with special focus on admin login and authorization standards.

## Security Standards Implemented

### 1. OAuth 2.0 Bearer Token (RFC 6750)

- Access tokens are JWT-based and short-lived (15 minutes)
- Refresh tokens are long-lived (7 days) and stored securely
- Token refresh endpoint allows automatic token renewal without user re-authentication

### 2. JWT Token Structure (RFC 7519)

Access tokens include:

- `sub` (subject) - User ID
- `role` - User's role (Admin, User, Trainer, Manager)
- `email` - User's email
- `type` - Token type (access_token)
- `iat` - Issued at timestamp
- `exp` - Expiration timestamp

### 3. Admin Authorization

#### Role-Based Access Control (RBAC)

```javascript
// Three levels of authorization:

1. authenticateOAuth - Validates Bearer token
2. authorizeRoles(['Admin']) - Checks role
3. authorizeAdmin - Admin-only middleware
```

#### Admin-Only Endpoints

```
POST   /api/auth/admin/login        Admin login with 2FA
GET    /api/admin/summary           Dashboard data
POST   /api/admin/reseed            Database seeding
PUT    /api/admin/settings          System configuration
```

## API Endpoints

### Authentication

#### 1. Login with Email/Password

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

Response (requires 2FA):
{
  "requires_2fa": true,
  "challenge_id": "challenge_uuid",
  "masked_phone": "91****5678",
  "sms_sent": true,
  "role": "Admin"
}
```

#### 2. Verify OTP (2FA)

```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "challenge_id": "challenge_uuid",
  "otp": "123456"
}

Response (OAuth 2.0 compliant):
{
  "access_token": "eyJhbGc...",
  "refresh_token": "random_hex_string",
  "token_type": "Bearer",
  "expires_in": 900,
  "scope": "admin",
  "role": "Admin",
  "user_id": "user_uuid",
  "user_data": { /* user details */ }
}
```

#### 3. Refresh Access Token

```
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "random_hex_string"
}

Response:
{
  "access_token": "new_jwt_token",
  "token_type": "Bearer",
  "expires_in": 900,
  "scope": "admin"
}
```

#### 4. Logout

```
POST /api/auth/logout
Authorization: Bearer {access_token}

Response:
{ "message": "Logged out successfully" }
```

## Authorization Flow

### Admin Login Process

```
1. User submits email/password
   ↓
2. Backend validates credentials
   ↓
3. Check if user is Admin
   ↓
4. Generate OTP and send via SMS
   ↓
5. User enters OTP
   ↓
6. Backend validates OTP
   ↓
7. Generate OAuth tokens (access_token, refresh_token)
   ↓
8. Return OAuth response with role/user data
   ↓
9. Client stores tokens securely
   ↓
10. All subsequent requests include: Authorization: Bearer {accessToken}
```

### Authorization Middleware Chain

```javascript
// Example protected route for Admin
router.post(
  "/admin/settings",
  authenticateOAuth, // Step 1: Validate token
  authorizeAdmin, // Step 2: Verify Admin role
  handler, // Step 3: Execute handler
);

// Generic role-based
router.get(
  "/resource",
  authenticateOAuth, // Step 1: Validate token
  authorizeRoles(["Admin", "Manager"]), // Step 2: Check roles
  handler, // Step 3: Execute handler
);
```

## Frontend Implementation

### Auth Store (Zustand)

```typescript
const { token, refreshToken, role, userId, email } = useAuthStore();

// Login
const handleLogin = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  // Handle 2FA...
};

// Verify OTP
const handleVerifyOTP = async (challengeId, otp) => {
  const response = await api.post("/auth/verify-otp", {
    challenge_id: challengeId,
    otp,
  });

  // OAuth response handler
  setOAuthTokens(
    response,
    response.role,
    response.user_id,
    email,
    response.user_data,
  );
};

// Auto-refresh tokens
if (store.isTokenExpired()) {
  // API client automatically refreshes via /auth/refresh endpoint
}
```

### API Client

```typescript
// All requests automatically include Bearer token
api.get("/admin/summary"); // Auto-adds: Authorization: Bearer {token}

// Token refresh happens transparently on 401
// New token stored in AsyncStorage
```

## Error Responses

All errors follow OAuth 2.0 error format:

```json
{
  "error": "invalid_token",
  "error_description": "Token has expired",
  "error_uri": "https://tools.ietf.org/html/rfc6750#section-3.1"
}
```

Common errors:

- `unauthorized` - Missing/invalid token
- `invalid_token` - Token expired or malformed
- `insufficient_scope` - User lacks required permissions
- `forbidden` - Action not allowed for this role

## Security Best Practices

1. **Storage**
   - Access tokens in memory (frontend)
   - Refresh tokens in secure AsyncStorage
   - Never store passwords

2. **Token Transmission**
   - Always use Bearer scheme: `Authorization: Bearer {token}`
   - HTTPS only in production
   - Validate token signature (JWT verify)

3. **Token Expiry**
   - Access tokens: 15 minutes
   - Refresh tokens: 7 days
   - Client checks expiry 1 minute before actual expiry

4. **Admin Specific**
   - 2FA required for admin login
   - Admin actions logged
   - Admin token refresh requires additional verification

5. **CSRF Protection**
   - SameSite cookie attribute on refresh tokens
   - CORS headers properly configured

## Environment Variables

```env
# Backend
JWT_SECRET=your_secret_key_here
REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRE_DAYS=7
OTP_HMAC_SECRET=your_otp_secret_here
TWOFACTOR_API_KEY=your_2fa_provider_key

# Frontend
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
```

## Implementation Checklist

- [x] OAuth middleware (`oauth.js`)
- [x] Admin authorization middleware
- [x] Token refresh endpoint
- [x] Secure token storage (frontend)
- [x] Auto token refresh in API client
- [x] Admin dashboard protection
- [x] OAuth error responses
- [ ] Token revocation/blacklist
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging for admin actions

## Testing Admin Authorization

```bash
# 1. Admin login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# 2. Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"challenge_id":"challenge_id","otp":"123456"}'

# 3. Access admin endpoint
curl -X GET http://localhost:3000/api/admin/summary \
  -H "Authorization: Bearer {access_token}"

# 4. Refresh token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"refresh_token_value"}'
```

## References

- [RFC 6750 - OAuth 2.0 Bearer Token Usage](https://tools.ietf.org/html/rfc6750)
- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html)
- [OWASP OAuth 2.0 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth_2_Cheat_Sheet.html)
