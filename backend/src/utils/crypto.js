const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const hashPassword = async (plain) => bcrypt.hash(plain, 10);
const comparePassword = async (plain, hash) => bcrypt.compare(plain, hash);

const makeJWT = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

const verifyJWT = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const generateResetToken = () =>
  crypto.randomBytes(24).toString('hex');

module.exports = {
  hashPassword,
  comparePassword,
  makeJWT,
  verifyJWT,
  generateOtp,
  generateResetToken
};
