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

Quick start (development)

1) Backend

```powershell
cd "C:\Users\lalwa\OneDrive\Desktop\IP MERN\invoice-generator\backend"
npm install
# create a .env with MONGO_URI and JWT_SECRET
npm run dev
```

2) Frontend

```powershell
cd "C:\Users\lalwa\OneDrive\Desktop\IP MERN\invoice-generator\client"
npm install
npm run dev
```

Generate a sample PDF (dev helper)

```powershell
cd "C:\Users\lalwa\OneDrive\Desktop\IP MERN\invoice-generator\backend"
node create_sample_invoice.js
```

Environment variables (example)

Create a `.env` in `backend/` with at least:

```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=some_long_random_secret
CLIENT_URL=http://localhost:5173
# Optional: SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT
```

Notes & tips

- If you need the ₹ currency glyph, add a suitable TTF (for example Noto Sans) to `backend/fonts/`. The server already attempts to register `NotoSans-Regular.ttf`, `NotoSans-Bold.ttf`, and `NotoSans-Italic.ttf` if present.
- The repository contains development helper scripts in `backend/` to produce sample PDFs used while tuning the layout.

Contributing

PRs are welcome. For small bug fixes or README tweaks, open a branch, then a PR. For larger features (pagination, tests), open an issue first so we can discuss the approach.

License

MIT — see LICENSE file (add if you want to publish under MIT)

--
If you'd like, I can:
- Add these README changes and commit them locally for you, or
- Initialize the git repo and push to a GitHub repo if you provide the URL or allow me to use `gh` on this machine.
