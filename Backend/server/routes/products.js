'use strict';

const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/products?q=&brand=&vram=&min=&max=&sort=
//
// Every value is checked to be a plain string/number before it goes into the
// query. That blocks NoSQL injection such as ?brand[$ne]=x, because an object
// is never allowed through.
router.get('/', wrap(async (req, res) => {
  const { q, brand, vram, min, max, sort } = req.query;
  const filter = {};

  if (typeof q === 'string' && q.trim()) {
    filter.name = { $regex: escapeRegex(q.trim().slice(0, 100)), $options: 'i' };
  }
  if (typeof brand === 'string' && brand) {
    filter.brand = brand;
  }
  if (typeof vram === 'string' && vram !== '' && Number.isFinite(Number(vram))) {
    filter.vram = Number(vram);
  }

  const price = {};
  if (typeof min === 'string' && min !== '' && Number.isFinite(Number(min))) price.$gte = Number(min);
  if (typeof max === 'string' && max !== '' && Number.isFinite(Number(max))) price.$lte = Number(max);
  if (Object.keys(price).length) filter.price = price;

  const order = sort === 'name' ? { name: 1 } : { price: 1 };
  const items = await Product.find(filter).sort(order).limit(100).lean();

  res.json({ items });
}));

module.exports = router;
