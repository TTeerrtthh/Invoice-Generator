const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/invoices';
  // Mongoose v6+ no longer requires useNewUrlParser/useUnifiedTopology options
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = connectDB;
