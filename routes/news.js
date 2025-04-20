// routes/news.js
const express = require('express');
const router = express.Router();
const { fetchNews } = require('../services/newsFetcher');

router.get('/', async (req, res) => {
  try {
    const query = req.query.query || 'mercati finanziari';
    const news = await fetchNews(query);
    res.json(news);
  } catch (error) {
    console.error('Errore in /news:', error.message);
    res.status(500).json({ error: 'Errore durante il recupero notizie' });
  }
});

module.exports = router;
