const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuthSession = require('../models/AuthSession');
const { findCookieSession } = require('../services/authSession');

const readAccessToken = (req, options) => {
  const token = req.headers.authorization?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], ...options });
  } catch {
    return null;
  }
};

const findLegacyUser = async (req) => {
  const decoded = readAccessToken(req);
  if (!decoded?.id || decoded.sid) return null;
  const user = await User.findById(decoded.id).select('-password');
  if (!user || (user.passwordChangedAt && decoded.iat <= Math.floor(user.passwordChangedAt.getTime() / 1000))) return null;
  return user;
};

const protect = async (req, res, next) => {
  try {
    const decoded = readAccessToken(req);
    if (decoded?.sid) {
      const session = await AuthSession.exists({ _id: decoded.sid, userId: decoded.id, expiresAt: { $gt: new Date() } });
      if (session) req.user = await User.findById(decoded.id).select('-password');
    } else if (decoded) {
      req.user = await findLegacyUser(req);
    } else {
      const session = await findCookieSession(req);
      // A tab with an expired bearer can continue only with its matching cookie.
      const stale = req.headers.authorization && readAccessToken(req, { ignoreExpiration: true });
      if (session && (!req.headers.authorization || stale?.sid === session.id)) {
        req.user = await User.findById(session.userId).select('-password');
      }
    }
    if (!req.user) return res.status(401).json({ message: 'Please sign in to continue.' });
    next();
  } catch (error) {
    next(error);
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin, findLegacyUser, readAccessToken };
