// src/lib/jwt.js
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ;

console.log("ACCESS_SECRET",ACCESS_SECRET)
if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT secrets missing!');
}

/**
 * Generate an access token (short-lived)
 */
export const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });

/**
 * Generate a refresh token (long-lived)
 */
export const signRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: '30d' });

/**
 * Verify access token
 */
export const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_SECRET);

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET);
