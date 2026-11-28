const jwt = require('jsonwebtoken');

const generateToken = (id, sessionId) => {
  return jwt.sign({ id, sid: sessionId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
