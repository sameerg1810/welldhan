import jwt from "jsonwebtoken";
import crypto from "crypto";
import { settings } from "./config.js";

/**
 * OAuth 2.0 and OpenID Connect compliant token management
 */

const SECRET_KEY = settings.jwtSecret || "your-secret-key";
const REFRESH_SECRET = settings.refreshSecret || "refresh-secret-key";
const TOKEN_EXPIRY = "15m"; // Access token expires in 15 minutes
const REFRESH_EXPIRY = "7d"; // Refresh token expires in 7 days

/**
 * Generate OAuth 2.0 compliant access token (JWT)
 */
export const generateAccessToken = (userId, role, email) => {
  return jwt.sign(
    {
      sub: userId, // RFC 7519 standard claim
      role,
      email,
      type: "access_token",
      iat: Math.floor(Date.now() / 1000),
    },
    SECRET_KEY,
    { expiresIn: TOKEN_EXPIRY },
  );
};

/**
 * Generate refresh token (stored securely in DB)
 */
export const generateRefreshToken = (userId) => {
  const refreshToken = crypto.randomBytes(32).toString("hex");
  return {
    token: refreshToken,
    hash: crypto.createHash("sha256").update(refreshToken).digest("hex"),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };
};

/**
 * Create OAuth 2.0 token response
 */
export const createTokenResponse = (userId, role, email) => {
  const accessToken = generateAccessToken(userId, role, email);
  const refreshTokenData = generateRefreshToken(userId);

  return {
    access_token: accessToken,
    refresh_token: refreshTokenData.token,
    token_type: "Bearer",
    expires_in: 900, // 15 minutes in seconds
    scope: role.toLowerCase(), // Scope based on role
  };
};

/**
 * Verify and decode access token
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    throw new Error("Invalid token");
  }
};

/**
 * Generate code for PKCE flow (can be used for web auth)
 */
export const generatePKCEChallenge = () => {
  const codeVerifier = crypto.randomBytes(32).toString("hex");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return { codeVerifier, codeChallenge };
};

/**
 * Verify PKCE code challenge
 */
export const verifyPKCEChallenge = (codeVerifier, codeChallenge) => {
  const hash = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return hash === codeChallenge;
};

/**
 * Generate nonce for OpenID Connect
 */
export const generateNonce = () => {
  return crypto.randomBytes(16).toString("hex");
};

/**
 * Create authorization header from credentials (for backward compatibility)
 */
export const createAuthorizationHeader = (token) => {
  return `Bearer ${token}`;
};
