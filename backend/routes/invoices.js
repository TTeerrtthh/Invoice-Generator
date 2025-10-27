const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// helper: format date as dd/mm/yyyy
function formatDateDMY(d) {
  if (!d) return '';
  const dt = new Date(d);
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

// generate PDF buffer for an invoice (single-page, matches provided reference)
function generateInvoicePDFBuffer(inv) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      // register optional custom fonts from backend/fonts/ if present
      try {
        const fontsDir = path.join(__dirname, '..', 'fonts');
        const reg = (name, file) => {
          const p = path.join(fontsDir, file);
          if (fs.existsSync(p)) doc.registerFont(name, p);
        };
        reg('Custom-Regular', 'NotoSans-Regular.ttf');
        reg('Custom-Bold', 'NotoSans-Bold.ttf');
        reg('Custom-Italic', 'NotoSans-Italic.ttf');
      } catch (e) {
        // ignore font registration errors and fall back to built-in fonts
      }
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // layout constants
      const leftX = 50;
      const midX = 300;
      const rightX = 420;
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 50;

  const locale = process.env.LOCALE || 'en-IN';
  const currency = process.env.CURRENCY || 'INR';
  // Some PDF fonts don't include the rupee glyph; to ensure the currency shows consistently
  // we'll prefix amounts with the currency code (INR) and format the number using en-IN
  const numberFmt = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatCurrency = (v) => `INR ${numberFmt.format(v)}`;

  // draw a top divider line (visual separator) and position headers below it
  // moved up to reduce empty space at top and make header compact
  const dividerY = 80;
  const headerY = dividerY + 6;
  const contentStartY = headerY + 60;

  // draw top horizontal line
  doc.save();
  doc.lineWidth(1).strokeColor('#000000');
  doc.moveTo(margin, dividerY).lineTo(pageWidth - margin, dividerY).stroke();
  doc.restore();

      // determine font family names to use (prefer custom if registered)
      const fontNames = {
        normal: doc._registeredFonts && doc._registeredFonts['Custom-Regular'] ? 'Custom-Regular' : 'Helvetica',
        bold: doc._registeredFonts && doc._registeredFonts['Custom-Bold'] ? 'Custom-Bold' : 'Helvetica-Bold',
        italic: doc._registeredFonts && doc._registeredFonts['Custom-Italic'] ? 'Custom-Italic' : 'Helvetica-Oblique'
      };

          // header
          function drawHeader() {
            // company title on the left (compact)
            doc.font(fontNames.bold).fontSize(14).text(inv.companyName || process.env.COMPANY_NAME || 'Company Name', leftX, headerY);
            // small underline under company title
            const titleWidth = doc.widthOfString(inv.companyName || process.env.COMPANY_NAME || 'Company Name');
            doc.moveTo(leftX, headerY + 16).lineTo(leftX + titleWidth, headerY + 16).stroke();
            doc.font(fontNames.normal).fontSize(9);
            const lines = [];
            if (inv.companyStreet) lines.push(inv.companyStreet);
            if (inv.companyAddress) lines.push(inv.companyAddress);
            if (inv.companyPhone) lines.push('Phone: ' + inv.companyPhone);
            if (inv.companyWebsite) lines.push(inv.companyWebsite);
            if (lines.length) doc.text(lines.join('\n'), leftX, headerY + 20);

            // invoice box on right (compact header block)
            const boxX = rightX;
            const boxW = pageWidth - margin - boxX;
            const boxH = 60;
            doc.rect(boxX, headerY - 6, boxW, boxH).stroke();
            doc.font(fontNames.bold).fontSize(18).text('INVOICE', boxX + 10, headerY - 2);
            doc.font(fontNames.normal).fontSize(9);
            doc.text(`DATE: ${formatDateDMY(inv.issueDate)}`, boxX + 10, headerY + 20);
            // invoice number in bold with a subtle underline
            doc.font(fontNames.bold).text(`INVOICE #: ${inv.invoiceNumber || ''}`, boxX + 10, headerY + 34);
            const invNumWidth = doc.widthOfString(`INVOICE #: ${inv.invoiceNumber || ''}`);
            doc.moveTo(boxX + 10, headerY + 34 + 12).lineTo(boxX + 10 + invNumWidth, headerY + 34 + 12).stroke();
          }

      // bill to box position (kept in outer scope so table can reference it)
      const billToBoxHeight = 80;
      const billToY = headerY + 80;
      // bill to drawer
      function drawBillTo() {
        doc.rect(leftX, billToY, midX - leftX, billToBoxHeight).stroke();
        doc.font(fontNames.bold).fontSize(10).text('BILL TO', leftX + 6, billToY + 6);
        doc.font(fontNames.normal).fontSize(9).text(inv.clientName || 'Client Name', leftX + 6, billToY + 26);
        if (inv.clientAddress) doc.text(inv.clientAddress, leftX + 6, billToY + 42);
        if (inv.clientEmail) doc.text(inv.clientEmail, leftX + 6, billToY + 58);
      }

      // table layout: DESCRIPTION | TAXED | AMOUNT
      const table = {
        x: leftX,
        // position table to start below the bill-to box
        y: billToY + billToBoxHeight + 12,
        width: pageWidth - margin * 2,
        rowHeight: 18,
        taxedWidth: 120,
        amountWidth: 120
      };
      table.descWidth = table.width - (table.taxedWidth + table.amountWidth + 20);

      function drawTableHeader(y) {
        doc.save();
        doc.fillColor('#2E5AAC');
        doc.rect(table.x, y, table.width, table.rowHeight).fill();
        doc.fillColor('#FFFFFF').font(fontNames.bold).fontSize(11);
        doc.text('DESCRIPTION', table.x + 8, y + 5);
        doc.text('TAXED', table.x + table.descWidth + 8, y + 5, { width: table.taxedWidth, align: 'center' });
        doc.text('AMOUNT', table.x + table.descWidth + table.taxedWidth + 8, y + 5, { width: table.amountWidth - 10, align: 'right' });
        doc.restore();
        doc.fillColor('#000000');
      }

      // compute space and maybe compress rows to fit single page
  // leave room for totals/comments/footer; compress rows if needed to fit single page
  const availableHeight = pageHeight - (table.y + 180);
      let rowHeight = table.rowHeight;
      const itemCount = (inv.items || []).length || 0;
      let itemFontSize = 9;
      if (itemCount > 0) {
        const maxRows = Math.floor(availableHeight / rowHeight) || 1;
        if (itemCount > maxRows) {
          rowHeight = Math.max(10, Math.floor(availableHeight / itemCount));
          itemFontSize = Math.max(6, Math.floor(rowHeight - 6));
        }
      }

      // Force single-page: compute how many rows can actually be rendered without creating new pages.
      // Reserve space at the bottom for totals, comments and footer.
      const reservedBottom = 220; // pixels reserved for totals/comments/footer
      const maxRenderableRows = Math.max(0, Math.floor((pageHeight - margin - table.y - reservedBottom) / rowHeight));

      // totals
      const subtotal = (inv.items || []).reduce((s, it) => s + (Number(it.quantity || 1) * Number(it.price || 0)), 0);
      const taxRate = Number(inv.taxRate || 0);
      const taxable = (inv.items || []).reduce((s, it) => s + ((it.taxed ? Number(it.quantity || 1) * Number(it.price || 0) : 0) ), 0);
      const taxAmount = +(taxable * (taxRate / 100));
      const total = Number(inv.total || subtotal + taxAmount);

      // draw everything
      drawHeader();
      drawBillTo();
      drawTableHeader(table.y);
      doc.y = table.y + table.rowHeight;

      let toggle = false;
      const items = inv.items || [];
      const visibleItems = items.slice(0, maxRenderableRows || items.length);
      const omittedCount = Math.max(0, items.length - visibleItems.length);

      // helper: truncate a string so its width (in current font + size) fits maxWidth
      function truncateToWidth(str, maxWidth) {
        if (!str) return '';
        let s = String(str);
        // quick check
        if (doc.widthOfString(s) <= maxWidth) return s;
        // otherwise trim and add ellipsis
        let lo = 0, hi = s.length, mid;
        let best = '';
        while (lo <= hi) {
          mid = Math.floor((lo + hi) / 2);
          const candidate = s.slice(0, mid) + '...';
          if (doc.widthOfString(candidate) <= maxWidth) {
            best = candidate;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
        return best || s.slice(0, Math.max(0, 10)) + '...';
      }

      visibleItems.forEach((item) => {
        const y = doc.y;
        if (toggle) {
          doc.rect(table.x, y, table.width, rowHeight).fill('#F5F7FA');
          doc.fillColor('#000000');
        }
        // description: measure and truncate so it stays on a single line
        doc.font(fontNames.italic).fontSize(itemFontSize);
        const maxDescWidth = table.descWidth - 10;
        const desc = truncateToWidth(item.description || '', maxDescWidth);
        doc.text(desc, table.x + 8, y + 4, { width: maxDescWidth, align: 'left' });
        doc.text(item.taxed ? 'X' : '', table.x + table.descWidth + 8, y + 4, { width: table.taxedWidth, align: 'center' });
        const amt = Number((Number(item.quantity || 1) * Number(item.price || 0)).toFixed(2));
        doc.text(formatCurrency(amt), table.x + table.descWidth + table.taxedWidth + 8, y + 4, { width: table.amountWidth - 10, align: 'right' });
        doc.fillColor('#000000');
        doc.y += rowHeight;
        toggle = !toggle;
      });

      // If there are more items than fit on the first page, add a small truncated indicator
      if (omittedCount > 0) {
        doc.font(fontNames.italic).fontSize(8).fillColor('#555').text(`+${omittedCount} more item(s) omitted`, table.x + 8, doc.y + 6);
        doc.fillColor('#000000');
        doc.y += 14;
      }

      // Ensure we never render beyond the first page: clamp current y to a safe bottom limit
      const pageBottomLimit = pageHeight - margin - 160; // keep room for totals/comments/footer
      if (doc.y > pageBottomLimit) doc.y = pageBottomLimit;

      // totals block on right
  // totals block on right
  const totalsX = table.x + table.width - 180;
  let totalsY = Math.min(doc.y + 8, pageBottomLimit);
  doc.font(fontNames.normal).fontSize(9);
  doc.text('Subtotal', totalsX, totalsY, { width: 100, align: 'left' });
  doc.text(formatCurrency(subtotal), totalsX + 100, totalsY, { width: 80, align: 'right' });
  doc.text('Taxable', totalsX, totalsY + 14, { width: 100, align: 'left' });
  doc.text(formatCurrency(taxable), totalsX + 100, totalsY + 14, { width: 80, align: 'right' });
  doc.text(`Tax (${taxRate}% )`, totalsX, totalsY + 28, { width: 100, align: 'left' });
  doc.text(formatCurrency(taxAmount), totalsX + 100, totalsY + 28, { width: 80, align: 'right' });
  doc.font(fontNames.bold).text('TOTAL', totalsX, totalsY + 48, { width: 100, align: 'left' });
  doc.text(formatCurrency(total), totalsX + 100, totalsY + 48, { width: 80, align: 'right' });

      // other comments box with blue border
    // other comments box with blue border (slightly reduced height)
    const commentsHeight = 80;
    const commentsY = Math.min(totalsY, pageHeight - margin - commentsHeight - 80);
    doc.save();
    doc.lineWidth(1).strokeColor('#2E5AAC');
    doc.rect(leftX, commentsY, midX - leftX, commentsHeight).stroke();
    doc.restore();
  doc.font(fontNames.bold).fontSize(10).text('OTHER COMMENTS', leftX + 6, commentsY + 6);
  // use justified text for comments but limit height so it doesn't flow to extra pages
  doc.font(fontNames.normal).fontSize(9).text(inv.notes || '1. Total payment due in 30 days\n2. Please include the invoice number on your check', leftX + 6, commentsY + 24, { width: midX - leftX - 12, align: 'justify', height: Math.max(0, commentsHeight - 28), ellipsis: true });

    // footer removed per user request (no contact/thank-you lines)

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Protect all invoice routes
router.use(auth);

// Create invoice
router.post('/', async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.total && data.items) {
      data.total = data.items.reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.price || 0)), 0);
    }
    data.owner = req.user.id;
    const invoice = new Invoice(data);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all invoices for authenticated user
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find({ owner: req.user.id }).sort({ issueDate: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    if (inv.owner && inv.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate PDF and stream as download
router.get('/:id/pdf', async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    if (inv.owner && inv.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const buffer = await generateInvoicePDFBuffer(inv);
    res.setHeader('Content-disposition', `attachment; filename=invoice-${inv.invoiceNumber || inv._id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Send invoice PDF to client email via nodemailer
router.post('/:id/email', async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    if (inv.owner && inv.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    if (!inv.clientEmail) return res.status(400).json({ message: 'Invoice does not have a client email' });

    // generate PDF buffer
    const pdfBuffer = await generateInvoicePDFBuffer(inv);

    // create transporter from env; fallback to Ethereal test account when no SMTP configured
    let transporter;
    let usingTestAccount = false;
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
    } else {
      // create a test account (Ethereal) for development/demo
      usingTestAccount = true;
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com',
      to: inv.clientEmail,
      subject: `Invoice ${inv.invoiceNumber || ''}`,
      text: `Please find attached invoice ${inv.invoiceNumber || ''}.`,
      attachments: [
        {
          filename: `invoice-${inv.invoiceNumber || inv._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);

    const result = { message: 'Email sent' };
    if (usingTestAccount) {
      result.preview = nodemailer.getTestMessageUrl(info) || null;
      result.info = info;
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update invoice (owners only)
router.put('/:id', async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    if (inv.owner && inv.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    // merge allowed fields from body
    const allowed = ['invoiceNumber','issueDate','clientName','clientEmail','clientAddress','items','total','companyName','companyAddress','companyStreet','companyCity','companyZip','companyWebsite','companyPhone','notes','taxRate'];
    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) inv[k] = req.body[k];
    });

    await inv.save();
    res.json(inv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
