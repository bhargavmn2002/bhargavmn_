// const jwt = require('jsonwebtoken');

// exports.requireAuth = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Authorization token missing' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // { userId, role }
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ requireAuth: No authorization header or invalid format');
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      console.error('❌ requireAuth: Token is empty');
      return res.status(401).json({ message: 'Unauthorized - Invalid token format' });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check token age (optional additional security)
      const tokenAge = Date.now() / 1000 - decoded.iat;
      const maxAge = 24 * 60 * 60; // 24 hours in seconds
      
      if (tokenAge > maxAge) {
        console.error('❌ requireAuth: Token expired (age check)', { tokenAge, maxAge });
        return res.status(401).json({ message: 'Token expired' });
      }
      
      // Fetch full user data from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id || decoded.userId },
        include: {
          clientProfile: true,
        },
      });

      if (!user) {
        console.error('❌ requireAuth: User not found in database', { decodedId: decoded.id || decoded.userId });
        return res.status(401).json({ message: 'User not found' });
      }

      if (!user.isActive) {
        console.error('❌ requireAuth: User account is inactive', { userId: user.id, email: user.email });
        return res.status(403).json({ message: 'User account is inactive' });
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        staffRole: user.staffRole,
        clientProfile: user.clientProfile,
        managedByClientAdminId: user.managedByClientAdminId,
      };

      // Only log authentication for non-polling endpoints
      const isPollingEndpoint = req.path.includes('/heartbeat') || 
                               req.path.includes('/config') || 
                               req.path.includes('/check-status');
      
      if (!isPollingEndpoint && process.env.NODE_ENV !== 'production') {
        console.log('✅ User authenticated:', user.email, user.role);
      }

      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        console.error('❌ Token expired');
        return res.status(401).json({ message: 'Token expired' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        console.error('❌ Invalid token');
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        console.error('❌ Token verification failed');
        return res.status(401).json({ message: 'Token verification failed' });
      }
    }
  } catch (error) {
    console.error('❌ requireAuth: Authentication error', { error: error.message, stack: error.stack });
    return res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Middleware to require SUPER_ADMIN role
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    console.error('❌ requireSuperAdmin: No user in request');
    return res.status(401).json({ message: 'Authentication required' });
  }

  console.log('🔍 requireSuperAdmin check:', {
    userId: req.user.id,
    email: req.user.email,
    role: req.user.role,
    endpoint: req.path
  });

  if (req.user.role !== 'SUPER_ADMIN') {
    console.error('❌ requireSuperAdmin: User does not have SUPER_ADMIN role', {
      userId: req.user.id,
      currentRole: req.user.role
    });
    return res.status(403).json({ message: 'Forbidden: Requires SUPER_ADMIN role' });
  }

  console.log('✅ requireSuperAdmin: Access granted');
  next();
};

/**
 * Middleware to require any admin role (SUPER_ADMIN, CLIENT_ADMIN, USER_ADMIN)
 */
const requireAnyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const allowedRoles = ['SUPER_ADMIN', 'CLIENT_ADMIN', 'USER_ADMIN'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      message: `Forbidden: Requires one of these roles: ${allowedRoles.join(', ')}` 
    });
  }

  next();
};

/**
 * Middleware to require content management access
 * - SUPER_ADMIN (full access)
 * - USER_ADMIN (full)
 * - STAFF with staffRole CONTENT_MANAGER or BROADCAST_MANAGER
 */
const requireContentManagement = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'USER_ADMIN') {
    return next();
  }

  if (
    req.user.role === 'STAFF' &&
    (req.user.staffRole === 'CONTENT_MANAGER' || req.user.staffRole === 'BROADCAST_MANAGER')
  ) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden: Content management access required' });
};

/**
 * Middleware to allow content viewing access (read-only)
 * - USER_ADMIN (full)
 * - STAFF with staffRole CONTENT_MANAGER, BROADCAST_MANAGER, or CMS_VIEWER
 */
const requireContentViewAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role === 'USER_ADMIN') {
    return next();
  }

  if (
    req.user.role === 'STAFF' &&
    (req.user.staffRole === 'CONTENT_MANAGER' || 
     req.user.staffRole === 'BROADCAST_MANAGER' || 
     req.user.staffRole === 'CMS_VIEWER')
  ) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden: Content viewing access required' });
};

module.exports = { requireAuth, requireSuperAdmin, requireAnyAdmin, requireContentManagement, requireContentViewAccess };
