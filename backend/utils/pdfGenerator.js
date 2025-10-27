const PDFDocument = require('pdfkit');

function generateInvoicePDF(inv) {
  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice #: ${inv.invoiceNumber}`);
  doc.text(`Issue Date: ${inv.issueDate.toDateString()}`);
  if (inv.dueDate) doc.text(`Due Date: ${inv.dueDate.toDateString()}`);
  doc.moveDown();

  doc.text(`Bill To: ${inv.clientName}`);
  if (inv.clientEmail) doc.text(`Email: ${inv.clientEmail}`);
  doc.moveDown();

  // ... more formatting can be added here

  return doc;
}

module.exports = { generateInvoicePDF };
