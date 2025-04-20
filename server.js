// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware base
app.use(cors());
app.use(express.json());
app.use(fileUpload()); // per upload file
app.use(express.urlencoded({ extended: true }));

// Logging semplice (può essere migliorato)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// Rotte API (le creiamo nei prossimi step)
app.use('/api/chat', require('./routes/chat'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/news', require('./routes/news'));
app.use('/api/scanner', require('./routes/scanner'));
app.use('/api/fundamentals', require('./routes/fundamentals'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/tools', require('./routes/tools'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Tradelia backend in ascolto sulla porta ${PORT}`);
});

