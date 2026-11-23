'use strict';

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  brand: { type: String, required: true },
  vram: { type: Number, required: true }   // in GB, e.g. 8
});

// Fill the collection with the starter cards the first time the API runs.
productSchema.statics.seedIfEmpty = async function () {
  if ((await this.estimatedDocumentCount()) > 0) return;

  await this.insertMany([
    { name: 'NVIDIA GeForce RTX 3050 VENTUS 2X 6G OC', image: 'Graphic1.png', price: 279.99, brand: 'NVIDIA', vram: 6 },
    { name: 'AMD GIGABYTE Radeon RX 9060 XT GAMING OC', image: 'Graphic2.png', price: 459.99, brand: 'AMD', vram: 8 },
    { name: 'Intel Arc B570 Challenger', image: 'Graphic3.png', price: 307.49, brand: 'Intel', vram: 10 }
  ]);
  console.log('Seeded starter products');
};

module.exports = mongoose.model('Product', productSchema);
