// src/lib/cookies.js
import { serialize } from 'cookie';

const isProd = process.env.NODE_ENV === 'production';

export function setCookie(name, value, options = {}) {
  return serialize(name, value, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    ...options,
  });
}
