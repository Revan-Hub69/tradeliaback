// routes/scanner.js
const express = require('express');
const router = express.Router();
const { runScanner } = require('../services/scannerEngine');

router.get('/', async (req, res) => {
  try {
    const asset = req.query.asset || 'stocks'; // 'crypto', 'forex', 'stocks'
    const result = await runScanner(asset);
    res.json(result);
  } catch (error) {
    console.error('Errore scanner:', error.message);
    res.status(500).json({ error: 'Errore nel sistema di scanner AI' });
  }
});

module.exports = router;
