require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

const invoicesRouter = require('./routes/invoices');
const authRouter = require('./routes/auth');
const clientsRouter = require('./routes/clients');

const app = express();
app.use(cors());
app.use(express.json());

// sessions & passport (for Google OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/invoices', invoicesRouter);
app.use('/api/auth', authRouter);
app.use('/api/clients', clientsRouter);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });
