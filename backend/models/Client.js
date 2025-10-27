const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  address: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);
