// routes/fundamentals.js
const express = require('express');
const router = express.Router();
const { getFundamentals } = require('../services/financeData');

router.get('/', async (req, res) => {
  try {
    const symbol = req.query.symbol;
    if (!symbol) return res.status(400).json({ error: 'Parametro "symbol" mancante' });

    const data = await getFundamentals(symbol);
    res.json(data);
  } catch (error) {
    console.error('Errore in /fundamentals:', error.message);
    res.status(500).json({ error: 'Errore nel recupero dei dati fondamentali' });
  }
});

module.exports = router;
