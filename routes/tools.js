// routes/tools.js
const express = require('express');
const router = express.Router();
const { runTool } = require('../services/toolbox');

router.post('/', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({ error: 'Tipo di tool o dati mancanti' });
    }

    const result = runTool(type, data);
    res.json(result);
  } catch (err) {
    console.error('Errore tool:', err.message);
    res.status(500).json({ error: 'Errore nel calcolatore AI' });
  }
});

module.exports = router;
