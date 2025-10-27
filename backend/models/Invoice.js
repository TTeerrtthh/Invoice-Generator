const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  price: Number,
  taxed: { type: Boolean, default: false }
});

const InvoiceSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: { type: String, required: true },
  clientEmail: String,
  clientAddress: String,
  invoiceNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: Date,
  items: [ItemSchema],
  // allow invoice-specific company branding stored per-record
  companyName: String,
  companyAddress: String,
  companyPhone: String,
  companyStreet: String,
  companyWebsite: String,
  notes: String,
  status: { type: String, enum: ['draft','sent','paid'], default: 'draft' },
  total: Number
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
