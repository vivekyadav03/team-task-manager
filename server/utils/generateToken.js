// utils/generateToken.js
// Utility function to generate JWT tokens

const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for authenticated users
 * @param {string} id - User's MongoDB ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id }, // Payload: store user ID in token
    process.env.JWT_SECRET, // Secret key from environment variables
    {
      expiresIn: '7d', // Token expires in 7 days
    }
  );
};

module.exports = generateToken;
