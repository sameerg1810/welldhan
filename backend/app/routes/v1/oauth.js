import express from "express";
import crypto from "crypto";
import { verifyPassword, hashPassword } from "../../core/security.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
} from "../../core/oauth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { authenticateOAuth, authorizeAdmin } from "../../middleware/oauth.js";
import Admin from "../../models/Admin.js";
import RefreshTokenModel from "../../models/RefreshToken.js";

const router = express.Router();
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * OAuth 2.0 Token Refresh Endpoint
 * Exchanges a refresh token for a new access token
 */
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "refresh_token is required",
      });
    }

    try {
      // Hash the refresh token
      const tokenHash = crypto
        .createHash("sha256")
        .update(refresh_token)
        .digest("hex");

      // Find refresh token in database
      const storedToken = await RefreshTokenModel.findOne({
        tokenHash,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      if (!storedToken) {
        return res.status(401).json({
          error: "invalid_token",
          error_description: "Invalid or expired refresh token",
          error_uri: "https://tools.ietf.org/html/rfc6750#section-3.1",
        });
      }

      // Get user data
      const user = await Admin.findOne({ id: storedToken.userId });
      if (!user) {
        return res.status(401).json({
          error: "invalid_token",
          error_description: "User not found",
        });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(
        user.id,
        user.role || "Admin",
        user.email,
      );

      res.json({
        access_token: newAccessToken,
        token_type: "Bearer",
        expires_in: 900, // 15 minutes
        scope: (user.role || "Admin").toLowerCase(),
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({
        error: "server_error",
        error_description: "Failed to refresh token",
      });
    }
  }),
);

/**
 * Logout/Revoke Token Endpoint
 * Revokes the refresh token on the server
 */
router.post(
  "/logout",
  authenticateOAuth,
  asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;

    if (refresh_token) {
      try {
        const tokenHash = crypto
          .createHash("sha256")
          .update(refresh_token)
          .digest("hex");
        await RefreshTokenModel.updateOne(
          { tokenHash },
          { isRevoked: true, revokedAt: new Date() },
        );
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    res.json({ message: "Logged out successfully" });
  }),
);

/**
 * Admin-specific change password endpoint
 * Requires authentication and admin role
 */
router.post(
  "/admin/change-password",
  authenticateOAuth,
  authorizeAdmin,
  asyncHandler(async (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;
    const adminId = req.user.id;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "All password fields are required",
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Passwords do not match",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Password must be at least 6 characters",
      });
    }

    const admin = await Admin.findOne({ id: adminId });
    if (!admin) {
      return res.status(404).json({
        error: "not_found",
        error_description: "Admin user not found",
      });
    }

    // Verify current password
    const isValid = await verifyPassword(current_password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        error: "unauthorized",
        error_description: "Current password is incorrect",
      });
    }

    // Update password
    admin.passwordHash = await hashPassword(new_password);
    await admin.save();

    res.json({ message: "Password changed successfully" });
  }),
);

/**
 * OAuth 2.0 Token Introspection Endpoint
 * Validates and returns information about an access token
 */
router.post(
  "/token/introspect",
  asyncHandler(async (req, res) => {
    const { token } = req.body;
    const clientId = req.headers["x-client-id"];

    if (!token) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "token parameter is required",
      });
    }

    try {
      const decoded = verifyAccessToken(token);
      res.json({
        active: true,
        scope: decoded.role.toLowerCase(),
        client_id: clientId,
        username: decoded.email,
        token_type: "Bearer",
        exp: decoded.exp,
        iat: decoded.iat,
        sub: decoded.sub,
        role: decoded.role,
        email: decoded.email,
      });
    } catch (error) {
      res.json({
        active: false,
        error:
          error.message === "Token expired" ? "token_expired" : "invalid_token",
      });
    }
  }),
);

export default router;
