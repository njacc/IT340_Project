'use strict';

const crypto = require('crypto');
const express = require('express');
const User = require('../models/User');
const Session = require('../models/Session');
const { hashPassword, verifyPassword, DUMMY_HASH } = require('../utils/password');

const router = express.Router();

const COOKIE_NAME = 'gs_session';
const SESSION_DAYS = 7;
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';
const REQUIRE_VERIFICATION = process.env.REQUIRE_VERIFICATION === 'true';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_RE = /^[a-f0-9]{64}$/;

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

/* ---------- helpers ---------- */

// Email and password must be plain strings. If someone sends an object such as
// {"$ne": ""}, it is rejected here, so it can never reach a database query.
function cleanCredentials(body) {
  const { email, password } = body || {};
  if (typeof email !== 'string' || typeof password !== 'string') return null;
  return { email: email.trim().toLowerCase(), password };
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

function setSessionCookie(res, token) {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',                      // JavaScript in the page can't read it
    'SameSite=Lax',
    `Max-Age=${SESSION_DAYS * 24 * 60 * 60}`
  ];
  if (COOKIE_SECURE) parts.push('Secure');  // turn on once the site uses HTTPS
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

async function currentUser(req) {
  const token = readCookie(req, COOKIE_NAME);
  if (!token || !TOKEN_RE.test(token)) return null;

  const session = await Session.findOne({
    tokenHash: sha256(token),
    expiresAt: { $gt: new Date() }
  });
  if (!session) return null;

  return User.findById(session.userId);
}

/* ---------- POST /api/auth/register ---------- */
router.post('/register', wrap(async (req, res) => {
  const creds = cleanCredentials(req.body);

  if (!creds || creds.email.length > 254 || !EMAIL_RE.test(creds.email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  // bcrypt only uses the first 72 bytes, so that is the upper limit.
  if (creds.password.length < 8 || Buffer.byteLength(creds.password) > 72) {
    return res.status(400).json({ error: 'Password must be 8 to 72 characters' });
  }

  const verifyToken = crypto.randomBytes(32).toString('hex');

  try {
    await User.create({
      email: creds.email,
      passwordHash: await hashPassword(creds.password),
      verifyTokenHash: sha256(verifyToken)
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }
    throw err;
  }

  // Sending email is Milestone 3. Until then the link is printed here so the
  // verify flow can still be tested. (Never print passwords.)
  console.log(`[verify] ${creds.email} -> /verify.html?token=${verifyToken}`);

  res.status(201).json({ ok: true });
}));

/* ---------- POST /api/auth/login ---------- */
router.post('/login', wrap(async (req, res) => {
  const creds = cleanCredentials(req.body);
  if (!creds) {
    return res.status(400).json({ error: 'Please enter your email and password.' });
  }

  const user = await User.findOne({ email: creds.email });

  // Always run a password check, even when the user doesn't exist.
  const ok = await verifyPassword(creds.password, user ? user.passwordHash : DUMMY_HASH);

  // Same message for "no such email" and "wrong password".
  if (!user || !ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  if (REQUIRE_VERIFICATION && !user.verified) {
    return res.status(403).json({ error: 'Please verify your email before logging in' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  await Session.create({
    tokenHash: sha256(token),
    userId: user._id,
    expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  });

  setSessionCookie(res, token);
  res.json({ email: user.email });
}));

/* ---------- GET /api/auth/me ---------- */
router.get('/me', wrap(async (req, res) => {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ error: 'Not logged in' });
  res.json({ email: user.email });
}));

/* ---------- POST /api/auth/logout ---------- */
router.post('/logout', wrap(async (req, res) => {
  const token = readCookie(req, COOKIE_NAME);
  if (token && TOKEN_RE.test(token)) {
    await Session.deleteOne({ tokenHash: sha256(token) });
  }
  clearSessionCookie(res);
  res.json({ ok: true });
}));

/* ---------- GET /api/auth/verify/:token ---------- */
router.get('/verify/:token', wrap(async (req, res) => {
  const token = req.params.token;
  if (!TOKEN_RE.test(token)) {
    return res.status(400).json({ error: 'Invalid or expired verification link' });
  }

  const user = await User.findOneAndUpdate(
    { verifyTokenHash: sha256(token) },
    { verified: true, verifyTokenHash: null }
  );
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification link' });
  }

  res.json({ ok: true });
}));

module.exports = router;
