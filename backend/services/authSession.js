const { randomBytes, createHash } = require('node:crypto');
const AuthSession = require('../models/AuthSession');

const cookieName = 'zeal_session';
const day = 24 * 60 * 60 * 1000;
const cookieOptions = req => ({ httpOnly: true, secure: req.secure, sameSite: 'strict', path: '/api' });
const hashToken = token => createHash('sha256').update(token).digest('hex');

const readSessionCookie = (req) => {
  const pair = req.headers.cookie?.split(';').map(value => value.trim())
    .find(value => value.startsWith(cookieName + '='));
  const token = pair?.slice(cookieName.length + 1);
  return /^[a-f0-9]{64}$/.test(token || '') ? token : null;
};

const findCookieSession = (req) => {
  const token = readSessionCookie(req);
  return token ? AuthSession.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }) : null;
};

const revokeCookie = async (req) => {
  const token = readSessionCookie(req);
  if (token) await AuthSession.deleteOne({ tokenHash: hashToken(token) });
};

const setSessionCookie = (req, res, token, session) => {
  res.cookie(cookieName, token, { ...cookieOptions(req), expires: session.expiresAt });
};

const startSession = async (req, res, user) => {
  const token = randomBytes(32).toString('hex');
  const session = await AuthSession.create({
    userId: user._id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + (user.role === 'admin' ? 30 : 180) * day),
  });
  setSessionCookie(req, res, token, session);
  return session;
};

const renewSession = async (req, res, session, user) => {
  if (user.role === 'admin' || session.expiresAt.getTime() - Date.now() > 179 * day) return true;
  const expiresAt = new Date(Date.now() + 180 * day);
  const result = await AuthSession.updateOne(
    { _id: session._id, expiresAt: { $gt: new Date() } }, { expiresAt }
  );
  if (!result.matchedCount) return false;
  setSessionCookie(req, res, readSessionCookie(req), { expiresAt });
  return true;
};

const clearSessionCookie = (req, res) => res.clearCookie(cookieName, cookieOptions(req));

module.exports = { findCookieSession, revokeCookie, startSession, renewSession, clearSessionCookie };
