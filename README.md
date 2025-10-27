# Invoice Generator — Full‑Stack MERN Invoice App

A clean, production-minded invoice generator built with the MERN stack.

This project generates server-side PDF invoices (PDFKit), can email them to clients using Nodemailer (Ethereal fallback for development), and includes a responsive React + Vite frontend. It supports JWT-based authentication and per-user invoice isolation.

<img width="813" height="887" alt="1_ip" src="https://github.com/user-attachments/assets/a65c22c2-5df2-43bc-b77b-5f9653aa8a5a" />



<img width="888" height="836" alt="2_ip" src="https://github.com/user-attachments/assets/08629bfb-8f46-4db0-9955-d6a57154cb92" />



<img width="1461" height="877" alt="3_ip" src="https://github.com/user-attachments/assets/2e087d09-e3fc-4423-8994-12c7d1498ecf" />



Features

- Server-side PDF invoice generation (PDFKit)
- Email invoices via Nodemailer (Ethereal preview in dev)
- JWT authentication and per-user invoice access
- Create, edit, download, and email invoices from the UI
- Compact single-page PDF layout with configurable fonts

Tech stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: jsonwebtoken (JWT)
- PDF: PDFKit
- Email: Nodemailer (Ethereal fallback)

Follow these copy-pasteable PowerShell steps to run the project on another Windows machine.

1) Clone the repository

```powershell
cd $env:USERPROFILE\Desktop
git clone https://github.com/TTeerrtthh/Invoice-Generator.git
cd Invoice-Generator
```

2) Backend: install deps and create `.env`

```powershell
cd .\backend
npm install
@'
MONGO_URI=mongodb://localhost:27017/invoice_generator
JWT_SECRET=super_long_secret_here
CLIENT_URL=http://localhost:5173
# Optional SMTP for real email delivery:
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your_smtp_user
# SMTP_PASS=your_smtp_pass
# EMAIL_FROM="Your Company <no-reply@example.com>"
'@ > .env
```

Notes: replace `MONGO_URI` with your Atlas URI if using MongoDB Atlas. Keep `JWT_SECRET` private.

3) Frontend: install deps

```powershell
cd ..\frontend
npm install
```

4) Start backend

```powershell
cd ..\backend
npm run dev
```

You should see logs like "MongoDB connected" and the server listening on port 5000.

5) Start frontend

```powershell
cd ..\frontend
npm run dev
```

Open http://localhost:5173 in your browser.
