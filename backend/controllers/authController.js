const User = require('../models/User');
const AuthSession = require('../models/AuthSession');
const generateToken = require('../utils/generateToken');
const { findLegacyUser, readAccessToken } = require('../middleware/authMiddleware');
const { findCookieSession, revokeCookie, startSession, renewSession, clearSessionCookie } = require('../services/authSession');
const { detectLocation } = require('../services/locationService');
const { getExchangeRate } = require('../services/currencyService');

const profile = user => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

const signIn = async (req, res, user) => {
  await revokeCookie(req);
  const session = await startSession(req, res, user);
  res.set('Cache-Control', 'no-store');
  return { ...profile(user), token: generateToken(user.id, session.id) };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
    });

    if (user) {
      res.status(201).json(await signIn(req, res, user));
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // 1. Detect client IP
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
      
      // 2. Fetch location details
      const locationData = await detectLocation(ip);
      
      // 3. Fetch live exchange rate
      const exchangeRate = await getExchangeRate(locationData.currency);
      
      // 4. Update user with last login location data
      user.lastLoginCountry = locationData.country;
      user.lastLoginCountryCode = locationData.countryCode;
      user.lastLoginCurrency = locationData.currency;
      user.lastLoginCurrencySymbol = locationData.currencySymbol;
      user.lastLoginTimezone = locationData.timezone;
      await user.save();

      // 5. Complete login and return payload
      res.json({
        ...await signIn(req, res, user),
        location: {
          ...locationData,
          exchangeRate: exchangeRate || 1
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  await revokeCookie(req);
  const token = readAccessToken(req);
  if (token?.sid) await AuthSession.deleteOne({ _id: token.sid, userId: token.id });
  clearSessionCookie(req, res);
  res.status(200).json({ message: 'Logged out successfully' });
};

const restoreSession = async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const session = await findCookieSession(req);
  if (session) {
    const user = await User.findById(session.userId).select('-password');
    if (user && await renewSession(req, res, session, user)) {
      return res.json({ ...profile(user), token: generateToken(user.id, session.id) });
    }
  } else {
    // Existing browsers can exchange their still-valid token on their first visit.
    const legacyUser = await findLegacyUser(req);
    if (legacyUser) return res.json(await signIn(req, res, legacyUser));
  }
  clearSessionCookie(req, res);
  return res.status(401).json({ message: 'Please sign in to continue.' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  res.json(profile(req.user));
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    // Generate a simple token (normally would use crypto to generate a random string)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Respond with the token. In a real app, send an email.
    res.status(200).json({
      message: 'Password reset token generated. In a real app, this would be emailed.',
      resetToken: resetToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordChangedAt = new Date();

    await user.save();
    await AuthSession.deleteMany({ userId: user.id });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, authUser, logoutUser, restoreSession, getUserProfile, forgotPassword, resetPassword };
