'use strict';

/*
 * Runs on the back-end VM. Apache on the front-end VM serves the HTML/CSS/JS
 * and forwards every /api/... request here, so the browser only ever talks to
 * one origin and this server never has to be exposed to the internet.
 *
 * Settings come from environment variables (see .env.example).
 */

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const Product = require('./models/Product');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');

// A few basic security headers.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

// Only accept small JSON bodies.
app.use(express.json({ limit: '10kb' }));

// Quick check that the API and the database are both up.
app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

if (process.env.STATIC_DIR) {
  app.use(express.static(path.resolve(process.env.STATIC_DIR)));
}

// Any other /api path
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Last-resort error handler: never leak internals to the browser.
app.use((err, req, res, next) => {
  if (err && err.status === 400) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

async function start() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB');

  await Product.seedIfEmpty();

  app.listen(PORT, HOST, () => {
    console.log(`API listening on http://${HOST}:${PORT}`);
  });
}

start().catch(err => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
