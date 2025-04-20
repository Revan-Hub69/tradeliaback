// routes/upload.js
const express = require('express');
const router = express.Router();
const { uploadFileToOpenAI } = require('../services/fileUploader');

router.post('/', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }

    const file = req.files.file;
    const result = await uploadFileToOpenAI(file);

    res.json(result); // contiene file_id
  } catch (err) {
    console.error('Errore in /upload:', err.message);
    res.status(500).json({ error: 'Errore durante l’upload' });
  }
});

module.exports = router;
