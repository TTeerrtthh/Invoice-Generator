:

🧾 Invoice Generator (MERN Stack)

Invoice Generator is a full-stack MERN application that enables authenticated users to create, edit, and manage invoices with ease.
It automatically generates production-ready PDF invoices on the backend using PDFKit, supports email delivery to clients via Nodemailer (with Ethereal for testing), and offers a responsive React + Vite frontend for smooth user interaction.

🚀 Key Features

🔐 JWT Authentication — Secure per-user access to invoices.

🧾 Dynamic Invoice Creation — Add clients, items, taxes, and notes.

📄 PDF Generation — Generate and download invoice PDFs directly from the server.

📧 Email Invoices — Send invoices via email to clients (real or test mode).

⚡ Responsive Frontend — Built with React + Vite + TailwindCSS.

🗄️ Database — MongoDB stores invoices and user data.

🧠 RESTful API — Clean and modular Express.js routes.

🏗️ Tech Stack
Layer	Technology
Frontend	React (Vite), Axios, TailwindCSS
Backend	Node.js, Express.js
Database	MongoDB (Mongoose)
PDF & Email	PDFKit, Nodemailer
Authentication	JWT, bcrypt
Dev Tools	Nodemon, dotenv
⚙️ Setup Instructions

Clone the repository

git clone https://github.com/<your-username>/invoice-generator.git
cd invoice-generator


Install dependencies

cd server && npm install
cd ../invoice-client && npm install


Set up .env in /server

PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key


Run both frontend & backend

# In one terminal
cd server
npm run dev

# In another terminal
cd ../invoice-client
npm run dev


Visit frontend at 👉 http://localhost:5173

📸 Preview

(Add a screenshot or short demo GIF of your UI here.)

🧩 Future Enhancements

Add invoice analytics and charts in dashboard

Multi-currency and tax support

Invoice templates and custom branding
