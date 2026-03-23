import { verifyAccessToken } from "../core/oauth.js";

/**
 * OAuth 2.0 compliant middleware to verify and extract user context
 * Validates Bearer token as per RFC 6750
 */
export const authenticateOAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        error: "unauthorized",
        error_description: "Missing authorization header",
        error_uri: "https://tools.ietf.org/html/rfc6750#section-3.1",
      });
    }

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "invalid_request",
        error_description: "Authorization header must use Bearer scheme",
        error_uri: "https://tools.ietf.org/html/rfc6750#section-2.1",
      });
    }

    const token = authorization.split(" ")[1];
    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email,
      scope: decoded.role.toLowerCase(),
    };

    next();
  } catch (error) {
    const statusCode = error.message === "Token expired" ? 401 : 401;
    return res.status(statusCode).json({
      error:
        error.message === "Token expired" ? "invalid_token" : "unauthorized",
      error_description: error.message,
      error_uri: "https://tools.ietf.org/html/rfc6750#section-3.1",
    });
  }
};

/**
 * Authorization middleware for role-based access control (RBAC)
 * Ensures user has required role/scope
 */
export const authorizeRoles = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "unauthorized",
        error_description: "Authentication required",
      });
    }

    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "insufficient_scope",
        error_description: `This operation requires one of the following roles: ${requiredRoles.join(", ")}`,
        required_roles: requiredRoles,
      });
    }

    next();
  };
};

/**
 * Admin-only authorization middleware
 * Strict check for Admin role
 */
export const authorizeAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "unauthorized",
      error_description: "Authentication required",
    });
  }

  if (req.user.role !== "Admin") {
    return res.status(403).json({
      error: "forbidden",
      error_description: "Admin access required",
      required_role: "Admin",
      user_role: req.user.role,
    });
  }

  next();
};

/**
 * Middleware to check if user owns the resource
 * Prevents users from accessing other users' data
 */
export const authorizeResourceOwner = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "unauthorized",
        error_description: "Authentication required",
      });
    }

    // Admins can access all resources
    if (req.user.role === "Admin") {
      return next();
    }

    // Other users can only access their own data
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({
        error: "forbidden",
        error_description: "You do not have permission to access this resource",
        user_id: req.user.id,
        resource_owner: resourceUserId,
      });
    }

    next();
  };
};

/**
 * Middleware for scope-based access control
 * More granular than role-based (e.g., read:users, write:payments)
 */
export const authorizeScope = (requiredScopes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "unauthorized",
        error_description: "Authentication required",
      });
    }

    // Admin has all scopes
    if (req.user.role === "Admin") {
      return next();
    }

    if (!Array.isArray(requiredScopes)) {
      requiredScopes = [requiredScopes];
    }

    // For now, scope maps to role
    const userScopes = [req.user.scope];

    const hasRequiredScope = requiredScopes.some((scope) =>
      userScopes.includes(scope),
    );

    if (!hasRequiredScope) {
      return res.status(403).json({
        error: "insufficient_scope",
        error_description: `This operation requires one of the following scopes: ${requiredScopes.join(", ")}`,
        required_scopes: requiredScopes,
        user_scopes: userScopes,
      });
    }

    next();
  };
};

/**
 * Legacy middleware for backward compatibility
 * Maps old getCurrentUser to new OAuth middleware
 */
export const getCurrentUser = authenticateOAuth;

/**
 * Legacy middleware that supports old API
 * Maps old requireRoles to new authorizeRoles
 */
export const requireRoles = authorizeRoles;
