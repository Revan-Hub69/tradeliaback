// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Middleware CORS compatibile con Bubble
app.use(cors({
  origin: "*", // Puoi mettere anche: "https://tradelia.bubbleapps.io"
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload()); // Supporto upload file

// ✅ Logging di tutte le richieste
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// ✅ Rotte API modulari
app.use('/api/chat', require('./routes/chat'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/news', require('./routes/news'));
app.use('/api/scanner', require('./routes/scanner'));
app.use('/api/fundamentals', require('./routes/fundamentals'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/tools', require('./routes/tools'));

// ✅ Catch-all per endpoint non trovati
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// ✅ Avvio server
app.listen(PORT, () => {
  console.log(`✅ Tradelia backend in ascolto sulla porta ${PORT}`);
});
